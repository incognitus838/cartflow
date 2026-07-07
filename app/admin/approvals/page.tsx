import { StoreApprovalsPanel } from "@/components/admin/store-approvals-panel";
import { PageHeader } from "@/components/shared/page-header";
import {
  countPendingStoreApprovals,
  listPendingStoreApprovals,
  listRecentApprovalDecisions,
} from "@/lib/admin/store-approval";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const [pending, recent, pendingCount] = await Promise.all([
    listPendingStoreApprovals(100),
    listRecentApprovalDecisions(15),
    countPendingStoreApprovals(),
  ]);

  return (
    <>
      <PageHeader
        title="Store approvals"
        description="Review new seller applications before their storefront goes live. Check bank, contact, and catalog readiness."
      />
      <StoreApprovalsPanel pending={pending} recent={recent} pendingCount={pendingCount} />
    </>
  );
}