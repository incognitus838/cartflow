import type { BusinessPlan } from "@prisma/client";

export type PlanStyle = {
  label: string;
  badge: string;
  bar: string;
  dot: string;
  text: string;
};

export const PLAN_STYLES: Record<BusinessPlan, PlanStyle> = {
  FREE: {
    label: "Free",
    badge: "cf-badge cf-badge-plan-free",
    bar: "bg-[#86868b]",
    dot: "bg-[#86868b]",
    text: "text-[#6e6e73]",
  },
  STARTER: {
    label: "Starter",
    badge: "cf-badge cf-badge-plan-starter",
    bar: "bg-[#245bdb]",
    dot: "bg-[#245bdb]",
    text: "text-[#245bdb]",
  },
  PRO: {
    label: "Pro",
    badge: "cf-badge cf-badge-plan-pro",
    bar: "bg-[#b8956a]",
    dot: "bg-[#b8956a]",
    text: "text-[#9a7b4f]",
  },
  ENTERPRISE: {
    label: "Enterprise",
    badge: "cf-badge cf-badge-plan-enterprise",
    bar: "bg-[#1d1d1f]",
    dot: "bg-[#1d1d1f]",
    text: "text-[#1d1d1f]",
  },
};

export function planStyleFor(plan: string): PlanStyle {
  if (plan in PLAN_STYLES) return PLAN_STYLES[plan as BusinessPlan];
  return PLAN_STYLES.FREE;
}