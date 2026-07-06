import { AdminSidebar } from "@/components/admin/sidebar";
import { countPendingStoreApprovals } from "@/lib/admin/store-approval";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const pendingApprovals = await countPendingStoreApprovals();

  return (
    <div className="cf-dash-shell">
      <AdminSidebar
        userEmail={user.email}
        userName={user.name}
        pendingApprovals={pendingApprovals}
      />
      <div className="cf-dash-main">
        <main className="cf-dash-content">{children}</main>
      </div>
    </div>
  );
}