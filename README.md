# TrackIt - Gym & Diet Tracker

A mobile-first PWA for tracking workouts and nutrition using plain text. AI parses your natural language entries into structured data and shows your progress over time.

## Setup

### 1. Create a Neon Postgres Database (free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string

### 2. Set up Google OAuth (free)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or use existing)
3. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
4. Application type: "Web application"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret

### 3. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add some credits ($5 is plenty — GPT-4o-mini is extremely cheap)

### 4. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
AUTH_SECRET=run-npx-auth-secret-to-generate
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
OPENAI_API_KEY=sk-your-openai-api-key
```

**`AUTH_SECRET` is required in production.** In local development, if it is missing, the app uses a temporary fallback so Google sign-in still works; you will see a warning in the terminal. Set a real secret for stable sessions and for deploys. Without it in production, you get `[auth][error] MissingSecret` and **500** on `/api/auth/signin/google`.

Generate a secret (use this — it does not install the wrong npm package):

```bash
openssl rand -base64 32
```

Paste the output into `.env.local` as `AUTH_SECRET=...`.

**Note:** Running `npx auth secret` can install an unrelated package named `auth` (Better Auth) and print `BETTER_AUTH_SECRET`. This app expects **`AUTH_SECRET`** for Auth.js. Either rename that line to `AUTH_SECRET=...`, or leave it as `BETTER_AUTH_SECRET` — TrackIt will also read that variable as a fallback.

### 5. Push Database Schema

```bash
npx drizzle-kit push
```

If Google sign-in fails with `AdapterError` / Postgres `42P01` (undefined table), confirm you ran `db:push` against the same database as `DATABASE_URL`. The app wires `DrizzleAdapter` to the `users`, `accounts`, `sessions`, and `verification_tokens` tables from [`src/lib/db/schema.ts`](src/lib/db/schema.ts).

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To preview on your phone (same Wi-Fi):

```bash
# Find your computer's IP
ipconfig getifaddr en0
# Then open http://<your-ip>:3000 on your phone
```

## Features

- **Workout Log** — Type exercises in plain text, AI extracts sets/weights
- **Food Log** — Type meals in plain text, AI estimates calories and macros
- **Progress Charts** — Track exercise weight trends and nutrition over time
- **History** — Calendar view of past entries
- **PWA** — Install on your phone's home screen

## Tech Stack

- Next.js 16 (App Router)
- shadcn/ui + Tailwind CSS
- Vercel AI SDK + GPT-4o-mini
- Auth.js + Google OAuth
- Neon Postgres + Drizzle ORM
- Recharts
