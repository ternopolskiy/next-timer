import { formatDistanceStrict } from "date-fns";
import { ru } from "date-fns/locale";
import {
  formatDateInTimeZone,
  resolveTimeZone,
} from "@/lib/date/timezone";
import {
  getEventEnd,
  getEventStatus,
  type EventTiming,
} from "@/lib/date/status";

export function pluralizeRu(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const abs = Math.abs(count) % 100;
  const lastDigit = abs % 10;

  if (abs > 10 && abs < 20) return many;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return few;
  return many;
}

export function formatRelativeToEvent(
  event: EventTiming,
  now = new Date(),
  fallbackTimeZone = "UTC"
): string {
  const status = getEventStatus(event, now, fallbackTimeZone);

  if (status === "ongoing") {
    return event.isAllDay ? "сегодня" : "сейчас";
  }

  if (status === "past") {
    const end = getEventEnd(event, fallbackTimeZone);
    return formatDistanceStrict(end, now, {
      addSuffix: true,
      locale: ru,
    });
  }

  return formatDistanceStrict(event.startTime, now, {
    addSuffix: true,
    locale: ru,
  });
}

export function formatEventDate(
  event: EventTiming,
  fallbackTimeZone = "UTC"
): string {
  const timeZone = resolveTimeZone(event.timezone, fallbackTimeZone);
  return formatDateInTimeZone(event.startTime, timeZone, "d MMMM yyyy");
}

export function formatEventTime(
  event: EventTiming,
  fallbackTimeZone = "UTC"
): string {
  const timeZone = resolveTimeZone(event.timezone, fallbackTimeZone);

  if (event.isAllDay) return "Весь день";

  const start = formatDateInTimeZone(event.startTime, timeZone, "HH:mm");

  if (!event.endTime) return start;

  const end = formatDateInTimeZone(event.endTime, timeZone, "HH:mm");
  return `${start} — ${end}`;
}

export function formatEventDateTime(
  event: EventTiming,
  fallbackTimeZone = "UTC"
): string {
  if (event.isAllDay) return formatEventDate(event, fallbackTimeZone);
  return `${formatEventDate(event, fallbackTimeZone)}, ${formatEventTime(
    event,
    fallbackTimeZone
  )}`;
}

export function formatFullDate(date: Date, timeZone: string): string {
  return formatDateInTimeZone(date, timeZone, "d MMMM yyyy");
}
