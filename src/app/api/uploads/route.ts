import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/lib/nutritrack/uploads";

async function getSafeUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    return UPLOAD_DIR;
  } catch {
    const fallback = path.join(process.cwd(), "uploads");
    await fs.mkdir(fallback, { recursive: true });
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const dir = await getSafeUploadDir();
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let ext = "webp";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }
      const arrayBuf = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      if (file.type.includes("jpeg") || file.type.includes("jpg")) ext = "jpg";
      else if (file.type.includes("png")) ext = "png";
    } else {
      const body = await req.json();
      const dataUrl: string = body.dataUrl || "";
      if (!dataUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Invalid image dataUrl" },
          { status: 400 }
        );
      }
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          { error: "Malformed base64 image" },
          { status: 400 }
        );
      }
      ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      buffer = Buffer.from(matches[2], "base64");
    }

    // Enforce max 450KB limit on server side too (client compresses to WebP <= 400KB)
    if (buffer.byteLength > 500 * 1024) {
      return NextResponse.json(
        { error: "Imagem excede o limite máximo de 400KB após compressão." },
        { status: 413 }
      );
    }

    const safeUserId = currentUser.id.replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${safeUserId}_${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/api/uploads/${filename}`,
      filename,
      sizeBytes: buffer.byteLength,
    });
  } catch (error: unknown) {
    console.error("POST /api/uploads error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
