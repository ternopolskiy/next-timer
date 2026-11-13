import {
  EVENT_GROUP_TITLES,
  EVENT_GROUP_VALUES,
  type EventGroupKey,
} from "@/lib/constants/events";
import { getEventStatus, type EventTiming } from "@/lib/date/status";
import {
  addDaysToDateKey,
  getDateKey,
  resolveTimeZone,
} from "@/lib/date/timezone";

const WEEK_LENGTH_DAYS = 7;

export interface EventGroup<T> {
  key: EventGroupKey;
  title: string;
  events: T[];
}

/**
 * Раскладывает события по секциям: сегодня (включая идущие),
 * ближайшая неделя, позже и прошедшие. Чистая функция — не зависит
 * от React и легко тестируется.
 */
export function groupEvents<T extends EventTiming>(
  events: readonly T[],
  {
    now = new Date(),
    timeZone = "UTC",
  }: { now?: Date; timeZone?: string } = {}
): EventGroup<T>[] {
  const todayKey = getDateKey(now, timeZone);
  const weekEndKey = addDaysToDateKey(todayKey, WEEK_LENGTH_DAYS);

  const buckets: Record<EventGroupKey, T[]> = {
    today: [],
    week: [],
    later: [],
    past: [],
  };

  for (const event of events) {
    buckets[getEventGroupKey(event, { now, timeZone, weekEndKey })].push(event);
  }

  const byStartAscending = (a: T, b: T) =>
    a.startTime.getTime() - b.startTime.getTime();

  const groups: EventGroup<T>[] = [];

  for (const key of EVENT_GROUP_VALUES) {
    const groupEvents = buckets[key];

    if (groupEvents.length === 0) continue;

    groups.push({
      key,
      title: EVENT_GROUP_TITLES[key],
      events:
        key === "past"
          ? groupEvents.sort((a, b) => -byStartAscending(a, b))
          : groupEvents.sort(byStartAscending),
    });
  }

  return groups;
}

function getEventGroupKey<T extends EventTiming>(
  event: T,
  {
    now,
    timeZone,
    weekEndKey,
  }: { now: Date; timeZone: string; weekEndKey: string }
): EventGroupKey {
  const status = getEventStatus(event, now, timeZone);

  if (status === "past") return "past";
  if (status === "today" || status === "ongoing") return "today";

  const eventTimeZone = resolveTimeZone(event.timezone, timeZone);
  const startKey = getDateKey(event.startTime, eventTimeZone);

  return startKey < weekEndKey ? "week" : "later";
}
