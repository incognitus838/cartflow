import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";
import { StaffAccessBanner } from "@/components/dashboard/staff-access-banner";
import { StoreApprovalBanner } from "@/components/dashboard/store-approval-banner";
import { requireBusiness } from "@/lib/auth-server";
import { getSession } from "@/lib/auth";
import { listAccessibleStores } from "@/lib/team/stores";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, business, storeAccessRole, permissions, accessPreset } = await requireBusiness();
  const session = await getSession();
  const accessibleStores = await listAccessibleStores(user.id);

  return (
    <DashboardShell
      businessName={business.name}
      businessSlug={business.slug}
      businessId={business.id}
      userName={user.name}
      userRole={user.role}
      storeAccessRole={storeAccessRole}
      accessPreset={accessPreset}
      permissions={permissions}
      accessibleStores={accessibleStores}
    >
      {session?.impersonatorId ? (
        <ImpersonationBanner storeName={business.name} storeSlug={business.slug} />
      ) : storeAccessRole === "staff" ? (
        <StaffAccessBanner storeName={business.name} accessPreset={accessPreset} />
      ) : (
        <StoreApprovalBanner
          store={{
            name: business.name,
            approvalStatus: business.approvalStatus,
            isActive: business.isActive,
            rejectionReason: business.rejectionReason,
            resubmissionAllowed: business.resubmissionAllowed,
            submittedAt: business.submittedAt,
            approvalReviewedAt: business.approvalReviewedAt,
          }}
        />
      )}
      <main className="cf-dash-content">{children}</main>
    </DashboardShell>
  );
}