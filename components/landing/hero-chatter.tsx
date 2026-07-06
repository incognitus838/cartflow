export const sellerChatter = [
  "How much?",
  "E dey available?",
  "Last price abeg.",
  "Which size you want?",
  "You get this one?",
  "I dey travel but my shop dey open.",
] as const;

const HOLD_SECONDS = 2.8;
const COUNT = sellerChatter.length;
const CYCLE_SECONDS = COUNT * HOLD_SECONDS;

export function HeroChatter() {
  return (
    <div className="mx-auto mt-6 max-w-2xl">
      <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#86868b]">
        Every seller knows this inbox
      </p>

      <div className="cf-hero-chatter-stage cf-heading mt-4 text-[30px] leading-[1.15] sm:text-[40px] lg:text-[46px]">
        {sellerChatter.map((phrase, index) => (
          <p
            key={phrase}
            className="cf-hero-chatter-line"
            style={{
              animationDuration: `${CYCLE_SECONDS}s`,
              animationDelay: `${index * HOLD_SECONDS}s`,
            }}
          >
            <span className="cf-hero-chatter-quote" aria-hidden>
              &ldquo;
            </span>
            <span className="cf-hero-chatter-text">{phrase}</span>
            <span className="cf-hero-chatter-quote" aria-hidden>
              &rdquo;
            </span>
          </p>
        ))}
      </div>

      <p className="cf-subtext mx-auto mt-5 max-w-lg text-[17px] sm:text-[18px]">
        Sound familiar? Share one link — prices, stock, and checkout sorted. You rest, your shop
        still sells.
      </p>
    </div>
  );
}