import { CartflowLayout, EmailList, EmailParagraph } from "./components/cartflow-layout";

export type NewOrderEmailProps = {
  ownerName: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: string;
  items: string[];
  customerNote?: string | null;
  ordersUrl: string;
  appUrl: string;
};

export function NewOrderEmail({
  ownerName,
  storeName,
  orderNumber,
  customerName,
  customerPhone,
  total,
  items,
  customerNote,
  ordersUrl,
  appUrl,
}: NewOrderEmailProps) {
  return (
    <CartflowLayout
      preview={`New order ${orderNumber} — ${total}`}
      title="New order received"
      appUrl={appUrl}
      cta={{ label: "Review order", href: ordersUrl }}
    >
      <EmailParagraph>Dear {ownerName},</EmailParagraph>
      <EmailParagraph>A new order has been placed at {storeName}.</EmailParagraph>
      <EmailParagraph>Order number: {orderNumber}</EmailParagraph>
      <EmailParagraph>
        Customer: {customerName} · {customerPhone}
      </EmailParagraph>
      <EmailParagraph>Total: {total}</EmailParagraph>
      <EmailParagraph>Items:</EmailParagraph>
      <EmailList items={items} />
      {customerNote ? <EmailParagraph>Customer note: {customerNote}</EmailParagraph> : null}
      <EmailParagraph>
        Please review the payment receipt and confirm the order in your dashboard.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default NewOrderEmail;
