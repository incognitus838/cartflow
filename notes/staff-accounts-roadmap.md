# Staff accounts — roadmap

Phase 1 (done): permissions without invites.

## Phase 2 — Invite flow

- [ ] Settings → Team: owner invites by email
- [ ] Accept invite link (new signup as `User.role = STAFF` or existing user adds membership)
- [ ] `BusinessMember` created with `role = STAFF`
- [ ] Owner can remove / suspend team members per store
- [ ] Gate on plan: set `staffAccounts: true` on PRO (and optionally cap seats per plan)
- [ ] Email notification on invite (Resend / similar)

## Phase 3 — Polish

- [ ] Custom roles beyond owner/staff (Manager, Fulfillment, Catalog-only)
- [ ] Per-permission toggles when inviting
- [ ] Activity audit log (“Payment approved by Jane · staff”)
- [ ] Staff badge in mobile chrome + switch store if member of multiple
- [ ] Mask bank details in any accidental API leak paths
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
| Team invites | yes | no (not built yet) |

## Notes

- Same `/dashboard` URL for everyone; staff see a reduced sidebar.
- `BusinessMember.role` per store is the source of truth (not only `User.role`).
- Admin impersonation always resolves as owner for the target store.