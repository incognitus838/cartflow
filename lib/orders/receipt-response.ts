export function buildReceiptResponse(order: {
  paymentReceiptData: Uint8Array | Buffer | null;
  paymentReceiptMimeType: string | null;
  paymentReceiptFilename: string | null;
}) {
  if (!order.paymentReceiptData || order.paymentReceiptData.byteLength === 0) {
    return null;
  }

  const mimeType = order.paymentReceiptMimeType ?? "application/octet-stream";
  const filename = order.paymentReceiptFilename ?? "payment-receipt";
  const body = Buffer.from(order.paymentReceiptData);

  return new Response(body, {
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}