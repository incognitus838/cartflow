"use client";

import { useCallback, useRef, useState } from "react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { ProductForm } from "@/components/dashboard/product-form";
import { useLiveListSync } from "@/components/dashboard/use-live-list-sync";
import { isCatalogProductType } from "@/lib/catalog/templates";
import {
  catalogSettingsSignature,
  resolveCategoryAfterCatalogChange,
} from "@/lib/catalog/resolve-category";
import { catalogCategoryNames, type CatalogSettings } from "@/lib/catalog/catalog-shared";
import { toProductFormInitial, type ProductFormInitial } from "@/lib/products/form-initial";
import type { ProductType } from "@/lib/products/product-types";

type EditProductFlowProps = {
  currency: string;
  initialCatalog: CatalogSettings;
  productInitial: ProductFormInitial;
  canCatalog: boolean;
};

export function EditProductFlow({
  currency,
  initialCatalog,
  productInitial,
  canCatalog,
}: EditProductFlowProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [product, setProduct] = useState(productInitial);
  const catalogRef = useRef(initialCatalog);

  const catalogType = isCatalogProductType(catalog.templateId) ? catalog.templateId : null;
  const catalogSyncKey = catalogSettingsSignature(catalog);

  const refetchProduct = useCallback(async () => {
    if (!productInitial.id) return;
    try {
      const res = await fetch(`/api/products/${productInitial.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { product: Parameters<typeof toProductFormInitial>[0] };
      if (!data.product) return;
      setProduct(toProductFormInitial(data.product));
    } catch {
      /* ignore transient network errors */
    }
  }, [productInitial.id]);

  useLiveListSync({
    onSync: refetchProduct,
    watchProducts: true,
    watchCatalog: true,
    refetchOnMount: true,
  });

  function handleCatalogChange(next: CatalogSettings) {
    setProduct((current) => ({
      ...current,
      category: resolveCategoryAfterCatalogChange(
        current.category,
        catalogRef.current,
        next,
      ),
    }));
    catalogRef.current = next;
    setCatalog(next);
  }

  async function handleCatalogSaved() {
    await refetchProduct();
  }

  function handleProductSaved(next: ProductFormInitial) {
    setProduct(next);
  }

  return (
    <div className="space-y-8">
      <ProductForm
        mode="edit"
        currency={currency}
        initial={product}
        catalogCategories={catalogCategoryNames(catalog)}
        catalogTags={catalog.tags}
        catalogSyncKey={catalogSyncKey}
        lockedProductType={catalogType ? (catalogType as ProductType) : undefined}
        onSaved={handleProductSaved}
      />

      {canCatalog && catalogType ? (
        <details className="rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-900">
            Edit catalog type, categories & tags
          </summary>
          <div className="border-t border-slate-100 px-5 py-5">
            <CatalogManager
              initial={catalog}
              embedded
              syncOnSave
              onSettingsChange={handleCatalogChange}
              onSaved={() => void handleCatalogSaved()}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}