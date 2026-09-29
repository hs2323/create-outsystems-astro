/// <reference types="astro/client" />
/// <reference types="marko" />

declare module "*.twig" {
  const content: string;
  export default content;
}

// A wildcard module cannot see each template's `Input`, so any input is
// accepted.
declare module "*.marko" {
  const template: Marko.Template<Record<string, unknown>>;
  export default template;
}
