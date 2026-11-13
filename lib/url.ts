/**
 * Разрешаем редирект только на внутренние пути, чтобы не превратить
 * callbackUrl в open redirect.
 */
export function safeCallbackUrl(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  return value;
}
