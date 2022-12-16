export const enum EvalTypes {
    ETInt,
    ETReal,
    ETDecimal,
    ETString,
    ETDatetime,
    ETTimestamp,
    ETDuration,
    ETJson,
}

export const EvalTypeNames = [
    'ETInt',
    'ETReal',
    'ETDecimal',
    'ETString',
    'ETDatetime',
    'ETTimestamp',
    'ETDuration',
    'ETJson',
]

export interface Tp {
    Type: EvalTypes,
    Nullable: boolean
}

export interface Column extends Tp {
    Name: string
    As: string
}

export interface TableDefine {
    Name(): string

    Columns(): Column[]
}

export interface Parser {
    DefineFunc(name: string, type: Tp): void

    DefineTransparentFunc(name: string): void

    AddDdl(sql: string): void

    Parse(sql: string): Column[]

    GetTable(name: string): TableDefine

    Warns(): string[]

    ParseAst (sql: string): any

    NormalizeDigest (sql: string): NormalizeDigestResult
}

export type NormalizeDigestResult = {
    NormalizedSql: string
    Digest: string
}

export interface Program {
    newParser(): Parser
    stop (): void
}

declare global {
    interface Window {
        EvalTypes: Record<string, number>
    }
}
