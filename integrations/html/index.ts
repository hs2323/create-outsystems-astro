import type { AstroIntegration, AstroRenderer, ViteUserConfig } from "astro";

function getRenderer(development: boolean): AstroRenderer {
  return {
    name: "islands/html",
    clientEntrypoint: "islands-integrations/html/client",
    serverEntrypoint: "islands-integrations/html/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer(false);

export interface Options {
  include?: string[];
  exclude?: string[];
  compat?: boolean;
  devtools?: boolean;
}

export default function (_options: Options = {}): AstroIntegration {
  return {
    name: "islands/html",
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig, command }) => {
        addRenderer(getRenderer(command === "dev"));
        updateConfig({ vite: {} });
      },
    },
  };
}
