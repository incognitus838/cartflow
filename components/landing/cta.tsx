import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-[#1d1d1f] px-8 py-20 text-center sm:px-16">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#b8956a]">
            Start today
          </p>
          <h2 className="cf-heading mt-4 text-[32px] text-white sm:text-[40px]">
            Your storefront deserves
            <span className="block">to feel extraordinary.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-[#86868b]">
            Join premium sellers across Nigeria and Africa who run their business on CartFlow —
            not scattered chats and screenshots.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-medium text-[#1d1d1f] transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            Create your store
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}