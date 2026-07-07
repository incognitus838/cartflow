import { AdminShell } from "@/components/admin/admin-shell";
import { countPendingStoreApprovals } from "@/lib/admin/store-approval";
import { requireAdmin } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const pendingApprovals = await countPendingStoreApprovals();

  return (
    <AdminShell
      userEmail={user.email}
      userName={user.name}
      pendingApprovals={pendingApprovals}
    >
      <main className="cf-dash-content">{children}</main>
    </AdminShell>
  );
}