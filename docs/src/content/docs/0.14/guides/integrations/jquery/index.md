---
title: jQuery Integration
description: jQuery integration for Create OutSystems Astro
slug: 0.14/guides/integrations/jquery
---

The jQuery integration lets you build Astro Islands with [jQuery](https://jquery.com/). As with the [Vanilla JS integration](../vanilla/), a component is a TypeScript function that returns an HTML string with an inline `<script>`. The script does the work with jQuery: it outputs the HTML, binds the events and subscribes to stores.

## Component structure

A jQuery component is a TypeScript function that accepts props and returns an HTML string. Keep the returned markup to a container and the script, and let jQuery build the rest:

```ts
// src/framework/jquery/MyComponent.ts

export default function MyComponent({
  initialCount = 0,
}: {
  initialCount?: number;
}): string {
  return `
    <div class="my-component">
      <script>
        (function ($) {
          const $container = document.currentScript
            ? $(document.currentScript).parent()
            : $(".my-component");
          let count = ${Number(initialCount)};

          $container.append(
            '<pre class="count"></pre>' +
            '<button class="add">+</button>'
          );

          const $count = $container.find(".count").text(count);

          $container.on("click", ".add", function () {
            $count.text(++count);
          });
        })(jQuery);
      </script>
    </div>
  `;
}
```

The inline `<script>` is re-created as a classic script when the island hydrates, so it cannot `import`. It uses the global `jQuery`, passed in as `$` so the component does not depend on a global `$`.

Values interpolated into the script become JavaScript source. Serialize strings with `JSON.stringify` and numbers with `Number` rather than placing them inside quotes.

\*\*\* Note \*\*\*: Be careful when using global variables in the script tag. Wrap the script in a function, as above, so its variables do not leak out of the island.

### jQuery on the page

The renderer uses the page's `window.jQuery` when there is one, such as a jQuery the OutSystems app already loads, so plugins registered on it are available to the script. Otherwise it sets `window.jQuery` to the bundled jQuery 4 before the script runs.

## Page setup

Use `client:load` on the component in your `.astro` page:

```astro
---
import MyComponent from "../../framework/jquery/MyComponent";
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

## Rendering and props updates

The island renders only while it has the `ssr` attribute: Astro sets it on the first render, and the OutSystems Islands module sets it again when it changes the props. When the props change, the component renders again from the new props.

Before it renders again, the renderer triggers an `islands:unmount` jQuery event on the island and then empties it, which removes the rendered elements with their jQuery handlers and data. Listen for `islands:unmount` to undo anything else, such as a subscription:

```js
$container.closest("astro-island").one("islands:unmount", unsubscribe);
```

## Slots

Slots are not supported in the jQuery integration. Pass content in as props instead.

## Nano Stores

jQuery has no official Nano Stores binding library, and Nano Stores are not supported for the jQuery integration.

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```ts
export default function MyComponent({
  showMessage,
}: {
  showMessage?: string;
}): string {
  return `
    <div class="my-component">
      <script>
        (function ($) {
          const $container = document.currentScript
            ? $(document.currentScript).parent()
            : $(".my-component");
          const showMessage = ${JSON.stringify(showMessage)};

          $container.append('<button class="send">Send</button>');

          $container.on("click", ".send", function () {
            if (typeof window[showMessage] === "function") {
              window[showMessage]("Hello from jQuery");
            }
          });
        })(jQuery);
      </script>
    </div>
  `;
}
```

## Testing

### Integration tests

Render the component through the renderer's client entrypoint, which also sets `window.jQuery`. happy-dom does not execute the re-created scripts, so run them with `new Function`:

```ts
import { fireEvent, screen } from "@testing-library/dom";
import jqueryClient from "islands-integrations/jquery/client";

import MyComponent from "../../../src/framework/jquery/MyComponent";

function renderComponent(props = {}) {
  const island = document.createElement("astro-island");
  document.body.appendChild(island);
  // The island only renders while it has the `ssr` attribute.
  island.setAttribute("ssr", "");
  jqueryClient(island)(MyComponent, { initialCount: 5, ...props });
  island.removeAttribute("ssr");

  island.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("increments counter", () => {
  renderComponent();
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByText("6")).toBeInTheDocument();
});
```

### End-to-end tests

Use Playwright as with any other framework:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/jquery/jquery-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
