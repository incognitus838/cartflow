# Later — deferred work

Items we are intentionally not doing right now. Pick up when ready.

**Also see:** [delivery-zones-and-storage-roadmap.md](./delivery-zones-and-storage-roadmap.md) — location-based delivery fees + DB storage optimization (refined prompt + full spec).

---

## Transactional email (Resend)

**Status:** Code supports Resend (and ZeptoMail). Prefer Resend for cartflow.com.ng.

**Setup:**

1. Create a [Resend](https://resend.com) account.
2. **API Keys** → Create → copy `re_...` into `.env.local` as `RESEND_API_KEY`.
3. Set `EMAIL_PROVIDER=resend`.
4. **Quick test (before domain DNS):**
   ```
   TRANSACTIONAL_FROM_EMAIL="CartFlow <onboarding@resend.dev>"
   NOTIFICATION_FROM_EMAIL="CartFlow Orders <onboarding@resend.dev>"
   ```
   Send only to the email on your Resend account:
   `npm run test:email -- you@your-resend-login.com`
5. **Production domain:** Domains → Add `cartflow.com.ng` → add SPF/DKIM DNS records → wait for Verified.
6. Switch senders to `hello@cartflow.com.ng` / `orders@cartflow.com.ng`.
7. Push env to Vercel: `npm run vercel:sync-env` (requires `VERCEL_TOKEN`), then redeploy.

**ZeptoMail alternative:** set `ZEPTOMAIL_SEND_TOKEN` and `EMAIL_PROVIDER=zeptomail` instead.

**Already implemented (no code changes needed):**

- Welcome email on owner signup
- Store submitted / approved / rejected emails
- Team invite emails
- Order notification plumbing (`lib/email/`, `lib/notifications/`)

**Team accounts without email:** Settings → Team → **Create login** generates a password synced to the DB. Owner shares credentials manually.

**Related files:** `lib/email/`, `scripts/test-zeptomail.mjs`, `.env.example`