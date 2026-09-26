---
title: Alpine.js Integration
description: Alpine.js integration for Create OutSystems Astro
---

The Alpine.js integration lets you build Astro Islands with [Alpine.js](https://alpinejs.dev/). A component is a TypeScript function that returns Alpine markup. The island renders that markup, hands the island's props to Alpine as reactive scope and starts Alpine.

## Why not `@astrojs/alpinejs`?

The official [`@astrojs/alpinejs`](https://docs.astro.build/en/guides/integrations-guide/alpinejs/) integration does not register a renderer. It injects a script on every page that imports Alpine and calls `Alpine.start()` over the whole document, so Alpine markup in an Astro page is just static HTML. Astro only wraps a component in an `<astro-island>` when a renderer claims it, which means there is:

- no `<astro-island>` for the output step to keep,
- no `component-url` or `renderer-url` for the OutSystems Islands module to load,
- no `props` attribute, so OutSystems cannot pass values in or change them later.

The `islands-integrations/alpine` renderer fills that gap. It follows the same model as the [Vanilla JS integration](../vanilla/), with Alpine doing the DOM work instead of an inline script.

## When to use

- You want lightweight, declarative interactivity without a build-heavy framework.
- You are bringing existing Alpine.js markup into OutSystems.

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro`:

```js
import alpine from "islands-integrations/alpine";

export default defineConfig({
  integrations: [
    alpine({
      include: ["src/framework/alpine/*"],
    }),
  ],
});
```

Alpine is bundled with the renderer. If the page already has an Alpine instance on `window.Alpine` (loaded by the OutSystems app or by `@astrojs/alpinejs`), the island uses it instead of starting a second one.

## Component structure

A component is a TypeScript function that returns Alpine markup as a string.

```ts
// src/framework/alpine/Counter.ts

export default function Counter(): string {
  return `
    <slot name="header"></slot>
    <div x-data="{ count: initialCount }">
      <pre x-text="count"></pre>
      <button x-on:click="count++">+</button>
      <slot></slot>
    </div>
  `;
}
```

The default export must be a function. Astro renders a component that is a plain string as an HTML tag, so `export default \`...\`` does not work.

The island renders only while it has the `ssr` attribute: Astro sets it on the first render, and the OutSystems Islands module sets it again when it changes the props. A hydrate call without `ssr` does nothing.

The markup is rendered once. When the Islands module changes the props, Alpine's scope is updated in place and the markup is not rebuilt, so component state (such as `count` above) is kept.

## Props

The island's props are in scope for every Alpine expression in the component, as if they were declared on an `x-data` wrapping it. They are reactive: a binding that reads a prop re-evaluates when the prop changes.

```html
<div x-data="{ count: initialCount }">
  <!-- initialCount is read once, when x-data initializes -->
  <pre x-text="count"></pre>
  <!-- title is read on every change -->
  <h2 x-text="title"></h2>
</div>
```

The function also receives the props, but values interpolated into the string (`${props.title}`) are only the initial values. Read props through Alpine expressions to keep them up to date.

## Page setup

Use `client:load` on the component in your `.astro` page:

```astro
---
import Counter from "../../framework/alpine/Counter";
import styles from "../../styles/index.css?url";
const initialCount = 5;
const showMessage = "showMessage";
---
<html lang="en">
  <head>
    <link href={styles} rel="stylesheet" />
    <script>
      window["showMessage"] = (count) => {
        document.getElementById("counter").textContent = count;
      };
    </script>
  </head>
  <body>
    <Counter client:load initialCount={initialCount} showMessage={showMessage}>
      <div slot="header">Counter</div>
      <p>This is content passed into the component.</p>
    </Counter>
  </body>
</html>
```

The server rendering step returns empty HTML, so the island is rendered entirely on the client — the same as the `client:only` frameworks.

## Slots

Place `<slot>` elements in the markup. Before Alpine initializes the island, each one is replaced with the Astro slot of the same name; an unnamed `<slot>` takes the default slot. A `<slot>` with no matching content keeps its children as fallback content.

```html
<slot name="header"><strong>Default header</strong></slot>
<div>
  <slot></slot>
</div>
```

The slot content is added before Alpine starts on the island, so Alpine directives inside it are initialized as well.

## Nano Stores

Stores are bound with [`@nanostores/alpine`](https://github.com/nanostores/alpine), following the [Nano Stores Alpine.js guide](https://github.com/nanostores/nanostores#alpinejs). The integration does not install the plugin; the component does, so a project that doesn't use Nano Stores doesn't carry it. The template ships a helper, `src/framework/alpine/nanostores.ts`, that calls `Alpine.plugin(NanoStores)` on the Alpine instance the island uses. That adds the `x-nano` and `x-nano-model` directives and the `$nano` magic.

Don't import `alpinejs` in a component module. Alpine uses browser globals as soon as it loads, and the renderer imports component modules during the build. The helper reaches Alpine through `window.Alpine` instead. If there isn't one yet, it waits for `alpine:init`, which the renderer's `Alpine.start()` dispatches before it initializes the island.

In OutSystems the stores live on `window.Stores`, so the directive's expression reads the atom from there. `x-nano:value` puts the store's current value in scope as `value`, keeps it updated, and unsubscribes when Alpine tears the element down. `x-nano` reads the store when Alpine initializes the island, so register the atom from the component module first, guarded because the renderer also imports the module during the build:

```ts
import { setupStore } from "../../stores/demo";
import { registerNanoStores } from "./nanostores";

if (typeof window !== "undefined") {
  setupStore("myStore");
  registerNanoStores();
}

export default function MyComponent(): string {
  return `
    <div x-data x-nano:value="window.Stores['myStore']">
      <span x-text="value"></span>
      <button x-on:click="window.Stores['myStore'].set('Updated')">Update</button>
    </div>
  `;
}
```

The name after `x-nano:` becomes a variable in Alpine's scope. Alpine does not camelCase it, so use a single lowercase word such as `value` or `profile`, not `nano-value`.

Use `x-nano-model` for two-way binding, where writing to the variable also sets the store:

```html
<div x-data x-nano-model:value="window.Stores['myStore']">
  <input x-model="value" />
</div>
```

Or read a store inline with `$nano`:

```html
<span x-text="$nano(window.Stores['myStore'])"></span>
```

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```html
<button
  x-on:click="typeof window[showMessage] === 'function' && window[showMessage](count)"
>
  Send value
</button>
```

Because `showMessage` is read from the reactive props, the button calls the new handler if the Islands module changes the prop.

## Testing

### Integration tests

Render the component through the renderer's client entrypoint, so the props and slots reach Alpine the same way they do in the browser. Alpine applies DOM updates asynchronously, so use the `findBy*` queries after an interaction:

```ts
import { fireEvent, screen } from "@testing-library/dom";
import alpineClient from "islands-integrations/alpine/client";

import Counter from "../../../src/framework/alpine/Counter";

function renderCounter(props = {}, slots = {}) {
  const island = document.createElement("astro-island");
  // The island only renders while it has the `ssr` attribute.
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  alpineClient(island)(Counter, { initialCount: 5, ...props }, slots);
  island.removeAttribute("ssr");
  return island;
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("increments counter", async () => {
  renderCounter();
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(await screen.findByText("6")).toBeInTheDocument();
});
```

To test a props update, set `ssr` on the island again and call the hydrator with the new props. Without `ssr` the call is ignored.

### End-to-end tests

Use Playwright as with any other framework:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/alpine/alpine-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
