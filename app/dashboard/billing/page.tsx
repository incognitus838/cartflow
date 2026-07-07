import { PlanSelector } from "@/components/dashboard/plan-selector";
import { PageHeader } from "@/components/shared/page-header";
import { requireStoreOwner } from "@/lib/auth-server";
import { PLANS } from "@/lib/plans";

export default async function BillingPage() {
  const { business } = await requireStoreOwner();

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Manage your plan. Manual checkout is live; online payments and paid billing coming soon."
      />
      <PlanSelector currentPlan={business.plan} plans={Object.values(PLANS)} />
    </>
  );
}