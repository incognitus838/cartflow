import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

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
      title="Order status update"
      appUrl={appUrl}
      cta={{ label: "View order", href: trackUrl }}
      footerNote="If you have questions, please contact the seller via your order page."
    >
      <EmailParagraph>Dear {customerName},</EmailParagraph>
      <EmailParagraph>
        This is an update regarding your order {orderNumber} from {storeName}.
      </EmailParagraph>
      <EmailParagraph>Current status: {statusLabel}.</EmailParagraph>
      <EmailParagraph>
        You may view your order details at any time using the link below.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default OrderStatusEmail;
