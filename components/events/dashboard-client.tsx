"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { DashboardHero } from "@/components/events/dashboard-hero";
import { DeleteEventDialog } from "@/components/events/delete-event-dialog";
import { EmptyState } from "@/components/events/empty-state";
import { EventCard } from "@/components/events/event-card";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useNow } from "@/hooks/use-now";
import {
  createEventAction,
  duplicateEventAction,
  updateEventAction,
} from "@/lib/actions/event";
import {
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/lib/constants/events";
import { groupEvents } from "@/lib/date/grouping";
import { getEventStatus } from "@/lib/date/status";
import { toEventTiming, type EventDTO } from "@/lib/dto/event";
import {
  createEmptyEventFormValues,
  eventToFormValues,
} from "@/lib/form/event";
import type { EventFormValues } from "@/lib/validation/event";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; event: EventDTO }
  | null;

type CategoryFilter = EventCategory | "all";

const ALL_CATEGORIES: CategoryFilter = "all";

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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORIES);
  const [showPast, setShowPast] = useState(false);

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

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      if (category !== ALL_CATEGORIES && event.category !== category) {
        return false;
      }

      if (!normalizedQuery) return true;

      return (
        event.title.toLowerCase().includes(normalizedQuery) ||
        (event.description?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [events, query, category]);

  const groups = useMemo(
    () =>
      groupEvents(
        filteredEvents.map((event) => ({
          event,
          ...toEventTiming(event),
        })),
        { now, timeZone: displayTimezone }
      ),
    [filteredEvents, now, displayTimezone]
  );

  const pastCount =
    groups.find((group) => group.key === "past")?.events.length ?? 0;
  const hasFilters = query.trim() !== "" || category !== ALL_CATEGORIES;
  const includePast = showPast || hasFilters;
  const visibleGroups = groups.filter(
    (group) => group.key !== "past" || includePast
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

  const resetFilters = () => {
    setQuery("");
    setCategory(ALL_CATEGORIES);
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

          {events.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Поиск событий"
                    aria-label="Поиск событий"
                    className="h-11 rounded-xl pr-10 pl-9"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Очистить поиск"
                      className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as CategoryFilter)
                  }
                  aria-label="Фильтр по категории"
                  className="sm:w-56"
                >
                  <option value={ALL_CATEGORIES}>Все категории</option>
                  {EVENT_CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {visibleGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
                  <p className="font-medium">
                    {pastCount > 0 && !includePast
                      ? "Все события уже прошли"
                      : "Ничего не найдено"}
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {pastCount > 0 && !includePast
                      ? "Покажите прошедшие события или создайте новое."
                      : "Попробуйте изменить запрос или фильтр."}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 min-h-11 rounded-full px-5"
                    onClick={
                      pastCount > 0 && !includePast
                        ? () => setShowPast(true)
                        : resetFilters
                    }
                  >
                    {pastCount > 0 && !includePast
                      ? `Показать прошедшие (${pastCount})`
                      : "Сбросить фильтры"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {visibleGroups.map((group) => (
                    <section key={group.key} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {group.title}
                        </h3>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {group.events.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {group.events.map(({ event }) => (
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
                    </section>
                  ))}
                </div>
              )}

              {pastCount > 0 &&
                !hasFilters &&
                visibleGroups.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      className="min-h-11 rounded-full px-5 text-muted-foreground"
                      onClick={() => setShowPast((value) => !value)}
                    >
                      {showPast
                        ? "Скрыть прошедшие"
                        : `Показать прошедшие (${pastCount})`}
                    </Button>
                  </div>
                )}
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
