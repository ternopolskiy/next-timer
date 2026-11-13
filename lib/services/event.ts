import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { Event } from "@/app/generated/prisma/client";
import type { EventCategory } from "@/lib/constants/events";

export interface EventWriteInput {
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  isAllDay: boolean;
  color: string;
  timezone: string | null;
  category: EventCategory;
  emoji: string | null;
  reminderMinutes: number | null;
}

/**
 * Единственная точка доступа к событиям. Каждый запрос ограничен
 * владельцем, поэтому чужие записи недоступны даже при известном id.
 */
export class EventService {
  static async getAll(
    userId: string,
    options: { includeArchived?: boolean } = {}
  ): Promise<Event[]> {
    return prisma.event.findMany({
      where: {
        userId,
        ...(options.includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { startTime: "asc" },
    });
  }

  static async getById(id: string, userId: string): Promise<Event | null> {
    return prisma.event.findFirst({
      where: { id, userId },
    });
  }

  static async create(
    userId: string,
    input: EventWriteInput
  ): Promise<Event> {
    return prisma.event.create({
      data: {
        ...input,
        userId,
      },
    });
  }

  static async update(
    id: string,
    userId: string,
    input: EventWriteInput
  ): Promise<Event> {
    await assertOwned(id, userId);

    return prisma.event.update({
      where: { id },
      data: input,
    });
  }

  static async remove(id: string, userId: string): Promise<Event> {
    await assertOwned(id, userId);

    return prisma.event.delete({
      where: { id },
    });
  }

  static async duplicate(id: string, userId: string): Promise<Event> {
    const existing = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundError("Событие не найдено");
    }

    return prisma.event.create({
      data: {
        title: `${existing.title} (копия)`,
        description: existing.description,
        startTime: existing.startTime,
        endTime: existing.endTime,
        isAllDay: existing.isAllDay,
        color: existing.color,
        timezone: existing.timezone,
        category: existing.category,
        emoji: existing.emoji,
        reminderMinutes: existing.reminderMinutes,
        userId,
      },
    });
  }
}

async function assertOwned(id: string, userId: string): Promise<void> {
  const existing = await prisma.event.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new NotFoundError("Событие не найдено");
  }
}
