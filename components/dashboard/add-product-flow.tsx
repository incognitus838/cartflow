"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/shared/page-header";
import { isCatalogProductType } from "@/lib/catalog/templates";
import { catalogCategoryNames, type CatalogSettings } from "@/lib/catalog/catalog-shared";
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
          description="Online gadget sellers, digital creators, and service pros all start here. Pick your catalog type — categories save for admin review."
        />
        <CatalogManager
          initial={catalog}
          embedded
          emphasizeTemplates
          syncOnSave
          onSettingsChange={handleCatalogChange}
          onTemplateApplied={handleCatalogTypeApplied}
          onSaved={() => {
            router.push("/dashboard");
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
            description="Sell gadgets online, digital downloads, or services like personal shopping — pick your store type and suggested categories load automatically."
          />
          <CatalogManager
            initial={catalog}
            embedded
            emphasizeTemplates
            syncOnSave
            onSettingsChange={handleCatalogChange}
            onTemplateApplied={handleCatalogTypeApplied}
          />
        </section>
      ) : null}

      {productsUnlocked && catalogType && !needsCatalogType ? (
        <div ref={productFormRef} className="scroll-mt-6">
          <ProductForm
            key={`${catalog.templateId}-${catalog.categories.map((c) => c.id).join(",")}-${catalog.tags.join(",")}`}
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
          {catalogType
            ? "Keep at least one category, then save — the product form unlocks right away."
            : "Select a catalog type above to unlock the product form."}
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
              syncOnSave
              onSettingsChange={handleCatalogChange}
              onTemplateApplied={handleCatalogTypeApplied}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}