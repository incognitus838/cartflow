import "server-only";

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001").replace(/\/$/, "");
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Order / receipt notifications */
export function getNotificationFromEmail() {
  const raw = process.env.NOTIFICATION_FROM_EMAIL?.trim();
  if (raw) return formatFromAddress(raw, "CartFlow Orders");
  return "CartFlow Orders <orders@cartflow.app>";
}

/** Account, onboarding, team invites, approvals */
export function getTransactionalFromEmail() {
  const raw =
    process.env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
    process.env.NOTIFICATION_FROM_EMAIL?.trim();
  if (raw) return formatFromAddress(raw, "CartFlow");
  return "CartFlow <hello@cartflow.app>";
}

function formatFromAddress(email: string, displayName: string) {
  if (email.includes("<")) return email;
  return `${displayName} <${email}>`;
}