"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { BusinessPlan, StoreApprovalStatus } from "@prisma/client";
import { APPROVAL_STATUS_LABEL } from "@/lib/business/approval";

export type RecycleBinStoreRow = {
  id: string;
  name: string;
  slug: string;
  plan: BusinessPlan;
  isActive: boolean;
  isSuspended: boolean;
  deletedAt: string | null;
  deleteReason: string | null;
  approvalStatus: StoreApprovalStatus;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { products: number; orders: number };
};

type StoreRecycleBinProps = {
  stores: RecycleBinStoreRow[];
};

export function StoreRecycleBin({ stores: initial }: StoreRecycleBinProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null);

  async function restore(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Restore failed");
        return;
      }
      setRows((current) => current.filter((row) => row.id !== id));
      toast.success("Store restored");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  async function permanentDelete(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Permanent delete failed");
        return;
      }
      setRows((current) => current.filter((row) => row.id !== id));
      setConfirmPermanentId(null);
      toast.success("Store permanently deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section aria-labelledby="recycle-bin-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="recycle-bin-heading" className="cf-page-title text-[17px]">
            Recycle bin
          </h2>
          <p className="mt-1 text-[13px] text-[#86868b]">
            Soft-deleted stores. Restore to bring them back, or permanently delete.
          </p>
        </div>
        <Link href="/admin/stores" className="cf-btn-inline cf-btn-inline-ghost inline-flex items-center gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to stores
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="cf-stat-card px-6 py-12 text-center">
          <Trash2 className="mx-auto h-8 w-8 text-[#c7c7cc]" aria-hidden />
          <p className="mt-3 text-[15px] font-medium text-[#1d1d1f]">Recycle bin is empty</p>
          <p className="mt-2 text-[13px] text-[#86868b]">
            Stores you delete from the Stores list appear here first.
          </p>
        </div>
      ) : (
        <div className="cf-table-shell overflow-x-auto">
          <table className="min-w-[800px]">
            <caption className="sr-only">Deleted stores</caption>
            <thead>
              <tr>
                <th scope="col">Store</th>
                <th scope="col">Owner</th>
                <th scope="col">Deleted</th>
                <th scope="col">Catalog</th>
                <th scope="col">Approval</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((store) => (
                <tr key={store.id}>
                  <td>
                    <p className="font-medium text-[#1d1d1f]">{store.name}</p>
                    <p className="text-[12px] text-[#b8956a]">/{store.slug}</p>
                    <p className="mt-1 text-[11px] text-[#86868b]">{store.plan}</p>
                  </td>
                  <td className="text-[#6e6e73]">
                    <p className="text-[#1d1d1f]">{store.owner.name}</p>
                    <p className="text-[12px]">{store.owner.email}</p>
                  </td>
                  <td className="text-[12px] text-[#6e6e73]">
                    {store.deletedAt ? (
                      <time dateTime={store.deletedAt}>
                        {new Date(store.deletedAt).toLocaleString()}
                      </time>
                    ) : (
                      "—"
                    )}
                    {store.deleteReason ? (
                      <p className="mt-1 max-w-[14rem] text-[11px] text-[#86868b]">{store.deleteReason}</p>
                    ) : null}
                  </td>
                  <td className="text-[#6e6e73]">
                    {store._count.products} products · {store._count.orders} orders
                  </td>
                  <td>
                    <span
                      className={`cf-badge ${
                        store.approvalStatus === "APPROVED"
                          ? "cf-badge-paid"
                          : store.approvalStatus === "PENDING"
                            ? "cf-badge-pending"
                            : "cf-badge-cancelled"
                      }`}
                    >
                      {APPROVAL_STATUS_LABEL[store.approvalStatus]}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={loadingId === store.id}
                          onClick={() => restore(store.id)}
                          className="cf-btn-inline cf-btn-inline-ghost inline-flex items-center gap-1 text-[11px]"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden />
                          Restore
                        </button>
                        <button
                          type="button"
                          disabled={loadingId === store.id}
                          onClick={() =>
                            setConfirmPermanentId((current) =>
                              current === store.id ? null : store.id,
                            )
                          }
                          className="cf-btn-inline cf-btn-inline-ghost text-[11px] text-red-700"
                        >
                          Delete forever
                        </button>
                      </div>
                      {confirmPermanentId === store.id ? (
                        <div className="max-w-xs space-y-2 rounded-lg border border-red-200 bg-red-50/80 p-3">
                          <p className="text-[11px] text-red-900">
                            Permanently delete <strong>{store.name}</strong>? Products, orders, and
                            media for this store will be removed. This cannot be undone.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={loadingId === store.id}
                              onClick={() => permanentDelete(store.id)}
                              className="rounded-md bg-red-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-800"
                            >
                              {loadingId === store.id ? "Deleting…" : "Yes, delete forever"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmPermanentId(null)}
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
        </div>
      )}
    </section>
  );
}
