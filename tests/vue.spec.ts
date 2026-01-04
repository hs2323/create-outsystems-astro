import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/vue/vue-counter");
});

test.describe("Visit Counter control", () => {
  test("Should have counter control", async ({ page }) => {
    const counter = page.locator(".counter-title");
    await expect(counter).toHaveText("Counter");
  });
});
