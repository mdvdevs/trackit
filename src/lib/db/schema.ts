import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  jsonb,
  integer,
  real,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const activityLevels = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const nutritionGoals = [
  "lose_weight",
  "maintain",
  "gain_muscle",
] as const;
export type NutritionGoal = (typeof nutritionGoals)[number];

/** Body stats + goal for daily calorie / protein targets (Mifflin–St Jeor + activity). */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  weightKg: real("weight_kg").notNull(),
  heightCm: real("height_cm").notNull(),
  waistCm: real("waist_cm"),
  sex: text("sex").notNull().$type<"male" | "female">(),
  age: integer("age").notNull(),
  activityLevel: text("activity_level").notNull().$type<ActivityLevel>(),
  goal: text("goal").notNull().$type<NutritionGoal>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  type: text("type").notNull().$type<"workout" | "food">(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  sets: jsonb("sets")
    .notNull()
    .$type<{ weight: number; unit: string; reps?: number }[]>(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => entries.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  items: jsonb("items")
    .notNull()
    .$type<
      {
        name: string;
        quantity: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }[]
    >(),
  totalCalories: integer("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFat: real("total_fat").notNull(),
  mealTime: text("meal_time").notNull(),
  mealLabel: text("meal_label")
    .notNull()
    .$type<"breakfast" | "lunch" | "dinner" | "snack">(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
