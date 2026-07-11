import "server-only";

import { put } from "@vercel/blob";
import type { ParsedLogo } from "@/lib/uploads/logo";

function blobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function toDataUrl(logo: ParsedLogo) {
  return `data:${logo.mimeType};base64,${logo.data.toString("base64")}`;
}

export async function storeBusinessLogo(logo: ParsedLogo, slug?: string) {
  if (blobStorageEnabled()) {
    const pathname = `logos/${slug?.trim() || "stores"}/${Date.now()}-${logo.filename}`;
    const blob = await put(pathname, logo.data, {
      access: "public",
      contentType: logo.mimeType,
      addRandomSuffix: true,
    });
    return blob.url;
  }

  return toDataUrl(logo);
}