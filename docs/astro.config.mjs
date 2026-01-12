// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightVersions from "starlight-versions";

// https://astro.build/config
export default defineConfig({
  base: "/create-outsystems-astro",
  integrations: [
    starlight({
      customCss: ["./src/styles/custom.css"],
      favicon: "/favicon.ico",
      plugins: [
        starlightVersions({
          versions: [{ slug: "0.1" }, { slug: "0.2" }, { slug: "0.3" }],
        }),
      ],
      sidebar: [
        {
          items: [
            { label: "Getting Started", slug: "guides/getting-started" },
            {
              items: [{ label: "Astro", slug: "guides/astro" }],
              label: "Client",
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
