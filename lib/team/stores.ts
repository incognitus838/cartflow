import "server-only";

import { prisma } from "@/lib/db";

export type AccessibleStore = {
  id: string;
  name: string;
  slug: string;
  access: "owner" | "staff";
  accessPreset: string | null;
};

export async function listAccessibleStores(userId: string): Promise<AccessibleStore[]> {
  const [owned, memberships] = await Promise.all([
    prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.businessMember.findMany({
      where: { userId, isSuspended: false, role: "STAFF" },
      include: {
        business: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const stores: AccessibleStore[] = owned.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    access: "owner" as const,
    accessPreset: null,
  }));

  for (const membership of memberships) {
    if (!stores.some((s) => s.id === membership.business.id)) {
      stores.push({
        id: membership.business.id,
        name: membership.business.name,
        slug: membership.business.slug,
        access: "staff",
        accessPreset: membership.accessPreset,
      });
    }
  }

  return stores;
}