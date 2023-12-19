export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, public cause?: Error, public payload?: Record<string, any>) {
        super(message, {
            cause
        });
    }
}
