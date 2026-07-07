"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

type ImpersonateButtonProps = {
  businessId: string;
  storeName: string;
  disabled?: boolean;
  compact?: boolean;
};

export function ImpersonateButton({
  businessId,
  storeName,
  disabled = false,
  compact = false,
}: ImpersonateButtonProps) {
  const [loading, setLoading] = useState(false);

  async function impersonate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not impersonate");
        return;
      }
      const openedAs = data.store?.name ?? storeName;
      toast.success(`Viewing ${openedAs} as seller`);
      window.location.assign(data.redirectTo || "/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const label = loading ? "Opening…" : compact ? "Dashboard" : "Impersonate";

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={impersonate}
      title={`Open seller dashboard as ${storeName}`}
      aria-label={`Open seller dashboard as ${storeName}`}
      className="cf-btn-inline cf-btn-inline-primary disabled:opacity-60"
    >
      <UserCog className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}