import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        database: "not_configured",
        message: "Set DATABASE_URL (or connect Neon on Vercel → Storage)",
      },
      { status: 503 },
    );
  }

  try {
    const [userCount, businessCount, productCount] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: { users: userCount, businesses: businessCount, products: productCount },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 },
    );
  }
}