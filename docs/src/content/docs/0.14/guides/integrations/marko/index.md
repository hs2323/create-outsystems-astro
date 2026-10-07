---
title: Marko Integration
description: Marko integration for Create OutSystems Astro
slug: 0.14/guides/integrations/marko
---

The Marko integration lets you build Astro Islands with [Marko](https://markojs.com/) 6. A component is a `.marko` file written with the Tags API. The integration compiles it with Marko's compiler in the Astro build, and the island mounts the template and passes the island's props as `input`.

## Component structure

```marko
<!-- src/framework/marko/Counter.marko -->
export interface Input {
  initialCount: number;
  showMessage: string;
}

<let/changedCount=(undefined as number | undefined)>
<const/count=changedCount ?? input.initialCount>

<pre>${count}</pre>
<button onClick() { changedCount = count + 1 }>+</button>
```

Import the component in the page with its extension and use `client:load`:

```astro
---
import Counter from "../../framework/marko/Counter.marko";
---
<Counter client:load initialCount={5} showMessage="showMessage" />
```

Declaring `export interface Input` makes the file TypeScript, so the island's props are typed. To render one Marko component inside another, import the child's `.marko` file and use it as a tag.

The island renders only while it has the `ssr` attribute: Astro sets it on the first render, and the OutSystems Islands module sets it again when it changes the props. A hydrate call without `ssr` does nothing.

The template is mounted once. When the Islands module changes the props, the same instance is updated with the new `input`, so `<let>` state (such as `changedCount` above) is kept. When Astro removes the island, the instance is destroyed, which runs the cleanup of its `<script>` tags.

## Configuration

```js
// astro.config.mjs
import marko from "islands-integrations/marko";

export default defineConfig({
  integrations: [
    marko({
      include: ["src/framework/marko/*"],
    }),
  ],
});
```

`include` and `exclude` take path prefixes. The integration only compiles `.marko` files. The production build uses Marko's optimized runtime and the dev server its debug runtime.

## Styles

The template renders into the light DOM, so the page stylesheet applies to it. A `<style>` block in a `.marko` file is global CSS and is bundled with the page's other CSS.

## Slots

The Marko integration does not support Astro slots. Pass content in as props instead.

## Nano Stores

Marko has no Nano Stores binding library, and Nano Stores are not supported for the Marko integration.

## Using OutSystems handlers

Pass the handler name as a string prop and call it via `window`:

```marko
<button onClick() {
  const handler = (window as any)[input.showMessage];
  if (typeof handler === "function") handler(count);
}>
  Send value
</button>
```

## Testing

### Integration tests

Use [Marko Testing Library](https://testing-library.com/docs/marko-testing-library/intro). Add the integration's loader to the Vitest project, so the tests compile the components as the Astro build does, and resolve the `browser` export condition, which is the build of the library that mounts templates in the DOM:

```ts
// vitest.config.ts
import { markoLoader } from "islands-integrations/marko";

export default defineConfig({
  plugins: [markoLoader({ include: ["src/framework/marko/*"] })],
  resolve: { conditions: ["browser"] },
});
```

`render` mounts the template with the input as given. The library destroys the template after each test:

```ts
import { fireEvent, render, screen } from "@marko/testing-library";

import Counter from "../../../src/framework/marko/Counter.marko";

test("increments counter", async () => {
  await render(Counter, { initialCount: 5, showMessage: "" });
  await fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByText("6")).toBeInTheDocument();
});
```

`rerender` updates the mounted template with new input, as the Islands module does when it changes the props.

### End-to-end tests

Use Playwright as with any other framework:

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/marko/marko-demo");
});

test("increments counter", async ({ page }) => {
  await page.getByRole("button", { name: "+" }).click();
  await expect(page.locator("pre")).toContainText("6");
});
```
