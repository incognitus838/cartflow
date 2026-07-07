import { MyStoresPanel } from "@/components/dashboard/my-stores-panel";
import { PageHeader } from "@/components/shared/page-header";
import { requireStoreOwner } from "@/lib/auth-server";
import { listOwnedStores } from "@/lib/team/stores";

export default async function StoresPage() {
  const { user, business } = await requireStoreOwner();
  const stores = await listOwnedStores(user.id);

  return (
    <>
      <PageHeader
        title="My stores"
        description="Manage all stores under your seller account. Add new stores, switch between them, and track approval status."
      />
      <MyStoresPanel
        sellerName={user.name}
        sellerEmail={user.email}
        stores={stores}
        activeStoreId={business.id}
      />
    </>
  );
}