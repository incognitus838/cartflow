import { Suspense } from "react";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { StoresTable, type StoreLiveFilter } from "@/components/admin/stores-table";
import { PageHeader } from "@/components/shared/page-header";
import { listAdminBusinesses } from "@/lib/admin/queries";

const VALID_APPROVAL: StoreApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const VALID_PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];
const VALID_LIVE: StoreLiveFilter[] = ["active", "inactive", "public"];

type AdminStoresPageProps = {
  searchParams: Promise<{
    approval?: string;
    plan?: string;
    live?: string;
  }>;
};

export default async function AdminStoresPage({ searchParams }: AdminStoresPageProps) {
  const params = await searchParams;
  const initialApproval =
    params.approval && VALID_APPROVAL.includes(params.approval as StoreApprovalStatus)
      ? (params.approval as StoreApprovalStatus)
      : "";
  const initialPlan =
    params.plan && VALID_PLANS.includes(params.plan as BusinessPlan)
      ? (params.plan as BusinessPlan)
      : "";
  const initialLive =
    params.live && VALID_LIVE.includes(params.live as StoreLiveFilter)
      ? (params.live as StoreLiveFilter)
      : "";

  const stores = await listAdminBusinesses({ take: 200 });

  return (
    <>
      <PageHeader
        title="Stores"
        description={`Manage plans, activation, and seller impersonation. ${stores.length} stores on the platform.`}
      />
      <Suspense fallback={null}>
        <StoresTable
          stores={stores.map((store) => ({
            ...store,
            createdAt: store.createdAt.toISOString(),
            submittedAt: store.submittedAt?.toISOString() ?? null,
          }))}
          initialApproval={initialApproval}
          initialPlan={initialPlan}
          initialLive={initialLive}
        />
      </Suspense>
    </>
  );
}