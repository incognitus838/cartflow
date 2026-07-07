type StaffAccessBannerProps = {
  storeName: string;
};

export function StaffAccessBanner({ storeName }: StaffAccessBannerProps) {
  return (
    <div
      role="status"
      className="border-b border-[#b8956a]/20 bg-[#fffdf9] px-4 py-2.5 lg:px-8"
    >
      <p className="text-[13px] text-[#6e6e73]">
        <span className="font-semibold text-[#1d1d1f]">Staff access</span>
        <span className="text-[#86868b]"> — </span>
        You can manage day-to-day work on {storeName}. Store settings, billing, and payment
        approval are owner-only.
      </p>
    </div>
  );
}