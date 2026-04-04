import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const mealSchema = z.object({
  meals: z.array(
    z.object({
      description: z
        .string()
        .describe("Short description of the meal as written by the user"),
      items: z.array(
        z.object({
          name: z.string().describe("Food item name"),
          quantity: z.string().describe("Amount/portion, e.g. '100g', '1 cup'"),
          calories: z.number().describe("Estimated calories (kcal)"),
          protein: z.number().describe("Estimated protein in grams"),
          carbs: z.number().describe("Estimated carbs in grams"),
          fat: z.number().describe("Estimated fat in grams"),
        })
      ),
    })
  ),
});

export type ParsedMeal = z.infer<typeof mealSchema>["meals"][number];

export async function parseMeals(rawText: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: mealSchema,
    prompt: `Parse the following food/diet notes into structured meal data. Each line or sentence describes a meal or food intake. Estimate the nutritional information (calories, protein, carbs, fat) based on your knowledge. Be accurate for common foods including Indian cuisine (dal, roti, rajma, rice, sabzi, etc.).

Food notes:
${rawText}`,
  });

  return object.meals;
}
