/**
 * Снимок времени для серверного рендера. Вынесен из компонента,
 * чтобы серверная страница не нарушала правило чистоты React.
 */
export function getRenderTimestamp(): number {
  return Date.now();
}
