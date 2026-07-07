"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { BusinessPlan } from "@prisma/client";
import { planFeatureList, type PlanDefinition } from "@/lib/plans";
import { cn } from "@/lib/utils";

type PlanSelectorProps = {
  currentPlan: BusinessPlan;
  plans: PlanDefinition[];
};

export function PlanSelector({ currentPlan, plans }: PlanSelectorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<BusinessPlan | null>(null);

  async function selectPlan(plan: BusinessPlan) {
    if (plan === currentPlan) return;
    setLoading(plan);

    try {
      const res = await fetch("/api/business/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not change plan");
        return;
      }

      toast.success(`Plan updated to ${plan}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => {
        const active = plan.id === currentPlan;
        const features = planFeatureList(plan.id);
        const highlight =
          plan.id === "PRO"
            ? "5 team members"
            : plan.id === "ENTERPRISE"
              ? "2+ stores"
              : null;

        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border p-5",
              active ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white",
              plan.id === "PRO" || plan.id === "ENTERPRISE" ? "relative" : undefined,
            )}
          >
            {highlight ? (
              <span className="mb-2 inline-flex w-fit rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {highlight}
              </span>
            ) : null}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              {active ? (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Current
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-lg font-bold text-slate-900">{plan.priceLabel}</p>
            <p className="mt-2 text-xs text-slate-600">{plan.description}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-slate-600">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span
                    className={
                      (plan.id === "PRO" && feature.includes("team")) ||
                      (plan.id === "ENTERPRISE" && feature.includes("store"))
                        ? "font-semibold text-slate-900"
                        : undefined
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={active || loading === plan.id}
              onClick={() => selectPlan(plan.id)}
              className={cn("mt-4 w-full py-2.5 text-sm font-semibold", active ? "btn-secondary" : "btn-primary")}
            >
              {active ? "Current plan" : loading === plan.id ? "Updating…" : `Select ${plan.name}`}
            </button>
          </div>
        );
      })}
    </div>
  );
}