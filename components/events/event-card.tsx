"use client";

import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { EventDTO } from "@/lib/dto/event";
import { toEventTiming } from "@/lib/dto/event";
import {
  formatEventDate,
  formatEventTime,
} from "@/lib/date/format";

interface EventCardProps {
  event: EventDTO;
  timezone: string | null;
}

export function EventCard({ event, timezone }: EventCardProps) {
  const router = useRouter();
  const timing = toEventTiming(event);
  const displayTimezone = event.timezone ?? timezone ?? "UTC";

  return (
    <Card
      onClick={() => router.push(`/event/${event.id}`)}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-0.5 cursor-pointer min-h-11"
      style={{ borderLeft: `3px solid ${event.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg tracking-tight truncate">
            {event.emoji && (
              <span className="mr-2" aria-hidden="true">
                {event.emoji}
              </span>
            )}
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatEventDate(timing, displayTimezone)}</span>
            </div>

            {!event.isAllDay && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatEventTime(timing, displayTimezone)}</span>
              </div>
            )}
          </div>
        </div>

        {event.isAllDay && (
          <span className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            Весь день
          </span>
        )}
      </div>
    </Card>
  );
}
