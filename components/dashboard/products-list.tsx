"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, FolderOpen, Package } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProductActions } from "@/components/dashboard/product-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StockBadge } from "@/components/dashboard/stock-badge";
import { useLiveListSync } from "@/components/dashboard/use-live-list-sync";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { notifyCatalogChanged, notifyProductsChanged } from "@/lib/dashboard/live-sync";
import { toNumber, type NumericInput } from "@/lib/decimal";
import {
  buildCategoryOrder,
  groupProductsByCatalog,
  normalizeCategoryName,
} from "@/lib/products/catalog-layout";
import { normalizeProductsForList } from "@/lib/products/list-stock";
import {
  DEFAULT_PRODUCT_SORT,
  isCatalogViewSort,
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
  sortOrder: number;
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
  catalogCategories: string[];
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
  return products
    .map((product) => `${product.id}:${product.category}:${product.sortOrder}:${product.updatedAt}`)
    .join("|");
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

type ProductRowProps = {
  product: ProductListRow;
  currency: string;
  canDelete: boolean;
  categoryOptions: string[];
  showReorder: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  reordering: boolean;
  selected: boolean;
  onToggleSelect: (productId: string) => void;
  onCategoryChange: (productId: string, category: string) => void;
  onReorder: (productId: string, direction: "up" | "down") => void;
  onDeleted: (productId: string) => void;
};

function ProductRow({
  product,
  currency,
  canDelete,
  categoryOptions,
  showReorder,
  canMoveUp,
  canMoveDown,
  reordering,
  selected,
  onToggleSelect,
  onCategoryChange,
  onReorder,
  onDeleted,
}: ProductRowProps) {
  const thumbnail = product.images[0]?.url;

  return (
    <tr
      className={`transition-colors hover:bg-[#fbfbfd] ${selected ? "bg-emerald-50/40" : ""}`}
    >
      <td className="w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          aria-label={`Select ${product.title}`}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
      </td>
      {showReorder ? (
        <td className="w-10">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              disabled={!canMoveUp || reordering}
              onClick={() => onReorder(product.id, "up")}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              aria-label={`Move ${product.title} up`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown || reordering}
              onClick={() => onReorder(product.id, "down")}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              aria-label={`Move ${product.title} down`}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      ) : null}
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
              {normalizeCategoryName(product.category)}
            </span>
          </span>
        </Link>
      </td>
      <td className="min-w-[9rem]">
        <label className="sr-only" htmlFor={`category-${product.id}`}>
          Category for {product.title}
        </label>
        <select
          id={`category-${product.id}`}
          value={normalizeCategoryName(product.category)}
          onChange={(e) => onCategoryChange(product.id, e.target.value)}
          className="cf-input w-full max-w-[12rem] py-1.5 text-[12px]"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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
          onDeleted={onDeleted}
        />
      </td>
    </tr>
  );
}

export function ProductsList({
  initialProducts,
  catalogCategories,
  currency,
  canDelete,
  productsUnlocked,
}: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState<ProductSort>(DEFAULT_PRODUCT_SORT);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkMoving, setBulkMoving] = useState(false);
  const initialSignature = useMemo(() => productSignature(initialProducts), [initialProducts]);

  const selectedCount = selectedIds.size;

  const categoryOrder = useMemo(
    () => buildCategoryOrder(catalogCategories, products),
    [catalogCategories, products],
  );

  const categoryOptions = useMemo(() => {
    const options = [...categoryOrder];
    if (!options.includes("General")) options.push("General");
    return options;
  }, [categoryOrder]);

  const categoryFilters = useMemo(
    () => [
      { value: "", label: "All catalogs" },
      ...categoryOrder.map((category) => ({ value: category, label: category })),
    ],
    [categoryOrder],
  );

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { products: ProductListRow[] };
      setProducts(normalizeProductsForList(data.products) as ProductListRow[]);
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
      if (categoryFilter && normalizeCategoryName(product.category) !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        product.title.toLowerCase().includes(q) ||
        normalizeCategoryName(product.category).toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter, categoryFilter]);

  const displayed = useMemo(
    () => sortProducts(filtered, sort, categoryOrder),
    [filtered, sort, categoryOrder],
  );

  const catalogView = isCatalogViewSort(sort);
  const grouped = useMemo(
    () => (catalogView ? groupProductsByCatalog(displayed, categoryOrder) : []),
    [catalogView, displayed, categoryOrder],
  );

  const displayedIds = useMemo(() => displayed.map((product) => product.id), [displayed]);
  const allDisplayedSelected =
    displayedIds.length > 0 && displayedIds.every((id) => selectedIds.has(id));
  const someDisplayedSelected = displayedIds.some((id) => selectedIds.has(id));

  useEffect(() => {
    if (!bulkCategory && categoryOptions.length > 0) {
      setBulkCategory(categoryOptions[0]);
    }
  }, [bulkCategory, categoryOptions]);

  function toggleSelect(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleSelectAllDisplayed() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allDisplayedSelected) {
        for (const id of displayedIds) next.delete(id);
      } else {
        for (const id of displayedIds) next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleProductDeleted(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setSelectedIds((current) => {
      if (!current.has(productId)) return current;
      const next = new Set(current);
      next.delete(productId);
      return next;
    });
  }

  function handleHeaderSort(field: ProductSortField) {
    setSort((current) => toggleSortField(current, field));
  }

  function handlePresetChange(presetId: string) {
    const preset = PRODUCT_SORT_PRESETS.find((item) => item.id === presetId);
    if (preset) setSort(preset.sort);
  }

  function updateProductInList(next: ProductListRow) {
    setProducts((current) =>
      current.map((product) => (product.id === next.id ? { ...product, ...next } : product)),
    );
  }

  async function handleCategoryChange(productId: string, category: string) {
    const previous = products.find((product) => product.id === productId);
    if (!previous || normalizeCategoryName(previous.category) === category) return;

    updateProductInList({ ...previous, category });

    try {
      const res = await fetch(`/api/products/${productId}/catalog`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();

      if (!res.ok) {
        updateProductInList(previous);
        toast.error(data.error || "Could not move product");
        return;
      }

      if (data.product) {
        updateProductInList(data.product);
      } else {
        await refetch();
      }
      notifyProductsChanged();
      toast.success(`Moved to ${category}`);
    } catch {
      updateProductInList(previous);
      toast.error("Something went wrong");
    }
  }

  async function handleBulkMove() {
    const ids = [...selectedIds];
    const category = normalizeCategoryName(bulkCategory);
    if (ids.length === 0 || !category) return;

    const previous = products;
    setBulkMoving(true);
    setProducts((current) =>
      current.map((product) =>
        selectedIds.has(product.id) ? { ...product, category } : product,
      ),
    );

    try {
      const res = await fetch("/api/products/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: ids, category }),
      });
      const data = await res.json();

      if (!res.ok) {
        setProducts(previous);
        toast.error(data.error || "Could not move products");
        return;
      }

      if (Array.isArray(data.products)) {
        setProducts(normalizeProductsForList(data.products) as ProductListRow[]);
      } else {
        await refetch();
      }

      clearSelection();
      notifyProductsChanged();
      notifyCatalogChanged();
      toast.success(
        data.moved > 0
          ? `Moved ${data.moved} product${data.moved === 1 ? "" : "s"} to ${category}`
          : `Already in ${category}`,
      );
    } catch {
      setProducts(previous);
      toast.error("Something went wrong");
    } finally {
      setBulkMoving(false);
    }
  }

  async function handleReorder(productId: string, direction: "up" | "down") {
    setReorderingId(productId);
    try {
      const res = await fetch(`/api/products/${productId}/catalog`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not reorder product");
        return;
      }

      await refetch();
      notifyProductsChanged();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setReorderingId(null);
    }
  }

  function renderRows(rows: ProductListRow[]) {
    return rows.map((product, index) => (
      <ProductRow
        key={product.id}
        product={product}
        currency={currency}
        canDelete={canDelete}
        categoryOptions={categoryOptions}
        showReorder={catalogView}
        canMoveUp={index > 0}
        canMoveDown={index < rows.length - 1}
        reordering={reorderingId === product.id}
        selected={selectedIds.has(product.id)}
        onToggleSelect={toggleSelect}
        onCategoryChange={handleCategoryChange}
        onReorder={handleReorder}
        onDeleted={handleProductDeleted}
      />
    ));
  }

  const tableHead = (
    <thead>
      <tr>
        <th scope="col" className="w-10">
          <input
            type="checkbox"
            checked={allDisplayedSelected}
            ref={(input) => {
              if (input) input.indeterminate = someDisplayedSelected && !allDisplayedSelected;
            }}
            onChange={toggleSelectAllDisplayed}
            aria-label="Select all products in view"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </th>
        {catalogView ? (
          <th scope="col" className="w-10 text-[#86868b]">
            <span className="sr-only">Reorder</span>
          </th>
        ) : null}
        <SortableHeader label="Product" field="title" sort={sort} onSort={handleHeaderSort} />
        <SortableHeader
          label="Category"
          field="category"
          sort={sort}
          onSort={handleHeaderSort}
        />
        <SortableHeader label="Price" field="price" sort={sort} onSort={handleHeaderSort} />
        <SortableHeader label="Stock" field="stock" sort={sort} onSort={handleHeaderSort} />
        <th scope="col" className="hidden text-[#86868b] md:table-cell">
          Variants
        </th>
        <SortableHeader label="Status" field="status" sort={sort} onSort={handleHeaderSort} />
        <th scope="col" className="text-right text-[#86868b]">
          Actions
        </th>
      </tr>
    </thead>
  );

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

      <fieldset className="mb-5">
        <legend className="sr-only">Filter products by catalog category</legend>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((filter) => {
            const active = categoryFilter === filter.value;
            return (
              <button
                key={filter.label}
                type="button"
                aria-pressed={active}
                onClick={() => setCategoryFilter(filter.value)}
                className={`cf-pill px-3.5 py-1.5 text-[12px] ${
                  active ? "cf-pill-active" : "text-[var(--cf-gray-600)]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {selectedCount > 0 ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-emerald-900">
            {selectedCount} product{selectedCount === 1 ? "" : "s"} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="bulk-category" className="sr-only">
              Move selected to category
            </label>
            <select
              id="bulk-category"
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="cf-input min-w-[10rem] py-2 text-[13px]"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={bulkMoving || !bulkCategory}
              onClick={() => void handleBulkMove()}
              className="btn-primary px-4 py-2 text-[13px] disabled:opacity-60"
            >
              {bulkMoving ? "Moving…" : "Move to category"}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {catalogView ? (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.category} className="cf-table-shell overflow-x-auto">
              <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
                <FolderOpen className="h-4 w-4 text-[#86868b]" aria-hidden />
                <h3 className="text-sm font-semibold text-[#1d1d1f]">{group.category}</h3>
                <span className="text-[12px] text-[#86868b]">
                  {group.products.length} product{group.products.length === 1 ? "" : "s"}
                </span>
              </div>
              <table className="min-w-[720px]">
                <caption className="sr-only">{group.category} products</caption>
                {tableHead}
                <tbody>{renderRows(group.products)}</tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="cf-table-shell overflow-x-auto">
          <table className="min-w-[720px]">
            <caption className="sr-only">Store products</caption>
            {tableHead}
            <tbody>{renderRows(displayed)}</tbody>
          </table>
        </div>
      )}

      {displayed.length === 0 ? (
        <p className="cf-table-empty mt-4 rounded-[var(--cf-radius-lg)] border border-black/[0.06] bg-white">
          No products match your search or filters.
        </p>
      ) : null}

      <p className="mt-4 text-[12px] text-[#86868b]">
        {catalogView
          ? "Select products to move in bulk, use category dropdowns for one-offs, or drag order with arrows."
          : "Select products and use Move to category for fast bulk updates, or change category per row."}
      </p>
    </section>
  );
}