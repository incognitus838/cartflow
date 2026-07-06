"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  detectMediaType,
  MAX_PRODUCT_MEDIA,
  type ProductMediaType,
} from "@/lib/media";
import type { ProductFormInitial } from "@/lib/products/form-initial";
import {
  buildVariantName,
  emptyVariantRow,
  type VariantFormRow,
} from "@/lib/products/variants";

export type { ProductFormInitial } from "@/lib/products/form-initial";

type ProductFormProps = {
  mode: "create" | "edit";
  currency: string;
  initial: ProductFormInitial;
};

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function ProductForm({ mode, currency, initial }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [compareAtPrice, setCompareAtPrice] = useState(initial.compareAtPrice);
  const [status, setStatus] = useState(initial.status);
  const [stock, setStock] = useState(initial.stock);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.lowStockThreshold);
  const [mediaRows, setMediaRows] = useState(
    initial.media.length > 0 ? initial.media : [{ url: "", mediaType: "IMAGE" as ProductMediaType }],
  );
  const [variants, setVariants] = useState<VariantFormRow[]>(
    initial.variants.length > 0 ? initial.variants : [],
  );
  const [useVariants, setUseVariants] = useState(initial.variants.length > 0);

  function updateVariant(index: number, field: keyof VariantFormRow, value: string) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, emptyVariantRow()]);
    setUseVariants(true);
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  function addMediaField() {
    if (mediaRows.length >= MAX_PRODUCT_MEDIA) {
      toast.error(`Maximum ${MAX_PRODUCT_MEDIA} items per product.`);
      return;
    }
    setMediaRows((rows) => [...rows, { url: "", mediaType: "IMAGE" }]);
  }

  function updateMediaUrl(index: number, value: string) {
    setMediaRows((rows) =>
      rows.map((row, i) =>
        i === index
          ? { ...row, url: value, mediaType: value ? detectMediaType(value) : row.mediaType }
          : row,
      ),
    );
  }

  function updateMediaType(index: number, mediaType: ProductMediaType) {
    setMediaRows((rows) => rows.map((row, i) => (i === index ? { ...row, mediaType } : row)));
  }

  function removeMediaField(index: number) {
    setMediaRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (useVariants) {
      const invalidVariant = variants.find((row) => !buildVariantName(row.size, row.color));
      if (invalidVariant) {
        toast.error("Each variant needs a size or color.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      title,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      status,
      stock: useVariants ? 0 : Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      media: mediaRows
        .filter((row) => row.url.trim())
        .map((row) => ({
          url: row.url.trim(),
          mediaType: row.mediaType || detectMediaType(row.url),
        })),
      variants: useVariants
        ? variants.map((row) => ({
            id: row.id,
            name: buildVariantName(row.size, row.color),
            sku: row.sku.trim() || undefined,
            price: row.price ? Number(row.price) : null,
            stock: Number(row.stock),
          }))
        : [],
    };

    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${initial.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not save product");
        return;
      }

      toast.success(mode === "create" ? "Product created" : "Product updated");
      router.push("/dashboard/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Basic details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Ankara Midi Dress"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Tell customers what makes this product special."
            />
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Sale pricing</p>
            <p className="mt-1 text-xs text-amber-900/80">
              Set a sale price below the original to show a strike-through on your storefront —
              like Discounty and Shopify sale badges.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sale price ({currency})
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Original price ({currency}) <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Shows as crossed-out"
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductFormInitial["status"])}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="cf-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Gallery</h2>
            <p className="mt-1 text-xs text-[#86868b]">
              Up to {MAX_PRODUCT_MEDIA} photos, videos, or GIFs (paste URLs).
            </p>
          </div>
          <button
            type="button"
            onClick={addMediaField}
            disabled={mediaRows.length >= MAX_PRODUCT_MEDIA}
            className="btn-secondary py-2 text-xs disabled:opacity-40"
          >
            Add media
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {mediaRows.map((row, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row">
              <select
                value={row.mediaType}
                onChange={(e) => updateMediaType(index, e.target.value as ProductMediaType)}
                className="cf-input w-full sm:w-28"
              >
                <option value="IMAGE">Photo</option>
                <option value="VIDEO">Video</option>
                <option value="GIF">GIF</option>
              </select>
              <input
                value={row.url}
                onChange={(e) => updateMediaUrl(index, e.target.value)}
                className="cf-input flex-1"
                placeholder="https://..."
              />
              {mediaRows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeMediaField(index)}
                  className="rounded-[10px] border border-black/[0.08] px-3 text-[#86868b] hover:bg-[#f5f5f7]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Variants</h2>
            <p className="mt-1 text-xs text-slate-500">Size, color, SKU, and per-variant stock.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={useVariants}
              onChange={(e) => {
                setUseVariants(e.target.checked);
                if (e.target.checked && variants.length === 0) {
                  setVariants([emptyVariantRow()]);
                }
              }}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Use variants
          </label>
        </div>

        {useVariants ? (
          <div className="mt-4 space-y-3">
            <div className="hidden gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid sm:grid-cols-[1fr_1fr_1fr_1fr_80px_40px]">
              <span>Size</span>
              <span>Color</span>
              <span>SKU</span>
              <span>Price override</span>
              <span>Stock</span>
              <span />
            </div>
            {variants.map((row, index) => (
              <div
                key={row.id ?? index}
                className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_80px_40px]"
              >
                <input
                  value={row.size}
                  onChange={(e) => updateVariant(index, "size", e.target.value)}
                  placeholder="Size M"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={row.color}
                  onChange={(e) => updateVariant(index, "color", e.target.value)}
                  placeholder="Red"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  value={row.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  placeholder="SKU-001"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={row.price}
                  onChange={(e) => updateVariant(index, "price", e.target.value)}
                  placeholder="Optional"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  required
                  value={row.stock}
                  onChange={(e) => updateVariant(index, "stock", e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add variant
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Single-SKU product — set stock in the inventory section below.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Inventory</h2>
        <p className="mt-1 text-xs text-slate-500">
          Stock counts are logged on change. Auto-deduct on orders is controlled in store settings.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {!useVariants ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock count</label>
              <input
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Total stock:{" "}
              <span className="font-semibold text-slate-900">
                {variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0)}
              </span>{" "}
              units across {variants.length} variant{variants.length === 1 ? "" : "s"}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Low-stock threshold
            </label>
            <input
              type="number"
              min={0}
              required
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              You&apos;ll see a warning when available stock falls to this level.
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Link href="/dashboard/products" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}