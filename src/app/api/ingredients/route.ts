import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCurrentIsoWeek } from "@/lib/week-cycle";

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const now = new Date();
    const currentIsoWeek = getCurrentIsoWeek(now);

    // Bulk action: reset weekly checkboxes or mark all in stock for current user only
    if (body.action === "RESET_WEEK") {
      await prisma.ingredient.updateMany({
        where: { userId: currentUser.id },
        data: {
          boughtForWeek: false,
          boughtForWeekAt: null,
          weekCycleKey: null,
        },
      });
      return NextResponse.json({ ok: true, currentIsoWeek });
    }

    if (body.action === "MARK_ALL_WEEK") {
      await prisma.ingredient.updateMany({
        where: { userId: currentUser.id },
        data: {
          boughtForWeek: true,
          boughtForWeekAt: now,
          weekCycleKey: currentIsoWeek,
        },
      });
      return NextResponse.json({ ok: true, currentIsoWeek });
    }

    const {
      id,
      inStock,
      boughtForWeek,
      weeklyNeed,
      monthlyNeed,
      purchaseFrequency,
      notes,
    } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Missing ingredient id" },
        { status: 400 }
      );
    }

    const existing = await prisma.ingredient.findFirst({
      where: { id, userId: currentUser.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.ingredient.update({
      where: { id: existing.id },
      data: {
        ...(typeof inStock === "boolean" ? { inStock } : {}),
        ...(typeof boughtForWeek === "boolean"
          ? {
              boughtForWeek,
              boughtForWeekAt: boughtForWeek ? now : null,
              weekCycleKey: boughtForWeek ? currentIsoWeek : null,
            }
          : {}),
        ...(typeof weeklyNeed === "number" ? { weeklyNeed } : {}),
        ...(typeof monthlyNeed === "number" ? { monthlyNeed } : {}),
        ...(typeof purchaseFrequency === "string" ? { purchaseFrequency } : {}),
        ...(typeof notes === "string" ? { notes } : {}),
      },
    });

    return NextResponse.json({ ingredient: updated });
  } catch (error: unknown) {
    console.error("PATCH /api/ingredients error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update ingredient",
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
      name,
      category,
      unit,
      purchaseFrequency,
      weeklyNeed,
      monthlyNeed,
      notes,
    } = body;

    if (!name || !category || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const trimmedName = String(name).trim();
    const existing = await prisma.ingredient.findUnique({
      where: {
        userId_name: {
          userId: currentUser.id,
          name: trimmedName,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ ingredient: existing });
    }

    const created = await prisma.ingredient.create({
      data: {
        userId: currentUser.id,
        name: trimmedName,
        category,
        unit,
        purchaseFrequency: purchaseFrequency || "WEEKLY",
        weeklyNeed: Number(weeklyNeed) || 0,
        monthlyNeed: Number(monthlyNeed) || (Number(weeklyNeed) || 0) * 4,
        inStock: false,
        boughtForWeek: false,
        boughtForWeekAt: null,
        weekCycleKey: null,
        notes: notes || "",
      },
    });

    return NextResponse.json({ ingredient: created });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create ingredient",
      },
      { status: 500 }
    );
  }
}
