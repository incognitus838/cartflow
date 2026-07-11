"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

type OrderIdCopyButtonProps = {
  orderNumber: string;
};

export function OrderIdCopyButton({ orderNumber }: OrderIdCopyButtonProps) {
  const [copied, setCopied] = useState(false);

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

  return (
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
  );
}