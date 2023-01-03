import * as path from 'path'

import { existsSync, readFileSync } from 'fs';

import cors from '@fastify/cors';
import fp from "fastify-plugin";
import { parse as parseYAML } from 'yaml';
import {GENERATE_SQL_LIMIT_HEADER, GENERATE_SQL_USED_HEADER} from "../routes/bot/questionToSQL/quota";

export type OriginType = string | RegExp;

export const DEFAULT_ALLOWED_ORIGIN = 'https://ossinsight.io';

declare module 'fastify' {
    interface FastifyInstance {
        allowedOrigins: OriginType[]
    }
}

export default fp(async (app) => {
    let configsPath = app.config.CONFIGS_PATH;
    if (!configsPath) {
        configsPath = path.join(__dirname, '..', '..', '..', '..', 'configs');
    }
    app.log.info({}, 'Found configs path: %s', configsPath);
    const allowedOrigins:OriginType[] = getAllowedOrigins(configsPath, true);
    allowedOrigins.push(DEFAULT_ALLOWED_ORIGIN);

    app.register(cors, {
        origin: allowedOrigins,
        exposedHeaders: [GENERATE_SQL_USED_HEADER, GENERATE_SQL_LIMIT_HEADER],
        credentials: true,
    });
    app.decorate('allowedOrigins', allowedOrigins);
}, {
    name: 'cors',
    dependencies: [
        '@fastify/env'
    ],
});

export function getAllowedOrigins(configsPath: string, containPublic: boolean = false): RegExp[] {
    const configFile = path.resolve(configsPath, 'allowed-origins.yaml');
    if (!existsSync(configFile)) {
        console.log(`Can not found allowed origins file: ${configFile}, API server will allowed all origins.`);
        return [];
    }

    try {
        const originFile = readFileSync(configFile, 'utf8');
        const { private_origins: privateOrigins = [], public_origins: publicOrigins = [] } = parseYAML(originFile);
        let origins = privateOrigins;
        if (containPublic && publicOrigins.length > 0 ) {
            origins = origins.concat(publicOrigins);
        }

        return origins.map((origin: string) => {
            return new RegExp(origin);
        });
    } catch(err: any) {
        throw new Error('Failed to load allowed origins.', {
            cause: err
        });
    }
}
