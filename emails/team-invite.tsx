import {
  CartflowLayout,
  DetailCard,
  EmailParagraph,
} from "./components/cartflow-layout";

export type TeamInviteEmailProps = {
  recipientName?: string | null;
  storeName: string;
  invitedByName: string;
  roleLabel: string;
  inviteUrl: string;
  expiresInDays: number;
  appUrl: string;
};

export function TeamInviteEmail({
  recipientName,
  storeName,
  invitedByName,
  roleLabel,
  inviteUrl,
  expiresInDays,
  appUrl,
}: TeamInviteEmailProps) {
  const greeting = recipientName ? `Dear ${recipientName}` : "Dear colleague";

  return (
    <CartflowLayout
      preview={`Invitation to ${storeName}`}
      eyebrow="Team access"
      title={`Invitation to ${storeName}`}
      appUrl={appUrl}
      cta={{ label: "Accept invitation", href: inviteUrl }}
      footerNote="If you were not expecting this invitation, you may ignore this email."
    >
      <EmailParagraph>{greeting},</EmailParagraph>
      <EmailParagraph>
        {invitedByName} has invited you to join the seller dashboard for {storeName} on CartFlow.
      </EmailParagraph>
      <DetailCard
        rows={[
          { label: "Store", value: storeName },
          { label: "Access level", value: roleLabel },
          { label: "Expires", value: `${expiresInDays} days` },
        ]}
      />
      <EmailParagraph>
        Please accept this invitation using the button below.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default TeamInviteEmail;
