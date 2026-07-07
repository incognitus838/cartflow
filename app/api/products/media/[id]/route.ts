import { NextResponse } from "next/server";
import {
  buildProductMediaResponse,
  getProductMediaAsset,
} from "@/lib/products/media-storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/** GET — stream product media bytes from the database (works on Vercel). */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const asset = await getProductMediaAsset(id);

  if (!asset) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const response = buildProductMediaResponse(asset);
  if (!response) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  return response;
}