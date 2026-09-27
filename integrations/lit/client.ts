/** The Lit element rendered into the island. */
const ELEMENT = Symbol.for("islands/lit/element");
/** The props last set on that element. */
const PROPS = Symbol.for("islands/lit/props");

type IslandElement = {
  [ELEMENT]?: HTMLElement;
  [PROPS]?: Record<string, unknown>;
} & HTMLElement;

let anonymousCount = 0;

/**
 * Creates the custom element for a Lit class. A class the module registered
 * with `customElements.define` keeps its tag; one that was never registered
 * gets a generated tag, since a custom element cannot be created without one.
 */
function createElement(Component: CustomElementConstructor): HTMLElement {
  const name = customElements.getName?.(Component);
  if (name) return document.createElement(name);

  try {
    return new Component();
  } catch {
    let tag: string;
    do {
      tag = `islands-lit-${++anonymousCount}`;
    } while (customElements.get(tag));
    customElements.define(tag, Component);
    return document.createElement(tag);
  }
}

/**
 * Moves the Astro slots into the element's light DOM. Each slot is wrapped in
 * an `<astro-slot>` (styled `display: contents` by Astro), and a named one
 * gets the matching `slot` attribute so the shadow `<slot name>` shows it.
 */
function projectSlots(element: HTMLElement, slotted: Record<string, string>) {
  for (const [name, html] of Object.entries(slotted)) {
    const slot = document.createElement("astro-slot");
    if (name !== "default") slot.setAttribute("slot", name);
    slot.innerHTML = html;
    element.appendChild(slot);
  }
}

/** Sets the props as element properties, which Lit re-renders from. */
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
    if (typeof Component !== "function") return;

    // A props update only has to reach the element's properties: Lit
    // re-renders what reads them, and internal state such as a count is kept.
    const existing = element[ELEMENT];
    if (existing) {
      setProps(existing, props, element[PROPS]);
      element[PROPS] = { ...props };
      return;
    }

    const litElement = createElement(Component as CustomElementConstructor);
    setProps(litElement, props);
    projectSlots(litElement, slotted);

    element[ELEMENT] = litElement;
    element[PROPS] = { ...props };
    element.replaceChildren(litElement);
  };

export default client_default;
