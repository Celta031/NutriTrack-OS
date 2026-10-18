# Software Design Document (SDD) — NutriTrack-OS

- **Document ID:** `SDD-001-NUTRITRACK-OS`
- **Version:** `1.0.0`
- **Status:** `Approved / Released`
- **Methodology:** Spec-Driven Development (SDD)

---

## 1. System Overview & Context

### 1.1. Purpose
**NutriTrack-OS** is a reactive, low-footprint full-stack web application designed to manage cyclic meal plans, personal food inventory, daily nutritional adherence (with geolocated photo evidence and hydration tracking), proactive lookahead grocery alerts, and clinical reporting for nutritionists.

### 1.2. System Actors & External Integrations
- **Primary User (Patient / Athlete):** Manages daily water intake, logs meals with camera photos and GPS location, updates weekly/monthly meal templates, and tracks grocery stock checkboxes.
- **Nutritionist (Clinical Reviewer):** Consumes the consolidated monthly executive report (adherence KPIs, hydration average, substitution justifications, and timestamped/geolocated meal photo gallery) via web view or printable PDF (`window.print()`).
- **Lookahead Cron Engine (Internal Actor):** Scheduled background worker (`node-cron`) that evaluates `D+1` meal requirements at `18:00` daily.
- **OpenStreetMap Nominatim API (External Service):** Provides client-side reverse geocoding (`lat/lon` $\rightarrow$ neighborhood/city label) during meal check-in.
- **SMTP / Resend API (External Service):** Delivers transactional HTML alert emails when ingredients required for tomorrow's meals are out of stock.

---

## 2. Architecture & Component Design

### 2.1. High-Level Container & Component Topology

```mermaid
graph TD
    subgraph Client ["Client Layer (Mobile PWA / Desktop Browser)"]
        UI["React 18 UI (NutriTrackApp.tsx)"]
        Canvas["HTML5 Canvas WebP Compressor (<= 400KB)"]
        Geo["Navigator Geolocation + Nominatim Client"]
    end

    subgraph Edge ["Reverse Proxy & TLS Layer"]
        Caddy["Caddy 2 Alpine (Ports 80/443 - Auto Let's Encrypt TLS 1.3)"]
    end

    subgraph AppServer ["Application Runtime (Next.js 14 Standalone ~35 MiB RAM)"]
        API["Next.js App Router API (/api/*)"]
        Cron["Instrumentation Hook + node-cron (18:00 Lookahead)"]
        AlertEngine["Lookahead Alert Engine (lookahead-alert.ts)"]
        Prisma["Prisma Client Singleton (WAL Enabled)"]
    end

    subgraph Storage ["Host Persistent Volumes (/var/lib/nutritrack)"]
        SQLite[("SQLite DB (nutritrack.db + WAL/SHM)")]
        Uploads[("Local Disk (/var/lib/nutritrack/uploads/*.webp)")]
    end

    subgraph External ["External Providers"]
        Nominatim["OpenStreetMap Nominatim API"]
        Email["SMTP Server / Resend API"]
    end

    UI --> Canvas
    UI --> Geo
    Geo --> Nominatim
    UI -->|HTTPS JSON / Base64 WebP| Caddy
    Caddy -->|HTTP Proxy :3000| API
    Cron -->|Daily 18:00 Trigger| AlertEngine
    API -->|Manual Trigger| AlertEngine
    AlertEngine --> Prisma
    AlertEngine -->|HTML Alert| Email
    API --> Prisma
    API -->|Read/Write WebP| Uploads
    Prisma -->|ACID SQL + WAL| SQLite
```

### 2.2. Sequence Diagram — Meal Check-in & Lookahead Alert Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client PWA (Canvas + GPS)
    participant Nominatim as OSM Nominatim API
    participant API as Next.js Standalone API
    participant Disk as /var/lib/nutritrack/uploads
    participant DB as SQLite (WAL Mode)
    participant Cron as Lookahead Engine (18:00)
    participant Mail as SMTP / Resend

    User->>Browser: Clicks "Registrar Refeição" & selects photo
    Browser->>Browser: Compress image in HTML5 Canvas to WebP (<= 400KB)
    Browser->>Nominatim: GET /reverse?format=jsonv2&lat={lat}&lon={lon}
    Nominatim-->>Browser: Returns suburb / city name
    Browser->>API: POST /api/uploads (Base64 WebP payload)
    API->>Disk: Writes meal-{timestamp}.webp
    API-->>Browser: Returns /api/uploads/meal-{timestamp}.webp
    Browser->>API: POST /api/logs (status, notes, photoUrl, lat, lon, locationName)
    API->>DB: Upserts DailyLog record
    DB-->>API: ACK
    API-->>Browser: Updated state

    Note over Cron,Mail: Daily Scheduled Execution at 18:00 (or Manual Trigger)
    Cron->>DB: Query MealPlanTemplate for (dayOfWeek of D+1)
    Cron->>DB: Cross-reference linked Ingredients where !inStock && !boughtForWeek
    Cron->>Mail: Dispatch HTML Alert listing missing D+1 ingredients
    Cron->>DB: Insert audit record in NotificationLog
