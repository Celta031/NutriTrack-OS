import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
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
  console.log("[SDD-002 Migration] Checking database state for multi-user isolation...");

  await prisma.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`);

  const hasIngredientTable = await tableExists("Ingredient");
  if (!hasIngredientTable) {
    console.log("[SDD-002 Migration] Fresh database detected. Skipping legacy migration.");
    return;
  }

  // Read legacy AppConfig if available to preserve owner name and email
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
      // ignore if AppConfig is empty
    }
  }

  // Ensure User table exists
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

  // Find or create primary owner user
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
      `[SDD-002 Migration] Created primary owner account: ${ownerName} <${ownerEmail}> (id=${ownerId})`
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
      console.log(
        `[SDD-002 Migration] Adding userId column to ${table} and linking existing rows to ${ownerId}...`
      );
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "${table}" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '${ownerId}';`
      );
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "userId" = ? WHERE "userId" IS NULL OR "userId" = ''`,
      ownerId
    );
  }

  // Drop old single-tenant unique index on Ingredient(name) if present
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Ingredient_name_key";`);

  console.log("[SDD-002 Migration] Zero-data-loss multi-user migration completed.");
}

runZeroDataLossMigration()
  .catch((err) => {
    console.error("[SDD-002 Migration] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
