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
          versions: [{ slug: "0.10" }, { slug: "0.9" }, { slug: "0.8" }],
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
                {
                  attrs: externalLinkAttributes,
                  label: "Angular",
                  link: "https://angular.dev/",
                },
                { label: "HTML", slug: "guides/integrations/html" },
                {
                  attrs: externalLinkAttributes,
                  label: "Preact",
                  link: "https://preactjs.com/",
                },
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
                {
                  attrs: externalLinkAttributes,
                  label: "Svelte",
                  link: "https://svelte.dev/",
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
