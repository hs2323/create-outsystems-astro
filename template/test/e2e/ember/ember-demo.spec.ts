import { expect, type Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/ember/ember-demo");
});

test.describe("Renders as an island", () => {
  test("Should render inside an astro-island", async ({ page }) => {
    const island = page.locator("astro-island");
    await expect(island).toHaveCount(1);
    await expect(island.locator("pre")).toHaveCount(1);
  });

  test("Should carry the attributes a client render needs", async ({
    page,
  }) => {
    const island = page.locator("astro-island");
    expect(await island.getAttribute("renderer-url")).not.toBeNull();
    expect(await island.getAttribute("component-url")).not.toBeNull();
    expect(await island.getAttribute("props")).not.toBeNull();
  });
});

test.describe("Props updates", () => {
  /** Drives the island the way the OutSystems Islands module does. */
  async function setProps(page: Page, showMessage: string) {
    // The island drops its `ssr` attribute once it has hydrated. Props set
    // before that point are ignored.
    await page.locator("astro-island:not([ssr])").waitFor({
      state: "attached",
    });

    await page.evaluate((handler) => {
      window[handler as keyof Window & string] = ((count: number) => {
        document.getElementById("counter")!.textContent = `other ${count}`;
      }) as never;
      const island = document.querySelector("astro-island");
      island?.setAttribute("ssr", "");
      island?.setAttribute(
        "props",
        JSON.stringify({
          initialCount: [0, 42],
          showMessage: [0, handler],
        }),
      );
    }, showMessage);
  }

  test("Should keep its first props and component state", async ({ page }) => {
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("pre")).toContainText("6");

    // ember-astro renders the component once and does not pass new props to
    // it, so the original handler is still called.
    await setProps(page, "otherMessage");

    await expect(page.locator("pre")).toContainText("6");
    await page.getByRole("button", { name: "Send value" }).click();
    await expect(page.locator("span#counter")).toHaveText("6");
    await expect(page.getByText("Ember Demo Component")).toBeVisible();
  });
});

test.describe("Has values", () => {
  test("Should have header", async ({ page }) => {
    await expect(page.getByText("Ember Demo Component")).toBeVisible();
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

test.describe("Update Nano Store", () => {
  test("Should update Nano Store", async ({ page }) => {
    await page.locator("#store").fill("Updated Value");
    await page.getByRole("button", { name: "Update Store" }).click();
    await expect(page.locator("#nanostore")).toHaveText("Updated Value");
  });
});
