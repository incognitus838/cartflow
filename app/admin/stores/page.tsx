import { Suspense } from "react";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { StoresTable, type StoreLiveFilter } from "@/components/admin/stores-table";
import { PageHeader } from "@/components/shared/page-header";
import { listAdminBusinesses } from "@/lib/admin/queries";
import { countDeletedStores } from "@/lib/admin/store-lifecycle";

const VALID_APPROVAL: StoreApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];
const VALID_PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];
const VALID_LIVE: StoreLiveFilter[] = ["active", "inactive", "public", "suspended"];

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

  const [stores, recycleBinCount] = await Promise.all([
    listAdminBusinesses({ take: 5000 }),
    countDeletedStores(),
  ]);

  return (
    <>
      <PageHeader
        title="Stores"
        description={`Manage plans (including bulk changes), suspend, delete, and seller impersonation. ${stores.length} active stores loaded (max 5,000).`}
      />
      <Suspense fallback={null}>
        <StoresTable
          stores={stores.map((store) => ({
            ...store,
            createdAt: store.createdAt.toISOString(),
            submittedAt: store.submittedAt?.toISOString() ?? null,
            suspendedAt: store.suspendedAt?.toISOString() ?? null,
            suspendReason: store.suspendReason,
          }))}
          recycleBinCount={recycleBinCount}
          initialApproval={initialApproval}
          initialPlan={initialPlan}
          initialLive={initialLive}
        />
      </Suspense>
    </>
  );
}