import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [businesses, products, orders, users, mediaCount, mediaBytes] = await Promise.all([
    prisma.business.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.productMediaAsset.count().catch(() => 0),
    prisma.$queryRaw`
      SELECT COALESCE(SUM(octet_length("data")), 0)::bigint AS bytes
      FROM "cartflow"."ProductMediaAsset"
    `.catch(() => [{ bytes: 0n }]),
  ]);

  const [dbSize, schemaSize, receiptBytes, orderReceiptCount] = await Promise.all([
    prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) AS size`,
    prisma.$queryRaw`
      SELECT pg_size_pretty(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))) AS size
      FROM pg_tables WHERE schemaname = 'cartflow'
    `,
    prisma.$queryRaw`
      SELECT COALESCE(SUM(octet_length("paymentReceiptData")), 0)::bigint AS bytes
      FROM "cartflow"."Order" WHERE "paymentReceiptData" IS NOT NULL
    `,
    prisma.order.count({ where: { paymentReceiptData: { not: null } } }),
  ]);

  const mediaMb = Number(mediaBytes[0]?.bytes ?? 0) / (1024 * 1024);
  const receiptMb = Number(receiptBytes[0]?.bytes ?? 0) / (1024 * 1024);

  console.log(
    JSON.stringify(
      {
        database: dbSize[0]?.size,
        cartflowSchema: schemaSize[0]?.size,
        counts: { stores: businesses, products, orders, users, productMediaAssets: mediaCount, ordersWithReceipts: orderReceiptCount },
        storageInDb: {
          productMediaMb: mediaMb.toFixed(2),
          orderReceiptsMb: receiptMb.toFixed(2),
          totalBinaryMb: (mediaMb + receiptMb).toFixed(2),
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());