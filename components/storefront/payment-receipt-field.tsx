"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { FileText, ImageIcon } from "lucide-react";
import { RECEIPT_MAX_LABEL } from "@/lib/uploads/receipt";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";
const MAX_SIZE_BYTES = 100 * 1024;

type PaymentReceiptFieldProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
};

export function PaymentReceiptField({ file, onFileChange, required = true }: PaymentReceiptFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(selected: File | null) {
    if (!selected) return;

    const allowed =
      selected.type.startsWith("image/") || selected.type === "application/pdf";
    if (!allowed) {
      setError("Upload a JPG, PNG, WebP, GIF screenshot, or PDF receipt.");
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setError(`Receipt must be under ${RECEIPT_MAX_LABEL}.`);
      onFileChange(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    onFileChange(selected);

    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        required={required}
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--cf-gray-200)] bg-[var(--cf-bg)] px-4 py-8 transition-colors hover:border-[var(--cf-gold)] hover:bg-white"
      >
        {preview ? (
          <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg">
            <Image src={preview} alt="Receipt preview" fill className="object-contain" unoptimized />
          </div>
        ) : file?.type === "application/pdf" ? (
          <>
            <FileText className="h-8 w-8 text-[var(--cf-gray-600)]" />
            <span className="text-sm font-medium text-[var(--cf-black)]">{file.name}</span>
            <span className="text-xs text-[var(--cf-gray-400)]">PDF ready to submit</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-[var(--cf-gray-400)]" />
            <span className="text-sm font-medium text-[var(--cf-gray-600)]">
              Tap to upload payment proof
            </span>
            <span className="text-xs text-[var(--cf-gray-400)]">
              Screenshot (JPG, PNG) or PDF · max 100 KB
            </span>
          </>
        )}
      </button>

      {file ? (
        <button
          type="button"
          onClick={() => {
            onFileChange(null);
            setPreview(null);
            setError(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-2 text-center text-xs font-medium text-[var(--cf-gray-600)] hover:text-[var(--cf-black)]"
        >
          Choose a different file
        </button>
      ) : null}

      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-[#c41e1e]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}