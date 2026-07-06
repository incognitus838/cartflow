/** Fulfilled = revenue-recognized order statuses (platform GMV denominator). */
export const FULFILLED_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export type SellerHealthTier = "thriving" | "active" | "at_risk" | "dormant" | "activating" | "inactive";

export const METRIC_DEFINITIONS = {
  gmv: {
    label: "GMV",
    definition:
      "Sum of order.total where status ∈ PAID, PROCESSING, SHIPPED, DELIVERED within the selected period.",
    action: "Track platform revenue velocity; compare period-over-period.",
  },
  activeSellers: {
    label: "Active sellers",
    definition: "Distinct businesses with ≥1 order (any status) created in the selected period.",
    action: "Size of the engaged seller base; pair with dormant count for outreach.",
  },
  dormantSellers: {
    label: "Dormant sellers",
    definition:
      "Businesses with ≥1 historical order but zero orders in the last 30 days, or active flag false.",
    action: "Churn-risk list for support and reactivation campaigns.",
  },
  repeatCustomerRate: {
    label: "Repeat customer rate",
    definition:
      "Customers with ≥2 orders ÷ customers with ≥1 order (scoped per store, aggregated platform-wide).",
    action: "Measure storefront loyalty; low rate → seller coaching on retention.",
  },
  avgOrderValue: {
    label: "AOV",
    definition: "GMV ÷ count of fulfilled orders in period.",
    action: "Pricing and basket-size interventions.",
  },
  pendingReceiptBacklog: {
    label: "Pending receipt backlog",
    definition: "Orders status=PENDING with paymentReceiptSubmittedAt set (awaiting seller approval).",
    action: "SLA monitoring for manual bank-transfer confirmation.",
  },
  activationRate: {
    label: "Seller activation",
    definition:
      "Stores with ≥1 fulfilled order ÷ stores created in period (or all stores for all-time view).",
    action: "Onboarding funnel health — bank details, first product, first sale.",
  },
} as const;

const MS_PER_DAY = 86_400_000;

export function classifySellerHealth(input: {
  isActive: boolean;
  productCount: number;
  orderCount: number;
  lastOrderAt: Date | null;
  createdAt: Date;
  now?: Date;
}): SellerHealthTier {
  const now = input.now ?? new Date();
  const ageDays = (now.getTime() - input.createdAt.getTime()) / MS_PER_DAY;

  if (!input.isActive) return "inactive";

  if (input.orderCount === 0) {
    return input.productCount > 0 ? "activating" : ageDays <= 14 ? "activating" : "dormant";
  }

  if (!input.lastOrderAt) return "dormant";

  const daysSinceOrder = (now.getTime() - input.lastOrderAt.getTime()) / MS_PER_DAY;

  if (daysSinceOrder <= 14) return "thriving";
  if (daysSinceOrder <= 30) return "active";
  if (daysSinceOrder <= 60) return "at_risk";
  return "dormant";
}

export const HEALTH_TIER_LABELS: Record<SellerHealthTier, string> = {
  thriving: "Thriving",
  active: "Active",
  at_risk: "At risk",
  dormant: "Dormant",
  activating: "Activating",
  inactive: "Inactive",
};

export const HEALTH_TIER_BADGE: Record<SellerHealthTier, string> = {
  thriving: "cf-badge cf-badge-paid",
  active: "cf-badge cf-badge-processing",
  at_risk: "cf-badge cf-badge-pending",
  dormant: "cf-badge cf-badge-cancelled",
  activating: "cf-badge cf-badge-shipped",
  inactive: "cf-badge cf-badge-delivered",
};