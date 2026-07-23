import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

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
      title="Payment not approved"
      appUrl={appUrl}
      cta={{ label: "Upload new receipt", href: trackUrl }}
    >
      <EmailParagraph>Dear {customerName},</EmailParagraph>
      <EmailParagraph>
        We regret to inform you that the payment submitted for order {orderNumber} from{" "}
        {storeName} could not be approved.
      </EmailParagraph>
      <EmailParagraph>Reason: {reason}</EmailParagraph>
      <EmailParagraph>
        Please upload a new payment receipt using your order page, or contact the seller for
        assistance.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default PaymentRejectedEmail;
