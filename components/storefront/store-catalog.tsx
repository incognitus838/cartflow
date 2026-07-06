"use client";

import { useMemo, useState } from "react";
import type { CatalogLayout } from "@prisma/client";
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { ProductCard, type StorefrontProductCard } from "@/components/storefront/product-card";
import { toNumber } from "@/lib/decimal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

type StoreCatalogProps = {
  storeSlug: string;
  storeName: string;
  description: string | null;
  welcomeMessage?: string | null;
  catalogLayout?: CatalogLayout;
  currency: string;
  products: StorefrontProductCard[];
  catalogTotalCount?: number;
  previewMode?: boolean;
};

export function StoreCatalog({
  storeSlug,
  storeName,
  description,
  welcomeMessage,
  catalogLayout = "GRID",
  currency,
  products,
  catalogTotalCount,
  previewMode = false,
}: StoreCatalogProps) {
  const catalogSize = catalogTotalCount ?? products.length;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const cat = product.category || "General";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products;

    if (category !== "All") {
      list = list.filter((p) => (p.category || "General") === category);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q),
      );
    }

    const sorted = [...list];
    if (sort === "price-asc") {
      sorted.sort((a, b) => toNumber(a.price) - toNumber(b.price));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => toNumber(b.price) - toNumber(a.price));
    } else if (sort === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [category, products, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  if (products.length === 0) {
    return (
      <div className="cf-card flex flex-col items-center px-6 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-black/[0.06] bg-[#fbfbfd] text-[#86868b]">
          <Package className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h2 className="cf-heading mt-5 text-[21px]">No products yet</h2>
        <p className="cf-subtext mt-2 max-w-sm text-[14px]">
          This store is setting up. Check back soon or message the seller on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", previewMode ? "pb-6" : "pb-20 sm:pb-24")}>
      {welcomeMessage ? (
        <div
          className="rounded-[var(--cf-radius-lg)] border px-4 py-3 text-[13px] leading-relaxed"
          style={{
            borderColor: "var(--store-border)",
            backgroundColor: "var(--store-surface)",
            color: "var(--store-text)",
          }}
        >
          {welcomeMessage}
        </div>
      ) : null}

      <section className="border-b border-[var(--store-border)] pb-10">
        <p
          className="text-[12px] font-medium uppercase tracking-[0.12em]"
          style={{ color: "var(--store-accent)" }}
        >
          {catalogSize} pieces · {categories.length} collections
        </p>
        <h1 className="cf-heading mt-3 text-[32px] text-[var(--store-text)] sm:text-[48px]">
          {storeName}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-[var(--store-muted)] sm:text-[17px]">
          {description ??
            "Curated with care. Browse, add to your bag, and checkout — effortlessly."}
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Search collection"
            className="cf-input rounded-full py-3 pl-11 pr-4"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as typeof sort);
            resetPage();
          }}
          className="cf-input w-full rounded-full py-3 sm:w-auto"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        <CategoryPill
          active={category === "All"}
          label="All"
          count={catalogSize}
          onClick={() => {
            setCategory("All");
            resetPage();
          }}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.label}
            active={category === cat.label}
            label={cat.label}
            count={cat.count}
            onClick={() => {
              setCategory(cat.label);
              resetPage();
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[13px] text-[#86868b]">
        <span>
          {pageItems.length} of {filtered.length}
          {category !== "All" ? ` · ${category}` : ""}
        </span>
        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              resetPage();
            }}
            className="font-medium text-[#1d1d1f] transition-opacity hover:opacity-70"
          >
            Clear
          </button>
        ) : null}
      </div>

      {pageItems.length === 0 ? (
        <div className="cf-card px-6 py-20 text-center">
          <p className="font-medium text-[#1d1d1f]">No matches</p>
          <p className="mt-1 text-[14px] text-[#86868b]">Try a different search or collection.</p>
        </div>
      ) : catalogLayout === "LIST" ? (
        <div className="space-y-3">
          {pageItems.map((product) => (
            <ProductCard
              key={product.id}
              storeSlug={storeSlug}
              currency={currency}
              product={product}
              layout="list"
              previewMode={previewMode}
            />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 sm:gap-5 lg:gap-6",
            previewMode
              ? "grid-cols-2"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {pageItems.map((product) => (
            <ProductCard
              key={product.id}
              storeSlug={storeSlug}
              currency={currency}
              product={product}
              previewMode={previewMode}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="cf-pill px-5 py-2.5 text-[13px] text-[#1d1d1f] disabled:opacity-35"
          >
            <ChevronLeft className="mr-1 inline h-4 w-4" />
            Previous
          </button>
          <span className="text-[13px] tabular-nums text-[#86868b]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="cf-pill px-5 py-2.5 text-[13px] text-[#1d1d1f] disabled:opacity-35"
          >
            Next
            <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CategoryPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cf-pill shrink-0 px-4 py-2 text-[13px]",
        active && "cf-pill-active",
        !active && "text-[#6e6e73] hover:text-[#1d1d1f]",
      )}
    >
      {label}
      <span className={cn("ml-1.5 tabular-nums", active ? "text-white/60" : "text-[#86868b]")}>
        {count}
      </span>
    </button>
  );
}