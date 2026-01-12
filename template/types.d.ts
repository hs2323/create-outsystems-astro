/// <reference types="astro/client" />
/// <reference path="content.d.ts" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
