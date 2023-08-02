import {createPool} from 'mysql2/promise';

// Connection.

export function completeDatabaseURL(originalURL: string, usedInPool: boolean = true): string {
  const url = new URL(originalURL);

  // Notice: If you provide connection information via `option.uri`, the options provided in uri
  // **cannot** override the default options below
  // Link: https://github.com/sidorares/node-mysql2/blob/67a18010dcffd793b9783657628b9b9ba39cc717/lib/connection_config.js#L74
  if (!url.searchParams.has('decimalNumbers')) {
    url.searchParams.append('decimalNumbers', 'true');
  }

  // Enable supportBigNumbers to avoid precision loss.
  if (!url.searchParams.has('supportBigNumbers')) {
    url.searchParams.append('supportBigNumbers', 'true');
  }

  // Default connection limit to 256.
  if (!url.searchParams.has('connectionLimit') && usedInPool) {
    url.searchParams.append('connectionLimit', '256');
  }

  // Default queue limit to 10000.
  if (!url.searchParams.has('queueLimit') && usedInPool) {
    url.searchParams.append('queueLimit', '10000');
  }

  // Default timezone to UTC.
  if (!url.searchParams.has('timezone')) {
    url.searchParams.append('timezone', 'Z');
  }

  // Default enableKeepAlive to true.
  if (!url.searchParams.has('enableKeepAlive')) {
    url.searchParams.append('enableKeepAlive', 'true');
  }

  return url.toString();
}

export function createTiDBPool(uri: string) {
  return createPool({
    uri: completeDatabaseURL(uri),
  });
}

