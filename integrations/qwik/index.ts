import fs from "node:fs/promises";
import path from "node:path";

import type { AstroConfig, AstroIntegration, AstroRenderer } from "astro";

const CLIENT_ENTRYPOINT = "islands-integrations/qwik/client";

/** The output directory Qwik emits its client chunks into. */
const QWIK_BUILD_DIR = /^build\//;

/** Upstream plugin that hands the server entrypoint its render options. */
const VIRTUAL_MODULE_PLUGIN = "qwik-astro:virtual";

interface VitePlugin {
  load?: (this: unknown, id: string) => unknown;
  name: string;
}

/**
 * Gives the Qwik renderer a client entrypoint, and moves its client build into
 * Astro's assets directory.
 *
 * `@qwik.dev/astro` registers a renderer with a `serverEntrypoint` only. Astro
 * adds `renderer-url`, `component-export` and the serialized `props` attribute
 * to an island only when its renderer has a `clientEntrypoint`, so without one
 * the island is emitted as an inert wrapper: props never reach the component,
 * and an island that arrives without server-rendered markup inside it has
 * nothing to resume and stays empty.
 *
 * It also emits its client chunks to a top-level `build/` directory. Astro's
 * assets directory is what gets carried into OutSystems, so the chunks are
 * moved there and `q:base` is pointed at it to match.
 *
 * Wrap the upstream integration with this to fill both gaps:
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
 * `addRenderer` and `updateConfig` calls it makes during setup.
 */
export default function qwik(integration: AstroIntegration): AstroIntegration {
  const setup = integration.hooks["astro:config:setup"];

  return {
    ...integration,
    hooks: {
      ...integration.hooks,
      "astro:config:setup": async (params) => {
        const { assets } = params.config.build;
        // Dev serves Qwik's chunks itself, from paths of its own.
        const isBuild = params.command === "build";

        await setup?.({
          ...params,
          addRenderer: (renderer: AstroRenderer) =>
            params.addRenderer({
              ...renderer,
              clientEntrypoint: CLIENT_ENTRYPOINT,
            }),
          updateConfig: (config) => {
            const plugins = config.vite?.plugins;

            // The chunks are only worth moving if their base moves with them.
            if (isBuild) {
              if (setRenderBase(plugins, assetsBase(params.config))) {
                (plugins as unknown[]).push(qwikAssetsPlugin(assets));
              } else {
                console.warn(
                  `[islands/qwik] No "${VIRTUAL_MODULE_PLUGIN}" plugin found; leaving Qwik's client chunks in build/.`,
                );
              }
            }

            return params.updateConfig(config);
          },
        });
      },
    },
  };
}

/**
 * The public path Qwik chunks are served from: Astro's `build.assets`
 * directory, under the site base. `/assets/` with the default config.
 */
function assetsBase(config: AstroConfig): string {
  return `${config.base.replace(/\/$/, "")}/${config.build.assets}/`;
}

/**
 * Finds a plugin by name in a Vite `plugins` array, which may hold nested
 * arrays of plugins as well as entries that are not plugins at all.
 */
function findPlugin(plugins: unknown, name: string): undefined | VitePlugin {
  if (!Array.isArray(plugins)) return undefined;

  for (const entry of plugins) {
    if (Array.isArray(entry)) {
      const nested = findPlugin(entry, name);
      if (nested) return nested;
    } else if (entry && typeof entry === "object" && "name" in entry) {
      if ((entry as VitePlugin).name === name) return entry as VitePlugin;
    }
  }

  return undefined;
}

/**
 * Moves Qwik's client chunks into Astro's assets directory.
 *
 * Qwik emits its entry and chunk files into a `build/` directory of its own,
 * and the standalone client build `@qwik.dev/astro` runs never sees Astro's
 * rollup output options, so those chunks land in `dist/build/` while
 * everything else Astro emits goes to `dist/assets/`. The output step carries
 * the assets directory into OutSystems as a unit, so a second top-level
 * directory is a second thing to keep track of there.
 *
 * Moving the written files, rather than renaming them in the bundle, keeps
 * Qwik's manifest intact: it writes the manifest during `generateBundle`, from
 * the bundle's own file names, and a renamed chunk no longer matches what it
 * collected. `writeBundle` runs once every `generateBundle` has, so by then
 * the manifest holds the bare names it resolves against `q:base` — and the
 * base, pointed at the assets directory by `setRenderBase`, is what moves
 * them. The chunks reference each other relatively and all move together.
 */
function qwikAssetsPlugin(assetsDir: string) {
  return {
    name: "islands/qwik/assets",
    async writeBundle(
      options: { dir?: string },
      bundle: Record<string, unknown>,
    ) {
      const outDir = options.dir;
      const chunks = Object.keys(bundle).filter((fileName) =>
        QWIK_BUILD_DIR.test(fileName),
      );
      if (!outDir || chunks.length === 0) return;

      const emptied = new Set<string>();

      for (const chunk of chunks) {
        const from = path.resolve(outDir, chunk);
        const to = path.resolve(
          outDir,
          chunk.replace(QWIK_BUILD_DIR, `${assetsDir}/`),
        );
        await fs.mkdir(path.dirname(to), { recursive: true });
        await fs.rename(from, to);
        emptied.add(path.dirname(from));
      }

      // Leaves anything Qwik did not put there in place.
      for (const dir of emptied) await fs.rmdir(dir).catch(() => undefined);
    },
  };
}

/**
 * Points `q:base` — the base every Qwik chunk URL in the rendered markup is
 * resolved against — at the directory the chunks are now emitted to.
 *
 * `base` is a render option, and by the time Astro builds, the only place
 * those options exist is the virtual module the upstream integration
 * generates, so this appends the default to that module. An explicit
 * `renderOpts.base` still wins.
 */
function setRenderBase(plugins: unknown, base: string): boolean {
  const plugin = findPlugin(plugins, VIRTUAL_MODULE_PLUGIN);
  if (!plugin?.load) return false;

  const load = plugin.load;
  plugin.load = function (id: string) {
    const code = load.call(this, id);
    return typeof code === "string"
      ? `${code}\nrenderOpts.base ??= ${JSON.stringify(base)};`
      : code;
  };

  return true;
}
