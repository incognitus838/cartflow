import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const b = await p.business.findUnique({ where: { slug: "glow-beauty" } });
const total = await p.product.count({ where: { businessId: b.id } });
const cats = await p.product.groupBy({
  by: ["category"],
  where: { businessId: b.id },
  _count: { id: true },
});
console.log("total:", total);
cats.sort((a, b) => a.category.localeCompare(b.category)).forEach((c) => {
  console.log(c.category, c._count.id);
});
await p.$disconnect();