"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateTimeLeft,
  type TimeLeft,
} from "@/lib/date/countdown";

interface UseCountdownOptions {
  /** Останавливает отсчёт, сохраняя текущее значение. */
  enabled?: boolean;
  intervalMs?: number;
}

interface Countdown {
  timeLeft: TimeLeft;
  /** Пересчитывает значение от текущего момента. */
  reset: () => void;
}

/**
 * Отсчёт до момента времени. Каждый тик считает разницу заново,
 * поэтому интервал не накапливает дрейф. При возврате на вкладку
 * значение обновляется сразу.
 */
export function useCountdown(
  target: Date,
  { enabled = true, intervalMs = 1000 }: UseCountdownOptions = {}
): Countdown {
  const targetTime = target.getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [enabled, intervalMs]);

  const timeLeft = useMemo(
    () => calculateTimeLeft(new Date(targetTime), new Date(now)),
    [targetTime, now]
  );

  const reset = useCallback(() => setNow(Date.now()), []);

  return { timeLeft, reset };
}
