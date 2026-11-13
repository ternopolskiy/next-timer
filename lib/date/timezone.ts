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

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Проверяет, что строка — существующая календарная дата в формате ГГГГ-ММ-ДД. */
export function isValidDateKey(value: string): boolean {
  if (!DATE_KEY_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && getDateKey(date, "UTC") === value
  );
}

/** Локальная дата (полдень) для календаря из ключа ГГГГ-ММ-ДД. */
export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

/** Прибавляет дни к ключу даты, не задевая часовые пояса и DST. */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return getDateKey(date, "UTC");
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
  return zonedAllDayToUtc(
    addDaysToDateKey(getDateKey(date, timeZone), 1),
    timeZone
  );
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
