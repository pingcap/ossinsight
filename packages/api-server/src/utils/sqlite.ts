import { AsyncDatabase } from "promised-sqlite3";
import {QuestionSQLResult} from "../plugins/services/explorer-service/types";

const typeMaps: Record<number, string> = {
  0: "DECIMAL",
  1: "TINY",
  2: "SHORT",
  3: "LONG",
  4: "FLOAT",
  5: "DOUBLE",
  6: "NULL",
  7: "TIMESTAMP",
  8: "LONGLONG",
  9: "INT24",
  10: "DATE",
  11: "TIME",
  12: "DATETIME",
  13: "YEAR",
  14: "NEWDATE",
  15: "VARCHAR",
  16: "BIT",
  245: "JSON",
  246: "NEWDECIMAL",
  247: "ENUM",
  248: "SET",
  249: "TINY_BLOB",
  250: "MEDIUM_BLOB",
  251: "LONG_BLOB",
  252: "BLOB",
  253: "VAR_STRING",
  254: "STRING",
  255: "GEOMETRY"
};

export async function saveQueryResultToSqlite(queryResult: QuestionSQLResult, dbFile: string) {
  const { fields = [], rows = [] } = queryResult;
  const db = await AsyncDatabase.open(dbFile);
  await db.run('DROP TABLE IF EXISTS result;');
  await db.run(`
    CREATE TABLE IF NOT EXISTS result (
      ${fields.map(field => `${field.name} ${mapMySQLTypeID2SqliteType(field.columnType)}`).join(',')}
    );
  `);

  const columns = fields.map(field => field.name);
  const stmt = await db.prepare(`
    INSERT INTO result (${columns.join(', ')}) VALUES (
        ${columns.map(_ => '?').join(', ')}
    );
  `);
  for (const row of rows) {
    const values = columns.map(column => row[column]);
    await stmt.run(...values);
  }
  await stmt.finalize();
  await db.close();
}

function mapMySQLTypeID2SqliteType(columnType: number): string {
  const type = typeMaps[columnType] as any;
  if (type === undefined) {
    return 'VARCHAR(255)';
  } else {
    return type;
  }
}