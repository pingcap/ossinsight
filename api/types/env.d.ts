declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string
    CONNECTION_LIMIT: string
    QUEUE_LIMIT: string
    SERVER_PORT: string
    GH_TOKENS: string
    PREFETCH_CONCURRENT: string
  }
}