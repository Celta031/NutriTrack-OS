import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { runLookaheadCheck } from "@/lib/lookahead-alert";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const referenceDate = body.date
      ? new Date(`${body.date}T12:00:00`)
      : new Date();
    const result = await runLookaheadCheck(currentUser.id, {
      referenceDate,
      forceSendEvenIfComplete: true,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("POST /api/alerts/check error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to run lookahead check",
      },
      { status: 500 }
    );
  }
}
