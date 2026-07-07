"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Store } from "lucide-react";
import { toast } from "sonner";
import {
  APPROVAL_STATUS_LABEL,
  isStorePubliclyLive,
  type StoreApprovalSnapshot,
} from "@/lib/business/approval";
import type { OwnedStoreDetail } from "@/lib/team/store-types";

type MyStoresPanelProps = {
  sellerName: string;
  sellerEmail: string;
  stores: OwnedStoreDetail[];
  activeStoreId: string;
  canAddStore?: boolean;
  addStoreBlockedReason?: string;
};

function approvalBadgeClass(status: StoreApprovalSnapshot["approvalStatus"]) {
  if (status === "APPROVED") return "bg-emerald-50 text-emerald-800";
  if (status === "PENDING") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-800";
}

export function MyStoresPanel({
  sellerName,
  sellerEmail,
  stores,
  activeStoreId,
  canAddStore = true,
  addStoreBlockedReason,
}: MyStoresPanelProps) {
  const router = useRouter();

  async function switchTo(businessId: string) {
    if (businessId === activeStoreId) return;
    try {
      const res = await fetch("/api/business/switch-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not switch store");
        return;
      }
      toast.success("Switched store");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Seller profile</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your account owns {stores.length} store{stores.length === 1 ? "" : "s"}. Switch between
          them from the sidebar or below.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{sellerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{sellerEmail}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Your stores</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Each store is reviewed and approved separately.
            </p>
          </div>
          {canAddStore ? (
            <Link
              href="/dashboard/stores/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Add store
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Upgrade for more stores
            </Link>
          )}
        </div>
        {!canAddStore && addStoreBlockedReason ? (
          <p className="border-b border-slate-100 px-6 py-3 text-xs text-amber-800">{addStoreBlockedReason}</p>
        ) : null}

        <ul className="divide-y divide-slate-100" role="list">
          {stores.map((store) => {
            const isActive = store.id === activeStoreId;
            const isLive = isStorePubliclyLive(store);

            return (
              <li key={store.id} className="px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Store className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{store.name}</p>
                        {isActive ? (
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Active
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${approvalBadgeClass(store.approvalStatus)}`}
                        >
                          {APPROVAL_STATUS_LABEL[store.approvalStatus]}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
                        /{store.slug}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {store.productCount} product{store.productCount === 1 ? "" : "s"}
                        {isLive ? " · Live storefront" : " · Storefront locked"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => void switchTo(store.id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Switch to this store
                      </button>
                    ) : (
                      <Link
                        href="/dashboard/settings"
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Store settings
                      </Link>
                    )}
                    {isLive ? (
                      <a
                        href={`/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                        View storefront
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}