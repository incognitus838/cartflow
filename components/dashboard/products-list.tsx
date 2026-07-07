"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { useLiveListSync } from "@/components/dashboard/use-live-list-sync";
import { toNumber } from "@/lib/decimal";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import { formatCurrency } from "@/lib/utils";

export type ProductListRow = {
  id: string;
  title: string;
  category: string;
  price: unknown;
  stock: number;
  lowStockThreshold: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  updatedAt: string | Date;
  images: { url: string }[];
  variants: { stock: number }[];
  _count: { variants: number };
};

type ProductsListProps = {
  initialProducts: ProductListRow[];
  currency: string;
  canDelete: boolean;
  productsUnlocked: boolean;
};

function productSignature(products: ProductListRow[]) {
  return products.map((product) => `${product.id}:${product.updatedAt}`).join("|");
}

export function ProductsList({
  initialProducts,
  currency,
  canDelete,
  productsUnlocked,
}: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts);
  const initialSignature = useMemo(() => productSignature(initialProducts), [initialProducts]);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { products: ProductListRow[] };
      setProducts(normalizeProductsForList(data.products));
    } catch {
      /* ignore transient network errors */
    }
  }, []);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialSignature, initialProducts]);

  useLiveListSync({
    onSync: refetch,
    watchProducts: true,
    watchCatalog: true,
    refetchOnMount: true,
  });

  function handleProductDeleted(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  if (products.length === 0) {
    return (
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
    );
  }

  return (
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
                    {formatCurrency(toNumber(product.price), currency)}
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
                      canDelete={canDelete}
                      onDeleted={handleProductDeleted}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}