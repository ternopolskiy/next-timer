import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/lib/services/event";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireAuth();
    const events = await EventService.getAll(session.user.id);
    return NextResponse.json({ events });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { title, description, startTime, endTime, isAllDay, color } = body;

    if (!title || !startTime) {
      return NextResponse.json(
        { error: "Title and startTime are required" },
        { status: 400 }
      );
    }

    const event = await EventService.create(session.user.id, {
      title,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      isAllDay: isAllDay || false,
      color: color || "#3B82F6",
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
