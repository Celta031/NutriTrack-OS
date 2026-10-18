import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

function getCurrentIsoWeekSaoPaulo(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = Number(parts.find((p) => p.type === "year")?.value || 2026);
  const m = Number(parts.find((p) => p.type === "month")?.value || 1);
  const d = Number(parts.find((p) => p.type === "day")?.value || 1);

  const target = new Date(Date.UTC(y, m - 1, d));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

async function tableExists(tableName) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    tableName
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const cols = await prisma.$queryRawUnsafe(`PRAGMA table_info("${tableName}")`);
  return Array.isArray(cols) && cols.some((c) => c.name === columnName);
}

export async function runZeroDataLossMigration() {
  console.log("[SDD-002/003 Migration] Checking database state...");

  await prisma.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`);

  const hasIngredientTable = await tableExists("Ingredient");
  if (!hasIngredientTable) {
    console.log("[SDD-002/003 Migration] Fresh database detected. Skipping legacy migration.");
    return;
  }

  let ownerName = process.env.NEXT_PUBLIC_USER_NAME || "Demo User";
  let ownerEmail = (
    process.env.ALERT_RECIPIENT_EMAIL || "user@example.com"
  ).toLowerCase();

  if (await tableExists("AppConfig")) {
    try {
      const configs = await prisma.$queryRawUnsafe(
        `SELECT userName, targetEmail FROM "AppConfig" LIMIT 1`
      );
      if (Array.isArray(configs) && configs.length > 0) {
        if (configs[0].userName) ownerName = String(configs[0].userName).trim();
        if (configs[0].targetEmail) {
          ownerEmail = String(configs[0].targetEmail).trim().toLowerCase();
        }
      }
    } catch {
      // ignore
    }
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `);

  const existingUsers = await prisma.$queryRawUnsafe(
    `SELECT id, email FROM "User" ORDER BY createdAt ASC LIMIT 1`
  );

  let ownerId = "owner-primary";
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    ownerId = existingUsers[0].id;
  } else {
    const defaultPassword =
      process.env.DEFAULT_OWNER_PASSWORD || "NutriTrack123!";
    const passwordHash = hashPassword(defaultPassword);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      ownerId,
      ownerName,
      ownerEmail,
      passwordHash
    );
    console.log(
      `[SDD-002/003 Migration] Created primary owner account: ${ownerName} <${ownerEmail}> (id=${ownerId})`
    );
  }

  const tablesToMigrate = [
    "Ingredient",
    "MealPlanTemplate",
    "DailyLog",
    "NotificationLog",
    "AppConfig",
  ];

  for (const table of tablesToMigrate) {
    if (!(await tableExists(table))) continue;
    const hasUserId = await columnExists(table, "userId");
    if (!hasUserId) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "${table}" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '${ownerId}';`
      );
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "userId" = ? WHERE "userId" IS NULL OR "userId" = ''`,
      ownerId
    );
  }

  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Ingredient_name_key";`);

  // SDD-003 columns on Ingredient
  if (!(await columnExists("Ingredient", "boughtForWeekAt"))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Ingredient" ADD COLUMN "boughtForWeekAt" DATETIME;`
    );
  }
  if (!(await columnExists("Ingredient", "weekCycleKey"))) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Ingredient" ADD COLUMN "weekCycleKey" TEXT;`
    );
    const currentWeek = getCurrentIsoWeekSaoPaulo();
    await prisma.$executeRawUnsafe(
      `UPDATE "Ingredient" SET "weekCycleKey" = ?, "boughtForWeekAt" = CURRENT_TIMESTAMP WHERE "boughtForWeek" = 1 AND "weekCycleKey" IS NULL`,
      currentWeek
    );
  }

  // SDD-003 columns on AppConfig
  if (await tableExists("AppConfig")) {
    if (!(await columnExists("AppConfig", "alertTime"))) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "AppConfig" ADD COLUMN "alertTime" TEXT NOT NULL DEFAULT '18:00';`
      );
      await prisma.$executeRawUnsafe(
        `UPDATE "AppConfig" SET "alertTime" = COALESCE("cronTime", '18:00');`
      );
    }
    if (!(await columnExists("AppConfig", "alertEnabled"))) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "AppConfig" ADD COLUMN "alertEnabled" BOOLEAN NOT NULL DEFAULT 1;`
      );
      await prisma.$executeRawUnsafe(
        `UPDATE "AppConfig" SET "alertEnabled" = COALESCE("cronEnabled", 1);`
      );
    }
    if (!(await columnExists("AppConfig", "lastAlertRunDate"))) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "AppConfig" ADD COLUMN "lastAlertRunDate" TEXT;`
      );
    }
  }

  console.log("[SDD-002/003 Migration] Zero-data-loss migration completed.");
}

runZeroDataLossMigration()
  .catch((err) => {
    console.error("[SDD-002/003 Migration] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
