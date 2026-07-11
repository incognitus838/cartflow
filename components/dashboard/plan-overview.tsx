import { Check, Shield } from "lucide-react";
import type { BusinessPlan } from "@prisma/client";
import { planFeatureList, type PlanDefinition } from "@/lib/plans";
import { cn } from "@/lib/utils";

type PlanOverviewProps = {
  currentPlan: BusinessPlan;
  plans: PlanDefinition[];
};

export function PlanOverview({ currentPlan, plans }: PlanOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#b8956a]/25 bg-[#fffdf9] px-5 py-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#b8956a]" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">Plan changes are managed by CartFlow</p>
            <p className="mt-1 text-[13px] text-[#6e6e73]">
              Your subscription is assigned by our team. To upgrade, downgrade, or discuss Enterprise
              pricing, contact support — only platform admins can change plans.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const active = plan.id === currentPlan;
          const features = planFeatureList(plan.id);
          const highlights =
            plan.id === "PRO"
              ? ["5 team members", "Automated transfers soon"]
              : plan.id === "ENTERPRISE"
                ? ["2+ stores", "Automated transfers soon"]
                : [];

          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                active ? "border-[#1a7f5a]/40 bg-[#f0faf5]" : "border-black/[0.06] bg-white",
              )}
            >
              {highlights.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {highlights.map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-full bg-[#1d1d1f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1d1d1f]">{plan.name}</h3>
                {active ? (
                  <span className="rounded-full bg-[#1a7f5a] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Your plan
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-lg font-bold text-[#1d1d1f]">{plan.priceLabel}</p>
              <p className="mt-2 text-xs text-[#6e6e73]">{plan.description}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-[#6e6e73]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a7f5a]" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}