import { OkPacket, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type Rows = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
export interface Field<T = any> {
  name: string & keyof T;
  columnType: number;
}
export type Fields<T = any> = Field<T>[];
export type Result = [Rows, Fields];
export type Values = any | any[] | { [param: string]: any };
export type Conn = PoolConnection;

export interface QueryExecutor {
    execute(queryKey: string, sql: string): Promise<Result>
}