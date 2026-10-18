import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/lib/nutritrack/uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const safeName = path.basename(params.filename);
    let filePath = path.join(UPLOAD_DIR, safeName);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      filePath = path.join(process.cwd(), "uploads", safeName);
      fileBuffer = await fs.readFile(filePath);
    }

    const ext = path.extname(safeName).toLowerCase();
    const mime =
      ext === ".webp"
        ? "image/webp"
        : ext === ".png"
        ? "image/png"
        : "image/jpeg";

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
