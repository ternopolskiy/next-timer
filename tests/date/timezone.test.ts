import { describe, expect, it } from "vitest";
import {
  addDaysToDateKey,
  endOfDayInTimeZone,
  getDateKey,
  getTimeKey,
  isSameDayInTimeZone,
  isValidDateKey,
  isValidTimeZone,
  parseDateKey,
  resolveTimeZone,
  zonedAllDayToUtc,
  zonedDateTimeToUtc,
} from "@/lib/date/timezone";

describe("timezone helpers", () => {
  it("validates IANA time zones", () => {
    expect(isValidTimeZone("Europe/Moscow")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });

  it("falls back to a valid time zone", () => {
    expect(resolveTimeZone("Mars/Olympus", "Europe/Moscow")).toBe(
      "Europe/Moscow"
    );
    expect(resolveTimeZone(null, "Mars/Olympus")).toBe("UTC");
  });

  it("converts a zoned date and time to UTC", () => {
    expect(
      zonedDateTimeToUtc("2026-05-20", "09:00", "Europe/Moscow").toISOString()
    ).toBe("2026-05-20T06:00:00.000Z");

    expect(
      zonedDateTimeToUtc("2026-05-20", "09:00", "UTC").toISOString()
    ).toBe("2026-05-20T09:00:00.000Z");
  });

  it("handles daylight saving time", () => {
    expect(
      zonedDateTimeToUtc("2026-03-29", "12:00", "Europe/Berlin").toISOString()
    ).toBe("2026-03-29T10:00:00.000Z");

    expect(
      zonedDateTimeToUtc("2026-01-15", "12:00", "Europe/Berlin").toISOString()
    ).toBe("2026-01-15T11:00:00.000Z");
  });

  it("stores all-day events at local midnight", () => {
    expect(
      zonedAllDayToUtc("2026-05-20", "Europe/Moscow").toISOString()
    ).toBe("2026-05-19T21:00:00.000Z");
  });

  it("returns the correct local date and time keys", () => {
    const date = new Date("2026-05-19T22:30:00.000Z");

    expect(getDateKey(date, "Europe/Moscow")).toBe("2026-05-20");
    expect(getTimeKey(date, "Europe/Moscow")).toBe("01:30");
    expect(getDateKey(date, "UTC")).toBe("2026-05-19");
  });

  it("calculates the end of a local day", () => {
    const start = zonedAllDayToUtc("2026-05-20", "Europe/Moscow");

    expect(endOfDayInTimeZone(start, "Europe/Moscow").toISOString()).toBe(
      "2026-05-20T21:00:00.000Z"
    );
  });

  it("compares dates in a time zone", () => {
    const a = new Date("2026-05-19T22:30:00.000Z");
    const b = new Date("2026-05-20T10:00:00.000Z");

    expect(isSameDayInTimeZone(a, b, "Europe/Moscow")).toBe(true);
    expect(isSameDayInTimeZone(a, b, "UTC")).toBe(false);
  });

  it("validates and manipulates date keys", () => {
    expect(isValidDateKey("2026-05-20")).toBe(true);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("20.05.2026")).toBe(false);

    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(getDateKey(parseDateKey("2026-05-20"), "UTC")).toBe("2026-05-20");
  });
});
