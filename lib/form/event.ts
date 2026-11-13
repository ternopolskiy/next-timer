import {
  DEFAULT_EVENT_COLOR,
  REMINDER_VALUES,
  type EventCategory,
  type ReminderMinutes,
} from "@/lib/constants/events";
import {
  getDateKey,
  getTimeKey,
  resolveTimeZone,
} from "@/lib/date/timezone";
import type { EventDTO } from "@/lib/dto/event";
import type { EventFormValues } from "@/lib/validation/event";

export const DEFAULT_START_TIME = "09:00";
export const DEFAULT_END_TIME = "10:00";

const DEFAULT_CATEGORY: EventCategory = "other";

/**
 * Значения формы не зависят от устройства: дата и время хранятся
 * строками в часовом поясе события.
 */
export function createEmptyEventFormValues(
  timeZone: string,
  now = new Date()
): EventFormValues {
  const resolvedTimeZone = resolveTimeZone(timeZone);

  return {
    title: "",
    description: "",
    date: getDateKey(now, resolvedTimeZone),
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    isAllDay: false,
    color: DEFAULT_EVENT_COLOR,
    category: DEFAULT_CATEGORY,
    emoji: "",
    reminderMinutes: null,
    timezone: resolvedTimeZone,
  };
}

export function eventToFormValues(
  event: EventDTO,
  fallbackTimeZone: string
): EventFormValues {
  const timeZone = resolveTimeZone(event.timezone, fallbackTimeZone);
  const startTime = new Date(event.startTime);

  return {
    title: event.title,
    description: event.description ?? "",
    date: getDateKey(startTime, timeZone),
    startTime: getTimeKey(startTime, timeZone),
    endTime: event.endTime
      ? getTimeKey(new Date(event.endTime), timeZone)
      : "",
    isAllDay: event.isAllDay,
    color: event.color,
    category: event.category,
    emoji: event.emoji ?? "",
    reminderMinutes: normalizeReminder(event.reminderMinutes),
    timezone: timeZone,
  };
}

function normalizeReminder(value: number | null): ReminderMinutes | null {
  if (value === null) return null;

  return REMINDER_VALUES.includes(value as ReminderMinutes)
    ? (value as ReminderMinutes)
    : null;
}
