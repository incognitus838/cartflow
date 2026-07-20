"use client";

import { useEffect, useState } from "react";

export const sellerChatter = [
  "How much?",
  "E dey available?",
  "Last price abeg.",
  "Which size you want?",
  "You get this one?",
  "I don travel but my shop dey open.",
] as const;

/** How long each phrase stays fully visible */
const HOLD_MS = 2600;
/** Must match CSS animation duration */
const FADE_MS = 700;

/**
 * Hero rotating quotes — JS advances the phrase; CSS keyframes handle opacity crossfade.
 */
export function HeroChatter() {
  const [active, setActive] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % sellerChatter.length;
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setOutgoing(current);
        }
        return next;
      });
    }, HOLD_MS + FADE_MS);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (outgoing === null) return;
    const id = window.setTimeout(() => setOutgoing(null), FADE_MS);
    return () => window.clearTimeout(id);
  }, [outgoing]);

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
        {outgoing !== null && !reduceMotion ? (
          <p
            key={`out-${outgoing}-${active}`}
            className="cf-hero-chatter-line cf-hero-chatter-line--out"
            aria-hidden
          >
            <span className="cf-hero-chatter-quote">&ldquo;</span>
            <span className="cf-hero-chatter-text">{sellerChatter[outgoing]}</span>
            <span className="cf-hero-chatter-quote">&rdquo;</span>
          </p>
        ) : null}

        <p
          key={`in-${active}`}
          className={
            reduceMotion
              ? "cf-hero-chatter-line cf-hero-chatter-line--static"
              : "cf-hero-chatter-line cf-hero-chatter-line--in"
          }
        >
          <span className="cf-hero-chatter-quote" aria-hidden>
            &ldquo;
          </span>
          <span className="cf-hero-chatter-text">{sellerChatter[active]}</span>
          <span className="cf-hero-chatter-quote" aria-hidden>
            &rdquo;
          </span>
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden>
        {sellerChatter.map((item, i) => (
          <span
            key={item}
            className={`cf-hero-chatter-dot ${i === active ? "cf-hero-chatter-dot--active" : ""}`}
          />
        ))}
      </div>

      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[17px] sm:text-[18px]">
        You know that feeling. Reply after reply, same questions, money still in limbo. Drop one
        beautiful store link — they browse, pay, and leave a receipt. You approve when you&apos;re
        ready. Your shop keeps selling even when you step away.
      </p>
    </div>
  );
}
