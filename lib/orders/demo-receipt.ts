import type { ParsedReceipt } from "@/lib/uploads/receipt";

/** 1×1 transparent PNG — used only for demo checkout so no real transfer is required. */
const DEMO_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export function buildDemoCheckoutReceipt(): ParsedReceipt {
  return {
    data: DEMO_PNG,
    mimeType: "image/png",
    filename: "demo-checkout-no-payment.png",
  };
}
