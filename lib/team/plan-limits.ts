import type { BusinessPlan } from "@prisma/client";
import { getPlan, planStaffSeatLimit } from "@/lib/plans";

export function planAllowsStaff(plan: BusinessPlan) {
  return getPlan(plan).staffAccounts;
}

export function staffSeatLimit(plan: BusinessPlan): number | null {
  const limit = planStaffSeatLimit(plan);
  return limit === 0 ? 0 : limit;
}

export function staffUpgradeMessage(plan: BusinessPlan) {
  if (plan === "ENTERPRISE" || plan === "PRO") return null;
  return "Upgrade to Pro for up to 5 team members.";
}