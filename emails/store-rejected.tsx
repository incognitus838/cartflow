import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

export type StoreRejectedEmailProps = {
  ownerName: string;
  storeName: string;
  reason: string;
  canResubmit: boolean;
  settingsUrl: string;
  appUrl: string;
};

export function StoreRejectedEmail({
  ownerName,
  storeName,
  reason,
  canResubmit,
  settingsUrl,
  appUrl,
}: StoreRejectedEmailProps) {
  const nextStep = canResubmit
    ? "Please review the reason below, update your store details in Settings, and contact support if you wish to resubmit."
    : "Please contact support if you believe this decision was made in error.";

  return (
    <CartflowLayout
      preview={`Update required for ${storeName}`}
      title="Application update required"
      appUrl={appUrl}
      cta={canResubmit ? { label: "Update store details", href: settingsUrl } : undefined}
      footerNote="This message relates to your CartFlow store application."
    >
      <EmailParagraph>Dear {ownerName},</EmailParagraph>
      <EmailParagraph>
        Following review, we are unable to approve the application for {storeName} at this time.
      </EmailParagraph>
      <EmailParagraph>Reason: {reason}</EmailParagraph>
      <EmailParagraph>{nextStep}</EmailParagraph>
    </CartflowLayout>
  );
}

export default StoreRejectedEmail;
