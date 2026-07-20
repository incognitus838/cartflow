import { isDemoStoreSlug } from "@/lib/demo/is-demo-store";

export type ManualPaymentAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
};

const INSTRUCTIONS =
  "Transfer the exact order total to the account below, then upload your payment screenshot or PDF before placing the order.";

/**
 * Resolve bank transfer details for checkout.
 * Demo storefronts never expose account numbers (prevents accidental real transfers).
 */
export function resolveManualPaymentAccount(
  business: {
    slug?: string | null;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
  },
): ManualPaymentAccount | null {
  if (business.slug && isDemoStoreSlug(business.slug)) {
    return null;
  }

  if (!business.bankName || !business.bankAccountName || !business.bankAccountNumber) {
    return null;
  }

  return {
    bankName: business.bankName,
    accountName: business.bankAccountName,
    accountNumber: business.bankAccountNumber,
    instructions: INSTRUCTIONS,
  };
}
