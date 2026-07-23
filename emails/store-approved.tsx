import {
  CartflowLayout,
  EmailList,
  EmailParagraph,
  StatusPill,
} from "./components/cartflow-layout";

export type StoreApprovedEmailProps = {
  ownerName: string;
  storeName: string;
  productsUrl: string;
  storefrontUrl: string;
  appUrl: string;
};

export function StoreApprovedEmail({
  ownerName,
  storeName,
  productsUrl,
  storefrontUrl,
  appUrl,
}: StoreApprovedEmailProps) {
  return (
    <CartflowLayout
      preview={`${storeName} is approved and live`}
      eyebrow="Store approval"
      title="Your store has been approved"
      appUrl={appUrl}
      tone="success"
      cta={{ label: "Add products", href: productsUrl }}
      footerNote={`Your public storefront: ${storefrontUrl}`}
    >
      <StatusPill label="Approved · Live" tone="success" />
      <EmailParagraph>Dear {ownerName},</EmailParagraph>
      <EmailParagraph>
        We are pleased to inform you that {storeName} has been approved and is now live on
        CartFlow.
      </EmailParagraph>
      <EmailParagraph>
        You may now add products, customise your storefront presentation, and share your store
        link with customers via WhatsApp or social channels.
      </EmailParagraph>
      <EmailList
        items={[
          "Add products with clear pricing and stock",
          "Confirm bank details for customer transfers",
          "Share your storefront link with buyers",
        ]}
      />
    </CartflowLayout>
  );
}

export default StoreApprovedEmail;
