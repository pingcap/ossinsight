import { QuerySchema } from "../../../types/query.schema";
import { join } from "path";
import pino from "pino";
import { readFile } from "fs/promises";
import {measure, readConfigTimer} from "../../../plugins/metrics";
import fsp from "fs/promises";
import path from "path";
import fs from "fs";

export const QUERY_TEMPLATE_SQL_FILENAME = 'template.sql';
export const QUERY_CONFIG_FILENAME = 'params.json';
export const QUERY_PRESET_FILENAME = 'params-preset.json';

export class QueryLoader {

    private readonly basePath: string;

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

    private async loadDir (root: string, current: string[]) {
        const res: Record<string, QuerySchema> = {}
        const dirs = await fsp.readdir(path.join(root, ...current), { withFileTypes: true })
        for (const dir of dirs) {
            if (!dir.isDirectory()) {
                continue;
            }
            const queryPath = path.join(...current, dir.name);
            const pfn = path.join(root, queryPath, QUERY_CONFIG_FILENAME);
            if (fs.existsSync(pfn)) {
                const queryText = await fsp.readFile(pfn, 'utf-8');
                res[queryPath] = JSON.parse(queryText);
            }
            await this.loadDir(root, [...current, dir.name]);
        }
        return res;
    }

    async loadQueries(): Promise<Record<string, QuerySchema>> {
        return await this.loadDir(this.basePath, []);
    }

    async loadPresets(): Promise<Record<string, any[]>> {
        const presetFilePath = join(this.basePath, '..', QUERY_PRESET_FILENAME);
        return JSON.parse(await fsp.readFile(presetFilePath, 'utf-8'));
    }

}
