# OutSystems Astro Islands Development Instructions

## Project Context

- This is not an Astro project that will be deployed on its own. It is only used for the output generation.
- The output generation will be only client side. No server side rendering or server side components will be used.
- The Astro Islands can be used generated with the following frameworks:
  - Alpine.js - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/alpine/
  - Angular - Documentation available at https://analogjs.org/docs/packages/astro-angular/overview
  - Ember - Documentation available at https://github.com/ember-tooling/ember-astro
  - jQuery - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/jquery/
  - Lit - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/lit/
  - Preact - Documentation available at https://docs.astro.build/en/guides/integrations-guide/preact/
  - Qwik - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/qwik/
  - React - Documentation available at https://docs.astro.build/en/guides/integrations-guide/react/
  - SolidJS - Documentation available at https://docs.astro.build/en/guides/integrations-guide/solid-js/
  - Svelte - Documentation availabe at https://docs.astro.build/en/guides/integrations-guide/svelte/
  - Twig - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/twig/
  - Vanilla JS - Documentation available at https://hs2323.github.io/create-outsystems-astro/guides/integrations/vanilla/
  - Vue - Documentation available at https://docs.astro.build/en/guides/integrations-guide/vue/
- Prefer to use TypeScript when possible.

## OutSystems

- This project works for OutSystems 11 (O11) Reactive and OutSystems Developer Cloud (ODC). It does not work with OutSystems 11 Traditional projects.
- The documentation for importing a component into OutSystems 11 is availabe at https://hs2323.github.io/create-outsystems-astro/guides/outsystems/o11/.
- The documentation for importing a component into OutSystems 11 is availabe at https://hs2323.github.io/create-outsystems-astro/guides/outsystems/o11/.

## Development

### Starting project

