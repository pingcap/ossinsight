#!/usr/bin/env python3
"""Run image and TLS checks against disposable, isolated Docker fixtures."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--api-image', default='ossinsight-api-security:test')
parser.add_argument('--etl-image', default='ossinsight-etl-security:test')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
prefix = 'ossinsight-container-test-' + uuid.uuid4().hex[:10]
network = prefix + '-network'
containers = []
volumes = []
REDIS = 'redis:7.2.17-bookworm@sha256:0312984fbfeb2ff1d4382ecef45b50e7d65478a6a58cf12ce28d6de7a4142e45'
TIDB = 'pingcap/tidb:v8.5.4@sha256:e986dadd59937fbfcbdfe7fd084421cc65988da8b795f75194b05a0292635ead'

def run(argv, timeout=120):
    result = subprocess.run(argv, capture_output=True, text=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError('Command failed: ' + ' '.join(argv[:3]) + '\n' + result.stdout[-1000:] + result.stderr[:2200] + '\n...\n' + result.stderr[-1000:])
    return result.stdout


def create(suffix, image, command, options=()):
    name = prefix + '-' + suffix
    run(['docker', 'create', '--name', name, '--network', network, *options, image, *command])
    containers.append(name)
    return name


try:
    run(['docker', 'network', 'create', '--internal', network])
    with tempfile.TemporaryDirectory(prefix=prefix) as temporary:
        fixture = Path(temporary)
        # These one-day test keys are unrelated to any deployed certificate.
        for stem in ['ca', 'wrong-ca']:
            run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
                 '-subj', '/CN=' + stem, '-keyout', str(fixture / (stem + '.key')),
                 '-out', str(fixture / (stem + '.pem'))])
        run(['openssl', 'req', '-new', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=tidb',
             '-keyout', str(fixture / 'server.key'), '-out', str(fixture / 'server.csr')])
        (fixture / 'server.ext').write_text('subjectAltName=DNS:tidb\nextendedKeyUsage=serverAuth\n')
        run(['openssl', 'x509', '-req', '-days', '1', '-in', str(fixture / 'server.csr'),
             '-CA', str(fixture / 'ca.pem'), '-CAkey', str(fixture / 'ca.key'), '-CAcreateserial',
             '-extfile', str(fixture / 'server.ext'), '-out', str(fixture / 'server.pem')])
        (fixture / 'tidb.toml').write_text('[security]\nssl-cert="/fixtures/server.pem"\nssl-key="/fixtures/server.key"\n')
        for name in ['server.key', 'server.pem', 'ca.pem', 'wrong-ca.pem', 'tidb.toml']:
            os.chmod(fixture / name, 0o444)
        tls = create('tidb', TIDB, ['--store=unistore', '--path=/tmp/tidb', '--config=/fixtures/tidb.toml'],
                     ['--network-alias=tidb', '--network-alias=tidb-wrong', '--memory=1536m', '--cpus=2'])
        plain = create('plain', TIDB, ['--store=unistore', '--path=/tmp/tidb'],
                       ['--network-alias=tidb-plain', '--memory=1536m', '--cpus=2'])
        # Only server material goes to TiDB. CA signing keys stay on the host.
        server_dir = fixture / 'server'
        server_dir.mkdir()
        for name in ['server.key', 'server.pem', 'tidb.toml']:
            (server_dir / name).write_bytes((fixture / name).read_bytes())
            os.chmod(server_dir / name, 0o444)
        run(['docker', 'cp', str(server_dir), tls + ':/fixtures'])
        run(['docker', 'start', tls, plain])
        client_dir = fixture / 'client'
        client_dir.mkdir()
        for name in ['ca.pem', 'wrong-ca.pem']:
            (client_dir / name).write_bytes((fixture / name).read_bytes())
        for name in ['etl-tls-probe.rb', 'bootstrap.rb', 'etl-ingestion-probe.rb', 'api-probe.cjs']:
            (client_dir / name).write_bytes((root / 'ops/container-security' / name).read_bytes())
        migrations = client_dir / 'migrations'
        migrations.mkdir()
        for sql in (root / 'packages/api-server/__tests__/migrations').glob('*.sql'):
            (migrations / sql.name).write_bytes(sql.read_bytes())
        volume = prefix + '-fixtures'
        run(['docker', 'volume', 'create', volume])
        volumes.append(volume)
        helper = create('fixture-copy', args.api_image, ['true'], ['--mount', 'type=volume,source=' + volume + ',target=/fixtures'])
        run(['docker', 'cp', str(client_dir) + '/.', helper + ':/fixtures'])
        etl = create('etl-tls', args.etl_image, ['bundle', 'exec', 'ruby', '/fixtures/etl-tls-probe.rb'],
                     ['--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--pids-limit=128',
                      '--memory=768m', '--cpus=1', '--tmpfs=/tmp:rw,noexec,nosuid,size=128m',
                      '-e', 'CONTAINER_SECURITY_TEST=isolated', '--mount', 'type=volume,source=' + volume + ',target=/fixtures,readonly'])
        output = run(['docker', 'start', '-a', etl], timeout=100)
        state = json.loads(run(['docker', 'inspect', '--format', '{{json .State}}', etl]))
        if state['ExitCode']:
            raise RuntimeError('ETL TLS checks failed:\n' + output[-4000:] + run(['docker', 'logs', etl])[-4000:])
        print(output.strip(), flush=True)
        for suffix, command, environment in [
            ('bootstrap', ['bundle', 'exec', 'ruby', '/fixtures/bootstrap.rb'], []),
            ('etl-ingestion', ['bundle', 'exec', 'rails', 'runner', '/fixtures/etl-ingestion-probe.rb'],
             ['-e', 'DATABASE_URL=mysql2://etluser:etltestpassword@tidb:4000/ossinsight_container_test',
              '-e', 'DB_SSL_CA=/fixtures/ca.pem', '-e', 'SECRET_KEY_BASE=' + 'synthetic-test-' * 8]),
        ]:
            container = create(suffix, args.etl_image, command,
                ['--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--pids-limit=128',
                 '--memory=768m', '--cpus=1', '--tmpfs=/tmp:rw,noexec,nosuid,size=128m',
                 '-e', 'CONTAINER_SECURITY_TEST=isolated', '--mount',
                 'type=volume,source=' + volume + ',target=/fixtures,readonly', *environment])
            output = run(['docker', 'start', '-a', container], timeout=100)
            state = json.loads(run(['docker', 'inspect', '--format', '{{json .State}}', container]))
            if state['ExitCode']:
                raise RuntimeError(suffix + ' failed:\n' + output[-4000:] + run(['docker', 'logs', container])[-4000:])
            print(output.strip(), flush=True)
        redis = create('redis', REDIS, ['redis-server', '--save', '', '--appendonly', 'no', '--dir', '/tmp', '--maxmemory', '128mb', '--protected-mode', 'no'],
            ['--network-alias=redis', '--user=999:999', '--read-only', '--cap-drop=ALL',
             '--security-opt=no-new-privileges', '--memory=256m', '--cpus=1', '--tmpfs=/tmp:rw,noexec,nosuid,size=32m'])
        run(['docker', 'start', redis])
        api = create('api', args.api_image, [],
            ['--read-only', '--cap-drop=ALL', '--security-opt=no-new-privileges', '--pids-limit=128',
             '--memory=768m', '--cpus=1', '--tmpfs=/tmp:rw,noexec,nosuid,size=128m',
             '--mount', 'type=volume,source=' + volume + ',target=/fixtures,readonly',
             '-e', 'NODE_EXTRA_CA_CERTS=/fixtures/ca.pem', '-e', 'API_SERVER_PORT=3451',
             '-e', 'DATABASE_URL=mysql://executoruser:executorpassword@tidb:4000/ossinsight_container_test',
             '-e', 'PLAYGROUND_DATABASE_URL=mysql://container_reader:webshellpassword@tidb:4000/ossinsight_container_test',
             '-e', 'REDIS_URL=redis://redis:6379/0', '-e', 'GITHUB_ACCESS_TOKENS=',
             '-e', 'OPENAI_API_KEY=synthetic-test-key', '-e', 'AUTH0_SECRET=synthetic-local-hmac-secret',
             '-e', 'OPERATIONS_TOKEN=synthetic-local-operations-token-32-characters'])
        run(['docker', 'start', api])
        print(run(['docker', 'exec', api, 'node', '/fixtures/api-probe.cjs'], timeout=60).strip(), flush=True)
        healthcheck = json.loads(run(['docker', 'inspect', '--format', '{{json .Config.Healthcheck.Test}}', api]))
        assert healthcheck[0] == 'CMD-SHELL'
        run(['docker', 'exec', api, 'sh', '-c', healthcheck[1]], timeout=10)
        run(['docker', 'stop', '--timeout', '10', api], timeout=15)
        state = json.loads(run(['docker', 'inspect', '--format', '{{json .State}}', api]))
        assert state['ExitCode'] == 0, 'API did not exit gracefully on SIGTERM'
        print(json.dumps({'apiHealthcheck': True, 'apiGracefulShutdown': True}), flush=True)

except Exception:
    for name in containers:
        if name.endswith(('-api', '-redis', '-etl-ingestion')):
            logs = subprocess.run(['docker', 'logs', '--tail', '20', name], capture_output=True, text=True, timeout=5)
            print(name + '\n' + logs.stdout[-6000:] + logs.stderr[-3000:], file=sys.stderr)
    raise
finally:
    for name in reversed(containers):
        subprocess.run(['docker', 'rm', '-f', name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for volume in volumes:
        subprocess.run(['docker', 'volume', 'rm', volume], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(['docker', 'network', 'rm', network], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
