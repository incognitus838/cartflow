export function normalizeWhatsAppNumber(phone: string) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppOrderUrl(phone: string, message: string) {
  const digits = normalizeWhatsAppNumber(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

type OrderLine = {
  title: string;
  variantName?: string;
  quantity: number;
  priceLabel: string;
};

export function buildOrderMessage(
  storeName: string,
  lines: OrderLine[],
  storeUrl: string,
) {
  const items = lines
    .map((line) => {
      const variant = line.variantName ? ` (${line.variantName})` : "";
      const qty = line.quantity > 1 ? ` x${line.quantity}` : "";
      return `• ${line.title}${variant}${qty} — ${line.priceLabel}`;
    })
    .join("\n");

  return `Hi ${storeName}! I'd like to order:\n\n${items}\n\nStore: ${storeUrl}`;
}