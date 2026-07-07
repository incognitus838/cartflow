"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { ProductForm } from "@/components/dashboard/product-form";
import { PageHeader } from "@/components/shared/page-header";
import type { CatalogSettings } from "@/lib/catalog/settings";
import { catalogCategoryNames } from "@/lib/catalog/settings";
import { toProductFormInitial } from "@/lib/products/form-initial";

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
  const needsCatalogSetup = catalog.categories.length === 0;

  const scrollToProductForm = useCallback(() => {
    productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleCatalogChange(next: CatalogSettings) {
    setCatalog(next);
    router.refresh();
  }

  function handleTemplateApplied() {
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
          description="Pick a template and save your categories. This completes your approval checklist — product uploads unlock after review."
        />
        <CatalogManager
          initial={catalog}
          embedded
          emphasizeTemplates
          onSettingsChange={handleCatalogChange}
          onTemplateApplied={handleTemplateApplied}
          onSaved={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          savedRedirectLabel="Back to overview"
        />
      </>
    );
  }

  const showTemplateStep = canCatalog && (needsCatalogSetup || !catalog.templateId);

  return (
    <div className="space-y-8">
      {showTemplateStep ? (
        <section id="catalog" className="scroll-mt-6">
          <PageHeader
            title={needsCatalogSetup ? "Start with a template" : "Add product"}
            description={
              needsCatalogSetup
                ? "Choose an industry template to load categories and tags, then add your product below."
                : "Pick a template to load categories, then continue with product details."
            }
          />
          <CatalogManager
            initial={catalog}
            embedded
            emphasizeTemplates={needsCatalogSetup}
            onSettingsChange={handleCatalogChange}
            onTemplateApplied={handleTemplateApplied}
          />
        </section>
      ) : null}

      {productsUnlocked ? (
        <div ref={productFormRef} className="scroll-mt-6">
          <ProductForm
            mode="create"
            currency={currency}
            initial={toProductFormInitial()}
            catalogCategories={catalogCategoryNames(catalog)}
            catalogTags={catalog.tags}
          />
        </div>
      ) : canCatalog ? (
        <div className="rounded-[var(--cf-radius-md)] border border-[#e8a317]/30 bg-[#fffdf5] px-4 py-3 text-[13px] text-[#9a6700]">
          Product uploads unlock once your store is approved. Finish catalog setup above, then check
          back on your dashboard.
        </div>
      ) : null}

      {canCatalog && !needsCatalogSetup && catalog.categories.length > 0 ? (
        <details id="catalog-edit" className="rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-900">
            Edit categories & tags
          </summary>
          <div className="border-t border-slate-100 px-5 py-5">
            <CatalogManager
              initial={catalog}
              embedded
              onSettingsChange={handleCatalogChange}
              onTemplateApplied={handleTemplateApplied}
            />
          </div>
        </details>
      ) : null}
    </div>
  );
}