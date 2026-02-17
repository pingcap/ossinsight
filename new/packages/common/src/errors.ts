/**
 * Base API error class.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly cause?: Error,
    public readonly payload?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', payload?: Record<string, unknown>) {
    super(400, message, undefined, payload);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class TooManyRequestsError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(429, message);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalError extends ApiError {
  constructor(message: string = 'Internal server error', cause?: Error) {
    super(500, message, cause);
    this.name = 'InternalError';
  }
}
