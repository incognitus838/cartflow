/**
 * Generate vendor pitch PDF from markdown via Playwright.
 * Run: npm run docs:vendor-pitch-pdf
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = path.join(root, "notes", "vendor-pitch-faq.md");
const outPath = path.join(root, "notes", "CartFlow-Vendor-Pitch.pdf");

const ACCENT = "#1A7F5A";
const MUTED = "#6E6E73";
const TITLE = "Guide for Store Owners";
const SUBTITLE = "July 2026";

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function isTableRow(line) {
  return /^\|.+\|$/.test(line.trim());
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === "---") {
      parts.push("<hr />");
      i += 1;
      continue;
    }

    if (isTableRow(trimmed)) {
      const rows = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        if (!isTableSeparator(lines[i])) rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        parts.push("<table><thead><tr>");
        for (const cell of head) parts.push(`<th>${inlineMarkdown(cell)}</th>`);
        parts.push("</tr></thead><tbody>");
        for (const row of body) {
          parts.push("<tr>");
          for (const cell of row) parts.push(`<td>${inlineMarkdown(cell)}</td>`);
          parts.push("</tr>");
        }
        parts.push("</tbody></table>");
      }
      continue;
    }

    if (trimmed.startsWith("### ")) {
      parts.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      parts.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      parts.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      parts.push("<ul>");
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        parts.push(`<li>${inlineMarkdown(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      parts.push("</ul>");
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      parts.push("<ol>");
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        parts.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s*/, ""))}</li>`);
        i += 1;
      }
      parts.push("</ol>");
      continue;
    }

    parts.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    i += 1;
  }

  return parts.join("\n");
}

function buildHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CartFlow — Guide for Store Owners</title>
  <style>
    @page { size: A4; margin: 2cm 2.2cm; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #1d1d1f;
      margin: 0;
      padding: 0;
    }
    h1 { color: ${ACCENT}; font-size: 22pt; font-weight: 700; margin: 1.2em 0 0.4em; page-break-after: avoid; }
    h1:first-of-type { margin-top: 0; font-size: 26pt; }
    h2 { font-size: 14pt; font-weight: 700; margin: 1.2em 0 0.35em; page-break-after: avoid; color: #1d1d1f; }
    h3 { font-size: 11.5pt; font-weight: 700; margin: 0.9em 0 0.3em; page-break-after: avoid; }
    p { margin: 0.5em 0; }
    a { color: ${ACCENT}; text-decoration: none; word-break: break-all; }
    table { width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 9.5pt; page-break-inside: avoid; }
    th, td { border: 1px solid #ccc; padding: 0.4em 0.55em; text-align: left; vertical-align: top; }
    th { background: #e8f5ee; font-weight: 700; }
    tr:nth-child(even) td { background: #fafafa; }
    hr { border: none; border-top: 1px solid #ddd; margin: 1.2em 0; }
    ul, ol { margin: 0.45em 0; padding-left: 1.4em; }
    li { margin: 0.18em 0; }
    code { font-family: Consolas, monospace; font-size: 9pt; background: #f4f4f4; padding: 0.1em 0.3em; border-radius: 3px; }
    .callout {
      background: #f0faf5;
      border-left: 4px solid ${ACCENT};
      padding: 0.75em 1em;
      margin: 1em 0;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${body}
  <p style="margin-top:2em;padding-top:1em;border-top:1px solid #ddd;font-size:9pt;color:${MUTED};">
    CartFlow — <a href="https://cartflow-839.vercel.app">https://cartflow-839.vercel.app</a> · Sign up: <a href="https://cartflow-839.vercel.app/signup">/signup</a> · Demo: <a href="https://cartflow-839.vercel.app/glow-beauty">/glow-beauty</a>
  </p>
</body>
</html>`;
}

const markdown = fs.readFileSync(mdPath, "utf8");
const body = markdownToHtml(markdown);
const html = buildHtml(body);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "2cm", right: "2cm", bottom: "2.2cm", left: "2cm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 2cm;color:#6E6E73;display:flex;justify-content:space-between;">
      <span style="color:#1A7F5A;font-weight:bold;">CartFlow ${TITLE}</span>
      <span>${SUBTITLE}</span>
    </div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;padding:0 2cm;color:#6E6E73;text-align:center;">
      cartflow-839.vercel.app · Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`,
  });
} finally {
  await browser.close();
}

const { size } = fs.statSync(outPath);
console.log(`Wrote ${outPath} (${size} bytes)`);