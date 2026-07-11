"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";
import { LOGO_MAX_BYTES, LOGO_MAX_LABEL } from "@/lib/uploads/logo";

export type LogoUploadValue = {
  previewUrl: string;
  base64: string;
  mimeType: string;
  filename: string;
};

type LogoUploadFieldProps = {
  id?: string;
  value: LogoUploadValue | null;
  onChange: (value: LogoUploadValue | null) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function LogoUploadField({
  id = "logo-upload",
  value,
  onChange,
  onError,
  disabled,
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Logo must be JPG, PNG, or WebP.");
    }
    if (file.size > LOGO_MAX_BYTES) {
      throw new Error(`Logo must be under ${LOGO_MAX_LABEL}.`);
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const previewUrl = `data:${file.type};base64,${base64}`;

    onChange({
      previewUrl,
      base64,
      mimeType: file.type,
      filename: file.name,
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={async (e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = "";
          if (!file) return;
          try {
            await handleFile(file);
          } catch (error) {
            onChange(null);
            onError?.(error instanceof Error ? error.message : "Could not upload logo.");
          }
        }}
      />

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <img
            src={value.previewUrl}
            alt="Logo preview"
            className="h-16 w-16 shrink-0 rounded-xl border border-white object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{value.filename}</p>
            <p className="text-xs text-slate-500">Under {LOGO_MAX_LABEL} · JPG, PNG, or WebP</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-600"
            aria-label="Remove logo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50/30"
        >
          <ImagePlus className="h-8 w-8 text-slate-400" aria-hidden />
          <span className="text-sm font-medium text-slate-700">Upload store logo</span>
          <span className="text-xs text-slate-500">JPG, PNG, or WebP · max {LOGO_MAX_LABEL}</span>
        </button>
      )}

      {!value ? (
        <p className="text-xs text-slate-500">Optional — shown on your storefront header.</p>
      ) : null}
    </div>
  );
}