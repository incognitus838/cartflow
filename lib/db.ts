import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

type PrismaGlobal = {
  prisma?: PrismaClient;
  prismaFingerprint?: string;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

/** Resolve DB URL from Vercel/Neon integration vars or explicit DATABASE_URL. */
export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

function getPrismaFingerprint() {
  try {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
    const client = readFileSync(
      join(process.cwd(), "node_modules/.prisma/client/index.js"),
      "utf8",
    );
    return createHash("sha256").update(schema).update(client).digest("hex");
  } catch {
    return "unknown";
  }
}

function createPrismaClient() {
  const url = getDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

const fingerprint = getPrismaFingerprint();

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaFingerprint !== fingerprint
) {
  void globalForPrisma.prisma.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
      globalForPrisma.prismaFingerprint = fingerprint;
    }
    return client;
  })();

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}