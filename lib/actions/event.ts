"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/session";
import { EventService, type EventWriteInput } from "@/lib/services/event";
import {
  eventFormSchema,
  eventIdSchema,
  type EventFormValues,
} from "@/lib/validation/event";
import { toEventDTO, type EventDTO } from "@/lib/dto/event";
import {
  toActionResult,
  ValidationError,
  zodFieldErrors,
  type ActionResult,
} from "@/lib/errors";
import {
  zonedAllDayToUtc,
  zonedDateTimeToUtc,
} from "@/lib/date/timezone";

function parseEventInput(input: unknown): EventFormValues {
  const parsed = eventFormSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(
      "Проверьте заполненные поля",
      zodFieldErrors(parsed.error)
    );
  }

  return parsed.data;
}

function parseEventId(id: string): string {
  const parsed = eventIdSchema.safeParse(id);

  if (!parsed.success) {
    throw new ValidationError("Некорректный идентификатор события");
  }

  return parsed.data;
}

function toWriteInput(input: EventFormValues): EventWriteInput {
  const startTime = input.isAllDay
    ? zonedAllDayToUtc(input.date, input.timezone)
    : zonedDateTimeToUtc(input.date, input.startTime, input.timezone);

  const endTime =
    input.isAllDay || !input.endTime
      ? null
      : zonedDateTimeToUtc(input.date, input.endTime, input.timezone);

  return {
    title: input.title,
    description: input.description || null,
    startTime,
    endTime,
    isAllDay: input.isAllDay,
    color: input.color,
    timezone: input.timezone,
    category: input.category,
    emoji: input.emoji || null,
    reminderMinutes: input.reminderMinutes ?? null,
  };
}

export async function createEventAction(
  input: unknown
): Promise<ActionResult<EventDTO>> {
  try {
    const session = await requireAuth();
    const data = parseEventInput(input);
    const event = await EventService.create(
      session.user.id,
      toWriteInput(data)
    );

    revalidatePath("/");

    return { ok: true, data: toEventDTO(event) };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function updateEventAction(
  id: string,
  input: unknown
): Promise<ActionResult<EventDTO>> {
  try {
    const session = await requireAuth();
    const eventId = parseEventId(id);
    const data = parseEventInput(input);
    const event = await EventService.update(
      eventId,
      session.user.id,
      toWriteInput(data)
    );

    revalidatePath("/");
    revalidatePath(`/event/${eventId}`);

    return { ok: true, data: toEventDTO(event) };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function deleteEventAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAuth();
    const eventId = parseEventId(id);
    await EventService.remove(eventId, session.user.id);

    revalidatePath("/");
    revalidatePath(`/event/${eventId}`);

    return { ok: true, data: { id: eventId } };
  } catch (error) {
    return toActionResult(error);
  }
}

export async function duplicateEventAction(
  id: string
): Promise<ActionResult<EventDTO>> {
  try {
    const session = await requireAuth();
    const eventId = parseEventId(id);
    const event = await EventService.duplicate(eventId, session.user.id);

    revalidatePath("/");

    return { ok: true, data: toEventDTO(event) };
  } catch (error) {
    return toActionResult(error);
  }
}
