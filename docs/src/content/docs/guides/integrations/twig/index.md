---
title: Twig Integration
description: Twig integration for Create OutSystems Astro
---

The Twig integration lets you build Astro Islands using [Twig.js](https://github.com/twigjs/twig.js/) templates — the JavaScript implementation of the [Twig templating language](https://twig.symfony.com/). A component is a native `.twig` file that you import directly into an Astro page. The island's props are passed to the template as the render context, so `{{ variables }}` and Twig filters/tags are resolved on the client.

## When to use

* You already author markup with Twig (for example, coming from a Symfony or Craft CMS background) and want to reuse those templates as islands.
* You want declarative, logic-light templates with Twig's `{{ }}` interpolation, filters, and control tags instead of writing a full framework component.

## Setup

The integration is registered automatically when you scaffold with `create-outsystems-astro`. No additional configuration is needed.

## Component structure

A Twig component is a native `.twig` file. The integration registers a Vite loader, so you can import a `.twig` file directly as an Astro Island component. Props passed on the island become the render context, so reference them with `{{ }}`:

```twig
{# src/framework/twig/MyComponent.twig #}

{% set count = initialCount|default(0) %}

<div class="my-component">
  <pre class="count">{{ count }}</pre>
  <button class="add">+</button>
  <script>
    (function () {
      const container = (document.currentScript && document.currentScript.parentElement)
        || document.querySelector('.my-component');
      let count = {{ count }};
      const countEl = container.querySelector('.count');
      container.querySelector('.add').addEventListener('click', function () {
        count += 1;
        countEl.textContent = count;
      });
    })();
  </script>
</div>
```

The renderer reads the `.twig` file's contents, compiles it with `Twig.twig({ data })`, and calls `.render(props)` on the client. Anything Twig.js understands — `{{ value }}`, `{% set %}`, `{% if %}`, `{% for %}`, comments (`{# … #}`), and filters like `|default`, `|merge`, or `|upper` — works against the props you pass on the island.

\*\*\* Note \*\*\*: Use Twig's `|default(...)` filter for any value that may be missing so the rendered markup (and any inline script) stays valid when a prop is omitted. As with the HTML integration, be careful with global variables in the script tag so nothing leaks out of the island.

### Importing assets

Because a `.twig` file cannot run TypeScript `import`s, resolve build-time assets (such as image URLs) in the `.astro` page and pass them in as props:

```twig
{% if logo %}<img alt="Logo" src="{{ logo }}" />{% endif %}
```

### TypeScript function alternative

The renderer also accepts a `.ts` file that exports a function returning a Twig template string, which is useful when you need TypeScript to build the template:

```ts
// src/framework/twig/MyComponent.ts
export default function MyComponent(): string {
  return `<div class="my-component">{{ initialCount|default(0) }}</div>`;
}
```

### Includes

`{% include %}` works across files. Because islands render in the browser — where Twig.js has no filesystem loader — the integration resolves includes at build time and inlines the referenced template into the island. Paths resolve relative to the including file, and the inlined markup shares the island's props as its render context:

```twig
{# src/framework/twig/Card.twig #}
{% include "./partials/header.twig" %}
<div class="card-body">{{ body }}</div>
```

Includes may be nested, and `{% include "…" ignore missing %}` is honored when the target file does not exist. An include that forms a cycle, or that points at a missing file without `ignore missing`, fails the build with an error.

#### Namespaces

Includes can also use Twig namespaces (`@name/...`) so templates reference a shared library by an alias instead of a long relative path. Map each namespace to a base directory with the `namespaces` option in `astro.config.mjs`:

```js
// astro.config.mjs
import twig from "islands-integrations/twig";

export default defineConfig({
  integrations: [
    twig({
      include: ["src/framework/twig/*"],
      namespaces: {
        "@items": "./src/framework/twig/items",
      },
    }),
  ],
});
```

A namespaced include then resolves `@items` to its configured directory:

```twig
{% include "@items/components/element.twig" %}
```

Namespace keys may be written with or without the leading `@` (`"@items"` and `"items"` are equivalent), and relative base directories resolve from the project root. An include that uses a namespace with no matching entry fails the build with an error.

#### Passing context with `with` and `only`

The `with { … }` and `only` modifiers on an include are honored. Use `with { … }` to remap or supply variables for the included template, and add `only` to isolate it from the surrounding context so it sees just the variables you pass:

```twig
{% include "@items/components/element.twig" with {
  content: content,
} %}
```

Some Twig features still rely on a runtime loader and are **not** supported, so keep those self-contained:

* Dynamic include paths (`{% include someVariable %}`) — only static, quoted paths are inlined.
* Macros (`{% import %}` / `{% from %}`) and template inheritance (`{% extends %}` / `{% block %}`).

## Page setup

Import the `.twig` file, use `client:load` on the component in your `.astro` page, and pass props as attributes. Those attributes become the Twig render context (including any assets you resolve in the page):

```astro
---
import Logo from "../../images/logo.png?url";
import MyComponent from "../../framework/twig/MyComponent.twig";
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
      logo={Logo}
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

Use `@testing-library/dom` directly. Import the raw template with Vite's `?raw` suffix, render it with `Twig.twig({ data }).render(props)` before setting `document.body.innerHTML`, then execute the scripts using `new Function` so they run in the test's global context:

```ts
import { fireEvent, screen } from "@testing-library/dom";
import Twig from "twig";
import template from "../../../src/framework/twig/MyComponent.twig?raw";

function renderComponent(props: Record<string, unknown> = {}) {
  document.body.innerHTML = Twig.twig({ data: template }).render(props);
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
