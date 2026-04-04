"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Meal {
  description: string;
  mealLabel: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface NutritionTableProps {
  meals: Meal[];
}

export function NutritionTable({ meals }: NutritionTableProps) {
  if (meals.length === 0) return null;

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meal</TableHead>
            <TableHead className="text-right text-xs">Cal</TableHead>
            <TableHead className="text-right text-xs">Protein</TableHead>
            <TableHead className="text-right text-xs">Carbs</TableHead>
            <TableHead className="text-right text-xs">Fat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meals.map((meal, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {meal.mealLabel}
                  </Badge>
                  <p className="text-xs">{meal.description}</p>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {meal.totalCalories}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {meal.totalProtein.toFixed(1)}g
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {meal.totalCarbs.toFixed(1)}g
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {meal.totalFat.toFixed(1)}g
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold text-sm">Total</TableCell>
            <TableCell className="text-right font-mono text-xs font-bold">
              {totals.calories}
            </TableCell>
            <TableCell className="text-right font-mono text-xs font-bold">
              {totals.protein.toFixed(1)}g
            </TableCell>
            <TableCell className="text-right font-mono text-xs font-bold">
              {totals.carbs.toFixed(1)}g
            </TableCell>
            <TableCell className="text-right font-mono text-xs font-bold">
              {totals.fat.toFixed(1)}g
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
