import type { Decimal } from "@prisma/client/runtime/library";

export type NumericInput = Decimal | number | { toString(): string } | null | undefined;

export function toNumber(value: NumericInput) {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}