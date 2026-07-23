import {
  CartflowLayout,
  DetailCard,
  EmailList,
  EmailParagraph,
  StatusPill,
} from "./components/cartflow-layout";

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
      eyebrow="Commerce"
      title="New order received"
      appUrl={appUrl}
      tone="commerce"
      cta={{ label: "Review order", href: ordersUrl }}
    >
      <StatusPill label="Awaiting review" />
      <EmailParagraph>Dear {ownerName},</EmailParagraph>
      <EmailParagraph>A new order has been placed at {storeName}.</EmailParagraph>
      <DetailCard
        rows={[
          { label: "Order", value: orderNumber },
          { label: "Customer", value: customerName },
          { label: "Phone", value: customerPhone },
          { label: "Total", value: total },
        ]}
      />
      <EmailParagraph>Items</EmailParagraph>
      <EmailList items={items} />
      {customerNote ? <EmailParagraph>Customer note: {customerNote}</EmailParagraph> : null}
      <EmailParagraph>
        Please review the payment receipt and confirm the order in your dashboard.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default NewOrderEmail;
