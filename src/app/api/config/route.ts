import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userName,
      nutritionistName,
      targetEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      resendApiKey,
      emailProvider,
      dailyWaterGoalMl,
      fastingWaterMl,
      cronTime,
      cronEnabled,
    } = body;

    const updated = await prisma.appConfig.upsert({
      where: { id: "singleton" },
      update: {
        ...(userName !== undefined ? { userName } : {}),
        ...(nutritionistName !== undefined ? { nutritionistName } : {}),
        ...(targetEmail !== undefined ? { targetEmail } : {}),
        ...(smtpHost !== undefined ? { smtpHost } : {}),
        ...(smtpPort !== undefined ? { smtpPort: Number(smtpPort) || 587 } : {}),
        ...(smtpUser !== undefined ? { smtpUser } : {}),
        ...(smtpPass !== undefined ? { smtpPass } : {}),
        ...(resendApiKey !== undefined ? { resendApiKey } : {}),
        ...(emailProvider !== undefined ? { emailProvider } : {}),
        ...(dailyWaterGoalMl !== undefined ? { dailyWaterGoalMl: Number(dailyWaterGoalMl) || 3000 } : {}),
        ...(fastingWaterMl !== undefined ? { fastingWaterMl: Number(fastingWaterMl) || 500 } : {}),
        ...(cronTime !== undefined ? { cronTime } : {}),
        ...(typeof cronEnabled === "boolean" ? { cronEnabled } : {}),
      },
      create: {
        id: "singleton",
        userName: userName || process.env.NEXT_PUBLIC_USER_NAME || "Demo User",
        nutritionistName: nutritionistName || "Dra. Nutricionista",
        targetEmail: targetEmail || process.env.ALERT_RECIPIENT_EMAIL || "user@example.com",
        smtpHost: smtpHost || process.env.SMTP_HOST || "smtp.example.com",
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser || "",
        smtpPass: smtpPass || "",
        resendApiKey: resendApiKey || "",
        emailProvider: emailProvider || "SMTP",
        dailyWaterGoalMl: Number(dailyWaterGoalMl) || 3000,
        fastingWaterMl: Number(fastingWaterMl) || 500,
        cronTime: cronTime || "18:00",
        cronEnabled: cronEnabled ?? true,
      },
    });

    return NextResponse.json({ config: updated });
  } catch (error: unknown) {
    console.error("PUT /api/config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update config" },
      { status: 500 }
    );
  }
}
