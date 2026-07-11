export const LOGO_MAX_BYTES = 200 * 1024;
export const LOGO_MAX_LABEL = "200 KB";

export const LOGO_ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ParsedLogo = {
  data: Buffer;
  mimeType: string;
  filename: string;
};

export function extensionForLogoMime(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "img";
  }
}

function validateLogoBuffer(data: Buffer, mimeType: string) {
  if (!LOGO_ALLOWED_MIME.has(mimeType)) {
    throw new Error("Logo must be JPG, PNG, or WebP.");
  }
  if (data.byteLength === 0) {
    throw new Error("Choose an image to upload.");
  }
  if (data.byteLength > LOGO_MAX_BYTES) {
    throw new Error(`Logo must be under ${LOGO_MAX_LABEL}.`);
  }
}

export async function parseLogoFile(file: File): Promise<ParsedLogo> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image to upload.");
  }

  if (!LOGO_ALLOWED_MIME.has(file.type)) {
    throw new Error("Logo must be JPG, PNG, or WebP.");
  }

  if (file.size > LOGO_MAX_BYTES) {
    throw new Error(`Logo must be under ${LOGO_MAX_LABEL}.`);
  }

  const ext = extensionForLogoMime(file.type);
  const safeBase = (file.name || `logo.${ext}`)
    .replace(/[^\w.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return {
    data: Buffer.from(await file.arrayBuffer()),
    mimeType: file.type,
    filename: safeBase || `logo.${ext}`,
  };
}

export function parseLogoBase64(base64: string, mimeType: string): ParsedLogo {
  const trimmed = base64.trim();
  if (!trimmed) {
    throw new Error("Choose an image to upload.");
  }

  const normalizedMime = mimeType.trim().toLowerCase();
  let raw = trimmed;
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch) {
    raw = dataUrlMatch[2];
  }

  const data = Buffer.from(raw, "base64");
  validateLogoBuffer(data, normalizedMime);

  const ext = extensionForLogoMime(normalizedMime);
  return {
    data,
    mimeType: normalizedMime,
    filename: `logo.${ext}`,
  };
}