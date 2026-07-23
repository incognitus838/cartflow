"use client";

import { useEffect, useRef, useState } from "react";

export const sellerChatter = [
  "How much?",
  "E dey available?",
  "Last price abeg.",
  "Which size you want?",
  "You get this one?",
  "I don travel but my shop dey open.",
] as const;

/** How long each phrase stays fully visible after the fade settles */
const HOLD_MS = 2800;
/** Must match CSS --cf-hero-fade-ms / animation duration */
const FADE_MS = 900;

/**
 * Hero rotating quotes — JS advances the phrase; CSS handles a soft opacity crossfade.
 * Mobile uses opacity-only motion (no vertical slide) to avoid jank on small screens.
 */
export function HeroChatter() {
  const [active, setActive] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // First paint is static; enable enter animation only after first swap
  useEffect(() => {
    if (outgoing !== null) setHasEntered(true);
  }, [outgoing]);

  useEffect(() => {
    if (reduceMotion) {
      const id = window.setInterval(() => {
        setActive((current) => (current + 1) % sellerChatter.length);
      }, HOLD_MS);
      return () => window.clearInterval(id);
    }

    let holdTimer: number | undefined;
    let fadeTimer: number | undefined;
    let cancelled = false;

    const scheduleNext = () => {
      holdTimer = window.setTimeout(() => {
        if (cancelled) return;
        const current = activeRef.current;
        const next = (current + 1) % sellerChatter.length;
        setOutgoing(current);
        setActive(next);
        fadeTimer = window.setTimeout(() => {
          if (cancelled) return;
          setOutgoing(null);
          scheduleNext();
        }, FADE_MS);
      }, HOLD_MS);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (holdTimer) window.clearTimeout(holdTimer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [reduceMotion]);

  const showOutgoing = outgoing !== null && !reduceMotion;
  const activeClass = reduceMotion
    ? "cf-hero-chatter-line cf-hero-chatter-line--static"
    : showOutgoing || hasEntered
      ? "cf-hero-chatter-line cf-hero-chatter-line--in"
      : "cf-hero-chatter-line cf-hero-chatter-line--static";

  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#86868b]">
        Every seller knows this inbox
      </p>

      <div
        className="cf-hero-chatter-stage cf-heading mt-4 text-[28px] leading-[1.2] sm:text-[40px] sm:leading-[1.15] lg:text-[46px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {showOutgoing ? (
          <p
            key={`out-${outgoing}`}
            className="cf-hero-chatter-line cf-hero-chatter-line--out"
            aria-hidden
          >
            <span className="cf-hero-chatter-quote">&ldquo;</span>
            <span className="cf-hero-chatter-text">{sellerChatter[outgoing]}</span>
            <span className="cf-hero-chatter-quote">&rdquo;</span>
          </p>
        ) : null}

        <p key={`in-${active}`} className={activeClass}>
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

      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[16px] leading-relaxed sm:text-[18px]">
        You know that feeling. Reply after reply, same questions, money still in limbo. Drop one
        beautiful store link — they browse, pay, and leave a receipt. You approve when you&apos;re
        ready. Your shop keeps selling even when you step away.
      </p>
    </div>
  );
}
