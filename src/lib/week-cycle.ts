import { prisma } from "./prisma";

/**
 * Returns the current date components (year, month, day, HH:mm, YYYY-MM-DD)
 * in the America/Sao_Paulo timezone.
 */
export function getSaoPauloNow(referenceDate: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(referenceDate);

  const year = Number(parts.find((p) => p.type === "year")?.value || 2026);
  const month = Number(parts.find((p) => p.type === "month")?.value || 1);
  const day = Number(parts.find((p) => p.type === "day")?.value || 1);
  let hour = parts.find((p) => p.type === "hour")?.value || "00";
  if (hour === "24") hour = "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";

  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
  const timeStr = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

  return { year, month, day, dateStr, timeStr };
}

/**
 * Computes the ISO-8601 week key (e.g. "2026-W42") in America/Sao_Paulo timezone,
 * where a new week starts on Monday at 00:00.
 */
export function getCurrentIsoWeek(referenceDate: Date = new Date()): string {
  const { year, month, day } = getSaoPauloNow(referenceDate);
  const target = new Date(Date.UTC(year, month - 1, day));
  const dayNr = (target.getUTCDay() + 6) % 7; // Monday = 0 .. Sunday = 6
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Returns human-readable start (Monday) and end (Sunday) dates for the current week
 * in America/Sao_Paulo timezone.
 */
export function getCurrentWeekBounds(referenceDate: Date = new Date()) {
  const { year, month, day } = getSaoPauloNow(referenceDate);
  const current = new Date(Date.UTC(year, month - 1, day));
  const dayNr = (current.getUTCDay() + 6) % 7; // Monday = 0 .. Sunday = 6

  const monday = new Date(current);
  monday.setUTCDate(current.getUTCDate() - dayNr);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = (d: Date) =>
    `${String(d.getUTCDate()).padStart(2, "0")}/${String(
      d.getUTCMonth() + 1
    ).padStart(2, "0")}`;
  const iso = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getUTCDate()).padStart(2, "0")}`;

  return {
    weekCycleKey: getCurrentIsoWeek(referenceDate),
    mondayDate: iso(monday),
    sundayDate: iso(sunday),
    label: `Semana de ${fmt(monday)} a ${fmt(sunday)}`,
  };
}

/**
 * SPEC-09: Automatically resets `boughtForWeek = false` for any ingredient
 * whose `weekCycleKey` does not match the current ISO week in America/Sao_Paulo.
 */
export async function syncWeeklyInventoryExpiration(
  userId: string,
  referenceDate: Date = new Date()
) {
  const currentIsoWeek = getCurrentIsoWeek(referenceDate);

  const expiredItems = await prisma.ingredient.findMany({
    where: {
      userId,
      boughtForWeek: true,
      OR: [
        { weekCycleKey: null },
        { weekCycleKey: { not: currentIsoWeek } },
      ],
    },
    select: { id: true },
  });

  if (expiredItems.length > 0) {
    await prisma.ingredient.updateMany({
      where: {
        id: { in: expiredItems.map((i) => i.id) },
      },
      data: {
        boughtForWeek: false,
        boughtForWeekAt: null,
        weekCycleKey: null,
      },
    });
  }

  return {
    currentIsoWeek,
    expiredResetCount: expiredItems.length,
  };
}
