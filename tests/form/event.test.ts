import { describe, expect, it } from "vitest";

import type { EventDTO } from "@/lib/dto/event";
import {
  createEmptyEventFormValues,
  eventToFormValues,
} from "@/lib/form/event";

function makeEvent(overrides: Partial<EventDTO> = {}): EventDTO {
  return {
    id: "event-1",
    title: "Поездка",
    description: null,
    startTime: "2026-05-20T06:00:00.000Z",
    endTime: "2026-05-20T08:00:00.000Z",
    isAllDay: false,
    color: "#007AFF",
    timezone: "Europe/Moscow",
    category: "travel",
    emoji: null,
    reminderMinutes: 60,
    archivedAt: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("event form mapping", () => {
  it("creates empty values for the given time zone", () => {
    const values = createEmptyEventFormValues(
      "Europe/Moscow",
      new Date("2026-05-19T22:30:00.000Z")
    );

    expect(values.date).toBe("2026-05-20");
    expect(values.startTime).toBe("09:00");
    expect(values.endTime).toBe("10:00");
    expect(values.reminderMinutes).toBeNull();
    expect(values.timezone).toBe("Europe/Moscow");
  });

  it("maps an event to local date and time keys", () => {
    const values = eventToFormValues(makeEvent(), "UTC");

    expect(values.date).toBe("2026-05-20");
    expect(values.startTime).toBe("09:00");
    expect(values.endTime).toBe("11:00");
    expect(values.description).toBe("");
    expect(values.emoji).toBe("");
  });

  it("keeps an empty end time for all-day events", () => {
    const values = eventToFormValues(
      makeEvent({
        isAllDay: true,
        startTime: "2026-05-19T21:00:00.000Z",
        endTime: null,
      }),
      "UTC"
    );

    expect(values.isAllDay).toBe(true);
    expect(values.date).toBe("2026-05-20");
    expect(values.endTime).toBe("");
  });

  it("drops unsupported reminder values", () => {
    const values = eventToFormValues(
      makeEvent({ reminderMinutes: 30 }),
      "UTC"
    );

    expect(values.reminderMinutes).toBeNull();
  });

  it("falls back to the provided time zone", () => {
    const values = eventToFormValues(
      makeEvent({ timezone: null }),
      "Europe/Moscow"
    );

    expect(values.timezone).toBe("Europe/Moscow");
    expect(values.startTime).toBe("09:00");
  });
});
