/**
 * Public CartFlow demo storefronts.
 * Demo checkout must NEVER show bank transfer details — visitors should not send money.
 */

/** Public demo store slug(s). */
export const DEMO_STORE_SLUGS = ["glow-beauty"];

export function isDemoStoreSlug(slug) {
  return DEMO_STORE_SLUGS.includes(String(slug || "").toLowerCase());
}

/** Clear bank fields so checkout cannot display transfer details. */
export const DEMO_BANK_CLEARED = {
  bankName: null,
  bankAccountName: null,
  bankAccountNumber: null,
};

/**
 * @deprecated Demo stores no longer seed fake bank accounts.
 * Kept so older scripts fail closed (clears bank instead of setting one).
 */
export const DEMO_BANK = DEMO_BANK_CLEARED;
