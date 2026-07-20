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

const HOLD_MS = 2800;
const FADE_MS = 400;

export function HeroChatter() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const cycleTimer = setInterval(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % sellerChatter.length);
        setVisible(true);
      }, FADE_MS);
    }, HOLD_MS);

    return () => {
      clearInterval(cycleTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
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
      >
        <p
          className={`cf-hero-chatter-line cf-hero-chatter-line--active ${
            visible ? "cf-hero-chatter-line--in" : "cf-hero-chatter-line--out"
          }`}
        >
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
