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
    name: "islands/alpine",
    renderToStaticMarkup,
    supportsAstroStaticSlot: false,
  };
}

/**
 * An Alpine component is a function that returns its markup. A plain string
 * export is not accepted: Astro renders a string component as an HTML tag.
 */
async function checkComponent(Component: unknown): Promise<boolean> {
  if (typeof Component === "function") {
    try {
      const result = (Component as (p: Record<string, unknown>) => unknown)({});
      return typeof result === "string";
    } catch {
      return false;
    }
  }
  return false;
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
