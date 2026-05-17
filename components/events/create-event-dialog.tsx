"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const COLORS = [
  "#007AFF",
  "#34C759",
  "#FF9500",
  "#FF3B30",
  "#AF52DE",
  "#5856D6",
  "#FF2D55",
  "#5AC8FA",
];

export function CreateEventDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState("#007AFF");
  const [loading, setLoading] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && titleRef.current) {
      titleRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Введите название события");
      return;
    }

    setLoading(true);

    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startDateTime.toISOString(),
        isAllDay,
        color,
      };

      if (!isAllDay) {
        const endDateTime = new Date(date);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        endDateTime.setHours(endHours, endMinutes);
        body.endTime = endDateTime.toISOString();
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to create event");
      }

      toast.success("Событие создано");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Ошибка при создании события");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setIsAllDay(false);
    setColor("#007AFF");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const titleFontSize = title.length > 30 ? "text-xl" : title.length > 15 ? "text-2xl" : "text-3xl";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Новое событие</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название"
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent placeholder:text-muted-foreground/50 focus:outline-none font-semibold tracking-tight transition-all duration-200",
                titleFontSize
              )}
              style={{ minHeight: "2.5rem" }}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
              className="shrink-0 -mr-2 rounded-full min-h-11 min-w-11"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={2}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Popover>
              <PopoverTrigger className={cn(
                "w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-input bg-background px-4 py-2 text-sm font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-h-11",
                !date && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Дата"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 rounded-2xl">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <div className="flex items-center justify-between sm:justify-start gap-3 min-h-11 px-1">
              <span className="text-sm text-muted-foreground">Весь день</span>
              <Switch checked={isAllDay} onCheckedChange={setIsAllDay} />
            </div>
          </div>

          {!isAllDay && (
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-11"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-11"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "w-11 h-11 rounded-full transition-all duration-200 flex items-center justify-center",
                  color === c
                    ? "scale-110"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px var(--background), 0 0 0 4px ${c}` : "none" }}
              >
                {color === c && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl min-h-11 text-base font-medium"
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать событие"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
