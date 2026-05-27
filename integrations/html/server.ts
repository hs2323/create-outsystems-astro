import type { NamedSSRLoadedRendererValue } from "astro";

async function check(Component: unknown): Promise<boolean> {
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

async function renderToStaticMarkup(): Promise<{ html: string }> {
  return { html: "" };
}

const renderer: NamedSSRLoadedRendererValue = {
  name: "islands/html",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
};

export default renderer;
