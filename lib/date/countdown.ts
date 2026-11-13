export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function calculateTimeLeft(
  target: Date,
  now = new Date()
): TimeLeft {
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function formatTimeLeftShort(timeLeft: TimeLeft): string {
  if (timeLeft.total <= 0) return "событие наступило";

  if (timeLeft.days > 0) {
    return `${timeLeft.days} д ${timeLeft.hours} ч`;
  }

  if (timeLeft.hours > 0) {
    return `${timeLeft.hours} ч ${timeLeft.minutes} мин`;
  }

  return `${timeLeft.minutes} мин ${timeLeft.seconds} с`;
}
