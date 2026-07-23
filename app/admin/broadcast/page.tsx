import { AdminBroadcastClient } from "@/components/admin/broadcast-client";
import { PageHeader } from "@/components/shared/page-header";
import { listSellerRecipients } from "@/lib/admin/broadcast";
import { requireAdmin } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  await requireAdmin();

  const recipients = await listSellerRecipients({
    subject: "preview",
    body: "preview body long enough",
    audience: "all_owners",
  });

  return (
    <>
      <PageHeader
        title="Email all sellers"
        description="Send a platform announcement to store owners via Resend. One message per owner email, even if they own multiple stores."
      />
      <AdminBroadcastClient initialAudienceCount={recipients.length} />
    </>
  );
}
