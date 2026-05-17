import { prisma } from "@/lib/prisma";
import { Event } from "@/app/generated/prisma/client";

interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  isAllDay?: boolean;
  color?: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  isAllDay?: boolean;
  color?: string;
}

export class EventService {
  static async getAll(userId: string): Promise<Event[]> {
    return prisma.event.findMany({
      where: { userId },
      orderBy: { startTime: "asc" },
    });
  }

  static async getById(id: string, userId: string): Promise<Event | null> {
    return prisma.event.findFirst({
      where: { id, userId },
    });
  }

  static async create(userId: string, input: CreateEventInput): Promise<Event> {
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
    input: UpdateEventInput
  ): Promise<Event> {
    const existing = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Event not found");
    }

    return prisma.event.update({
      where: { id },
      data: input,
    });
  }

  static async remove(id: string, userId: string): Promise<Event> {
    const existing = await prisma.event.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Event not found");
    }

    return prisma.event.delete({
      where: { id },
    });
  }
}
