import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  walInitialized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function ensureWalMode() {
  if (!globalForPrisma.walInitialized) {
    try {
      await prisma.$queryRawUnsafe(`PRAGMA journal_mode=WAL;`);
      await prisma.$queryRawUnsafe(`PRAGMA synchronous=NORMAL;`);
      await prisma.$queryRawUnsafe(`PRAGMA busy_timeout=5000;`);
      globalForPrisma.walInitialized = true;
    } catch (e) {
      console.error("Failed to set SQLite WAL mode:", e);
    }
  }
}
