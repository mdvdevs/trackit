"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface LineChartData {
  date: string;
  value: number;
  label?: string;
}

interface ExerciseChartProps {
  title: string;
  data: LineChartData[];
  unit?: string;
  color?: string;
}

export function ExerciseProgressChart({
  title,
  data,
  unit = "kg",
  color = "var(--color-chart-1)",
}: ExerciseChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis
            className="text-xs"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${v}${unit}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} ${unit}`, "Max Weight"]}
            labelFormatter={(label) => {
              const d = new Date(label);
              return d.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface MacroChartData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionChartProps {
  data: MacroChartData[];
}

export function NutritionProgressChart({ data }: NutritionChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Daily Calories</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
              }}
            />
            <Bar dataKey="calories" fill="var(--color-chart-1)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Macros Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}g`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
              }}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="carbs"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="fat"
              stroke="var(--color-chart-5)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
