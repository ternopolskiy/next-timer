"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/events/empty-state";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
import { Event } from "@/app/generated/prisma/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  const fetchEvents = () => {
    if (status === "authenticated") {
      fetch("/api/events")
        .then((res) => res.json())
        .then((data) => {
          setEvents(data.events || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

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

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
