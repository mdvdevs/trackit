"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { entries, meals, customFoods } from "@/lib/db/schema";
import { parseMeals } from "@/lib/ai/parse-meals";
import { eq, and, desc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_FOODS = [
  // Grains & staples
  "Rice", "Brown Rice", "Roti", "Paratha", "Naan", "Bread", "Brown Bread",
  "Oats", "Oatmeal", "Poha", "Upma", "Pasta", "Noodles", "Maggi",
  "Cornflakes", "Muesli", "Quinoa", "Pav", "Dosa", "Idli", "Uttapam",
  "Appam", "Puri", "Bhatura", "Kulcha", "Thepla",

  // Dal & legumes
  "Dal", "Toor Dal", "Moong Dal", "Masoor Dal", "Chana Dal", "Urad Dal",
  "Rajma", "Chole", "Sambar", "Rasam", "Sprouts", "Moong Sprouts",
  "Black Beans", "Kidney Beans", "Lentil Soup",

  // Eggs
  "Egg", "Boiled Egg", "Omelette", "Scrambled Eggs", "Egg Bhurji",
  "Fried Egg", "Egg White",

  // Dairy
  "Milk", "Cow Milk", "Buffalo Milk", "Toned Milk", "Skimmed Milk",
  "Curd", "Yogurt", "Greek Yogurt", "Lassi", "Chaas / Buttermilk",
  "Paneer", "Cheese", "Cottage Cheese", "Butter", "Ghee", "Cream",
  "Whey Protein",

  // Chicken & meat
  "Chicken Breast", "Chicken Curry", "Chicken Tikka", "Tandoori Chicken",
  "Chicken Biryani", "Butter Chicken", "Chicken Thigh",
  "Mutton Curry", "Keema", "Fish Curry", "Fish Fry", "Prawn Curry",

  // Vegetables
  "Aloo Gobi", "Aloo Matar", "Bhindi", "Palak Paneer", "Matar Paneer",
  "Mixed Veg", "Baingan Bharta", "Lauki", "Tinda", "Cabbage Sabzi",
  "Beans Sabzi", "Salad", "Cucumber", "Tomato", "Carrot", "Beetroot",

  // Fruits
  "Banana", "Apple", "Mango", "Orange", "Papaya", "Watermelon",
  "Grapes", "Pomegranate", "Guava", "Chiku", "Pineapple", "Kiwi",
  "Strawberry", "Dates", "Coconut",

  // Snacks
  "Sandwich", "Veg Sandwich", "Grilled Sandwich", "Samosa", "Pakora",
  "Vada Pav", "Pav Bhaji", "Chaat", "Bhel Puri", "Pani Puri",
  "Dhokla", "Khandvi", "Cutlet", "Spring Roll", "Momos",

  // Nuts & seeds
  "Almonds", "Cashews", "Walnuts", "Peanuts", "Peanut Butter",
  "Flax Seeds", "Chia Seeds", "Sunflower Seeds", "Mixed Nuts",

  // Beverages
  "Tea", "Coffee", "Black Coffee", "Green Tea", "Protein Shake",
  "Smoothie", "Coconut Water", "Lemon Water", "Juice",

  // Rice dishes
  "Biryani", "Veg Biryani", "Pulao", "Khichdi", "Jeera Rice",
  "Fried Rice", "Lemon Rice", "Curd Rice",

  // Sweets & desserts
  "Gulab Jamun", "Rasgulla", "Kheer", "Halwa", "Ladoo", "Jalebi",
  "Ice Cream", "Dark Chocolate",
];

function getMealLabel(
  time: string
): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 18) return "snack";
  return "dinner";
}

