"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  onToggle,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="rounded-full h-12 w-12 min-h-12 min-w-12"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      <Button
        onClick={onToggle}
        size="lg"
        className="rounded-full h-14 w-14 min-h-14 min-w-14"
      >
        {isRunning ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-0.5" />
        )}
      </Button>
    </div>
  );
}
