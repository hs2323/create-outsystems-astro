import fs from "node:fs";

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

// Loads native `.twig` files as modules whose default export is the raw
// template string. The client renderer then compiles and renders it with the
// island's props as the Twig context.
function twigLoaderPlugin() {
  return {
    enforce: "pre" as const,
    load(id: string) {
      const filepath = id.split("?")[0];
      if (!filepath.endsWith(".twig")) return;
      const source = fs.readFileSync(filepath, "utf-8");
      return {
        code: `export default ${JSON.stringify(source)};`,
        map: null,
      };
    },
    name: "islands/twig/loader",
  };
}

function twigFilterPlugin(include?: string[], exclude?: string[]) {
  return {
    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_SERVER_ID) return;
      return [
        `import { createRenderer } from "islands-integrations/twig/server";`,
        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
      ].join("\n");
    },
    name: "islands/twig/filter",
    resolveId(id: string) {
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
    },
  };
}

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
          vite: {
            plugins: filtered
              ? [twigLoaderPlugin(), twigFilterPlugin(include, exclude)]
              : [twigLoaderPlugin()],
          },
        });
      },
    },
    name: "islands/twig",
  };
}
