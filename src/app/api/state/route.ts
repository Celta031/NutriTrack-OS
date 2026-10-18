import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed-data";
import { computeTomorrowMissing } from "@/lib/lookahead-alert";
import { BASE_RECIPES } from "@/lib/recipes";
import { NUTRITIONIST_CATALOG } from "@/lib/nutritionist-catalog";
import {
  getCurrentWeekBounds,
  syncWeeklyInventoryExpiration,
} from "@/lib/week-cycle";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();

    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login para acessar seus dados." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const dateParam = searchParams.get("date") || defaultDate;
    const monthYearParam =
      searchParams.get("monthYear") || dateParam.slice(0, 7);

    await ensureSeeded(monthYearParam, currentUser.id);

    // SPEC-09: Auto-reset boughtForWeek if ISO week has rolled over
    const expirationSync = await syncWeeklyInventoryExpiration(currentUser.id);
    const weekCycle = getCurrentWeekBounds();

    const [
      ingredients,
      mealTemplates,
      monthLogs,
      allUserLogs,
      config,
      notificationLogs,
    ] = await Promise.all([
      prisma.ingredient.findMany({
        where: { userId: currentUser.id },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.mealPlanTemplate.findMany({
        where: {
          userId: currentUser.id,
          monthYear: monthYearParam,
        },
        include: {
          ingredients: {
            include: { ingredient: true },
          },
        },
        orderBy: [{ dayOfWeek: "asc" }, { scheduledTime: "asc" }],
      }),
      prisma.dailyLog.findMany({
        where: {
          userId: currentUser.id,
          date: {
            startsWith: monthYearParam,
          },
        },
        include: {
          mealPlanTemplate: true,
        },
        orderBy: { loggedAt: "desc" },
      }),
      prisma.dailyLog.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          mealPlanTemplate: true,
        },
        orderBy: { loggedAt: "desc" },
      }),
      prisma.appConfig.findUnique({
        where: { userId: currentUser.id },
      }),
      prisma.notificationLog.findMany({
        where: { userId: currentUser.id },
        orderBy: { sentAt: "desc" },
        take: 15,
      }),
    ]);

    const referenceDate = new Date(`${dateParam}T12:00:00`);
    const tomorrowSummary = await computeTomorrowMissing(
      currentUser.id,
      referenceDate
    );

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
      user: currentUser,
      date: dateParam,
      monthYear: monthYearParam,
      weekCycle: {
        ...weekCycle,
        expiredResetCount: expirationSync.expiredResetCount,
      },
      ingredients: enrichedIngredients,
      mealTemplates,
      monthLogs,
      allUserLogs,
      config,
      notificationLogs,
      baseRecipes: BASE_RECIPES,
      nutritionistCatalog: NUTRITIONIST_CATALOG,
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
