import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fbfbfd]/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-4 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-[#1d1d1f] transition-opacity hover:opacity-70"
        >
          CartFlow
        </Link>

        <nav className="hidden items-center gap-9 text-[13px] font-normal text-[#1d1d1f]/80 md:flex">
          <a href="#features" className="transition-colors hover:text-[#1d1d1f]">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-[#1d1d1f]">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-[#1d1d1f]">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-[#1d1d1f]">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-[13px] text-[#1d1d1f]/80 transition-colors hover:text-[#1d1d1f] sm:inline"
          >
            Log in
          </Link>
          <Link href="/signup" className="btn-primary px-4 py-2 text-[13px]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}