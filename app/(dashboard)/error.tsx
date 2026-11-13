"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        Не удалось загрузить данные
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Попробуйте обновить страницу. Если проблема повторяется,
        проверьте подключение к базе данных.
      </p>
      <Button
        onClick={reset}
        className="mt-6 rounded-full min-h-11 px-6"
      >
        Попробовать снова
      </Button>
    </div>
  );
}
