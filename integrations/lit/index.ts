import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/lit/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/**
 * Renders a Lit element as an Astro island.
 *
 * `@astrojs/lit` was deprecated in Astro 5 and is no longer maintained. It
 * rendered through `@lit-labs/ssr`, which needs a server. This integration
 * registers a client-only renderer instead. A component is a module whose default export
 * is a `LitElement` class. The client entrypoint creates the element in the
 * island, sets the island's props as element properties and moves the Astro
 * slots into its light DOM, where the element's shadow `<slot>`s show them.
 */
function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/lit/client",
    name: "islands/lit",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/lit/server",
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
                        `import { createRenderer } from "islands-integrations/lit/server";`,
                        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
                      ].join("\n");
                    },
                    name: "islands/lit/filter",
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
    name: "islands/lit",
  };
}
