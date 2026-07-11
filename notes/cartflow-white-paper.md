# CartFlow White Paper

**Social commerce for WhatsApp sellers — storefront, orders, and inventory in one link.**

| | |
|---|---|
| **Version** | 1.0 (Launch) |
| **Date** | July 2026 |
| **Live app** | https://cartflow-839.vercel.app |
| **Audience** | Sellers, operators, partners, and CartFlow admins |

---

## Executive summary

CartFlow is a mobile-first social commerce platform built for entrepreneurs who sell through WhatsApp, Instagram DMs, and word of mouth — especially in Nigeria and across Africa. Instead of juggling screenshots, spreadsheets, and “send account details” messages, sellers get a polished storefront URL, a structured checkout flow, and a dashboard to approve payments, fulfill orders, and manage stock.

**v1 is launch-ready.** Sellers collect payment via **manual bank transfer**, customers upload a payment receipt at checkout, and the seller approves or declines payment in the dashboard. Inventory deducts on approval and restores on refund. Store details, bank accounts, and contact information are stored in the database and reflected on the live storefront — not hardcoded.

**What is manual in v1 (by design):** Automated email and SMS notifications are wired in code but not configured in production. Sellers monitor new orders in the dashboard and follow up with customers on WhatsApp or phone. Transactional email is planned for v2.

---

## Table of contents

