/** Fails fast with a clear message when Gemini is not configured (common on Vercel). */
export function assertGoogleGenerativeAiKey() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it in Vercel → Project → Settings → Environment Variables (Production), then redeploy."
    );
  }
}
