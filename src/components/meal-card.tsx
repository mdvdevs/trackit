"use client";

import { Trash2, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MealCardProps {
  id: string;
  description: string;
  mealTime: string;
  mealLabel: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function MealCard({
  id,
  description,
  mealTime,
  mealLabel,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  onDelete,
  onEdit,
}: MealCardProps) {
  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="py-4 border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {mealLabel}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(mealTime)}
            </span>
          </div>
          <p className="text-sm font-medium">{description}</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{totalCalories} cal</span>
            <span className="font-mono">{totalProtein.toFixed(1)}g P</span>
            <span className="font-mono">{totalCarbs.toFixed(1)}g C</span>
            <span className="font-mono">{totalFat.toFixed(1)}g F</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => onEdit(id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
