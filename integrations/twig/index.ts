import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/twig/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/twig/client",
    name: "islands/twig",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/twig/server",
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
                        `import { createRenderer } from "islands-integrations/twig/server";`,
                        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
                      ].join("\n");
                    },
                    name: "islands/twig/filter",
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
    name: "islands/twig",
  };
}
