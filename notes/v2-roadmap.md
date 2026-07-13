# CartFlow v2 roadmap

Last updated: 2026-07-11  
Live app: https://cartflow-839.vercel.app

v1 is **clear to ship** for manual bank-transfer sellers. Production smoke and API audit pass; seller settings and bank accounts are DB-backed (no runtime hardcoding). v2 focuses on payments automation, notifications, self-serve growth, and operational scale.

**Manual ops today (acceptable for v1):** Order and status updates are handled by sellers in the dashboard — **email/SMS notifications are not live in production** (`RESEND_API_KEY` / domain not configured). Team invites and customer updates are done manually (WhatsApp, phone, dashboard). Fix in v2.

---

## v1 complete (shipped)

- Store signup with logo upload, catalog types (online / digital / services / retail / food)
- Storefront, cart, checkout with receipt upload, delivery zones
- Seller dashboard: orders, payment approve/decline/refund, inventory sync, KPIs
- Admin: store approval, plan assignment, impersonation, platform overview
- Order tracking for customers; stock deduct on approve, restore on refund
- Seller settings & bank details synced with DB; storefront cache revalidates on save
- Production smoke (7/7) + API audit (17/17 steps/routes)

---

## v2 — Notifications (priority — manual today)

| Item | Why | v1 workaround |
|------|-----|----------------|
| **Transactional email (Resend)** | New order alerts, approval/rejection, welcome, team invites — code exists but **not configured** | Sellers check dashboard; owner shares team passwords manually |
| **Customer order status email/SMS** | `notifyCustomerOnStatus` toggle has no live delivery | Seller updates status in dashboard; customer tracks via order link / WhatsApp |
| **Receipt / payment reminders** | Reduce abandoned PENDING orders | Seller follows up manually (WhatsApp) |
| Domain + env setup (`RESEND_API_KEY`, `TRANSACTIONAL_FROM_EMAIL`, `NOTIFICATION_FROM_EMAIL`) | Required before any email sends in prod | N/A — deferred |

**Success metric:** Seller receives email within 60s of new order; customer receives email on status change when enabled.

See also: `notes/later.md` (Resend setup steps), `lib/email/`, `lib/notifications/`.

---

## v2 — Payments & billing

| Item | Why |
|------|-----|
| Paystack / Flutterwave integration | Remove manual receipt friction; Pro/Enterprise promise |
| Automated payment webhooks | Auto-mark orders PAID; optional skip seller receipt review |
| Self-serve subscription checkout | Sellers upgrade without admin; proration & invoices |
| Payout / settlement reporting | Sellers see what CartFlow owes vs what they collected |

**Success metric:** ≥50% of new orders confirmed without manual receipt review.

---

## v2 — Seller growth

| Item | Why |
|------|-----|
| WhatsApp order notifications (deep links) | Primary channel for NG/Africa sellers |
| Shareable product cards (OG + WA preview) | Viral storefront links |
| Abandoned cart / receipt reminders | Recover PENDING orders with no receipt |
| Basic email/SMS receipt nudges | Covered in Notifications section above |
| Referral / affiliate codes | Growth loop for power sellers |

---

## v2 — Catalog & commerce

| Item | Why |
|------|-----|
| Digital file hosting (not just delivery URL) | Upload PDF/video to Blob; signed download links |
| Service booking calendar | Time slots for personal shoppers, consultants |
| Multi-image variant swatches | Gadgets/fashion UX |
| Bulk product import (CSV) | Onboarding speed |
| Collections / featured products on homepage | Merchandising beyond flat catalog |

---

## v2 — Operations & admin

| Item | Why |
|------|-----|
| Seller health dashboard (dormant, at-risk) | Proactive support using existing tier model |
| Pending receipt SLA alerts | Admin sees stores with backlog >24h |
| Audit log export | Compliance & dispute resolution |
| Rate limits & abuse detection on public APIs | Signup/logo/upload hardening |
| Staging environment + preview deployments per PR | Safer releases |

---

## v2 — Mobile & UX polish (remaining)

| Item | Status |
|------|--------|
| Product in-bag UX | Done in v1.1 polish |
| Checkout mobile sticky CTA + summary first | Done in v1.1 polish |
| Dashboard orders mobile layout | Done in v1.1 polish |
| Native PWA install prompts | Optional |
| Offline cart read (localStorage already) | Document / test |

---

## v2 — Technical debt

- Migrate legacy `catalogSettings.templateId` values via `db:migrate-catalog` script in CI
- Receipt archival to Blob for orders >12 months (roadmap in `delivery-zones-and-storage-roadmap.md`)
- E2E suite against production smoke path (signup → product → order → approve → stock)
- Structured logging + error monitoring (Sentry/Vercel Analytics alerts)
- API versioning for mobile apps (if needed)

---

## Suggested v2 sequencing

1. **Transactional email (Resend + domain)** — unblocks order alerts; code wired, config missing  
2. **Paystack checkout** — highest seller/customer pain after notifications  
3. **WhatsApp notifications** — low effort, high retention  
4. **Self-serve billing** — revenue for CartFlow
5. **Digital file delivery** — unlock digital-store catalog fully  
6. **Service booking** — unlock services catalog fully  
7. **Admin SLA + seller health** — scale support without headcount

---

## Out of scope (v3+)

- Multi-currency FX checkout
- Marketplace (multi-vendor single checkout)
- POS / in-person tap-to-pay
- Native iOS/Android apps