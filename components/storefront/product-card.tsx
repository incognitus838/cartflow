"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Package } from "lucide-react";
import { LazyImage } from "@/components/storefront/lazy-image";
import { QuickAddButton, type QuickAddProduct } from "@/components/storefront/quick-add-button";
import { useCart } from "@/components/storefront/cart-provider";
import { isOutOfStock } from "@/lib/inventory-stock";
import { productPath } from "@/lib/storefront/paths";
import { toNumber } from "@/lib/decimal";
import { cn, formatCurrency } from "@/lib/utils";

export type StorefrontProductCard = QuickAddProduct & {
  compareAtPrice: { toString(): string } | number | null;
  category?: string | null;
};

type ProductCardProps = {
  storeSlug: string;
  currency: string;
  product: StorefrontProductCard;
  layout?: "grid" | "list";
  previewMode?: boolean;
};

export function ProductCard({
  storeSlug,
  currency,
  product,
  layout = "grid",
  previewMode = false,
}: ProductCardProps) {
  const { lines } = useCart();
  const image = product.images[0];
  const price = toNumber(product.price);
  const compareAt = product.compareAtPrice ? toNumber(product.compareAtPrice) : null;
  const soldOut = isOutOfStock(product);

  const inBag = useMemo(
    () =>
      previewMode
        ? 0
        : lines
            .filter((line) => line.productId === product.id)
            .reduce((sum, line) => sum + line.quantity, 0),
    [lines, product.id, previewMode],
  );

  if (layout === "list") {
    const listBody = (
      <>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f5f7]">
          {image ? (
            <LazyImage
              src={image.url}
              alt={image.alt || product.title}
              fill={false}
              width={80}
              height={80}
              sizes="80px"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--store-muted)]">
              <Package className="h-5 w-5" strokeWidth={1.25} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[14px] font-medium text-[var(--store-text)]">
            {product.title}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[14px] font-semibold tabular-nums text-[var(--store-text)]">
              {formatCurrency(price, currency)}
            </span>
            {compareAt && compareAt > price ? (
              <span className="text-[12px] text-[var(--store-muted)] line-through">
                {formatCurrency(compareAt, currency)}
              </span>
            ) : null}
          </div>
        </div>
      </>
    );

    return (
      <div
        className={cn(
          "group relative flex overflow-hidden rounded-[14px] border bg-[var(--store-surface)] transition-all",
          inBag > 0 ? "border-[var(--store-accent)]/30" : "border-[var(--store-border)]",
        )}
      >
        {previewMode ? (
          <div className="flex min-w-0 flex-1 gap-4 p-3">{listBody}</div>
        ) : (
          <Link href={productPath(storeSlug, product.id)} className="flex min-w-0 flex-1 gap-4 p-3">
            {listBody}
          </Link>
        )}
        {!previewMode && !soldOut ? (
          <div className="flex items-center pr-3">
            <QuickAddButton product={product} />
          </div>
        ) : null}
      </div>
    );
  }

  const gridBody = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f5f7]">
        {image ? (
          <LazyImage
            src={image.url}
            alt={image.alt || product.title}
            sizes="(max-width: 640px) 45vw, 220px"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#86868b]">
            <Package className="h-8 w-8" strokeWidth={1.25} />
          </div>
        )}
        {product.category ? (
          <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full border border-black/[0.06] bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6e6e73] backdrop-blur-sm">
            {product.category}
          </span>
        ) : null}
        {soldOut ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#1d1d1f]/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[14px] font-medium leading-snug tracking-tight text-[var(--store-text)]">
          {product.title}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[14px] font-semibold tabular-nums text-[var(--store-text)]">
            {formatCurrency(price, currency)}
          </span>
          {compareAt && compareAt > price ? (
            <span className="text-[12px] tabular-nums text-[var(--store-muted)] line-through">
              {formatCurrency(compareAt, currency)}
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[18px] border bg-[var(--store-surface)] transition-all duration-500",
        inBag > 0
          ? "border-[var(--store-accent)]/25 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          : "border-[var(--store-border)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        !previewMode && "hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]",
      )}
    >
      {previewMode ? (
        <div className="flex flex-1 flex-col">{gridBody}</div>
      ) : (
        <Link href={productPath(storeSlug, product.id)} className="flex flex-1 flex-col">
          {gridBody}
        </Link>
      )}

      {!previewMode && !soldOut ? (
        <div className="absolute bottom-4 right-4 z-10">
          <QuickAddButton product={product} />
        </div>
      ) : null}
    </div>
  );
}