import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { trackOrderPath } from "@/lib/storefront/paths";

type StoreFooterProps = {
  storeName: string;
  storeSlug: string;
  currency: string;
  deliveryFee: number;
};

export function StoreFooter({ storeName, storeSlug, currency, deliveryFee }: StoreFooterProps) {
  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-white px-4 pt-10 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[13px] text-[#86868b]">
          {deliveryFee > 0
            ? `Delivery from ${formatCurrency(deliveryFee, currency)}`
            : "Complimentary delivery available"}
        </p>
        <p className="mt-2 text-[13px] text-[#86868b]">
          <Link
            href={trackOrderPath(storeSlug)}
            className="font-medium text-[#1d1d1f] underline-offset-2 transition-opacity hover:opacity-70 hover:underline"
          >
            Track your order
          </Link>
        </p>
        <p className="mt-3 text-[12px] text-[#86868b]">
          Powered by{" "}
          <a
            href="/"
            className="font-medium text-[#1d1d1f] underline-offset-2 transition-opacity hover:opacity-70 hover:underline"
          >
            CartFlow
          </a>
          {" · "}
          {storeName}
        </p>
      </div>
    </footer>
  );
}