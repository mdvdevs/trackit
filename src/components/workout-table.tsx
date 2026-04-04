"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WorkoutTableProps {
  exercises: {
    name: string;
    sets: { weight: number; unit: string; reps?: number }[];
  }[];
}

export function WorkoutTable({ exercises }: WorkoutTableProps) {
  if (exercises.length === 0) return null;

  const maxSets = Math.max(...exercises.map((e) => e.sets.length));

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Exercise</TableHead>
            {Array.from({ length: maxSets }, (_, i) => (
              <TableHead key={i} className="text-center text-xs">
                Set {i + 1}
              </TableHead>
            ))}
            <TableHead className="text-right text-xs">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((ex, i) => {
            const volume = ex.sets.reduce(
              (sum, s) => sum + s.weight * (s.reps || 1),
              0
            );
            return (
              <TableRow key={i}>
                <TableCell className="font-medium text-sm">{ex.name}</TableCell>
                {Array.from({ length: maxSets }, (_, j) => (
                  <TableCell key={j} className="text-center font-mono text-xs">
                    {ex.sets[j]
                      ? `${ex.sets[j].weight}${ex.sets[j].unit}${
                          ex.sets[j].reps ? ` x${ex.sets[j].reps}` : ""
                        }`
                      : "—"}
                  </TableCell>
                ))}
                <TableCell className="text-right font-mono text-xs">
                  {volume}
                  {ex.sets[0]?.unit || "kg"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
