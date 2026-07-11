/**
 * Mobile viewport check: footer must not sit under sticky bottom bars.
 * Run: node scripts/check-mobile-footer.mjs [baseUrl]
 */
import { chromium, devices } from "playwright";

const BASE = (process.argv[2] || "https://cartflow-839.vercel.app").replace(/\/$/, "");
const STORE = "ace-shoppers";
const PRODUCT = "cmrgvire9000bl1040ca3w0pu";
const iPhone = devices["iPhone 13"];

async function footerClearance(page) {
  return page.evaluate(() => {
    const footer = document.querySelector("footer");
    if (!footer) return { ok: false, reason: "no footer" };

    const footerRect = footer.getBoundingClientRect();
    const footText = footer.querySelector("p");
    const textRect = footText?.getBoundingClientRect();

    const fixedEls = [...document.querySelectorAll("*")].filter((el) => {
      const s = getComputedStyle(el);
      return s.position === "fixed" && s.bottom !== "auto" && el.getBoundingClientRect().height > 0;
    });

    let maxOverlap = 0;
    for (const el of fixedEls) {
      const r = el.getBoundingClientRect();
      const target = textRect ?? footerRect;
      const overlap = Math.min(r.bottom, target.bottom) - Math.max(r.top, target.top);
      if (overlap > maxOverlap) maxOverlap = overlap;
    }

    const viewportBottom = window.innerHeight;
    const footerBottom = footerRect.bottom;
    const clippedByViewport = footerBottom > viewportBottom + 2;

    return {
      ok: maxOverlap < 4 && !clippedByViewport,
      maxOverlap,
      clippedByViewport,
      footerBottom,
      viewportH: viewportBottom,
      fixedCount: fixedEls.length,
    };
  });
}

async function check(path, label, beforeScroll) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
    if (beforeScroll) await beforeScroll(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const result = await footerClearance(page);
    console.log(`${result.ok ? "✓" : "✗"} ${label}`, result);
    return result.ok;
  } finally {
    await browser.close();
  }
}

let ok = true;

ok = (await check(`/${STORE}/checkout`, "checkout (may redirect if empty cart)", async (page) => {
  // Add item via localStorage cart if empty
  await page.evaluate(
    ({ slug }) => {
      const key = `cartflow:cart:${slug}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(
          key,
          JSON.stringify([
            {
              productId: "cmrgvire9000bl1040ca3w0pu",
              title: "Test",
              unitPrice: 4500,
              quantity: 1,
              maxStock: 99,
            },
          ]),
        );
      }
    },
    { slug: STORE },
  );
  await page.reload({ waitUntil: "networkidle" });
})) && ok;

ok = (await check(`/${STORE}/products/${PRODUCT}`, "product detail")) && ok;

process.exit(ok ? 0 : 1);