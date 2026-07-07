"use client";

import { useState } from "react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { ProductForm } from "@/components/dashboard/product-form";
import { isCatalogProductType } from "@/lib/catalog/templates";
import { catalogCategoryNames, type CatalogSettings } from "@/lib/catalog/catalog-shared";
import type { ProductFormInitial } from "@/lib/products/form-initial";
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

  const catalogType = isCatalogProductType(catalog.templateId) ? catalog.templateId : null;

  return (
    <div className="space-y-8">
      <ProductForm
        key={`${catalog.templateId}-${catalog.categories.map((c) => c.id).join(",")}-${catalog.tags.join(",")}`}
        mode="edit"
        currency={currency}
        initial={productInitial}
        catalogCategories={catalogCategoryNames(catalog)}
        catalogTags={catalog.tags}
        lockedProductType={catalogType ? (catalogType as ProductType) : undefined}
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
              onSettingsChange={setCatalog}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}