/**
 * Online payment providers — NOT YET IMPLEMENTED.
 * Checkout is manual bank transfer + receipt upload only.
 * Uncomment and wire routes/webhooks when ready to ship.
 */

// import type { PaymentProvider } from "@prisma/client";

// export const PAYSTACK_CONFIG = {
//   publicKey: process.env.PAYSTACK_PUBLIC_KEY,
//   secretKey: process.env.PAYSTACK_SECRET_KEY,
//   webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
// } as const;

// export const FLUTTERWAVE_CONFIG = {
//   publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
//   secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
//   webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
// } as const;

// export const STRIPE_CONFIG = {
//   publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//   secretKey: process.env.STRIPE_SECRET_KEY,
//   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
// } as const;

/** Active checkout mode until online providers ship. */
export const CHECKOUT_MODE = "MANUAL" as const;