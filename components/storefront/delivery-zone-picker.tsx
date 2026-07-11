"use client";

import type { DeliveryZonePublic } from "@/lib/delivery/types";
import { cn, formatCurrency } from "@/lib/utils";

type DeliveryZonePickerProps = {
  zones: DeliveryZonePublic[];
  currency: string;
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
  required?: boolean;
};

export function DeliveryZonePicker({
  zones,
  currency,
  selectedZoneId,
  onSelect,
  required = false,
}: DeliveryZonePickerProps) {
  if (zones.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">
        Delivery location
        {required ? <span className="text-red-500"> *</span> : null}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Choose where you want your order delivered. Fee updates instantly.
      </p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {zones.map((zone) => {
          const selected = zone.id === selectedZoneId;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelect(zone.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-[var(--cf-accent,#1d1d1f)] bg-[var(--cf-accent,#1d1d1f)] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white",
              )}
            >
              <span className="font-medium">{zone.name}</span>
              <span className={cn("ml-1.5 tabular-nums", selected ? "text-white/90" : "text-slate-500")}>
                · {zone.fee > 0 ? formatCurrency(zone.fee, currency) : "Free"}
              </span>
            </button>
          );
        })}
      </div>
      {required && !selectedZoneId ? (
        <p className="mt-3 text-xs text-amber-700">Select a location to continue.</p>
      ) : null}
    </div>
  );
}