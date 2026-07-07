import type { BusinessPlan } from "@prisma/client";
import { getPlan } from "@/lib/plans";

export function planAllowsStaff(plan: BusinessPlan) {
  return getPlan(plan).staffAccounts;
}

export function staffSeatLimit(plan: BusinessPlan): number | null {
  if (plan === "PRO") return 5;
  if (plan === "ENTERPRISE") return null;
  return 0;
}

export function staffUpgradeMessage(plan: BusinessPlan) {
  if (plan === "ENTERPRISE") return null;
  if (plan === "PRO") return null;
  return "Upgrade to Pro to invite team members (up to 5 seats).";
}