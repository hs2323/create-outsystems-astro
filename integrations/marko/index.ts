import path from "node:path";
import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/marko/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/** Query marking a module the compiler split out of a template (its CSS). */
const VIRTUAL_FILE_QUERY = "?marko-virtual";

/**
 * Renders a Marko component as an Astro island.
 *
 * Marko has no Astro integration, and `@marko/vite` builds whole Marko pages
 * rather than components Astro can place. This integration compiles each
 * `.marko` file with Marko's compiler for the browser in the Vite pipeline
 * instead, and registers a client-only renderer. The client entrypoint mounts
 * the template in the island, passes the island's props as `input`, and
 * updates the same instance when the props change. Astro slots are not
 * supported.
 */
function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/marko/client",
    name: "islands/marko",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/marko/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer(false);

export interface LoaderOptions {
  exclude?: string[];
  include?: string[];
  /**
   * Compiles with Marko's optimized runtime. Defaults to Vite's production
   * mode, so development gets the debug runtime and its warnings.
   */
  optimize?: boolean;
}

export interface Options {
  exclude?: string[];
  include?: string[];
}

interface VirtualFile {
  code: string;
  map?: unknown;
}

/**
 * Compiles `.marko` files to Marko's DOM output. Runs before Vite's other
 * transforms, which do not understand Marko syntax.
 *
 * The same output is used on the server, where the renderer only imports the
 * template to identify it: Marko's DOM runtime does not touch the DOM until a
 * template is mounted. A `<style>` block is split out by the compiler as a
 * virtual CSS module, which the loader serves so Vite bundles it with the
 * page's other CSS.
 */
export function markoLoader(options: LoaderOptions = {}) {
  const { exclude, include } = options;
  let optimize = options.optimize ?? false;
  const cache = new Map<unknown, unknown>();
  const virtualFiles = new Map<string, VirtualFile>();

  return {
    configResolved(config: { isProduction: boolean }) {
      optimize = options.optimize ?? config.isProduction;
    },
    enforce: "pre" as const,
    load(id: string) {
      const file = virtualFiles.get(id);
      if (file) return file;
    },
    name: "islands/marko/loader",
    async transform(
      this: { addWatchFile?: (id: string) => void },
      code: string,
      id: string,
    ) {
      if (id.includes("?") || id.includes("\0")) return;
      if (!id.endsWith(".marko") || id.includes("/node_modules/")) return;
      if (include?.length && !matchesPatterns(id, include)) return;
      if (exclude?.length && matchesPatterns(id, exclude)) return;

      // The compiler bundles Babel, so it is only loaded once a Marko file
      // needs it.
      const { compile } = await import("@marko/compiler");
      const result = await compile(code, id, {
        babelConfig: { babelrc: false, configFile: false },
        cache,
        modules: "esm",
        optimize,
        output: "dom",
        resolveVirtualDependency(from, dependency) {
          const query = `${VIRTUAL_FILE_QUERY}&id=${encodeURIComponent(dependency.virtualPath)}`;
          virtualFiles.set(normalizePath(from) + query, {
            code: dependency.code,
            map: dependency.map,
          });
          return `./${path.basename(from)}${query}`;
        },
        sourceMaps: true,
      });

      for (const file of result.meta.watchFiles) this.addWatchFile?.(file);

      return { code: result.code, map: result.map };
    },
  };
}

function markoFilterPlugin(include?: string[], exclude?: string[]) {
  return {
    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_SERVER_ID) return;
      return [
        `import { createRenderer } from "islands-integrations/marko/server";`,
        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
      ].join("\n");
    },
    name: "islands/marko/filter",
    resolveId(id: string) {
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
    },
  };
}

function matchesPatterns(id: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const prefix = pattern.replace(/\/?\*+$/, "");
    return id.includes(prefix);
  });
}

/** Vite ids use forward slashes on every platform. */
function normalizePath(file: string): string {
  return file.split(path.sep).join("/");
}

export default function (options: Options = {}): AstroIntegration {
  const { exclude, include } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        const loader = markoLoader({ exclude, include });
        updateConfig({
          vite: {
            // Marko's runtime is imported by the compiled templates, which
            // Vite's dependency scan cannot see into.
            optimizeDeps: { include: ["marko/debug/dom"] },
            plugins: filtered
              ? [loader, markoFilterPlugin(include, exclude)]
              : [loader],
          },
        });
      },
    },
    name: "islands/marko",
  };
}
