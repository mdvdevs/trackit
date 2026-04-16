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
 * - **Vercel:** HTTP (`fetch`) — stable on serverless.
 * - **Local default:** WebSocket pool — some networks get `fetch failed` with Neon HTTP.
 * Override: `TRACKIT_NEON_DRIVER=http` or `=ws`.
 */
const driver = (() => {
  const o = process.env.TRACKIT_NEON_DRIVER?.toLowerCase();
  if (o === "http") return "http";
  if (o === "ws") return "ws";
  return process.env.VERCEL === "1" ? "http" : "ws";
})();

export const db =
  driver === "http"
    ? drizzleHttp(neon(databaseUrl), { schema })
    : drizzleWs({
        connection: databaseUrl,
        ws,
        schema,
      });
