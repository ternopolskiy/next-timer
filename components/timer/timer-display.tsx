"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeSlot } from "./time-slot";
import { TimerControls } from "./timer-controls";
import {
  calculateTimeLeft,
  type TimeLeft,
} from "@/lib/date/countdown";

interface TimerDisplayProps {
  targetDate: Date;
  isAllDay: boolean;
}

export function TimerDisplay({ targetDate, isAllDay }: TimerDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, targetDate]);

  const handleToggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    setIsRunning(true);
  }, [targetDate]);

  const isComplete = timeLeft.total <= 0;

  return (
    <div className="flex flex-col items-center gap-8 sm:gap-12">
      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-4 md:gap-6">
        <TimeSlot value={timeLeft.days} label="Дней" />
        <TimeSlot value={timeLeft.hours} label="Часов" />
        <TimeSlot value={timeLeft.minutes} label="Минут" />
        <TimeSlot value={timeLeft.seconds} label="Секунд" />
      </div>

      {isComplete && (
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
            {isAllDay ? "Событие наступило!" : "Время пришло!"}
          </p>
        </div>
      )}

      <TimerControls
        isRunning={isRunning && !isComplete}
        onToggle={handleToggle}
        onReset={handleReset}
      />
    </div>
  );
}
