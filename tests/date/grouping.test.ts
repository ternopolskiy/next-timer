import { describe, expect, it } from "vitest";

import { groupEvents } from "@/lib/date/grouping";
import type { EventTiming } from "@/lib/date/status";

function makeEvent(
  id: string,
  start: string,
  end: string | null = null
): EventTiming & { id: string } {
  return {
    id,
    startTime: new Date(start),
    endTime: end ? new Date(end) : null,
    isAllDay: false,
    timezone: "UTC",
  };
}

const now = new Date("2026-05-20T12:00:00.000Z");

describe("groupEvents", () => {
  it("splits events into today, week, later and past", () => {
    const groups = groupEvents(
      [
        makeEvent("past", "2026-05-19T10:00:00.000Z", "2026-05-19T11:00:00.000Z"),
        makeEvent("today", "2026-05-20T15:00:00.000Z", "2026-05-20T16:00:00.000Z"),
        makeEvent(
          "ongoing",
          "2026-05-20T11:00:00.000Z",
          "2026-05-20T13:00:00.000Z"
        ),
        makeEvent("week", "2026-05-22T10:00:00.000Z", "2026-05-22T11:00:00.000Z"),
        makeEvent("later", "2026-06-01T10:00:00.000Z", "2026-06-01T11:00:00.000Z"),
      ],
      { now, timeZone: "UTC" }
    );

    expect(groups.map((group) => group.key)).toEqual([
      "today",
      "week",
      "later",
      "past",
    ]);
    expect(groups[0].events.map((event) => event.id)).toEqual([
      "ongoing",
      "today",
    ]);
    expect(groups[1].events.map((event) => event.id)).toEqual(["week"]);
    expect(groups[2].events.map((event) => event.id)).toEqual(["later"]);
    expect(groups[3].events.map((event) => event.id)).toEqual(["past"]);
  });

  it("omits empty groups and sorts past events newest first", () => {
    const groups = groupEvents(
      [
        makeEvent("older", "2026-05-10T10:00:00.000Z", "2026-05-10T11:00:00.000Z"),
        makeEvent("newer", "2026-05-19T10:00:00.000Z", "2026-05-19T11:00:00.000Z"),
      ],
      { now, timeZone: "UTC" }
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("past");
    expect(groups[0].events.map((event) => event.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("treats the seventh day as later", () => {
    const groups = groupEvents(
      [
        makeEvent("sixth", "2026-05-26T10:00:00.000Z", "2026-05-26T11:00:00.000Z"),
        makeEvent(
          "seventh",
          "2026-05-27T10:00:00.000Z",
          "2026-05-27T11:00:00.000Z"
        ),
      ],
      { now, timeZone: "UTC" }
    );

    expect(groups.map((group) => group.key)).toEqual(["week", "later"]);
  });
});
