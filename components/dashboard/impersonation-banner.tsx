"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shield, X } from "lucide-react";
import { toast } from "sonner";

type ImpersonationBannerProps = {
  storeName: string;
  storeSlug: string;
};

export function ImpersonationBanner({ storeName, storeSlug }: ImpersonationBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function endImpersonation() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate/end", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not exit impersonation");
        return;
      }
      toast.success("Returned to admin");
      router.push(data.redirectTo || "/admin");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div role="status" className="cf-impersonation-bar px-4 py-3 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[#1d1d1f]">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#b8956a]" strokeWidth={1.75} aria-hidden />
          <span>
            <span className="font-semibold">Admin view</span>
            <span className="text-[#86868b]"> — </span>
            managing <span className="font-medium">{storeName}</span>{" "}
            <span className="font-mono text-[13px] text-[#6e6e73]">/{storeSlug}</span>
          </span>
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={endImpersonation}
          aria-label="Exit impersonation and return to admin"
          className="cf-btn-inline cf-btn-inline-primary disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          {loading ? "Exiting…" : "Exit to admin"}
        </button>
      </div>
    </div>
  );
}