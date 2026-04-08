import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. See .env.example for required environment variables."
  );
}

/**
 * - **Vercel (VERCEL=1):** Neon SQL-over-HTTP via `fetch` — reliable on serverless; avoids bundling/runtime issues with `ws`.
 * - **Local:** WebSocket `Pool` helps when HTTP `fetch` to Neon fails on some networks (`TypeError: fetch failed`).
 * Override: `TRACKIT_NEON_DRIVER=http` or `=ws`.
 */
const driver =
  process.env.TRACKIT_NEON_DRIVER?.toLowerCase() === "ws"
    ? "ws"
    : process.env.TRACKIT_NEON_DRIVER?.toLowerCase() === "http"
      ? "http"
      : process.env.VERCEL === "1"
        ? "http"
        : "ws";

export const db =
  driver === "http"
    ? drizzleHttp(neon(databaseUrl), { schema })
    : drizzleWs({
        connection: databaseUrl,
        ws,
        schema,
      });
