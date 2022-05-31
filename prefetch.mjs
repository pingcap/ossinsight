import fetch from 'node-fetch'
import fs from 'node:fs'

fs.mkdirSync('.prefetch', {recursive: true})

async function prefetch (fn, load) {
  const res = await load
  fs.writeFileSync(fn, JSON.stringify(await res.json(), undefined, 2))

}

await Promise.all([
  prefetch('.prefetch/collections.json', fetch('https://api.ossinsight.io/collections')),
  prefetch('.prefetch/events-total.json', fetch('https://api.ossinsight.io/q/events-total')),
])

