import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/qwik/qwik-demo");
});

test.describe("Has values", () => {
  test("Should have header", async ({ page }) => {
    await expect(page.getByText("Qwik Demo Component")).toBeVisible();
  });

  test("Should have slot content", async ({ page }) => {
    await expect(
      page.getByText("This is content passed into the component"),
    ).toBeVisible();
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
