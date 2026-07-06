# CartFlow Platform Audit — Findings Log

> Started: 2026-07-06. Executing `prompts/full-platform-audit.txt`.

## Status

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Baseline | ✅ | tsc, build, dev, health 200 |
| 1 Surface | 🔄 | API smoke + route crawl in progress |
| 2 UX | 🔄 | Approvals UI, overview KPI fix, seller banner |
| 3 API | 🔄 | Smoke script added |
| 4 DB | ✅ | db:push in sync, Glow Beauty 60 products |
| 5 Security | ⏳ | IDOR pass pending |
| 6 Tests | 🔄 | API smoke 17/17 ✅; Playwright e2e needs dev warm-up |

## Issues found & fixed

| ID | Severity | Surface | Issue | Fix | Verified |
|----|----------|---------|-------|-----|----------|
| A1 | P0 | `/admin/approvals` | Page missing (dead end) | Added page + `StoreApprovalsPanel` | tsc |
| A2 | P1 | Admin overview | "Pending approval" mislabeled orders | Renamed + added Store reviews KPI | tsc |
| A3 | P1 | Seller dashboard | No approval status banner | `StoreApprovalBanner` in layout | tsc |
| A4 | P2 | Onboarding | "Your store is live" for PENDING stores | `pendingApproval` API flag + toast copy | pending |
| A5 | P1 | Glow Beauty | 520 products slowed site | Reduced to 60 (`PRODUCTS_PER_CATEGORY=6`) | seed |
| A6 | P1 | Storefront editor | Loaded full catalog | Preview sample (8 products) | prior e2e |
| A7 | P1 | Prisma runtime | Stale client in dev | `lib/db.ts` fingerprint refresh | prior fix |

## Truth table

| Claim | Evidence |
|-------|----------|
| Phase 0 build passes | `npx tsc --noEmit` + `npm run build` exit 0 |
| Health endpoint OK | `GET /api/health` → `{ ok: true, database: "connected" }` |
| `/admin/approvals` exists | `app/admin/approvals/page.tsx` |
| API smoke 17/17 routes | `audit-api-smoke-result.json` ok: true |
| E2E smoke | `e2e/smoke.spec.ts` (run after `npm run build` to pre-warm) |
| Glow Beauty 60 products | `npm run db:seed-beauty` total 60 |

## Remaining (next session)

- [ ] Full `npm run test:api` green after dev server warm
- [ ] Playwright 3/3 pass (increase timeout, pre-warm routes)
- [ ] Security IDOR sweep on product/order PATCH
- [ ] Button matrix e2e for every dashboard control
- [ ] `npm audit` review