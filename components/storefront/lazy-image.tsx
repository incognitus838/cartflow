"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { optimizeImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-100 text-slate-300",
        className,
      )}
      aria-hidden
    >
      <ImageIcon className="h-8 w-8" />
    </div>
  );
}

export function LazyImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 640px) 50vw, 300px",
  fill = true,
  width,
  height,
}: LazyImageProps) {
  const [failed, setFailed] = useState(false);
  const optimized = optimizeImageUrl(src, priority ? 900 : 480);

  if (!src || failed) {
    return (
      <ImagePlaceholder
        className={cn(fill ? "absolute inset-0" : "h-full w-full", className)}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={optimized}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={optimized}
      alt={alt}
      width={width ?? 480}
      height={height ?? 480}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}