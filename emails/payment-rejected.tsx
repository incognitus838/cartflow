import {
  CartflowLayout,
  DetailCard,
  EmailParagraph,
  StatusPill,
} from "./components/cartflow-layout";

export type PaymentRejectedEmailProps = {
  customerName: string;
  storeName: string;
  orderNumber: string;
  reason: string;
  trackUrl: string;
  appUrl: string;
};

export function PaymentRejectedEmail({
  customerName,
  storeName,
  orderNumber,
  reason,
  trackUrl,
  appUrl,
}: PaymentRejectedEmailProps) {
  return (
    <CartflowLayout
      preview={`Payment not approved for ${orderNumber}`}
      eyebrow="Payment"
      title="Payment not approved"
      appUrl={appUrl}
      tone="danger"
      cta={{ label: "Upload new receipt", href: trackUrl }}
    >
      <StatusPill label="Not approved" tone="danger" />
      <EmailParagraph>Dear {customerName},</EmailParagraph>
      <EmailParagraph>
        We regret to inform you that the payment submitted for your order from {storeName} could
        not be approved.
      </EmailParagraph>
      <DetailCard
        rows={[
          { label: "Order", value: orderNumber },
          { label: "Store", value: storeName },
          { label: "Reason", value: reason },
        ]}
      />
      <EmailParagraph>
        Please upload a new payment receipt using your order page, or contact the seller for
        assistance.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default PaymentRejectedEmail;
