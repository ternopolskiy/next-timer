"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  Clock,
  Sparkles,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { getCategory } from "@/lib/constants/events";
import {
  calculateTimeLeft,
  type TimeLeft,
} from "@/lib/date/countdown";
import {
  formatEventDate,
  formatEventTime,
  formatRelativeToEvent,
} from "@/lib/date/format";
import { getEventEnd, getEventStatus } from "@/lib/date/status";
import { toEventTiming, type EventDTO } from "@/lib/dto/event";
import { cn } from "@/lib/utils";

const EMPTY_TIME_LEFT: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
};

interface DashboardHeroProps {
  event: EventDTO | null;
  timezone: string;
  initialNow: number;
  onCreate: () => void;
}

export function DashboardHero({
  event,
  timezone,
  initialNow,
  onCreate,
}: DashboardHeroProps) {
  const timing = event ? toEventTiming(event) : null;
  const displayTimezone = event?.timezone ?? timezone;
  const now = useNow(initialNow, { intervalMs: 1000 });
  const status = timing ? getEventStatus(timing, now, displayTimezone) : null;
  const isOngoing = status === "ongoing";
  const isPast = status === "past";

  const targetTime = timing
    ? (isOngoing || isPast
        ? getEventEnd(timing, displayTimezone)
        : timing.startTime
      ).getTime()
    : null;

  const timeLeft =
    targetTime === null
      ? EMPTY_TIME_LEFT
      : calculateTimeLeft(new Date(targetTime), now);

  if (!event || !timing) {
    return <EmptyHero onCreate={onCreate} />;
  }

  const category = getCategory(event.category);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: event.color }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              {isPast
                ? "Событие завершилось"
                : isOngoing
                  ? "Идёт сейчас"
                  : "Ближайшее событие"}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/50">
              •
            </span>
            <span>
              {category.emoji} {category.label}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {event.emoji && (
                <span className="mr-2" aria-hidden="true">
                  {event.emoji}
                </span>
              )}
              {event.title}
            </h2>

            {event.description && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatEventDate(timing, displayTimezone)}
            </span>

            {!event.isAllDay && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {formatEventTime(timing, displayTimezone)}
              </span>
            )}

            {!isOngoing && !isPast && (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 shrink-0" />
                {formatRelativeToEvent(timing, now, displayTimezone)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:flex-col lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {isPast
                ? "Завершено"
                : isOngoing
                  ? "До окончания"
                  : "До начала"}
            </p>
            <div
              role="timer"
              aria-label={
                isPast
                  ? "Событие завершено"
                  : isOngoing
                    ? "До окончания события"
                    : "До начала события"
              }
              className="mt-2 flex gap-1.5"
            >
              <CountdownCell value={timeLeft.days} label="дн" />
              <CountdownCell value={timeLeft.hours} label="ч" />
              <CountdownCell value={timeLeft.minutes} label="мин" />
              <CountdownCell value={timeLeft.seconds} label="с" />
            </div>
          </div>

          <Link
            href={`/event/${event.id}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 rounded-full px-5"
            )}
          >
            Открыть таймер
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-12 rounded-xl bg-background/80 px-2.5 py-2 text-center ring-1 ring-border/50">
      <span className="block text-xl font-semibold tabular-nums sm:text-2xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function EmptyHero({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Всё под контролем
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Нет предстоящих событий. Самое время добавить важное.
            </p>
          </div>
        </div>

        <Button
          onClick={onCreate}
          className="min-h-11 shrink-0 rounded-full px-5"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Создать событие
        </Button>
      </div>
    </section>
  );
}
