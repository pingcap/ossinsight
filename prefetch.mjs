import fetch from 'node-fetch'
import fs from 'node:fs'

const res = await fetch('https://api.ossinsight.io/collections')


fs.mkdirSync('.prefetch', {recursive: true})
fs.writeFileSync('.prefetch/collections.json', JSON.stringify(await res.json(), undefined, 2))
