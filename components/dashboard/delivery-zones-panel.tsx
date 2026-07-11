"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { DeliveryZoneRecord } from "@/lib/delivery/types";
import { cn, formatCurrency } from "@/lib/utils";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

type DeliveryZonesPanelProps = {
  currency: string;
};

type DraftZone = {
  name: string;
  fee: string;
};

export function DeliveryZonesPanel({ currency }: DeliveryZonesPanelProps) {
  const [zones, setZones] = useState<DeliveryZoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftZone>({ name: "", fee: "0" });
  const [saving, setSaving] = useState(false);

  const loadZones = useCallback(async () => {
    try {
      const res = await fetch("/api/business/delivery-zones");
      const data = await res.json();
      if (res.ok && Array.isArray(data.zones)) {
        setZones(data.zones);
      }
    } catch {
      toast.error("Could not load delivery zones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  function resetDraft() {
    setDraft({ name: "", fee: "0" });
    setAdding(false);
    setEditingId(null);
  }

  async function handleCreate() {
    const name = draft.name.trim();
    const fee = Number(draft.fee);
    if (!name || name.length < 2) {
      toast.error("Zone name is required.");
      return;
    }
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error("Fee must be zero or greater.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/business/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fee }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not create zone.");
        return;
      }
      setZones((current) => [...current, data.zone]);
      resetDraft();
      toast.success("Delivery zone added.");
    } catch {
      toast.error("Could not create zone.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    const name = draft.name.trim();
    const fee = Number(draft.fee);
    if (!name || name.length < 2) {
      toast.error("Zone name is required.");
      return;
    }
    if (!Number.isFinite(fee) || fee < 0) {
      toast.error("Fee must be zero or greater.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/business/delivery-zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, fee }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not save zone.");
        return;
      }
      setZones((current) => current.map((z) => (z.id === id ? data.zone : z)));
      resetDraft();
      toast.success("Zone updated.");
    } catch {
      toast.error("Could not save zone.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(zone: DeliveryZoneRecord) {
    try {
      const res = await fetch(`/api/business/delivery-zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !zone.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not update zone.");
        return;
      }
      setZones((current) => current.map((z) => (z.id === zone.id ? data.zone : z)));
    } catch {
      toast.error("Could not update zone.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this delivery zone?")) return;

    try {
      const res = await fetch(`/api/business/delivery-zones/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Could not delete zone.");
        return;
      }
      setZones((current) => current.filter((z) => z.id !== id));
      if (editingId === id) resetDraft();
      toast.success("Zone deleted.");
    } catch {
      toast.error("Could not delete zone.");
    }
  }

  function startEdit(zone: DeliveryZoneRecord) {
    setAdding(false);
    setEditingId(zone.id);
    setDraft({ name: zone.name, fee: String(zone.fee) });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Delivery zones</h2>
            <p className="mt-1 text-sm text-slate-500">
              Named locations buyers pick at checkout — e.g. Lekki ₦2,000, Pickup free.
            </p>
          </div>
        </div>
        {!adding && !editingId ? (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setDraft({ name: "", fee: "0" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add zone
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading zones…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {zones.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
              No zones yet. Buyers see your flat default delivery fee until you add locations.
            </p>
          ) : (
            zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
                  zone.isActive ? "border-slate-200 bg-slate-50/50" : "border-slate-100 bg-white opacity-70",
                )}
              >
                <div>
                  <p className="font-medium text-slate-900">{zone.name}</p>
                  <p className="text-sm text-slate-500">
                    {zone.fee > 0 ? formatCurrency(zone.fee, currency) : "Free"}
                    {!zone.isActive ? " · Inactive" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(zone)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
                  >
                    {zone.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(zone)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800"
                    aria-label={`Edit ${zone.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(zone.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
                    aria-label={`Delete ${zone.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {adding || editingId ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <p className="text-sm font-medium text-slate-900">
                {editingId ? "Edit zone" : "New zone"}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Lekki Phase 1"
                  className={INPUT_CLASS}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.fee}
                  onChange={(e) => setDraft((d) => ({ ...d, fee: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add zone"}
                </button>
                <button
                  type="button"
                  onClick={resetDraft}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}