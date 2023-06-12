import {Pool} from "mysql2/promise";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

export default class CachedTableCacheProvider extends NormalTableCacheProvider {

    constructor(pool: Pool, shadowPool?: Pool) {
        super(pool, shadowPool, 'cached_table_cache');
    }

}