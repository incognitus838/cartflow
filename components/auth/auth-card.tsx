import Link from "next/link";
import { ShoppingBag } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
          CartFlow
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>

      {footer ? <div className="mt-6 text-center text-sm text-slate-600">{footer}</div> : null}
    </div>
  );
}