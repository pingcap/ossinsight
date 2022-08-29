import consola from 'consola';
import * as dotenv from "dotenv";
import path from 'path';
import { table } from "table";
import * as fsp from 'fs/promises'
import { QUERY_DEF_DIR, TEMPLATE_FILENAME } from "../../app/core/QueryFactory";
import { Connection, createConnection } from 'mysql2';
import { getConnectionOptions } from '../../app/utils/db';

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('explain-all');
const EXPLAIN_RESULT_FILENAME = "explain.result.txt";
const TABLE_CONFIG = {
    drawHorizontalLine: (lineIndex: number, rowCount: number) => {
        return lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount;
    },
    border: {
        topBody: `-`,
        topJoin: `+`,
        topLeft: `+`,
        topRight: `+`,
    
        bottomBody: `-`,
        bottomJoin: `+`,
        bottomLeft: `+`,
        bottomRight: `+`,
    
        bodyLeft: `|`,
        bodyRight: `|`,
        bodyJoin: `|`,
    
        joinBody: `-`,
        joinLeft: `+`,
        joinRight: `+`,
        joinJoin: `+`
      }
}
const INDEX_REGEXP = /(?=index:)([^(]+)/g;
const TABLE_NAMES = ['github_events'];

async function main() {
    // Init TiDB client.
    const conn = createConnection(getConnectionOptions());

    const stats: Record<string, number> = {};
    for (const tableName of TABLE_NAMES) {
        const indexes = await getIndexesForTable(conn, tableName);
        for (const index of indexes) {
            stats[index] = 0;
        }
    }

    // Explain all the queries.
    const paths = await fsp.readdir(QUERY_DEF_DIR)
    for (let p of paths) {
        const templateFile = path.join(QUERY_DEF_DIR, p, TEMPLATE_FILENAME);
        const resultFile = path.join(QUERY_DEF_DIR, p, EXPLAIN_RESULT_FILENAME);
        const template = await fsp.readFile(templateFile, { encoding: "utf-8" });
        
        const { fields, rows } = await explainSQL(conn, template);
        const data = [];
        data.push(fields.map((field) => {
            return field.name
        }));
        rows.forEach((row) => {
            data.push(row);

            // Record index usage.
            let m;
            if ((m = INDEX_REGEXP.exec(row[3])) !== null) {
                const key = m[1].replace(/^index:/, '');
                console.log(key);
                
                if (key !== undefined) {
                    stats[key] = (stats[key] || 0) + 1
                }
            }
        });

        await fsp.writeFile(resultFile, table(data, TABLE_CONFIG));
        logger.info(`EXPLAIN result output to ${resultFile}.`);
    }

    const res = Object.entries(stats).sort((a, b) => {
        return b[1] - a[1];
    });
    console.table(res);
    process.exit();
}

async function getIndexesForTable(conn: Connection, tableName:string):Promise<string[]> {
    return new Promise((resolve, reject) => {
        return conn.query({
            sql: `SHOW INDEXES FROM ${tableName};`,
        }, async (err, rows: any[], fields: any[]) => {
            if (err) {
                reject(err);
            } else {
                if (Array.isArray(rows)) {
                    const indexNames = new Set<string>();
                    rows.forEach((row) => {
                        indexNames.add(row['Key_name']);
                    });
                    resolve(Array.from(indexNames));
                } else {
                    resolve([]);
                }
            }
        });
    });
}

async function explainSQL(conn:Connection, sql: string):Promise<{
    rows: any[],
    fields: any[]
}> {
    return new Promise((resolve, reject) => {
        return conn.query({
            sql: `EXPLAIN ${sql}`,
            rowsAsArray: true
        }, async (err, rows: any[], fields: any[]) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    fields,
                    rows
                });
            }
        });
    });
}

main();