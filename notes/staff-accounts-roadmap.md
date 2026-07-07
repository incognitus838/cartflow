# Staff accounts — roadmap

Phase 1 (done): permissions without invites.

## Phase 2 — Invite flow (done)

- [x] Settings → Team: owner invites by email
- [x] Accept invite link (new signup as `User.role = STAFF` or existing user adds membership)
- [x] `BusinessMember` created with `role = STAFF`
- [x] Owner can remove / suspend team members per store
- [x] Gate on plan: `staffAccounts: true` on PRO (cap 5 seats)
- [x] Email notification on invite

## Phase 3 — Polish (done)

- [x] Custom roles beyond owner/staff (Manager, Fulfillment, Catalog-only)
- [x] Per-permission toggles when inviting
- [x] Activity audit log (“Payment approved by Jane · staff”)
- [x] Staff badge in mobile chrome + switch store if member of multiple
- [x] Mask bank details in settings API for non-owners
- [ ] E2E: staff cannot PATCH settings, can PATCH order status

## Permission matrix (v1 — implemented)

| Area | Owner | Staff |
|------|-------|-------|
| Overview | yes | yes |
| Orders (view, update status, notes) | yes | yes |
| Payment approve/reject | yes | no |
| Products (add/edit) | yes | yes |
| Products (delete) | yes | no |
| Catalog | yes | yes |
| Promotions (add/edit) | yes | yes |
| Promotions (delete) | yes | no |
| Analytics | yes | yes (read) |
| Storefront editor | yes | no |
| Settings | yes | no |
| Billing / plan | yes | no |
| Team invites | yes | no |

## Notes

- Same `/dashboard` URL for everyone; staff see a reduced sidebar.
- `BusinessMember.role` per store is the source of truth (not only `User.role`).
- Admin impersonation always resolves as owner for the target store.
- Settings → Team tab: `/dashboard/settings?tab=team`
- Invite URL: `/invite/{token}`