/**
 * Send a test email through ZeptoMail.
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- node scripts/test-zeptomail.mjs you@example.com
 *
 * Requires:
 *   ZEPTOMAIL_SEND_TOKEN
 *   TRANSACTIONAL_FROM_EMAIL (verified sender in your ZeptoMail Agent)
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
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

const token = env.ZEPTOMAIL_SEND_TOKEN?.trim();
const to = process.argv[2]?.trim() || env.ZEPTOMAIL_TEST_TO?.trim();
const fromRaw =
  env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
  env.NOTIFICATION_FROM_EMAIL?.trim() ||
  "hello@cartflow.com.ng";

if (!token) {
  console.error("Missing ZEPTOMAIL_SEND_TOKEN in .env.local");
  process.exit(1);
}

if (!to || !to.includes("@")) {
  console.error("Usage: node scripts/test-zeptomail.mjs recipient@example.com");
  process.exit(1);
}

const from = parseFromAddress(fromRaw, "CartFlow");
const appUrl = (env.NEXT_PUBLIC_APP_URL || "https://cartflow.com.ng").replace(/\/$/, "");

const body = {
  from: { address: from.address, name: from.name },
  to: [{ email_address: { address: to, name: to.split("@")[0] } }],
  subject: "CartFlow — ZeptoMail test",
  htmlbody: `<div style="font-family:system-ui,sans-serif;line-height:1.5;color:#1d1d1f">
    <p>ZeptoMail is configured for CartFlow.</p>
    <p>App URL: <a href="${appUrl}">${appUrl}</a></p>
  </div>`,
  track_clicks: false,
  track_opens: false,
};

console.log(`Sending test email to ${to} from ${from.name} <${from.address}>...`);

const res = await fetch("https://api.zeptomail.com/v1.1/email", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Zoho-enczapikey ${token}`,
  },
  body: JSON.stringify(body),
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Failed:", res.status, JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("Sent:", JSON.stringify(data, null, 2));