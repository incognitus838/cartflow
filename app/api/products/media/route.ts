import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireApiBusiness } from "@/lib/api/require-business";
import { detectMediaType } from "@/lib/media";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

export async function POST(request: Request) {
  const auth = await requireApiBusiness();
  if (auth.error) return auth.error;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Upload JPG, PNG, WebP, GIF, MP4, or WebM." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 8 MB." }, { status: 400 });
  }

  try {
    const ext = extensionFor(file.type);
    const filename = `${auth.business.id}-${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/products/${filename}`;
    return NextResponse.json({
      url,
      mediaType: detectMediaType(url),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Paste an image URL instead, or try again.",
      },
      { status: 500 },
    );
  }
}

function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}