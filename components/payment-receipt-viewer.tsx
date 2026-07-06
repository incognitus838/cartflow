import Image from "next/image";
import { FileText } from "lucide-react";

type PaymentReceiptViewerProps = {
  src: string;
  mimeType?: string | null;
  filename?: string | null;
  className?: string;
};

export function PaymentReceiptViewer({
  src,
  mimeType,
  filename,
  className = "",
}: PaymentReceiptViewerProps) {
  const isPdf = mimeType === "application/pdf";

  if (isPdf) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-slate-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {filename ?? "Payment receipt.pdf"}
            </p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Open PDF receipt
            </a>
          </div>
        </div>
        <iframe
          src={src}
          title="Payment receipt"
          className="mt-4 h-80 w-full rounded-lg border border-slate-200 bg-white"
        />
      </div>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative block aspect-[4/3] max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}
    >
      <Image src={src} alt="Payment receipt" fill className="object-contain" unoptimized />
    </a>
  );
}