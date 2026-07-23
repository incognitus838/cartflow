import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

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
      title={`Invitation to ${storeName}`}
      appUrl={appUrl}
      cta={{ label: "Accept invitation", href: inviteUrl }}
      footerNote="If you were not expecting this invitation, you may ignore this email."
    >
      <EmailParagraph>{greeting},</EmailParagraph>
      <EmailParagraph>
        {invitedByName} has invited you to join the seller dashboard for {storeName} on CartFlow.
      </EmailParagraph>
      <EmailParagraph>Access level: {roleLabel}.</EmailParagraph>
      <EmailParagraph>
        Please accept this invitation using the button below. This link expires in{" "}
        {expiresInDays} days.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default TeamInviteEmail;
