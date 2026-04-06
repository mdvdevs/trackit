import { generateText } from "ai";
import { google } from "@ai-sdk/google";
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
  // #region agent log
  fetch("http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9fc509",
    },
    body: JSON.stringify({
      sessionId: "9fc509",
      location: "parse-exercises.ts:entry",
      message: "parseExercises called",
      data: {
        rawTextLen: rawText.length,
        hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
      timestamp: Date.now(),
      runId: "pre-fix",
      hypothesisId: "H4",
    }),
  }).catch(() => {});
  // #endregion

  let text: string;
  try {
    const out = await generateText({
      model: google("gemini-2.5-flash-lite"),
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
    text = out.text;
    // #region agent log
    fetch("http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9fc509",
      },
      body: JSON.stringify({
        sessionId: "9fc509",
        location: "parse-exercises.ts:afterGenerate",
        message: "generateText ok",
        data: { textLen: text?.length ?? 0 },
        timestamp: Date.now(),
        runId: "pre-fix",
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
  } catch (e) {
    const err = e as { name?: string; message?: string };
    // #region agent log
    fetch("http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9fc509",
      },
      body: JSON.stringify({
        sessionId: "9fc509",
        location: "parse-exercises.ts:generateError",
        message: "generateText failed",
        data: {
          errName: err?.name,
          errMsg: err?.message?.slice(0, 400),
        },
        timestamp: Date.now(),
        runId: "pre-fix",
        hypothesisId: "H4",
      }),
    }).catch(() => {});
    // #endregion
    throw e;
  }

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
