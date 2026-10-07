---
title: Stencil Integration
description: Stencil integration for Create OutSystems Astro
slug: 0.14/guides/integrations/stencil
---

The Stencil integration lets you build Astro Islands with [Stencil](https://stenciljs.com/). A component is a class decorated with `@Component`. The integration compiles it with Stencil's compiler in the Astro build, and the island creates the element, sets the island's props as element properties and moves the Astro slots into the element's light DOM.

## Component structure

A component is a `.tsx` module whose default export is a class decorated with `@Component`.

```tsx
// src/framework/stencil/Counter.tsx
/** @jsxImportSource @stencil/core */
import { Component, Prop, State } from "@stencil/core";

@Component({ shadow: true, tag: "stencil-counter" })
export default class Counter {
  @State() count: number | undefined;
  @Prop() initialCount = 0;

  render() {
    const count = this.count ?? this.initialCount;
    return [
      <slot name="header" />,
      <pre>{count}</pre>,
      <button onClick={() => (this.count = count + 1)}>+</button>,
      <slot />,
    ];
  }
}
```

The element is registered under the `tag` from `@Component` when the module is imported in the browser, so the module does not call `customElements.define`. To render one Stencil component inside another, import the child's module and use its tag.

Use a default export. Stencil components are usually named exports, but the OutSystems Islands module loads an island's default export. Stencil's own compiler cannot compile `export default class`, so the integration compiles it as a named export and adds the default export back. A module still has only one component.

The `/** @jsxImportSource @stencil/core */` pragma gives the file Stencil's JSX types, as other JSX frameworks in the project do with theirs. Stencil's decorators need `experimentalDecorators`, which the template's `tsconfig.json` enables.

The island renders only while it has the `ssr` attribute: Astro sets it on the first render, and the OutSystems Islands module sets it again when it changes the props. A hydrate call without `ssr` does nothing.

The element is created once. When the Islands module changes the props, the same element gets the new values and Stencil re-renders, so `@State` (such as `count` above) is kept.

## Configuration

```js
// astro.config.mjs
import stencil from "islands-integrations/stencil";

export default defineConfig({
  integrations: [
    stencil({
      include: ["src/framework/stencil/*"],
    }),
  ],
});
```

`include` and `exclude` take path prefixes. The integration only compiles TypeScript modules that import `@stencil/core`, and only claims components the Stencil compiler has turned into custom elements, so it does not pick up other frameworks' `.tsx` files.

## Styles

With `shadow: true`, the component renders into a shadow root, which the page stylesheet does not reach. Pass the stylesheet to `@Component` by importing it with `?inline`:

```tsx
import styles from "../../styles/index.css?inline";

@Component({ shadow: true, styles, tag: "stencil-counter" })
export default class Counter {}
```

Slot content stays in the light DOM, so the page stylesheet applies to it as usual.

## Slots

Use `<slot>` elements in `render()`. The renderer wraps each Astro slot in an `<astro-slot>` in the element's light DOM, with a `slot` attribute for a named slot, so the `<slot>` of the same name shows it. An unnamed `<slot>` takes the default slot.

```astro
<Counter client:load initialCount={5}>
  <div slot="header">Counter</div>
  <p>This is content passed into the component.</p>
</Counter>
```

A component with `scoped: true` or without a shadow root works the same way: the slots are in place before the element is connected, and Stencil moves them into its `<slot>`s.

## Nano Stores

Stencil has no official Nano Stores binding library, and Nano Stores are not supported for the Stencil integration.

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```tsx
export default class Counter {
  @Prop() showMessage = "";

  private showParentMessage() {
    const handler = (window as unknown as Record<string, unknown>)[
      this.showMessage
    ];
    if (typeof handler === "function") handler(this.count);
  }
}
```

## Testing

### Integration tests

Add the integration's loader to the Vitest project, so the tests compile the components with Stencil as the Astro build does:

```ts
// vitest.config.ts
import { stencilLoader } from "islands-integrations/stencil";

export default defineConfig({
  plugins: [stencilLoader({ include: ["src/framework/stencil/*"] })],
});
```

Render the component through the renderer's client entrypoint, so the props and slots reach the element the same way they do in the browser. Stencil renders asynchronously and, with `shadow: true`, into a shadow root, so use the `findBy` queries inside it:

```ts
import { fireEvent, within } from "@testing-library/dom";
import stencilClient from "islands-integrations/stencil/client";

import Counter from "../../../src/framework/stencil/Counter";

function renderCounter(props = {}, slots = {}) {
  const island = document.createElement("astro-island");
  // The island only renders while it has the `ssr` attribute.
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  stencilClient(island)(Counter, { initialCount: 5, ...props }, slots);
  island.removeAttribute("ssr");
  const element = island.querySelector("stencil-counter") as HTMLElement;
  return within(element.shadowRoot as unknown as HTMLElement);
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("increments counter", async () => {
  const shadow = renderCounter();
  fireEvent.click(await shadow.findByRole("button", { name: "+" }));
  expect(await shadow.findByText("6")).toBeInTheDocument();
});
```

### End-to-end tests

Playwright locators pierce open shadow roots, so use them as with any other framework:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/stencil/stencil-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
