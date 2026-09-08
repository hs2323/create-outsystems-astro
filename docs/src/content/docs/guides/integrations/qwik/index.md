---
title: Qwik Integration
description: Qwik integration for Create OutSystems Astro
---

The Qwik integration uses [`@qwik.dev/astro`](https://qwik.dev/docs/integrations/astro/) to build Astro Islands with [Qwik](https://qwik.dev/) components. Qwik components are written as `.tsx` files using `component$()`.

## When to use

- You want the smallest possible amount of JavaScript executed on load — Qwik resumes rather than hydrates, so the framework itself is not run until an interaction needs it.
- You are already writing Qwik components elsewhere and want to reuse them.

## Before you start

Qwik behaves differently to the other supported frameworks in ways that matter for this project.

### Qwik renders a container, not an island

Astro's other frameworks render an `<astro-island>` custom element. Qwik instead renders a [Qwik container](https://qwik.dev/docs/advanced/containers/) — a `<div q:container="paused">` — which Astro treats as static data.

The `output` step only keeps `<astro-island>` elements, so **a Qwik page produces an empty `.html` file and a Qwik component cannot currently be imported into OutSystems through the Islands module**. Use Qwik for local Astro development and comparison, and choose another framework for components that need to ship to OutSystems.

### No client directive

Qwik does not hydrate, so it does not take a `client:*` directive. Adding one is an error:

```astro
---
import DemoComponent from "../../framework/qwik/Demo";
---
<!-- Correct: no directive -->
<DemoComponent initialCount={5} />
```

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro` and select Qwik. It is added to `astro.config.mjs` scoped to the Qwik framework folder:

```js
import qwik from "@qwik.dev/astro";

export default defineConfig({
  integrations: [
    qwik({
      include: ["src/framework/qwik/*"],
    }),
  ],
});
```

The generated `astro.config.mjs` also disables Qwik's experimental compile-time feature flags:

```js
export default defineConfig({
  vite: {
    define: {
      "__EXPERIMENTAL__.each": "false",
      "__EXPERIMENTAL__.errorBoundary": "false",
      "__EXPERIMENTAL__.show": "false",
    },
  },
});
```

`@qwik.dev/astro` only defines `__EXPERIMENTAL__.suspense` itself, and Astro's prerender environment throws on the flags it leaves undefined. These are opt-in experimental Qwik features, so leaving them off is the expected default.

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

## Page setup

Import the component and use it with no client directive:

```astro
---
import MyComponent from "../../framework/qwik/MyComponent";
import styles from "../../styles/index.css?url";
const initialCount = 5;
---
<html lang="en">
  <head>
    <link href={styles} rel="stylesheet" />
  </head>
  <body>
    <MyComponent initialCount={initialCount} />
  </body>
</html>
```

## Slots

Slots are supported. Render them with Qwik's `Slot` component — the default slot is `<Slot />` and a named slot is `<Slot name="header" />`. In the `.astro` page, mark the content with the normal `slot` attribute rather than `q:slot`:

- Astro example:

```astro
  <MyComponent>
      <div slot="header">
          <p>Slot header</p>
      </div>
      <div>
          <p>Slot content</p>
      </div>
  </MyComponent>
```

- Qwik example:

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

The Vitest project for Qwik registers Qwik's own Vite plugin so that `$` closures are transformed:

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

## Type checking

`@qwik.dev/astro` points its `types` entry at its raw TypeScript source rather than a declaration file, and that source does not type check cleanly in this project. The template ships a [patch-package](https://github.com/ds300/patch-package) patch (`patches/@qwik.dev+astro+1.1.0.patch`) that narrows the offending plugin check so `npm run typecheck` passes. The patch is applied automatically by the `postinstall` script.
