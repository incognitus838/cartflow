/**
 * Send a test email using the black-header React Email layout.
 * Usage: npm run test:email -- you@example.com
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { render } from "@react-email/render";
import { ConnectivityTestEmail } from "../emails/connectivity-test";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return {} as Record<string, string>;
  const vars: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[trimmed.slice(0, eq).trim()] = value;
  }
  return vars;
}

function resolveProvider(env: Record<string, string | undefined>) {
  const explicit = env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (explicit === "resend" || explicit === "zeptomail") return explicit;
  if (env.RESEND_API_KEY?.trim()) return "resend";
  if (env.ZEPTOMAIL_SEND_TOKEN?.trim()) return "zeptomail";
  return null;
}

const fileEnv = loadEnvFile(resolve(process.cwd(), ".env.local"));
const env = { ...fileEnv, ...process.env } as Record<string, string>;

const to = process.argv[2]?.trim() || env.EMAIL_TEST_TO?.trim();
const provider = resolveProvider(env);
const appUrl = (env.NEXT_PUBLIC_APP_URL || "https://cartflow.com.ng").replace(/\/$/, "");
const fromRaw =
  env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
  env.NOTIFICATION_FROM_EMAIL?.trim() ||
  "CartFlow <hello@cartflow.com.ng>";

async function main() {
  if (!to || !to.includes("@")) {
    console.error("Usage: npm run test:email -- you@example.com");
    process.exit(1);
  }
  if (!provider) {
    console.error("No email provider. Set RESEND_API_KEY and EMAIL_PROVIDER=resend.");
    process.exit(1);
  }

  const html = await render(ConnectivityTestEmail({ provider, appUrl }));
  const text = await render(ConnectivityTestEmail({ provider, appUrl }), {
    plainText: true,
  });
  const subject = `CartFlow — ${provider} test`;

  console.log(`Provider: ${provider}`);
  console.log(`To:       ${to}`);
  console.log(`From:     ${fromRaw}`);
  console.log("Sending black-header layout…\n");

  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY.trim()}`,
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
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Failed:", res.status, data);
      process.exit(1);
    }
    console.log("Sent:", data);
    return;
  }

  console.error("ZeptoMail path not used for React Email test — set EMAIL_PROVIDER=resend.");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
