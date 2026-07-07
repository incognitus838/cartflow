"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUpDown, Store } from "lucide-react";
import { toast } from "sonner";
import { presetLabel } from "@/lib/dashboard/nav";

export type StoreSwitcherOption = {
  id: string;
  name: string;
  slug: string;
  access: "owner" | "staff";
  accessPreset: string | null;
};

type StoreSwitcherProps = {
  stores: StoreSwitcherOption[];
  activeStoreId: string;
  compact?: boolean;
};

export function StoreSwitcher({ stores, activeStoreId, compact = false }: StoreSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (stores.length <= 1) return null;

  const active = stores.find((s) => s.id === activeStoreId) ?? stores[0];

  async function switchTo(businessId: string) {
    if (businessId === activeStoreId || switching) return;
    setSwitching(true);
    setOpen(false);
    try {
      const res = await fetch("/api/business/switch-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not switch store");
        return;
      }
      toast.success("Switched store");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={switching}
        className={`flex w-full items-center gap-2 rounded-lg border border-[#e8e8ed] bg-[#f5f5f7] px-3 py-2 text-left transition-colors hover:bg-[#ebebed] ${
          compact ? "text-[12px]" : "text-[13px]"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Store className="h-3.5 w-3.5 shrink-0 text-[#86868b]" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate font-medium text-[#1d1d1f]">{active.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[#86868b]" strokeWidth={1.75} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close store list"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-xl border border-[#e8e8ed] bg-white py-1 shadow-lg"
          >
            {stores.map((store) => (
              <li key={store.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={store.id === activeStoreId}
                  onClick={() => void switchTo(store.id)}
                  className={`flex w-full flex-col px-3 py-2.5 text-left hover:bg-[#f5f5f7] ${
                    store.id === activeStoreId ? "bg-[#fffdf9]" : ""
                  }`}
                >
                  <span className="truncate text-[13px] font-medium text-[#1d1d1f]">
                    {store.name}
                  </span>
                  <span className="truncate text-[11px] text-[#86868b]">
                    /{store.slug}
                    {store.access === "staff"
                      ? ` · ${presetLabel(store.accessPreset)}`
                      : " · Owner"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}