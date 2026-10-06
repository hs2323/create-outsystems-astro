/**
 * Client entrypoint for the Qwik renderer.
 *
 * `@qwik.dev/astro` ships a server entrypoint only, so Astro emits an
 * `<astro-island>` with no `renderer-url` and no serialized `props`, and the
 * island runtime falls back to a no-op hydrator. Qwik islands are used with
 * `client:only`, so there is no server-rendered container to resume: this
 * entrypoint renders the component on the client, and again whenever the
 * props change.
 */
import { jsx, type JSXNode, render } from "@qwik.dev/core";
import { QWIK_LOADER } from "@qwik.dev/core/loader";

declare global {
  interface Window {
    /** Event names queued for the qwikloader, or the loader once installed. */
    _qwikEv?: { roots: Set<Node> } | unknown[];
  }
}

/** Holds the slot content, which Astro's island runtime hands over only once. */
const SLOTS = Symbol.for("islands/qwik/slots");

/** Tears down the previous render, so a props update can replace it. */
const CLEANUP = Symbol.for("islands/qwik/cleanup");

type IslandElement = {
  [CLEANUP]?: () => void;
  [SLOTS]?: Record<string, string>;
} & HTMLElement;

/**
 * Installs the qwikloader, which delegates DOM events to Qwik handlers.
 *
 * A server-rendered page gets this from Qwik's own build, but an island that
 * renders on the client has no such script, so its handlers never fire.
 * Qwik registers the event names it needs on `window._qwikEv` as it renders;
 * the loader picks them up.
 *
 * The loader must only run once. Its state lives in top-level `var`s, which a
 * second run resets before its own already-installed check. The running
 * loader then re-registers every event with fresh listeners, so each handler
 * fires once per extra run.
 */
function ensureQwikLoader(): void {
  // An installed loader replaces the `_qwikEv` array with an object that
  // holds its roots.
  if (window._qwikEv && "roots" in window._qwikEv) return;

  const script = document.createElement("script");
  script.setAttribute("qwik-loader", "");
  script.textContent = QWIK_LOADER;
  document.head.appendChild(script);
}

/**
 * Rebuilds Astro's slot content as Qwik children. Named slots are projected
 * with `q:slot`, matching what `<Slot name="..." />` expects.
 *
 * On a props update Astro's island runtime collects the slots again from the
 * rendered `<astro-slot>` elements, keyed by their `name` attribute and
 * falling back to `default`. Named slots need that attribute too, or they are
 * read back as the default slot and their content is lost.
 */
function toChildren(slotted: Record<string, string>): JSXNode[] {
  return Object.entries(slotted).map(([name, html]) =>
    jsx("astro-slot", {
      dangerouslySetInnerHTML: html,
      ...(name === "default" ? {} : { name, "q:slot": name }),
    }),
  );
}

const client_default =
  (element: IslandElement) =>
  async (
    Component: unknown,
    props: Record<string, unknown>,
    slotted: Record<string, string>,
    { client }: { client: string },
  ) => {
    if (client !== "only" && !element.hasAttribute("ssr")) return;

    // Astro's island runtime reads the slot templates out of the DOM and
    // removes them, so it only ever passes them in once. Keep them, or a later
    // render — a props update, say — would drop the slot content.
    if (Object.keys(slotted).length > 0) element[SLOTS] = slotted;

    if (typeof Component !== "function") return;

    // A props update replaces the previous render. Qwik caches its container
    // on the element it renders into and diffs against that on the next
    // render, so each render gets a fresh element rather than reusing one
    // whose contents were cleared out from under it.
    element[CLEANUP]?.();
    const root = document.createElement("div");
    root.style.display = "contents";
    element.replaceChildren(root);
    ensureQwikLoader();

    const { cleanup } = await render(
      root,
      jsx(Component as Parameters<typeof jsx>[0], {
        ...props,
        children: toChildren(element[SLOTS] ?? {}),
      }),
      { serverData: props },
    );
    element[CLEANUP] = cleanup;
  };

export default client_default;
