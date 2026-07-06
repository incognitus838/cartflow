"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CollapsibleSection } from "@/components/dashboard/product-form/collapsible-section";
import { MediaGallery, type MediaRow } from "@/components/dashboard/product-form/media-gallery";
import { RichTextEditor } from "@/components/dashboard/product-form/rich-text-editor";
import { VariantsSection } from "@/components/dashboard/product-form/variants-section";
import { detectMediaType } from "@/lib/media";
import type { ProductFormInitial } from "@/lib/products/form-initial";
import { serializeProductMetadata } from "@/lib/products/metadata";
import { PRODUCT_TYPES } from "@/lib/products/product-types";
import { createVariantGroup } from "@/lib/products/variant-groups";
import { emptyVariantRow, type VariantFormRow } from "@/lib/products/variants";
import { formatCurrency } from "@/lib/utils";

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
  const [category, setCategory] = useState(initial.category);
  const [metadata, setMetadata] = useState(initial.metadata);
  const [price, setPrice] = useState(initial.price);
  const [compareAtPrice, setCompareAtPrice] = useState(initial.compareAtPrice);
  const [status, setStatus] = useState(initial.status);
  const [stock, setStock] = useState(initial.stock);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.lowStockThreshold);
  const [mediaRows, setMediaRows] = useState<MediaRow[]>(initial.media);
  const [variants, setVariants] = useState<VariantFormRow[]>(initial.variants);
  const [variantGroups, setVariantGroups] = useState([
    createVariantGroup(metadata.productType === "DIGITAL" ? "Module" : "Size"),
  ]);
  const [useVariants, setUseVariants] = useState(initial.variants.length > 0);
  const [tagsInput, setTagsInput] = useState(initial.metadata.tags.join(", "));

  const pricePreview = useMemo(() => {
    const sale = Number(price);
    const original = compareAtPrice ? Number(compareAtPrice) : null;
    if (!Number.isFinite(sale)) return null;
    return { sale, original };
  }, [price, compareAtPrice]);

  function patchMetadata<K extends keyof typeof metadata>(key: K, value: (typeof metadata)[K]) {
    setMetadata((current) => ({ ...current, [key]: value }));
  }

  async function saveProduct(nextStatus?: typeof status) {
    if (useVariants) {
      const invalidVariant = variants.find((row) => !row.name.trim());
      if (invalidVariant) {
        toast.error("Each variant needs a name.");
        return;
      }
    }

    setLoading(true);
    const resolvedStatus = nextStatus ?? status;
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      title,
      description,
      category,
      metadata: serializeProductMetadata({ ...metadata, tags }),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      status: resolvedStatus,
      stock: useVariants ? 0 : Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      media: mediaRows
        .filter((row) => row.url.trim() && !row.uploading)
        .map((row) => ({
          url: row.url.trim(),
          mediaType: row.mediaType || detectMediaType(row.url),
          alt: row.alt,
        })),
      variants: useVariants
        ? variants.map((row) => ({
            id: row.id,
            name: row.name.trim(),
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

      toast.success(
        mode === "create"
          ? resolvedStatus === "DRAFT"
            ? "Draft saved"
            : "Product created"
          : "Product updated",
      );
      router.push("/dashboard/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="cf-product-form"
      onSubmit={(event) => {
        event.preventDefault();
        void saveProduct();
      }}
    >
      <header className="cf-product-form-header">
        <div>
          <nav className="flex flex-wrap items-center gap-1 text-[12px] text-[#86868b]" aria-label="Breadcrumb">
            <Link href="/dashboard/products" className="hover:text-[#1d1d1f]">
              Products
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-[#1d1d1f]">{mode === "create" ? "Add new product" : "Edit product"}</span>
          </nav>
          <h1 className="cf-page-title mt-2">{mode === "create" ? "Add New Product" : "Edit Product"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loading}
            className="cf-pill px-4 py-2 text-[13px]"
            onClick={() => void saveProduct("DRAFT")}
          >
            Save draft
          </button>
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 text-[13px]">
            {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
          </button>
        </div>
      </header>

      <section className="cf-product-card cf-product-card--lift">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">Basic details</h2>
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="product-title" className="cf-product-label">
              Title
            </label>
            <input
              id="product-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cf-input mt-2 text-[16px] font-medium sm:text-[18px]"
              placeholder="Ankara Midi Dress"
            />
          </div>

          <div>
            <label className="cf-product-label">Description</label>
            <div className="mt-2">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Tell customers what makes this product special."
              />
            </div>
          </div>

          <fieldset>
            <legend className="cf-product-label">Product type</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PRODUCT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`cf-product-type-option ${
                    metadata.productType === type.value ? "cf-product-type-option--active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="productType"
                    value={type.value}
                    checked={metadata.productType === type.value}
                    onChange={() => patchMetadata("productType", type.value)}
                    className="sr-only"
                  />
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">{type.label}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-[#86868b]">{type.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="cf-product-card cf-product-card--lift cf-product-card--gold">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">Pricing</h2>
        <p className="mt-1 text-[12px] text-[#86868b]">
          Currency: <span className="font-medium text-[#1d1d1f]">{currency}</span>
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sale-price" className="cf-product-label">
              Sale price
            </label>
            <input
              id="sale-price"
              required
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="cf-input mt-2"
            />
          </div>
          <div>
            <label htmlFor="original-price" className="cf-product-label">
              Original price <span className="text-[#86868b]">(optional)</span>
            </label>
            <input
              id="original-price"
              type="number"
              min={0}
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="cf-input mt-2"
              placeholder="Shows as crossed-out"
            />
          </div>
        </div>
        {pricePreview && Number.isFinite(pricePreview.sale) ? (
          <p className="mt-4 text-[13px] text-[#6e6e73]">
            Storefront preview:{" "}
            <span className="font-semibold text-[#1d1d1f]">
              {formatCurrency(pricePreview.sale, currency)}
            </span>
            {pricePreview.original && pricePreview.original > pricePreview.sale ? (
              <span className="ml-2 text-[#86868b] line-through">
                {formatCurrency(pricePreview.original, currency)}
              </span>
            ) : null}
          </p>
        ) : null}
      </section>

      <MediaGallery rows={mediaRows} onChange={setMediaRows} />

      <VariantsSection
        productType={metadata.productType}
        useVariants={useVariants}
        onUseVariantsChange={setUseVariants}
        groups={variantGroups}
        onGroupsChange={setVariantGroups}
        variants={variants}
        onVariantsChange={setVariants}
      />

      <section className="cf-product-card cf-product-card--lift">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
          Inventory &amp; fulfillment
        </h2>
        <p className="mt-1 text-[12px] text-[#86868b]">
          {metadata.productType === "DIGITAL"
            ? "Digital products auto-deliver via link — no stock limit required."
            : metadata.productType === "FOOD"
              ? "Track freshness, prep time, and low-stock alerts."
              : metadata.productType === "SERVICE"
                ? "Services may not need stock — set availability per variant if needed."
                : "Physical goods deduct stock when orders are marked paid."}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {metadata.productType !== "DIGITAL" && !useVariants ? (
            <div>
              <label htmlFor="stock-count" className="cf-product-label">
                Stock quantity
              </label>
              <input
                id="stock-count"
                type="number"
                min={0}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="cf-input mt-2"
              />
            </div>
          ) : useVariants ? (
            <div className="rounded-[12px] bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#6e6e73] sm:col-span-2">
              Total stock:{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0)}
              </span>{" "}
              units across {variants.length} variant{variants.length === 1 ? "" : "s"}
            </div>
          ) : (
            <div className="rounded-[12px] bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#6e6e73] sm:col-span-2">
              Unlimited digital stock — delivery link sent after payment.
            </div>
          )}

          <div>
            <label htmlFor="low-stock" className="cf-product-label">
              Low-stock alert
            </label>
            <input
              id="low-stock"
              type="number"
              min={0}
              required
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="cf-input mt-2"
            />
          </div>

          {metadata.productType === "PHYSICAL" ? (
            <>
              <div>
                <label htmlFor="product-sku" className="cf-product-label">
                  SKU
                </label>
                <input
                  id="product-sku"
                  value={metadata.sku}
                  onChange={(e) => patchMetadata("sku", e.target.value)}
                  className="cf-input mt-2"
                />
              </div>
              <div>
                <label htmlFor="product-weight" className="cf-product-label">
                  Weight (kg)
                </label>
                <input
                  id="product-weight"
                  type="number"
                  min={0}
                  step="0.01"
                  value={metadata.weightKg}
                  onChange={(e) => patchMetadata("weightKg", e.target.value)}
                  className="cf-input mt-2"
                />
              </div>
            </>
          ) : null}

          {metadata.productType === "DIGITAL" ? (
            <div className="sm:col-span-2">
              <label htmlFor="delivery-url" className="cf-product-label">
                Auto-delivery link
              </label>
              <input
                id="delivery-url"
                type="url"
                value={metadata.digitalDeliveryUrl}
                onChange={(e) => patchMetadata("digitalDeliveryUrl", e.target.value)}
                className="cf-input mt-2"
                placeholder="https://course.example.com/access"
              />
            </div>
          ) : null}

          {metadata.productType === "FOOD" ? (
            <>
              <div>
                <label htmlFor="expiry-date" className="cf-product-label">
                  Expiry date
                </label>
                <input
                  id="expiry-date"
                  type="date"
                  value={metadata.expiryDate}
                  onChange={(e) => patchMetadata("expiryDate", e.target.value)}
                  className="cf-input mt-2"
                />
              </div>
              <div>
                <label htmlFor="prep-time" className="cf-product-label">
                  Preparation time (minutes)
                </label>
                <input
                  id="prep-time"
                  type="number"
                  min={0}
                  value={metadata.prepTimeMinutes}
                  onChange={(e) => patchMetadata("prepTimeMinutes", e.target.value)}
                  className="cf-input mt-2"
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      <CollapsibleSection title="Categories & tags" description="Organise products for your storefront.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="cf-product-label">
              Category
            </label>
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="cf-input mt-2"
              placeholder="Skincare"
            />
          </div>
          <div>
            <label htmlFor="tags" className="cf-product-label">
              Tags
            </label>
            <input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="cf-input mt-2"
              placeholder="bestseller, new arrival"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="SEO" description="How this product appears in search and shares.">
        <div className="space-y-4">
          <div>
            <label htmlFor="seo-title" className="cf-product-label">
              Meta title
            </label>
            <input
              id="seo-title"
              value={metadata.seoTitle}
              onChange={(e) => patchMetadata("seoTitle", e.target.value)}
              className="cf-input mt-2"
              placeholder={title || "Product title for search"}
            />
          </div>
          <div>
            <label htmlFor="seo-description" className="cf-product-label">
              Meta description
            </label>
            <textarea
              id="seo-description"
              rows={3}
              value={metadata.seoDescription}
              onChange={(e) => patchMetadata("seoDescription", e.target.value)}
              className="cf-input mt-2 resize-y"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Custom fields" description="Ingredients, duration, or any extra details.">
        <div className="grid gap-4 sm:grid-cols-2">
          {metadata.productType === "FOOD" ? (
            <div className="sm:col-span-2">
              <label htmlFor="ingredients" className="cf-product-label">
                Ingredients
              </label>
              <textarea
                id="ingredients"
                rows={3}
                value={metadata.customFields.ingredients ?? ""}
                onChange={(e) =>
                  patchMetadata("customFields", {
                    ...metadata.customFields,
                    ingredients: e.target.value,
                  })
                }
                className="cf-input mt-2 resize-y"
              />
            </div>
          ) : null}
          {metadata.productType === "DIGITAL" ? (
            <div>
              <label htmlFor="duration" className="cf-product-label">
                Duration
              </label>
              <input
                id="duration"
                value={metadata.customFields.duration ?? ""}
                onChange={(e) =>
                  patchMetadata("customFields", {
                    ...metadata.customFields,
                    duration: e.target.value,
                  })
                }
                className="cf-input mt-2"
                placeholder="6 weeks"
              />
            </div>
          ) : null}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Status" description="Draft, active, or scheduled publishing." defaultOpen>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="product-status" className="cf-product-label">
              Status
            </label>
            <select
              id="product-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductFormInitial["status"])}
              className="cf-input mt-2"
            >
              {STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="scheduled-at" className="cf-product-label">
              Schedule (optional)
            </label>
            <input
              id="scheduled-at"
              type="datetime-local"
              value={metadata.scheduledAt}
              onChange={(e) => patchMetadata("scheduledAt", e.target.value)}
              className="cf-input mt-2"
            />
          </div>
        </div>
      </CollapsibleSection>

      <footer className="cf-product-form-footer">
        <Link href="/dashboard/products" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={loading} className="cf-product-create-btn">
          {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
      </footer>
    </form>
  );
}