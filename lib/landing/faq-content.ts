export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I get started?",
    answer:
      "CartFlow is free for up to 10 products. No technical skills needed — if you use WhatsApp and can upload photos, you are set. Before signing up, have your store name, phone, WhatsApp, bank details, and product photos with prices ready.",
  },
  {
    question: "How do payments work?",
    answer:
      "Customers pay by bank transfer to your account and upload a screenshot or PDF as proof at checkout. CartFlow never holds your money — it goes straight to you. Card payments via Paystack are coming soon; bank transfer works for most WhatsApp sellers today.",
  },
  {
    question: "Can I add staff, and what can they do?",
    answer:
      "Yes, on the Pro plan. Fulfillment staff handle packing, shipping updates, and delivery status — not payments. Catalog staff manage products, photos, prices, and stock — not orders. Only you as the owner can approve payments and change bank details. You can approve payments from your phone anywhere while your team keeps orders moving.",
  },
  {
    question: "What is the customer checkout experience?",
    answer:
      "Customers do not need an account — they checkout as guests with name, phone, and address. You can charge different delivery fees by area using delivery zones (for example Lekki, Mainland, or Pickup).",
  },
  {
    question: "Orders, stock, and notifications",
    answer:
      "Turn on auto-deduct in Settings and stock updates when you approve an order; stock is restored if you refund. Email alerts when someone orders are not live yet — check your dashboard for new orders. Email notifications are coming in a future update.",
  },
];