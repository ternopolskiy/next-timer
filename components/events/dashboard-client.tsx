"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { DeleteEventDialog } from "@/components/events/delete-event-dialog";
import { DashboardHero } from "@/components/events/dashboard-hero";
import { EmptyState } from "@/components/events/empty-state";
import { EventCard } from "@/components/events/event-card";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import {
  createEventAction,
  duplicateEventAction,
  updateEventAction,
} from "@/lib/actions/event";
import { getEventStatus } from "@/lib/date/status";
import { toEventTiming, type EventDTO } from "@/lib/dto/event";
import {
  createEmptyEventFormValues,
  eventToFormValues,
} from "@/lib/form/event";
import { useNow } from "@/hooks/use-now";
import type { EventFormValues } from "@/lib/validation/event";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; event: EventDTO }
  | null;

interface DashboardClientProps {
  initialEvents: EventDTO[];
  timezone: string | null;
  /** Снимок времени с сервера для совпадения разметки при гидратации. */
  renderedAt: number;
}

export function DashboardClient({
  initialEvents,
  timezone,
  renderedAt,
}: DashboardClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [formState, setFormState] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDTO | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const displayTimezone = timezone ?? "UTC";
  const isEditing = formState?.mode === "edit";
  const now = useNow(renderedAt);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    [events]
  );

  const nextEvent = useMemo(
    () =>
      sortedEvents.find(
        (event) =>
          getEventStatus(
            toEventTiming(event),
            now,
            event.timezone ?? displayTimezone
          ) !== "past"
      ) ?? null,
    [sortedEvents, now, displayTimezone]
  );

  const defaultValues = useMemo(() => {
    if (!formState) return null;

    return formState.mode === "create"
      ? createEmptyEventFormValues(displayTimezone)
      : eventToFormValues(formState.event, displayTimezone);
  }, [formState, displayTimezone]);

  const submitEvent =
    formState?.mode === "edit"
      ? (values: EventFormValues) =>
          updateEventAction(formState.event.id, values)
      : createEventAction;

  const handleFormSuccess = (event: EventDTO) => {
    setEvents((current) =>
      current.some((item) => item.id === event.id)
        ? current.map((item) => (item.id === event.id ? event : item))
        : [...current, event]
    );
    setFormState(null);
  };

  const handleDuplicate = async (event: EventDTO) => {
    setDuplicatingId(event.id);
    const result = await duplicateEventAction(event.id);
    setDuplicatingId(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setEvents((current) => [...current, result.data]);
    toast.success("Событие продублировано");
  };

  const handleDeleted = (id: string) => {
    setEvents((current) => current.filter((event) => event.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <DashboardHero
          event={nextEvent}
          timezone={displayTimezone}
          initialNow={renderedAt}
          onCreate={() => setFormState({ mode: "create" })}
        />

        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Мои события
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Управляйте своими событиями и отслеживайте время
              </p>
            </div>

            <Button
              onClick={() => setFormState({ mode: "create" })}
              className="min-h-11 rounded-full px-6"
            >
              <Plus className="mr-2 h-4 w-4" />
              Новое событие
            </Button>
          </div>

          {sortedEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sortedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  timezone={displayTimezone}
                  now={now}
                  isDuplicating={duplicatingId === event.id}
                  onEdit={(target) =>
                    setFormState({ mode: "edit", event: target })
                  }
                  onDuplicate={handleDuplicate}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <EventFormDialog
        open={formState !== null}
        onOpenChange={(open) => {
          if (!open) setFormState(null);
        }}
        title={isEditing ? "Редактировать событие" : "Новое событие"}
        description={
          isEditing
            ? "Измените детали события и сохраните результат"
            : "Заполните детали нового события"
        }
        defaultValues={defaultValues}
        submitLabel={isEditing ? "Сохранить" : "Создать событие"}
        pendingLabel={isEditing ? "Сохранение…" : "Создание…"}
        successMessage={isEditing ? "Событие обновлено" : "Событие создано"}
        submitEvent={submitEvent}
        onSuccess={handleFormSuccess}
      />

      <DeleteEventDialog
        event={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
