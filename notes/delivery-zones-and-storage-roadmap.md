# Delivery zones + DB storage optimization

Deferred work. Read this before implementing either track.

---

## Refined prompt (paste for a future build session)

```
Implement two tracks for CartFlow:

### Track A — Location-based delivery fees (seller-configured)

Sellers configure delivery zones/options in the dashboard (e.g. "Lekki ₦2,000", "Ikeja ₦1,500", "Pickup — free").
Buyers only see delivery when the cart contains at least one deliverable product (PHYSICAL / FOOD — not DIGITAL or SERVICE-only carts).

Storefront UX:
- Cart and checkout show a "Delivery location" selector (chips or dropdown).
- Tapping a location updates the delivery fee live in the order summary.
- Selected zone id + label + fee are submitted with checkout and stored on the order.
- Default: no location selected → prompt to choose before place order (if delivery required).

Dashboard UX:
- Settings → Delivery: manage zones (name, fee, sort order, active/inactive).
- Keep a flat default fee as fallback during migration, then deprecate single `Business.deliveryFee` field.

Data model:
- New `DeliveryZone` table (businessId, name, fee, sortOrder, isActive).
- Order stores snapshot: deliveryZoneId (nullable), deliveryZoneName, deliveryFee.
- Cart/checkout API validates zone belongs to store and fee matches server-side.

Edge cases:
- Mixed cart (physical + digital): charge delivery once if any line needs delivery.
- Service / pickup-only zone with ₦0 fee.
- Seller disables all zones → treat as "delivery not offered" for physical products.

### Track B — Storage optimization (before Neon billing)

Reduce Postgres blob growth without changing seller UX:
1. Product images → object storage (Vercel Blob or R2); DB keeps URL only.
2. Receipt uploads → compress/resize on upload; optional move to object storage.
3. Optional: archive orders older than 12 months (receipt bytes to cold storage, metadata in DB).

Document migration steps, env vars, and rollback. Add `scripts/db-usage.mjs` to CI or admin dashboard for monitoring.

Do not break existing orders that already have bytes in `paymentReceiptData` / `ProductMediaAsset`.
```

---

## Track A — Location-based delivery (detailed spec)

### Problem today

- One flat `Business.deliveryFee` (e.g. ₦2,000) applies to **every** order.
- Checkout always adds it in `lib/orders/create.ts` via `toNumber(business.deliveryFee)`.
- No way to charge Lekki vs mainland vs pickup differently.
- Delivery tracking assumes `address OR fee > 0` — not tied to product type.

### Desired behavior

| Actor | Experience |
|-------|------------|
| **Seller** | Adds named zones with fees; reorders them; can disable a zone without deleting. |
| **Buyer** | Sees location options on cart/checkout; tap one → fee updates instantly. |
| **System** | Only shows delivery UI if cart has deliverable items. |

**Deliverable product types:** `PHYSICAL`, `FOOD` (and variants).  
**Non-deliverable:** `DIGITAL`, `SERVICE` (unless seller explicitly enables delivery for a service — phase 2).

### Suggested schema

```prisma
model DeliveryZone {
  id         String   @id @default(cuid())
  businessId String
  name       String   // "Lekki Phase 1", "Pickup at store"
  fee        Decimal  @db.Decimal(12, 2)
  sortOrder  Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  business Business @relation(...)
  @@index([businessId, sortOrder])
  @@schema("cartflow")
}

// Order — add snapshot fields (keep deliveryFee for totals)
deliveryZoneId   String?
deliveryZoneName String?  // snapshot if zone deleted later
```

Keep `Business.deliveryFee` temporarily as **fallback** when no zones exist (backward compatible).

### API surface

| Endpoint | Purpose |
|----------|---------|
| `GET/POST/PATCH/DELETE /api/business/delivery-zones` | Dashboard CRUD |
| `GET /api/storefront/[slug]/delivery-zones` | Public active zones for cart |
| `POST /api/storefront/[slug]/checkout` | Accept `deliveryZoneId`; validate fee server-side |

### Storefront components to touch

- `cart-page.tsx` / `cart-drawer.tsx` — zone picker + live total
- `checkout-form.tsx` — require zone when `cartNeedsDelivery`
- `order-summary.tsx` — show selected zone name + fee line
- `lib/orders/create.ts` — use zone fee, not flat `business.deliveryFee`
- `lib/cart/storage.ts` — persist `selectedDeliveryZoneId` in cart session (optional)

### UX notes (mobile-first)

- Use **horizontal chips** or **bottom sheet** for zone list on mobile.
- Show fee next to each label: `Lekki · ₦2,000`.
- Selected chip = store accent color.
- One-tap change; no page reload (client state + refetch summary).

### Migration plan

