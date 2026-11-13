import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { apiError } from "@/lib/api";
import {
  RateLimitError,
  ValidationError,
  zodFieldErrors,
} from "@/lib/errors";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const attempt = rateLimit(`register:${ip}`, {
      limit: 5,
      windowMs: 10 * 60_000,
    });

    if (!attempt.success) {
      throw new RateLimitError(
        "Слишком много попыток регистрации. Попробуйте позже."
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Проверьте данные",
        zodFieldErrors(parsed.error)
      );
    }

    const user = await AuthService.register(parsed.data);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
