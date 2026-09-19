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

export interface LoaderOptions {
  assets?: string;
  namespaces?: Record<string, string>;
  root?: string;
}

export interface Options {
  assets?: string;
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
  return path.resolve(resolveNamespace(name, namespaces), rest);
}

function resolveNamespace(name: string, namespaces: Namespaces): string {
  const base = namespaces[name];
  if (!base) {
    throw new Error(
      `Twig namespace "@${name}" is not configured. Add it to the \`namespaces\` option of the twig() integration.`,
    );
  }
  return base;
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

const ASSET_CALL = /\basset\(\s*(['"])([^'"]+)\1\s*\)/g;
const ASSET_FUNCTION = /\basset\s*\(/;
const ASSET_PLACEHOLDER = /@@islands-twig-asset:(\d+)@@/;
const ASSET_VARIABLE = "__islandsTwigAsset";
const RELATIVE_PATH = /^\.\.?\//;
const TWIG_TAG = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g;

interface TemplateContext {
  assets: string[];
  assetsDir: string;
  namespaces: Namespaces;
  onDependency?: (file: string) => void;
}

export function twigLoader(options: LoaderOptions = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const assetsDir = path.resolve(root, options.assets ?? "src");
  const namespaces = normalizeNamespaces(options.namespaces, root);

  return {
    enforce: "pre" as const,
    load(this: { addWatchFile?: (id: string) => void }, id: string) {
      const filepath = id.split("?")[0];
      if (!filepath.endsWith(".twig")) return;

      const assets: string[] = [];
      const source = compileTemplate(filepath, [], {
        assets,
        assetsDir,
        namespaces,
        onDependency: (target) => this.addWatchFile?.(target),
      });
      assets.forEach((asset) => this.addWatchFile?.(asset));

      return {
        code: createTemplateModule(
          source,
          assets,
          path.dirname(path.resolve(filepath)),
        ),
        map: null,
      };
    },
    name: "islands/twig/loader",
  };
}

function compileTemplate(
  filepath: string,
  ancestors: string[],
  context: TemplateContext,
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

  const inlined = source.replace(
    INCLUDE_TAG,
    (_match, _quote, includePath, modifiers) => {
      const parsed = parseModifiers(modifiers);
      const target = resolveIncludePath(includePath, dir, context.namespaces);
      if (!fs.existsSync(target)) {
        if (parsed.ignoreMissing) return "";
        throw new Error(
          `Twig include "${includePath}" not found (referenced from ${resolved}).`,
        );
      }
      context.onDependency?.(target);
      const body = compileTemplate(target, trail, context);
      return applyContextScope(body, parsed);
    },
  );

  return inlineAssets(inlined, resolved, context);
}

function createTemplateModule(
  source: string,
  assets: string[],
  dir: string,
): string {
  const imports = assets.map(
    (asset, index) =>
      `import ${ASSET_VARIABLE}${index} from ${JSON.stringify(toImportSpecifier(dir, asset))};`,
  );
  const template = source
    .split(ASSET_PLACEHOLDER)
    .map((part, index) =>
      index % 2 === 0
        ? JSON.stringify(part)
        : `JSON.stringify(${ASSET_VARIABLE}${part})`,
    )
    .join(" + ");

  return [...imports, `export default ${template};`].join("\n");
}

function inlineAssets(
  source: string,
  filepath: string,
  context: TemplateContext,
): string {
  const dir = path.dirname(filepath);

  return source.replace(TWIG_TAG, (tag) => {
    const inlined = tag.replace(ASSET_CALL, (_match, _quote, assetPath) => {
      const target = resolveAssetPath(assetPath, dir, context);
      if (!fs.existsSync(target)) {
        throw new Error(
          `Twig asset "${assetPath}" not found (referenced from ${filepath}).`,
        );
      }
      let index = context.assets.indexOf(target);
      if (index === -1) index = context.assets.push(target) - 1;
      return `@@islands-twig-asset:${index}@@`;
    });

    if (ASSET_FUNCTION.test(inlined)) {
      throw new Error(
        `Twig asset() only accepts a static quoted path (referenced from ${filepath}).`,
      );
    }
    return inlined;
  });
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

function resolveAssetPath(
  assetPath: string,
  dir: string,
  { assetsDir, namespaces }: TemplateContext,
): string {
  const match = NAMESPACE_PATH.exec(assetPath);
  if (match) {
    const [, name, rest] = match;
    return path.resolve(resolveNamespace(name, namespaces), rest);
  }
  if (RELATIVE_PATH.test(assetPath)) return path.resolve(dir, assetPath);
  return path.resolve(assetsDir, assetPath.replace(/^\/+/, ""));
}

function toImportSpecifier(dir: string, target: string): string {
  const relative = path.relative(dir, target).split(path.sep).join("/");
  return `${relative.startsWith(".") ? relative : `./${relative}`}?url`;
}

export default function (options: Options = {}): AstroIntegration {
  const { assets, exclude, include, namespaces } = options;
  const filtered = !!(include?.length || exclude?.length);

  return {
    hooks: {
      "astro:config:setup": ({ addRenderer, config, updateConfig }) => {
        addRenderer(getRenderer(filtered));
        const loader = twigLoader({
          assets: assets ?? fileURLToPath(config.srcDir),
          namespaces,
          root: fileURLToPath(config.root),
        });
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
