import {Question, QuestionFeedbackType} from "../plugins/services/explorer-service/types";

export class APIError extends Error {
    constructor(readonly statusCode: number, readonly message: string, public cause?: Error, public payload?: Record<string, any>) {
        super(message, {
            cause
        });
    }
}

export class BotResponseGenerateError extends Error {
    constructor(readonly message: string, readonly responseText: string | null, readonly cause?: Error) {
        super(message, {
            cause
        });
    }
}

export class BotResponseParseError extends Error {
    constructor(readonly message: string, readonly responseText: string | null, readonly cause?: Error) {
        super(message, {
            cause
        });
    }
}

export class ValidateSQLError extends Error {
    constructor(message: string, readonly sql?: string, cause?: Error) {
        super(message, {
            cause
        });
    }
}

export class SQLUnsupportedFunctionError extends ValidateSQLError {
    constructor(message: string, sql?: string, cause?: Error) {
        super(message, sql, cause);
    }
}

export class SQLUnsupportedMultipleStatementsError extends ValidateSQLError {
    constructor(message: string, readonly sql?: string, cause?: Error) {
        super(message, sql, cause);
    }
}

export class SQLUnsupportedStatementTypeError extends ValidateSQLError {
    constructor(message: string, readonly sql?: string, cause?: Error) {
        super(message, sql, cause);
    }
}

export class ExplorerCreateQuestionError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, readonly question: Question, cause?: Error) {
        super(statusCode, message, cause);
    }
}

export class ExplorerTooManyRequestError extends APIError {
    constructor(readonly message: string, waitMinutes: number) {
        super(429, message, undefined, {
            waitMinutes: waitMinutes
        });
    }
}

export class ExplorerPrepareQuestionError extends Error {
    constructor(
      readonly message: string,
      readonly feedbackType: QuestionFeedbackType,
      readonly feedbackPayload: Record<string, any>,
      cause?: Error
    ) {
        super(message, {
            cause
        });
    }
}

export class ExplorerResolveQuestionError extends Error {
    constructor(
      readonly message: string,
      readonly feedbackType: QuestionFeedbackType,
      readonly feedbackPayload: Record<string, any>,
      cause?: Error
    ) {
        super(message, {
            cause
        });
    }
}

export class ExplorerSetQuestionTagsError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, cause?: Error) {
        super(statusCode, message, cause);
    }
}

export class ExplorerRecommendQuestionError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, cause?: Error) {
        super(statusCode, message, cause);
    }
}

export class ExplorerCancelRecommendQuestionError extends APIError {
    constructor(readonly statusCode: number, readonly message: string, cause?: Error) {
        super(statusCode, message, cause);
    }
}
