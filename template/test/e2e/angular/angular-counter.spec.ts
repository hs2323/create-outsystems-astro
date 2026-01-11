import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/angular/angular-counter");
  // Angular sometimes needs a bit more time to fully render the island component.
  await page.waitForTimeout(2000);
});

test.describe("Change counter", () => {
  test("Should increment counter when clicking + button", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("pre")).toContainText("6");
  });

  test("Should decrement counter when clicking - button", async ({ page }) => {
    await page.getByRole("button", { name: "-" }).click();
    await expect(page.locator("pre")).toContainText("4");
  });

  test("Should show message on Send value", async ({ page }) => {
    await page.getByRole("button", { name: "Send value" }).click();
    await expect(page.locator("span#counter")).toContainText("5");
  });
});
