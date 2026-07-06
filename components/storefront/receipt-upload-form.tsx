"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { PaymentReceiptField } from "@/components/storefront/payment-receipt-field";

type ReceiptUploadFormProps = {
  storeSlug: string;
  orderNumber: string;
};

/** Legacy fallback — new orders require receipt at checkout. */
export function ReceiptUploadForm({ storeSlug, orderNumber }: ReceiptUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!file) {
      toast.error("Choose a payment receipt first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch(
        `/api/storefront/${storeSlug}/orders/${orderNumber}/receipt`,
        { method: "POST", body: formData },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Could not upload receipt.");
        return;
      }

      toast.success("Receipt submitted — awaiting seller approval.");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--cf-border-strong)] bg-white p-5 sm:p-6"
    >
      <h2 className="text-sm font-semibold text-[var(--cf-black)]">Upload payment receipt</h2>
      <p className="mt-1 text-xs text-[var(--cf-gray-600)]">
        This order is missing payment proof. Upload a screenshot or PDF to complete it.
      </p>

      <div className="mt-4">
        <PaymentReceiptField file={file} onFileChange={setFile} />
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="btn-primary mt-4 inline-flex w-full items-center justify-center gap-2 py-3"
      >
        <Upload className="h-4 w-4" />
        {loading ? "Uploading…" : "Submit receipt"}
      </button>
    </form>
  );
}