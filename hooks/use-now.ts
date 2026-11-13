"use client";

import { useCallback, useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;

function subscribe(onStoreChange: () => void) {
  const interval = window.setInterval(onStoreChange, MINUTE_MS);
  document.addEventListener("visibilitychange", onStoreChange);

  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onStoreChange);
  };
}

function getSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS);
}

/**
 * Текущее время с обновлением раз в минуту. Серверный снимок
 * передаётся извне, поэтому разметка при гидратации совпадает.
 */
export function useNow(serverNow: number): Date {
  const serverMinute = Math.floor(serverNow / MINUTE_MS);
  const getServerSnapshot = useCallback(() => serverMinute, [serverMinute]);
  const minute = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return new Date(minute * MINUTE_MS);
}
