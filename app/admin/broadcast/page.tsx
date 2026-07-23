import { AdminBroadcastClient } from "@/components/admin/broadcast-client";
import { PageHeader } from "@/components/shared/page-header";
import { listSellerRecipients } from "@/lib/admin/broadcast-recipients";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  let initialRecipients: Array<{
    email: string;
    name: string;
    storeName: string;
    businessId: string;
  }> = [];

  try {
    const rows = await listSellerRecipients({ audience: "all_owners" });
    initialRecipients = rows.map((r) => ({
      email: r.email,
      name: r.name,
      storeName: r.storeName,
      businessId: r.businessId,
    }));
  } catch {
    initialRecipients = [];
  }

  return (
    <>
      <PageHeader
        title="Email sellers"
        description="Send a platform announcement to store owners via Resend. Review the full recipient list, remove anyone you do not want to include, then send."
        alert={
          <p className="rounded-[var(--cf-radius-md)] border border-black/[0.06] bg-white px-4 py-3 text-[13px] text-[#6e6e73]">
            <span className="font-semibold text-[#1d1d1f]">Platform email only.</span> Use this for
            maintenance, plan changes, and product updates — not for customer order receipts. Max
            2,000 owners per send. Only addresses left in the list below are emailed.
          </p>
        }
      />
      <AdminBroadcastClient initialRecipients={initialRecipients} />
    </>
  );
}
