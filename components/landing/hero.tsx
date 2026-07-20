import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroChatter } from "@/components/landing/hero-chatter";
import { LazyImage } from "@/components/storefront/lazy-image";
import type { DemoStoreConfig } from "@/lib/demo/stores";

type HeroProps = {
  demoStore: DemoStoreConfig;
};

export function Hero({ demoStore }: HeroProps) {
  return (
    <section className="px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium tracking-wide text-[#b8956a] uppercase">
            Effortless Commerce. Timeless Elegance.
          </p>

          <h1 className="cf-heading mt-5 text-[40px] leading-[1.05] sm:text-[56px] lg:text-[64px]">
            The iphone
            <span className="block"> of digital market.</span>
          </h1>

          <HeroChatter />

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-[15px]">
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={`/${demoStore.slug}`} className="btn-secondary px-7 py-3.5 text-[15px]">
              View demo store
            </Link>
          </div>

          <p className="mt-8 text-[13px] text-[#86868b]">
            Demo store: <span className="font-medium text-[#1d1d1f]">{demoStore.name}</span> ·{" "}
            {demoStore.type} · Free tier · Live in minutes
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-4xl">
          <div className="cf-card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-3.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-[11px] tracking-wide text-[#86868b]">
                cartflow.com.ng/{demoStore.slug}
              </span>
            </div>
            <div className="grid gap-px bg-black/[0.04] sm:grid-cols-3">
              {demoStore.heroProducts.map((item) => (
                <article
                  key={item.name}
                  className="group bg-white p-5 text-left transition-colors hover:bg-[#fbfbfd]"
                >
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[14px] bg-[#f5f5f7]">
                    <LazyImage
                      src={item.image}
                      alt={item.alt}
                      sizes="(max-width: 640px) 100vw, 280px"
                      className="transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#86868b]">
                    {item.category}
                  </p>
                  <h3 className="mt-1 text-[14px] font-medium tracking-tight text-[#1d1d1f]">
                    {item.name}
                  </h3>
                  <p className="currency mt-1.5 text-[14px] font-semibold text-[#1d1d1f]">
                    {item.price}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}