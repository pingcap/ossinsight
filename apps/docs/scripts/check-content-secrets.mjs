import {readdir, readFile} from 'node:fs/promises';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export async function findContentSecrets(root) {
  const findings = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) { await visit(file); continue; }
      if (!entry.isFile() || !/\.(?:mdx?|json|ya?ml|txt)$/.test(entry.name)) continue;
      const content = await readFile(file, 'utf8');
      const pattern = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{20,}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g;
      for (const match of content.matchAll(pattern)) {
        findings.push({file: relative(root, file), line: content.slice(0, match.index).split('\n').length});
      }
      // Basic credentials can be published as a standalone Base64 code block,
      // without an Authorization header. Decode candidates only in memory and
      // report their location, never the encoded or decoded credential.
      const encodedPattern = /(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{32,512}={0,2}(?![A-Za-z0-9+/=])/g;
      for (const match of content.matchAll(encodedPattern)) {
        const decoded = Buffer.from(match[0], 'base64');
        if (decoded.toString('base64').replace(/=+$/, '') !== match[0].replace(/=+$/, '')) continue;
        if (!/^[A-Za-z0-9_.@-]{6,128}:[\x21-\x7e]{16,128}$/.test(decoded.toString('utf8'))) continue;
        findings.push({file: relative(root, file), line: content.slice(0, match.index).split('\n').length});
      }
    }
  }
  await visit(root);
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../content');
  const findings = await findContentSecrets(root);
  for (const finding of findings) console.error(`Credential-like content rejected: ${finding.file}:${finding.line}`);
  if (findings.length) process.exitCode = 1;
  else console.log('Public documentation content credential check passed.');
}
