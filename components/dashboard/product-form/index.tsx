"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CategoryTagsFields } from "@/components/dashboard/product-form/category-tags-fields";
import { CollapsibleSection } from "@/components/dashboard/product-form/collapsible-section";
import { MediaGallery, type MediaRow } from "@/components/dashboard/product-form/media-gallery";
import { ProductTypeDetails } from "@/components/dashboard/product-form/product-type-details";
import { ProductTypeSelector } from "@/components/dashboard/product-form/product-type-selector";
import { RichTextEditor } from "@/components/dashboard/product-form/rich-text-editor";
import { VariantsSection } from "@/components/dashboard/product-form/variants-section";
import { detectMediaType } from "@/lib/media";
import type { ProductFormInitial } from "@/lib/products/form-initial";
import type { ProductMetadata } from "@/lib/products/metadata";
import { serializeProductMetadata } from "@/lib/products/metadata";
import { PRODUCT_TYPE_CONFIG } from "@/lib/products/product-type-config";
import { defaultVariantGroupName, type ProductType } from "@/lib/products/product-types";
import { createVariantGroup } from "@/lib/products/variant-groups";
import { emptyVariantRow, type VariantFormRow } from "@/lib/products/variants";
import { formatCurrency } from "@/lib/utils";

export type { ProductFormInitial } from "@/lib/products/form-initial";

type ProductFormProps = {
  mode: "create" | "edit";
  currency: string;
  initial: ProductFormInitial;
  catalogCategories?: string[];
  catalogTags?: string[];
};

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function ProductForm({
  mode,
  currency,
  initial,
  catalogCategories = [],
  catalogTags = [],
}: ProductFormProps) {
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
  const [selectedTags, setSelectedTags] = useState(initial.metadata.tags);

  const typeConfig = PRODUCT_TYPE_CONFIG[metadata.productType];

  const pricePreview = useMemo(() => {
    const sale = Number(price);
    const original = compareAtPrice ? Number(compareAtPrice) : null;
    if (!Number.isFinite(sale)) return null;
    return { sale, original };
  }, [price, compareAtPrice]);

  function patchMetadata<K extends keyof ProductMetadata>(key: K, value: ProductMetadata[K]) {
    setMetadata((current) => ({ ...current, [key]: value }));
  }

  function handleProductTypeChange(nextType: ProductType) {
    patchMetadata("productType", nextType);
    setVariantGroups([createVariantGroup(defaultVariantGroupName(nextType))]);
    if (nextType === "DIGITAL" || nextType === "SERVICE") {
      setStock("0");
    }
  }

  async function saveProduct(nextStatus?: typeof status) {
    if (metadata.productType === "DIGITAL" && !metadata.digitalDeliveryUrl.trim()) {
      toast.error("Add an auto-delivery link for digital products.");
      return;
    }
    if (useVariants) {
      const invalidVariant = variants.find((row) => !row.name.trim());
      if (invalidVariant) {
        toast.error("Each variant needs a name.");
        return;
      }
    }

    setLoading(true);
    const resolvedStatus = nextStatus ?? status;
    const tags = selectedTags.map((tag) => tag.trim()).filter(Boolean);

    const payload = {
      title,
      description,
      category,
      metadata: serializeProductMetadata({ ...metadata, tags }),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      status: resolvedStatus,
      stock:
        metadata.productType === "DIGITAL" || metadata.productType === "SERVICE"
          ? 0
          : useVariants
            ? 0
            : Number(stock),
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
              placeholder={typeConfig.titlePlaceholder}
            />
          </div>

          <div>
            <label className="cf-product-label">Description</label>
            <div className="mt-2">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder={typeConfig.descriptionPlaceholder}
              />
            </div>
          </div>

          <ProductTypeSelector
            value={metadata.productType}
            onChange={handleProductTypeChange}
          />

          <ProductTypeDetails
            type={metadata.productType}
            metadata={metadata}
            stock={stock}
            lowStockThreshold={lowStockThreshold}
            useVariants={useVariants}
            onMetadataChange={patchMetadata}
            onStockChange={setStock}
            onLowStockChange={setLowStockThreshold}
          />
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

      <MediaGallery
        rows={mediaRows}
        onChange={setMediaRows}
        hint={typeConfig.mediaHint}
      />

      {typeConfig.showVariants ? (
        <VariantsSection
          productType={metadata.productType}
          useVariants={useVariants}
          onUseVariantsChange={setUseVariants}
          groups={variantGroups}
          onGroupsChange={setVariantGroups}
          variants={variants}
          onVariantsChange={setVariants}
        />
      ) : null}

      {useVariants && typeConfig.showStock ? (
        <section className="cf-product-card cf-product-card--lift">
          <h2 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Variant stock summary
          </h2>
          <p className="mt-3 rounded-[12px] bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#6e6e73]">
            Total stock:{" "}
            <span className="font-semibold text-[#1d1d1f]">
              {variants.reduce((sum, row) => sum + (Number(row.stock) || 0), 0)}
            </span>{" "}
            units across {variants.length} variant{variants.length === 1 ? "" : "s"}
          </p>
        </section>
      ) : null}

      <CollapsibleSection title="Categories & tags" description="Organise products for your storefront.">
        <CategoryTagsFields
          category={category}
          onCategoryChange={setCategory}
          tags={selectedTags}
          onTagsChange={setSelectedTags}
          catalogCategories={catalogCategories}
          catalogTags={catalogTags}
          categoryPlaceholder={typeConfig.categoryPlaceholder}
        />
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