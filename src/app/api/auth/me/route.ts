import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { user: null, error: "Não autenticado" },
        { status: 401 }
      );
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { user: null, error: "Falha ao verificar sessão" },
      { status: 500 }
    );
  }
}
