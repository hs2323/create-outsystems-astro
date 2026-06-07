import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  namespaces?: Record<string, string>;
}

type Namespaces = Record<string, string>;


function normalizeNamespaces(
  namespaces: Record<string, string> | undefined,
  root: string,
): Namespaces {
  const normalized: Namespaces = {};
  for (const [name, dir] of Object.entries(namespaces ?? {})) {
    normalized[name.replace(/^@/, "")] = path.resolve(root, dir);
  }
  return normalized;
}

const NAMESPACE_PATH = /^@([^/]+)\/(.*)$/;

function resolveIncludePath(
  includePath: string,
  dir: string,
  namespaces: Namespaces,
): string {
  const match = NAMESPACE_PATH.exec(includePath);
  if (!match) return path.resolve(dir, includePath);

  const [, name, rest] = match;
  const base = namespaces[name];
  if (!base) {
    throw new Error(
      `Twig namespace "@${name}" is not configured. Add it to the \`namespaces\` option of the twig() integration.`,
    );
  }
  return path.resolve(base, rest);
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

const INCLUDE_TAG = /\{%-?\s*include\s+(['"])([^'"]+)\1([^%]*?)-?%\}/g;

interface IncludeModifiers {
  ignoreMissing: boolean;
  only: boolean;
  withExpr?: string;
}

function applyContextScope(
  body: string,
  { only, withExpr }: IncludeModifiers,
): string {
  if (!withExpr && !only) return body;
  const vars = withExpr ?? "{}";
  const onlyFlag = only ? " only" : "";
  return `{% with ${vars}${onlyFlag} %}${body}{% endwith %}`;
}

function inlineIncludes(
  filepath: string,
  ancestors: string[],
  namespaces: Namespaces,
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
      const parsed = parseModifiers(modifiers);
      const target = resolveIncludePath(includePath, dir, namespaces);
      if (!fs.existsSync(target)) {
        if (parsed.ignoreMissing) return "";
        throw new Error(
          `Twig include "${includePath}" not found (referenced from ${resolved}).`,
        );
      }
      onInclude?.(target);
      const body = inlineIncludes(target, trail, namespaces, onInclude);
      return applyContextScope(body, parsed);
    },
  );
}

function parseModifiers(modifiers: string): IncludeModifiers {
  const ignoreMissing = /\bignore\s+missing\b/.test(modifiers);
  let rest = modifiers.replace(/\bignore\s+missing\b/, " ");

  const only = /\bonly\s*$/.test(rest);
  rest = rest.replace(/\bonly\s*$/, " ");

  const withMatch = /\bwith\b([\s\S]*)$/.exec(rest);
  const withExpr = withMatch ? withMatch[1].trim() : undefined;

  return { ignoreMissing, only, withExpr: withExpr || undefined };
}

function twigLoaderPlugin(namespaces: Namespaces) {
  return {
    enforce: "pre" as const,
    load(this: { addWatchFile?: (id: string) => void }, id: string) {
      const filepath = id.split("?")[0];
      if (!filepath.endsWith(".twig")) return;
      const source = inlineIncludes(filepath, [], namespaces, (target) =>
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
  const { exclude, include, namespaces } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, config, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        const resolvedNamespaces = normalizeNamespaces(
          namespaces,
          fileURLToPath(config.root),
        );
        const loader = twigLoaderPlugin(resolvedNamespaces);
        updateConfig({
          vite: {
            plugins: filtered
              ? [loader, twigFilterPlugin(include, exclude)]
              : [loader],
          },
        });
      },
    },
    name: "islands/twig",
  };
}
