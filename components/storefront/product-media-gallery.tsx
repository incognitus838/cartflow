"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Film, Package } from "lucide-react";
import { LazyImage } from "@/components/storefront/lazy-image";
import { optimizeImageUrl } from "@/lib/images";
import type { ProductMediaType } from "@/lib/media";
import { cn } from "@/lib/utils";

export type GalleryMedia = {
  url: string;
  alt: string | null;
  mediaType: ProductMediaType;
};

type ProductMediaGalleryProps = {
  media: GalleryMedia[];
  title: string;
  priority?: boolean;
};

export function ProductMediaGallery({ media, title, priority = false }: ProductMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = media.length;
  const active = media[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex((index + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (activeIndex >= count && count > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, count]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (count <= 1) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, goNext, goPrev]);

  if (count === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[18px] border border-black/[0.06] bg-[#f5f5f7]">
        <Package className="h-16 w-16 text-[#86868b]" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-[18px] border border-black/[0.06] bg-[#f5f5f7]"
        onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchStartX === null || count <= 1) return;
          const delta = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
          if (Math.abs(delta) > 48) {
            if (delta < 0) goNext();
            else goPrev();
          }
          setTouchStartX(null);
        }}
      >
        <MediaSlide item={active} title={title} priority={priority} />

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.06] bg-white/90 text-[#1d1d1f] opacity-0 shadow-sm backdrop-blur-sm transition-all hover:scale-105 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/[0.06] bg-white/90 text-[#1d1d1f] opacity-0 shadow-sm backdrop-blur-sm transition-all hover:scale-105 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {media.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80",
                  )}
                  aria-label={`View slide ${index + 1}`}
                />
              ))}
            </div>
            <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
              {activeIndex + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {media.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border-2 transition-all duration-300",
                index === activeIndex
                  ? "border-[#1d1d1f] shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Thumbnail item={item} title={title} index={index} />
              {item.mediaType !== "IMAGE" ? (
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[8px] font-medium uppercase text-white">
                  {item.mediaType === "VIDEO" ? "Vid" : "Gif"}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MediaSlide({
  item,
  title,
  priority,
}: {
  item: GalleryMedia;
  title: string;
  priority?: boolean;
}) {
  if (item.mediaType === "VIDEO") {
    return (
      <video
        key={item.url}
        src={item.url}
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
        aria-label={item.alt || title}
      />
    );
  }

  if (item.mediaType === "GIF") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.alt || title}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <LazyImage
      src={item.url}
      alt={item.alt || title}
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority={priority}
      className="transition-transform duration-700 ease-out"
    />
  );
}

function Thumbnail({
  item,
  title,
  index,
}: {
  item: GalleryMedia;
  title: string;
  index: number;
}) {
  if (item.mediaType === "VIDEO") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1d1d1f] text-white">
        <Film className="h-4 w-4" strokeWidth={1.75} />
      </div>
    );
  }

  const src =
    item.mediaType === "GIF" ? item.url : optimizeImageUrl(item.url, 128);

  if (item.mediaType === "GIF") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
    );
  }

  return (
    <LazyImage
      src={src}
      alt={`${title} ${index + 1}`}
      sizes="64px"
      className="object-cover"
    />
  );
}