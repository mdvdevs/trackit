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
import { cn } from "@/lib/utils";

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
  /** When set, totals are compared for limit styling */
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
}

export function NutritionTable({
  meals,
  dailyCalorieTarget,
  dailyProteinTarget,
}: NutritionTableProps) {
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

  const overCalories =
    dailyCalorieTarget != null && totals.calories > dailyCalorieTarget;
  const underProtein =
    dailyProteinTarget != null && totals.protein < dailyProteinTarget;

  return (
    <div className="rounded-lg border">
      {dailyCalorieTarget != null && dailyProteinTarget != null ? (
        <div className="border-b px-3 py-2 text-xs text-muted-foreground">
          Targets for this day:{" "}
          <span className="font-medium text-foreground">
            {dailyCalorieTarget} kcal
          </span>
          ,{" "}
          <span className="font-medium text-foreground">
            {dailyProteinTarget} g protein
          </span>
          . Red = over calorie budget or under protein goal.
        </div>
      ) : null}
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
            <TableCell
              className={cn(
                "text-right font-mono text-xs font-bold",
                overCalories && "text-destructive"
              )}
            >
              {totals.calories}
            </TableCell>
            <TableCell
              className={cn(
                "text-right font-mono text-xs font-bold",
                underProtein && "text-destructive"
              )}
            >
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
