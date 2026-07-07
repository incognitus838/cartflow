"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { notifyProductsChanged } from "@/lib/dashboard/live-sync";

type ProductActionsProps = {
  productId: string;
  productTitle: string;
  canDelete?: boolean;
  onDeleted?: (productId: string) => void;
};

export function ProductActions({
  productId,
  productTitle,
  canDelete = true,
  onDeleted,
}: ProductActionsProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${productTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not delete product");
        return;
      }

      toast.success("Product deleted");
      onDeleted?.(productId);
      notifyProductsChanged();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/dashboard/products/${productId}/edit`}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      {canDelete ? (
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}