import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/api/require-business";
import {
  applyTemplateToSettings,
  parseCatalogSettings,
  resolveCatalogSettings,
  saveCatalogSettings,
  type CatalogSettings,
} from "@/lib/catalog/settings";

export const runtime = "nodejs";

function parseCatalogBody(body: unknown): CatalogSettings | string {
  if (!body || typeof body !== "object") return "Invalid request body.";
  const data = body as Record<string, unknown>;

  if (typeof data.applyTemplate === "string") {
    return data.applyTemplate;
  }

  return parseCatalogSettings(data);
}

export async function GET() {
  const auth = await requireApiPermission("catalog");
  if (auth.error) return auth.error;

  const settings = await resolveCatalogSettings(auth.business.id);
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const auth = await requireApiPermission("catalog");
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = parseCatalogBody(body);

  if (typeof parsed === "string") {
    if (parsed === "Invalid request body.") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const current = await resolveCatalogSettings(auth.business.id);
    const merged = applyTemplateToSettings(current, parsed);
    if (typeof merged === "string") {
      return NextResponse.json({ error: merged }, { status: 400 });
    }

    try {
      const settings = await saveCatalogSettings(auth.business.id, merged);
      return NextResponse.json({ settings });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not apply template." },
        { status: 400 },
      );
    }
  }

  try {
    const settings = await saveCatalogSettings(auth.business.id, parsed);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save catalog." },
      { status: 400 },
    );
  }
}