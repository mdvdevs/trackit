"use client";

import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateHeader({ date, onDateChange }: DateHeaderProps) {
  const goToPreviousDay = () => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const isToday =
    format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="gap-2 text-base font-semibold">
            <CalendarIcon className="h-4 w-4" />
            {isToday ? "Today" : format(date, "EEE, d MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onDateChange(d)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextDay}
        disabled={isToday}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
