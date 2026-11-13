import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { requireSessionPage } from "@/lib/auth/page";
import { toEventDTO, toEventTiming } from "@/lib/dto/event";
import { EventService } from "@/lib/services/event";
import {
  formatEventDate,
  formatEventTime,
} from "@/lib/date/format";
import { getBrowserTimeZone } from "@/lib/date/timezone";
import { getCategory } from "@/lib/constants/events";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "@/components/timer/timer-display";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventTimerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSessionPage(`/event/${id}`);
  const event = await EventService.getById(id, session.user.id);

  if (!event) {
    notFound();
  }

  const dto = toEventDTO(event);
  const timing = toEventTiming(dto);
  const timezone =
    dto.timezone ?? session.user.timezone ?? getBrowserTimeZone();
  const category = getCategory(dto.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "rounded-full mb-6 min-h-11"
          )}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Link>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </span>

            {dto.isAllDay && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Весь день
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">
            {dto.emoji && (
              <span className="mr-2" aria-hidden="true">
                {dto.emoji}
              </span>
            )}
            {dto.title}
          </h1>

          {dto.description && (
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              {dto.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatEventDate(timing, timezone)}</span>
            </div>

            {!dto.isAllDay && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatEventTime(timing, timezone)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-12 md:p-16 shadow-xl shadow-black/5 dark:shadow-white/5">
        <TimerDisplay
          targetDate={new Date(dto.startTime)}
          isAllDay={dto.isAllDay}
        />
      </Card>
    </div>
  );
}
