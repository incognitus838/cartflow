"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/storefront/cart-provider";
import { cartLineKey } from "@/lib/cart/types";
import { toNumber } from "@/lib/decimal";
import { isOutOfStock } from "@/lib/inventory-stock";
import { cn } from "@/lib/utils";

export type QuickAddProduct = {
  id: string;
  title: string;
  price: { toString(): string } | number;
  stock: number;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string | null;
    price: { toString(): string } | number | null;
    stock: number;
  }>;
};

type QuickAddButtonProps = {
  product: QuickAddProduct;
  className?: string;
  /** Inline row under product title (mobile cards). Default floating pill. */
  layout?: "floating" | "inline";
};

export function QuickAddButton({
  product,
  className,
  layout = "floating",
}: QuickAddButtonProps) {
  const inline = layout === "inline";
  const { lines, addItem, updateQuantity, removeItem } = useCart();
  const [pickingVariant, setPickingVariant] = useState(false);
  const [pulse, setPulse] = useState(false);

  const soldOut = isOutOfStock(product);
  const hasVariants = product.variants.length > 0;
  const imageUrl = product.images[0]?.url;
  const basePrice = toNumber(product.price);

  const productLines = useMemo(
    () => lines.filter((line) => line.productId === product.id),
    [lines, product.id],
  );

  const totalInCart = productLines.reduce((sum, line) => sum + line.quantity, 0);
  const singleLine = productLines.length === 1 ? productLines[0] : null;

  function flashAdded() {
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  }

  function handleAdd(variant?: QuickAddProduct["variants"][number]) {
    const unitPrice =
      variant?.price != null ? toNumber(variant.price) : basePrice;
    const maxStock = variant ? variant.stock : product.stock;

    if (maxStock <= 0) {
      toast.error("Out of stock");
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant?.id,
      title: product.title,
      variantName: variant?.name,
      sku: variant?.sku ?? undefined,
      imageUrl,
      unitPrice,
      quantity: 1,
      maxStock,
    });

    setPickingVariant(false);
    flashAdded();
  }

  function handleIncrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants && !singleLine) {
      setPickingVariant(true);
      return;
    }

    if (singleLine) {
      if (singleLine.quantity >= singleLine.maxStock) {
        toast.error("Max stock reached");
        return;
      }
      updateQuantity(singleLine.key, singleLine.quantity + 1);
      flashAdded();
      return;
    }

    handleAdd();
  }

  function handleDecrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!singleLine) {
      if (productLines.length > 1) {
        toast.message("Several options in bag — open bag to adjust");
      }
      return;
    }

    if (singleLine.quantity <= 1) {
      removeItem(singleLine.key);
    } else {
      updateQuantity(singleLine.key, singleLine.quantity - 1);
    }
  }

  if (soldOut) {
    return (
      <span
        className={cn(
          "rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#86868b]",
          className,
        )}
      >
        Sold out
      </span>
    );
  }

  if (pickingVariant) {
    return (
      <div
        className={cn(
          "flex flex-col gap-1 rounded-[14px] border border-black/[0.08] bg-white p-2",
          inline
            ? "w-full shadow-none"
            : "shadow-[0_12px_40px_rgba(0,0,0,0.12)]",
          className,
        )}
        onClick={(e) => e.preventDefault()}
      >
        <p className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#86868b]">
          Select option
        </p>
        {product.variants
          .filter((v) => v.stock > 0)
          .map((variant) => {
            const key = cartLineKey(product.id, variant.id);
            const inCart = lines.find((l) => l.key === key);
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => handleAdd(variant)}
                className="flex items-center justify-between rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                <span>{variant.name}</span>
                {inCart ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-semibold text-white">
                    {inCart.quantity}
                  </span>
                ) : null}
              </button>
            );
          })}
        <button
          type="button"
          onClick={() => setPickingVariant(false)}
          className="py-1 text-[11px] text-[#86868b] hover:text-[#1d1d1f]"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (totalInCart > 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-0.5 border border-black/[0.08] bg-[#f5f5f7]/80 p-1",
          inline
            ? "w-full justify-between rounded-[12px] shadow-none"
            : "rounded-full bg-white/95 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm",
          pulse && "cf-pulse-added",
          className,
        )}
        onClick={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onClick={handleDecrement}
          className={cn(
            "flex items-center justify-center rounded-full text-[#1d1d1f] transition-colors hover:bg-white",
            inline ? "h-10 w-10" : "h-9 w-9 hover:bg-[#f5f5f7]",
          )}
          aria-label={`Remove one ${product.title}`}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-[#1d1d1f] text-[14px] font-semibold tabular-nums text-white transition-transform duration-300",
            inline ? "h-10 min-w-10 px-3" : "h-10 w-10",
            pulse && "scale-110",
          )}
          aria-label={`${totalInCart} in bag`}
        >
          {totalInCart}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          className={cn(
            "flex items-center justify-center rounded-full bg-[#1d1d1f] text-white transition-transform hover:scale-105 active:scale-95",
            inline ? "h-10 w-10" : "h-9 w-9",
          )}
          aria-label={`Add another ${product.title}`}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasVariants) {
          setPickingVariant(true);
          return;
        }
        handleAdd();
      }}
      className={cn(
        "flex items-center justify-center bg-[#1d1d1f] text-white transition-all duration-300 active:scale-[0.98]",
        inline
          ? "h-10 w-full gap-2 rounded-[12px] text-[13px] font-medium shadow-none hover:bg-[#333]"
          : "h-11 w-11 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
        pulse && !inline && "ring-2 ring-[#b8956a]/40 ring-offset-2",
        pulse && inline && "bg-[#333]",
        className,
      )}
      aria-label={`Add ${product.title} to bag`}
    >
      <Plus className={cn(inline ? "h-4 w-4" : "h-5 w-5")} strokeWidth={2} />
      {inline ? <span>Add to bag</span> : null}
    </button>
  );
}