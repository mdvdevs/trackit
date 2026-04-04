# TrackIt - Component Reference

Use this file to quickly find the component you want to change. Tell the AI "change the `MealCard` component" and it will know exactly which file to edit.

## App Pages

| Page | File | Description |
|------|------|-------------|
| Login | `src/app/login/page.tsx` | Google sign-in screen |
| Workout Log | `src/app/(app)/workout/page.tsx` | Main workout note-taking screen with AI parsing |
| Food Log | `src/app/(app)/food/page.tsx` | Food note-taking screen with time picker and AI parsing |
| Progress | `src/app/(app)/progress/page.tsx` | Charts showing workout and nutrition trends |
| History | `src/app/(app)/history/page.tsx` | Calendar view of past days with drill-down |

## Shared Components

| Component | File | Used In | Description |
|-----------|------|---------|-------------|
| BottomNav | `src/components/bottom-nav.tsx` | App Layout | 4-tab navigation bar at bottom (Workout, Food, Progress, History) |
| DateHeader | `src/components/date-header.tsx` | Workout, Food | Shows current date with left/right arrows and calendar picker |
| NoteEditor | `src/components/note-editor.tsx` | Workout, Food | Apple Notes-style text area with lined background |
| TimePicker | `src/components/time-picker.tsx` | Food | Inline time input for meal entries |
| ExerciseCard | `src/components/exercise-card.tsx` | Workout, History | Displays a parsed exercise with sets as badges |
| MealCard | `src/components/meal-card.tsx` | Food, History | Displays a parsed meal with time, label, and nutrition |
| WorkoutTable | `src/components/workout-table.tsx` | Workout | Summary table of exercises with sets and volume |
| NutritionTable | `src/components/nutrition-table.tsx` | Food | Summary table of meals with calorie/macro totals |
| ExerciseProgressChart | `src/components/progress-chart.tsx` | Progress | Line chart for exercise weight progression |
| NutritionProgressChart | `src/components/progress-chart.tsx` | Progress | Bar + line charts for calories and macros |

## UI Components (shadcn/ui)

These live in `src/components/ui/` and are installed via shadcn CLI. You own the source code.

| Component | File |
|-----------|------|
| Button | `src/components/ui/button.tsx` |
| Card | `src/components/ui/card.tsx` |
| Input | `src/components/ui/input.tsx` |
| Textarea | `src/components/ui/textarea.tsx` |
| Tabs | `src/components/ui/tabs.tsx` |
| Table | `src/components/ui/table.tsx` |
| Badge | `src/components/ui/badge.tsx` |
| Separator | `src/components/ui/separator.tsx` |
| ScrollArea | `src/components/ui/scroll-area.tsx` |
| Popover | `src/components/ui/popover.tsx` |
| Calendar | `src/components/ui/calendar.tsx` |
| Skeleton | `src/components/ui/skeleton.tsx` |
| Avatar | `src/components/ui/avatar.tsx` |
| Sheet | `src/components/ui/sheet.tsx` |
| AlertDialog | `src/components/ui/alert-dialog.tsx` |

## Backend / Logic

| Module | File | Description |
|--------|------|-------------|
| DB Schema | `src/lib/db/schema.ts` | Drizzle ORM table definitions (users, entries, exercises, meals) |
| DB Connection | `src/lib/db/index.ts` | Neon Postgres connection setup |
| Auth Config | `src/lib/auth.ts` | NextAuth (Auth.js) with Google OAuth + Drizzle adapter |
| Auth Route | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js API route handler |
| Parse Exercises | `src/lib/ai/parse-exercises.ts` | AI parsing for workout text (GPT-4o-mini) |
| Parse Meals | `src/lib/ai/parse-meals.ts` | AI parsing for food text with nutrition estimation |
| Workout Actions | `src/lib/actions/workout-actions.ts` | Server actions: save, get, delete workouts |
| Food Actions | `src/lib/actions/food-actions.ts` | Server actions: save, get, delete meals |
| Progress Actions | `src/lib/actions/progress-actions.ts` | Server actions: exercise/nutrition progress, history |

## Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `drizzle.config.ts` | Drizzle ORM migration config |
| `components.json` | shadcn/ui configuration |
| `public/manifest.json` | PWA manifest (app name, icons, theme) |
| `.env.example` | Required environment variables template |
