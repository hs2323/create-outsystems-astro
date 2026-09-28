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
    name: "islands/stencil",
    renderToStaticMarkup,
    supportsAstroStaticSlot: false,
  };
}

/**
 * A Stencil component is a class the Stencil compiler has proxied into a
 * custom element. The proxy sets the tag name as the static `is` and adds
 * `__registerHost` to the prototype, so those identify one without
 * constructing it: custom elements can only be created in the browser.
 */
async function checkComponent(Component: unknown): Promise<boolean> {
  return (
    typeof Component === "function" &&
    typeof (Component as { is?: unknown }).is === "string" &&
    typeof (Component as { prototype?: { __registerHost?: unknown } }).prototype
      ?.__registerHost === "function"
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
