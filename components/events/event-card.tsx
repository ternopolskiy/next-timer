"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategory } from "@/lib/constants/events";
import {
  formatEventDate,
  formatEventTime,
  formatRelativeToEvent,
} from "@/lib/date/format";
import { getEventStatus, type EventStatus } from "@/lib/date/status";
import { toEventTiming, type EventDTO } from "@/lib/dto/event";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<EventStatus, string> = {
  ongoing: "Сейчас",
  today: "Сегодня",
  upcoming: "Скоро",
  past: "Завершено",
};

const STATUS_STYLES: Record<EventStatus, string> = {
  ongoing:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  today: "bg-primary/10 text-primary",
  upcoming: "bg-secondary text-secondary-foreground",
  past: "bg-muted text-muted-foreground",
};

interface EventCardProps {
  event: EventDTO;
  timezone: string | null;
  now: Date;
  isDuplicating?: boolean;
  onEdit: (event: EventDTO) => void;
  onDuplicate: (event: EventDTO) => void;
  onDelete: (event: EventDTO) => void;
}

export function EventCard({
  event,
  timezone,
  now,
  isDuplicating = false,
  onEdit,
  onDuplicate,
  onDelete,
}: EventCardProps) {
  const timing = toEventTiming(event);
  const displayTimezone = event.timezone ?? timezone ?? "UTC";
  const status = getEventStatus(timing, now, displayTimezone);
  const category = getCategory(event.category);

  const statusLabel =
    status === "upcoming"
      ? formatRelativeToEvent(timing, now, displayTimezone)
      : STATUS_LABELS[status];

  return (
    <Card
      className="group relative min-h-11 overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5"
      style={{ borderLeft: `3px solid ${event.color}` }}
    >
      <Link
        href={`/event/${event.id}`}
        aria-label={`Открыть событие «${event.title}»`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      />

      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold tracking-tight">
            {event.emoji && (
              <span className="mr-2" aria-hidden="true">
                {event.emoji}
              </span>
            )}
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                STATUS_STYLES[status]
              )}
            >
              {statusLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {category.emoji} {category.label}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto relative z-20">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 rounded-full text-muted-foreground"
                  aria-label="Действия с событием"
                  onClick={(event) => event.stopPropagation()}
                />
              }
            >
              <MoreHorizontal className="h-5 w-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-auto min-w-44">
              <DropdownMenuItem
                className="min-h-10 gap-2 px-2"
                onClick={() => onEdit(event)}
              >
                <Pencil className="h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-h-10 gap-2 px-2"
                disabled={isDuplicating}
                onClick={() => onDuplicate(event)}
              >
                <Copy className="h-4 w-4" />
                {isDuplicating ? "Дублирование…" : "Дублировать"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="min-h-10 gap-2 px-2"
                onClick={() => onDelete(event)}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
