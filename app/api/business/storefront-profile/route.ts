import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import {
  parseStorefrontProfileInput,
  toStorefrontProfile,
  updateStorefrontProfile,
} from "@/lib/business/storefront-profile";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { business } = auth;

  return NextResponse.json({
    profile: toStorefrontProfile(business),
    store: {
      name: business.name,
      slug: business.slug,
      description: business.description,
      logoUrl: business.logoUrl,
      phone: business.phone,
      whatsapp: business.whatsapp,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseStorefrontProfileInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const business = await updateStorefrontProfile(auth.business.id, parsed);
  revalidateTag(`store-${business.slug}`, { expire: 0 });
  revalidateTag(`catalog-${business.id}`, { expire: 0 });

  return NextResponse.json({
    profile: toStorefrontProfile(business),
    store: {
      name: business.name,
      slug: business.slug,
      description: business.description,
      logoUrl: business.logoUrl,
      phone: business.phone,
      whatsapp: business.whatsapp,
    },
  });
}