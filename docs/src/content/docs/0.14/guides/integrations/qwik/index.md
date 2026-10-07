---
title: Qwik Integration
description: Qwik integration for Create OutSystems Astro
slug: 0.14/guides/integrations/qwik
---

The Qwik integration uses [`@qwik.dev/astro`](https://qwik.dev/docs/integrations/astro/) to build Astro Islands with [Qwik](https://qwik.dev/) components. Qwik components are written as `.tsx` files using `component$()`.

## Component structure

Because the project uses several JSX frameworks, Qwik is not the default `jsxImportSource`. Every Qwik component needs the pragma at the top of the file:

```tsx
/** @jsxImportSource @qwik.dev/core */
import { component$, useSignal } from "@qwik.dev/core";

interface MyComponentProps {
  initialCount: number;
}

export default component$<MyComponentProps>(({ initialCount }) => {
  const count = useSignal(initialCount);

  return (
    <button onClick$={() => count.value++}>Count: {count.value}</button>
  );
});
```

State is held in a signal from `useSignal`, and event handlers use the `$` suffix (`onClick$`) so the optimizer can extract them into their own lazy-loaded chunk.

## Props

Props are serialized onto the island and re-applied when they change, so a component imported into OutSystems reacts to parameter changes the same way the other frameworks do. A change re-renders the component on the client; slot content is preserved across that render.

Props set before the island has hydrated are ignored — Astro's island runtime has no hydrator to call yet. The island drops its `ssr` attribute once it has hydrated, which is the signal that it is ready to accept them.

## Slots

Slots are supported. Render them with Qwik's `Slot` component — the default slot is `<Slot />` and a named slot is `<Slot name="header" />`. In the `.astro` page, mark the content with the normal `slot` attribute rather than `q:slot`:

* Astro example:

```astro
  <MyComponent client:only="@qwik.dev/astro">
      <div slot="header">
          <p>Slot header</p>
      </div>
      <div>
          <p>Slot content</p>
      </div>
  </MyComponent>
```

* Qwik example:

```tsx
/** @jsxImportSource @qwik.dev/core */
import { component$, Slot } from "@qwik.dev/core";

export default component$(() => {
  return (
    <>
      <Slot name="header" />
      <div>
        <Slot />
      </div>
    </>
  );
});
```

## Nano Stores

Nano Stores are not supported for Qwik.

There is no Nano Stores binding library for Qwik, and the Qwik maintainers [recommend against global stores](https://github.com/QwikDev/astro#communicating-across-containers) in an SSR context, suggesting custom events for communicating across containers instead. The demo component therefore shows the Nano Stores card as unsupported, in the same way the Angular and Twig demos do.

## Using OutSystems handlers

Pass the handler name as a string prop and call it through `window` from inside a `$` handler:

```tsx
/** @jsxImportSource @qwik.dev/core */
import { component$, useSignal } from "@qwik.dev/core";

interface MyComponentProps {
  showMessage: string;
}

export default component$<MyComponentProps>(({ showMessage }) => {
  const count = useSignal(0);

  return (
    <button
      onClick$={() => {
        const handlers = window as unknown as Record<string, unknown>;
        const messageFunc = handlers[showMessage];

        if (typeof messageFunc === "function") {
          messageFunc(count.value);
        }
      }}
    >
      Send value
    </button>
  );
});
```

## Testing

### Integration tests

Qwik has no Testing Library package. Use `createDOM` from `@qwik.dev/core/testing`, which renders the component and returns a host element to query plus a `userEvent` helper that dispatches through Qwik's event system:

```tsx
/** @jsxImportSource @qwik.dev/core */
import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, it } from "vitest";

import MyComponent from "../../../src/framework/qwik/MyComponent";

describe("MyComponent", () => {
  it("increments count when the button is clicked", async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(<MyComponent initialCount={5} />);

    await userEvent("button", "click");

    expect(screen.querySelector("pre")?.textContent).toBe("6");
  });
});
```

> `createDOM` renders into a document it creates itself rather than the test environment's document, so the `@testing-library/jest-dom` matchers used by the other frameworks do not apply. Assert on `textContent` instead.

The Vitest project for Qwik registers Qwik's own Vite plugin so that `$` closures are transformed. Its environment is happy-dom:

```ts
import { qwikVite } from "@qwik.dev/core/optimizer";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [qwikVite()],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/qwik/**/*.test.tsx"],
          name: "qwik",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
    ],
  },
});
```

### End-to-end tests

Use Playwright as with any other framework:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/qwik/qwik-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
