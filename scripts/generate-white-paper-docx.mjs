/**
 * Generate CartFlow white paper as Word document.
 * Run: node scripts/generate-white-paper-docx.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ShadingType,
} from "docx";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "notes", "CartFlow-White-Paper.docx");

const ACCENT = "1A7F5A";
const MUTED = "6E6E73";
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, size: 22, ...opts })],
  });
}
function bullet(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })],
  });
}
function link(text, url) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text, style: "Hyperlink", size: 22 })],
      }),
    ],
  });
}

function table(headers, rows) {
  const colWidth = Math.floor(9360 / headers.length);
  const columnWidths = headers.map(() => colWidth);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              borders: BORDERS,
              width: { size: colWidth, type: WidthType.DXA },
              shading: { fill: "E8F5EE", type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
            }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  borders: BORDERS,
                  width: { size: colWidth, type: WidthType.DXA },
                  margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
                }),
            ),
          }),
      ),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "CartFlow White Paper", bold: true, size: 18, color: ACCENT }),
                new TextRun({ text: "\tJuly 2026 · v1.0", size: 18, color: MUTED }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "CartFlow — ", size: 18, color: MUTED }),
                new TextRun({ text: "https://cartflow-839.vercel.app", size: 18, color: ACCENT }),
                new TextRun({ text: "   |   Page ", size: 18, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "CartFlow", size: 56, bold: true, color: ACCENT }),
          ],
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: "Social commerce for WhatsApp sellers — storefront, orders, and inventory in one link.",
              size: 26,
              italics: true,
              color: MUTED,
            }),
          ],
        }),

        h1("Executive Summary"),
        p(
          "CartFlow is a mobile-first social commerce platform for entrepreneurs who sell through WhatsApp, Instagram DMs, and word of mouth — especially in Nigeria and across Africa. Sellers get a polished storefront URL, structured checkout, and a dashboard to approve payments, fulfill orders, and manage stock.",
        ),
        p(
          "v1 is launch-ready. Payment is via manual bank transfer: customers upload a receipt at checkout; sellers approve or decline in the dashboard. Inventory deducts on approval and restores on refund. Store and bank details are database-backed.",
        ),
        p(
          "Email and SMS notifications are planned for v2. In v1, sellers monitor the dashboard and follow up with customers on WhatsApp.",
        ),

        h1("1. The Problem"),
        p(
          "Chat selling breaks at scale: receipts get lost, stock is guessed, and the brand looks informal. CartFlow replaces scattered DMs with one store link and a shared source of truth for products, orders, payments, and inventory.",
        ),

        h1("2. The Solution"),
        table(
          ["Layer", "Purpose"],
          [
            ["Storefront", "Public catalog at cartflow.app/your-shop"],
            ["Cart & checkout", "Guest checkout, zones, promos, bank transfer + receipt"],
            ["Seller dashboard", "Orders, payment review, products, analytics, settings"],
            ["Admin console", "Approvals, plans, platform metrics, support impersonation"],
          ],
        ),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        p("Core v1 flow: Share link → Browse → Checkout → Bank transfer + receipt → Seller approves → Paid → Fulfill → Track."),

        h1("3. Who It Is For"),
        bullet("bullets", "WhatsApp and social sellers: beauty, fashion, food, gadgets, digital, services"),
        bullet("bullets", "Sellers who want a professional link without custom development"),
        bullet("bullets", "Small teams (1–5 people) fulfilling orders daily"),
        bullet("bullets", "CartFlow admins onboarding and supporting sellers"),

        h1("4. Platform Capabilities"),
        h2("Storefront"),
        bullet("bullets", "Custom URL, logo, theme, product grid and detail pages"),
        bullet("bullets", "WhatsApp contact button from seller settings"),
        bullet("bullets", "Order tracking page per store"),

        h2("Catalog types"),
        table(
          ["Type", "Use case", "Variant label"],
          [
            ["Online store", "Gadgets, personal brands", "Model"],
            ["Digital store", "Courses, ebooks", "Module"],
            ["Services", "Consulting, bookings", "Package"],
            ["Retail", "Fashion, home goods", "Size"],
            ["Food & drinks", "Meals, groceries", "Weight"],
          ],
        ),
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        h2("Seller dashboard"),
        bullet("bullets", "Overview KPIs: orders, revenue, awaiting approval, low stock"),
        bullet("bullets", "Orders: approve / decline / refund payments; update status"),
        bullet("bullets", "Products, promotions, analytics, storefront editor"),
        bullet("bullets", "Settings: profile, contact, bank details, delivery zones, team"),

        h1("5. How to Use — Sellers"),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Sign up at cartflow-839.vercel.app/signup", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "Complete onboarding: store name, slug, phone, WhatsApp, bank details",
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Wait for admin approval", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Add products (Dashboard → Products)", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "Configure Settings: bank transfer details, delivery zones, inventory",
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Share your store URL on WhatsApp and social", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: "Fulfill orders: review receipts → Approve → ship → update status",
              size: 22,
            }),
          ],
        }),

        h3("Order payment review"),
        bullet("bullets", "Pending = customer placed order, receipt uploaded"),
        bullet("bullets", "Approve = payment confirmed, stock deducts (if enabled)"),
        bullet("bullets", "Decline = invalid receipt"),
        bullet("bullets", "Refund = reverse paid order, stock restored"),

        h1("6. How to Use — Customers"),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Open the seller's store link", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Add items to bag → Checkout", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "Enter details, select delivery zone, read bank transfer instructions",
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Transfer exact total; upload payment receipt", size: 22 })],
        }),
        new Paragraph({
          numbering: { reference: "numbers", level: 0 },
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: "Save order number; track at /your-shop/track",
              size: 22,
            }),
          ],
        }),

        h1("7. How to Use — Admins"),
        p("Admin panel: cartflow-839.vercel.app/admin"),
        bullet("bullets", "Review and approve new stores with plan assignment"),
        bullet("bullets", "Reject incomplete applications"),
        bullet("bullets", "View platform analytics and orders"),
        bullet("bullets", "Impersonate sellers for support"),

        h1("8. Plans"),
        table(
          ["Plan", "Price", "Highlights"],
          [
            ["Free", "₦0", "10 products, store link, orders, manual transfer"],
            ["Starter", "₦4,999/mo", "Unlimited products, analytics, low-stock alerts"],
            ["Pro", "₦12,999/mo", "Extended analytics, 5 team seats, email support"],
          ],
        ),
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        p("Plan changes are assigned by CartFlow admins in v1. Sellers view plan at Dashboard → Billing."),

        h1("9. v1 Limitations & v2"),
        table(
          ["Area", "v1", "v2"],
          [
            ["Notifications", "Manual / dashboard", "Resend email, SMS"],
            ["Payments", "Manual bank transfer", "Paystack, Flutterwave"],
            ["Billing", "Admin-assigned plans", "Self-serve upgrade"],
            ["Domain", "cartflow.app/slug", "Custom domain"],
          ],
        ),
        new Paragraph({ spacing: { after: 200 }, children: [] }),

        h1("10. Getting Started"),
        link("Live app", "https://cartflow-839.vercel.app"),
        link("Sign up", "https://cartflow-839.vercel.app/signup"),
        link("Demo store (after seed)", "https://cartflow-839.vercel.app/ada-styles"),
        p("Demo seller (local seed): demo@cartflow.app"),

        h1("Conclusion"),
        p(
          "CartFlow turns informal chat selling into a repeatable, trackable operation. v1 ships today with manual bank transfer and dashboard fulfillment. Automated notifications and integrated payments follow in v2.",
        ),
        new Paragraph({
          spacing: { before: 240 },
          children: [
            new TextRun({
              text: "CartFlow — Effortless commerce. Timeless elegance.",
              bold: true,
              size: 24,
              color: ACCENT,
            }),
          ],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath}`);