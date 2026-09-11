/**
 * Client entrypoint for the Qwik renderer.
 *
 * `@qwik.dev/astro` ships a server entrypoint only, so Astro emits an
 * `<astro-island>` with no `renderer-url` and no serialized `props`, and the
 * island runtime falls back to a no-op hydrator. That is enough for a page
 * Astro rendered itself — Qwik resumes the container in the markup — but an
 * island whose contents are supplied later (the OutSystems Islands module) or
 * not at all has nothing to resume and stays empty.
 *
 * This entrypoint fills that gap. It leaves server-rendered markup alone so
 * resumability is preserved, and client-renders whenever there is no container
 * to resume or the props have changed.
 */
import { jsx, type JSXNode, render } from "@qwik.dev/core";
import { QWIK_LOADER } from "@qwik.dev/core/loader";

/** Marks an island this hydrator has already handled, so a second call is a props update. */
const HANDLED = Symbol.for("islands/qwik/handled");

/** Holds the slot content, which Astro's island runtime hands over only once. */
const SLOTS = Symbol.for("islands/qwik/slots");

type IslandElement = {
  [HANDLED]?: boolean;
  [SLOTS]?: Record<string, string>;
} & HTMLElement;

/**
 * Installs the qwikloader, which delegates DOM events to Qwik handlers.
 *
 * A server-rendered page gets this from Qwik's own build, but an island that
 * renders on the client has no such script, so its handlers never fire.
 * Qwik registers the event names it needs on `window._qwikEv` as it renders;
 * the loader picks them up. It no-ops if another loader already claimed
 * `_qwikEv`, so calling this more than once is safe.
 */
function ensureQwikLoader(): void {
  const script = document.createElement("script");
  script.setAttribute("qwik-loader", "");
  script.textContent = QWIK_LOADER;
  document.head.appendChild(script);
}

/**
 * Rebuilds Astro's slot content as Qwik children. Named slots are projected
 * with `q:slot`, matching what `<Slot name="..." />` expects.
 */
function toChildren(slotted: Record<string, string>): JSXNode[] {
  return Object.entries(slotted).map(([name, html]) =>
    jsx("astro-slot", {
      dangerouslySetInnerHTML: html,
      ...(name === "default" ? {} : { "q:slot": name }),
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

    // First pass over markup Astro server-rendered: the Qwik container is
    // already there and the qwikloader resumes it. Rendering over it would
    // throw away resumability for no gain.
    if (!element[HANDLED] && element.querySelector("[q\\:container]")) {
      element[HANDLED] = true;
      return;
    }

    if (typeof Component !== "function") return;

    // Either the island arrived empty, or its props changed and the resumed
    // container has to be replaced. Both cases are a fresh client render.
    element.innerHTML = "";
    element.removeAttribute("q:container");
    ensureQwikLoader();

    await render(
      element,
      jsx(Component as Parameters<typeof jsx>[0], {
        ...props,
        children: toChildren(element[SLOTS] ?? {}),
      }),
      { serverData: props },
    );

    element[HANDLED] = true;
  };

export default client_default;