1. [The problem](#1-the-problem)
2. [The CartFlow solution](#2-the-cartflow-solution)
3. [Who CartFlow is for](#3-who-cartflow-is-for)
4. [Platform capabilities](#4-platform-capabilities)
5. [How to use CartFlow — Sellers](#5-how-to-use-cartflow--sellers)
6. [How to use CartFlow — Customers](#6-how-to-use-cartflow--customers)
7. [How to use CartFlow — Platform admins](#7-how-to-use-cartflow--platform-admins)
8. [Plans and limits](#8-plans-and-limits)
9. [Architecture and trust](#9-architecture-and-trust)
10. [v1 limitations and v2 roadmap](#10-v1-limitations-and-v2-roadmap)
11. [Getting started](#11-getting-started)
12. [Conclusion](#12-conclusion)

---

## 1. The problem

Millions of small businesses in Africa run on chat. A typical sale looks like this:

1. Customer sees a product on WhatsApp status or Instagram.
2. They DM the seller: “How much? Account number?”
3. Seller replies with price, bank details, and delivery fee — often from memory or a notes app.
4. Customer transfers money and sends a screenshot.
5. Seller scrolls through chats to match payment to order, updates a notebook or Excel sheet, and hopes they did not oversell.

This works at small scale. It breaks when:

- **Orders pile up** — receipts get lost in chat threads.
- **Stock is wrong** — two customers pay for the last unit.
- **The brand looks informal** — no consistent catalog, no order numbers, no tracking.
- **The seller cannot delegate** — everything lives in one person’s phone.

CartFlow replaces the fragile chat workflow with a **single store link** and a **shared source of truth** for products, orders, payments, and inventory.

---

## 2. The CartFlow solution

CartFlow gives every approved seller:

| Layer | What it does |
|-------|----------------|
| **Storefront** | Public catalog at `cartflow.app/your-shop` — mobile-first, shareable anywhere |
| **Cart & checkout** | Guest checkout, delivery zones, promo codes, bank transfer + receipt upload |
| **Seller dashboard** | Orders, payment review (approve / decline / refund), products, settings, analytics |
| **Admin console** | Store approval, plan assignment, platform metrics, impersonation for support |

### Core workflow (v1)

```
Share store link → Customer browses → Adds to bag → Checkout
    → Pays seller's bank account → Uploads receipt → Places order (PENDING)
    → Seller reviews receipt in dashboard → Approves → Order PAID → Stock deducts
    → Seller ships / delivers → Updates status → Customer tracks via order link
```

Payment is **seller-direct**: money goes to the seller’s bank account. CartFlow does not hold funds in v1. The platform’s role is order structure, payment proof, and operational clarity.

---

## 3. Who CartFlow is for

### Primary: WhatsApp / social sellers

- Beauty, skincare, fashion, food, gadgets, digital products, services
- Sellers who want a professional link without building a custom website
- Teams of one to five people fulfilling orders daily

### Secondary: CartFlow operators

- Platform admins who onboard sellers, approve stores, assign plans, and support fulfillment issues

### Not the primary focus in v1

- Large marketplaces with multi-vendor single checkout
- Fully automated card payments (Paystack / Flutterwave — v2)
- Enterprise ERP integrations

---

## 4. Platform capabilities

### Storefront

- Custom store URL (`/your-shop`)
- Logo, description, theme accent, catalog layout options
- Product grid with lazy-loaded images
- Product detail pages with variants
- Open Graph meta tags for link previews on WhatsApp and social
- Contact via WhatsApp chat button (uses seller phone / WhatsApp from settings)
- Order tracking page (`/your-shop/track`)

### Catalog types

When adding a product, sellers choose a catalog type. Variant labels adapt automatically:

| Type | Example use | Default variant label |
|------|-------------|------------------------|
| **Online store** | Gadgets, personal brands | Model |
| **Digital store** | Courses, ebooks | Module |
| **Services & bookings** | Consulting, personal shopper | Package |
| **Retail inventory** | Fashion, home goods | Size |
| **Food & drinks** | Meals, groceries | Weight |

### Checkout

- Guest checkout (no customer account required)
- Delivery zones with location-based fees (or store-wide default fee)
- Promo / discount codes
- Manual bank transfer instructions (bank name, account name, account number from seller settings)
- Payment receipt upload (screenshot or PDF) before order submission
- Order confirmation with order number and tracking link

### Seller dashboard

- **Overview** — KPIs: total orders, awaiting approval, revenue, average order value, low-stock alerts
- **Orders** — Filter by status; open order detail; approve, decline, or refund payments; update fulfillment status; internal notes
- **Products** — Add, edit, archive; variants, SKU, stock; product images
- **Promotions** — Create and manage discount codes
- **Analytics** — Sales and order trends (tier-dependent)
- **Storefront editor** — Theme, tagline, welcome message, layout
- **Settings** — Store profile, contact, currency, delivery fee, **bank transfer details**, inventory rules, notification preferences
- **Delivery zones** — Named zones with fees for checkout
- **Team** — Invite staff with roles (owner-managed; Pro tier expands seats)
- **Billing** — View current plan (changes by admin in v1)

### Inventory

- Per-product and per-variant stock counts
- Low-stock threshold and dashboard banner
- Optional auto-deduct when order is marked paid
- Stock restored automatically on refund

### Admin panel

- Pending store approvals with readiness checklist (bank, phone, catalog)
- Approve or reject with plan assignment (Free / Starter / Pro)
- Platform analytics, orders, users, customers
- Impersonate seller for support (audit logged)

---

## 5. How to use CartFlow — Sellers

### Step 1: Sign up

1. Go to **https://cartflow-839.vercel.app/signup**
2. Enter your name, email, and password.
3. Upload a store logo (optional, ~200 KB).
4. Complete onboarding: store name, URL slug, description, phone, WhatsApp, and **bank transfer details**.

Your application enters **pending approval**. CartFlow admins review before the store goes live.

### Step 2: Complete setup while pending

From **Dashboard → Overview**, use the setup checklist:

- Bank account on file
- Phone / WhatsApp contact
- At least one product category with products
- Submit for review (if applicable)

### Step 3: Add products

1. Open **Dashboard → Products → Add product**.
2. Choose catalog type (online, digital, services, retail, or food).
3. Add title, description, price, images, and variants if needed.
4. Set stock per variant or product.
5. Save — product appears on your storefront when the store is approved and active.

### Step 4: Configure settings

**Dashboard → Settings**

| Section | What to set |
|---------|-------------|
| **Store profile** | Name, URL slug, description, logo |
| **Contact & checkout** | Phone, WhatsApp, currency (NGN, GHS, KES, USD), default delivery fee |
| **Bank transfer details** | Bank name, account name, account number — shown to customers at checkout |
| **Inventory** | Auto-deduct stock when orders are paid |
| **Notifications** | Preferences for email alerts (delivery in v2) |
| **Delivery zones** | Areas you deliver to and their fees |
| **Team** | Staff logins and roles |

Changes save to the database immediately. The live storefront updates after save (cache is cleared automatically).

### Step 5: Share your store

Your store URL:

```
https://cartflow-839.vercel.app/your-slug
```

Share it on:

- WhatsApp status and broadcast lists
- Instagram bio link
- Facebook posts
- Business cards and flyers

### Step 6: Fulfill orders

1. Open **Dashboard → Orders**.
2. New orders appear as **Pending** (payment awaiting your review).
3. Open the order — view customer details, items, total, and **uploaded payment receipt**.
4. **Approve** if payment matches → order becomes **Paid**, stock deducts (if enabled).
5. **Decline** if receipt is invalid — customer may need to re-pay.
6. **Refund** if you need to reverse a paid order — stock is restored.
7. Update status: Processing → Shipped → Delivered as you fulfill.

**v1 tip:** Check the dashboard regularly for new orders. Email alerts are not live yet — use WhatsApp to confirm with customers if needed.

### Step 7: Let customers track orders

Customers can visit:

```
https://cartflow-839.vercel.app/your-slug/track
```

They enter their order number (e.g. `CF-20260711-0042`) to see status and summary.

---

## 6. How to use CartFlow — Customers

### Browse and buy

1. Open the seller’s store link (from WhatsApp, social, or QR).
2. Browse products — tap to view details and variants.
3. Add items to your bag.
4. Open the bag and proceed to **Checkout**.

### Checkout

1. Enter your name, phone, and delivery address.
2. Select a delivery zone if the store uses zones (fee updates automatically).
3. Apply a promo code if you have one.
4. Read **Pay by bank transfer** — bank details come from the seller’s settings.
5. Transfer the **exact order total** to the account shown.
6. **Upload your payment receipt** (screenshot or PDF).
7. Place the order — you receive an **order number**.

### After placing the order

- Save your order number.
- Use the tracking link to check status.
- Contact the seller on WhatsApp if you need help (use the **Chat** button on the store header).
- The seller approves your payment — you may get a manual WhatsApp update in v1 (automated email in v2).

---

## 7. How to use CartFlow — Platform admins

Admin login: **https://cartflow-839.vercel.app/admin**

### Daily operations

| Task | Where |
|------|--------|
| Review new store applications | Admin → Approvals |
| Approve with plan (Free / Starter / Pro) | Approval detail panel |
| Reject with reason | Approval detail panel |
| View platform orders and revenue | Admin → Analytics |
| Support a seller | Admin → Impersonate → seller dashboard |
| Change a seller’s plan | Admin → Users / Stores (billing read-only for sellers in v1) |

### Approval checklist

Before approving, confirm:

- Valid bank details on file
- Phone or WhatsApp contact
- Real products in catalog (not empty placeholder store)
- Appropriate plan for expected volume

---

## 8. Plans and limits

| Plan | Price | Highlights |
|------|-------|------------|
| **Free** | ₦0 | Up to 10 products, store link, order dashboard, manual bank transfer |
| **Starter** | ₦4,999/mo | Unlimited products, receipt upload, low-stock banner, basic analytics |
| **Pro** | ₦12,999/mo | Everything in Starter, extended analytics, up to 5 team seats, email support |

Plan changes are assigned by **CartFlow admins** in v1. Sellers view their plan at **Dashboard → Billing** (read-only).

---

## 9. Architecture and trust

| Component | Technology |
|-----------|--------------|
| Application | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL (Neon) via Prisma |
| Hosting | Vercel |
| File storage | Vercel Blob (logos, receipts, product media) |
| Auth | Session-based, tenant-isolated per business |

### Data isolation

Each seller’s products, orders, customers, and settings are scoped to their **business** record. Staff access is controlled by role (owner, manager, staff) with granular permissions.

### Seller data on the storefront

Store name, logo, description, phone, WhatsApp, bank details, and delivery configuration are loaded from the database. Demo seed data (used only in development) is not embedded in the production application.

---

## 10. v1 limitations and v2 roadmap

### Known v1 limitations

| Area | v1 behavior | v2 plan |
|------|-------------|---------|
| **Email / SMS notifications** | Code exists; not configured in production | Resend + domain setup; order and status emails |
| **Card / wallet payments** | Manual bank transfer only | Paystack, Flutterwave, webhooks |
| **Self-serve billing** | Admin assigns plan | Seller upgrades in-app |
| **Custom domain** | `cartflow.app/slug` only | `shop.yourbrand.com` |
| **Digital file delivery** | URL field on product | Hosted files with signed download links |
| **Service booking** | Catalog type only | Calendar and time slots |

See `notes/v2-roadmap.md` for the full roadmap.

---

## 11. Getting started

### For sellers

1. Visit https://cartflow-839.vercel.app
2. Click **Start free** → Sign up
3. Complete onboarding and wait for approval
4. Add products, configure bank details in Settings
5. Share your store link

### For developers (local)

```bash
git clone <repo>
cd cartflow
copy .env.example .env.local   # add DATABASE_URL, AUTH_SECRET
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3001. Demo seller: `demo@cartflow.app` / `demo12345`. Demo store: `/ada-styles`.

### Health check

`GET /api/health` — returns database connectivity and table counts when configured.

---

## 12. Conclusion

CartFlow turns informal chat selling into a **repeatable, trackable business operation** without forcing sellers to learn e-commerce platforms built for Western retail. v1 delivers the essentials: a beautiful store link, structured checkout with payment proof, seller-controlled fulfillment, and inventory that stays honest.

Automated notifications and integrated payments are the next layer — but sellers can **ship today** with manual bank transfer, dashboard order review, and WhatsApp as the human touchpoint customers already trust.

**CartFlow — effortless commerce. Timeless elegance.**

---

*For support, onboarding, or partnership inquiries, contact your CartFlow platform administrator.*

*Document maintained in the CartFlow repository: `notes/cartflow-white-paper.md`*