export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, error?: Error) {
        super();
        if (error) {
            this.cause = error;
        }
    }
}