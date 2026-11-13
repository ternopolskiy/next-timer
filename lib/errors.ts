import type { ZodError } from "zod";

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      fieldErrors?: Record<string, string[]>;
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = options.code ?? "INTERNAL_ERROR";
    this.status = options.status ?? 500;
    this.fieldErrors = options.fieldErrors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Требуется авторизация") {
    super(message, { code: "UNAUTHORIZED", status: 401 });
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Запись не найдена") {
    super(message, { code: "NOT_FOUND", status: 404 });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Проверьте заполненные поля",
    fieldErrors?: Record<string, string[]>
  ) {
    super(message, { code: "VALIDATION_ERROR", status: 400, fieldErrors });
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Слишком много попыток. Попробуйте позже.") {
    super(message, { code: "RATE_LIMITED", status: 429 });
    this.name = "RateLimitError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Запись уже существует") {
    super(message, { code: "CONFLICT", status: 409 });
    this.name = "ConflictError";
  }
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toActionResult(error: unknown): ActionResult<never> {
  if (isAppError(error)) {
    return {
      ok: false,
      code: error.code,
      error: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  console.error(error);

  return {
    ok: false,
    code: "INTERNAL_ERROR",
    error: "Что-то пошло не так. Попробуйте ещё раз.",
  };
}
