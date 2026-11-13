"use client";

import { useNow } from "@/hooks/use-now";
import {
  calculateTimeLeft,
  type TimeLeft,
} from "@/lib/date/countdown";

interface UseCountdownOptions {
  /** Снимок времени с сервера, чтобы разметка при гидратации совпадала. */
  initialNow: number;
  /** Останавливает отсчёт, сохраняя текущее значение. */
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Отсчёт до момента времени. Каждый тик считает разницу заново,
 * поэтому интервал не накапливает дрейф. При возврате на вкладку
 * значение обновляется сразу.
 */
export function useCountdown(
  target: Date,
  {
    initialNow,
    enabled = true,
    intervalMs = 1000,
  }: UseCountdownOptions
): TimeLeft {
  const now = useNow(initialNow, { enabled, intervalMs });

  return calculateTimeLeft(target, now);
}
