"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  color = "hsl(var(--chart-1))",
}: ExerciseChartProps) {
  if (data.length === 0) return null;

  const chartConfig = {
    value: {
      label: "Max Weight",
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Your max weight over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
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

const nutritionConfig = {
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-1))",
  },
  protein: {
    label: "Protein",
    color: "hsl(var(--chart-2))",
  },
  carbs: {
    label: "Carbs",
    color: "hsl(var(--chart-3))",
  },
  fat: {
    label: "Fat",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function NutritionProgressChart({ data }: NutritionChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Calories</CardTitle>
          <CardDescription>Total calories consumed per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={nutritionConfig} className="h-[200px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="calories"
                fill="var(--color-calories)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Macros Over Time</CardTitle>
          <CardDescription>Protein, carbs, and fat breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={nutritionConfig} className="h-[250px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillProtein" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-protein)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-protein)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillCarbs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-carbs)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-carbs)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-fat)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-fat)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => `${v}g`}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="carbs"
                stackId="1"
                stroke="var(--color-carbs)"
                fill="url(#fillCarbs)"
              />
              <Area
                type="monotone"
                dataKey="protein"
                stackId="1"
                stroke="var(--color-protein)"
                fill="url(#fillProtein)"
              />
              <Area
                type="monotone"
                dataKey="fat"
                stackId="1"
                stroke="var(--color-fat)"
                fill="url(#fillFat)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}