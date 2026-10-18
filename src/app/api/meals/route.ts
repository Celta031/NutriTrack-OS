import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { recalculateIngredientNeeds } from "@/lib/seed-data";

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      monthYear,
      dayOfWeek,
      mealType,
      scheduledTime,
      title,
      description,
      isOptional,
      ingredients, // Array of { ingredientId: string, quantityNeeded: number }
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

    const updated = await prisma.mealPlanTemplate.update({
      where: { id: existing.id },
      data: {
        ...(scheduledTime ? { scheduledTime } : {}),
        ...(title ? { title } : {}),
        ...(typeof description === "string" ? { description } : {}),
        ...(typeof isOptional === "boolean" ? { isOptional } : {}),
        ...(typeof dayOfWeek === "number" ? { dayOfWeek } : {}),
        ...(mealType ? { mealType } : {}),
      },
    });

    if (Array.isArray(ingredients)) {
      await prisma.mealPlanIngredient.deleteMany({
        where: { mealPlanTemplateId: existing.id },
      });

      for (const item of ingredients) {
        if (item.ingredientId && Number(item.quantityNeeded) > 0) {
          // Verify ingredient belongs to current user
          const userIng = await prisma.ingredient.findFirst({
            where: { id: item.ingredientId, userId: currentUser.id },
          });
          if (userIng) {
            await prisma.mealPlanIngredient.create({
              data: {
                mealPlanTemplateId: existing.id,
                ingredientId: userIng.id,
                quantityNeeded: Number(item.quantityNeeded),
              },
            });
          }
        }
      }
    }

    await recalculateIngredientNeeds(
      currentUser.id,
      monthYear || updated.monthYear
    );

    return NextResponse.json({ mealTemplate: updated });
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
      mealType,
      scheduledTime,
      title,
      description,
      isOptional,
      ingredients,
    } = body;

    const created = await prisma.mealPlanTemplate.create({
      data: {
        userId: currentUser.id,
        monthYear,
        dayOfWeek: Number(dayOfWeek),
        mealType,
        scheduledTime: scheduledTime || "12:00",
        title,
        description: description || "",
        isOptional: Boolean(isOptional),
      },
    });

    if (Array.isArray(ingredients)) {
      for (const item of ingredients) {
        if (item.ingredientId && Number(item.quantityNeeded) > 0) {
          const userIng = await prisma.ingredient.findFirst({
            where: { id: item.ingredientId, userId: currentUser.id },
          });
          if (userIng) {
            await prisma.mealPlanIngredient.create({
              data: {
                mealPlanTemplateId: created.id,
                ingredientId: userIng.id,
                quantityNeeded: Number(item.quantityNeeded),
              },
            });
          }
        }
      }
    }

    await recalculateIngredientNeeds(currentUser.id, monthYear);

    return NextResponse.json({ mealTemplate: created });
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
