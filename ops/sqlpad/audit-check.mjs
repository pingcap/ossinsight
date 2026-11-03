import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const [component, file] = process.argv.slice(2);
assert(['server', 'client'].includes(component));
const report = JSON.parse(readFileSync(file, 'utf8'));
assert(!report.error, 'Dependency audit failed');
assert(report.metadata?.dependencies?.total > 100, 'Incomplete dependency audit');
assert(report.vulnerabilities && report.metadata.vulnerabilities);
const accepted = [];
for (const [name, finding] of Object.entries(report.vulnerabilities)) {
  const mitigated = component === 'server' && name === 'aws-sdk' &&
    finding.severity === 'low' && finding.via.length === 1 &&
    finding.via[0].url === 'https://github.com/advisories/GHSA-j965-2qgj-vjmq';
  assert(mitigated, `Unmitigated ${component} dependency advisory: ${name}`);
  accepted.push(finding.via[0].url);
}
console.log(JSON.stringify({ component, vulnerabilities: report.metadata.vulnerabilities, inputSanitizationMitigations: accepted }));
