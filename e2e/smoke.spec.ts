import { test, expect } from "@playwright/test";

test.setTimeout(120_000);

const ADMIN = { email: "admin@cartflow.app", password: "demo12345" };

test.describe("CartFlow smoke", () => {
  test("public storefronts load without server errors", async ({ page }) => {
    for (const path of ["/glow-beauty", "/ada-styles"]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("body")).not.toContainText("PrismaClientValidationError");
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("admin can open approvals and stores", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ADMIN.email);
    await page.getByLabel(/password/i).fill(ADMIN.password);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL(/\/admin/);

    await page.goto("/admin/approvals");
    await expect(page.getByRole("heading", { name: /store approvals/i })).toBeVisible();

    await page.goto("/admin/stores");
    await expect(page.getByRole("heading", { name: /^stores$/i })).toBeVisible();
  });

  test("admin impersonates Glow Beauty and opens storefront editor", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ADMIN.email);
    await page.getByLabel(/password/i).fill(ADMIN.password);
    await page.getByRole("button", { name: /log in/i }).click();
    await page.waitForURL(/\/admin/);

    await page.goto("/admin/stores");
    const row = page.getByRole("row").filter({ hasText: "Glow Beauty" });
    await row.getByRole("button", { name: /impersonate/i }).click();
    await page.waitForURL(/\/dashboard/);

    await page.goto("/dashboard/storefront");
    await expect(page.getByText("Storefront designer")).toBeVisible();
    await expect(page.getByRole("button", { name: /save/i })).toBeVisible();
  });
});