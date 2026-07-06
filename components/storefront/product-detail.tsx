"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/storefront/cart-provider";
import {
  ProductMediaGallery,
  type GalleryMedia,
} from "@/components/storefront/product-media-gallery";
import { toNumber } from "@/lib/decimal";
import { isOutOfStock } from "@/lib/inventory-stock";
import type { ProductMediaType } from "@/lib/media";
import { storePath } from "@/lib/storefront/paths";
import { formatCurrency } from "@/lib/utils";

export type StorefrontProductDetail = {
  id: string;
  title: string;
  description: string | null;
  price: { toString(): string } | number;
  compareAtPrice: { toString(): string } | number | null;
  stock: number;
  images: Array<{ url: string; alt: string | null; mediaType?: ProductMediaType | string }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    price: { toString(): string } | number | null;
    stock: number;
  }>;
};

type ProductDetailProps = {
  storeSlug: string;
  currency: string;
  deliveryFee: number;
  product: StorefrontProductDetail;
};

export function ProductDetail({
  storeSlug,
  currency,
  deliveryFee,
  product,
}: ProductDetailProps) {
  const { addItem } = useCart();
  const hasVariants = product.variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;

  const unitPrice = useMemo(() => {
    if (selectedVariant?.price != null) return toNumber(selectedVariant.price);
    return toNumber(product.price);
  }, [product.price, selectedVariant]);

  const compareAt = product.compareAtPrice ? toNumber(product.compareAtPrice) : null;

  const availableStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;

  const soldOut = hasVariants
    ? product.variants.every((v) => v.stock <= 0)
    : isOutOfStock(product);

  const canAdd = !soldOut && availableStock > 0;

  const galleryMedia: GalleryMedia[] = product.images.map((image) => ({
    url: image.url,
    alt: image.alt,
    mediaType: (image.mediaType as ProductMediaType) || "IMAGE",
  }));

  function handleAddToCart() {
    if (!canAdd) return;

    if (hasVariants && !selectedVariant) {
      toast.error("Choose an option first");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      title: product.title,
      variantName: selectedVariant?.name,
      sku: selectedVariant?.sku ?? undefined,
      imageUrl: product.images[0]?.url,
      unitPrice,
      quantity,
      maxStock: availableStock,
    });

    toast.success("Added to bag");
  }

  return (
    <div className="pb-28 sm:pb-10">
      <div className="mb-6">
        <Link
          href={storePath(storeSlug)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to collection
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductMediaGallery media={galleryMedia} title={product.title} priority />

        <div>
          <h1 className="cf-heading text-[28px] sm:text-[36px]">{product.title}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-[24px] font-semibold tabular-nums tracking-tight text-[#1d1d1f] sm:text-[28px]">
              {formatCurrency(unitPrice, currency)}
            </span>
            {compareAt && compareAt > unitPrice ? (
              <span className="text-[15px] tabular-nums text-[#86868b] line-through">
                {formatCurrency(compareAt, currency)}
              </span>
            ) : null}
          </div>

          {product.description ? (
            <p className="cf-subtext mt-5 text-[15px] leading-relaxed sm:text-[16px]">
              {product.description}
            </p>
          ) : null}

          {hasVariants ? (
            <div className="mt-8">
              <p className="text-[13px] font-medium uppercase tracking-wider text-[#86868b]">
                Select option
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const variantSoldOut = variant.stock <= 0;
                  const selected = variant.id === selectedVariantId;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={variantSoldOut}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      className={`cf-pill px-4 py-2.5 text-[13px] ${
                        selected
                          ? "cf-pill-active"
                          : variantSoldOut
                            ? "cursor-not-allowed opacity-40 line-through"
                            : "text-[#1d1d1f]"
                      }`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <p className="text-[13px] font-medium uppercase tracking-wider text-[#86868b]">
              Quantity
            </p>
            <div className="mt-3 inline-flex items-center rounded-full border border-black/[0.08] bg-white p-1">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:opacity-35"
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="min-w-10 text-center text-[15px] font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= availableStock}
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:opacity-35"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            {!soldOut ? (
              <p className="mt-2 text-[13px] text-[#86868b]">{availableStock} in stock</p>
            ) : (
              <p className="mt-2 text-[13px] font-medium text-[#dc2626]">Out of stock</p>
            )}
          </div>

          {deliveryFee > 0 ? (
            <p className="mt-5 text-[14px] text-[#86868b]">
              Delivery from {formatCurrency(deliveryFee, currency)}
            </p>
          ) : null}

          <div className="mt-8 hidden sm:block">
            {canAdd ? (
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3.5 text-[15px]"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
                Add to bag
              </button>
            ) : (
              <p className="rounded-[14px] border border-black/[0.06] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#6e6e73]">
                This item is currently unavailable.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/90 p-4 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#1d1d1f]">{product.title}</p>
            <p className="text-[17px] font-semibold tabular-nums text-[#1d1d1f]">
              {formatCurrency(unitPrice * quantity, currency)}
            </p>
          </div>
          {canAdd ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-primary inline-flex shrink-0 items-center gap-2 px-5 py-3 text-[14px]"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
              Add
            </button>
          ) : (
            <span className="shrink-0 rounded-full bg-[#f5f5f7] px-4 py-3 text-[13px] font-medium text-[#86868b]">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}