export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, error?: Error) {
        super();
        if (error) {
            this.cause = error;
        }
    }
}

export class ValidateSQLError extends Error {
    constructor(readonly statusCode: number, readonly message: string, readonly sql: string, error?: Error) {
        super();
        if (error) {
            this.cause = error;
        }
    }
}