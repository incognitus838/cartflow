import type { BusinessPlan } from "@prisma/client";

export type PlanDefinition = {
  id: BusinessPlan;
  name: string;
  priceLabel: string;
  productLimit: number | null;
  analytics: boolean;
  staffAccounts: boolean;
  /** Reserved for Paystack/Flutterwave — not active yet; checkout is manual. */
  onlinePayments: boolean;
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
    onlinePayments: false,
    description: "Up to 10 products, manual bank transfer, order dashboard.",
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceLabel: "₦4,999/mo",
    productLimit: null,
    analytics: true,
    staffAccounts: false,
    // onlinePayments: true, // Paystack/Flutterwave — implement later
    onlinePayments: false,
    description: "Unlimited products, manual payments, basic analytics.",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceLabel: "₦12,999/mo",
    productLimit: null,
    analytics: true,
    staffAccounts: false, // staff invites — implement later
    onlinePayments: false,
    description: "Unlimited products, analytics, priority support (coming soon).",
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    productLimit: null,
    analytics: true,
    staffAccounts: false,
    onlinePayments: false,
    description: "Custom limits, dedicated support, SLA.",
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