---
title: Lit Integration
description: Lit integration for Create OutSystems Astro
---

The Lit integration lets you build Astro Islands with [Lit](https://lit.dev/). A component is a `LitElement` class. The island creates the element, sets the island's props as element properties and moves the Astro slots into the element's light DOM.

## Component structure

A component is a TypeScript module whose default export is a `LitElement` class.

```ts
// src/framework/lit/Counter.ts
import { html, LitElement } from "lit";

export default class Counter extends LitElement {
  static override properties = {
    count: { state: true },
    initialCount: { type: Number },
  };

  declare count: number | undefined;
  declare initialCount: number;

  constructor() {
    super();
    this.initialCount = 0;
  }

  override render() {
    const count = this.count ?? this.initialCount;
    return html`
      <slot name="header"></slot>
      <pre>${count}</pre>
      <button @click=${() => (this.count = count + 1)}>+</button>
      <slot></slot>
    `;
  }
}

if (typeof window !== "undefined" && !customElements.get("lit-counter")) {
  customElements.define("lit-counter", Counter);
}
```

Register the element with `customElements.define` in the module. The renderer also imports the module during the build, so guard the call. A class that is never registered gets a generated tag name.

Declare reactive properties with `static properties` and `declare` fields, and set defaults in the constructor. A class field initializer (`initialCount = 0`) would shadow the accessor Lit creates for the property.

The island renders only while it has the `ssr` attribute: Astro sets it on the first render, and the OutSystems Islands module sets it again when it changes the props. A hydrate call without `ssr` does nothing.

The element is created once. When the Islands module changes the props, the same element gets the new values and Lit re-renders, so internal state (such as `count` above) is kept.

## Styles

Lit renders into a shadow root, which the page stylesheet does not reach. Adopt the stylesheet in the component by importing it with `?inline`:

```ts
import { unsafeCSS } from "lit";

import styles from "../../styles/index.css?inline";

export default class Counter extends LitElement {
  static override styles = unsafeCSS(styles);
}
```

Slot content stays in the light DOM, so the page stylesheet applies to it as usual.

## Slots

Use native `<slot>` elements in the template. The renderer wraps each Astro slot in an `<astro-slot>` in the element's light DOM, with a `slot` attribute for a named slot, so the shadow `<slot>` of the same name shows it. An unnamed `<slot>` takes the default slot.

```astro
<Counter client:load initialCount={5}>
  <div slot="header">Counter</div>
  <p>This is content passed into the component.</p>
</Counter>
```

## Nano Stores

Stores are bound with [`@nanostores/lit`](https://github.com/nanostores/lit). The integration does not depend on Nano Stores; the component adds a `StoreController`, which subscribes while the element is connected and re-renders it when the store changes:

```ts
import { StoreController } from "@nanostores/lit";

import { setupStore } from "../../stores/demo";

export default class MyComponent extends LitElement {
  private store = new StoreController(this, setupStore("myStore"));

  override render() {
    return html`<div>${this.store.value}</div>`;
  }
}
```

The controller is created in the constructor, which only runs in the browser, so reading `window.Stores` there is safe.

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```ts
private showParentMessage() {
  const handler = (window as any)[this.showMessage];
  if (typeof handler === "function") handler(this.count);
}
```

## Testing

### Integration tests

Render the component through the renderer's client entrypoint, so the props and slots reach the element the same way they do in the browser. Lit renders into a shadow root, so query inside it:

```ts
import { fireEvent, within } from "@testing-library/dom";
import litClient from "islands-integrations/lit/client";

import Counter from "../../../src/framework/lit/Counter";

function renderCounter(props = {}, slots = {}) {
  const island = document.createElement("astro-island");
  // The island only renders while it has the `ssr` attribute.
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  litClient(island)(Counter, { initialCount: 5, ...props }, slots);
  island.removeAttribute("ssr");
  const element = island.querySelector("lit-counter") as Counter;
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
  await page.goto("/lit/lit-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
