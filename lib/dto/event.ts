import type { Event as PrismaEvent } from "@/app/generated/prisma/client";
import type { EventCategory } from "@/lib/constants/events";

export interface EventDTO {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  isAllDay: boolean;
  color: string;
  timezone: string | null;
  category: EventCategory;
  emoji: string | null;
  reminderMinutes: number | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toEventDTO(event: PrismaEvent): EventDTO {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime?.toISOString() ?? null,
    isAllDay: event.isAllDay,
    color: event.color,
    timezone: event.timezone,
    category: event.category as EventCategory,
    emoji: event.emoji,
    reminderMinutes: event.reminderMinutes,
    archivedAt: event.archivedAt?.toISOString() ?? null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

export function toEventDTOs(events: PrismaEvent[]): EventDTO[] {
  return events.map(toEventDTO);
}

export function toEventTiming(event: EventDTO) {
  return {
    startTime: new Date(event.startTime),
    endTime: event.endTime ? new Date(event.endTime) : null,
    isAllDay: event.isAllDay,
    timezone: event.timezone,
  };
}
