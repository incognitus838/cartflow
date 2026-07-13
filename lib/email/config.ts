import "server-only";
import { getAppBaseUrl } from "@/lib/storefront/paths";

export function getAppUrl() {
  return getAppBaseUrl();
}

export type EmailProvider = "zeptomail" | "resend";

export function getEmailProvider(): EmailProvider | null {
  const explicit = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (explicit === "zeptomail" || explicit === "resend") return explicit;
  if (process.env.ZEPTOMAIL_SEND_TOKEN?.trim()) return "zeptomail";
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  return null;
}

export function isEmailConfigured() {
  return getEmailProvider() !== null;
}

/** Order / receipt notifications */
export function getNotificationFromEmail() {
  const raw = process.env.NOTIFICATION_FROM_EMAIL?.trim();
  if (raw) return formatFromAddress(raw, "CartFlow Orders");
  return "CartFlow Orders <orders@cartflow.com.ng>";
}

/** Account, onboarding, team invites, approvals */
export function getTransactionalFromEmail() {
  const raw =
    process.env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
    process.env.NOTIFICATION_FROM_EMAIL?.trim();
  if (raw) return formatFromAddress(raw, "CartFlow");
  return "CartFlow <hello@cartflow.com.ng>";
}

export function formatFromAddress(email: string, displayName: string) {
  if (email.includes("<")) return email;
  return `${displayName} <${email}>`;
}

export function parseFromAddress(formatted: string): { address: string; name: string } {
  const match = formatted.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), address: match[2].trim() };
  }
  return { name: "CartFlow", address: formatted.trim() };
}