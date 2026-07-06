import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
        <ShoppingBag className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">Store not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        This store doesn&apos;t exist or may have been deactivated.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Go to CartFlow
      </Link>
    </div>
  );
}