# ADR-004: Stateless JWT Session (`jose`) & Logical Multi-Tenant Isolation (`userId`) on SQLite WAL

- **Status:** Accepted
- **Date:** 2026-10-18
- **Spec Reference:** `SDD-002-MULTI-USER-AUTH`

## Context
As **NutriTrack-OS** evolved from a single-user appliance (`SDD-001`) into a shared multi-user platform (`SDD-002`), multiple users needed to use the same Azure Free Tier VM (`Standard_B1s` / `Standard_B2ats_v2`) concurrently without crossing meal plans, grocery stock checkboxes, meal photos, hydration logs, or daily 18:00 email alerts.

## Decision
1. **Stateless JWT Session (`jose` + `HttpOnly` Cookie):**
   - Session tokens are signed with `HS256` using the Edge-compatible `jose` library (`src/lib/auth.ts`) and stored in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie named `nutritrack_session` with a 30-day expiration so mobile PWA users do not need to log in repeatedly.
   - Passwords are hashed using Node.js native `crypto.scryptSync` with a random 16-byte salt and verified via `crypto.timingSafeEqual`, introducing zero native C++ addon dependencies.
2. **Logical Multi-Tenant Row Isolation (`userId`) in a Single SQLite WAL Database:**
   - Every tenant-owned entity (`Ingredient`, `MealPlanTemplate`, `DailyLog`, `NotificationLog`, `AppConfig`) includes a mandatory `userId` foreign key referencing `User(id)` with composite indexes (`@@unique([userId, name])`, `@@index([userId, monthYear, dayOfWeek])`, `@@index([userId, date])`).
   - All API routes enforce `getAuthenticatedUser(req)` (`401 Unauthorized` when missing) and scope every read/write query by `userId`.
   - Uploaded WebP photos are prefixed with `<userId>_<timestamp>.webp`.
3. **Auto-Onboarding (`provisionInitialUserData`) & Zero-Data-Loss Migration:**
   - New accounts registered via `POST /api/auth/register` automatically receive an isolated set of 39 catalog ingredients, 42 weekly meals, and `AppConfig` inside a Prisma transaction.
   - Legacy single-user databases are upgraded automatically on container startup via `prisma/migrate-multi-user.mjs` before `prisma db push`, linking all pre-existing records to the primary owner account without losing historical data.

## Consequences
- **Positive:** Preserves the `< 50 MiB` RAM footprint (no Redis/session store or external OAuth latency), guarantees strict tenant isolation across UI, API, and 18:00 Lookahead Cron, and upgrades existing production databases with zero downtime or data loss.
- **Negative:** Requires every new Prisma query on tenant tables to include `where: { userId }`.
