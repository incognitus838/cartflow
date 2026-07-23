/**
 * Send a test transactional email (Resend or ZeptoMail).
 *
 * Usage:
 *   npm run test:email -- you@example.com
 *
 * Env (.env.local):
 *   EMAIL_PROVIDER=resend
 *   RESEND_API_KEY=re_...
 *   TRANSACTIONAL_FROM_EMAIL=CartFlow <hello@cartflow.com.ng>
 *   NOTIFICATION_FROM_EMAIL=CartFlow Orders <orders@cartflow.com.ng>
 *
 * Until your domain is verified on Resend, use:
 *   TRANSACTIONAL_FROM_EMAIL=CartFlow <onboarding@resend.dev>
 * and only send TO your own Resend account email.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function resolveProvider(env) {
  const explicit = env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (explicit === "resend" || explicit === "zeptomail") return explicit;
  if (env.RESEND_API_KEY?.trim()) return "resend";
  if (env.ZEPTOMAIL_SEND_TOKEN?.trim()) return "zeptomail";
  return null;
}

function parseFromAddress(formatted, fallbackName) {
  const match = formatted.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { name: match[1].trim(), address: match[2].trim() };
  return { name: fallbackName, address: formatted.trim() };
}

const env = {
  ...loadEnvFile(resolve(process.cwd(), ".env.local")),
  ...process.env,
};

const to = process.argv[2]?.trim() || env.EMAIL_TEST_TO?.trim();
const provider = resolveProvider(env);
const appUrl = (env.NEXT_PUBLIC_APP_URL || "https://cartflow.com.ng").replace(/\/$/, "");
const fromRaw =
  env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
  env.NOTIFICATION_FROM_EMAIL?.trim() ||
  "CartFlow <hello@cartflow.com.ng>";

if (!to || !to.includes("@")) {
  console.error("Usage: npm run test:email -- you@example.com");
  process.exit(1);
}

if (!provider) {
  console.error("No email provider configured.");
  console.error("Add to .env.local:");
  console.error('  EMAIL_PROVIDER=resend');
  console.error('  RESEND_API_KEY=re_xxxxxxxx');
  console.error('  TRANSACTIONAL_FROM_EMAIL="CartFlow <onboarding@resend.dev>"');
  process.exit(1);
}

const subject = `CartFlow — ${provider} test`;
const html = `<div style="font-family:system-ui,sans-serif;line-height:1.55;color:#1d1d1f;max-width:520px">
  <p style="font-size:15px;margin:0 0 12px">CartFlow email is working via <strong>${provider}</strong>.</p>
  <p style="font-size:14px;color:#6e6e73;margin:0 0 16px">App: <a href="${appUrl}">${appUrl}</a></p>
  <p style="font-size:13px;color:#86868b;margin:0">If you received this, transactional mail is ready for signup, approvals, and invites.</p>
</div>`;
const text = `CartFlow email is working via ${provider}. App: ${appUrl}`;

console.log(`Provider: ${provider}`);
console.log(`To:       ${to}`);
console.log(`From:     ${fromRaw}`);
console.log("Sending…\n");

let res;
let data;

if (provider === "resend") {
  const apiKey = env.RESEND_API_KEY.trim();
  res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromRaw.includes("<") ? fromRaw : `CartFlow <${fromRaw}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  });
  data = await res.json().catch(() => ({}));
} else {
  const token = env.ZEPTOMAIL_SEND_TOKEN.trim();
  const from = parseFromAddress(fromRaw, "CartFlow");
  res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify({
      from: { address: from.address, name: from.name },
      to: [{ email_address: { address: to, name: to.split("@")[0] } }],
      subject,
      htmlbody: html,
      track_clicks: false,
      track_opens: false,
    }),
  });
  data = await res.json().catch(() => ({}));
}

if (!res.ok) {
  console.error("Failed:", res.status);
  console.error(JSON.stringify(data, null, 2));
  if (provider === "resend") {
    console.error("\nCommon fixes:");
    console.error("  • Use onboarding@resend.dev until cartflow.com.ng is verified");
    console.error("  • Free tier: can only send to your Resend account email until domain is verified");
    console.error("  • Domain DNS: https://resend.com/domains");
  }
  process.exit(1);
}

console.log("Sent successfully.");
console.log(JSON.stringify(data, null, 2));
