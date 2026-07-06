import Link from "next/link";
import { sellerApprovalMessage } from "@/lib/business/approval";
import type { StoreApprovalSnapshot } from "@/lib/business/approval";

type StoreApprovalBannerProps = {
  store: StoreApprovalSnapshot & { name: string };
};

export function StoreApprovalBanner({ store }: StoreApprovalBannerProps) {
  const message = sellerApprovalMessage(store);
  if (!message) return null;

  const styles =
    message.tone === "pending"
      ? "border-[#e8a317]/30 bg-[#fffdf5] text-[#9a6700]"
      : "border-[#9a2a2a]/25 bg-[#fff5f5] text-[#9a2a2a]";

  return (
    <div
      role="status"
      className={`border-b px-4 py-3 lg:px-8 ${styles}`}
    >
      <p className="text-[13px] font-semibold">{message.title}</p>
      <p className="mt-1 text-[12px] leading-relaxed opacity-90">{message.body}</p>
      {message.tone === "rejected" && message.canResubmit ? (
        <Link
          href="/dashboard/settings"
          className="mt-2 inline-block text-[12px] font-medium underline underline-offset-2"
        >
          Update store details in Settings
        </Link>
      ) : null}
    </div>
  );
}