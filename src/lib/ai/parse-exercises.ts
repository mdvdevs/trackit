import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { extractJsonObject } from "@/lib/ai/extract-json";

const setSchema = z.object({
  weight: z.coerce.number(),
  unit: z.enum(["kg", "lbs"]),
  reps: z.coerce.number().optional().default(1),
});

const exerciseResultSchema = z.object({
  exercises: z.array(
    z.object({
      name: z.string(),
      normalizedName: z.string(),
      sets: z.array(setSchema),
    })
  ),
});

export type ParsedExercise = z.infer<typeof exerciseResultSchema>["exercises"][number];

/**
 * Free-form workout notes → structured exercises. Uses plain text generation + Zod validation
 * so OpenAI never receives a nested JSON Schema (avoids invalid_json_schema / Missing 'reps' errors).
 */
export async function parseExercises(rawText: string) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Extract workout data from free-form notes. The user may write in ANY style they want: numbered sets, prose, commas, kg/lbs, shorthand, typos, multiple exercises in one block, blank lines, etc.

Your job:
- Infer distinct exercises and, for each, a list of sets.
- Each set: weight (number), unit exactly "kg" or "lbs" (infer or default to kg), reps (number; if not stated, use 1).
- name: readable exercise title. normalizedName: lowercase snake_case for grouping (e.g. bench_press).

Output rules:
- Reply with ONLY one JSON object, no markdown fences, no explanation.
- Shape: {"exercises":[{"name":"...","normalizedName":"...","sets":[{"weight":15,"unit":"kg","reps":10}]}]}

User notes:
${rawText}`,
  });

  let data: unknown;
  try {
    data = extractJsonObject(text);
  } catch {
    throw new Error("Could not read JSON from the model response. Try again.");
  }

  const result = exerciseResultSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Workout JSON did not match the expected shape: ${result.error.message}`
    );
  }

  return result.data.exercises;
}
