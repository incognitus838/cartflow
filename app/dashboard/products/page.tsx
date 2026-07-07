import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { PageHeader } from "@/components/shared/page-header";
import { canManageProducts, isPendingApproval } from "@/lib/business/approval";
import { requireProductsHub } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";
import { listBusinessProducts } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils";

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

  const products = canProducts ? await listBusinessProducts(business.id) : [];

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

          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title={productsUnlocked ? "No products yet" : "Catalog not set up"}
              description={
                productsUnlocked
                  ? "Choose your catalog type, pick a category, and add your first product."
                  : "Choose Physical, Digital, Food, or Service to configure your catalog for admin review."
              }
              actionLabel={productsUnlocked ? "Add product" : "Set up catalog"}
              actionHref="/dashboard/products/new"
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