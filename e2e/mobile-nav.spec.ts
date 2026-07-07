import { test, expect } from "@playwright/test";

test.setTimeout(90_000);

const ADMIN = { email: "admin@cartflow.app", password: "demo12345" };

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(ADMIN.email);
  await page.getByLabel(/password/i).fill(ADMIN.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/admin/);
}

for (const viewport of VIEWPORTS) {
  test(`admin chrome stays stable while scrolling (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await loginAsAdmin(page);
    await page.goto("/admin/stores");

    if (viewport.width < 1024) {
      const bar = page.locator(".cf-dash-mobile-bar");
      const main = page.locator(".cf-dash-main");
      await expect(bar).toBeVisible();
      await expect(main).toBeVisible();

      const before = await bar.boundingBox();
      expect(before).not.toBeNull();

      await main.evaluate((el) => {
        el.scrollTop = 1600;
      });
      await page.waitForTimeout(150);

      const after = await bar.boundingBox();
      expect(after).not.toBeNull();
      expect(after!.y).toBe(before!.y);

      await expect(page.locator(".cf-dash-sidebar[data-open='false']")).toHaveCount(1);
    } else {
      await expect(page.locator(".cf-dash-chrome")).toBeHidden();
      await expect(page.locator(".cf-dash-sidebar")).toBeVisible();
    }
  });
}

test("seller storefront scroll does not move mobile chrome", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("demo@cartflow.app");
  await page.getByLabel(/password/i).fill("demo12345");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/dashboard/);

  await page.goto("/dashboard/storefront");
  const bar = page.locator(".cf-dash-mobile-bar");
  const main = page.locator(".cf-dash-main");
  await expect(bar).toBeVisible();

  const before = await bar.boundingBox();
  await main.evaluate((el) => {
    el.scrollTop = 2400;
  });
  await page.waitForTimeout(150);

  const after = await bar.boundingBox();
  expect(after!.y).toBe(before!.y);
  await expect(page.getByText("Storefront designer")).toBeVisible();
});