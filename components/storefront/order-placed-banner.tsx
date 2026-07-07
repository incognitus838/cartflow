"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

type OrderPlacedBannerProps = {
  orderNumber: string;
  storeName: string;
};

export function OrderPlacedBanner({ orderNumber, storeName }: OrderPlacedBannerProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get("placed") !== "1") return;

    setVisible(true);
    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success("Order ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the ID manually");
    }
  }

  if (!visible) return null;

  return (
    <section className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center shadow-sm sm:p-7">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-emerald-950">Order placed!</h1>
      <p className="mt-2 text-sm text-emerald-900">
        {storeName} received your order. Save your order ID below to track progress later.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <code className="rounded-xl bg-white px-4 py-3 font-mono text-lg font-bold tracking-tight text-[var(--store-text)] shadow-sm ring-1 ring-emerald-200">
          {orderNumber}
        </code>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy order ID
            </>
          )}
        </button>
      </div>
    </section>
  );
}