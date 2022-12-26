
import { QuerySchema } from "../../../types/query.schema";
import { join } from "path";
import pino from "pino";
import { readFile } from "fs/promises";
import {measure, readConfigTimer} from "../../../plugins/metrics";

export const QUERY_TEMPLATE_SQL_FILENAME = 'template.sql';
export const QUERY_CONFIG_FILENAME = 'params.json';

export class QueryLoader {
    private basePath: string;

    constructor(private readonly log: pino.Logger, queryConfigsPath?: string) {
        if (!queryConfigsPath) {
            queryConfigsPath = join(__dirname, '..', '..', '..', '..', '..', '..', 'configs', 'queries');
        }
        this.log.info('Loading queries from %s.', queryConfigsPath);
        this.basePath = queryConfigsPath;
    }

    async load(queryName: string):Promise<[QuerySchema | undefined, string | undefined] | []> {
        const queryDir = join(this.basePath, queryName);
        const templateFilePath = join(queryDir, QUERY_TEMPLATE_SQL_FILENAME);
        const queryConfigFilePath = join(queryDir, QUERY_CONFIG_FILENAME);
        
        let queryConfig, templateSQL;
        await measure(readConfigTimer.labels({ type: QUERY_CONFIG_FILENAME }), async () => {
            queryConfig = JSON.parse(await readFile(queryConfigFilePath, {encoding: 'utf-8'})) as QuerySchema;
        });
        await measure(readConfigTimer.labels({ type: QUERY_TEMPLATE_SQL_FILENAME }), async () => {
            templateSQL = await readFile(templateFilePath, {encoding: "utf-8"});
        });
        return [queryConfig, templateSQL];
    }

}