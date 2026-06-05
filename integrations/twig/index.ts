import fs from "node:fs";
import path from "node:path";

import type { AstroIntegration, AstroRenderer } from "astro";

const VIRTUAL_SERVER_ID = "virtual:islands/twig/server-with-filter";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

function getRenderer(filtered: boolean): AstroRenderer {
  return {
    clientEntrypoint: "islands-integrations/twig/client",
    name: "islands/twig",
    serverEntrypoint: filtered
      ? VIRTUAL_SERVER_ID
      : "islands-integrations/twig/server",
  };
}

export const getContainerRenderer = (): AstroRenderer => getRenderer(false);

export interface Options {
  exclude?: string[];
  include?: string[];
}

function twigFilterPlugin(include?: string[], exclude?: string[]) {
  return {
    load(id: string) {
      if (id !== RESOLVED_VIRTUAL_SERVER_ID) return;
      return [
        `import { createRenderer } from "islands-integrations/twig/server";`,
        `export default createRenderer(${JSON.stringify(include)}, ${JSON.stringify(exclude)});`,
      ].join("\n");
    },
    name: "islands/twig/filter",
    resolveId(id: string) {
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
    },
  };
}

// Matches a `{% include "path" %}` tag (including the `{%- … -%}` whitespace
// trim and `ignore missing` variants) that uses a static, quoted path. Dynamic
// includes such as `{% include someVar %}` are intentionally left untouched.
const INCLUDE_TAG = /\{%-?\s*include\s+(['"])([^'"]+)\1([^%]*?)-?%\}/g;

// Recursively replaces `{% include %}` tags with the contents of the referenced
// template. Islands render in the browser, where Twig.js has no filesystem
// loader, so includes are resolved here at build time and inlined to keep each
// island self-contained. Paths resolve relative to the including file, and the
// inlined markup still sees the island's props as its render context.
function inlineIncludes(
  filepath: string,
  ancestors: string[],
  onInclude?: (target: string) => void,
): string {
  const resolved = path.resolve(filepath);
  if (ancestors.includes(resolved)) {
    throw new Error(
      `Twig include cycle detected: ${[...ancestors, resolved].join(" -> ")}`,
    );
  }

  const source = fs.readFileSync(resolved, "utf-8");
  const dir = path.dirname(resolved);
  const trail = [...ancestors, resolved];

  return source.replace(
    INCLUDE_TAG,
    (_match, _quote, includePath, modifiers) => {
      const target = path.resolve(dir, includePath);
      if (!fs.existsSync(target)) {
        if (/\bignore missing\b/.test(modifiers)) return "";
        throw new Error(
          `Twig include "${includePath}" not found (referenced from ${resolved}).`,
        );
      }
      onInclude?.(target);
      return inlineIncludes(target, trail, onInclude);
    },
  );
}

// Loads native `.twig` files as modules whose default export is the template
// string, with `{% include %}` tags already inlined. The client renderer then
// compiles and renders it with the island's props as the Twig context.
function twigLoaderPlugin() {
  return {
    enforce: "pre" as const,
    load(this: { addWatchFile?: (id: string) => void }, id: string) {
      const filepath = id.split("?")[0];
      if (!filepath.endsWith(".twig")) return;
      const source = inlineIncludes(filepath, [], (target) =>
        this.addWatchFile?.(target),
      );
      return {
        code: `export default ${JSON.stringify(source)};`,
        map: null,
      };
    },
    name: "islands/twig/loader",
  };
}

export default function (options: Options = {}): AstroIntegration {
  const { exclude, include } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        updateConfig({
          vite: {
            plugins: filtered
              ? [twigLoaderPlugin(), twigFilterPlugin(include, exclude)]
              : [twigLoaderPlugin()],
          },
        });
      },
    },
    name: "islands/twig",
  };
}
