"use client";

import { useCallback, useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

interface UseNowOptions {
  /** Останавливает обновления, сохраняя последнее значение. */
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Текущее время с обновлением по таймеру. Серверный снимок передаётся
 * извне, поэтому разметка при гидратации совпадает с серверной.
 */
export function useNow(
  serverNow: number,
  { enabled = true, intervalMs = MINUTE_MS }: UseNowOptions = {}
): Date {
  const getSnapshot = useCallback(
    () => Math.floor(Date.now() / intervalMs),
    [intervalMs]
  );

  const getServerSnapshot = useCallback(
    () => Math.floor(serverNow / intervalMs),
    [serverNow, intervalMs]
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) return () => {};

      const interval = window.setInterval(onStoreChange, intervalMs);
      document.addEventListener("visibilitychange", onStoreChange);

      return () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onStoreChange);
      };
    },
    [enabled, intervalMs]
  );

  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return new Date(tick * intervalMs);
}
