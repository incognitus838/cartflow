import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

export type SellerBroadcastEmailProps = {
  ownerName: string;
  storeName?: string | null;
  subjectTitle: string;
  bodyParagraphs: string[];
  cta?: { label: string; href: string } | null;
  appUrl: string;
};

export function SellerBroadcastEmail({
  ownerName,
  storeName,
  subjectTitle,
  bodyParagraphs,
  cta,
  appUrl,
}: SellerBroadcastEmailProps) {
  return (
    <CartflowLayout
      preview={subjectTitle}
      eyebrow="Platform update"
      title={subjectTitle}
      appUrl={appUrl}
      cta={
        cta === undefined
          ? { label: "Open dashboard", href: `${appUrl}/dashboard` }
          : cta || undefined
      }
      footerNote="You are receiving this because you own a store on CartFlow."
    >
      <EmailParagraph>Dear {ownerName},</EmailParagraph>
      {storeName ? (
        <EmailParagraph>This message relates to your store: {storeName}.</EmailParagraph>
      ) : null}
      {bodyParagraphs.map((p) => (
        <EmailParagraph key={p.slice(0, 40)}>{p}</EmailParagraph>
      ))}
      <EmailParagraph>Kind regards, The CartFlow Team</EmailParagraph>
    </CartflowLayout>
  );
}

export default SellerBroadcastEmail;
