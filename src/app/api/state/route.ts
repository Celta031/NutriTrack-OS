import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";
import { computeTomorrowMissing } from "@/lib/lookahead-alert";
import { BASE_RECIPES } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dateParam = searchParams.get("date") || defaultDate;
    const monthYearParam = searchParams.get("monthYear") || dateParam.slice(0, 7);

    await ensureSeeded(monthYearParam);

    const [ingredients, mealTemplates, monthLogs, config, notificationLogs] =
      await Promise.all([
        prisma.ingredient.findMany({
          orderBy: [{ category: "asc" }, { name: "asc" }],
        }),
        prisma.mealPlanTemplate.findMany({
          where: { monthYear: monthYearParam },
          include: {
            ingredients: {
              include: { ingredient: true },
            },
          },
          orderBy: [{ dayOfWeek: "asc" }, { scheduledTime: "asc" }],
        }),
        prisma.dailyLog.findMany({
          where: {
            date: {
              startsWith: monthYearParam,
            },
          },
          include: {
            mealPlanTemplate: true,
          },
          orderBy: { loggedAt: "desc" },
        }),
        prisma.appConfig.findUnique({
          where: { id: "singleton" },
        }),
        prisma.notificationLog.findMany({
          orderBy: { sentAt: "desc" },
          take: 15,
        }),
      ]);

    const referenceDate = new Date(`${dateParam}T12:00:00`);
    const tomorrowSummary = await computeTomorrowMissing(referenceDate);

    // Map tomorrow's requirements across ALL ingredients (even stocked ones) so the UI knows which ingredients are used tomorrow
    const tomorrowUsageMap = new Map<
      string,
      { quantity: number; meals: string[] }
    >();
    for (const tpl of tomorrowSummary.tomorrowTemplates) {
      for (const link of tpl.ingredients) {
        const prev = tomorrowUsageMap.get(link.ingredientId) || {
          quantity: 0,
          meals: [],
        };
        prev.quantity += link.quantityNeeded;
        if (!prev.meals.includes(tpl.title)) {
          prev.meals.push(tpl.title);
        }
        tomorrowUsageMap.set(link.ingredientId, prev);
      }
    }

    const enrichedIngredients = ingredients.map((ing) => {
      const usage = tomorrowUsageMap.get(ing.id);
      const usedTomorrow = Boolean(usage && usage.quantity > 0);
      const missingForTomorrow =
        usedTomorrow && !ing.inStock && !ing.boughtForWeek;
      return {
        ...ing,
        usedTomorrow,
        missingForTomorrow,
        tomorrowQuantity: usage?.quantity || 0,
        tomorrowMeals: usage?.meals || [],
      };
    });

    return NextResponse.json({
      date: dateParam,
      monthYear: monthYearParam,
      ingredients: enrichedIngredients,
      mealTemplates,
      monthLogs,
      config,
      notificationLogs,
      baseRecipes: BASE_RECIPES,
      tomorrowSummary: {
        tomorrowDate: tomorrowSummary.tomorrowDate,
        tomorrowDayOfWeek: tomorrowSummary.tomorrowDayOfWeek,
        tomorrowDayName: tomorrowSummary.tomorrowDayName,
        totalMealsTomorrow: tomorrowSummary.tomorrowTemplates.length,
        missingItems: tomorrowSummary.missingItems,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/state error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
