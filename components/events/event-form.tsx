"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import {
  useForm,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_CATEGORIES,
  EVENT_COLORS,
  REMINDER_OPTIONS,
} from "@/lib/constants/events";
import type { EventDTO } from "@/lib/dto/event";
import type { ActionResult } from "@/lib/errors";
import { parseDateKey } from "@/lib/date/timezone";
import { cn } from "@/lib/utils";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/validation/event";

interface EventFormProps {
  defaultValues: EventFormValues;
  submitLabel: string;
  pendingLabel: string;
  successMessage: string;
  submitEvent: (values: EventFormValues) => Promise<ActionResult<EventDTO>>;
  onSuccess: (event: EventDTO) => void;
  onCancel: () => void;
}

export function EventForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  successMessage,
  submitEvent,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const title = useWatch({ control, name: "title" });
  const date = useWatch({ control, name: "date" });
  const isAllDay = useWatch({ control, name: "isAllDay" });
  const color = useWatch({ control, name: "color" });
  const reminderMinutes = useWatch({ control, name: "reminderMinutes" });

  const handleFormSubmit = handleSubmit(async (values) => {
    const result = await submitEvent(values);

    if (!result.ok) {
      let hasFieldError = false;
      const formFields = new Set(Object.keys(defaultValues));

      for (const [field, messages] of Object.entries(
        result.fieldErrors ?? {}
      )) {
        const message = messages[0];

        if (message && formFields.has(field)) {
          setError(field as FieldPath<EventFormValues>, {
            type: "server",
            message,
          });
          hasFieldError = true;
        }
      }

      toast.error(
        hasFieldError ? "Проверьте выделенные поля" : result.error
      );
      return;
    }

    toast.success(successMessage);
    onSuccess(result.data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5 p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <textarea
            {...register("title")}
            autoFocus
            placeholder="Название"
            rows={1}
            maxLength={120}
            aria-label="Название события"
            aria-invalid={Boolean(errors.title)}
            className={cn(
              "w-full resize-none bg-transparent font-semibold tracking-tight transition-all duration-200 placeholder:text-muted-foreground/50 focus:outline-none",
              title.length > 30
                ? "text-xl"
                : title.length > 15
                  ? "text-2xl"
                  : "text-3xl"
            )}
            style={{ minHeight: "2.5rem" }}
          />
          <FieldError message={errors.title?.message} />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="-mr-2 min-h-11 min-w-11 shrink-0 rounded-full"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div>
        <Textarea
          {...register("description")}
          placeholder="Описание"
          rows={2}
          maxLength={2000}
          aria-label="Описание"
          className="min-h-14 border-0 bg-transparent px-0 py-0 focus-visible:ring-0 dark:bg-transparent"
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Popover>
          <PopoverTrigger
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-normal shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-auto"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {format(parseDateKey(date), "d MMMM yyyy", { locale: ru })}
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-2xl p-3">
            <Calendar
              mode="single"
              selected={parseDateKey(date)}
              onSelect={(nextDate) =>
                nextDate &&
                setValue("date", format(nextDate, "yyyy-MM-dd"), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              locale={ru}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex min-h-11 items-center justify-between gap-3 px-1 sm:justify-start">
          <Label htmlFor="isAllDay" className="text-muted-foreground">
            Весь день
          </Label>
          <Switch
            id="isAllDay"
            checked={isAllDay}
            onCheckedChange={(checked) =>
              setValue("isAllDay", checked, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>
      </div>

      {!isAllDay && (
        <div>
          <div className="flex items-center gap-3">
            <input
              {...register("startTime")}
              type="time"
              aria-label="Время начала"
              aria-invalid={Boolean(errors.startTime)}
              className="min-h-11 flex-1 rounded-xl bg-secondary px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <span aria-hidden="true" className="text-muted-foreground">
              —
            </span>
            <input
              {...register("endTime")}
              type="time"
              aria-label="Время окончания"
              aria-invalid={Boolean(errors.endTime)}
              className="min-h-11 flex-1 rounded-xl bg-secondary px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <FieldError message={errors.startTime?.message ?? errors.endTime?.message} />
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-muted-foreground">
            Категория
          </Label>
          <Select id="category" {...register("category")}>
            {EVENT_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.category?.message} />
        </div>

        <div className="w-24 space-y-1.5">
          <Label htmlFor="emoji" className="text-muted-foreground">
            Эмодзи
          </Label>
          <Input
            id="emoji"
            {...register("emoji")}
            placeholder="🎉"
            maxLength={8}
            className="h-11 rounded-xl text-center text-lg"
          />
          <FieldError message={errors.emoji?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reminderMinutes" className="text-muted-foreground">
          Напоминание
        </Label>
        <Select
          id="reminderMinutes"
          value={reminderMinutes === null ? "" : String(reminderMinutes)}
          onChange={(event) =>
            setValue(
              "reminderMinutes",
              event.target.value === ""
                ? null
                : (Number(event.target.value) as EventFormValues["reminderMinutes"]),
              { shouldDirty: true }
            )
          }
        >
          {REMINDER_OPTIONS.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </Select>
        <FieldError message={errors.reminderMinutes?.message} />
      </div>

      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">Цвет</span>
        <div
          className="flex flex-wrap items-center gap-2"
          role="radiogroup"
          aria-label="Цвет события"
        >
          {EVENT_COLORS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={color === option.value}
              aria-label={option.label}
              onClick={() =>
                setValue("color", option.value, { shouldDirty: true })
              }
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
                color === option.value ? "scale-110" : "hover:scale-105"
              )}
              style={{
                backgroundColor: option.value,
                boxShadow:
                  color === option.value
                    ? `0 0 0 2px var(--background), 0 0 0 4px ${option.value}`
                    : "none",
              }}
            >
              {color === option.value && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
        <FieldError message={errors.color?.message} />
      </div>

      <Button
        type="submit"
        className="min-h-11 w-full rounded-xl text-base font-medium"
        disabled={isSubmitting}
      >
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-1.5 text-xs text-destructive">
      {message}
    </p>
  );
}
