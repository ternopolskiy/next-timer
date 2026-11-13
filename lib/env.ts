import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  NEXTAUTH_SECRET: isProduction
    ? z.string().min(32, "NEXTAUTH_SECRET должен содержать минимум 32 символа")
    : z
        .string()
        .min(16, "NEXTAUTH_SECRET должен содержать минимум 16 символов")
        .default("dev-only-secret-change-me-please"),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Некорректные переменные окружения:\n${details}`);
}

export const env = parsed.data;
