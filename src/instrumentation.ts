export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { ensureSeeded } = await import("./lib/seed-data");
    const { runLookaheadCheck } = await import("./lib/lookahead-alert");
    const { getSaoPauloNow, syncWeeklyInventoryExpiration } = await import(
      "./lib/week-cycle"
    );
    const { prisma } = await import("./lib/prisma");

    try {
      await ensureSeeded();
      console.log("[NutriTrack OS] SQLite WAL Mode & Initial Multi-User Seed verified.");
    } catch (err) {
      console.error("[NutriTrack OS] Startup seed check error:", err);
    }

    // SPEC-10: Dynamic minute-by-minute Lookahead Alert Scheduler (America/Sao_Paulo timezone)
    cron.default.schedule("* * * * *", async () => {
      try {
        const { dateStr: currentYYYYMMDD, timeStr: currentHHmm } =
          getSaoPauloNow();

        const users = await prisma.user.findMany({
          include: { appConfig: true },
        });

        for (const user of users) {
          const config = user.appConfig;
          if (!config) continue;

          const isEnabled =
            config.alertEnabled !== undefined
              ? config.alertEnabled
              : config.cronEnabled !== false;
          const targetTime = config.alertTime || config.cronTime || "18:00";

          if (
            isEnabled &&
            targetTime === currentHHmm &&
            config.lastAlertRunDate !== currentYYYYMMDD
          ) {
            console.log(
              `[NutriTrack OS Cron] Firing ${targetTime} (America/Sao_Paulo) Lookahead Check for ${user.email}...`
            );

            await syncWeeklyInventoryExpiration(user.id);
            const result = await runLookaheadCheck(user.id);

            await prisma.appConfig.update({
              where: { id: config.id },
              data: { lastAlertRunDate: currentYYYYMMDD },
            });

            console.log(
              `[NutriTrack OS Cron] Completed for ${user.email} (missingItems=${result.missingItems.length}, status=${result.status})`
            );
          }
        }
      } catch (e) {
        console.error("[NutriTrack OS Cron] Error:", e);
      }
    });
  }
}
