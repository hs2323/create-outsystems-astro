import type {
  AstroComponentMetadata,
  NamedSSRLoadedRendererValue,
} from "astro";

export function createRenderer(
  include?: string[],
  exclude?: string[],
): NamedSSRLoadedRendererValue {
  return {
    check: async (
      Component: unknown,
      _props: unknown,
      _slots: unknown,
      metadata?: AstroComponentMetadata,
    ) => {
      const url = metadata?.componentUrl;
      if (url) {
        if (include && !matchesPatterns(url, include)) return false;
        if (exclude && matchesPatterns(url, exclude)) return false;
      }
      return checkComponent(Component);
    },
    name: "islands/marko",
    renderToStaticMarkup,
    supportsAstroStaticSlot: false,
  };
}

/**
 * A Marko component is the template object its compiled module exports, with
 * a `mount` method that renders it into the DOM. Importing the template does
 * not touch the DOM, so it can be identified on the server.
 */
async function checkComponent(Component: unknown): Promise<boolean> {
  return (
    typeof Component === "object" &&
    Component !== null &&
    typeof (Component as { mount?: unknown }).mount === "function"
  );
}

function matchesPatterns(url: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const prefix = pattern.replace(/\/?\*+$/, "");
    return url.includes(prefix);
  });
}

async function renderToStaticMarkup(): Promise<{ html: string }> {
  return { html: "" };
}

export default createRenderer();
