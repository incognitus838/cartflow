import "server-only";

import { prisma } from "@/lib/db";

export type AdminJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type AdminJobRecord = {
  id: string;
  type: string;
  status: AdminJobStatus;
  createdById: string;
  payload: unknown;
  total: number;
  processed: number;
  success: number;
  failed: number;
  errors: string[];
  createdAt: Date;
  updatedAt: Date;
};

/** In-process fallback when AdminJob table is unavailable. */
const memoryJobs = new Map<string, AdminJobRecord>();

function memoryId() {
  return `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function cuidLike() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

async function tableReady(): Promise<boolean> {
  try {
    await prisma.$queryRawUnsafe(`SELECT 1 FROM "cartflow"."AdminJob" LIMIT 1`);
    return true;
  } catch {
    return false;
  }
}

export async function createAdminJob(input: {
  type: string;
  createdById: string;
  payload: unknown;
  total: number;
}): Promise<AdminJobRecord> {
  const now = new Date();

  if (await tableReady()) {
    const id = cuidLike();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "cartflow"."AdminJob"
        ("id","type","status","createdById","payload","total","processed","success","failed","errors","createdAt","updatedAt")
       VALUES ($1,$2,'PENDING',$3,$4::jsonb,$5,0,0,0,'[]'::jsonb,$6,$6)`,
      id,
      input.type,
      input.createdById,
      JSON.stringify(input.payload),
      input.total,
      now,
    );
    return {
      id,
      type: input.type,
      status: "PENDING",
      createdById: input.createdById,
      payload: input.payload,
      total: input.total,
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  const job: AdminJobRecord = {
    id: memoryId(),
    type: input.type,
    status: "PENDING",
    createdById: input.createdById,
    payload: input.payload,
    total: input.total,
    processed: 0,
    success: 0,
    failed: 0,
    errors: [],
    createdAt: now,
    updatedAt: now,
  };
  memoryJobs.set(job.id, job);
  return job;
}

export async function getAdminJob(id: string): Promise<AdminJobRecord | null> {
  if (await tableReady()) {
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        type: string;
        status: string;
        createdById: string;
        payload: unknown;
        total: number;
        processed: number;
        success: number;
        failed: number;
        errors: unknown;
        createdAt: Date;
        updatedAt: Date;
      }>
    >(
      `SELECT "id","type","status","createdById","payload","total","processed","success","failed","errors","createdAt","updatedAt"
       FROM "cartflow"."AdminJob" WHERE "id" = $1 LIMIT 1`,
      id,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      type: row.type,
      status: row.status as AdminJobStatus,
      createdById: row.createdById,
      payload: row.payload,
      total: row.total,
      processed: row.processed,
      success: row.success,
      failed: row.failed,
      errors: Array.isArray(row.errors) ? (row.errors as string[]) : [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
  return memoryJobs.get(id) ?? null;
}

export async function updateAdminJob(
  id: string,
  patch: Partial<
    Pick<
      AdminJobRecord,
      "status" | "processed" | "success" | "failed" | "errors" | "total"
    >
  >,
) {
  if (await tableReady()) {
    const sets: string[] = [`"updatedAt" = CURRENT_TIMESTAMP`];
    const vals: unknown[] = [];
    let i = 1;

    if (patch.status !== undefined) {
      sets.push(`"status" = $${i++}`);
      vals.push(patch.status);
    }
    if (patch.processed !== undefined) {
      sets.push(`"processed" = $${i++}`);
      vals.push(patch.processed);
    }
    if (patch.success !== undefined) {
      sets.push(`"success" = $${i++}`);
      vals.push(patch.success);
    }
    if (patch.failed !== undefined) {
      sets.push(`"failed" = $${i++}`);
      vals.push(patch.failed);
    }
    if (patch.total !== undefined) {
      sets.push(`"total" = $${i++}`);
      vals.push(patch.total);
    }
    if (patch.errors !== undefined) {
      sets.push(`"errors" = $${i++}::jsonb`);
      vals.push(JSON.stringify(patch.errors));
    }
    vals.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE "cartflow"."AdminJob" SET ${sets.join(", ")} WHERE "id" = $${i}`,
      ...vals,
    );
    return;
  }

  const job = memoryJobs.get(id);
  if (!job) return;
  Object.assign(job, patch, { updatedAt: new Date() });
  memoryJobs.set(id, job);
}
