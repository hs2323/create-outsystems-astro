import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/jquery/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/**
 * Renders a jQuery component as an Astro island.
 *
 * There is no official Astro integration for jQuery. This integration
 * registers a client-only renderer. A component is a function that returns
 * markup with inline scripts, as with the Vanilla JS integration; the scripts
 * do the work with the global `jQuery`, which the client entrypoint provides
 * when the page has none. Slots are not supported.
 */
function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/jquery/client",
    name: "islands/jquery",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/jquery/server",
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
                        `import { createRenderer } from "islands-integrations/jquery/server";`,
                        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
                      ].join("\n");
                    },
                    name: "islands/jquery/filter",
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
    name: "islands/jquery",
  };
}