```

---

## 3. Data Model Specification (ERD)

The relational schema is managed via Prisma ORM (`prisma/schema.prisma`) on top of SQLite in WAL mode:

```mermaid
erDiagram
    Ingredient ||--o{ MealPlanIngredient : "used in"
    MealPlanTemplate ||--o{ MealPlanIngredient : "requires"
    MealPlanTemplate ||--o{ DailyLog : "logged against"

    Ingredient {
        string id PK
        string name UK
        string category "Proteínas | Laticínios | Mercearia | Frutas | Legumes/Verduras"
        string unit "g | ml | un"
        string purchaseFrequency "MONTHLY | BIWEEKLY | WEEKLY | DAILY"
        float weeklyNeed
        float monthlyNeed
        boolean inStock "Tenho pro Mês"
        boolean boughtForWeek "Comprado pra Semana"
        string notes
        datetime updatedAt
    }

    MealPlanTemplate {
        string id PK
        string monthYear "YYYY-MM"
        int dayOfWeek "0=Sun .. 6=Sat"
        string mealType "BREAKFAST | MORNING_SNACK | LUNCH | AFTERNOON_SNACK | DINNER | SUPPER"
        string scheduledTime "HH:MM"
        string title
        string description
        boolean isOptional
    }

    MealPlanIngredient {
        string id PK
        string mealPlanTemplateId FK
        string ingredientId FK
        float quantityNeeded
    }

    DailyLog {
        string id PK
        string date "YYYY-MM-DD"
        string mealPlanTemplateId FK
        string mealType
        string status "PENDING | COMPLETED | SUBSTITUTED | SKIPPED"
        string actualNotes
        string photoUrl
        datetime loggedAt
        float latitude
        float longitude
        string locationName
        int waterIntakeMl
        boolean fastingWaterDone
    }

    NotificationLog {
        string id PK
        datetime sentAt
        string targetDate "YYYY-MM-DD (D+1)"
        string recipient
        string subject
        int missingCount
        string missingItems "JSON array"
        string status "SENT | SIMULATED | FAILED"
        string errorMessage
    }

    AppConfig {
        string id PK "singleton"
        string userName
        string nutritionistName
        string targetEmail
        string smtpHost
        int smtpPort
        string smtpUser
        string smtpPass
        string resendApiKey
        string emailProvider "SMTP | RESEND"
        int dailyWaterGoalMl
        int fastingWaterMl
        string cronTime "18:00"
        boolean cronEnabled
        datetime updatedAt
    }
```

---

## 4. Core Business Rules & Algorithms (Specs)

### `SPEC-01`: Lookahead Inventory Alert Engine (`src/lib/lookahead-alert.ts`)
- **Trigger:** Executed automatically by `node-cron` when server local time matches `AppConfig.cronTime` (default `18:00`) and `AppConfig.cronEnabled == true`, or manually via `POST /api/alerts/check`.
- **Algorithm:**
  1. Given reference date $D$, compute target date $D_{+1} = D + 1\text{ day}$, its `monthYear` (`YYYY-MM`), and its `dayOfWeek` $\in \{0..6\}$.
  2. Fetch all `MealPlanTemplate` records matching `(monthYear, dayOfWeek)` ordered by `scheduledTime ASC`, including their `MealPlanIngredient` links and associated `Ingredient` entities.
  3. Filter linked ingredients where:
     $$\neg \text{inStock} \land \neg \text{boughtForWeek}$$
  4. Aggregate `quantityForTomorrow` per missing ingredient across all meals of $D_{+1}$ and list the affected meal titles/times.
  5. Render a responsive HTML email table and dispatch via the configured provider (`SMTP` via `nodemailer` or `RESEND` via REST API). If credentials are not yet populated, record as `SIMULATED` and return the HTML preview to the UI.
  6. Persist an immutable audit entry in `NotificationLog`.

### `SPEC-02`: Client-Side Media & Geo Pipeline (`src/components/NutriTrackApp.tsx`)
- **Image Compression Algorithm (`compressImageToWebP`):**
  1. Load user-selected image file into an HTML5 `Image` object via `FileReader`.
  2. Downscale dimensions proportionally so that $\max(\text{width}, \text{height}) \le 1200\text{ px}$ on an offscreen `<canvas>`.
  3. Encode canvas content to `image/webp` starting at quality $q = 0.82$.
  4. Iteratively decrement $q$ by $0.10$ (down to a floor of $0.35$) until the base64 byte payload satisfies:
     $$\text{Size}_{\text{WebP}} \le 390\text{ KB}$$
  5. Upload compressed payload to `POST /api/uploads`, which enforces a hard server-side ceiling of $500\text{ KB}$ and writes the `.webp` file to `UPLOAD_DIR`.
- **Geolocation & Reverse Geocoding:**
  1. Invoke `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`.
  2. Query `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}`.
  3. Extract `suburb || neighbourhood || city_district` and `city || municipality` to form a human-readable badge (or allow 1-tap selection from preset tags: `Casa`, `Trabalho`, `Pós-Treino / Academia`, `Restaurante`).

### `SPEC-03`: Dynamic Grocery Recalculation (`src/lib/seed-data.ts`)
- Whenever a `MealPlanTemplate` or its `MealPlanIngredient` links are created or updated (`POST /api/meals` or `PUT /api/meals`) for a given `monthYear`:
  1. Query all `MealPlanTemplate` records for `monthYear` across all 7 days of the week ($0..6$).
  2. Sum `quantityNeeded` per `ingredientId` to compute the exact weekly demand:
     $$\text{weeklyNeed}_i = \sum_{m \in \text{Week}} \text{quantityNeeded}_{m,i}$$
  3. Compute the monthly demand as:
     $$\text{monthlyNeed}_i = 4 \times \text{weeklyNeed}_i$$
  4. Persist updated `weeklyNeed` and `monthlyNeed` values in `Ingredient`.

---

## 5. API Contracts (Interface Specification)

| Endpoint | Method | Purpose | Request Payload / Params | Response Summary |
| :--- | :--- | :--- | :--- | :--- |
| `/api/state` | `GET` | Fetch complete reactive state for date & month | `?date=YYYY-MM-DD&monthYear=YYYY-MM` | `{ ingredients, mealTemplates, monthLogs, config, notificationLogs, baseRecipes, tomorrowSummary }` |
| `/api/ingredients` | `PATCH` | Toggle `inStock` / `boughtForWeek` or bulk reset week | `{ id, inStock?, boughtForWeek? }` or `{ action: "RESET_WEEK" }` | `{ ingredient }` or `{ ok: true }` |
| `/api/ingredients` | `POST` | Create new catalog ingredient | `{ name, category, unit, purchaseFrequency, weeklyNeed }` | `{ ingredient }` |
| `/api/meals` | `PUT` / `POST` | Update or create meal template & recalculate needs | `{ id?, monthYear, dayOfWeek, mealType, scheduledTime, title, description, ingredients[] }` | `{ mealTemplate }` |
| `/api/logs` | `POST` | Log meal check-in (photo + GPS) or hydration update | `{ action?: "HYDRATION", date, mealPlanTemplateId?, status?, actualNotes?, photoUrl?, latitude?, longitude?, locationName?, waterIntakeMl?, fastingWaterDone? }` | `{ log }` |
| `/api/alerts/check` | `POST` | Trigger Lookahead D+1 check & email dispatch | `{ date?: "YYYY-MM-DD" }` | `LookaheadResult` (`missingItems`, `status`, `htmlPreview`) |
| `/api/config` | `PUT` | Update `AppConfig` singleton (SMTP/Resend/Goals) | `Partial<AppConfig>` | `{ config }` |
| `/api/uploads` | `POST` | Persist compressed WebP meal photo to disk | `{ dataUrl: "data:image/webp;base64,..." }` or ` multipart/form-data` | `{ url: "/api/uploads/<filename>", sizeBytes }` |
| `/api/uploads/[filename]` | `GET` | Serve persisted meal photo from disk volume | Path param `filename` | Binary `image/webp` with immutable cache headers |

---

## 6. Non-Functional Requirements (NFRs)

1. **Memory Footprint (`NFR-PERF-01`):** Application container resident set size (RSS) in production MUST remain below $60\text{ MiB}$ under normal single-tenant/family workload (verified at $\sim 35\text{ MiB}$ for `nutritrack-app` and $\sim 13.4\text{ MiB}$ for `nutritrack-caddy`).
2. **Database Concurrency & Durability (`NFR-DATA-01`):** SQLite MUST initialize with `PRAGMA journal_mode=WAL;`, `PRAGMA synchronous=NORMAL;`, and `PRAGMA busy_timeout=5000;` so concurrent reads and cron checks never block UI writes.
3. **Storage Efficiency (`NFR-STOR-01`):** Every uploaded meal photo MUST be compressed client-side to WebP $\le 400\text{ KB}$ (and rejected server-side if $> 500\text{ KB}$), allowing over $100,000$ meal photos within a 64 GB Free Tier P6 SSD disk.
4. **Transport Security (`NFR-SEC-01`):** Production traffic MUST be served over HTTPS (TLS 1.2/1.3) via Caddy automatic Let's Encrypt certificates so mobile browsers permit `navigator.geolocation` and camera capture (`<input capture="environment">`).
5. **OOM Resilience on 1 GB RAM VMs (`NFR-OPS-01`):** Host VM provisioning scripts MUST configure a $4\text{ GB}$ `/swapfile` prior to building containers or compiling TypeScript bundles.
