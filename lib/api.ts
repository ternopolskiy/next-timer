import { NextResponse } from "next/server";
import { isAppError } from "@/lib/errors";

export function apiError(error: unknown): NextResponse {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        fieldErrors: error.fieldErrors,
      },
      { status: error.status }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: "Внутренняя ошибка сервера",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
