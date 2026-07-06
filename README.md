# CartFlow

Social commerce storefront and order management platform for WhatsApp/DM sellers in Nigeria and Africa.

## Stack

- **Next.js 16** (App Router, webpack dev)
- **React 19** · **Tailwind CSS 4** · **TypeScript**
- **Prisma** · **PostgreSQL**

## Getting started

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Or double-click `start-dev.bat`.

## Database setup (Step 0.2)

1. Copy env template:
   ```bash
   copy .env.example .env.local
   ```

2. Add your Neon `DATABASE_URL` to `.env.local` (same project as bank-app is fine).

3. CartFlow tables live in the **`cartflow` PostgreSQL schema** — bank-app's `public` tables are never touched.

4. Push schema and seed demo data (close dev server first):
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Browse data:
   ```bash
   npm run db:studio
   ```

Demo store after seed: `ada-styles` (**Ada Skincare**) with 6 skincare products.

## Project structure

```
app/              # Routes (landing, auth, dashboard, storefront)
components/       # UI components
lib/              # db, utils
prisma/           # Schema + seed
```

## Build plan

| Step | Status |
|------|--------|
| 0.1 Scaffold | ✅ |
| 0.2 Prisma + DB | ✅ |
| 0.3 Landing page | ✅ |
| 1.1 Schema (User → ProductImage) | ✅ |
| 1.2 Schema (Order → InventoryLog) | ✅ |
| 1.3 Migrations + seed | ✅ |
| 2.1 Auth (signup/login) | ✅ |
| 2.2 Onboarding wizard | ✅ |
| 2.3 Tenant isolation | ✅ |
| 2.4 Dashboard layout | ✅ |
| 3.1 Product list | ✅ |
| 3.2 Add/edit product form | ✅ |
| 3.3 Variants (size, color, SKU, stock) | ✅ |
| 3.4 Inventory (count, threshold, auto-deduct) | ✅ |
| 3.5 Store settings | ✅ |
| 4.1 Route `/{storeSlug}` | ✅ |
| 4.2 Product grid + detail page | ✅ |
| 4.3 Mobile-first layout, lazy images | ✅ |
| 4.4 Open Graph meta tags | ✅ |
| 5.1 Cart state (localStorage per store) | ✅ |
| 5.2 Checkout form | ✅ |
| 5.3 Order summary | ✅ |
| 5.4 Guest checkout | ✅ |
| 7.1 Orders dashboard | ✅ |
| 7.2 Status updates + internal notes | ✅ |
| 7.3 Email/SMS notifications | ✅ |
| 7.4 Basic analytics | ✅ |
| 8.1 PWA support | ✅ |
| 8.2 Subscription tiers | ✅ |
| 8.3 Deploy to Vercel | ✅ |
| 8.4 Admin panel | ✅ |

**Demo login** (after seed): `demo@cartflow.app` / `demo12345`

**Admin login** (after seed): `admin@cartflow.app` / `demo12345` → [/admin](http://localhost:3001/admin)

**Demo storefront** (after seed): [http://localhost:3001/ada-styles](http://localhost:3001/ada-styles)

## Deploy to Vercel

1. Push the repo to GitHub and import in [Vercel](https://vercel.com).
2. Set environment variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `AUTH_SECRET` — 32+ character random string
   - `NEXT_PUBLIC_APP_URL` — your production URL (e.g. `https://cartflow.vercel.app`)
   - Optional: `RESEND_API_KEY`, `TWILIO_*` for live notifications
3. Build command is `npm run vercel-build` (runs `prisma generate` then `next build`).
4. After first deploy, run `npm run db:push` against production DB (or use Neon SQL console).

## Notifications

In development, email/SMS are logged to the server console. In production, configure:

- **Email:** [Resend](https://resend.com) via `RESEND_API_KEY` + `NOTIFICATION_FROM_EMAIL`
- **SMS:** [Twilio](https://twilio.com) via `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`

All attempts are stored in `NotificationLog` and visible on order detail pages.

### Phase 1 models

**1.1** `User`, `Business`, `BusinessMember`, `Product`, `ProductVariant`, `ProductImage`

**1.2** `Customer`, `Order`, `OrderItem`, `InventoryLog`

**1.3** Migration at `prisma/migrations/20260705120000_init/`. Run `scripts\setup-db.bat` or:

```bash
npm run db:push
npm run db:seed
```

Verify: `GET /api/health` — should return table counts when DB is connected.

**Demo seed:** store `ada-styles` (Ada Skincare), 6 products (serums, SPF, moisturizers + variants), 1 customer, 1 paid order.

Rebrand catalog only: `npm run db:reseed-skincare`

**Production (fast):** `npm run build && npm run start` — much faster than `npm run dev` (webpack).