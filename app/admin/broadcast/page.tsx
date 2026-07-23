import { AdminBroadcastClient } from "@/components/admin/broadcast-client";
import { PageHeader } from "@/components/shared/page-header";
import { countSellerRecipients } from "@/lib/admin/broadcast-recipients";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  let initialAudienceCount = 0;
  try {
    initialAudienceCount = await countSellerRecipients({ audience: "all_owners" });
  } catch {
    initialAudienceCount = 0;
  }

  return (
    <>
      <PageHeader
        title="Email sellers"
        description="Send a platform announcement to store owners via Resend. One message per owner, even if they own multiple stores."
        alert={
          <p className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white px-4 py-3 text-[13px] text-[#6e6e73]">
            <span className="font-semibold text-[#1d1d1f]">Platform email only.</span> Use this for
            maintenance, plan changes, and product updates — not for customer order receipts. Max
            2,000 owners per send.
          </p>
        }
      />
      <AdminBroadcastClient initialAudienceCount={initialAudienceCount} />
    </>
  );
}
