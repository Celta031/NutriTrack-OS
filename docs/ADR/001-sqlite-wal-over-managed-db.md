# ADR-001: SQLite in WAL Mode over Managed Relational Database

- **Status:** Accepted
- **Date:** 2026-10-18
- **Related Spec:** `SDD-001-NUTRITRACK-OS`

## Context
NutriTrack-OS targets zero-cost Cloud Free Tier infrastructure (specifically single-node IaaS VMs with 1 vCPU and 1 GiB RAM). Running a standalone PostgreSQL or MySQL container consumes $150\text{--}350\text{ MiB}$ of idle RAM, while cloud-managed relational databases incur recurring monthly costs after trial periods.

## Decision
We chose **SQLite** via **Prisma ORM**, configured at startup with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`), `PRAGMA synchronous=NORMAL;`, and `PRAGMA busy_timeout=5000;`, persisted on a host-mounted volume (`/var/lib/nutritrack/data/nutritrack.db`).

## Consequences
- **Positive:**
  - **Zero Daemon Overhead:** Database engine runs in-process inside the Next.js Node.js runtime, keeping total application container memory usage around $\sim 35\text{ MiB}$.
  - **Zero Cloud Cost:** No managed database billing; database lives on the 64 GB P6 Free Tier OS SSD.
  - **Concurrency & ACID:** WAL mode allows concurrent readers alongside single-writer transactions without `SQLITE_BUSY` lock contention during the 18:00 Lookahead Cron execution.
  - **Simple Backups:** Backing up the entire system state requires only copying `/var/lib/nutritrack/data`.
- **Negative / Trade-offs:**
  - Vertical scaling is bound to a single host node (acceptable for personal/family nutritional tracking workloads).
