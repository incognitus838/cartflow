import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { ProductsList } from "@/components/dashboard/products-list";
import { PageHeader } from "@/components/shared/page-header";
import { canManageProducts, isPendingApproval } from "@/lib/business/approval";
import { requireProductsHub } from "@/lib/auth-server";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import { listBusinessProducts } from "@/lib/queries/dashboard";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  if (params.tab === "structure") {
    redirect("/dashboard/products/new");
  }

  const { business, permissions } = await requireProductsHub();
  const canProducts = permissions.products;
  const productsUnlocked = canManageProducts(business);
  const storePending = isPendingApproval(business);

  const products = canProducts
    ? normalizeProductsForList(await listBusinessProducts(business.id))
    : [];

  return (
    <>
      <PageHeader
        title={storePending ? "Products" : "Products"}
        description={
          storePending
            ? "Your store is awaiting approval. Set up your catalog first — product uploads unlock after review."
            : "Manage inventory, pricing, and stock."
        }
        actions={
          canProducts ? (
            <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              {storePending || !productsUnlocked ? "Set up catalog" : "Add product"}
            </Link>
          ) : null
        }
      />

      {canProducts ? (
        <>
          {!productsUnlocked ? (
            <div className="mb-6 rounded-[var(--cf-radius-md)] border border-[#e8a317]/30 bg-[#fffdf5] px-4 py-3 text-[13px] text-[#9a6700]">
              Product uploads are locked until your store is approved.{" "}
              <Link
                href="/dashboard/products/new"
                className="font-medium underline underline-offset-2"
              >
                Set up your catalog
              </Link>{" "}
              to complete your application.
            </div>
          ) : null}

          <ProductsList
            initialProducts={products}
            currency={business.currency}
            canDelete={permissions.productsDelete}
            productsUnlocked={productsUnlocked}
          />
        </>
      ) : null}
    </>
  );
}