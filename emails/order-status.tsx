import {
  CartflowLayout,
  DetailCard,
  EmailParagraph,
  StatusPill,
} from "./components/cartflow-layout";

export type OrderStatusEmailProps = {
  customerName: string;
  storeName: string;
  orderNumber: string;
  statusLabel: string;
  trackUrl: string;
  appUrl: string;
};

export function OrderStatusEmail({
  customerName,
  storeName,
  orderNumber,
  statusLabel,
  trackUrl,
  appUrl,
}: OrderStatusEmailProps) {
  return (
    <CartflowLayout
      preview={`Order ${orderNumber} is ${statusLabel}`}
      eyebrow="Order update"
      title="Order status update"
      appUrl={appUrl}
      tone="success"
      cta={{ label: "View order", href: trackUrl }}
      footerNote="If you have questions, please contact the seller via your order page."
    >
      <StatusPill label={statusLabel} tone="success" />
      <EmailParagraph>Dear {customerName},</EmailParagraph>
      <EmailParagraph>
        This is an update regarding your order from {storeName}.
      </EmailParagraph>
      <DetailCard
        rows={[
          { label: "Order", value: orderNumber },
          { label: "Store", value: storeName },
          { label: "Status", value: statusLabel },
        ]}
      />
      <EmailParagraph>
        You may view your order details at any time using the link below.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default OrderStatusEmail;
