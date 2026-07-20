import { StoreRecycleBin } from "@/components/admin/store-recycle-bin";
import { PageHeader } from "@/components/shared/page-header";
import { listDeletedAdminStores } from "@/lib/admin/store-lifecycle";

export default async function AdminStoreRecycleBinPage() {
  const stores = await listDeletedAdminStores({ take: 200 });

  return (
    <>
      <PageHeader
        title="Store recycle bin"
        description={`${stores.length} soft-deleted store${stores.length === 1 ? "" : "s"}. Restore or permanently remove.`}
      />
      <StoreRecycleBin
        stores={stores.map((store) => ({
          ...store,
          createdAt: store.createdAt.toISOString(),
          deletedAt: store.deletedAt?.toISOString() ?? null,
          deleteReason: store.deleteReason,
        }))}
      />
    </>
  );
}
