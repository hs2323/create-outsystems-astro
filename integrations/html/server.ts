import type { NamedSSRLoadedRendererValue } from "astro";

async function check(Component: unknown): Promise<boolean> {
  if (typeof Component === "string") return true;
  if (typeof Component === "function") {
    try {
      const result = (Component as () => unknown)({});
      return typeof result === "string";
    } catch {
      return false;
    }
  }
  return false;
}

async function renderToStaticMarkup(
  Component: unknown,
  props: Record<string, unknown>,
  { default: children = "", ...slots }: Record<string, string> = {},
): Promise<{ html: string }> {
  if (typeof Component === "string") return { html: Component };
  if (typeof Component === "function") {
    return {
      html: (Component as (p: Record<string, unknown>) => string)({
        ...props,
        children,
        ...slots,
      }),
    };
  }
  return { html: "" };
}

const renderer: NamedSSRLoadedRendererValue = {
  name: "islands/html",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};

export default renderer;
