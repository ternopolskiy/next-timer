import { describe, expect, it } from "vitest";
import { eventFormSchema } from "@/lib/validation/event";

const validInput = {
  title: "  Поездка в Сочи  ",
  description: "",
  date: "2026-05-20",
  startTime: "09:00",
  endTime: "10:30",
  isAllDay: false,
  color: "#007AFF",
  category: "travel",
  emoji: "✈️",
  reminderMinutes: 1440,
  timezone: "Europe/Moscow",
};

describe("eventFormSchema", () => {
  it("accepts a valid timed event and trims the title", () => {
    const result = eventFormSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Поездка в Сочи");
      expect(result.data.category).toBe("travel");
      expect(result.data.timezone).toBe("Europe/Moscow");
    }
  });

  it("accepts an all-day event without an end time", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      isAllDay: true,
      endTime: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      title: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an end time that is not after the start time", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      endTime: "09:00",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === "endTime")
      ).toBe(true);
    }
  });

  it("requires an end time for a timed event", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      endTime: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown time zone", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      timezone: "Mars/Olympus",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid color", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      color: "blue",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unsupported reminder value", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      reminderMinutes: 30,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an overlong description", () => {
    const result = eventFormSchema.safeParse({
      ...validInput,
      description: "a".repeat(2001),
    });

    expect(result.success).toBe(false);
  });
});
