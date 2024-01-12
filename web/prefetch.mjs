import fetch from 'node-fetch';
import fs from 'node:fs';

fs.mkdirSync('.prefetch', { recursive: true });

const API_BASE = process.env.APP_API_BASE || 'https://api.ossinsight.io';

async function prefetch (fn, load) {
  const res = await load;
  fs.writeFileSync(fn, JSON.stringify(await res.json(), undefined, 2));
}

await Promise.all([
  prefetch('.prefetch/collections.json', fetch(API_BASE + '/collections')),
  prefetch('.prefetch/events-total.json', fetch(API_BASE + '/q/events-total')),
]);
