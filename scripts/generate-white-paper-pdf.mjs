/**
 * Generate CartFlow white paper PDF from markdown via Playwright.
 * Run: node scripts/generate-white-paper-pdf.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = path.join(root, "notes", "cartflow-white-paper.md");
const outPath = path.join(root, "notes", "CartFlow-White-Paper.pdf");

const ACCENT = "#1A7F5A";
const MUTED = "#6E6E73";

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
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>',
  );
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

    if (trimmed.startsWith("```")) {
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i += 1;
      }
      parts.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      i += 1;
      continue;
    }

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableRow(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      const thead = `<thead><tr>${headers.map((h) => `<th>${inlineMarkdown(h)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      parts.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      parts.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      parts.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      parts.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      parts.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      parts.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const paragraph = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current === "---" ||
        current.startsWith("#") ||
        current.startsWith("```") ||
        isTableRow(current) ||
        /^\d+\.\s/.test(current) ||
        /^[-*]\s/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    parts.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return parts.join("\n");
}

function buildHtml(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CartFlow White Paper</title>
  <style>
    @page {
      margin: 2cm 2.2cm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid ${ACCENT};
      padding-bottom: 0.35em;
      margin-bottom: 1.5em;
      font-size: 9pt;
      color: ${MUTED};
    }

    .page-header strong {
      color: ${ACCENT};
      font-size: 10pt;
    }

    h1 {
      color: ${ACCENT};
      font-size: 22pt;
      font-weight: 700;
      margin: 1.4em 0 0.45em;
      page-break-after: avoid;
    }

    h1:first-of-type {
      margin-top: 0;
      font-size: 28pt;
      border-bottom: none;
    }

    h2 {
      font-size: 15pt;
      font-weight: 700;
      margin: 1.3em 0 0.4em;
      page-break-after: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      margin: 1em 0 0.35em;
      page-break-after: avoid;
    }

    p {
      margin: 0.55em 0;
    }

    .subtitle {
      font-size: 13pt;
      font-style: italic;
      color: ${MUTED};
      margin: 0.25em 0 1.25em;
    }

    a {
      color: ${ACCENT};
      text-decoration: none;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }

    th,
    td {
      border: 1px solid #cccccc;
      padding: 0.45em 0.65em;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #e8f5ee;
      font-weight: 700;
    }

    tr:nth-child(even) td {
      background: #fafafa;
    }

    hr {
      border: none;
      border-top: 1px solid #dddddd;
      margin: 1.4em 0;
    }

    ul,
    ol {
      margin: 0.55em 0;
      padding-left: 1.5em;
    }

    li {
      margin: 0.2em 0;
    }

    code {
      font-family: Consolas, "Courier New", monospace;
      font-size: 9.5pt;
      background: #f4f4f4;
      padding: 0.1em 0.35em;
      border-radius: 3px;
    }

    pre {
      background: #f4f4f4;
      border: 1px solid #dddddd;
      border-left: 4px solid ${ACCENT};
      padding: 0.85em 1em;
      font-size: 9pt;
      line-height: 1.45;
      overflow-x: auto;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-break: break-word;
    }

    pre code {
      background: none;
      padding: 0;
    }

    .footer-note {
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid #dddddd;
      font-size: 9pt;
      color: ${MUTED};
    }
  </style>
</head>
<body>
  <div class="page-header">
    <strong>CartFlow White Paper</strong>
    <span>July 2026 · v1.0</span>
  </div>
  ${body}
  <div class="footer-note">
    CartFlow — <a href="https://cartflow-839.vercel.app">https://cartflow-839.vercel.app</a>
  </div>
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
    margin: { top: "2cm", right: "2.2cm", bottom: "2.2cm", left: "2.2cm" },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 2.2cm;color:#6E6E73;display:flex;justify-content:space-between;">
      <span style="color:#1A7F5A;font-weight:bold;">CartFlow White Paper</span>
      <span>July 2026 · v1.0</span>
    </div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;padding:0 2.2cm;color:#6E6E73;text-align:center;">
      CartFlow — https://cartflow-839.vercel.app · Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`,
  });
} finally {
  await browser.close();
}

const { size } = fs.statSync(outPath);
console.log(`Wrote ${outPath} (${size} bytes)`);