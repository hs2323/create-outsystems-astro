---
title: Twig Integration
description: Twig integration for Create OutSystems Astro
---

The Twig integration lets you build Astro Islands using [Twig.js](https://github.com/twigjs/twig.js/) templates — the JavaScript implementation of the [Twig templating language](https://twig.symfony.com/). A component is a TypeScript file that returns a Twig template string. The component's props are passed to the template as the render context, so `{{ variables }}` and Twig filters/tags are resolved on the client.

## When to use

* You already author markup with Twig (for example, coming from a Symfony or Craft CMS background) and want to reuse those templates as islands.
* You want declarative, logic-light templates with Twig's `{{ }}` interpolation, filters, and control tags instead of writing a full framework component.

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro`. No additional configuration is needed.

## Component structure

A Twig component is a TypeScript function that returns a Twig template string. Props passed on the island become the render context, so reference them with `{{ }}`:

```ts
// src/framework/twig/MyComponent.ts

export default function MyComponent(): string {
  return `
    <div class="my-component">
      <pre class="count">{{ initialCount|default(0) }}</pre>
      <button class="add">+</button>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          let count = {{ initialCount|default(0) }};
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

The renderer compiles the returned string with `Twig.twig({ data })` and calls `.render(props)`, so anything Twig understands — `{{ value }}`, `{% if %}`, `{% for %}`, filters like `|default` or `|upper` — works against the props you pass on the island.

\*\*\* Note \*\*\*: Use Twig's `|default(...)` filter for any value that may be missing so the rendered markup (and any inline script) stays valid when a prop is omitted. As with the HTML integration, be careful with global variables in the script tag so nothing leaks out of the island.

## Page setup

Use `client:load` on the component in your `.astro` page and pass props as attributes. Those attributes become the Twig render context:

```astro
---
import MyComponent from "../../framework/twig/MyComponent";
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

`client:load` is used instead of `client:only` because the Twig renderer uses it to associate the client entrypoint with the island. The server rendering step intentionally returns empty HTML, so the output only contains the island props — identical to how `client:only` frameworks like React behave. The Twig compilation and rendering happen on the client.

## Slots

Slots are not supported in the Twig integration. Pass content in as props and render it with `{{ }}` instead.

## Nano Stores

The Twig integration does not use a Nano Stores binding library. Instead, the component sets up a compatible store directly on `window.Stores` inside its `<script>` tag. The store implements the same `get`, `set`, and `subscribe` interface as a nanostores atom, so it works alongside stores from other framework islands on the same page.

```ts
export default function MyComponent(): string {
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

Pass the handler name as a string prop and call it via `window`. Render the name into the script with Twig:

```ts
export default function MyComponent(): string {
  return `
    <div class="my-component">
      <button class="send">Send value</button>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.my-component');
          let count = {{ initialCount|default(0) }};
          container.querySelector('.send').addEventListener('click', function () {
            if ('{{ showMessage|default('') }}' && window['{{ showMessage|default('') }}']) {
              window['{{ showMessage|default('') }}'](count);
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

Use `@testing-library/dom` directly. Because the component returns a Twig template, render it with `Twig.twig({ data }).render(props)` before setting `document.body.innerHTML`, then execute the scripts using `new Function` so they run in the test's global context:

```ts
import { fireEvent, screen } from "@testing-library/dom";
import Twig from "twig";
import MyComponent from "../../../src/framework/twig/MyComponent";

function renderComponent(props: Record<string, unknown> = {}) {
  document.body.innerHTML = Twig.twig({ data: MyComponent() }).render(props);
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

Mock `window.Stores` before rendering so the test controls store updates:

```ts
beforeEach(() => {
  let storeValue = "Initial value";
  let capturedListener;
  (window as { Stores: Record<string, unknown> } & Window).Stores = {
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
  await page.goto("/twig/my-component");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
