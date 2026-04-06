"use client";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  id: string;
  name: string;
  sets: { weight: number; unit: string; reps?: number }[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function ExerciseCard({ id, name, sets, onDelete, onEdit }: ExerciseCardProps) {
  const totalVolume = sets.reduce((sum, set) => {
    return sum + set.weight * (set.reps || 1);
  }, 0);

  return (
    <div className="py-4 border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold">{name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {sets.map((set, i) => (
              <Badge key={i} variant="secondary" className="font-mono text-xs">
                {set.weight}
                {set.unit}
                {set.reps ? ` x ${set.reps}` : ""}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Volume: {totalVolume}
            {sets[0]?.unit || "kg"}
          </p>
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
