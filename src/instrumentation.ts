export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");
    const { ensureSeeded } = await import("./lib/seed-data");
    const { runLookaheadCheck } = await import("./lib/lookahead-alert");
    const { prisma } = await import("./lib/prisma");

    try {
      await ensureSeeded();
      console.log("[NutriTrack OS] SQLite WAL Mode & Initial Multi-User Seed verified.");
    } catch (err) {
      console.error("[NutriTrack OS] Startup seed check error:", err);
    }

    // Schedule daily lookahead check every minute, iterating over all registered users (SPEC-06)
    cron.default.schedule("* * * * *", async () => {
      try {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const currentHHMM = `${hh}:${mm}`;

        const users = await prisma.user.findMany({
          include: { appConfig: true },
        });

        for (const user of users) {
          const config = user.appConfig;
          const targetTime = config?.cronTime || "18:00";
          if (config?.cronEnabled !== false && currentHHMM === targetTime) {
            console.log(
              `[NutriTrack OS Cron] Firing ${targetTime} Lookahead Alert Check for user ${user.email}...`
            );
            await runLookaheadCheck(user.id);
          }
        }
      } catch (e) {
        console.error("[NutriTrack OS Cron] Error:", e);
      }
    });
  }
}
