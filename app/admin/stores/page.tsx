import { StoresTable } from "@/components/admin/stores-table";
import { PageHeader } from "@/components/shared/page-header";
import { listAdminBusinesses } from "@/lib/admin/queries";

export default async function AdminStoresPage() {
  const stores = await listAdminBusinesses({ take: 200 });

  return (
    <>
      <PageHeader
        title="Stores"
        description={`Manage plans, activation, and seller impersonation. ${stores.length} stores on the platform.`}
      />
      <StoresTable
        stores={stores.map((store) => ({
          ...store,
          createdAt: store.createdAt.toISOString(),
          submittedAt: store.submittedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}