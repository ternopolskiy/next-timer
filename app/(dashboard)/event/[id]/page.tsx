"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "@/components/timer/timer-display";
import { Event } from "@/app/generated/prisma/client";

export default function EventTimerPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetch(`/api/events/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setEvent(data.event);
          setLoading(false);
        })
        .catch(() => {
          router.push("/");
        });
    }
  }, [status, params.id, router]);

  if (loading || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-96 rounded-3xl bg-card animate-pulse" />
      </div>
    );
  }

  const startTime = new Date(event.startTime);
  const endTime = event.endTime ? new Date(event.endTime) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="rounded-full mb-6 min-h-11"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">
            {event.title}
          </h1>

          {event.description && (
            <p className="text-sm sm:text-base text-muted-foreground break-words">
              {event.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{format(startTime, "d MMMM yyyy", { locale: ru })}</span>
            </div>

            {!event.isAllDay && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  {format(startTime, "HH:mm")}
                  {endTime && ` — ${format(endTime, "HH:mm")}`}
                </span>
              </div>
            )}

            {event.isAllDay && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Весь день
              </span>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-12 md:p-16 shadow-xl shadow-black/5 dark:shadow-white/5">
        <TimerDisplay
          targetDate={startTime}
          isAllDay={event.isAllDay}
        />
      </Card>
    </div>
  );
}
