import { addDays, format } from "date-fns";
import {
  formatInTimeZone as formatInTimeZoneRaw,
  fromZonedTime,
} from "date-fns-tz";
import { ru } from "date-fns/locale";

export const FALLBACK_TIMEZONE = "UTC";

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(
  timeZone: string | null | undefined,
  fallback = FALLBACK_TIMEZONE
): string {
  if (timeZone && isValidTimeZone(timeZone)) return timeZone;
  return isValidTimeZone(fallback) ? fallback : FALLBACK_TIMEZONE;
}

export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

export function getDateKey(date: Date, timeZone: string): string {
  return formatInTimeZoneRaw(date, resolveTimeZone(timeZone), "yyyy-MM-dd");
}

export function getTimeKey(date: Date, timeZone: string): string {
  return formatInTimeZoneRaw(date, resolveTimeZone(timeZone), "HH:mm");
}

/** Превращает локальные дату/время в конкретной зоне в UTC-инстант. */
export function zonedDateTimeToUtc(
  dateKey: string,
  timeKey: string,
  timeZone: string
): Date {
  return fromZonedTime(
    `${dateKey}T${timeKey}:00`,
    resolveTimeZone(timeZone)
  );
}

/** Полночь локального дня в UTC. */
export function zonedAllDayToUtc(dateKey: string, timeZone: string): Date {
  return fromZonedTime(`${dateKey}T00:00:00`, resolveTimeZone(timeZone));
}

/** Начало локального дня для произвольного инстанта. */
export function startOfDayInTimeZone(date: Date, timeZone: string): Date {
  return zonedAllDayToUtc(getDateKey(date, timeZone), timeZone);
}

/** Начало следующего локального дня (эксклюзивная граница). */
export function endOfDayInTimeZone(date: Date, timeZone: string): Date {
  const nextDateKey = format(
    addDays(new Date(`${getDateKey(date, timeZone)}T12:00:00Z`), 1),
    "yyyy-MM-dd"
  );

  return zonedAllDayToUtc(nextDateKey, timeZone);
}

export function isSameDayInTimeZone(
  a: Date,
  b: Date,
  timeZone: string
): boolean {
  return getDateKey(a, timeZone) === getDateKey(b, timeZone);
}

export function formatDateInTimeZone(
  date: Date,
  timeZone: string,
  pattern: string
): string {
  return formatInTimeZoneRaw(date, resolveTimeZone(timeZone), pattern, {
    locale: ru,
  });
}
