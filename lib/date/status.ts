import {
  endOfDayInTimeZone,
  getDateKey,
  resolveTimeZone,
} from "@/lib/date/timezone";

export type EventStatus = "upcoming" | "today" | "ongoing" | "past";

export interface EventTiming {
  startTime: Date;
  endTime?: Date | null;
  isAllDay: boolean;
  timezone?: string | null;
}

export function getEventEnd(
  event: EventTiming,
  fallbackTimeZone = "UTC"
): Date {
  const timeZone = resolveTimeZone(event.timezone, fallbackTimeZone);

  if (event.isAllDay) {
    return endOfDayInTimeZone(event.startTime, timeZone);
  }

  return event.endTime ?? event.startTime;
}

export function getEventStatus(
  event: EventTiming,
  now = new Date(),
  fallbackTimeZone = "UTC"
): EventStatus {
  const timeZone = resolveTimeZone(event.timezone, fallbackTimeZone);
  const start = event.startTime.getTime();
  const end = getEventEnd(event, fallbackTimeZone).getTime();
  const current = now.getTime();

  if (current > end) return "past";

  if (current >= start) {
    if (event.isAllDay) return "ongoing";
    return event.endTime ? "ongoing" : "past";
  }

  if (
    getDateKey(now, timeZone) === getDateKey(event.startTime, timeZone)
  ) {
    return "today";
  }

  return "upcoming";
}

export function isEventPast(
  event: EventTiming,
  now = new Date(),
  fallbackTimeZone = "UTC"
): boolean {
  return getEventStatus(event, now, fallbackTimeZone) === "past";
}
