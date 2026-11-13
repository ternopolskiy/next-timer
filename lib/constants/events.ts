export const EVENT_CATEGORY_VALUES = [
  "personal",
  "work",
  "study",
  "travel",
  "birthday",
  "holiday",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORY_VALUES)[number];

export const EVENT_CATEGORIES: ReadonlyArray<{
  value: EventCategory;
  label: string;
  emoji: string;
}> = [
  { value: "personal", label: "Личное", emoji: "🧘" },
  { value: "work", label: "Работа", emoji: "💼" },
  { value: "study", label: "Учёба", emoji: "📚" },
  { value: "travel", label: "Поездка", emoji: "✈️" },
  { value: "birthday", label: "День рождения", emoji: "🎂" },
  { value: "holiday", label: "Праздник", emoji: "🎉" },
  { value: "other", label: "Другое", emoji: "✨" },
];

export const EVENT_COLORS = [
  { value: "#007AFF", label: "Синий" },
  { value: "#34C759", label: "Зелёный" },
  { value: "#FF9500", label: "Оранжевый" },
  { value: "#FF3B30", label: "Красный" },
  { value: "#AF52DE", label: "Фиолетовый" },
  { value: "#5856D6", label: "Индиго" },
  { value: "#FF2D55", label: "Розовый" },
  { value: "#5AC8FA", label: "Голубой" },
] as const;

export const DEFAULT_EVENT_COLOR = EVENT_COLORS[0].value;

export const EVENT_GROUP_VALUES = ["today", "week", "later", "past"] as const;

export type EventGroupKey = (typeof EVENT_GROUP_VALUES)[number];

export const EVENT_GROUP_TITLES: Record<EventGroupKey, string> = {
  today: "Сегодня",
  week: "На этой неделе",
  later: "Позже",
  past: "Прошедшие",
};

export const REMINDER_VALUES = [0, 60, 1440, 10080] as const;

export type ReminderMinutes = (typeof REMINDER_VALUES)[number];

export const REMINDER_OPTIONS: ReadonlyArray<{
  value: ReminderMinutes | null;
  label: string;
}> = [
  { value: null, label: "Не напоминать" },
  { value: 0, label: "В момент события" },
  { value: 60, label: "За 1 час" },
  { value: 1440, label: "За 1 день" },
  { value: 10080, label: "За 1 неделю" },
];

export function getCategory(value: string | null | undefined) {
  return (
    EVENT_CATEGORIES.find((category) => category.value === value) ??
    EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]
  );
}
