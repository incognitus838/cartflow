import Link from "next/link";
import { Suspense } from "react";
import { Package, Plus } from "lucide-react";
import { CatalogManager } from "@/components/dashboard/catalog-manager";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { ProductsTabs } from "@/components/dashboard/products-tabs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { PageHeader } from "@/components/shared/page-header";
import { canManageProducts, isPendingApproval } from "@/lib/business/approval";
import { requireProductsHub } from "@/lib/auth-server";
import { resolveCatalogSettings } from "@/lib/catalog/settings";
import { toNumber } from "@/lib/decimal";
import { listBusinessProducts } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const { business, permissions } = await requireProductsHub();
  const params = await searchParams;
  const canProducts = permissions.products;
  const canCatalog = permissions.catalog;
  const productsUnlocked = canManageProducts(business);
  const storePending = isPendingApproval(business);

  let tab: "products" | "structure" =
    params.tab === "structure" ? "structure" : "products";
  if (storePending) tab = "structure";
  if (tab === "products" && !canProducts && canCatalog) tab = "structure";
  if (tab === "structure" && !canCatalog && canProducts) tab = "products";

  const [products, catalog] = await Promise.all([
    canProducts ? listBusinessProducts(business.id) : Promise.resolve([]),
    canCatalog || canProducts ? resolveCatalogSettings(business.id) : Promise.resolve(null),
  ]);

  const productCountByCategory = products.reduce<Record<string, number>>((acc, product) => {
    const name = product.category?.trim() || "General";
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Products"
        description={
          storePending || tab === "structure"
            ? "Set up categories and tags for admin review. Product uploads unlock after your store is approved."
            : "Add products, manage stock, and assign categories from your catalog structure."
        }
        actions={
          tab === "products" && canProducts ? (
            <div className="flex flex-wrap items-center gap-2">
              {canCatalog ? (
                <Link
                  href="/dashboard/products?tab=structure"
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                >
                  Categories & tags
                </Link>
              ) : null}
              {productsUnlocked ? (
                <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add product
                </Link>
              ) : null}
            </div>
          ) : canProducts ? (
            <Link href="/dashboard/products" className="text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f]">
              View products →
            </Link>
          ) : null
        }
      />

      <Suspense fallback={null}>
        <ProductsTabs
          active={tab}
          canProducts={canProducts && !storePending}
          canCatalog={canCatalog}
        />
      </Suspense>

      {tab === "structure" && canCatalog && catalog ? (
        <CatalogManager initial={catalog} productCountByCategory={productCountByCategory} />
      ) : null}

      {tab === "products" && canProducts ? (
        <>
          {!productsUnlocked ? (
            <div className="mb-6 rounded-[var(--cf-radius-md)] border border-[#e8a317]/30 bg-[#fffdf5] px-4 py-3 text-[13px] text-[#9a6700]">
              Product uploads are locked until your store is approved.{" "}
              {canCatalog ? (
                <>
                  Configure{" "}
                  <Link
                    href="/dashboard/products?tab=structure"
                    className="font-medium underline underline-offset-2"
                  >
                    categories & tags
                  </Link>{" "}
                  first.
                </>
              ) : null}
            </div>
          ) : null}

          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description={
                productsUnlocked
                  ? "Add your first product — pick a category from your catalog structure or create one inline."
                  : "Your store is awaiting approval. Set up categories first, then add products once approved."
              }
              actionLabel={
                productsUnlocked
                  ? "Add product"
                  : canCatalog
                    ? "Set up categories"
                    : undefined
              }
              actionHref={
                productsUnlocked
                  ? "/dashboard/products/new"
                  : canCatalog
                    ? "/dashboard/products?tab=structure"
                    : undefined
              }
            />
          ) : (
            <section aria-labelledby="products-table-heading">
              <h2 id="products-table-heading" className="sr-only">
                Product catalog
              </h2>
              <div className="cf-table-shell overflow-x-auto">
                <table className="min-w-[720px]">
                  <caption className="sr-only">Store products</caption>
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Category</th>
                      <th scope="col">Price</th>
                      <th scope="col">Stock</th>
                      <th scope="col">Variants</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const thumbnail = product.images[0]?.url;

                      return (
                        <tr key={product.id}>
                          <td>
                            <Link
                              href={`/dashboard/products/${product.id}/edit`}
                              className="flex items-center gap-3 hover:text-[#b8956a]"
                            >
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt=""
                                  className="h-10 w-10 rounded-[var(--cf-radius-sm)] border border-black/[0.06] object-cover"
                                />
                              ) : (
                                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--cf-radius-sm)] bg-[#f5f5f7] text-[#86868b]">
                                  <Package className="h-4 w-4" aria-hidden />
                                </span>
                              )}
                              <span className="font-medium text-[#1d1d1f]">{product.title}</span>
                            </Link>
                          </td>
                          <td className="text-[#6e6e73]">{product.category || "General"}</td>
                          <td className="currency text-[#6e6e73]">
                            {formatCurrency(toNumber(product.price), business.currency)}
                          </td>
                          <td>
                            <StockBadge
                              stock={product.stock}
                              lowStockThreshold={product.lowStockThreshold}
                              variants={product.variants}
                            />
                          </td>
                          <td className="text-[#6e6e73]">
                            {product._count.variants > 0 ? `${product._count.variants} variants` : "—"}
                          </td>
                          <td>
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="text-right">
                            <ProductActions
                              productId={product.id}
                              productTitle={product.title}
                              canDelete={permissions.productsDelete}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      ) : null}
    </>
  );
}