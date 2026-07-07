# Later — deferred work

Items we are intentionally not doing right now. Pick up when ready.

---

## Transactional email (Resend)

**Status:** Code is wired; not configured in production. Safe to ignore for now — app works without it.

**When we pick this up:**

1. Verify a domain we own in [Resend](https://resend.com/domains) (not `*.vercel.app` — Vercel subdomains cannot be verified).
2. Set Vercel env vars:
   - `RESEND_API_KEY`
   - `TRANSACTIONAL_FROM_EMAIL` (e.g. `hello@yourdomain.com`)
   - `NOTIFICATION_FROM_EMAIL` (e.g. `orders@yourdomain.com`)
3. Redeploy.

**Testing without a custom domain (limited):** use `onboarding@resend.dev` — only delivers to the Resend account email.

**Already implemented (no action needed until config):**

- Welcome email on owner signup
- Store submitted / approved / rejected emails
- Team invite emails
- Order notification plumbing (`lib/email/`, `lib/notifications/`)

**Related files:** `lib/email/`, `.env.example` (comments on domain vs app URL)