"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminActions } from "@/components/admin/admin-actions";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { APPROVAL_STATUS_LABEL } from "@/lib/business/approval";
import { FilterToolbar } from "@/components/shared/filter-toolbar";

export type AdminStoreRow = {
  id: string;
  name: string;
  slug: string;
  plan: BusinessPlan;
  isActive: boolean;
  isSuspended: boolean;
  suspendedAt?: string | null;
  suspendReason?: string | null;
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

export type StoreLiveFilter = "" | "active" | "inactive" | "public" | "suspended";

const LIVE_OPTIONS: Array<{ value: StoreLiveFilter; label: string }> = [
  { value: "", label: "All live states" },
  { value: "public", label: "Publicly live" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

type StoresTableProps = {
  stores: AdminStoreRow[];
  recycleBinCount?: number;
  initialApproval?: "" | StoreApprovalStatus;
  initialPlan?: "" | BusinessPlan;
  initialLive?: StoreLiveFilter;
};

function isPubliclyLive(store: AdminStoreRow) {
  return store.approvalStatus === "APPROVED" && store.isActive && !store.isSuspended;
}

export function StoresTable({
  stores: initial,
  recycleBinCount = 0,
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
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

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
      if (live === "active" && (!store.isActive || store.isSuspended)) return false;
      if (live === "inactive" && (store.isActive || store.isSuspended)) return false;
      if (live === "public" && !isPubliclyLive(store)) return false;
      if (live === "suspended" && !store.isSuspended) return false;
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
        return null;
      }
      return data.business as Partial<AdminStoreRow> | undefined;
    } catch {
      toast.error("Something went wrong");
      return null;
    } finally {
      setLoadingId(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const business = await patchStore(id, { isActive });
    if (business) {
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, isActive } : row)),
      );
      toast.success(isActive ? "Store activated" : "Store deactivated");
    }
  }

  async function changePlan(id: string, nextPlan: BusinessPlan) {
    const business = await patchStore(id, { plan: nextPlan });
    if (business) {
      setRows((current) =>
        current.map((row) => (row.id === id ? { ...row, plan: nextPlan } : row)),
      );
      toast.success(`Plan set to ${nextPlan}`);
    }
  }

  async function confirmSuspend(id: string) {
    const business = await patchStore(id, {
      action: "suspend",
      reason: suspendReason.trim() || undefined,
    });
    if (business) {
      setRows((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                isSuspended: true,
                isActive: false,
                suspendReason: suspendReason.trim() || null,
                suspendedAt: new Date().toISOString(),
              }
            : row,
        ),
      );
      setSuspendId(null);
      setSuspendReason("");
      toast.success("Store suspended — storefront offline");
      router.refresh();
    }
  }

  async function handleUnsuspend(id: string) {
    const business = await patchStore(id, { action: "unsuspend" });
    if (business) {
      setRows((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                isSuspended: false,
                isActive: Boolean(business.isActive),
                suspendReason: null,
                suspendedAt: null,
              }
            : row,
        ),
      );
      toast.success("Store unsuspended");
      router.refresh();
    }
  }

  async function confirmSoftDelete(id: string) {
    const business = await patchStore(id, {
      action: "soft_delete",
      reason: deleteReason.trim() || undefined,
    });
    if (business) {
      setRows((current) => current.filter((row) => row.id !== id));
      setDeleteId(null);
      setDeleteReason("");
      toast.success("Store moved to recycle bin");
      router.refresh();
    }
  }

  const filterSelectClass =
    "cf-input w-full py-2 text-[12px] font-medium lg:max-w-[10rem]";

  return (
    <section aria-labelledby="admin-stores-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="admin-stores-heading" className="sr-only">
          Platform stores
        </h2>
        <Link
          href="/admin/stores/recycle-bin"
          className="cf-btn-inline cf-btn-inline-ghost inline-flex items-center gap-1.5 text-[13px]"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Recycle bin
          {recycleBinCount > 0 ? (
            <span className="rounded-full bg-[#f5f5f7] px-1.5 py-0.5 text-[11px] font-semibold text-[#6e6e73]">
              {recycleBinCount}
            </span>
          ) : null}
        </Link>
      </div>

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
        <table className="min-w-[920px]">
          <caption className="sr-only">Platform stores</caption>
          <thead>
            <tr>
              <th scope="col">Store</th>
              <th scope="col">Owner</th>
              <th scope="col">Plan</th>
              <th scope="col">Catalog</th>
              <th scope="col">Approval</th>
              <th scope="col">Status</th>
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
                  <div className="flex flex-col items-start gap-1">
                    {store.isSuspended ? (
                      <span className="cf-badge cf-badge-cancelled" title={store.suspendReason ?? "Suspended"}>
                        Suspended
                      </span>
                    ) : (
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
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col items-start gap-2">
                    <AdminActions
                      businessId={store.id}
                      storeName={store.name}
                      slug={store.slug}
                      isActive={store.isActive && !store.isSuspended}
                      disabled={loadingId === store.id}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {store.isSuspended ? (
                        <button
                          type="button"
                          disabled={loadingId === store.id}
                          onClick={() => handleUnsuspend(store.id)}
                          className="cf-btn-inline cf-btn-inline-ghost text-[11px]"
                        >
                          Unsuspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={loadingId === store.id}
                          onClick={() => {
                            setSuspendId(store.id);
                            setSuspendReason("");
                            setDeleteId(null);
                          }}
                          className="cf-btn-inline cf-btn-inline-ghost text-[11px] text-amber-800"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={loadingId === store.id}
                        onClick={() => {
                          setDeleteId(store.id);
                          setDeleteReason("");
                          setSuspendId(null);
                        }}
                        className="cf-btn-inline cf-btn-inline-ghost text-[11px] text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    {suspendId === store.id ? (
                      <div className="mt-1 w-full max-w-xs space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3">
                        <label className="block text-[11px] font-medium text-amber-900" htmlFor={`suspend-${store.id}`}>
                          Suspend reason (optional)
                        </label>
                        <textarea
                          id={`suspend-${store.id}`}
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-amber-200 bg-white px-2 py-1.5 text-[12px]"
                          placeholder="Policy violation, chargeback risk…"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={loadingId === store.id}
                            onClick={() => confirmSuspend(store.id)}
                            className="rounded-md bg-amber-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-amber-800"
                          >
                            Confirm suspend
                          </button>
                          <button
                            type="button"
                            onClick={() => setSuspendId(null)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {deleteId === store.id ? (
                      <div className="mt-1 w-full max-w-xs space-y-2 rounded-lg border border-red-200 bg-red-50/80 p-3">
                        <p className="text-[11px] text-red-900">
                          Moves <strong>{store.name}</strong> to the recycle bin. You can restore later.
                        </p>
                        <label className="block text-[11px] font-medium text-red-900" htmlFor={`delete-${store.id}`}>
                          Reason (optional)
                        </label>
                        <textarea
                          id={`delete-${store.id}`}
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-red-200 bg-white px-2 py-1.5 text-[12px]"
                          placeholder="Spam, abandoned, owner request…"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={loadingId === store.id}
                            onClick={() => confirmSoftDelete(store.id)}
                            className="rounded-md bg-red-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-800"
                          >
                            Move to recycle bin
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(null)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
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
