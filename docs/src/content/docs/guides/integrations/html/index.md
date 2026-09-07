---
title: HTML Integration
description: HTML integration for Create OutSystems Astro
---

The HTML integration lets you build Astro Islands using plain HTML and JavaScript — no framework required. A component is a TypeScript file that returns an HTML string, with interactivity handled via inline `<script>` tags.

## When to use

- You need a simple interactive component and don't want to pull in a full framework.
- You are migrating existing vanilla JS/HTML code into an island.

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro`. No additional configuration is needed.

## Component structure

An HTML component is a TypeScript function that accepts props and returns an HTML string.

```ts
// src/framework/html/MyComponent.ts

export default function MyComponent({
  children = "",
  header = "",
  initialCount = 0,
}: {
  children?: string;
  header?: string;
  initialCount?: number;
}): string {
  return `
    ${header}
    <div class="my-component">
      <pre class="count">${initialCount}</pre>
      <button class="add">+</button>
      ${children}
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          let count = ${initialCount};
          const countEl = container.querySelector('.count');
          container.querySelector('.add').addEventListener('click', function () {
            count += 1;
            countEl.textContent = count;
          });
        })();
      </script>
    </div>
  `;
}
```

*** Note ***: Be careful when using global variables in the script tag. You will most likely want to avoid any Javascript variables or CSS styles from leaking out of the island.


## Page setup

Use `client:load` on the component in your `.astro` page:

```astro
---
import MyComponent from "../../framework/html/MyComponent";
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
    <MyComponent
      client:load
      initialCount={initialCount}
      showMessage={showMessage}
    >
    </MyComponent>
  </body>
</html>
```

`client:load` is used instead of `client:only` because the HTML renderer uses it to associate the client entrypoint with the island. The server rendering step intentionally returns empty HTML so the output only contains the slot templates and props — identical to how `client:only` frameworks like React behave.

## Slots

Slots are not supported in the HTML integration.

## Nano Stores

There is no Nano Stores binding library for the HTML integration the way there is for React or Vue, so the component uses the [vanilla JS API](https://github.com/nanostores/nanostores#vanilla-js) against a real atom.

Register the atom from the component module. The module runs in the browser, so it can import from your stores folder, but the renderer also imports it during the build — guard the call so it only runs client side:

```ts
import { setupStore } from "../../stores/demo";

if (typeof window !== "undefined") {
  setupStore("myStore");
}

export default function MyComponent(): string {
  return `
    <div class="my-component">
      <div class="store-value"></div>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          const valueEl = container.querySelector('.store-value');

          const store = window.Stores && window.Stores['myStore'];

          if (store) {
            store.subscribe(function (value) {
              valueEl.textContent = value;
            });
          }
        })();
      </script>
    </div>
  `;
}
```

The inline `<script>` is re-created as a classic script when the island hydrates, so it cannot `import` — it reads the atom from `window.Stores` instead. `subscribe` fires immediately with the current value, so there is no need to read `.get()` first, and the guard keeps the island from throwing when no store has been registered.

The page can register the same store instead of, or as well as, the component. `setupStore` returns the atom that is already registered under that name:

```astro
<script>
  import { setupStore } from "../../stores/demo";
  setupStore("myStore");
</script>
```

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```ts
export default function MyComponent({
  initialCount = 0,
  showMessage = "",
}: {
  initialCount?: number;
  showMessage?: string;
}): string {
  return `
    <div class="my-component">
      <button class="send">Send value</button>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          let count = ${initialCount};
          container.querySelector('.send').addEventListener('click', function () {
            if ('${showMessage}' && window['${showMessage}']) {
              window['${showMessage}'](count);
            }
          });
        })();
      </script>
    </div>
  `;
}
```

## Testing

### Integration tests

Use `@testing-library/dom` directly. Render the component by calling the function and setting `document.body.innerHTML`, then execute the scripts using `new Function` so they run in the test's global context:

```ts
import { fireEvent, screen } from "@testing-library/dom";
import MyComponent from "../../../src/framework/html/MyComponent";

function renderComponent(props = {}) {
  document.body.innerHTML = MyComponent(props);
  document.body.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

test("increments counter", () => {
  renderComponent({ initialCount: 5 });
  fireEvent.click(screen.getByRole("button"));
  expect(document.querySelector(".count")?.textContent).toBe("6");
});
```

> `new Function` is required because `innerHTML` does not execute `<script>` tags, and `replaceChild` does not execute scripts in happy-dom.

Register a real atom on `window.Stores` before rendering, then drive it with `set` to assert the island updates:

```ts
import { atom } from "nanostores";

let store = atom("Initial value");

beforeEach(() => {
  store = atom("Initial value");
  (window as { Stores: Record<string, unknown> } & Window).Stores = {
    myStore: store,
  };
});

test("reflects store updates", () => {
  renderComponent();
  expect(document.querySelector(".store-value")?.textContent).toBe(
    "Initial value",
  );

  store.set("Updated value");
  expect(document.querySelector(".store-value")?.textContent).toBe(
    "Updated value",
  );
});
```

### End-to-end tests

Use Playwright as with any other framework. Navigate to the page and interact with elements normally:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/html/my-component");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
