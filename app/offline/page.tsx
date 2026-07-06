import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Check your connection and try again. Cached pages may still be available.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Go home
      </Link>
    </div>
  );
}