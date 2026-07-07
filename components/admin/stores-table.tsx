"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const APPROVAL_FILTERS: Array<{ value: "" | StoreApprovalStatus; label: string }> = [
  { value: "", label: "All approval" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const PLAN_OPTIONS: Array<{ value: "" | BusinessPlan; label: string }> = [
  { value: "", label: "All plans" },
  ...PLANS.map((plan) => ({ value: plan, label: plan })),
];

export type StoreLiveFilter = "" | "active" | "inactive" | "public";

const LIVE_OPTIONS: Array<{ value: StoreLiveFilter; label: string }> = [
  { value: "", label: "All live states" },
  { value: "public", label: "Publicly live" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type StoresTableProps = {
  stores: AdminStoreRow[];
  initialApproval?: "" | StoreApprovalStatus;
  initialPlan?: "" | BusinessPlan;
  initialLive?: StoreLiveFilter;
};

function isPubliclyLive(store: AdminStoreRow) {
  return store.approvalStatus === "APPROVED" && store.isActive;
}

export function StoresTable({
  stores: initial,
  initialApproval = "",
  initialPlan = "",
  initialLive = "",
}: StoresTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approval, setApproval] = useState<"" | StoreApprovalStatus>(initialApproval);
  const [plan, setPlan] = useState<"" | BusinessPlan>(initialPlan);
  const [live, setLive] = useState<StoreLiveFilter>(initialLive);

  function syncUrl(next: {
    approval?: "" | StoreApprovalStatus;
    plan?: "" | BusinessPlan;
    live?: StoreLiveFilter;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const values = {
      approval: next.approval ?? approval,
      plan: next.plan ?? plan,
      live: next.live ?? live,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    router.replace(query ? `/admin/stores?${query}` : "/admin/stores", { scroll: false });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((store) => {
      if (approval && store.approvalStatus !== approval) return false;
      if (plan && store.plan !== plan) return false;
      if (live === "active" && !store.isActive) return false;
      if (live === "inactive" && store.isActive) return false;
      if (live === "public" && !isPubliclyLive(store)) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.slug.toLowerCase().includes(q) ||
        store.owner.name.toLowerCase().includes(q) ||
        store.owner.email.toLowerCase().includes(q)
      );
    });
  }, [rows, search, approval, plan, live]);

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

  async function changePlan(id: string, nextPlan: BusinessPlan) {
    const ok = await patchStore(id, { plan: nextPlan });
    if (ok) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, plan: nextPlan } : row)));
      toast.success(`Plan set to ${nextPlan}`);
    }
  }

  const filterSelectClass =
    "cf-input w-full py-2 text-[12px] font-medium lg:max-w-[10rem]";

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
        filters={APPROVAL_FILTERS}
        activeFilter={approval}
        onFilterChange={(value) => {
          setApproval(value);
          syncUrl({ approval: value });
        }}
        filterLegend="Filter stores by approval status"
        resultCount={filtered.length}
        trailing={
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="min-w-[10rem] flex-1 sm:flex-none">
              <label htmlFor="admin-stores-plan-filter" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Plan
              </label>
              <select
                id="admin-stores-plan-filter"
                value={plan}
                onChange={(e) => {
                  const value = e.target.value as "" | BusinessPlan;
                  setPlan(value);
                  syncUrl({ plan: value });
                }}
                className={filterSelectClass}
              >
                {PLAN_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[10rem] flex-1 sm:flex-none">
              <label htmlFor="admin-stores-live-filter" className="mb-1.5 block text-[12px] font-medium text-[#86868b]">
                Live
              </label>
              <select
                id="admin-stores-live-filter"
                value={live}
                onChange={(e) => {
                  const value = e.target.value as StoreLiveFilter;
                  setLive(value);
                  syncUrl({ live: value });
                }}
                className={filterSelectClass}
              >
                {LIVE_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
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
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
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
                    title={
                      isPubliclyLive(store)
                        ? "Approved and active on the public storefront"
                        : store.isActive
                          ? "Active in admin — may still await approval"
                          : "Inactive"
                    }
                  >
                    {isPubliclyLive(store) ? "Public" : store.isActive ? "Active" : "Inactive"}
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
          <p className="cf-table-empty">No stores match your filters.</p>
        ) : null}
      </div>
    </section>
  );
}