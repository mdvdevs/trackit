import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { extractJsonObject } from "@/lib/ai/extract-json";

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
  // #region agent log
  fetch("http://127.0.0.1:7554/ingest/b16d169d-d049-48b1-8399-b22e05b2c642", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9fc509",
    },
    body: JSON.stringify({
      sessionId: "9fc509",
      location: "parse-meals.ts:entry",
      message: "parseMeals called",
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
      prompt: `Parse food/diet notes into structured meals. The user may write in any casual format (lines, prose, lists). Estimate calories, protein (g), carbs (g), fat (g) per line item; be reasonable for Indian and international foods.

Output ONLY one JSON object, no markdown, no commentary.
Shape: {"meals":[{"description":"string","items":[{"name":"string","quantity":"string","calories":number,"protein":number,"carbs":number,"fat":number}]}]}

Food notes:
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
        location: "parse-meals.ts:afterGenerate",
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
        location: "parse-meals.ts:generateError",
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

  const result = mealResultSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Food JSON did not match the expected shape: ${result.error.message}`
    );
  }

  return result.data.meals;
}
