import type { OrderStatus } from "@prisma/client";

export type OrderInboxData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  notes?: string | null;
  promotionCode?: string | null;
  discountAmount?: number;
  subtotal: number;
  deliveryFee: number;
  deliveryZoneName?: string | null;
  total: number;
  hasPaymentReceipt: boolean;
  createdAt: string;
  items: Array<{
    title: string;
    variantName?: string | null;
    quantity: number;
    total: number;
  }>;
};