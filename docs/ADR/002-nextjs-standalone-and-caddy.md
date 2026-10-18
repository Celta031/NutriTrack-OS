# ADR-002: Next.js Standalone Output with Caddy Reverse Proxy for Auto-HTTPS

- **Status:** Accepted
- **Date:** 2026-10-18
- **Related Spec:** `SDD-001-NUTRITRACK-OS`

## Context
1. Mobile browsers enforce a strict security policy: `navigator.geolocation` (GPS capture) and camera access require a secure HTTPS context (valid TLS certificate).
2. A standard `next start` deployment retains the full development dependency tree and consumes excessive disk and memory on constrained IaaS VMs.

## Decision
1. Configure Next.js with `output: 'standalone'` in `next.config.mjs`, producing a minimal self-contained `server.js` bundle traced by `@vercel/nft`.
2. Deploy **Caddy 2 (`caddy:2-alpine`)** as the edge reverse proxy in front of `nutritrack:3000`. Caddy automatically negotiates and renews Let's Encrypt TLS certificates over the free Azure public DNS (`*.<region>.cloudapp.azure.com`).

## Consequences
- **Positive:**
  - Runtime memory drops to $\sim 35\text{ MiB}$ for Next.js and $\sim 13\text{ MiB}$ for Caddy (`< 50 MiB` combined).
  - Zero-touch HTTPS certificate issuance and renewal without manual `certbot` cron scripts or purchasing a custom domain.
  - Native HTTP/2 and HTTP/3 (QUIC) support with `gzip`/`zstd` compression out of the box.
- **Negative / Trade-offs:**
  - Static assets (`.next/static` and `public`) must be explicitly copied into the runner stage of the multi-stage `Dockerfile`.
