# Later — deferred work

Items we are intentionally not doing right now. Pick up when ready.

**Also see:** [delivery-zones-and-storage-roadmap.md](./delivery-zones-and-storage-roadmap.md) — location-based delivery fees + DB storage optimization (refined prompt + full spec).

---

## Transactional email (ZeptoMail)

**Status:** Code supports ZeptoMail; add token + verified domain to go live.

**Setup (cartflow.com.ng):**

1. Create a [ZeptoMail](https://www.zoho.com/zeptomail/) account and **Agent**.
2. Add and verify **cartflow.com.ng** in the Agent (SPF + DKIM DNS records ZeptoMail provides).
3. Add sender addresses in ZeptoMail (e.g. `hello@cartflow.com.ng`, `orders@cartflow.com.ng`).
4. Copy **Send Mail Token**: Agent → SMTP/API → API tab.
5. Add to `.env.local`:
   ```
   ZEPTOMAIL_SEND_TOKEN="your-send-mail-token"
   TRANSACTIONAL_FROM_EMAIL="hello@cartflow.com.ng"
   NOTIFICATION_FROM_EMAIL="orders@cartflow.com.ng"
   ```
6. Test locally: `npm run test:email -- your@email.com`
7. Push to Vercel: `npm run vercel:sync-env` (syncs email vars from `.env.local`), then redeploy.

**Legacy Resend:** still supported if `RESEND_API_KEY` is set and `ZEPTOMAIL_SEND_TOKEN` is empty. Set `EMAIL_PROVIDER=resend` to force Resend when both are present.

**Already implemented (no code changes needed):**

- Welcome email on owner signup
- Store submitted / approved / rejected emails
- Team invite emails
- Order notification plumbing (`lib/email/`, `lib/notifications/`)

**Team accounts without email:** Settings → Team → **Create login** generates a password synced to the DB. Owner shares credentials manually.

**Related files:** `lib/email/`, `scripts/test-zeptomail.mjs`, `.env.example`