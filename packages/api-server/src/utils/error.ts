import {Question, QuestionFeedbackType} from "../plugins/services/explorer-service/types";

export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, error?: Error) {
        super();
        if (error) {
            this.cause = error;
        }
    }
}

export class BotResponseGenerateError extends Error {
    constructor(message: string, error?: Error) {
        super(message, error);
    }
}

export class BotResponseParseError extends Error {
    constructor(message: string, readonly responseText?: string, error?: Error) {
        super(message, error);
    }
}

export class ValidateSQLError extends Error {
    constructor(message: string, readonly sql?: string, error?: Error) {
        super(message, error);
    }
}

export class SQLUnsupportedFunctionError extends ValidateSQLError {
    constructor(message: string, sql?: string, error?: Error) {
        super(message, sql, error);
    }
}

export class SQLUnsupportedMultipleStatementsError extends ValidateSQLError {
    constructor(message: string, readonly sql?: string, error?: Error) {
        super(message, sql, error);
    }
}

export class SQLUnsupportedStatementTypeError extends ValidateSQLError {
    constructor(message: string, readonly sql?: string, error?: Error) {
        super(message, sql, error);
    }
}

export class ExplorerCreateQuestionError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, readonly question: Question, error?: Error) {
        super(statusCode, message, error);
        if (error) {
            this.cause = error;
        }
    }
}

export class ExplorerPrepareQuestionError extends Error {
    constructor(
      readonly message: string,
      readonly feedbackType: QuestionFeedbackType,
      readonly feedbackPayload: Record<string, any>,
      cause?: Error
    ) {
        super(message, cause);
    }
}
