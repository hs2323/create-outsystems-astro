import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/stencil/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

/** Modules the loader compiles: TypeScript that imports `@stencil/core`. */
const SOURCE_FILE = /\.tsx?$/;
const STENCIL_IMPORT = /from\s+["']@stencil\/core["']/;
/** A named default export class, which Stencil's transpiler cannot compile. */
const DEFAULT_EXPORT_CLASS = /\bexport\s+default\s+class\s+([A-Za-z_$][\w$]*)/;

/**
 * Renders a Stencil component as an Astro island.
 *
 * Stencil has no Astro integration, and its own build emits a component
 * library rather than modules Astro can import. This integration compiles each
 * component module with Stencil's `transpile` API in the Vite pipeline instead,
 * which turns the decorated class into a custom element class, and registers
 * a client-only renderer. The client entrypoint creates the element in the
 * island, sets the island's props as element properties and moves the Astro
 * slots into its light DOM, where the component's `<slot>`s show them.
 */
function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/stencil/client",
    name: "islands/stencil",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/stencil/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer(false);

export interface LoaderOptions {
  exclude?: string[];
  include?: string[];
}

export interface Options {
  exclude?: string[];
  include?: string[];
}

/**
 * Compiles Stencil component modules. Runs before Vite's own TypeScript
 * transform, which does not understand Stencil's decorators.
 *
 * Each component is exported as a custom element class (Stencil's `module`
 * output). Stencil components are usually named exports, but the OutSystems
 * Islands module loads an island's default export, so a component may be
 * written as `export default class`: Stencil mangles that form, so it is
 * compiled as a named export and the default export is added back after. The
 * class is registered under the tag from its `@Component` decorator when
 * the module is imported in the browser, so a component can render another
 * one by importing it. Registration is skipped on the server, where the
 * renderer only imports the module to identify the component.
 */
export function stencilLoader(options: LoaderOptions = {}) {
  const { exclude, include } = options;

  return {
    enforce: "pre" as const,
    name: "islands/stencil/loader",
    async transform(
      this: { warn?: (message: string) => void },
      code: string,
      id: string,
    ) {
      if (id.includes("?") || id.includes("\0")) return;
      if (!SOURCE_FILE.test(id) || id.includes("/node_modules/")) return;
      if (include?.length && !matchesPatterns(id, include)) return;
      if (exclude?.length && matchesPatterns(id, exclude)) return;
      if (!STENCIL_IMPORT.test(code)) return;

      // The compiler bundles TypeScript, so it is only loaded once a Stencil
      // module needs it.
      const { transpile } = await import("@stencil/core/compiler");
      const defaultExport = DEFAULT_EXPORT_CLASS.exec(code)?.[1];
      const source = defaultExport
        ? code.replace(DEFAULT_EXPORT_CLASS, "export class $1")
        : code;
      const result = await transpile(source, {
        componentExport: "module",
        coreImportPath: "@stencil/core/internal/client",
        file: id,
        proxy: "defineproperty",
        sourceMap: true,
        style: "static",
        // Leave style imports as written, so `?inline` reaches Vite unchanged.
        // Stencil accepts the string "null" to turn off its query parameters.
        styleImportData: "null",
        target: "latest",
      });

      for (const diagnostic of result.diagnostics) {
        const location = diagnostic.lineNumber
          ? `${id}:${diagnostic.lineNumber}`
          : id;
        const message = `${diagnostic.messageText} (${location})`;
        if (diagnostic.level === "error") throw new Error(message);
        this.warn?.(message);
      }

      const registrations = (result.data ?? []).map(
        ({ componentClassName: name }) =>
          `if (typeof customElements !== "undefined" && !customElements.get(${name}.is)) customElements.define(${name}.is, ${name});`,
      );

      return {
        code: [
          result.code.replace(/\n\/\/# sourceMappingURL=.*$/, ""),
          ...registrations,
          ...(defaultExport ? [`export default ${defaultExport};`] : []),
        ].join("\n"),
        map: result.map,
      };
    },
  };
}

function matchesPatterns(id: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const prefix = pattern.replace(/\/?\*+$/, "");
    return id.includes(prefix);
  });
}

function stencilFilterPlugin(include?: string[], exclude?: string[]) {
  return {
    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_SERVER_ID) return;
      return [
        `import { createRenderer } from "islands-integrations/stencil/server";`,
        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
      ].join("\n");
    },
    name: "islands/stencil/filter",
    resolveId(id: string) {
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
    },
  };
}

export default function (options: Options = {}): AstroIntegration {
  const { exclude, include } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        const loader = stencilLoader({ exclude, include });
        updateConfig({
          vite: {
            plugins: filtered
              ? [loader, stencilFilterPlugin(include, exclude)]
              : [loader],
          },
        });
      },
    },
    name: "islands/stencil",
  };
}
