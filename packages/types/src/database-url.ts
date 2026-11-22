/** Secure mysql2 URI defaults. No Node imports: this module is also exported to web consumers. */
export function secureDatabaseURL(value: string, production = false): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('A valid database URL is required.'); }
  if (url.protocol !== 'mysql:' || !url.hostname || !url.pathname.slice(1)) throw new Error('A MySQL database URL with an explicit database is required.');
  for (const key of ['host', 'port', 'user', 'password', 'database', 'socketPath', 'uri', 'authPlugins', 'stream']) {
    if (url.searchParams.has(key)) throw new Error('Database identity must be specified in the URL authority, not query options.');
  }
  let user: string;
  try { user = decodeURIComponent(url.username); } catch { throw new Error('Invalid database account.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname.toLowerCase());
  if (production && (!user || /(?:^|\.)root$/i.test(user))) throw new Error('Production requires a dedicated non-root database account.');
  if (!local && (!user || !url.password)) throw new Error('Remote database access requires an explicit account and password.');
  let ssl: any;
  if (url.searchParams.has('ssl')) {
    try { ssl = JSON.parse(url.searchParams.get('ssl')!); }
    catch { throw new Error('Database TLS options must be a JSON object.'); }
    if (ssl === true) ssl = {};
    if (ssl === false && local && !production) return url.toString();
    if (!ssl || typeof ssl !== 'object' || Array.isArray(ssl) || ssl.rejectUnauthorized === false || ssl.verifyIdentity === false) {
      throw new Error('Database TLS must verify the certificate and server identity.');
    }
  }
  if (ssl || !local || production) {
    url.searchParams.set('ssl', JSON.stringify({...ssl, rejectUnauthorized: true, verifyIdentity: true}));
  }
  return url.toString();
}