1. Ship `DeliveryZone` + dashboard UI; seed one zone per store from current `deliveryFee`.
2. Storefront reads zones; if empty, fall back to flat fee.
3. After all stores migrated, hide flat fee field in settings.

### Acceptance criteria

- [ ] Seller creates 3 zones; buyer sees all active zones on checkout.
- [ ] Selecting zone updates total without refresh.
- [ ] Order row stores zone name + fee snapshot.
- [ ] Digital-only cart hides delivery picker and charges ₦0 delivery.
- [ ] Invalid/tampered `deliveryZoneId` rejected at checkout API.

---

## Track B — Storage optimization (before paying Neon)

### Why this matters

CartFlow stores **binary data inside Postgres**:

| Table | Column | What |
|-------|--------|------|
| `ProductMediaAsset` | `data` | Product images (added for Vercel — no `/public` disk) |
| `Order` | `paymentReceiptData` | Checkout receipt screenshots/PDFs |

Text rows (products, orders, users) are tiny. **Images and receipts** drive GB growth.

**Current usage (Jul 2026):** ~16 MB total DB, ~4 MB binaries, 9 stores, 71 products.  
**Neon Free cap:** 0.5 GB/project. Plenty of headroom today.

### When to act

| Signal | Action |
|--------|--------|
| DB &gt; 200 MB | Plan object-storage migration |
| DB &gt; 400 MB | Execute migration before hitting 0.5 GB free cap |
| Neon emails "storage limit" | Upgrade Launch (~$0.35/GB/mo) **or** finish migration |

Monitor with: `npx dotenv-cli -e .env.local -- node scripts/db-usage.mjs`

### Strategy 1 — Product images → object storage

**Today:** Upload → `ProductMediaAsset` bytes → URL `/api/products/media/[id]`.

**Target:**

1. Upload to **Vercel Blob** (already on Vercel) or **Cloudflare R2** (cheaper at scale).
2. Store `https://...` in `ProductImage.url` only; drop blob from Postgres (or stop writing new blobs).
3. Keep `GET /api/products/media/[id]` as redirect/legacy for old rows.

**Steps:**

1. Add env: `BLOB_READ_WRITE_TOKEN` (Vercel) or R2 credentials.
2. Change `POST /api/products/media` to upload to blob; return public URL.
3. Backfill script: read `ProductMediaAsset`, upload to blob, update `ProductImage.url`, delete asset row.
4. `vercel-build` unchanged; smaller DB backups.

**Rollback:** New uploads can dual-write (blob + DB) during transition.

### Strategy 2 — Compress receipt uploads

**Today:** Raw file bytes saved to `Order.paymentReceiptData`.

**Target:**

1. On `parseReceiptFile` in checkout: resize images to max 1600px JPEG ~80% quality.
2. Reject PDFs &gt; 2 MB or rasterize first page only (optional).
3. Typical receipt: 300 KB → 80 KB (4× less storage per order).

**Steps:**

1. Add `sharp` (or serverless-friendly image lib) in `lib/uploads/receipt.ts`.
2. Log before/after sizes in dev.
3. No schema change — same column, smaller bytes.

### Strategy 3 — Archive old orders (optional, later)

**When:** 10k+ orders with receipts.

1. Orders older than 12 months: move `paymentReceiptData` to object storage.
2. DB keeps `paymentReceiptArchiveUrl` + metadata.
3. Dashboard receipt viewer checks URL first, falls back to DB bytes.

### What we did already

- `scripts/db-usage.mjs` — reports DB size, schema size, media/receipt MB, counts.
- Product media in DB (fix for Vercel `ENOENT` on `/public`) — correct for launch, not for scale.
- Receipts in DB — same tradeoff.

### What we have not done yet

- Object storage integration
- Receipt compression
- Archive job
- Admin storage dashboard widget

### Cost reference (Neon, 2026)

| Plan | Storage |
|------|---------|
| Free | 0.5 GB included |
| Launch / Scale | $0.35 per GB-month beyond included |

Upgrading is fine short-term; **object storage + compression** is the long-term fix.

---

## Suggested implementation order

1. **Delivery zones** — seller-facing value, no infra change.
2. **Receipt compression** — quick win, one file change.
3. **Product images → blob** — bigger migration, highest savings.
4. **Archive job** — only if order volume demands it.

---

## Related files (today)

| Area | Path |
|------|------|
| Flat delivery fee | `prisma/schema.prisma` → `Business.deliveryFee` |
| Checkout totals | `lib/orders/create.ts` |
| Store settings | `components/dashboard/store-settings-form.tsx` |
| Product media DB | `lib/products/media-storage.ts`, `ProductMediaAsset` |
| Receipt DB | `lib/uploads/receipt.ts`, `Order.paymentReceiptData` |
| DB usage script | `scripts/db-usage.mjs` |
| Plans (product limits) | `lib/plans/index.ts` |