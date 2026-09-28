/** The Stencil element rendered into the island. */
const ELEMENT = Symbol.for("islands/stencil/element");
/** The props last set on that element. */
const PROPS = Symbol.for("islands/stencil/props");

type IslandElement = {
  [ELEMENT]?: HTMLElement;
  [PROPS]?: Record<string, unknown>;
} & HTMLElement;

/** A class the Stencil compiler proxied into a custom element. */
type StencilComponent = { is: string } & CustomElementConstructor;

/**
 * Creates the custom element for a Stencil component. The loader registers
 * each component when its module is imported, under the tag from its
 * `@Component` decorator; the class is registered here only if that has not
 * happened yet.
 */
function createElement(Component: StencilComponent): HTMLElement {
  if (!customElements.get(Component.is)) {
    customElements.define(Component.is, Component);
  }
  return document.createElement(Component.is);
}

/**
 * Moves the Astro slots into the element's light DOM. Each slot is wrapped in
 * an `<astro-slot>` (styled `display: contents` by Astro), and a named one
 * gets the matching `slot` attribute so the component's `<slot name>` shows
 * it. This happens before the element is connected, so a component without a
 * shadow root also finds the slot content when Stencil relocates it.
 */
function projectSlots(element: HTMLElement, slotted: Record<string, string>) {
  for (const [name, html] of Object.entries(slotted)) {
    const slot = document.createElement("astro-slot");
    if (name !== "default") slot.setAttribute("slot", name);
    slot.innerHTML = html;
    element.appendChild(slot);
  }
}

/** Sets the props as element properties, which Stencil re-renders from. */
function setProps(
  element: HTMLElement,
  props: Record<string, unknown>,
  previous: Record<string, unknown> = {},
) {
  const target = element as unknown as Record<string, unknown>;
  for (const key of Object.keys(previous)) {
    if (!(key in props)) target[key] = undefined;
  }
  Object.assign(target, props);
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
    if (
      typeof Component !== "function" ||
      typeof (Component as { is?: unknown }).is !== "string"
    ) {
      return;
    }

    // A props update only has to reach the element's properties: Stencil
    // re-renders what reads them, and `@State` such as a count is kept.
    const existing = element[ELEMENT];
    if (existing) {
      setProps(existing, props, element[PROPS]);
      element[PROPS] = { ...props };
      return;
    }

    const stencilElement = createElement(Component as StencilComponent);
    setProps(stencilElement, props);
    projectSlots(stencilElement, slotted);

    element[ELEMENT] = stencilElement;
    element[PROPS] = { ...props };
    element.replaceChildren(stencilElement);
  };

export default client_default;
