import { describe, expect, it } from "vitest";
import {
  formatEventDate,
  formatEventTime,
  formatRelativeToEvent,
  pluralizeRu,
} from "@/lib/date/format";

describe("pluralizeRu", () => {
  it("uses the correct Russian plural form", () => {
    expect(pluralizeRu(1, "день", "дня", "дней")).toBe("день");
    expect(pluralizeRu(2, "день", "дня", "дней")).toBe("дня");
    expect(pluralizeRu(5, "день", "дня", "дней")).toBe("дней");
    expect(pluralizeRu(11, "день", "дня", "дней")).toBe("дней");
    expect(pluralizeRu(21, "день", "дня", "дней")).toBe("день");
    expect(pluralizeRu(22, "день", "дня", "дней")).toBe("дня");
    expect(pluralizeRu(25, "день", "дня", "дней")).toBe("дней");
  });
});

describe("event formatting", () => {
  it("formats a date in the event time zone", () => {
    const event = {
      startTime: new Date("2026-05-20T06:00:00.000Z"),
      endTime: null,
      isAllDay: false,
      timezone: "Europe/Moscow",
    };

    expect(formatEventDate(event, "UTC")).toBe("20 мая 2026");
    expect(formatEventTime(event, "UTC")).toBe("09:00");
  });

  it("does not show a time for all-day events", () => {
    const event = {
      startTime: new Date("2026-05-20T00:00:00.000Z"),
      endTime: null,
      isAllDay: true,
      timezone: "UTC",
    };

    expect(formatEventTime(event, "UTC")).toBe("Весь день");
  });

  it("formats a time range", () => {
    const event = {
      startTime: new Date("2026-05-20T09:00:00.000Z"),
      endTime: new Date("2026-05-20T10:30:00.000Z"),
      isAllDay: false,
      timezone: "UTC",
    };

    expect(formatEventTime(event, "UTC")).toBe("09:00 — 10:30");
  });

  it("formats a future relative time", () => {
    const event = {
      startTime: new Date("2026-05-21T12:00:00.000Z"),
      endTime: null,
      isAllDay: false,
      timezone: "UTC",
    };

    expect(
      formatRelativeToEvent(
        event,
        new Date("2026-05-20T12:00:00.000Z"),
        "UTC"
      )
    ).toBe("через 1 день");
  });

  it("formats a past relative time from the event end", () => {
    const event = {
      startTime: new Date("2026-05-19T09:00:00.000Z"),
      endTime: new Date("2026-05-19T10:00:00.000Z"),
      isAllDay: false,
      timezone: "UTC",
    };

    expect(
      formatRelativeToEvent(
        event,
        new Date("2026-05-21T10:00:00.000Z"),
        "UTC"
      )
    ).toBe("2 дня назад");
  });

  it("uses human labels for ongoing events", () => {
    const timed = {
      startTime: new Date("2026-05-20T11:00:00.000Z"),
      endTime: new Date("2026-05-20T13:00:00.000Z"),
      isAllDay: false,
      timezone: "UTC",
    };
    const allDay = {
      startTime: new Date("2026-05-20T00:00:00.000Z"),
      endTime: null,
      isAllDay: true,
      timezone: "UTC",
    };
    const now = new Date("2026-05-20T12:00:00.000Z");

    expect(formatRelativeToEvent(timed, now, "UTC")).toBe("сейчас");
    expect(formatRelativeToEvent(allDay, now, "UTC")).toBe("сегодня");
  });
});
