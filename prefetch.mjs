import fetch from 'node-fetch'
import fs from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

fs.mkdirSync('.prefetch', {recursive: true})

async function prefetch (fn, load) {
  const res = await load
  fs.writeFileSync(fn, JSON.stringify(await res.json(), undefined, 2))

}

await Promise.all([
  prefetch('.prefetch/collections.json', fetch(process.env.API_BASE + '/collections')),
  prefetch('.prefetch/events-total.json', fetch(process.env.API_BASE + '/q/events-total')),
])

