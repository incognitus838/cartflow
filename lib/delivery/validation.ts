export type DeliveryZoneInput = {
  name: string;
  fee: number;
  sortOrder?: number;
  isActive?: boolean;
};

export function parseDeliveryZoneInput(body: unknown): DeliveryZoneInput | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const fee = Number(data.fee);

  if (!name || name.length < 2) return "Zone name is required.";
  if (!Number.isFinite(fee) || fee < 0) return "Fee must be zero or greater.";

  const sortOrder =
    data.sortOrder === undefined || data.sortOrder === null
      ? undefined
      : Number(data.sortOrder);
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
    return "Sort order must be a non-negative integer.";
  }

  const isActive = data.isActive === undefined ? undefined : Boolean(data.isActive);

  return {
    name,
    fee,
    sortOrder,
    isActive,
  };
}

export function parseDeliveryZonePatch(body: unknown): Partial<DeliveryZoneInput> | string {
  if (!body || typeof body !== "object") return "Invalid request body.";

  const data = body as Record<string, unknown>;
  const patch: Partial<DeliveryZoneInput> = {};

  if (data.name !== undefined) {
    const name = typeof data.name === "string" ? data.name.trim() : "";
    if (!name || name.length < 2) return "Zone name is required.";
    patch.name = name;
  }

  if (data.fee !== undefined) {
    const fee = Number(data.fee);
    if (!Number.isFinite(fee) || fee < 0) return "Fee must be zero or greater.";
    patch.fee = fee;
  }

  if (data.sortOrder !== undefined) {
    const sortOrder = Number(data.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return "Sort order must be a non-negative integer.";
    }
    patch.sortOrder = sortOrder;
  }

  if (data.isActive !== undefined) {
    patch.isActive = Boolean(data.isActive);
  }

  if (Object.keys(patch).length === 0) return "No changes provided.";

  return patch;
}