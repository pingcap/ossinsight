import consola from 'consola';
import { readFile } from 'fs/promises';
import * as path from 'path'
import * as fsp from 'fs/promises'
import * as fs from 'fs'
import { QuerySchema } from '../../params.schema';
import { measure, readConfigTimer } from '../metrics';
import { dir } from "async";

export class QueryTemplateNotFoundError extends Error {
  readonly msg: string
  constructor(message: string) {
    super(message);
    this.msg = message
  }
}

// function walkSync(currentDirPath: string, callback: (filepath: string, dirent: string) => {}) {
//   fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function(dirent) {
//     var filePath = path.join(currentDirPath, dirent.name);
//     if (dirent.isFile()) {
//       callback(filePath, dirent);
//     } else if (dirent.isDirectory()) {
//       walkSync(filePath, callback);
//     }
//   });
// }

export const QUERY_DEF_DIR = path.join(process.cwd(), 'queries');
export const TEMPLATE_FILENAME = 'template.sql';
export const DEFINITION_FILENAME = 'params.json';

export async function loadQueries(): Promise<Record<string, QuerySchema>> {
  const res: Record<string, QuerySchema> = {}
  async function loadDir (root: string, current: string[]) {
    const dirs = await fsp.readdir(path.join(root, ...current), { withFileTypes: true })
    for (const dir of dirs) {
      if (!dir.isDirectory()) {
        continue;
      }
      const queryPath = path.join(...current, dir.name)
      const pfn = path.join(root, queryPath, DEFINITION_FILENAME)
      if (fs.existsSync(pfn)) {
        res[queryPath] = JSON.parse(await fsp.readFile(pfn, {encoding: "utf-8"}))
      }
      await loadDir(root, [...current, dir.name])
    }
  }
  await loadDir(QUERY_DEF_DIR, [])

  return res
}

export async function loadPresets(): Promise<Record<string, any[]>> {
  return JSON.parse(await fsp.readFile(path.join(process.cwd(), 'params-preset.json'), { encoding: "utf-8" }))
}

export default class QueryFactory {

    private logger = consola.withTag('query-factory');

    private baseDir = path.join(process.cwd(), 'queries');

    private templateCache: Map<string, string> = new Map();

    private definitionCache: Map<string, QuerySchema> = new Map();

    constructor() {

    }

    loadAll() {

    }

    async loadQuery(queryPath: string) {
      const templateFilePath = path.join(this.baseDir, queryPath, TEMPLATE_FILENAME);
      const paramsFilePath = path.join(this.baseDir, queryPath, DEFINITION_FILENAME);

      const template = await measure(readConfigTimer.labels({ type: TEMPLATE_FILENAME }), async () => {
        return await readFile(templateFilePath, { encoding: 'utf-8' });
      });
      const queryDef = await measure(readConfigTimer.labels({ type: DEFINITION_FILENAME }), async () => {
         return JSON.parse(await readFile(paramsFilePath, { encoding: 'utf-8' })) as QuerySchema
      });

      const queryName = queryDef.name || queryPath;
      this.templateCache.set(queryName, template);
      this.definitionCache.set(queryName, queryDef);
    }

    // build(queryName: string):Query {
    //   return null;
    // }
}