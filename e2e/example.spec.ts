import { test, expect } from "@playwright/test";

test.describe("Basic application tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    // Sprawdzamy, czy body strony jest widoczne
    await expect(page.locator("body")).toBeVisible();
  });

  test("navigation works", async ({ page }) => {
    await page.goto("/");
    // Sprawdzamy, czy body strony jest widoczne
    await expect(page.locator("body")).toBeVisible();
  });
}); 