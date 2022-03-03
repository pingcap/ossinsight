import * as path from 'path'
import * as fs from 'fs/promises'
import type {QuerySchema} from './params.schema'

// TODO: codebase for prefetch service
// TODO: consider restrictions, see queries/contributors-history/params.json

async function getQueries(): Promise<Record<string, QuerySchema>> {
  const base = path.join(process.cwd(), 'queries')
  const paths = await fs.readdir(base)
  const res: Record<string, QuerySchema> = {}
  for (let p of paths) {
    res[p] = JSON.parse(await fs.readFile(path.join(base, p, "params.json"), {encoding: "utf-8"}))
  }
  return res
}

async function getPresets(): Promise<Record<string, string[]>> {
  return JSON.parse(await fs.readFile(path.join(process.cwd(), 'params-preset.json'), { encoding: "utf-8" }))
}

async function main () {
  const queries = await getQueries()
  const presets = await getPresets()

  Object.entries(queries).forEach(([key, schema]) => {
    if(schema.params.find(param => !param.enums)) {
      console.log(key, 0)
    } else {
      const sizes = schema.params.map(({ enums }) => {
        if (typeof enums === 'string') {
          return presets[enums].length
        } else if (enums) {
          return enums.length
        } else {
          throw new Error('never')
        }
      })
      const total = sizes.reduce((a, b) => a * b, 1)
      console.log(key, total)
    }
  })
}

main().then()
