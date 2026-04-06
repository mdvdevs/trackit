import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { extractJsonObject } from "@/lib/ai/extract-json";
import { assertGoogleGenerativeAiKey } from "@/lib/ai/assert-gemini-key";

const mealResultSchema = z.object({
  meals: z.array(
    z.object({
      description: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          quantity: z.string(),
          calories: z.coerce.number(),
          protein: z.coerce.number(),
          carbs: z.coerce.number(),
          fat: z.coerce.number(),
        })
      ),
    })
  ),
});

export type ParsedMeal = z.infer<typeof mealResultSchema>["meals"][number];

export async function parseMeals(rawText: string) {
  assertGoogleGenerativeAiKey();

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    prompt: `Parse food/diet notes into structured meals. The user may write in any casual format (lines, prose, lists). Estimate calories, protein (g), carbs (g), fat (g) per line item; be reasonable for Indian and international foods.

Output ONLY one JSON object, no markdown, no commentary.
Shape: {"meals":[{"description":"string","items":[{"name":"string","quantity":"string","calories":number,"protein":number,"carbs":number,"fat":number}]}]}

Food notes:
${rawText}`,
  });

  let data: unknown;
  try {
    data = extractJsonObject(text);
  } catch {
    throw new Error("Could not read JSON from the model response. Try again.");
  }

  const result = mealResultSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Food JSON did not match the expected shape: ${result.error.message}`
    );
  }

  return result.data.meals;
}
