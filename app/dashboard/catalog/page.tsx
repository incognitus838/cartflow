import Link from "next/link";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { resolveCatalogSettings } from "@/lib/catalog/settings";

export default async function CatalogPage() {
  const { business } = await requireBusiness();
  const settings = await resolveCatalogSettings(business.id);

  return (
    <>
      <PageHeader
        title="Catalog"
        description="Manage categories and tags for your products. Categories appear as filters on your storefront."
        actions={
          <Link href="/dashboard/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            View products →
          </Link>
        }
      />
      <CatalogManager initial={settings} />
    </>
  );
}