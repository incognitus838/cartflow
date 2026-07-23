import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-[#b8956a] shadow-sm">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
        404
      </p>
      <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight text-[#1d1d1f]">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[#6e6e73]">
        This page doesn&apos;t exist, or the link may be outdated. Head home or open the
        seller dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-accent text-[13px]">
          Go to CartFlow
        </Link>
        <Link href="/login" className="cf-btn-inline cf-btn-inline-ghost text-[13px]">
          Sign in
        </Link>
      </div>
    </div>
  );
}
