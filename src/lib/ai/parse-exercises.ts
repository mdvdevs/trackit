import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const exerciseSchema = z.object({
  exercises: z.array(
    z.object({
      name: z.string().describe("Clean exercise name, e.g. 'Bench Press'"),
      normalizedName: z
        .string()
        .describe("Lowercase snake_case, e.g. 'bench_press'"),
      sets: z.array(
        z.object({
          weight: z.number().describe("Weight used for this set"),
          unit: z.enum(["kg", "lbs"]).describe("Weight unit"),
          reps: z
            .number()
            .optional()
            .describe("Number of reps if mentioned, otherwise omit"),
        })
      ),
    })
  ),
});

export type ParsedExercise = z.infer<typeof exerciseSchema>["exercises"][number];

export async function parseExercises(rawText: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: exerciseSchema,
    prompt: `Parse the following workout notes into structured exercise data. Each line or sentence likely describes one exercise with its sets/weights. If reps are mentioned, include them. If only weights are listed (e.g. "40kg, 45kg, 50kg"), each is a separate set. Assume "kg" if no unit specified.

Workout notes:
${rawText}`,
  });

  return object.exercises;
}
