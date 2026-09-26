import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/alpine/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/**
 * Renders Alpine.js markup as an Astro island.
 *
 * `@astrojs/alpinejs` does not register a renderer: it injects a page script
 * that starts Alpine over the whole document. Astro only wraps a component in
 * an `<astro-island>` when a renderer claims it, so with the official
 * integration there is no island for the output step to keep, and no props or
 * slots to hand to the OutSystems Islands module.
 *
 * This integration registers one. A component is a module whose default
 * export is a function that returns Alpine markup. The client entrypoint
 * renders it into the island, exposes the props to Alpine as reactive scope
 * and starts Alpine if the page has not.
 */
function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/alpine/client",
    name: "islands/alpine",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/alpine/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer(false);

export interface Options {
  exclude?: string[];
  include?: string[];
}

export default function (options: Options = {}): AstroIntegration {
  const { exclude, include } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        updateConfig({
          vite: filtered
            ? {
                plugins: [
                  {
                    load(id: string) {
                      if (id !== RESOLVED_VIRTUAL_SERVER_ID) return;
                      return [
                        `import { createRenderer } from "islands-integrations/alpine/server";`,
                        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
                      ].join("\n");
                    },
                    name: "islands/alpine/filter",
                    resolveId(id: string) {
                      if (id === VIRTUAL_SERVER_ID)
                        return RESOLVED_VIRTUAL_SERVER_ID;
                    },
                  },
                ],
              }
            : {},
        });
      },
    },
    name: "islands/alpine",
  };
}
