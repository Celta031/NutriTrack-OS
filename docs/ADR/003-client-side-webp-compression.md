# ADR-003: Client-Side Canvas WebP Compression before Upload

- **Status:** Accepted
- **Date:** 2026-10-18
- **Related Spec:** `SDD-001-NUTRITRACK-OS`

## Context
Modern smartphone cameras produce $4\text{--}12\text{ MB}$ JPEG/HEIC images per meal photo. Uploading raw camera images to a 1 vCPU / 1 GB RAM VM would:
1. Spike server memory during multipart parsing or image processing (`sharp`).
2. Rapidly consume the 64 GB P6 Free Tier SSD disk.
3. Degrade mobile upload speed over cellular networks.

## Decision
Implement a **Client-Side HTML5 Canvas WebP Compression Pipeline** (`compressImageToWebP` in `src/components/NutriTrackApp.tsx`) that resizes photos to a maximum dimension of $1200\text{ px}$ and iteratively adjusts WebP encoding quality ($0.82 \rightarrow 0.35$) in the browser until the payload is guaranteed to be $\le 400\text{ KB}$ before sending to `POST /api/uploads`.

## Consequences
- **Positive:**
  - **Zero Server CPU/RAM Overhead:** The server simply validates the size ceiling ($\le 500\text{ KB}$) and writes the pre-compressed `.webp` buffer directly to `/var/lib/nutritrack/uploads`.
  - **95% Storage Reduction:** A $5\text{ MB}$ smartphone photo is reduced to $\sim 120\text{--}350\text{ KB}$ with high visual fidelity.
  - **Fast Mobile Check-ins:** Uploads complete in milliseconds even on 4G connections.
- **Negative / Trade-offs:**
  - Relies on browser `<canvas>` WebP encoding support (universally supported across modern iOS Safari, Android Chrome, and desktop browsers).
