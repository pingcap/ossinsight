import consola from 'consola';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path'
import YAML from 'yaml'

export const DEFAULT_ALLOWED_ORIGIN = 'https://ossinsight.io';
const logger = consola.withTag("origins-loader");

export function getAllowedOrigins(containPublic: boolean = false): RegExp[] {
    const configFile = path.resolve(__dirname, '../allowed-origins.yaml');
    if (!existsSync(configFile)) {
        logger.warn(`Can not found allowed origins file: ${configFile}, API server will allowed all origins.`);
        return [];
    }

    try {
        const originFile = readFileSync(configFile, 'utf8');
        const { private_origins: privateOrigins = [], public_origins: publicOrigins = [] } = YAML.parse(originFile);
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

export function getCorsOrigin(allowedOrigins: RegExp[], requestOrigin?: string) {
    if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
        return '*';
    }

    if (requestOrigin === undefined || requestOrigin.length === 0) {
        return DEFAULT_ALLOWED_ORIGIN;
    }

    const origin = requestOrigin[requestOrigin.length - 1] !== '/' ? requestOrigin + '/' : requestOrigin;
    if (allowedOrigins.some((regexp) => {
        return regexp.test(origin);
    })) {
        return requestOrigin;
    } else {
        return DEFAULT_ALLOWED_ORIGIN;
    }
}