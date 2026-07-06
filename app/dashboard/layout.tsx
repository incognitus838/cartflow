import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";
import { StoreApprovalBanner } from "@/components/dashboard/store-approval-banner";
import { requireBusiness } from "@/lib/auth-server";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, business } = await requireBusiness();
  const session = await getSession();

  return (
    <div className="cf-dash-shell">
      <DashboardSidebar
        businessName={business.name}
        businessSlug={business.slug}
        userName={user.name}
        userRole={user.role}
      />
      <div className="cf-dash-main">
        {session?.impersonatorId ? (
          <ImpersonationBanner storeName={business.name} storeSlug={business.slug} />
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
      </div>
    </div>
  );
}