import type { AstroIntegration, AstroRenderer } from "astro";

function getRenderer(): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/html/client",
    name: "islands/html",
    serverEntrypoint: "islands-integrations/html/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer();

export interface Options {
  compat?: boolean;
  devtools?: boolean;
  exclude?: string[];
  include?: string[];
}

export default function (): AstroIntegration {
  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer(getRenderer());
        updateConfig({ vite: {} });
      },
    },
    name: "islands/html",
  };
}
