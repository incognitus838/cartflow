export type CheckoutItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CheckoutInput = {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  email?: string;
  notes?: string;
  promotionCode?: string;
  items: CheckoutItemInput[];
};