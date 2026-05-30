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
    name: "islands/twig",
    renderToStaticMarkup,
    supportsAstroStaticSlot: false,
  };
}

async function checkComponent(Component: unknown): Promise<boolean> {
  if (typeof Component === "string") return true;
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
