import { describe, expect, it } from "vitest";
import {
  getEventEnd,
  getEventStatus,
  type EventTiming,
} from "@/lib/date/status";
import { zonedAllDayToUtc } from "@/lib/date/timezone";

const now = new Date("2026-05-20T12:00:00.000Z");

function event(overrides: Partial<EventTiming>): EventTiming {
  return {
    startTime: new Date("2026-05-20T12:00:00.000Z"),
    endTime: null,
    isAllDay: false,
    timezone: "UTC",
    ...overrides,
  };
}

describe("getEventStatus", () => {
  it("marks a later date as upcoming", () => {
    expect(
      getEventStatus(
        event({ startTime: new Date("2026-05-21T10:00:00.000Z") }),
        now
      )
    ).toBe("upcoming");
  });

  it("marks a later event today as today", () => {
    expect(
      getEventStatus(
        event({ startTime: new Date("2026-05-20T18:00:00.000Z") }),
        now
      )
    ).toBe("today");
  });

  it("marks an event with an active range as ongoing", () => {
    expect(
      getEventStatus(
        event({
          startTime: new Date("2026-05-20T11:00:00.000Z"),
          endTime: new Date("2026-05-20T13:00:00.000Z"),
        }),
        now
      )
    ).toBe("ongoing");
  });

  it("marks a finished event as past", () => {
    expect(
      getEventStatus(
        event({
          startTime: new Date("2026-05-20T09:00:00.000Z"),
          endTime: new Date("2026-05-20T10:00:00.000Z"),
        }),
        now
      )
    ).toBe("past");
  });

  it("marks a started event without an end as past", () => {
    expect(
      getEventStatus(
        event({ startTime: new Date("2026-05-20T11:00:00.000Z") }),
        now
      )
    ).toBe("past");
  });

  it("handles all-day events", () => {
    expect(
      getEventStatus(
        event({
          startTime: zonedAllDayToUtc("2026-05-20", "UTC"),
          isAllDay: true,
        }),
        now
      )
    ).toBe("ongoing");

    expect(
      getEventStatus(
        event({
          startTime: zonedAllDayToUtc("2026-05-19", "UTC"),
          isAllDay: true,
        }),
        now
      )
    ).toBe("past");

    expect(
      getEventStatus(
        event({
          startTime: zonedAllDayToUtc("2026-05-21", "UTC"),
          isAllDay: true,
        }),
        now
      )
    ).toBe("upcoming");
  });

  it("uses the event time zone for all-day boundaries", () => {
    const lateEvening = new Date("2026-05-20T22:00:00.000Z");
    const utcAllDay = event({
      startTime: zonedAllDayToUtc("2026-05-20", "UTC"),
      isAllDay: true,
      timezone: "UTC",
    });
    const moscowAllDay = event({
      startTime: zonedAllDayToUtc("2026-05-20", "Europe/Moscow"),
      isAllDay: true,
      timezone: "Europe/Moscow",
    });

    expect(getEventStatus(utcAllDay, lateEvening, "UTC")).toBe("ongoing");
    expect(getEventStatus(moscowAllDay, lateEvening, "UTC")).toBe("past");
  });
});

describe("getEventEnd", () => {
  it("returns the next local midnight for all-day events", () => {
    const allDay = event({
      startTime: zonedAllDayToUtc("2026-05-20", "Europe/Moscow"),
      isAllDay: true,
      timezone: "Europe/Moscow",
    });

    expect(getEventEnd(allDay, "UTC").toISOString()).toBe(
      "2026-05-20T21:00:00.000Z"
    );
  });

  it("returns the start for events without an end", () => {
    const timed = event({ timezone: "UTC" });
    expect(getEventEnd(timed).toISOString()).toBe(
      "2026-05-20T12:00:00.000Z"
    );
  });
});
