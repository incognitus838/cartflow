import { PlanSelector } from "@/components/dashboard/plan-selector";
import { PageHeader } from "@/components/shared/page-header";
import { requireLivePermission } from "@/lib/auth-server";
import { formatPaymentsFeature, formatStoreLimit, formatTeamLimit, PLANS } from "@/lib/plans";
import { countOwnedStores } from "@/lib/team/stores";
import { prisma } from "@/lib/db";

export default async function BillingPage() {
  const { business, user } = await requireLivePermission("billing");
  const plan = PLANS[business.plan];

  const [ownedStoreCount, teamSeatsUsed] = await Promise.all([
    countOwnedStores(user.id),
    prisma.businessMember.count({
      where: { businessId: business.id, role: "STAFF", isSuspended: false },
    }),
  ]);

  const teamLimitLabel =
    plan.staffSeatLimit === null
      ? `${teamSeatsUsed} used · unlimited`
      : plan.staffAccounts
        ? `${teamSeatsUsed} / ${plan.staffSeatLimit} seats`
        : "Not included on this plan";

  const storeLimitLabel =
    plan.storeLimit === null
      ? `${ownedStoreCount} owned · 2+ stores`
      : `${ownedStoreCount} / ${plan.storeLimit} store`;

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Pro adds team seats and automated transfers soon. Enterprise unlocks multiple stores."
      />

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Your plan includes</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Team members</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{formatTeamLimit(business.plan)}</dd>
            <dd className="mt-0.5 text-xs text-slate-500">{teamLimitLabel}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Stores</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{formatStoreLimit(business.plan)}</dd>
            <dd className="mt-0.5 text-xs text-slate-500">{storeLimitLabel}</dd>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Payments</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{formatPaymentsFeature(business.plan)}</dd>
            <dd className="mt-0.5 text-xs text-slate-500">
              {plan.automatedTransfersSoon
                ? "Paystack & automated checkout — launching soon"
                : "Manual bank transfer at checkout today"}
            </dd>
          </div>
        </dl>
        {business.plan === "PRO" || business.plan === "ENTERPRISE" ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            <span className="font-semibold">Automated transfers</span> are included on your plan and coming
            soon — customers will pay without manual receipt upload. Manual bank transfer stays live until
            then.
          </p>
        ) : (
          <p className="mt-4 text-xs text-slate-500">
            Upgrade to <span className="font-medium text-slate-700">Pro</span> for 5 team members and
            automated transfers soon, or <span className="font-medium text-slate-700">Enterprise</span> for
            2+ stores.
          </p>
        )}
      </section>

      <PlanSelector currentPlan={business.plan} plans={Object.values(PLANS)} />
    </>
  );
}