import { presetLabel } from "@/lib/dashboard/nav";

type StaffAccessBannerProps = {
  storeName: string;
  accessPreset?: string | null;
};

export function StaffAccessBanner({ storeName, accessPreset }: StaffAccessBannerProps) {
  const role = presetLabel(accessPreset);

  return (
    <div
      role="status"
      className="border-b border-[#b8956a]/20 bg-[#fffdf9] px-4 py-2.5 lg:px-8"
    >
      <p className="text-[13px] text-[#6e6e73]">
        <span className="font-semibold text-[#1d1d1f]">{role} access</span>
        <span className="text-[#86868b]"> — </span>
        You&apos;re helping manage {storeName}. Settings, billing, and payment approval are
        owner-only unless your role includes them.
      </p>
    </div>
  );
}