// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightVersions from "starlight-versions";

const externalLinkAttributes = { rel: "noopener noreferrer", target: "_blank" };

// https://astro.build/config
export default defineConfig({
  base: "/create-outsystems-astro",
  integrations: [
    starlight({
      customCss: ["./src/styles/custom.css"],
      favicon: "/favicon.ico",
      plugins: [
        starlightVersions({
          versions: [{ slug: "0.14" }, { slug: "0.13" }, { slug: "0.12" }],
        }),
      ],
      sidebar: [
        {
          items: [
            { label: "Getting Started", slug: "guides/getting-started" },
            {
              items: [
                { label: "Astro", slug: "guides/astro" },
                { label: "Nano Stores", slug: "guides/nanostores" },
              ],
              label: "Client",
            },
            {
              items: [
                { label: "Alpine.js", slug: "guides/integrations/alpine" },
                {
                  attrs: externalLinkAttributes,
                  label: "Angular",
                  link: "https://angular.dev/",
                },
                {
                  attrs: externalLinkAttributes,
                  label: "Ember",
                  link: "https://emberjs.com/",
                },
                { label: "jQuery", slug: "guides/integrations/jquery" },
                { label: "Lit", slug: "guides/integrations/lit" },
                { label: "Marko", slug: "guides/integrations/marko" },
                {
                  attrs: externalLinkAttributes,
                  label: "Preact",
                  link: "https://preactjs.com/",
                },
                { label: "Qwik", slug: "guides/integrations/qwik" },
                {
                  attrs: externalLinkAttributes,
                  label: "React",
                  link: "https://react.dev/",
                },
                {
                  attrs: externalLinkAttributes,
                  label: "Solid",
                  link: "https://www.solidjs.com/",
                },
                { label: "Stencil", slug: "guides/integrations/stencil" },
                {
                  attrs: externalLinkAttributes,
                  label: "Svelte",
                  link: "https://svelte.dev/",
                },
                { label: "Twig", slug: "guides/integrations/twig" },
                {
                  label: "Vanilla JS",
                  slug: "guides/integrations/vanilla",
                },
                {
                  attrs: externalLinkAttributes,
                  label: "Vue",
                  link: "https://vuejs.org/",
                },
              ],
              label: "Integrations",
            },
            {
              items: [
                { label: "O11", slug: "guides/outsystems/o11" },
                { label: "ODC", slug: "guides/outsystems/odc" },
              ],
              label: "OutSystems",
            },
          ],
          label: "Guides",
        },
      ],
      social: [
        {
          href: "https://github.com/hs2323/create-outsystems-astro",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "OutSystems Astro Islands",
    }),
  ],
  site: "https://hs2323.github.io",
});
