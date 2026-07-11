import { NextResponse } from "next/server";
import { requireApprovedStore } from "@/lib/api/require-business";
import { createProductMediaAsset } from "@/lib/products/media-storage";
import { parseProductMediaFile } from "@/lib/uploads/product-media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireApprovedStore();
  if (auth.error) return auth.error;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  try {
    const parsed = await parseProductMediaFile(file);
    const asset = await createProductMediaAsset(auth.business.id, parsed);

    return NextResponse.json({
      url: asset.url,
      mediaType: asset.mediaType,
      assetId: asset.id ?? undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message.includes("Choose") || message.includes("Upload") || message.includes("under")
      ? 400
      : 500;

    return NextResponse.json(
      {
        error:
          status === 500
            ? `${message} Paste an image URL instead, or try again.`
            : message,
      },
      { status },
    );
  }
}