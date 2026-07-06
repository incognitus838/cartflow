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

const INTERVAL_MS = 2800;
const FADE_MS = 420;

export function HeroChatter() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % sellerChatter.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#86868b]">
        Every seller knows this inbox
      </p>
      <p
        className="cf-hero-chatter cf-heading mt-4 min-h-[2.6em] text-[30px] leading-[1.15] sm:min-h-[2.4em] sm:text-[40px] lg:text-[46px]"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="cf-hero-chatter-quote" aria-hidden>
          &ldquo;
        </span>
        <span className="cf-hero-chatter-text" data-visible={visible ? "true" : "false"}>
          {sellerChatter[index]}
        </span>
        <span className="cf-hero-chatter-quote" aria-hidden>
          &rdquo;
        </span>
      </p>
      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[17px] sm:text-[18px]">
        Sound familiar? Share one link — prices, stock, and checkout sorted. You rest, your shop
        still sells.
      </p>
    </div>
  );
}