import { notFound } from "next/navigation";
import { UserDetailPanel } from "@/components/admin/user-detail-panel";
import { getAdminUserDetail } from "@/lib/admin/user-detail";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const user = await getAdminUserDetail(id);

  if (!user) {
    notFound();
  }

  return <UserDetailPanel user={user} />;
}