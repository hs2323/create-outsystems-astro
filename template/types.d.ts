/// <reference types="astro/client" />
/// <reference path="content.d.ts" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.gts" {
  const component: object;
  export default component;
}

declare module "ember-astro/client.js" {
  export default function emberAstroClientRenderer(
    element: HTMLElement,
  ): (
    component: unknown,
    props: Record<string, unknown>,
    slots: Record<string, string>,
  ) => Promise<void>;
}

// @stencil/core declares a global `jest.Matchers.toHaveAttribute` that takes
// only the attribute name. Vitest's `expect` extends `jest.Matchers`, so that
// declaration hides jest-dom's, which also takes the expected value. Declaring
// jest-dom's signature here merges it back in as an overload.
declare namespace jest {
  interface Matchers<R, T> {
    toHaveAttribute(attr: string, value?: unknown): R;
  }
}
