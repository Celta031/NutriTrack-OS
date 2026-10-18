import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/lib/nutritrack/uploads";

async function resetUserLogs() {
  const targetEmail = (
    process.argv[2] ||
    process.env.TARGET_RESET_EMAIL ||
    ""
  )
    .trim()
    .toLowerCase();

  if (!targetEmail) {
    console.error(
      "Usage: node prisma/reset-user-logs.mjs <user-email> (or set TARGET_RESET_EMAIL)"
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.error(`[SPEC-12 Reset] User not found for email: ${targetEmail}`);
    process.exit(1);
  }

  const existingLogs = await prisma.dailyLog.findMany({
    where: { userId: user.id },
    select: { id: true, photoUrl: true },
  });

  // Delete associated uploaded test photos if present
  for (const log of existingLogs) {
    if (log.photoUrl && log.photoUrl.startsWith("/api/uploads/")) {
      const filename = path.basename(log.photoUrl);
      for (const dir of [UPLOAD_DIR, path.join(process.cwd(), "uploads")]) {
        try {
          await fs.unlink(path.join(dir, filename));
        } catch {
          // ignore if file does not exist
        }
      }
    }
  }

  const deleted = await prisma.dailyLog.deleteMany({
    where: { userId: user.id },
  });

  const remaining = await prisma.dailyLog.count({
    where: { userId: user.id },
  });

  console.log(
    `[SPEC-12 Reset] Successfully deleted ${deleted.count} DailyLog records for ${user.name} <${user.email}>. Remaining logs: ${remaining}.`
  );
}

resetUserLogs()
  .catch((err) => {
    console.error("[SPEC-12 Reset] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
