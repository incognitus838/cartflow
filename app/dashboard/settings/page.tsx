import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { PageHeader } from "@/components/shared/page-header";
import { requireBusiness } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";

export default async function SettingsPage() {
  const { business } = await requireBusiness();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Store details, checkout defaults, and bank transfer info — what customers see at checkout."
      />

      <StoreSettingsForm
        appUrl={appUrl}
        initial={{
          name: business.name,
          slug: business.slug,
          description: business.description ?? "",
          currency: business.currency,
          deliveryFee: String(toNumber(business.deliveryFee)),
          logoUrl: business.logoUrl ?? "",
          phone: business.phone ?? "",
          whatsapp: business.whatsapp ?? "",
          autoDeductInventory: business.autoDeductInventory,
          notifyOnNewOrder: business.notifyOnNewOrder,
          notifyCustomerOnStatus: business.notifyCustomerOnStatus,
          ownerNotifyEmail: business.ownerNotifyEmail ?? "",
          bankName: business.bankName ?? "",
          bankAccountName: business.bankAccountName ?? "",
          bankAccountNumber: business.bankAccountNumber ?? "",
        }}
      />
    </>
  );
}