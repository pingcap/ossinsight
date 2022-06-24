import consola from 'consola';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { QuerySchema } from '../../params.schema';
import { measure, readConfigTimer } from '../metrics';

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

const TEMPLATE_FILENAME = 'template.sql';
const DEFINITION_FILENAME = 'params.json';

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