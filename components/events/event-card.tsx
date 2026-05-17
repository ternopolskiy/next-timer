"use client";

import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Event } from "@/app/generated/prisma/client";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const startTime = new Date(event.startTime);
  const endTime = event.endTime ? new Date(event.endTime) : null;

  return (
    <Card
      onClick={() => router.push(`/event/${event.id}`)}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-0.5 cursor-pointer min-h-11"
      style={{ borderLeft: `3px solid ${event.color}` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg tracking-tight truncate">
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
              <span>
                {format(startTime, "d MMMM", { locale: ru })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {format(startTime, "HH:mm")}
                {endTime && ` — ${format(endTime, "HH:mm")}`}
              </span>
            </div>
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
