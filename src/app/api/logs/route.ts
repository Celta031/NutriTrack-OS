import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();

    // Action 1: Update hydration (water intake & fasting water goal) for a date
    if (body.action === "HYDRATION") {
      const { date, waterIntakeMl, fastingWaterDone } = body;
      const existingLogs = await prisma.dailyLog.findMany({
        where: { userId: currentUser.id, date },
        orderBy: { loggedAt: "asc" },
      });

      if (existingLogs.length > 0) {
        const first = existingLogs[0];
        const updated = await prisma.dailyLog.update({
          where: { id: first.id },
          data: {
            ...(typeof waterIntakeMl === "number" ? { waterIntakeMl } : {}),
            ...(typeof fastingWaterDone === "boolean"
              ? { fastingWaterDone }
              : {}),
          },
        });
        return NextResponse.json({ log: updated });
      } else {
        const created = await prisma.dailyLog.create({
          data: {
            userId: currentUser.id,
            date,
            status: "PENDING",
            actualNotes: "Controle diário de hidratação iniciado",
            waterIntakeMl:
              typeof waterIntakeMl === "number" ? waterIntakeMl : 0,
            fastingWaterDone: Boolean(fastingWaterDone),
          },
        });
        return NextResponse.json({ log: created });
      }
    }

    // Action 2: Register or update a specific meal log
    const {
      date,
      mealPlanTemplateId,
      mealType,
      status,
      actualNotes,
      photoUrl,
      latitude,
      longitude,
      locationName,
      loggedAt,
    } = body;

    if (!date || !mealPlanTemplateId) {
      return NextResponse.json(
        { error: "date and mealPlanTemplateId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.dailyLog.findFirst({
      where: {
        userId: currentUser.id,
        date,
        mealPlanTemplateId,
      },
    });

    if (existing) {
      const updated = await prisma.dailyLog.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          actualNotes:
            typeof actualNotes === "string" ? actualNotes : existing.actualNotes,
          photoUrl: photoUrl !== undefined ? photoUrl : existing.photoUrl,
          latitude: latitude !== undefined ? latitude : existing.latitude,
          longitude: longitude !== undefined ? longitude : existing.longitude,
          locationName:
            locationName !== undefined ? locationName : existing.locationName,
          loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        },
      });
      return NextResponse.json({ log: updated });
    } else {
      const created = await prisma.dailyLog.create({
        data: {
          userId: currentUser.id,
          date,
          mealPlanTemplateId,
          mealType: mealType || "MEAL",
          status: status || "COMPLETED",
          actualNotes: actualNotes || "",
          photoUrl: photoUrl || null,
          latitude: typeof latitude === "number" ? latitude : null,
          longitude: typeof longitude === "number" ? longitude : null,
          locationName: locationName || null,
          loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        },
      });
      return NextResponse.json({ log: created });
    }
  } catch (error: unknown) {
    console.error("POST /api/logs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save log" },
      { status: 500 }
    );
  }
}
