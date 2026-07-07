"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { isCatalogProductType } from "@/lib/catalog/templates";
import type { CatalogSettings } from "@/lib/catalog/settings";
import { catalogCategoryNames } from "@/lib/catalog/settings";
import { toProductFormInitial } from "@/lib/products/form-initial";
import type { ProductType } from "@/lib/products/product-types";

type AddProductFlowProps = {
  currency: string;
  initialCatalog: CatalogSettings;
  productsUnlocked: boolean;
  storePending: boolean;
  canCatalog: boolean;
};

export function AddProductFlow({
  currency,
  initialCatalog,
  productsUnlocked,
  storePending,
  canCatalog,
}: AddProductFlowProps) {
  const router = useRouter();
  const productFormRef = useRef<HTMLDivElement>(null);
  const [catalog, setCatalog] = useState(initialCatalog);

  const catalogType = isCatalogProductType(catalog.templateId) ? catalog.templateId : null;
  const needsCatalogType = !catalogType || catalog.categories.length === 0;

  const scrollToProductForm = useCallback(() => {
    productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleCatalogChange(next: CatalogSettings) {
    setCatalog(next);
    router.refresh();
  }

  function handleCatalogTypeApplied() {
    if (productsUnlocked) {
      setTimeout(scrollToProductForm, 150);
    }
  }

  if (!canCatalog && productsUnlocked) {
    return (
      <ProductForm
        mode="create"
        currency={currency}
        initial={toProductFormInitial()}
        catalogCategories={catalogCategoryNames(catalog)}
        catalogTags={catalog.tags}
      />
    );
  }

  if (storePending && !productsUnlocked) {
    return (
      <>
        <PageHeader
          title="Catalog setup"
          description="Choose what you sell — Physical, Digital, Food, or Service. Categories save to your store for admin review."
        />
        <CatalogManager
          initial={catalog}
          embedded
          emphasizeTemplates
          onSettingsChange={handleCatalogChange}
          onTemplateApplied={handleCatalogTypeApplied}
          onSaved={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          savedRedirectLabel="Save & back to overview"
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {canCatalog && needsCatalogType ? (
        <section id="catalog" className="scroll-mt-6">
          <PageHeader
            title="What do you sell?"
            description="Pick your catalog type first — categories and tags load automatically, then add your product below."
          />
          <CatalogManager
            initial={catalog}
            embedded
            emphasizeTemplates
            onSettingsChange={handleCatalogChange}
            onTemplateApplied={handleCatalogTypeApplied}
          />
        </section>
      ) : null}

      {productsUnlocked && catalogType && !needsCatalogType ? (
        <div ref={productFormRef} className="scroll-mt-6">
          <ProductForm
            mode="create"
            currency={currency}
            initial={toProductFormInitial(undefined, catalogType as ProductType)}
            catalogCategories={catalogCategoryNames(catalog)}
            catalogTags={catalog.tags}
            lockedProductType={catalogType as ProductType}
          />
        </div>
      ) : productsUnlocked && needsCatalogType ? (
        <p className="text-[13px] text-[#6e6e73]">
          Select a catalog type above to unlock the product form.
        </p>
      ) : canCatalog ? (
        <div className="rounded-[var(--cf-radius-md)] border border-[#e8a317]/30 bg-[#fffdf5] px-4 py-3 text-[13px] text-[#9a6700]">
          Product uploads unlock once your store is approved. Finish catalog setup above, then check
          back on your dashboard.
        </div>
      ) : null}

      {canCatalog && catalogType && !needsCatalogType ? (
        <details id="catalog-edit" className="rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-900">
            Edit catalog type, categories & tags
          </summary>
          <div className="border-t border-slate-100 px-5 py-5">
            <CatalogManager
              initial={catalog}
              embedded
              onSettingsChange={handleCatalogChange}
              onTemplateApplied={handleCatalogTypeApplied}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}