import { storeBusinessLogo } from "@/lib/business/logo-storage";
import { parseLogoBase64 } from "@/lib/uploads/logo";

type LogoBody = {
  logoUrl?: unknown;
  logoBase64?: unknown;
  logoMimeType?: unknown;
};

function isExternalLogoUrl(value: string) {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("/api/") ||
    value.startsWith("data:image/")
  );
}

export async function resolveLogoFromBody(body: LogoBody | null, slug?: string) {
  if (!body) return undefined;

  const logoBase64 = typeof body.logoBase64 === "string" ? body.logoBase64.trim() : "";
  const logoMimeType = typeof body.logoMimeType === "string" ? body.logoMimeType.trim() : "";

  if (logoBase64 && logoMimeType) {
    const parsed = parseLogoBase64(logoBase64, logoMimeType);
    return storeBusinessLogo(parsed, slug);
  }

  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";
  if (logoUrl && isExternalLogoUrl(logoUrl)) {
    return logoUrl;
  }

  return undefined;
}