function normalize(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

// ---------------------------------------------------------------------------
// Suggestions: custom foods + past meal history + defaults
// ---------------------------------------------------------------------------

export async function getFoodSuggestions() {
  const session = await auth();
  if (!session?.user?.id) return DEFAULT_FOODS;

  const [historyRows, customRows] = await Promise.all([
    db
      .selectDistinct({ description: meals.description })
      .from(meals)
      .where(eq(meals.userId, session.user.id))
      .orderBy(meals.description),
    db
      .select({ name: customFoods.name })
      .from(customFoods)
      .where(eq(customFoods.userId, session.user.id))
      .orderBy(customFoods.name),
  ]);

  const merged = new Map<string, string>();
  for (const n of DEFAULT_FOODS) merged.set(normalize(n), n);
  for (const r of historyRows) merged.set(normalize(r.description), r.description);
  for (const r of customRows) merged.set(normalize(r.name), r.name);

  return [...merged.values()].sort((a, b) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// DB-first lookup: try to resolve a food from the custom_foods table
// ---------------------------------------------------------------------------

async function resolveFromCustomFoods(
  userId: string,
  foodName: string,
  quantityStr: string
) {
  const rows = await db
    .select()
    .from(customFoods)
    .where(
      and(
        eq(customFoods.userId, userId),
        ilike(customFoods.normalizedName, normalize(foodName))
      )
    )
    .limit(1);

  if (rows.length === 0) return null;

  const food = rows[0];
  const servings = parseServings(quantityStr);

  return {
    description: foodName,
    items: [
      {
        name: food.name,
        quantity: quantityStr,
        calories: Math.round(food.caloriesPerServing * servings),
        protein: Math.round(food.proteinPerServing * servings * 10) / 10,
        carbs: Math.round(food.carbsPerServing * servings * 10) / 10,
        fat: Math.round(food.fatPerServing * servings * 10) / 10,
      },
    ],
  };
}

/** Best-effort numeric extraction from strings like "2 bowls", "1.5", "200g" */
function parseServings(q: string): number {
  const match = q.match(/[\d.]+/);
  if (!match) return 1;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

// ---------------------------------------------------------------------------
// Save food entry: DB first → AI fallback
// ---------------------------------------------------------------------------

export async function saveFoodEntry(
  foodName: string,
  quantityStr: string,
  date: string,
  mealTime: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const rawText = `${quantityStr} ${foodName}`;

  const dbResult = await resolveFromCustomFoods(
    session.user.id,
    foodName,
    quantityStr
  );

  const parsed = dbResult ? [dbResult] : await parseMeals(rawText);

  const [entry] = await db
    .insert(entries)
    .values({
      userId: session.user.id,
      rawText,
      type: "food",
      date,
    })
    .returning();

  const mealLabel = getMealLabel(mealTime);

  const mealRows = parsed.map((meal) => {
    const totalCalories = meal.items.reduce((sum, i) => sum + i.calories, 0);
    const totalProtein = meal.items.reduce((sum, i) => sum + i.protein, 0);
    const totalCarbs = meal.items.reduce((sum, i) => sum + i.carbs, 0);
    const totalFat = meal.items.reduce((sum, i) => sum + i.fat, 0);

    return {
      entryId: entry.id,
      userId: session.user!.id!,
      description: meal.description,
      items: meal.items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealTime,
      mealLabel,
      date,
    };
  });

  if (mealRows.length > 0) {
    await db.insert(meals).values(mealRows);
  }

  revalidatePath("/food");
  return { entry, meals: parsed, source: dbResult ? "db" : "ai" as const };
}

// ---------------------------------------------------------------------------
// Save a custom food for future DB-first resolution
// ---------------------------------------------------------------------------

export async function saveCustomFood(data: {
  name: string;
  servingLabel: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const [row] = await db
    .insert(customFoods)
    .values({
      userId: session.user.id,
      name: data.name,
      normalizedName: normalize(data.name),
      servingLabel: data.servingLabel,
      caloriesPerServing: data.caloriesPerServing,
      proteinPerServing: data.proteinPerServing,
      carbsPerServing: data.carbsPerServing,
      fatPerServing: data.fatPerServing,
    })
    .returning();

  revalidatePath("/food");
  return row;
}

// ---------------------------------------------------------------------------
// Get user's custom foods (for management UI)
// ---------------------------------------------------------------------------

export async function getCustomFoods() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db
    .select()
    .from(customFoods)
    .where(eq(customFoods.userId, session.user.id))
    .orderBy(customFoods.name);
}

export async function deleteCustomFood(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(customFoods)
    .where(
      and(eq(customFoods.id, id), eq(customFoods.userId, session.user.id))
    );
  revalidatePath("/food");
}

// ---------------------------------------------------------------------------
// Existing queries
// ---------------------------------------------------------------------------

export async function getMealsByDate(date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, session.user.id), eq(meals.date, date)))
    .orderBy(desc(meals.createdAt));
}

export async function deleteMeal(mealId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, session.user.id)));
  revalidatePath("/food");
}
