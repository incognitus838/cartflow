import type { BusinessPlan } from "@prisma/client";

export type PlanDefinition = {
  id: BusinessPlan;
  name: string;
  priceLabel: string;
  productLimit: number | null;
  analytics: boolean;
  staffAccounts: boolean;
  /** Max team seats for this store; null = unlimited. */
  staffSeatLimit: number | null;
  /** Max stores per owner account; null = 2+ (unlimited multi-store). */
  storeLimit: number | null;
  /** Reserved for Paystack/Flutterwave — not active yet; checkout is manual. */
  onlinePayments: boolean;
  /** Shown on billing as an upcoming Pro/Enterprise perk. */
  automatedTransfersSoon: boolean;
  description: string;
};

export const PLANS: Record<BusinessPlan, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Free",
    priceLabel: "₦0",
    productLimit: 10,
    analytics: false,
    staffAccounts: false,
    staffSeatLimit: 0,
    storeLimit: 1,
    onlinePayments: false,
    automatedTransfersSoon: false,
    description: "Up to 10 products, 1 store, manual bank transfer.",
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceLabel: "₦4,999/mo",
    productLimit: null,
    analytics: true,
    staffAccounts: false,
    staffSeatLimit: 0,
    storeLimit: 1,
    // onlinePayments: true, // Paystack/Flutterwave — implement later
    onlinePayments: false,
    automatedTransfersSoon: false,
    description: "Unlimited products, 1 store, manual payments, basic analytics.",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceLabel: "₦12,999/mo",
    productLimit: null,
    analytics: true,
    staffAccounts: true,
    staffSeatLimit: 5,
    storeLimit: 1,
    onlinePayments: false,
    automatedTransfersSoon: true,
    description: "5 team members, automated transfers soon, analytics, priority support.",
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    productLimit: null,
    analytics: true,
    staffAccounts: true,
    staffSeatLimit: null,
    storeLimit: null,
    onlinePayments: false,
    automatedTransfersSoon: true,
    description: "2+ stores, automated transfers soon, unlimited team, dedicated support.",
  },
};

export function getPlan(plan: BusinessPlan) {
  return PLANS[plan];
}

export function canAddProduct(plan: BusinessPlan, currentCount: number) {
  const limit = PLANS[plan].productLimit;
  if (limit == null) return true;
  return currentCount < limit;
}

export function hasAnalytics(plan: BusinessPlan) {
  return PLANS[plan].analytics;
}

export function planStaffSeatLimit(plan: BusinessPlan): number | null {
  return PLANS[plan].staffSeatLimit;
}

/** null = 2+ stores (Enterprise multi-store). */
export function planStoreLimit(plan: BusinessPlan): number | null {
  return PLANS[plan].storeLimit;
}

export function formatTeamLimit(plan: BusinessPlan) {
  const limit = planStaffSeatLimit(plan);
  if (limit === 0) return "Owner only";
  if (limit === null) return "Unlimited team members";
  return `${limit} team members`;
}

export function formatStoreLimit(plan: BusinessPlan) {
  const limit = planStoreLimit(plan);
  if (limit === null) return "2+ stores";
  return limit === 1 ? "1 store" : `Up to ${limit} stores`;
}

export function formatPaymentsFeature(plan: BusinessPlan) {
  if (PLANS[plan].automatedTransfersSoon) {
    return "Automated transfers (soon)";
  }
  return "Manual bank transfer";
}

export function planFeatureList(plan: BusinessPlan): string[] {
  const def = PLANS[plan];
  const features = [
    def.productLimit ? `Up to ${def.productLimit} products` : "Unlimited products",
    formatStoreLimit(plan),
    def.staffAccounts ? formatTeamLimit(plan) : "Owner only — no team seats",
    def.analytics ? "Analytics dashboard" : "Basic overview",
    formatPaymentsFeature(plan),
  ];
  return features;
}