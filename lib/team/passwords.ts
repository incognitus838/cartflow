import "server-only";

import { randomBytes } from "crypto";

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Readable random password for staff handoff (no ambiguous 0/O, 1/l). */
export function generateTeamPassword(length = 12) {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += PASSWORD_CHARS[bytes[i]! % PASSWORD_CHARS.length];
  }
  return result;
}