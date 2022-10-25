declare module '@ossinsight/api' {

  export interface SearchRepoInfo {
    id: number
    fullName: string
  }

  export interface RepoInfo {
    id: number
    full_name: string
    forks: number
    open_issues: number
    subscribers_count: number
    watchers: number
    language: string
    owner: {
      avatar_url: string
      html_url: string
      login: string
    }
    description: string
  }

  export interface UserInfo {
    id: number
    login: string
  }

  export type Collection = {
    id: number
    name: string
    slug: string
    public: 0 | 1
  }

  export type UserType = 'user' | 'org'

  export type TidbTableInfo = {
    tableSchema: string
    tableName: string
    tableRows: number
    avgRowLength: number
    dataLength: number
    indexLength: number
    createTime: string
    tableCollation: string
    createOptions: string
    rowIdShardingInfo: string
    pkType: string
  }

  export type TidbTableDDL = {
    'Create Table': string
    'Table': string
  }

  export type TidbIndexInfo = {
    clustered: "YES" | "NO"
    columns: string
    indexName: string
    isVisible: "YES" | "NO"
    nonUnique: 0 | 1
    tableName: string
  }

  export type TidbIndexStats = {
    calls: number
    indexName: string
    queries: number
    tableName: string
  }

  export type InternalQueryRecord = {
    digest_text: string
    executed_at: string
    id: number
    query_name: string
    ts: number
  }
}