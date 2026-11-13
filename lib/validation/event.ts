import { z } from "zod";
import {
  EVENT_CATEGORY_VALUES,
  REMINDER_VALUES,
} from "@/lib/constants/events";
import { isValidDateKey, isValidTimeZone } from "@/lib/date/timezone";

const dateKeySchema = z
  .string()
  .refine(isValidDateKey, "Укажите существующую дату в формате ГГГГ-ММ-ДД");

const timeKeySchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Укажите время в формате ЧЧ:ММ");

const reminderSchema = z.union([
  z.literal(REMINDER_VALUES[0]),
  z.literal(REMINDER_VALUES[1]),
  z.literal(REMINDER_VALUES[2]),
  z.literal(REMINDER_VALUES[3]),
]);

/**
 * Схема формы события. Все поля обязательны, чтобы клиентская форма,
 * Server Actions и тесты работали с одним и тем же типом значений.
 */
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Введите название события")
      .max(120, "Название должно быть не длиннее 120 символов"),
    description: z
      .string()
      .trim()
      .max(2000, "Описание должно быть не длиннее 2000 символов"),
    date: dateKeySchema,
    startTime: timeKeySchema,
    endTime: timeKeySchema.or(z.literal("")),
    isAllDay: z.boolean(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Выберите корректный цвет"),
    category: z.enum(EVENT_CATEGORY_VALUES),
    emoji: z.string().trim().max(8, "Эмодзи слишком длинное"),
    reminderMinutes: reminderSchema.nullable(),
    timezone: z.string().refine(isValidTimeZone, "Неизвестный часовой пояс"),
  })
  .superRefine((data, ctx) => {
    if (data.isAllDay) return;

    if (!data.endTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Укажите время окончания",
      });
      return;
    }

    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Время окончания должно быть позже времени начала",
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const eventIdSchema = z.string().min(1, "Некорректный идентификатор");
