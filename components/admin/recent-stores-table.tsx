import Link from "next/link";
import { StorefrontLink } from "@/components/admin/storefront-link";
import type { AdminStoreRow } from "@/components/admin/stores-table";

type RecentStoresTableProps = {
  stores: AdminStoreRow[];
};

/** Read-only snapshot for overview — no search, filters, or row mutations. */
export function RecentStoresTable({ stores }: RecentStoresTableProps) {
  return (
    <div className="cf-table-shell overflow-x-auto">
      <table className="min-w-[640px]">
        <caption className="sr-only">Recently joined stores</caption>
        <thead>
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Owner</th>
            <th scope="col">Plan</th>
            <th scope="col">Status</th>
            <th scope="col">Storefront</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>
                <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                <p className="text-[12px] text-[#b8956a]">/{store.slug}</p>
              </td>
              <td className="text-[#6e6e73]">
                <p className="text-[#1d1d1f]">{store.owner.name}</p>
                <p className="text-[12px]">{store.owner.email}</p>
              </td>
              <td>
                <span className="cf-badge cf-badge-delivered">{store.plan}</span>
              </td>
              <td>
                <span className={`cf-badge ${store.isActive ? "cf-badge-paid" : "cf-badge-cancelled"}`}>
                  {store.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <StorefrontLink
                  slug={store.slug}
                  storeName={store.name}
                  isActive={store.isActive}
                >
                  View
                </StorefrontLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {stores.length === 0 ? <p className="cf-table-empty">No stores yet.</p> : null}
      {stores.length > 0 ? (
        <p className="border-t border-black/[0.04] px-5 py-3 text-center text-[12px] text-[#86868b]">
          <Link href="/admin/stores" className="font-medium text-[#b8956a] hover:underline">
            Manage all stores
          </Link>
          {" — search, plans, impersonation"}
        </p>
      ) : null}
    </div>
  );
}