"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-mono focus:outline-none flex flex-wrap w-fit"
      />
    </div>
  );
}
