declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST: string
    DB_PORT: string
    DB_USER: string
    DB_DATABASE: string
    DB_PASSWORD: string
    CONNECTION_LIMIT: string
    QUEUE_LIMIT: string
    SERVER_PORT: string
    GH_TOKENS: string
    REDIS_URL: string
    PREFETCH_CONCURRENT: string
    RATE_LIMIT_INTERVAL: string
    RATE_LIMIT_MAX_REQUEST: string
    AUTH0_SIGNUP_REDIRECT: string
    AUTH0_CALLBACK_REDIRECT: string
  }
}