- Documentation about usage of the generator is located at: https://hs2323.github.io/create-outsystems-astro/guides/astro/.
- The project can intialized from the Create OutSystems Astro package (https://www.npmjs.com/package/create-outsystems-astro).
- In this document, for any reference to running package manager script, the `PM` attribute should be replaced with whatever package manager the user is using.

In OutSystems 11, the Islands library is available at https://www.outsystems.com/forge/component-overview/22857/islands-o11.

In OutSystems Developer Cloud, the Islands library is available at https://www.outsystems.com/forge/component-overview/22960/islands-odc.

- When starting a project, the demo files should be deleted. The demo files under src/ and test/.

### Pages

- The files in src/pages/\*.astro are used as a starting point and holds the components for generation. They can be tested by running `npm run dev`. That will show what the component looks like as rendered. The sample example pages are broken out by framework name (src/pages/react, src/pages/vue, etc). This page will house the component(s) entry points.
- When importing a component, the component must have the attribute of the client:only= + the framework name.\
  - Alpine.js: `client:load`
  - Angular: `client:load`
  - Ember: `client:only="ember-astro"` (the renderer's registered name; `client:only="ember"` fails)
  - jQuery: `client:load`
  - Lit: `client:load`
  - Preact: `client:only="preact"`
  - Qwik: `client:load` to keep server rendering, so Qwik resumes the container it emitted, or `client:only="@qwik.dev/astro"` to render entirely on the client.
  - React: `client:only="react"`
  - SolidJS: `client:only="solid-js"`
  - Svelte: `client:only="svelte"`
  - Twig: `client:load`
  - Vanilla JS: `client:load`
  - Vue: `client:only="vue"`

### Components

- The components live in the folder framework/{NAME}/:
  - Alpine.js: src/framework/alpine
  - Angular: src/framework/angular
  - Ember: src/framework/ember
  - jQuery: src/framework/jquery
  - Lit: src/framework/lit
  - Preact: src/framework/react
  - Qwik: src/framework/qwik
  - React: src/framework/react
  - SolidJS: src/framework/solid
  - Svelte: src/framework/svelte
  - Vue: src/framework/vue

The framework folder should stay in place as the components will be rendered from there. The Angular components will only be transformed by Astro if they are in the framework/angular folder.

- For any JSX based libraries, the @jsxImportSource directive must be at the top of the file.
  - Preact:

```js
/** @jsxImportSource preact */
```

- Qwik:

```js
/** @jsxImportSource @qwik.dev/core */
```

- React:

```js
/** @jsxImportSource react */
```

- SolidJS:

```js
/** @jsxImportSource solid-js */
```

#### Alpine.js components

- An Alpine.js component is a TypeScript module whose default export is a function that returns Alpine markup as a string. A plain string export does not work, because Astro renders a string component as an HTML tag.
- The island renders only while it has the `ssr` attribute, on the first render and whenever the Islands module sets `ssr` again with new props. It renders the markup once, then Alpine initializes it. Alpine is started by the renderer unless the page already has one on `window.Alpine`.
- The island's props are in scope for every Alpine expression, as if they were declared on an `x-data` around the component, and they are reactive. When the Islands module changes the props, bindings that read them update and component state is kept. Values interpolated into the string with `${}` are only the initial values.

```ts
export default function Counter(): string {
  return `
    <div x-data="{ count: initialCount }">
      <pre x-text="count"></pre>
      <button x-on:click="count++">+</button>
      <button x-on:click="window[showMessage](count)">Send value</button>
    </div>
  `;
}
```

#### jQuery components

- A jQuery component works like a Vanilla JS one: a TypeScript function that returns an HTML string with an inline `<script>`. The script does the work with jQuery: it outputs the HTML, binds the events and subscribes to stores. Keep the returned markup to a container and the script.
- The script is a classic script and cannot `import`. It uses the global `jQuery`, wrapped as `(function ($) { ... })(jQuery)`. The renderer uses the page's `window.jQuery` if there is one, so plugins registered on it are available; otherwise it sets `window.jQuery` to the bundled jQuery before the script runs.
- Serialize values interpolated into the script with `JSON.stringify` (strings) or `Number` (numbers).
- The island renders only while it has the `ssr` attribute, on the first render and whenever the Islands module sets `ssr` again with new props. On a props update the component renders again from the new props. Before that, the renderer triggers an `islands:unmount` jQuery event on the island and empties it; listen for `islands:unmount` to undo anything else, such as a Nano Store subscription.

```ts
export default function Counter({
  initialCount = 0,
  showMessage = "",
}: {
  initialCount?: number;
  showMessage?: string;
}): string {
  return `
    <div class="counter">
      <script>
        (function ($) {
          const $container = document.currentScript
            ? $(document.currentScript).parent()
            : $(".counter");
          const showMessage = ${JSON.stringify(showMessage)};
          let count = ${Number(initialCount)};

          $container.append(
            '<pre class="count"></pre>' +
            '<button class="add">+</button>' +
            '<button class="send">Send value</button>'
          );

          const $count = $container.find(".count").text(count);

          $container.on("click", ".add", function () {
            $count.text(++count);
          });
          $container.on("click", ".send", function () {
            window[showMessage](count);
          });
        })(jQuery);
      </script>
    </div>
  `;
}
```

#### Ember components

- An Ember component is a `.gts` (or `.gjs`) template-tag file whose default export is a Glimmer component. The `ember-astro` integration compiles it. See https://github.com/ember-tooling/ember-astro.
- Astro props arrive in the `@props` argument (`@props.initialCount`), not as individual `@` arguments, and slots arrive as HTML strings in `@slots`.
- The island renders only while it has the `ssr` attribute. `ember-astro` renders the component once and ignores later prop changes from the Islands module, so the component keeps its first props until the island is recreated.
- Keep internal state in `@tracked` fields and bind events with the `on` modifier. Do not initialize a `@tracked` field from `this.args` (the `ember/no-tracked-properties-from-args` lint rule); keep a tracked override and read the argument through a getter, as below.
- `.gts` and `.gjs` files are linted with `eslint-plugin-ember`, using `ember-eslint-parser`.

```gts
import { on } from "@ember/modifier";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

interface CounterSignature {
  Args: {
    props: { initialCount: number; showMessage: string };
    slots: { default?: string; header?: string };
  };
}

export default class Counter extends Component<CounterSignature> {
  // The count starts from `initialCount` and is kept once the user changes it.
  @tracked private changedCount: number | undefined;

  get count(): number {
    return this.changedCount ?? this.args.props.initialCount;
  }

  add = () => {
    this.changedCount = this.count + 1;
  };

  showParentMessage = () => {
    (window as any)[this.args.props.showMessage](this.count);
  };

  <template>
    <pre>{{this.count}}</pre>
    <button type="button" {{on "click" this.add}}>+</button>
    <button type="button" {{on "click" this.showParentMessage}}>
      Send value
    </button>
  </template>
}
```

#### Lit components

- A Lit component is a TypeScript module whose default export is a `LitElement` class. Register it with `customElements.define` in the module, guarded because the renderer also imports the module during the build. A class that is never registered gets a generated tag name.
- Declare reactive properties with `static properties` and `declare` fields rather than decorators or class field initializers, which would shadow Lit's accessors. Set defaults in the constructor.
- The island renders only while it has the `ssr` attribute, on the first render and whenever the Islands module sets `ssr` again with new props. The element is created once and the props are set as element properties. When the Islands module changes the props, the same element gets the new values and Lit re-renders, so internal state is kept.
- The element renders into a shadow root, so the page stylesheet does not reach it. Adopt it with `static styles = unsafeCSS(styles)`, importing the stylesheet with `?inline`.

```ts
import { html, LitElement } from "lit";

export default class Counter extends LitElement {
  static override properties = {
    count: { state: true },
    initialCount: { type: Number },
    showMessage: { type: String },
  };

  declare count: number | undefined;
  declare initialCount: number;
  declare showMessage: string;

  constructor() {
    super();
    this.initialCount = 0;
    this.showMessage = "";
  }

  override render() {
    const count = this.count ?? this.initialCount;
    return html`
      <pre>${count}</pre>
      <button @click=${() => (this.count = count + 1)}>+</button>
      <button @click=${() => (window as any)[this.showMessage](count)}>
        Send value
      </button>
    `;
  }
}

if (typeof window !== "undefined" && !customElements.get("lit-counter")) {
  customElements.define("lit-counter", Counter);
}
```

#### Twig assets

- A `.twig` component cannot run `import`s, so build-time assets are referenced with Twig's `asset()` function, the same one PHP's Twig provides:

```twig
<img alt="Logo" src="{{ asset('images/logo.png') }}" />
```

- The integration resolves each `asset()` call when the template is loaded and replaces it with the bundled asset URL, so the file is emitted and hashed like an asset imported from a framework component.
- A plain path resolves from `src`, a `./` or `../` path resolves from the template that uses it, and an `@name/...` path resolves through the `namespaces` option of the `twig()` integration. The path must be a static, quoted string, so `asset(someVariable)` fails the build. Assets only known at runtime are still passed in as props.

### Parameters

- Parameters are assigned as attributes on the component. Each framework will then handle them as incoming parameters.
- OutSystems will pass in parameters already prepared for the astro-island. It already has copied the Astro method of serialization in https://github.com/withastro/astro/blob/main/packages/astro/src/runtime/server/serialize.ts.

#### Slots

Astro slots can be sent in. A slot can be either the default one or the named one. Each framework handles slots differently. Slots can only be HTML elements and cannot be components of a framework.

##### Alpine.js

- In Alpine.js, slots are handled with `<slot>` elements in the markup. The default slot is `<slot></slot>` and a named slot is `<slot name="header"></slot>`. Each one is replaced with the matching slot content before Alpine initializes the island; a `<slot>` with no matching content keeps its children as the fallback.

```js
---
import CounterComponent from '../../framework/alpine/Counter';
---
<CounterComponent client:load>
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```ts
export default function Counter(): string {
  return `
    <slot name="header"></slot>
    <div>
      <slot></slot>
    </div>
  `;
}
```

##### Lit

- In Lit, slots are handled with native shadow DOM `<slot>` elements. The default slot is `<slot></slot>` and a named slot is `<slot name="header"></slot>`. The renderer moves each Astro slot into the element's light DOM, wrapped in an `<astro-slot>` with the matching `slot` attribute, so the shadow `<slot>` shows it. Slot content stays in the light DOM and is styled by the page stylesheet.

```js
---
import CounterComponent from '../../framework/lit/Counter';
---
<CounterComponent client:load>
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```ts
render() {
  return html`
    <slot name="header"></slot>
    <div>
      <slot></slot>
    </div>
  `;
}
```

##### Ember

- In Ember, Astro slots are HTML strings in the `@slots` argument, keyed by slot name. Insert them with triple curlies so they are not escaped: `{{{@slots.default}}}` and `{{{@slots.header}}}`. `{{yield}}` and block params are not available from Astro.

```js
---
import CounterComponent from '../../framework/ember/Counter.gts';
---
<CounterComponent client:only="ember-astro">
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```gts
<template>
  {{{@slots.header}}}
  <div>
    {{{@slots.default}}}
  </div>
</template>
```

##### Angular

Angular does not support the use of slots. Any use of slots with Angular should be discouraged.

##### Twig

The Twig integration does not support the use of slots. Any use of slots with the Twig integration should be discouraged. Pass content in as props and render it with `{{ }}` instead.

##### jQuery

The jQuery integration does not support the use of slots. Any use of slots with the jQuery integration should be discouraged. Pass content in as props instead.

##### Vanilla JS

The Vanilla JS integration does not support the use of slots. Any use of slots with the Vanilla JS integration should be discouraged.

##### Preact

- In Preact, slots are handled as props. The default slot is the `children` prop. A named slot will have the name of its slot as the parameter. For example, a slot with the following:

```js
<div slot="header">Header content</div>
```

will have the parameter named header.

- The slots are then rendered using the regular Preact rendering parameter method. With the following Astro component:

```js
---
import CounterComponent from '../../framework/preact/Counter';
---
<CounterComponent client:only="preact">
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```js
export default function Counter({
	children,
	header,
}: {
	children: ComponentChildren;
	header: ComponentChildren;
}) {

	return (
		<>
      {header}
			<div>
				{children}
			</div>
		</>
	);
}
```

##### Qwik

- In Qwik, slots are handled with the `<Slot />` component. The default slot is `<Slot />` and a named slot is `<Slot name="header" />`. In the `.astro` page the content is still marked with the regular `slot` attribute, not `q:slot`.

```js
---
import CounterComponent from '../../framework/qwik/Counter';
---
<CounterComponent>
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```tsx
/** @jsxImportSource @qwik.dev/core */
import { component$, Slot } from "@qwik.dev/core";

export default component$(() => {
  return (
    <>
      <Slot name="header" />
      <div>
        <Slot />
      </div>
    </>
  );
});
```

##### React

- In React, slots are handled as props. The default slot is the `children` prop. A named slot will have the name of its slot as the parameter. For example, a slot with the following:

```js
<div slot="header">Header content</div>
```

will have the parameter named header.

- The slots are then rendered using the regular React rendering parameter method. With the following Astro component:

```js
---
import CounterComponent from '../../framework/react/Counter';
---
<CounterComponent client:only="react">
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```js
export default function Counter({
	children,
	header,
}: {
	children: React.ReactNode;
	header: React.ReactNode;
}) {

	return (
		<>
      {header}
			<div>
				{children}
			</div>
		</>
	);
}
```

##### SolidJS

- In SolidJS, slots are handled as props. The default slot is the `children` prop. A named slot will have the name of its slot as the parameter. For example, a slot with the following:

```js
<div slot="header">Header content</div>
```

will have the parameter named header.

- The slots are then rendered using the regular React rendering parameter method. With the following Astro component:

```js
---
import CounterComponent from '../../framework/solid/Counter';
---
<CounterComponent client:only="solid-js">
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```js
export default function Counter({
	children,
	header,
}: {
	children: JSX.Element;
	header: JSX.Element;
}) {

	return (
		<>
      {header}
			<div>
				{children}
			</div>
		</>
	);
}
```

##### Svelte

- In Svelte, slots are handled as by using the <slot /> tag. The default slot is the is just <slot />. A named slot will have the name of its slot as an attribute such as <slot name="header" />. Placement of the slot will determine where the slot will render.

```js
---
import CounterComponent from "../../framework/svelte/Counter.svelte";
---
<CounterComponent client:only="svelte">
    <div class="counter-title" slot="header">Counter Component</div>
    <div style="text-align: center;">
        <p><strong>This is content passed into the component.</strong></p>
    </div>
</CounterComponent>
```

the slots can be used as:

```svelte
<slot name="header" />
<div>
  <slot />
</div>
```

##### Vue

- In Vue, slots are handled as by using the <slot /> tag. The default slot is the is just <slot />. A named slot will have the name of its slot as an attribute such as <slot name="header" />. Placement of the slot will determine where the slot will render.

```js
---
import CounterComponent from '../../framework/react/Counter';
---
<CounterComponent client:only="vue">
    <div slot="header">
        Counter Component
    </div>
    <div style="text-align: center;">
        <p>This is content passed into the component.</p>
    </div>
</CounterComponent>
```

the slots can be used as:

```js
<template>
  <div>
    <slot name="header" />
    <slot />
  </div>
</template>
```

### Nano Stores

The Nano Stores library - https://github.com/nanostores/nanostores - is supported for both sharing state between different Islands or from OutSystems to an Island. This could be used in place of a parameter, but parameters should be the default method.

The current supported OutSystems Nano Stores module only suports Atoms and Maps. It can either subscribe to an Atom or Map. It can also listen to Keys of a Map.

The OutSystems 11 library is called Lightweight State Manager - https://www.outsystems.com/forge/component-overview/23528/lightweight-state-manager-o11 is available in the O11 Forge.

The OutSystems Developer Cloud library is called Lightweight State Manager and is available in the ODC Forge.

Nano Stores are supported for Alpine.js - https://github.com/nanostores/alpine, Lit - https://github.com/nanostores/lit, Preact - https://github.com/nanostores/preact, React - https://github.com/nanostores/react, SolidJS - https://github.com/nanostores/solid, Svelte - https://svelte.dev/docs/svelte/svelte-files#script-4-prefix-stores-with-$-to-access-their-values and Vue - https://github.com/nanostores/vue. The Vanilla JS and jQuery integrations have no binding library and use the vanilla JS API through `window.Stores`. Ember has no binding library either; it subscribes with the vanilla JS API and copies the value into a `@tracked` field. Nano Stores are not supported for Angular 21, for the Twig integration, where a `.twig` file and its inline classic script cannot run imports, nor for Qwik, which has no binding library and whose maintainers recommend against global stores in favour of custom events - https://github.com/QwikDev/astro#communicating-across-containers.

In OutSystems, the store will be on the Window object. The Islands component will then have to access it from there.

#### Preact

```jsx
import { useStore } from "@nanostores/preact";

export default function Counter({}) {
  const nanoStoreValue = useStore(window.Stores["MyGreatStore"]);

  return (
    <>
      <div>
        <strong>Nano Store value:</strong>
        <div>{nanoStoreValue}</div>
      </div>
    </>
  );
}
```

#### React

```jsx
import { useStore } from "@nanostores/react";

export default function Counter({}) {
  const nanoStoreValue = useStore(window.Stores["MyGreatStore"]);

  return (
    <>
      <div>{nanoStoreValue}</div>
    </>
  );
}
```

#### SolidJS

```jsx
import { useStore } from "@nanostores/solid";

export default function Counter({}) {
  const nanoStoreValue = useStore(window.Stores["MyGreatStore"]);

  return (
    <>
      <div>{nanoStoreValue}</div>
    </>
  );
}
```

#### Svelte

```svelte
<script lang="ts">
  const nanoStoreValue = (window as any).Stores["svelteStore"];
</script>

<div>{$nanoStoreValue}</div>
```

#### Alpine.js

The Alpine.js integration uses `@nanostores/alpine`, following https://github.com/nanostores/nanostores#alpinejs. The integration does not install the plugin. Each component module that uses stores calls `registerNanoStores()` from `src/framework/alpine/nanostores.ts`, which runs `Alpine.plugin(NanoStores)` on `window.Alpine`, or on `alpine:init` if Alpine has not been created yet. That provides the `x-nano` and `x-nano-model` directives and the `$nano` magic. Do not import `alpinejs` in a component module: it uses browser globals when it loads, and the renderer imports component modules during the build. Bind the store from `window.Stores` with `x-nano:NAME`, where `NAME` is a single lowercase word (Alpine does not camelCase it) that becomes a variable in scope. `x-nano` reads the store when Alpine initializes, so register the atom from the component module first, guarded because the renderer also imports the module during the build:

```ts
import { setupStore } from "../../stores/demo";
import { registerNanoStores } from "./nanostores";

if (typeof window !== "undefined") {
  setupStore("alpineStore");
  registerNanoStores();
}
```

```html
<div x-data x-nano:value="window.Stores['alpineStore']">
  <div x-text="value"></div>
</div>
```

#### Ember

Nano Stores has no Ember binding. Subscribe with the vanilla JS API in the constructor, copy each value into a `@tracked` field so the template re-renders, and unsubscribe with `registerDestructor` when the component is destroyed:

```gts
import { registerDestructor } from "@ember/destroyable";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

import { setupStore } from "../../stores/demo";

export default class MyComponent extends Component {
  @tracked value: string;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const store = setupStore("emberStore");
    this.value = store.get();
    registerDestructor(this, store.subscribe((value: string) => {
      this.value = value;
    }));
  }

  <template>
    <div>{{this.value}}</div>
  </template>
}
```

#### jQuery

The jQuery integration has no binding library, so it uses the vanilla JS API against a real atom, like the Vanilla JS integration. Register the atom from the component module, guarded because the renderer also imports the module during the build, then subscribe from the inline script and unsubscribe on `islands:unmount`:

```ts
import { setupStore } from "../../stores/demo";

if (typeof window !== "undefined") {
  setupStore("jqueryStore");
}
```

```html
<div class="my-component">
  <script>
    (function ($) {
      const $container = $(document.currentScript).parent();
      $container.append('<div class="nanostore-value"></div>');

      const store = window.Stores && window.Stores["jqueryStore"];

      if (store) {
        const unsubscribe = store.subscribe(function (value) {
          $container.find(".nanostore-value").text(value);
        });
        $container.closest("astro-island").one("islands:unmount", unsubscribe);
      }
    })(jQuery);
  </script>
</div>
```

#### Lit

The Lit integration uses `@nanostores/lit`. The integration itself does not depend on Nano Stores; the component adds a `StoreController`, which subscribes while the element is connected and re-renders it when the store changes. The controller is created in the constructor, which only runs in the browser, so reading `window.Stores` there is safe.

```ts
import { StoreController } from "@nanostores/lit";
import { html, LitElement } from "lit";

import { setupStore } from "../../stores/demo";

export default class MyComponent extends LitElement {
  private store = new StoreController(this, setupStore("litStore"));

  override render() {
    return html`<div>${this.store.value}</div>`;
  }
}
```

#### Vanilla JS

The Vanilla JS integration has no binding library, so it uses the vanilla JS API against a real atom. Register the atom from the component module, guarded because the renderer also imports the module during the build, then subscribe from the inline script:

```ts
import { setupStore } from "../../stores/demo";

if (typeof window !== "undefined") {
  setupStore("vanillaStore");
}
```

```html
<div class="nanostore-value"></div>
<script>
  const nanostoreEl = container.querySelector(".nanostore-value");
  const store = window.Stores && window.Stores["vanillaStore"];

  if (store) {
    store.subscribe(function (value) {
      nanostoreEl.textContent = value;
    });
  }
</script>
```

#### Vue

```vue
<script setup lang="ts">
import { useStore } from "@nanostores/vue";
const nanoStoreValue = useStore(window.Stores["MyGreatStore"]);
</script>

<template>
  <div>{{ nanoStoreValue }}</div>
</template>
```

### Testing

- There is a preset set of testing tools, but can be changed after generation.
- The unit testing library setup is Vitest. The unit tests are located in `test/unit` folder.
- The integration testing library is Testing Library with an equivalent library per framework. Each framework is in its own folder in `test/integration/{FRAMEWORK}`.
- The end-to-end testing library is Playwright. Each framework is in its own folder in `test/e2e/{FRAMEWORK}`.

### Linting and formatting

- Prettier is currently added for formatting. ESLint is used for linting.

### TypeScript

- If using TypeScript, it is recommended to do a TypeScript check.

### Handlers

- Incoming functions from OutSystems cannot be passed as function handlers. The way that OutSystems will invoke them is by binding the function with the name to the `window` object of the page. Then it will pass in that name as a parameter. For example, if you need a function handler of `ShowMessage`, it will need to be called as `window[ShowMessage]`.
- Passing in basic text, number and boolean should be fine to the handler. Any array or object must be JSON stringified prior to being passed into the handler.

## Generating output

- The `.env.template` must be copied over to `.env`.
- The name of the module/library/application where the component will live must be set in the `ASSET_URL` variable of the `.env` file.
- Run the command `PM run output`. This will run the Astro build and then run an additional step to generate the output necessary for importing into OutSystems.
- The official `@astrojs/alpinejs` integration does not register a renderer, it only starts Alpine over the whole page, so Alpine markup would never be wrapped in an `<astro-island>` and there would be nothing for the output step to keep. The template uses `islands-integrations/alpine` instead, which registers a renderer with a `clientEntrypoint`, so the island carries `component-url`, `renderer-url` and `props` like any other framework.
- Ember uses the community `ember-astro` integration (https://github.com/ember-tooling/ember-astro), which registers its renderer as `ember-astro` with a `clientEntrypoint`, so the island carries `component-url`, `renderer-url` and `props` like any other framework. It takes no options and compiles `.gts`/`.gjs` files wherever they are. It renders the component once and does not re-render when the Islands module changes the props.
- There is no official Astro integration for jQuery. The template uses `islands-integrations/jquery`, which registers a client-only renderer with a `clientEntrypoint`, so the island carries `component-url`, `renderer-url` and `props` like any other framework. A component returns markup with inline scripts, as with Vanilla JS, and the renderer provides the global `jQuery` those scripts use.
- The official `@astrojs/lit` integration was deprecated in Astro 5 and is no longer maintained. It rendered through `@lit-labs/ssr`, which needs a server. The template uses `islands-integrations/lit` instead, which registers a client-only renderer with a `clientEntrypoint`, so the island carries `component-url`, `renderer-url` and `props` like any other framework.
- Qwik renders a Qwik container (a `<div q:container>`) rather than markup Astro hydrates. Given a `client:load` directive, Astro wraps that container in an `<astro-island>`, so the output step has something to keep. `@qwik.dev/astro` registers its renderer without a `clientEntrypoint`, which would make Astro omit `renderer-url`, `component-export` and the serialized `props` attribute and leave the island inert; the template wraps it in `islands-integrations/qwik` to supply one. With that in place the island resumes the server markup when it has any, renders on the client when it does not, and re-renders when the Islands module changes `props`.
- The output will be in the output/ folder. The contents are:
  - HTML file(s) \*.html:
    - This will contain only the `<astro-island>` component. It will be necessary for the users to copy over the `component-url`, `renderer-url` and `opts`. The rest will either be custom built in OutSystems or not needed. The `uid` will be generated by OutSystems. The `component-export`, `client`, `ssr` and `await-children` will be automatically added in the OutSystems Islands module.
    - The slot content will be converted and parsed in a way that can be then dropped in as text directly into the OutSystem parameter.
  - JavaScript files \*.js:
    - The JavaScript files will be imported as resources and then mapped as parameters when importing the Islands module.
  - Asset files:
    The `/assets` folder may contain images, stylesheets and other assets. For images, they should be copied in as resources into the module/library/component/application. Any CSS must be manually copied from the `.css` files and manually imported into the project or the block level CSS.
