"use client";

import {
  ACCESS_PRESET_OPTIONS,
  PERMISSION_LABELS,
  presetPermissions,
  type MemberAccessPresetId,
  type MemberPermissions,
} from "@/lib/team/permissions-shared";

type PermissionPickerProps = {
  accessPreset: MemberAccessPresetId;
  onPresetChange: (preset: MemberAccessPresetId) => void;
  permissions: MemberPermissions;
  onPermissionChange: (key: keyof MemberPermissions, value: boolean) => void;
  disabled?: boolean;
};

export function PermissionPicker({
  accessPreset,
  onPresetChange,
  permissions,
  onPermissionChange,
  disabled = false,
}: PermissionPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Access level</label>
        <select
          value={accessPreset}
          disabled={disabled}
          onChange={(e) => {
            const preset = e.target.value as MemberAccessPresetId;
            onPresetChange(preset);
          }}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"
        >
          {ACCESS_PRESET_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-500">
          {ACCESS_PRESET_OPTIONS.find((o) => o.id === accessPreset)?.description}
        </p>
      </div>

      {accessPreset === "CUSTOM" ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Permissions</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PERMISSION_LABELS.map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={permissions[item.key]}
                  onChange={(e) => onPermissionChange(item.key, e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-800">{item.label}</span>
                  <span className="block text-[11px] text-slate-500">{item.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function defaultPermissionsForPreset(preset: MemberAccessPresetId) {
  return presetPermissions(preset);
}