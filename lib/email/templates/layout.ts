import { getAppUrl } from "@/lib/email/config";

type EmailLayoutInput = {
  preview: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function renderEmailLayout(input: EmailLayoutInput) {
  const appUrl = getAppUrl();
  const ctaBlock = input.cta
    ? `<p style="margin:28px 0 0;">
        <a href="${escapeAttr(input.cta.href)}"
           style="display:inline-block;background:#1d1d1f;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">
          ${escapeHtml(input.cta.label)}
        </a>
      </p>`
    : "";

  const footer = input.footerNote
    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#86868b;">${escapeHtml(input.footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.02em;color:#b8956a;">CartFlow</p>
              <h1 style="margin:12px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#1d1d1f;">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-size:14px;line-height:1.65;color:#6e6e73;">
              ${input.bodyHtml}
              ${ctaBlock}
              ${footer}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#86868b;">
          <a href="${escapeAttr(appUrl)}" style="color:#86868b;text-decoration:underline;">${escapeHtml(appUrl)}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

export function paragraph(text: string) {
  return `<p style="margin:0 0 14px;">${escapeHtml(text)}</p>`;
}

export function bulletList(items: string[]) {
  const rows = items.map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`).join("");
  return `<ul style="margin:0 0 14px;padding-left:20px;color:#6e6e73;">${rows}</ul>`;
}