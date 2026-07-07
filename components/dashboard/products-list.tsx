"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Package } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { useLiveListSync } from "@/components/dashboard/use-live-list-sync";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { toNumber, type NumericInput } from "@/lib/decimal";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_PRESETS,
  sortPresetId,
  sortProducts,
  toggleSortField,
  type ProductSort,
  type ProductSortField,
} from "@/lib/products/list-sort";
import { formatCurrency } from "@/lib/utils";

export type ProductListRow = {
  id: string;
  title: string;
  category: string;
  price: NumericInput;
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

type StatusFilter = "" | "ACTIVE" | "DRAFT" | "ARCHIVED";

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

function productSignature(products: ProductListRow[]) {
  return products.map((product) => `${product.id}:${product.updatedAt}`).join("|");
}

type SortableHeaderProps = {
  label: string;
  field: ProductSortField;
  sort: ProductSort;
  onSort: (field: ProductSortField) => void;
  className?: string;
};

function SortableHeader({ label, field, sort, onSort, className }: SortableHeaderProps) {
  const active = sort.field === field;
  const Icon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;

  return (
    <th scope="col" className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`group inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left transition-colors hover:text-[#1d1d1f] ${
          active ? "text-[#1d1d1f]" : "text-[#86868b]"
        }`}
        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <span>{label}</span>
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#b8956a]" : "text-[#c7c7cc] group-hover:text-[#86868b]"}`}
          aria-hidden
        />
      </button>
    </th>
  );
}

export function ProductsList({
  initialProducts,
  currency,
  canDelete,
  productsUnlocked,
}: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sort, setSort] = useState<ProductSort>(DEFAULT_PRODUCT_SORT);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter && product.status !== statusFilter) return false;
      if (!q) return true;
      return (
        product.title.toLowerCase().includes(q) ||
        (product.category || "General").toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter]);

  const displayed = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  function handleProductDeleted(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  function handleHeaderSort(field: ProductSortField) {
    setSort((current) => toggleSortField(current, field));
  }

  function handlePresetChange(presetId: string) {
    const preset = PRODUCT_SORT_PRESETS.find((item) => item.id === presetId);
    if (preset) setSort(preset.sort);
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

      <FilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchLabel="Search products"
        searchPlaceholder="Product name or category…"
        filters={STATUS_FILTERS}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        filterLegend="Filter products by status"
        resultCount={displayed.length}
        trailing={
          <div className="flex w-full flex-col gap-1 sm:w-auto">
            <label htmlFor="products-sort" className="text-[11px] font-medium text-[#86868b]">
              Sort by
            </label>
            <select
              id="products-sort"
              value={sortPresetId(sort)}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="cf-input min-w-[11rem] py-2 text-[13px]"
            >
              {PRODUCT_SORT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="cf-table-shell overflow-x-auto">
        <table className="min-w-[720px]">
          <caption className="sr-only">Store products</caption>
          <thead>
            <tr>
              <SortableHeader label="Product" field="title" sort={sort} onSort={handleHeaderSort} />
              <SortableHeader
                label="Category"
                field="category"
                sort={sort}
                onSort={handleHeaderSort}
                className="hidden sm:table-cell"
              />
              <SortableHeader label="Price" field="price" sort={sort} onSort={handleHeaderSort} />
              <SortableHeader label="Stock" field="stock" sort={sort} onSort={handleHeaderSort} />
              <th scope="col" className="hidden md:table-cell text-[#86868b]">
                Variants
              </th>
              <SortableHeader
                label="Status"
                field="status"
                sort={sort}
                onSort={handleHeaderSort}
              />
              <th scope="col" className="text-right text-[#86868b]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((product) => {
              const thumbnail = product.images[0]?.url;

              return (
                <tr key={product.id} className="transition-colors hover:bg-[#fbfbfd]">
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
                      <span className="min-w-0">
                        <span className="block font-medium text-[#1d1d1f]">{product.title}</span>
                        <span className="mt-0.5 block text-[11px] text-[#86868b] sm:hidden">
                          {product.category || "General"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="hidden text-[#6e6e73] sm:table-cell">
                    {product.category || "General"}
                  </td>
                  <td className="currency whitespace-nowrap text-[#6e6e73]">
                    {formatCurrency(toNumber(product.price), currency)}
                  </td>
                  <td>
                    <StockBadge
                      stock={product.stock}
                      lowStockThreshold={product.lowStockThreshold}
                      variants={product.variants}
                    />
                  </td>
                  <td className="hidden whitespace-nowrap text-[#6e6e73] md:table-cell">
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

      {displayed.length === 0 ? (
        <p className="cf-table-empty mt-4 rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white">
          No products match your search or filters.
        </p>
      ) : null}
    </section>
  );
}