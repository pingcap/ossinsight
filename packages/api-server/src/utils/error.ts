import {Question} from "../plugins/services/explorer-service/types";

export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, error?: Error) {
        super();
        if (error) {
            this.cause = error;
        }
    }
}

export class ExplorerQuestionError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, readonly question: Question, error?: Error) {
        super(statusCode, message, error);
        if (error) {
            this.cause = error;
        }
    }
}
