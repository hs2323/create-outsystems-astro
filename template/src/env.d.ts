/// <reference types="astro/client" />

declare module "*.twig" {
  const content: string;
  export default content;
}
