"use client";

import { Card } from "@/components/ui/card";
import { AnimatedDigit } from "./animated-digit";

interface TimeSlotProps {
  value: number;
  label: string;
}

export function TimeSlot({ value, label }: TimeSlotProps) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm px-3 py-3 sm:px-6 sm:py-6 md:px-8 md:py-8 shadow-lg shadow-black/5 dark:shadow-white/5 w-full sm:w-auto">
        <div className="flex items-center justify-center gap-0.5 sm:gap-2">
          <AnimatedDigit value={tens} />
          <AnimatedDigit value={ones} />
        </div>
      </Card>
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
    </div>
  );
}
