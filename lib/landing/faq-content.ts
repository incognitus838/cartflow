export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is CartFlow free?",
    answer: "Yes. You can start with up to 10 products at no cost.",
  },
  {
    question: "Do I need technical skills?",
    answer: "No. If you use WhatsApp and can upload photos, you can use CartFlow.",
  },
  {
    question: "How do customers pay me?",
    answer:
      "By bank transfer to your account. They upload a screenshot or PDF as proof at checkout.",
  },
  {
    question: "Does CartFlow hold my money?",
    answer: "No. Payment goes directly to your bank.",
  },
  {
    question: "Can I add staff to my store?",
    answer:
      "Yes, on the Pro plan. Give each person a role so they only access what they need.",
  },
  {
    question: "Can staff approve payments or change my bank account?",
    answer: "No. Only you as the owner can approve payments and manage bank details.",
  },
  {
    question: "What does the Fulfillment role do?",
    answer:
      "They handle orders after payment — packing, shipping updates, delivery status, and customer notes. They cannot approve money.",
  },
  {
    question: "What does the Catalog role do?",
    answer: "They manage products, photos, prices, and stock. They do not see orders.",
  },
  {
    question: "Can I run my store when I am traveling?",
    answer:
      "Yes. Approve payments from anywhere on your phone. Your team updates order status and products while you control the sales.",
  },
  {
    question: "Do customers need to create an account?",
    answer: "No. They checkout as guests with name, phone, and address.",
  },
  {
    question: "Can I charge different delivery fees for different areas?",
    answer: "Yes. Use delivery zones (for example Lekki, Mainland, Pickup).",
  },
  {
    question: "Does stock update when I approve an order?",
    answer:
      "Yes, if you turn on auto-deduct in Settings. Stock is restored if you refund an order.",
  },
  {
    question: "Will I get an email when someone orders?",
    answer:
      "Not yet. Check your dashboard for new orders. Email alerts are coming in a future update.",
  },
  {
    question: "What do I need before signing up?",
    answer:
      "Store name, phone, WhatsApp, bank details, and product photos with prices ready.",
  },
  {
    question: "When will card payments (Paystack) be available?",
    answer: "Coming soon. For now, bank transfer works for most WhatsApp sellers.",
  },
];

export const FAQ_LINKS = [
  { label: "Sign up", href: "/signup" },
  { label: "Login to your dashboard", href: "/login" },
  { label: "Live demo store", href: "/glow-beauty" },
  { label: "Customer order tracking (demo)", href: "/glow-beauty/track" },
] as const;