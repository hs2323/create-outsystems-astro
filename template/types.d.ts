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
