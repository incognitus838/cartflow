"use client";

import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  detectMediaType,
  MAX_PRODUCT_MEDIA,
  type ProductMediaType,
} from "@/lib/media";
import { cn } from "@/lib/utils";

export type MediaRow = {
  url: string;
  mediaType: ProductMediaType;
  alt?: string;
  previewUrl?: string;
  uploading?: boolean;
  error?: string;
};

type MediaGalleryProps = {
  rows: MediaRow[];
  onChange: (rows: MediaRow[]) => void;
};

export function MediaGallery({ rows, onChange }: MediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File, index: number) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/products/media", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    const current = rowsRef.current;
    onChange(
      current.map((row, i) =>
        i === index
          ? {
              url: data.url,
              mediaType: data.mediaType || detectMediaType(data.url),
              previewUrl: data.url,
              uploading: false,
              error: undefined,
            }
          : row,
      ),
    );
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const current = rowsRef.current;
    const available = MAX_PRODUCT_MEDIA - current.filter((row) => row.url || row.uploading).length;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_PRODUCT_MEDIA} media items per product.`);
      return;
    }

    const batch = list.slice(0, available);
    const placeholders: MediaRow[] = batch.map((file) => ({
      url: "",
      previewUrl: URL.createObjectURL(file),
      mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      uploading: true,
    }));

    const startIndex = current.length;
    onChange([...current, ...placeholders]);

    await Promise.all(
      batch.map(async (file, offset) => {
        const index = startIndex + offset;
        try {
          await uploadFile(file, index);
        } catch (error) {
          const latest = rowsRef.current;
          onChange(
            latest.map((row, i) =>
              i === index
                ? {
                    ...row,
                    uploading: false,
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : row,
            ),
          );
          toast.error(error instanceof Error ? error.message : "Upload failed — tap retry.");
        }
      }),
    );
  }

  function moveItem(from: number, to: number) {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function setMain(index: number) {
    if (index === 0) return;
    moveItem(index, 0);
    toast.success("Main preview updated");
  }

  const visibleRows = rows.length > 0 ? rows : [];

  return (
    <section className="cf-product-card cf-product-card--lift" aria-labelledby="product-media-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="product-media-heading" className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Media gallery
          </h2>
          <p className="mt-1 text-[12px] text-[#86868b]">
            Up to {MAX_PRODUCT_MEDIA} photos or videos. Drag to reorder — first image is the storefront preview.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "cf-product-dropzone mt-5",
          dragOver && "cf-product-dropzone--active",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload product media"
      >
        <Upload className="mx-auto h-6 w-6 text-[#b8956a]" aria-hidden />
        <p className="mt-3 text-[14px] font-medium text-[#1d1d1f]">
          Drag images here or click to upload
        </p>
        <p className="mt-1 text-[12px] text-[#86868b]">JPG, PNG, WebP, GIF, MP4 · multiple files supported</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {visibleRows.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
          {visibleRows.map((row, index) => {
            const preview = row.previewUrl || row.url;
            return (
              <li
                key={`${row.url}-${index}`}
                className="cf-product-media-tile group"
              >
                <div className="relative aspect-square overflow-hidden rounded-[12px] bg-[#f5f5f7]">
                  {preview ? (
                    row.mediaType === "VIDEO" ? (
                      <video src={preview} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt={row.alt || "Product media"} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#86868b]">
                      <ImagePlus className="h-6 w-6" />
                    </div>
                  )}
                  {row.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[11px] font-medium">
                      Uploading…
                    </div>
                  ) : null}
                  {row.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 p-2 text-center text-[11px] text-red-600">
                      {row.error}
                      <button
                        type="button"
                        className="cf-pill px-3 py-1 text-[11px]"
                        onClick={() => inputRef.current?.click()}
                      >
                        Retry
                      </button>
                    </div>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
                    <button
                      type="button"
                      className="rounded-full bg-white/90 p-1.5 text-[#1d1d1f]"
                      aria-label="Move earlier"
                      onClick={() => moveItem(index, index - 1)}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                    {index !== 0 ? (
                      <button
                        type="button"
                        className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium"
                        onClick={() => setMain(index)}
                      >
                        <Star className="mr-1 inline h-3 w-3" />
                        Main
                      </button>
                    ) : (
                      <span className="rounded-full bg-[#b8956a] px-2 py-1 text-[10px] font-semibold text-white">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      className="rounded-full bg-white/90 p-1.5 text-red-600"
                      aria-label="Remove media"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}