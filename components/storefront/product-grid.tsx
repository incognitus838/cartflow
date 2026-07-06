import { Package } from "lucide-react";
import { ProductCard, type StorefrontProductCard } from "@/components/storefront/product-card";

type ProductGridProps = {
  storeSlug: string;
  currency: string;
  products: StorefrontProductCard[];
};

export function ProductGrid({ storeSlug, currency, products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <Package className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">No products yet</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          This store is setting up. Check back soon or message the seller on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          storeSlug={storeSlug}
          currency={currency}
          product={product}
        />
      ))}
    </div>
  );
}