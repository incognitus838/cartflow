"use client";

import { useEffect, useState } from "react";

export const sellerChatter = [
  "How much?",
  "E dey available?",
  "Last price abeg.",
  "Which size you want?",
  "You get this one?",
  "Customer serious? He no serious!",
  "My time no waste.",
  "I dey sleep — my shop still open.",
] as const;

const ROTATE_MS = 3000;

export function HeroChatter() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % sellerChatter.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
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
        <p key={phrase} className="cf-hero-chatter-line">
          <span className="cf-hero-chatter-quote" aria-hidden>
            &ldquo;
          </span>
          <span className="cf-hero-chatter-text">{phrase}</span>
          <span className="cf-hero-chatter-quote" aria-hidden>
            &rdquo;
          </span>
        </p>
      </div>

      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[17px] sm:text-[18px]">
        Sound familiar? Share one link — prices, stock, and checkout sorted. You rest, your shop
        still sells.
      </p>
    </div>
  );
}