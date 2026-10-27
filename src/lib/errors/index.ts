export type Role = "admin" | "faculty" | "student";

export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** 401 - unauthenticated */
export class AuthError extends AppError {
  constructor(message = "Unauthenticated. Please sign in.") {
    super(message, 401);
    this.name = "AuthError";
  }
}

/** 403 - authenticated but not authorised */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

/** 404 - resource not found */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/** 409 - state conflict */
export class ConflictError extends AppError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 409);
    this.name = "ConflictError";
    this.field = field;
  }
}

/** 422 - validation failure with per-field details */
export class ValidationError extends AppError {
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 422);
    this.name = "ValidationError";
    this.fields = fields;
  }
}
