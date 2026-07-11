"use client";

import { ChevronDown, MapPin } from "lucide-react";
import type { DeliveryZonePublic } from "@/lib/delivery/types";
import { formatCurrency } from "@/lib/utils";

type DeliveryZonePickerProps = {
  zones: DeliveryZonePublic[];
  currency: string;
  selectedZoneId: string | null;
  onSelect: (zoneId: string) => void;
  required?: boolean;
  compact?: boolean;
};

function zoneLabel(zone: DeliveryZonePublic, currency: string) {
  const fee = zone.fee > 0 ? formatCurrency(zone.fee, currency) : "Free";
  return `${zone.name} — ${fee}`;
}

export function DeliveryZonePicker({
  zones,
  currency,
  selectedZoneId,
  onSelect,
  required = false,
  compact = false,
}: DeliveryZonePickerProps) {
  if (zones.length === 0) return null;

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  return (
    <div
      className={
        compact
          ? ""
          : "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      }
    >
      {!compact ? (
        <>
          <h2 className="text-sm font-semibold text-slate-900">
            Delivery location
            {required ? <span className="text-red-500"> *</span> : null}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose where you want your order delivered. Fee updates instantly.
          </p>
        </>
      ) : (
        <p className="mb-2 text-xs font-medium text-[#6e6e73]">
          Delivery location{required ? " *" : ""}
        </p>
      )}

      <div className={compact ? "" : "mt-4"}>
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={1.75}
            aria-hidden
          />
          <select
            value={selectedZoneId ?? ""}
            onChange={(e) => {
              if (e.target.value) onSelect(e.target.value);
            }}
            required={required}
            aria-label="Delivery location"
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-[var(--cf-accent,#1d1d1f)] focus:ring-2 focus:ring-[var(--cf-accent,#1d1d1f)]/10"
          >
            <option value="" disabled>
              Choose delivery location
            </option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zoneLabel(zone, currency)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
        </div>

        {selectedZone ? (
          <p className="mt-2 text-xs text-slate-500">
            Delivery fee:{" "}
            <span className="font-medium text-slate-800">
              {selectedZone.fee > 0
                ? formatCurrency(selectedZone.fee, currency)
                : "Free"}
            </span>
          </p>
        ) : null}

        {required && !selectedZoneId ? (
          <p className="mt-2 text-xs text-amber-700">Select a location to continue.</p>
        ) : null}
      </div>
    </div>
  );
}