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
    name: "islands/lit",
    renderToStaticMarkup,
    supportsAstroStaticSlot: false,
  };
}

/**
 * A Lit component is a `LitElement` (or `ReactiveElement`) subclass. The
 * class is not constructed here: custom elements can only be created in the
 * browser. `finalize` and `elementProperties` are statics every reactive
 * element has, so they identify one without importing `lit`.
 */
async function checkComponent(Component: unknown): Promise<boolean> {
  return (
    typeof Component === "function" &&
    typeof (Component as { finalize?: unknown }).finalize === "function" &&
    (Component as { elementProperties?: unknown }).elementProperties instanceof
      Map
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
