import type { AstroIntegration, AstroRenderer } from "astro";

const CLIENT_ENTRYPOINT = "islands-integrations/qwik/client";

/**
 * Gives the Qwik renderer a client entrypoint.
 *
 * `@qwik.dev/astro` registers a renderer with a `serverEntrypoint` only. Astro
 * adds `renderer-url`, `component-export` and the serialized `props` attribute
 * to an island only when its renderer has a `clientEntrypoint`, so without one
 * the island is emitted as an inert wrapper: props never reach the component,
 * and an island that arrives without server-rendered markup inside it has
 * nothing to resume and stays empty.
 *
 * Wrap the upstream integration with this to fill that gap:
 *
 * ```js
 * import qwikAstro from "@qwik.dev/astro";
 * import qwik from "islands-integrations/qwik";
 *
 * integrations: [qwik(qwikAstro({ include: ["src/framework/qwik/*"] }))];
 * ```
 *
 * Everything else — the standalone Qwik client build, the manifest, the Vite
 * plugins — is left to the upstream integration. This only intercepts the
 * `addRenderer` call it makes during setup.
 */
export default function qwik(integration: AstroIntegration): AstroIntegration {
  const setup = integration.hooks["astro:config:setup"];

  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      "astro:config:setup": async (params) => {
        await setup?.({
          ...params,
          addRenderer: (renderer: AstroRenderer) =>
            params.addRenderer({
              ...renderer,
              clientEntrypoint: CLIENT_ENTRYPOINT,
            }),
        });
      },
    },
  };
}
