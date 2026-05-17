import { CalendarPlus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
        <CalendarPlus className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight">
        Ваших событий пока нет
      </h3>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Создайте своё первое событие, чтобы начать отслеживать время
      </p>
    </div>
  );
}
