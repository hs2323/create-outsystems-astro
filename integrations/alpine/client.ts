import type { Alpine as AlpineType } from "alpinejs";

import BundledAlpine from "alpinejs";

/** The reactive props object Alpine sees as the island's scope. */
const PROPS = Symbol.for("islands/alpine/props");

type IslandElement = {
  [PROPS]?: Record<string, unknown>;
} & HTMLElement;

declare global {
  interface Window {
    Alpine?: AlpineType;
  }
}

/**
 * Returns the page's Alpine, starting the bundled one if there is none.
 *
 * Two Alpine instances on one page would both process the same directives, so
 * an Alpine the page already loaded (the OutSystems app, `@astrojs/alpinejs`)
 * is reused. `initTree` skips elements that are already initialized, so a page
 * Alpine that starts after this island rendered leaves it alone.
 */
function getAlpine(): AlpineType {
  if (!window.Alpine) {
    window.Alpine = BundledAlpine;
    BundledAlpine.start();
  }
  return window.Alpine;
}

/**
 * Replaces each `<slot>` in the markup with the matching Astro slot content.
 * A `<slot>` with no matching content keeps its children as the fallback.
 */
function projectSlots(root: HTMLElement, slotted: Record<string, string>) {
  root.querySelectorAll("slot").forEach((slot) => {
    const html = slotted[slot.getAttribute("name") || "default"];
    const template = document.createElement("template");
    template.innerHTML = html ?? slot.innerHTML;
    slot.replaceWith(template.content);
  });
}

const client_default =
  (element: IslandElement) =>
  (
    Component: unknown,
    props: Record<string, unknown>,
    slotted: Record<string, string>,
  ) => {
    // The island runtime and the OutSystems Islands module both set `ssr` when
    // they want the island (re-)rendered. Without it there is nothing to do.
    if (!element.hasAttribute("ssr")) return;
    if (typeof Component !== "function") return;

    const Alpine = getAlpine();
    const scope = element[PROPS];

    // A props update only has to reach Alpine's scope: bindings that read a
    // prop re-evaluate, and state such as a counter's count is kept.
    if (scope) {
      for (const key of Object.keys(scope)) {
        if (!(key in props)) delete scope[key];
      }
      Object.assign(scope, props);
      return;
    }

    const markup = (Component as (p: Record<string, unknown>) => string)({
      ...props,
    });

    Alpine.mutateDom(() => {
      element.innerHTML = markup;
      projectSlots(element, slotted);
    });

    // The props become the island's Alpine scope, so any expression in the
    // markup — `x-data="{ count: initialCount }"`, say — can read them.
    const reactiveProps = Alpine.reactive({ ...props });
    element[PROPS] = reactiveProps;
    Alpine.addScopeToNode(element, reactiveProps);

    Array.from(element.children).forEach((child) =>
      Alpine.initTree(child as HTMLElement),
    );
  };

export default client_default;
