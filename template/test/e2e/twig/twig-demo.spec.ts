import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/twig/twig-demo");
});

test.describe("Has values", () => {
  test("Should have header", async ({ page }) => {
    await expect(page.getByText("Twig Demo Component")).toBeVisible();
  });

  test("Should show the logo resolved by asset()", async ({ page }) => {
    const logo = page.getByAltText("Astro logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", /\/astro.*\.png$/);
    await expect
      .poll(() =>
        logo.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  });
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
