import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api/require-business";
import { maskBusinessBankDetails } from "@/lib/business/mask-sensitive";
import {
  parseBusinessSettingsInput,
  updateBusinessSettings,
} from "@/lib/business/settings";

export const runtime = "nodejs";

function serializeBusinessSettings(
  business: Awaited<ReturnType<typeof updateBusinessSettings>>,
  canViewBank: boolean,
) {
  const masked = maskBusinessBankDetails(business, canViewBank);
  return {
    id: masked.id,
    name: masked.name,
    slug: masked.slug,
    description: masked.description,
    currency: masked.currency,
    deliveryFee: Number(masked.deliveryFee),
    logoUrl: masked.logoUrl,
    phone: masked.phone,
    whatsapp: masked.whatsapp,
    autoDeductInventory: masked.autoDeductInventory,
    notifyOnNewOrder: masked.notifyOnNewOrder,
    notifyCustomerOnStatus: masked.notifyCustomerOnStatus,
    ownerNotifyEmail: masked.ownerNotifyEmail,
    bankName: masked.bankName,
    bankAccountName: masked.bankAccountName,
    bankAccountNumber: masked.bankAccountNumber,
  };
}

export async function GET() {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const { business } = auth;
  const canViewBank = auth.permissions.settings;

  return NextResponse.json({
    business: serializeBusinessSettings(business, canViewBank),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("settings");
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseBusinessSettingsInput(body);

  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const business = await updateBusinessSettings(auth.business.id, parsed);
    return NextResponse.json({
      business: serializeBusinessSettings(business, true),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save settings." },
      { status: 400 },
    );
  }
}