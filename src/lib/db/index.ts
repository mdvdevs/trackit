import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. See .env.example for required environment variables."
  );
}

/**
 * Neon HTTP (`neon-http` + `neon()`) uses `fetch` to the Neon SQL-over-HTTP API. On some local
 * networks that fails with `TypeError: fetch failed` even though Postgres is reachable. The
 * WebSocket `Pool` driver avoids that path and matches Neon’s recommended Node.js setup.
 */
export const db = drizzle({
  connection: databaseUrl,
  ws,
  schema,
});
