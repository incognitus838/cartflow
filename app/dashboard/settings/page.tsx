import { Suspense } from "react";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import { StoreSettingsForm } from "@/components/dashboard/store-settings-form";
import { TeamPanel } from "@/components/dashboard/team-panel";
import { PageHeader } from "@/components/shared/page-header";
import { requireStoreOwner } from "@/lib/auth-server";
import { toNumber } from "@/lib/decimal";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const { business } = await requireStoreOwner();
  const params = await searchParams;
  const tab = params.tab === "team" ? "team" : "store";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  return (
    <>
      <PageHeader
        title="Settings"
        description={
          tab === "team"
            ? "Invite staff, assign roles, and review team activity."
            : "Store details, checkout defaults, and bank transfer info — what customers see at checkout."
        }
      />

      <Suspense fallback={null}>
        <SettingsTabs active={tab} />
      </Suspense>

      {tab === "team" ? (
        <TeamPanel />
      ) : (
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
      )}
    </>
  );
}