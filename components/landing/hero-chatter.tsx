"use client";

import { useEffect, useState } from "react";

export const sellerChatter = [
  "How much?",
  "E dey available?",
  "Last price abeg.",
  "Which size you want?",
  "You get this one?",
  "I dey travel but my shop dey open.",
] as const;

const HOLD_MS = 3000;

/**
 * Rotating seller phrases in the landing hero.
 * Uses JS interval + keyed remount so it runs the same on mobile and desktop
 * (including Windows laptops with "animation effects" reduced).
 */
export function HeroChatter() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % sellerChatter.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  const phrase = sellerChatter[index];

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#86868b]">
        Every seller knows this inbox
      </p>

      <div
        className="cf-hero-chatter-stage cf-heading mt-4 text-[30px] leading-[1.15] sm:text-[40px] lg:text-[46px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* key forces a fresh enter animation each phrase (works where CSS delays fail) */}
        <p key={phrase} className="cf-hero-chatter-line cf-hero-chatter-line--enter">
          <span className="cf-hero-chatter-quote" aria-hidden>
            &ldquo;
          </span>
          <span className="cf-hero-chatter-text">{phrase}</span>
          <span className="cf-hero-chatter-quote" aria-hidden>
            &rdquo;
          </span>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
        {sellerChatter.map((item, i) => (
          <span
            key={item}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-4 bg-[#b8956a]" : "w-1.5 bg-black/15"
            }`}
          />
        ))}
      </div>

      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[17px] sm:text-[18px]">
        Sound familiar? Share one link — prices, stock, and checkout sorted. You rest, your shop
        still sells.
      </p>
    </div>
  );
}
