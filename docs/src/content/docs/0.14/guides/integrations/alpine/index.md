---
title: Alpine.js Integration
description: Alpine.js integration for Create OutSystems Astro
slug: 0.14/guides/integrations/alpine
---

The Alpine.js integration lets you build Astro Islands with [Alpine.js](https://alpinejs.dev/). A component is a TypeScript function that returns Alpine markup. The island renders that markup, hands the island's props to Alpine as reactive scope and starts Alpine.

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

The default export must be a function. Astro renders a component that is a plain string as an HTML tag, so `export default \`...\`\` does not work.

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

Stores are bound with [`@nanostores/alpine`](https://github.com/nanostores/alpine), following the [Nano Stores Alpine.js guide](https://github.com/nanostores/nanostores#alpinejs).

Don't import `alpinejs` in a component module. Alpine uses browser globals as soon as it loads, and the renderer imports component modules during the build. The helper reaches Alpine through `window.Alpine` instead. If there isn't one yet, it waits for `alpine:init`, which the renderer's `Alpine.start()` dispatches before it initializes the island.

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
