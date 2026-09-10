import { expect, type Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/qwik/qwik-demo");
});

test.describe("Renders as an island", () => {
  test("Should wrap the Qwik container in an astro-island", async ({
    page,
  }) => {
    const island = page.locator("astro-island");
    await expect(island).toHaveCount(1);
    await expect(island.locator("[q\\:container]")).toHaveCount(1);
  });

  test("Should carry the attributes a client render needs", async ({
    page,
  }) => {
    const island = page.locator("astro-island");
    // These come from the clientEntrypoint the islands-integrations/qwik
    // wrapper adds. Astro omits all three when a renderer has none, which
    // leaves the island unable to render or to receive new props.
    expect(await island.getAttribute("renderer-url")).not.toBeNull();
    expect(await island.getAttribute("component-export")).not.toBeNull();
    expect(await island.getAttribute("props")).not.toBeNull();
  });

  test("Should resume the server markup instead of re-rendering it", async ({
    page,
  }) => {
    // Qwik resumes what the server sent, so the container stays "paused"
    // rather than being replaced by a client render.
    await expect(page.locator("[q\\:container]")).toHaveAttribute(
      "q:container",
      "paused",
    );
  });
});

test.describe("Client rendering", () => {
  /** Drives the island the way the OutSystems Islands module does. */
  async function setProps(page: Page, initialCount: number) {
    // The island drops its `ssr` attribute once it has hydrated. Props set
    // before that point are ignored, because Astro's island runtime has no
    // hydrator to call yet.
    await page.locator("astro-island:not([ssr])").waitFor({
      state: "attached",
    });

    await page.evaluate((count) => {
      const island = document.querySelector("astro-island");
      island?.setAttribute("ssr", "");
      island?.setAttribute(
        "props",
        JSON.stringify({
          initialCount: [0, count],
          showMessage: [0, "showMessage"],
        }),
      );
    }, initialCount);
  }

  test("Should re-render when the props change", async ({ page }) => {
    await setProps(page, 42);

    await expect(page.locator("pre")).toContainText("42");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("pre")).toContainText("43");
  });

  test("Should keep the slot content across a re-render", async ({ page }) => {
    await setProps(page, 42);

    await expect(page.locator("pre")).toContainText("42");
    await expect(page.getByText("Qwik Demo Component")).toBeVisible();
    await expect(
      page.getByText("This is content passed into the component"),
    ).toBeVisible();
  });

  test("Should render an island whose contents were removed", async ({
    page,
  }) => {
    // Nothing left to resume, so the component has to be rendered on the
    // client. Without a clientEntrypoint this island stays empty for good.
    await page.locator("astro-island:not([ssr])").waitFor({
      state: "attached",
    });
    await page.evaluate(() => {
      document.querySelector("astro-island")!.innerHTML = "";
    });
    await setProps(page, 5);

    await expect(page.locator("pre")).toContainText("5");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("pre")).toContainText("6");
    await page.getByRole("button", { name: "Send value" }).click();
    await expect(page.locator("span#counter")).toContainText("6");
  });
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
