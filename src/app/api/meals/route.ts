import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { recalculateIngredientNeeds } from "@/lib/seed-data";
import { NUTRITIONIST_CATALOG } from "@/lib/nutritionist-catalog";

interface IncomingIngredientInput {
  ingredientId?: string;
  name?: string;
  category?: string;
  unit?: string;
  purchaseFrequency?: string;
  quantityNeeded: number;
}

/**
 * Resolves a list of ingredient links (either by existing ingredientId or by name/category/unit
 * from the Nutritionist Catalog or Custom Meal Modal), creating any new catalog ingredients
 * automatically for the user.
 */
async function resolveUserIngredientLinks(
  userId: string,
  items: IncomingIngredientInput[]
): Promise<{ ingredientId: string; quantityNeeded: number }[]> {
  const resolved: { ingredientId: string; quantityNeeded: number }[] = [];

  for (const item of items) {
    const qty = Number(item.quantityNeeded);
    if (!qty || qty <= 0) continue;

    if (item.ingredientId) {
      const existingById = await prisma.ingredient.findFirst({
        where: { id: item.ingredientId, userId },
      });
      if (existingById) {
        resolved.push({
          ingredientId: existingById.id,
          quantityNeeded: qty,
        });
        continue;
      }
    }

    if (item.name && item.name.trim() !== "") {
      const cleanName = item.name.trim();
      let ing = await prisma.ingredient.findUnique({
        where: {
          userId_name: {
            userId,
            name: cleanName,
          },
        },
      });

      if (!ing) {
        ing = await prisma.ingredient.create({
          data: {
            userId,
            name: cleanName,
            category: item.category || "Mercearia",
            unit: item.unit || "g",
            purchaseFrequency: item.purchaseFrequency || "WEEKLY",
            weeklyNeed: qty,
            monthlyNeed: qty * 4,
            inStock: false,
            boughtForWeek: false,
            notes: "Adicionado via Cardápio / Catálogo da Nutricionista",
          },
        });
      }

      resolved.push({
        ingredientId: ing.id,
        quantityNeeded: qty,
      });
    }
  }

  // Deduplicate by ingredientId in case the same ingredient was added twice in one meal
  const dedupMap = new Map<string, number>();
  for (const r of resolved) {
    dedupMap.set(r.ingredientId, (dedupMap.get(r.ingredientId) || 0) + r.quantityNeeded);
  }

  return Array.from(dedupMap.entries()).map(([ingredientId, quantityNeeded]) => ({
    ingredientId,
    quantityNeeded,
  }));
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      catalogOptionId,
      monthYear,
      dayOfWeek,
      targetDays, // Optional array of days [0..6] to replicate this meal option across multiple days
      mealType,
      scheduledTime,
      title,
      description,
      isOptional,
      ingredients, // Array of IncomingIngredientInput
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing mealPlanTemplate id" },
        { status: 400 }
      );
    }

    const existing = await prisma.mealPlanTemplate.findFirst({
      where: { id, userId: currentUser.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Meal template not found" },
        { status: 404 }
      );
    }

    // Check if applying an official Nutritionist Catalog option (SPEC-08)
    const catalogOption = catalogOptionId
      ? NUTRITIONIST_CATALOG.find((opt) => opt.id === catalogOptionId)
      : undefined;

    const finalTitle = catalogOption ? catalogOption.title : title || existing.title;
    const finalDesc = catalogOption
      ? catalogOption.description
      : typeof description === "string"
      ? description
      : existing.description;
    const finalTime = catalogOption
      ? catalogOption.scheduledTime
      : scheduledTime || existing.scheduledTime;
    const finalOptional =
      catalogOption?.isOptional !== undefined
        ? catalogOption.isOptional
        : typeof isOptional === "boolean"
        ? isOptional
        : existing.isOptional;
    const finalMealType = catalogOption
      ? catalogOption.mealType
      : mealType || existing.mealType;
    const finalMonthYear = monthYear || existing.monthYear;

    const rawIngredients: IncomingIngredientInput[] | undefined = catalogOption
      ? catalogOption.ingredients
      : Array.isArray(ingredients)
      ? ingredients
      : undefined;

    const resolvedLinks = rawIngredients
      ? await resolveUserIngredientLinks(currentUser.id, rawIngredients)
      : undefined;

    // Determine which days of the week to update (single day or multiple targetDays)
    const daysToApply: number[] =
      Array.isArray(targetDays) && targetDays.length > 0
        ? Array.from(new Set(targetDays.map((d: number) => Number(d))))
        : [typeof dayOfWeek === "number" ? dayOfWeek : existing.dayOfWeek];

    let primaryUpdated = existing;

    for (const targetDow of daysToApply) {
      let targetTemplate =
        targetDow === existing.dayOfWeek
          ? existing
          : await prisma.mealPlanTemplate.findFirst({
              where: {
                userId: currentUser.id,
                monthYear: finalMonthYear,
                dayOfWeek: targetDow,
                mealType: finalMealType,
              },
            });

      if (targetTemplate) {
        targetTemplate = await prisma.mealPlanTemplate.update({
          where: { id: targetTemplate.id },
          data: {
            scheduledTime: finalTime,
            title: finalTitle,
            description: finalDesc,
            isOptional: finalOptional,
            dayOfWeek: targetDow,
            mealType: finalMealType,
          },
        });
      } else {
        targetTemplate = await prisma.mealPlanTemplate.create({
          data: {
            userId: currentUser.id,
            monthYear: finalMonthYear,
            dayOfWeek: targetDow,
            mealType: finalMealType,
            scheduledTime: finalTime,
            title: finalTitle,
            description: finalDesc,
            isOptional: finalOptional,
          },
        });
      }

      if (targetDow === existing.dayOfWeek) {
        primaryUpdated = targetTemplate;
      }

      if (resolvedLinks) {
        await prisma.mealPlanIngredient.deleteMany({
          where: { mealPlanTemplateId: targetTemplate.id },
        });

        for (const link of resolvedLinks) {
          await prisma.mealPlanIngredient.create({
            data: {
              mealPlanTemplateId: targetTemplate.id,
              ingredientId: link.ingredientId,
              quantityNeeded: link.quantityNeeded,
            },
          });
        }
      }
    }

    await recalculateIngredientNeeds(currentUser.id, finalMonthYear);

    return NextResponse.json({
      mealTemplate: primaryUpdated,
      appliedDaysCount: daysToApply.length,
    });
  } catch (error: unknown) {
    console.error("PUT /api/meals error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update meal template",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      monthYear,
      dayOfWeek,
      targetDays,
      mealType,
      scheduledTime,
      title,
      description,
      isOptional,
      ingredients,
    } = body;

    const resolvedLinks = Array.isArray(ingredients)
      ? await resolveUserIngredientLinks(currentUser.id, ingredients)
      : [];

    const daysToCreate: number[] =
      Array.isArray(targetDays) && targetDays.length > 0
        ? Array.from(new Set(targetDays.map((d: number) => Number(d))))
        : [Number(dayOfWeek)];

    let firstCreated = null;

    for (const dow of daysToCreate) {
      const created = await prisma.mealPlanTemplate.create({
        data: {
          userId: currentUser.id,
          monthYear,
          dayOfWeek: dow,
          mealType,
          scheduledTime: scheduledTime || "12:00",
          title,
          description: description || "",
          isOptional: Boolean(isOptional),
        },
      });

      if (!firstCreated) firstCreated = created;

      for (const link of resolvedLinks) {
        await prisma.mealPlanIngredient.create({
          data: {
            mealPlanTemplateId: created.id,
            ingredientId: link.ingredientId,
            quantityNeeded: link.quantityNeeded,
          },
        });
      }
    }

    await recalculateIngredientNeeds(currentUser.id, monthYear);

    return NextResponse.json({ mealTemplate: firstCreated });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create meal template",
      },
      { status: 500 }
    );
  }
}
