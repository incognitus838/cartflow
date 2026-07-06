import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";
import { listBusinessProducts } from "@/lib/queries/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function ProductsPage() {
  const { business } = await requireBusiness();
  const products = await listBusinessProducts(business.id);

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your catalog and inventory."
        actions={
          <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden />
            Add product
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start taking orders from your storefront link."
          actionLabel="Add product"
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
                        <ProductActions productId={product.id} productTitle={product.title} />
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
  );
}