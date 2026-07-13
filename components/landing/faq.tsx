import { FAQ_ITEMS } from "@/lib/landing/faq-content";

export function Faq() {
  return (
    <section id="faq" className="border-t border-black/[0.06] bg-[#fbfbfd] px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="cf-heading text-[32px] sm:text-[40px]">Frequently asked questions</h2>
          <p className="cf-subtext mt-5 text-[17px]">
            Straight answers for WhatsApp sellers starting with CartFlow.
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="cf-card group overflow-hidden [&[open]_summary_svg]:rotate-180"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] sm:text-[16px]">
                  {item.question}
                </span>
                <svg
                  className="h-4 w-4 shrink-0 text-[#86868b] transition-transform duration-300"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="border-t border-black/[0.06] px-5 pb-5 pt-1 sm:px-6 sm:pb-6">
                <p className="text-[14px] leading-relaxed text-[#6e6e73]">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}