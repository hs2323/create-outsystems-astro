---
title: Qwik Integration
description: Qwik integration for Create OutSystems Astro
---

The Qwik integration uses [`@qwik.dev/astro`](https://qwik.dev/docs/integrations/astro/) to build Astro Islands with [Qwik](https://qwik.dev/) components. Qwik components are written as `.tsx` files using `component$()`.

## When to use

- You want the smallest possible amount of JavaScript executed on load — Qwik resumes rather than hydrates, so the framework itself is not run until an interaction needs it. Note that the `client:load` directive the demo uses to produce an island claws some of that back; see [The renderer needs a client entrypoint](#the-renderer-needs-a-client-entrypoint).
- You are already writing Qwik components elsewhere and want to reuse them.

## Before you start

Qwik behaves differently to the other supported frameworks in ways that matter for this project.

### Qwik renders a container inside the island

Astro's other frameworks render an `<astro-island>` custom element wrapping markup that the framework then hydrates. Qwik instead renders a [Qwik container](https://qwik.dev/docs/advanced/containers/) — a `<div q:container="paused">` — that resumes on its own.

The two are not exclusive. With a `client:load` directive, Astro wraps the Qwik container in an `<astro-island>`, which is what the `output` step keeps.

Which of the two actually renders the component depends on what is inside the island:

- **The island arrives with server markup inside it.** Qwik resumes that container, exactly as it would without Astro. Nothing is re-rendered and resumability is preserved.
- **The island arrives empty**, because it was imported into OutSystems or declared `client:only`. There is nothing to resume, so the component is rendered on the client instead.
- **The island's `props` attribute changes.** The resumed container is replaced by a client render using the new props.

### The renderer needs a client entrypoint

`@qwik.dev/astro` registers its renderer with a `serverEntrypoint` only, and Astro adds `renderer-url`, `component-export` and the serialized `props` attribute to an island **only** when its renderer has a `clientEntrypoint`. Without one, the island is emitted with none of them and its runtime falls back to a no-op hydrator: props never reach the component, and an empty island stays empty for good, silently.

This template therefore wraps the upstream integration in `islands-integrations/qwik`, which supplies that client entrypoint. The last two cases above work because of it.

One cost remains on the server-rendered path. Astro emits a `component-url` pointing at its own client build of the component, and the island runtime imports it on load. That is a second copy of Qwik core alongside the one Qwik's own build ships, which Qwik reports as [error Q30](https://qwik.dev/docs/errors/) ("Qwik version already imported"), and it takes the demo page from ~117 KB of JavaScript to ~655 KB. An island declared `client:only` avoids both, because Qwik's own build never runs for it.

### Choosing a directive

Use `client:load` to keep server rendering and resumability. Use `client:only="@qwik.dev/astro"` to skip server rendering and have the component rendered entirely on the client, the way the React, Preact, Solid, Svelte and Vue demos do.

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro` and select Qwik. The upstream integration is wrapped so its renderer gains a client entrypoint, and scoped to the Qwik framework folder:

```js
import qwikAstro from "@qwik.dev/astro";
import qwik from "islands-integrations/qwik";

export default defineConfig({
  integrations: [
    qwik(
      qwikAstro({
        include: ["src/framework/qwik/*"],
      }),
    ),
  ],
});
```

`islands-integrations/qwik` only intercepts the `addRenderer` call that `@qwik.dev/astro` makes during setup and adds `clientEntrypoint` to the renderer. The standalone Qwik client build, the manifest and the Vite plugins are all still the upstream integration's.

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

Import the component and add `client:load` so the container is wrapped in an island:

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
    <MyComponent client:load initialCount={initialCount} />
  </body>
</html>
```

## Props

Props are serialized onto the island and re-applied when they change, so a component imported into OutSystems reacts to parameter changes the same way the other frameworks do. A change replaces the resumed container with a client render; slot content is preserved across that render.

Props set before the island has hydrated are ignored — Astro's island runtime has no hydrator to call yet. The island drops its `ssr` attribute once it has hydrated, which is the signal that it is ready to accept them.

## Slots

Slots are supported. Render them with Qwik's `Slot` component — the default slot is `<Slot />` and a named slot is `<Slot name="header" />`. In the `.astro` page, mark the content with the normal `slot` attribute rather than `q:slot`:

- Astro example:

```astro
  <MyComponent client:load>
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
