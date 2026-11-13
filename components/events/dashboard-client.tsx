"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/events/empty-state";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
import { Button } from "@/components/ui/button";
import type { EventDTO } from "@/lib/dto/event";

interface DashboardClientProps {
  initialEvents: EventDTO[];
  timezone: string | null;
}

export function DashboardClient({
  initialEvents,
  timezone,
}: DashboardClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [events]
  );

  const handleCreated = (event: EventDTO) => {
    setEvents((current) => [...current, event]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Мои события
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Управляйте своими событиями и отслеживайте время
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-full px-6 min-h-11"
        >
          <Plus className="mr-2 h-4 w-4" />
          Новое событие
        </Button>
      </div>

      {sortedEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} timezone={timezone} />
          ))}
        </div>
      )}

      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleCreated}
        timezone={timezone}
      />
    </div>
  );
}
