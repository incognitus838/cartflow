import type { CheckoutInput } from "@/lib/orders/types";

function parseCheckoutFields(data: Record<string, unknown>): CheckoutInput | string {
  const customerName = typeof data.customerName === "string" ? data.customerName.trim() : "";
  const customerPhone = typeof data.customerPhone === "string" ? data.customerPhone.trim() : "";
  const customerAddress =
    typeof data.customerAddress === "string" ? data.customerAddress.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const notes = typeof data.notes === "string" ? data.notes.trim() : "";
  const promotionCode =
    typeof data.promotionCode === "string" ? data.promotionCode.trim().toUpperCase() : "";
  const deliveryZoneId =
    typeof data.deliveryZoneId === "string" && data.deliveryZoneId.trim()
      ? data.deliveryZoneId.trim()
      : undefined;

  if (!customerName || customerName.length < 2) return "Your name is required.";
  if (!customerPhone || customerPhone.length < 7) return "A valid phone number is required.";

  const items = Array.isArray(data.items)
    ? data.items.map((row, index) => {
        const item = row as Record<string, unknown>;
        const productId = typeof item.productId === "string" ? item.productId : "";
        const variantId = typeof item.variantId === "string" ? item.variantId : undefined;
        const quantity = Number(item.quantity);

        if (!productId) throw new Error(`Item ${index + 1} is invalid.`);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(`Item ${index + 1} needs a valid quantity.`);
        }

        return { productId, variantId, quantity };
      })
    : [];

  if (items.length === 0) return "Your cart is empty.";

  return {
    customerName,
    customerPhone,
    customerAddress: customerAddress || undefined,
    email: email || undefined,
    notes: notes || undefined,
    promotionCode: promotionCode || undefined,
    deliveryZoneId,
    items,
  };
}

export function parseCheckoutInput(body: unknown): CheckoutInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";
  return parseCheckoutFields(body as Record<string, unknown>);
}

export function parseCheckoutFormData(formData: FormData): CheckoutInput | string {
  const itemsRaw = formData.get("items");
  let items: unknown[] = [];

  if (typeof itemsRaw === "string" && itemsRaw.trim()) {
    try {
      const parsed = JSON.parse(itemsRaw);
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      return "Invalid cart data.";
    }
  }

  return parseCheckoutFields({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerAddress: formData.get("customerAddress"),
    email: formData.get("email"),
    notes: formData.get("notes"),
    promotionCode: formData.get("promotionCode"),
    deliveryZoneId: formData.get("deliveryZoneId"),
    items,
  });
}