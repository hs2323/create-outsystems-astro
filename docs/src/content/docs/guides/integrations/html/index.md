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
  initialCount = 0,
  showMessage = "",
  header = "",
  children = "",
}: {
  initialCount?: number;
  showMessage?: string;
  header?: string;
  children?: string;
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
      <div slot="header">My Component</div>
      <p>Slot content here.</p>
    </MyComponent>
  </body>
</html>
```

`client:load` is used instead of `client:only` because the HTML renderer uses it to associate the client entrypoint with the island. The server rendering step intentionally returns empty HTML so the output only contains the slot templates and props — identical to how `client:only` frameworks like React behave.

## Slots

Slots arrive as plain HTML strings. Declare them as `string` parameters with a default of `""`.

```ts
export default function MyComponent({
  header = "",
  children = "",
}: {
  header?: string;
  children?: string;
}): string {
  return `
    <div class="my-component">
      ${header}
      <div class="content">${children}</div>
    </div>
  `;
}
```

In the `.astro` page, pass slots using the `slot` attribute:

```astro
<MyComponent client:load>
  <div slot="header">Header content</div>
  <p>Default slot content</p>
</MyComponent>
```

## Nano Stores

The HTML integration does not use a Nano Stores binding library. Instead, the component sets up a compatible store directly on `window.Stores` inside its `<script>` tag. The store implements the same `get`, `set`, and `subscribe` interface as a nanostores atom, so it works alongside stores from other framework islands on the same page.

```ts
export default function MyComponent({ ... }): string {
  return `
    <div class="my-component">
      <div class="store-value"></div>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          const valueEl = container.querySelector('.store-value');

          if (!window.Stores) window.Stores = {};
          if (!window.Stores['myStore']) {
            let _value = 'Initial value';
            const _subs = [];
            window.Stores['myStore'] = {
              get: function () { return _value; },
              set: function (v) { _value = v; _subs.forEach(function (fn) { fn(v); }); },
              subscribe: function (fn) {
                fn(_value);
                _subs.push(fn);
                return function () { _subs.splice(_subs.indexOf(fn), 1); };
              },
            };
          }

          const store = window.Stores['myStore'];
          valueEl.textContent = store.get();
          store.subscribe(function (value) {
            valueEl.textContent = value;
          });
        })();
      </script>
    </div>
  `;
}
```

If the store has already been created by the page script or another island, the `if (!window.Stores['myStore'])` check prevents overwriting it. Initialize the store in the page's `<script>` tag to ensure it exists before `DOMContentLoaded`:

```astro
<script>
  import { setupStore } from "../../stores/demo";
  setupStore("myStore");
  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("store-input").value = window.Stores["myStore"].get();
  });
</script>
```

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```ts
export default function MyComponent({
  showMessage = "",
  initialCount = 0,
}: {
  showMessage?: string;
  initialCount?: number;
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
    // eslint-disable-next-line no-new-func
    new Function(script.textContent ?? "")();
  });
}
```

> `new Function` is required because `innerHTML` does not execute `<script>` tags, and `replaceChild` does not execute scripts in happy-dom.

Mock `window.Stores` before rendering so the test controls store updates:

```ts
beforeEach(() => {
  let storeValue = "Initial value";
  let capturedListener;
  (window as any).Stores = {
    myStore: {
      get: vi.fn(() => storeValue),
      set: vi.fn((v) => { storeValue = v; capturedListener?.(v); }),
      subscribe: vi.fn((fn) => {
        capturedListener = fn;
        fn(storeValue);
        return () => {};
      }),
    },
  };
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
