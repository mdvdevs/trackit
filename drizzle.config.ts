import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

const root = process.cwd();
const envPath = resolve(root, ".env");
const envLocalPath = resolve(root, ".env.local");
if (existsSync(envPath)) {
  loadEnv({ path: envPath });
}
if (existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, override: true });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.trim()) {
  throw new Error(
    "DATABASE_URL is missing. In the project root (next to package.json), set a line in .env.local exactly like:\n" +
      "DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require\n" +
      "(no spaces around =; the whole URL is the value after the first =)"
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
