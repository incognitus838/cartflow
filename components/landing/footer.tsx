import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#fbfbfd] px-4 py-14 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] transition-opacity hover:opacity-70"
        >
          CartFlow
        </Link>
        <p className="text-[13px] text-[#86868b]">
          © {new Date().getFullYear()} CartFlow · Effortless Commerce. Timeless Elegance.
        </p>
        <div className="flex gap-8 text-[13px] text-[#86868b]">
          <Link href="/login" className="transition-colors hover:text-[#1d1d1f]">
            Log in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-[#1d1d1f]">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}