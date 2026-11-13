import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Введите корректный email");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "Имя должно быть не длиннее 80 символов")
    .optional()
    .default(""),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(72, "Пароль должен быть не длиннее 72 символов"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
