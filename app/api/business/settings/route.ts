import { NextResponse } from "next/server";
import { requireApiStoreOwner } from "@/lib/api/require-business";
import {
  parseBusinessSettingsInput,
  updateBusinessSettings,
} from "@/lib/business/settings";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const { business } = auth;

  return NextResponse.json({
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description,
      currency: business.currency,
      deliveryFee: Number(business.deliveryFee),
      logoUrl: business.logoUrl,
      phone: business.phone,
      whatsapp: business.whatsapp,
      autoDeductInventory: business.autoDeductInventory,
      notifyOnNewOrder: business.notifyOnNewOrder,
      notifyCustomerOnStatus: business.notifyCustomerOnStatus,
      ownerNotifyEmail: business.ownerNotifyEmail,
      bankName: business.bankName,
      bankAccountName: business.bankAccountName,
      bankAccountNumber: business.bankAccountNumber,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiStoreOwner();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseBusinessSettingsInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const business = await updateBusinessSettings(auth.business.id, parsed);
    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        currency: business.currency,
        deliveryFee: Number(business.deliveryFee),
        logoUrl: business.logoUrl,
        phone: business.phone,
        whatsapp: business.whatsapp,
        autoDeductInventory: business.autoDeductInventory,
        notifyOnNewOrder: business.notifyOnNewOrder,
        notifyCustomerOnStatus: business.notifyCustomerOnStatus,
        ownerNotifyEmail: business.ownerNotifyEmail,
        bankName: business.bankName,
        bankAccountName: business.bankAccountName,
        bankAccountNumber: business.bankAccountNumber,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save settings." },
      { status: 400 },
    );
  }
}