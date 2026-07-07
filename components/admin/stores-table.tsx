"use client";

import { useMemo, useState } from "react";
import { AdminActions } from "@/components/admin/admin-actions";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import Link from "next/link";
import { APPROVAL_STATUS_LABEL } from "@/lib/business/approval";
import { FilterToolbar } from "@/components/shared/filter-toolbar";

export type AdminStoreRow = {
  id: string;
  name: string;
  slug: string;
  plan: BusinessPlan;
  isActive: boolean;
  approvalStatus: StoreApprovalStatus;
  submittedAt?: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { products: number; orders: number };
};

const PLANS: BusinessPlan[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

type StoresTableProps = {
  stores: AdminStoreRow[];
};

export function StoresTable({ stores: initial }: StoresTableProps) {
  const [rows, setRows] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.slug.toLowerCase().includes(q) ||
        store.owner.name.toLowerCase().includes(q) ||
        store.owner.email.toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function patchStore(id: string, body: Record<string, unknown>) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Update failed");
        return false;
      }
      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const ok = await patchStore(id, { isActive });
    if (ok) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, isActive } : row)));
      toast.success(isActive ? "Store activated" : "Store deactivated");
    }
  }

  async function changePlan(id: string, plan: BusinessPlan) {
    const ok = await patchStore(id, { plan });
    if (ok) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, plan } : row)));
      toast.success(`Plan set to ${plan}`);
    }
  }

  return (
    <section aria-labelledby="admin-stores-heading">
      <h2 id="admin-stores-heading" className="sr-only">
        Platform stores
      </h2>

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchLabel="Search stores"
        searchPlaceholder="Store name, slug, owner email…"
        resultCount={filtered.length}
      />

      <div className="cf-table-shell overflow-x-auto">
        <table className="min-w-[800px]">
          <caption className="sr-only">Platform stores</caption>
          <thead>
            <tr>
              <th scope="col">Store</th>
              <th scope="col">Owner</th>
              <th scope="col">Plan</th>
              <th scope="col">Catalog</th>
              <th scope="col">Approval</th>
              <th scope="col">Live</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((store) => (
              <tr key={store.id}>
                <td>
                  <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                  <p className="text-[12px] text-[#b8956a]">/{store.slug}</p>
                  <time className="mt-1 block text-[11px] text-[#86868b]" dateTime={store.createdAt}>
                    Joined {new Date(store.createdAt).toLocaleDateString()}
                  </time>
                </td>
                <td className="text-[#6e6e73]">
                  <p className="text-[#1d1d1f]">{store.owner.name}</p>
                  <p className="text-[12px]">{store.owner.email}</p>
                </td>
                <td>
                  <label className="sr-only" htmlFor={`plan-${store.id}`}>
                    Plan for {store.name}
                  </label>
                  <select
                    id={`plan-${store.id}`}
                    value={store.plan}
                    disabled={loadingId === store.id}
                    onChange={(e) => changePlan(store.id, e.target.value as BusinessPlan)}
                    className="cf-input max-w-[8.5rem] py-2 text-[12px] font-medium"
                  >
                    {PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="text-[#6e6e73]">
                  {store._count.products} products · {store._count.orders} orders
                </td>
                <td>
                  {store.approvalStatus === "PENDING" ? (
                    <Link href="/admin/approvals" className="cf-badge cf-badge-pending">
                      {APPROVAL_STATUS_LABEL.PENDING}
                    </Link>
                  ) : (
                    <span
                      className={`cf-badge ${
                        store.approvalStatus === "APPROVED" ? "cf-badge-paid" : "cf-badge-cancelled"
                      }`}
                    >
                      {APPROVAL_STATUS_LABEL[store.approvalStatus]}
                    </span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    disabled={loadingId === store.id}
                    onClick={() => toggleActive(store.id, !store.isActive)}
                    className={`cf-badge ${store.isActive ? "cf-badge-paid" : "cf-badge-cancelled"}`}
                  >
                    {store.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <AdminActions
                    businessId={store.id}
                    storeName={store.name}
                    slug={store.slug}
                    isActive={store.isActive}
                    disabled={loadingId === store.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="cf-table-empty">No stores match your search.</p>
        ) : null}
      </div>
    </section>
  );
}