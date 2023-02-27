import {Connection} from "mysql2/promise";
import NormalTableCacheProvider from "./NormalTableCacheProvider";

export default class CachedTableCacheProvider extends NormalTableCacheProvider {

    constructor(conn: Connection, shadowConn?: Connection) {
        super(conn, shadowConn, 'cached_table_cache');
    }

}