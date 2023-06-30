import {Pool} from "mysql2/promise";
import pino from "pino";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

export default class CachedTableCacheProvider extends NormalTableCacheProvider {

    constructor(logger: pino.Logger, pool: Pool, shadowPool?: Pool) {
        super(logger, pool, shadowPool, 'cached_table_cache');
    }

}