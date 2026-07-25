#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import { execSync } from "node:child_process";

prompts.override(
  yargs(hideBin(process.argv)).parse()
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Everything the template carries for a single framework. When a framework is
// not selected we walk this list to strip it out of the generated project.
//
//   files            - paths (relative to the project) deleted outright
//   astroImports     - module specifiers imported by astro.config.mjs
//   vitestImports    - module specifiers imported by vitest.config.ts
//   scripts          - package.json scripts that only exist for this framework
//   storeValue       - member of the CurrentSelectedFramework union
//   typeDeclaration  - ambient `declare module` block owned by this framework
const FRAMEWORKS = [
  {
    title: "Angular",
    value: "angular",
    astroImports: ["@analogjs/astro-angular"],
    files: [
      "patches",
      "src/images/angular.png",
      "test/setup-test-env-angular.ts",
      "tsconfig.app.json",
      "tsconfig.spec.json"
    ],
    scripts: ["postinstall"],
    vitestImports: ["@analogjs/vite-plugin-angular"]
  },
  {
    title: "HTML",
    value: "html",
    astroImports: ["islands-integrations/html"],
    files: ["src/images/html.png"],
    storeValue: "HTML"
  },
  {
    title: "Preact",
    value: "preact",
    astroImports: ["@astrojs/preact"],
    files: ["src/images/preact.png"],
    storeValue: "Preact",
    vitestImports: ["@preact/preset-vite"]
  },
  {
    title: "React",
    value: "react",
    astroImports: ["@astrojs/react"],
    files: ["src/images/react.png"],
    storeValue: "React",
    vitestImports: ["@vitejs/plugin-react"]
  },
  {
    title: "SolidJS",
    value: "solid",
    astroImports: ["@astrojs/solid-js"],
    files: ["src/images/solid.png"],
    storeValue: "Solid",
    vitestImports: ["vite-plugin-solid"]
  },
  {
    title: "Svelte",
    value: "svelte",
    astroImports: ["@astrojs/svelte"],
    files: ["src/images/svelte.png", "svelte.config.js"],
    storeValue: "Svelte",
    vitestImports: ["@sveltejs/vite-plugin-svelte"]
  },
  {
    title: "Twig",
    value: "twig",
    astroImports: ["islands-integrations/twig"],
    files: ["src/images/twig.png"],
    storeValue: "Twig",
    typeDeclaration: { file: "src/env.d.ts", module: "*.twig" }
  },
  {
    title: "Vue",
    value: "vue",
    astroImports: ["@astrojs/vue"],
    files: ["src/images/vue.png"],
    storeValue: "Vue",
    typeDeclaration: { file: "types.d.ts", module: "*.vue" },
    vitestImports: ["@vitejs/plugin-vue"]
  }
];

// Dependencies are keyed by the frameworks that need them, so a package shared
// by several frameworks (React tooling is also used by Preact, the islands
// integrations are shared by HTML and Twig) is only dropped once every owner
// has been deselected.
const FRAMEWORK_DEPENDENCIES = {
  "@analogjs/astro-angular": ["angular"],
  "@analogjs/vite-plugin-angular": ["angular"],
  "@analogjs/vitest-angular": ["angular"],
  "@angular-devkit/architect": ["angular"],
  "@angular-devkit/schematics": ["angular"],
  "@angular/animations": ["angular"],
  "@angular/build": ["angular"],
  "@angular/cli": ["angular"],
  "@angular/common": ["angular"],
  "@angular/compiler": ["angular"],
  "@angular/compiler-cli": ["angular"],
  "@angular/core": ["angular"],
  "@angular/language-service": ["angular"],
  "@angular/platform-browser": ["angular"],
  "@angular/platform-server": ["angular"],
  "@angular/router": ["angular"],
  "@astrojs/preact": ["preact"],
  "@astrojs/react": ["react"],
  "@astrojs/solid-js": ["solid"],
  "@astrojs/svelte": ["svelte"],
  "@astrojs/vue": ["vue"],
  "@nanostores/preact": ["preact"],
  "@nanostores/react": ["react"],
  "@nanostores/solid": ["solid"],
  "@nanostores/vue": ["vue"],
  "@preact/preset-vite": ["preact"],
  "@solidjs/testing-library": ["solid"],
  "@sveltejs/vite-plugin-svelte": ["svelte"],
  "@testing-library/angular": ["angular"],
  "@testing-library/preact": ["preact"],
  "@testing-library/react": ["react"],
  "@testing-library/svelte": ["svelte"],
  "@testing-library/vue": ["vue"],
  "@types/react": ["preact", "react"],
  "@types/react-dom": ["preact", "react"],
  "@types/twig": ["twig"],
  "@vitejs/plugin-react": ["react"],
  "@vitejs/plugin-vue": ["vue"],
  "angular-eslint": ["angular"],
  "eslint-config-preact": ["preact"],
  "eslint-plugin-react": ["preact", "react"],
  "eslint-plugin-react-hooks": ["preact", "react"],
  "eslint-plugin-solid": ["solid"],
  "eslint-plugin-svelte": ["svelte"],
  "eslint-plugin-vue": ["vue"],
  "islands-integrations": ["html", "twig"],
  "patch-package": ["angular"],
  "preact": ["preact"],
  "prettier-plugin-svelte": ["svelte"],
  "react": ["react"],
  "react-dom": ["react"],
  "rxjs": ["angular"],
  "solid-js": ["solid"],
  "svelte": ["svelte"],
  "svelte-eslint-parser": ["svelte"],
  "tslib": ["angular"],
  "twig": ["twig"],
  "vite-plugin-solid": ["solid"],
  "vue": ["vue"],
  "vue-eslint-parser": ["vue"]
};

// Top-level entries of the exported array in eslint.config.mjs, each located by
// a substring that only appears inside that entry.
const ESLINT_ENTRIES = [
  { imports: ["angular-eslint"], marker: '"src/framework/angular/', owners: ["angular"] },
  { imports: ["eslint-config-preact"], marker: '"src/framework/preact/', owners: ["preact"] },
  { imports: ["eslint-plugin-react"], marker: '"src/framework/react/', owners: ["react"] },
  { imports: ["eslint-plugin-react-hooks"], marker: '"react-hooks"', owners: ["preact", "react"] },
  { imports: ["eslint-plugin-solid"], marker: '"src/framework/solid/', owners: ["solid"] },
  {
    imports: ["eslint-plugin-svelte", "svelte-eslint-parser", "./svelte.config.js"],
    marker: '"**/*.svelte"',
    owners: ["svelte"]
  },
  { imports: [], marker: '"src/framework/vue/', owners: ["vue"] },
  { imports: ["eslint-plugin-vue"], marker: '"**/*.vue"', owners: ["vue"] }
];

// Frameworks that ship as local Astro integrations under .integrations/
const INTEGRATION_FRAMEWORKS = ["html", "twig"];

// Agent instructions that document the frameworks section by section.
const AGENT_DOCS = ["AGENTS.md"];

const LOCKFILES = {
  npm: ["package-lock.json"],
  yarn: ["yarn.lock"],
  pnpm: ["pnpm-lock.yaml", "pnpm-workspace.yaml"],
  bun: ["bun.lock"],
  deno: ["deno.lock", "deno.json"]
};

// Reject names that would escape the current directory (path traversal),
// resolve to an absolute path, or contain path separators / unsafe chars.
function validateProjectName(name) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "Project name cannot be empty.";
  }
  const trimmed = name.trim();
  if (trimmed === "." || trimmed === "..") {
    return "Project name cannot be '.' or '..'.";
  }
  if (path.isAbsolute(trimmed) || trimmed.startsWith("~")) {
    return "Project name must be a relative folder name, not an absolute path.";
  }
  if (/[\\/]/.test(trimmed) || trimmed.split(/[\\/]/).includes("..")) {
    return "Project name must be a single folder name (no slashes or '..').";
  }
  if (/[\x00-\x1f<>:"|?*]/.test(trimmed)) {
    return "Project name contains invalid characters.";
  }
  return true;
}

async function main() {
  console.log("🚀 Welcome to create-outsystems-astro!");

  // Ask for project name
  const response = await prompts({
    type: "text",
    name: "projectName",
    message: "What should we name your project?",
    initial: "outsystems-astro-app",
    validate: validateProjectName
  });

  // When prompts are overridden via CLI args, `validate` is bypassed, so
  // re-check here. Also guards against a cancelled prompt (undefined).
  const nameCheck = validateProjectName(response.projectName);
  if (nameCheck !== true) {
    console.error(`❌ ${nameCheck || "No project name provided."}`);
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), response.projectName);
  const templateDir = path.join(__dirname, "..", "template");

  // Refuse to scaffold into an existing, non-empty directory to avoid
  // clobbering files the user already has.
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.error(`❌ Target directory "${response.projectName}" already exists and is not empty.`);
    process.exit(1);
  }

  // The frameworks are picked up front so the template can be pruned before we
  // install anything — otherwise we install dependencies we are about to drop.
  let selectedFrameworks = [];

  while (selectedFrameworks.length === 0) {
    const frameworkResponse = await prompts({
      type: "multiselect",
      name: "frameworks",
      message: "Which frameworks do you want to include?",
      choices: FRAMEWORKS.map(({ title, value }) => ({ title, value })),
      hint: "- Space to select. Enter to confirm",
      validate: value =>
        value.length > 0 ? true : "Please select at least one framework."
    });

    selectedFrameworks = frameworkResponse.frameworks || [];
  }

  const needsIntegrations = INTEGRATION_FRAMEWORKS.some(framework =>
    selectedFrameworks.includes(framework)
  );

  if (needsIntegrations) {
    buildIntegrations();
  }

  // Copy files
  console.log("📦 Copying template...");
  copyDir(templateDir, targetDir);

  removeFrameworkFiles(targetDir, selectedFrameworks);

  if (!needsIntegrations) {
    removeIntegrations(targetDir);
  }

  updateAstroConfig(targetDir, selectedFrameworks);

  updateMultiAstroPage(targetDir, selectedFrameworks)

  updateVitestConfig(targetDir, selectedFrameworks);

  updateEslintConfig(targetDir, selectedFrameworks);

  updatePrettierConfig(targetDir, selectedFrameworks);

  updateTypeDeclarations(targetDir, selectedFrameworks);

  updateFrameworkStore(targetDir, selectedFrameworks);

  updateAgentInstructions(targetDir, selectedFrameworks);

  updatePackageJson(targetDir, selectedFrameworks);

  const packageManager = packageInstall(targetDir);

  selectWorkflowTestCI(targetDir, packageManager);

  const readmeSrc = path.resolve(__dirname, "../README.md");
  const readmeDest = path.join(targetDir, "README.md");

  if (fs.existsSync(readmeSrc)) {
    fs.copyFileSync(readmeSrc, readmeDest);
  }



  console.log(`
✅ All done!

Next steps:
  cd ${response.projectName}
  ${packageManager} run dev
`);
}

function buildIntegrations() {
  const integrationsDir = path.join(__dirname, "..", "integrations");
  const packageManager = detectPackageManager();

  const installCmd = {
    npm: "npm install",
    yarn: "yarn install",
    pnpm: "pnpm install",
    bun: "bun install",
    deno: "deno install",
    unknown: "npm install",
  }[packageManager];

  const buildCmd = {
    npm: "npm run process",
    yarn: "yarn process",
    pnpm: "pnpm run process",
    bun: "bun run process",
    deno: "deno task process",
    unknown: "npm run process",
  }[packageManager];

  console.log("📦 Installing integration dependencies...");
  execSync(installCmd, { cwd: integrationsDir, stdio: "inherit" });

  console.log("🔨 Building integrations...");
  execSync(buildCmd, { cwd: integrationsDir, stdio: "inherit" });
}

// Simple recursive copy
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);

    // Check if the file is our renamed gitignore
    const destName = entry.name === ".npmignore" ? ".gitignore" : entry.name;
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function unselectedFrameworks(selectedFrameworks) {
  return FRAMEWORKS.filter(({ value }) => !selectedFrameworks.includes(value));
}

// True when at least one of the frameworks that need something is still around.
function isRequired(owners, selectedFrameworks) {
  return owners.some(owner => selectedFrameworks.includes(owner));
}

function removePath(projectDir, relativePath) {
  const target = path.join(projectDir, relativePath);
  if (!fs.existsSync(target)) return;

  console.log(`🗑️ Removing ${relativePath}`);
  fs.rmSync(target, { force: true, recursive: true });
}

function removeFrameworkFiles(projectDir, selectedFrameworks) {
  for (const framework of unselectedFrameworks(selectedFrameworks)) {
    const paths = [
      path.join("src", "pages", framework.value),
      path.join("src", "framework", framework.value),
      path.join("test", "integration", framework.value),
      path.join("test", "e2e", framework.value),
      ...(framework.files ?? [])
    ];

    for (const relativePath of paths) {
      removePath(projectDir, relativePath);
    }
  }
}

// The local Astro integrations only back the HTML and Twig frameworks.
function removeIntegrations(projectDir) {
  removePath(projectDir, ".integrations");
}

function updateAstroConfig(projectDir, selectedFrameworks) {
  const configPath = path.join(projectDir, "astro.config.mjs");

  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ astro.config.mjs not found, skipping integration cleanup.");
    return;
  }

  let content = fs.readFileSync(configPath, "utf-8");

  for (const framework of unselectedFrameworks(selectedFrameworks)) {
    // Every integration entry mentions the folder it compiles.
    content = removeArrayEntry(content, "integrations", `src/framework/${framework.value}`);

    for (const specifier of framework.astroImports ?? []) {
      content = removeImport(content, specifier);
    }
  }

  fs.writeFileSync(configPath, tidy(content), "utf-8");
  console.log("🛠️ Updated astro.config.mjs integrations");
}

function updateMultiAstroPage(projectDir, selectedFrameworks) {
  const pagePath = path.join(projectDir, "src", "pages", "multi", "store.astro");

  if (!fs.existsSync(pagePath)) {
    console.warn(`⚠️ ${path.relative(projectDir, pagePath)} not found, skipping page cleanup.`);
    return;
  }

  let content = fs.readFileSync(pagePath, "utf-8");

  for (const { value } of unselectedFrameworks(selectedFrameworks)) {
    // The store component and the logo it is passed both live under a folder
    // named after the framework, so the imports identify themselves.
    const imports = new RegExp(
      `^[ \\t]*import\\s+(\\w+)\\s+from\\s+["'][^"']*(?:framework/${value}/|images/${value}\\.)[^"']*["'];?[ \\t]*\\r?\\n`,
      "gm"
    );

    const bindings = [...content.matchAll(imports)].map(([, binding]) => binding);
    content = content.replace(imports, "");

    for (const binding of bindings) {
      content = content.replace(
        new RegExp(`^[ \\t]*<${binding}\\b[^>]*/>[ \\t]*\\r?\\n`, "gm"),
        ""
      );
    }
  }

  // Clean up any double-newlines left behind in the template body
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

  fs.writeFileSync(pagePath, content, "utf-8");
  console.log(`✨ Cleaned up components in ${path.relative(projectDir, pagePath)}`);
}

function updateVitestConfig(projectDir, selectedFrameworks) {
  const configPath = path.join(projectDir, "vitest.config.ts");

  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ vitest.config.ts not found, skipping test project cleanup.");
    return;
  }

  let content = fs.readFileSync(configPath, "utf-8");

  for (const framework of unselectedFrameworks(selectedFrameworks)) {
    content = removeArrayEntry(content, "projects", `name: "${framework.value}"`);

    for (const specifier of framework.vitestImports ?? []) {
      content = removeImport(content, specifier);
    }
  }

  // `mode` is only read by the Svelte project's resolve conditions, so drop the
  // now-unused parameter rather than leave a lint error behind.
  if (!selectedFrameworks.includes("svelte")) {
    content = content.replace(
      /defineConfig\(\(\{\s*mode\s*\}\)\s*=>/,
      "defineConfig(() =>"
    );
  }

  fs.writeFileSync(configPath, tidy(content), "utf-8");
  console.log("🧪 Updated vitest.config.ts projects");
}

function updateEslintConfig(projectDir, selectedFrameworks) {
  const configPath = path.join(projectDir, "eslint.config.mjs");

  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ eslint.config.mjs not found, skipping lint config cleanup.");
    return;
  }

  let content = fs.readFileSync(configPath, "utf-8");

  for (const entry of ESLINT_ENTRIES) {
    if (isRequired(entry.owners, selectedFrameworks)) continue;

    content = removeExportedArrayEntry(content, entry.marker);

    for (const specifier of entry.imports) {
      content = removeImport(content, specifier);
    }
  }

  fs.writeFileSync(configPath, tidy(content), "utf-8");
  console.log("🧹 Updated eslint.config.mjs");
}

function updatePrettierConfig(projectDir, selectedFrameworks) {
  const configPath = path.join(projectDir, ".prettierrc");

  if (selectedFrameworks.includes("svelte") || !fs.existsSync(configPath)) return;

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.filter(plugin => plugin !== "prettier-plugin-svelte");
  }

  if (Array.isArray(config.overrides)) {
    config.overrides = config.overrides.filter(
      override => !String(override?.files ?? "").includes(".svelte")
    );

    if (config.overrides.length === 0) {
      delete config.overrides;
    }
  }

  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf-8");
  console.log("💅 Updated .prettierrc plugins");
}

function updateTypeDeclarations(projectDir, selectedFrameworks) {
  for (const framework of unselectedFrameworks(selectedFrameworks)) {
    const declaration = framework.typeDeclaration;
    if (!declaration) continue;

    const filePath = path.join(projectDir, declaration.file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const updated = removeModuleDeclaration(content, declaration.module);
    if (updated === content) continue;

    fs.writeFileSync(filePath, tidy(updated), "utf-8");
    console.log(`📝 Removed "${declaration.module}" declaration from ${declaration.file}`);
  }
}

function updateFrameworkStore(projectDir, selectedFrameworks) {
  const storePath = path.join(projectDir, "src", "stores", "framework.ts");

  if (!fs.existsSync(storePath)) return;

  const content = fs.readFileSync(storePath, "utf-8");
  const union = /export type CurrentSelectedFramework\s*=[\s\S]*?;/;

  if (!union.test(content)) {
    console.warn("⚠️ Could not find CurrentSelectedFramework, skipping store cleanup.");
    return;
  }

  const members = ['""'].concat(
    FRAMEWORKS.filter(
      ({ storeValue, value }) => storeValue && selectedFrameworks.includes(value)
    ).map(({ storeValue }) => `"${storeValue}"`)
  );

  // Keep the declaration on one line while it fits, the way Prettier formats it.
  const declaration = `export type CurrentSelectedFramework = ${members.join(" | ")};`;
  const updated = content.replace(
    union,
    declaration.length <= 80
      ? declaration
      : `export type CurrentSelectedFramework =\n  ${members.join(" | ")};`
  );

  fs.writeFileSync(storePath, updated, "utf-8");
  console.log("🗂️ Updated src/stores/framework.ts");
}

function updateAgentInstructions(projectDir, selectedFrameworks) {
  const titles = unselectedFrameworks(selectedFrameworks).map(({ title }) => title);

  if (titles.length === 0) return;

  for (const doc of AGENT_DOCS) {
    const docPath = path.join(projectDir, doc);
    if (!fs.existsSync(docPath)) continue;

    const content = fs.readFileSync(docPath, "utf-8");
    const updated = removeMarkdownFrameworkSections(content, titles);
    if (updated === content) continue;

    fs.writeFileSync(docPath, updated, "utf-8");
    console.log(`📚 Updated ${doc}`);
  }
}

function updatePackageJson(projectDir, selectedFrameworks) {
  const packagePath = path.join(projectDir, "package.json");

  if (!fs.existsSync(packagePath)) {
    console.warn("⚠️ package.json not found, skipping dependency cleanup.");
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
  const removed = [];

  for (const [dependency, owners] of Object.entries(FRAMEWORK_DEPENDENCIES)) {
    if (isRequired(owners, selectedFrameworks)) continue;

    for (const field of ["dependencies", "devDependencies"]) {
      if (manifest[field]?.[dependency]) {
        delete manifest[field][dependency];
        removed.push(dependency);
      }
    }
  }

  for (const framework of unselectedFrameworks(selectedFrameworks)) {
    for (const script of framework.scripts ?? []) {
      if (manifest.scripts?.[script]) {
        delete manifest.scripts[script];
      }
    }
  }

  fs.writeFileSync(packagePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  if (removed.length > 0) {
    console.log(`📦 Removed ${removed.length} unused dependencies from package.json`);
  }
}

function selectWorkflowTestCI(projectDir, packageManager) {
  const workflowDir = path.join(projectDir, '.github', 'workflows');
  if (!fs.existsSync(workflowDir)) return;

  const allPMs = ['npm', 'yarn', 'pnpm', 'bun', 'deno'];
  const activePM = allPMs.includes(packageManager) ? packageManager : 'npm';

  for (const pm of allPMs) {
    if (pm === activePM) continue;
    const file = path.join(workflowDir, `${pm}-test.yml`);
    if (fs.existsSync(file)) {
      fs.rmSync(file, { force: true });
    }
  }

  const src = path.join(workflowDir, `${activePM}-test.yml`);
  const dest = path.join(workflowDir, 'test.yml');
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`✅ Added .github/workflows/test.yml for ${activePM}`);
  }
}

function detectPackageManager() {
  if (typeof Deno !== "undefined") return "deno";

  const ua = process.env.npm_config_user_agent || "";

  if (ua.startsWith("npm/")) return "npm";
  if (ua.startsWith("yarn/")) return "yarn";
  if (ua.startsWith("pnpm/")) return "pnpm";
  if (ua.startsWith("bun/")) return "bun";

  return "unknown";
}

function cleanupLockfiles(projectDir, activePackageManager) {
  for (const [packageManager, files] of Object.entries(LOCKFILES)) {
    if (packageManager === activePackageManager) continue;

    for (const file of files) {
      const filePath = path.join(projectDir, file);
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
        console.log(`🗑️ Removed ${file}`);
      }
    }
  }
}

function packageInstall(targetDir) {
   try {
      const packageManager = detectPackageManager();
      console.log(`🧰 Detected package manager: ${packageManager}`);

      if (packageManager === "unknown") {
        console.warn("⚠️ Could not detect package manager — keeping all lockfiles.");
      } else {
        cleanupLockfiles(targetDir, packageManager);
      }

      const installCmd = {
        npm: "npm install",
        yarn: "yarn install",
        pnpm: "pnpm install",
        bun: "bun install",
        deno: "deno install && deno run postinstall:deno",
        unknown: "npm install"
      }[packageManager];

      console.log(`📦 Installing dependencies using ${packageManager}...`);
      execSync(installCmd, {
        cwd: targetDir,
        stdio: "inherit"
      });

      return packageManager
   } catch {
      console.warn("⚠️ Failed to automatically install dependencies.");
    }
}

/* -------------------------------------------------------------------------
 * Source editing helpers
 *
 * The config files we prune are hand written JavaScript, so we match brackets
 * instead of guessing at regular expressions. Strings such as
 * "**\/*.{js,ts}" contain braces and commas of their own, so every scan
 * ignores characters that live inside strings or comments.
 * ---------------------------------------------------------------------- */

// Marks each character that is real code (1) rather than part of a string
// literal or a comment (0). Template literal interpolations are treated as
// string content, which is enough for the configs we ship.
function buildCodeMask(source) {
  const mask = new Uint8Array(source.length);
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index++;
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        index++;
      }
      index += 2;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      index++;
      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
          continue;
        }
        if (source[index] === char) {
          index++;
          break;
        }
        index++;
      }
      continue;
    }

    mask[index] = 1;
    index++;
  }

  return mask;
}

const BRACKET_PAIRS = { "(": ")", "[": "]", "{": "}" };

function findClosingBracket(source, mask, openIndex) {
  const open = source[openIndex];
  const close = BRACKET_PAIRS[open];
  let depth = 0;

  for (let index = openIndex; index < source.length; index++) {
    if (!mask[index]) continue;

    if (source[index] === open) {
      depth++;
    } else if (source[index] === close) {
      depth--;
      if (depth === 0) return index;
    }
  }

  return -1;
}

// Removes the top-level element of the array opened at `arrayOpen` that
// contains `marker`, along with the comma that separates it from its siblings.
function removeArrayElement(source, arrayOpen, marker) {
  const mask = buildCodeMask(source);
  const arrayClose = findClosingBracket(source, mask, arrayOpen);
  if (arrayClose === -1) return source;

  const markerIndex = source.indexOf(marker, arrayOpen);
  if (markerIndex === -1 || markerIndex > arrayClose) return source;

  let depth = 0;
  let start = arrayOpen + 1;
  let end = -1;
  let previousComma = -1;

  for (let index = arrayOpen + 1; index < arrayClose; index++) {
    if (!mask[index]) continue;

    const char = source[index];

    if (char === "(" || char === "[" || char === "{") {
      depth++;
    } else if (char === ")" || char === "]" || char === "}") {
      depth--;
    } else if (char === "," && depth === 0) {
      if (index > markerIndex) {
        end = index + 1;
        break;
      }
      previousComma = index;
      start = index + 1;
    }
  }

  if (end === -1) {
    // Last element in the array: take the preceding comma with it.
    end = arrayClose;
    while (end > start && /\s/.test(source[end - 1])) end--;
    if (previousComma !== -1) start = previousComma;
  } else {
    // Keep the element's own line break by absorbing the leading whitespace.
    while (start > 0 && /\s/.test(source[start - 1])) start--;
  }

  return source.slice(0, start) + source.slice(end);
}

// Removes an entry from a `<key>: [ ... ]` array, e.g. `integrations: [...]`.
function removeArrayEntry(source, key, marker) {
  const keyIndex = source.search(new RegExp(`\\b${escapeRegExp(key)}\\s*:\\s*\\[`));
  if (keyIndex === -1) return source;

  return removeArrayElement(source, source.indexOf("[", keyIndex), marker);
}

// Removes an entry from the array in `export default [ ... ]`.
function removeExportedArrayEntry(source, marker) {
  const exportIndex = source.indexOf("export default");
  if (exportIndex === -1) return source;

  const arrayOpen = source.indexOf("[", exportIndex);
  if (arrayOpen === -1) return source;

  return removeArrayElement(source, arrayOpen, marker);
}

// Drops a single line `import ... from "<specifier>";` statement.
function removeImport(source, specifier) {
  const pattern = new RegExp(
    `^[ \\t]*import[^\\n]*?from\\s*["']${escapeRegExp(specifier)}["'];?[ \\t]*\\r?\\n`,
    "m"
  );

  return source.replace(pattern, "");
}

// Drops an ambient `declare module "<name>" { ... }` block.
function removeModuleDeclaration(source, moduleName) {
  const pattern = new RegExp(`declare module\\s+["']${escapeRegExp(moduleName)}["']\\s*\\{`);
  const match = pattern.exec(source);
  if (!match) return source;

  const mask = buildCodeMask(source);
  const blockOpen = source.indexOf("{", match.index);
  const blockClose = findClosingBracket(source, mask, blockOpen);
  if (blockClose === -1) return source;

  let end = blockClose + 1;
  while (end < source.length && /[ \t\r]/.test(source[end])) end++;
  if (source[end] === "\n") end++;

  return source.slice(0, match.index) + source.slice(end);
}

// Strips the sections and list items of a markdown document that describe a
// framework that is no longer part of the project.
function removeMarkdownFrameworkSections(source, titles) {
  const names = titles.map(escapeRegExp).join("|");
  const heading = new RegExp(`^(#{2,6})\\s+(?:${names})\\s*$`);
  const listItem = new RegExp(`^([ \\t]*)-\\s+(?:${names})\\s*[-:](\\s|$)`);
  const lines = source.split("\n");
  const kept = [];
  const listIntros = new Set();
  let index = 0;
  let inCodeFence = false;
  let lastTextLine = -1;

  while (index < lines.length) {
    const line = lines[index];

    if (isCodeFence(line)) {
      inCodeFence = !inCodeFence;
    } else if (!inCodeFence) {
      const headingMatch = heading.exec(line);
      if (headingMatch) {
        index = skipSection(lines, index, headingMatch[1].length);
        continue;
      }

      const listItemMatch = listItem.exec(line);
      if (listItemMatch) {
        const indent = listItemMatch[1].length;

        // Remember the line the item hung off, unless that is a sibling item.
        if (lastTextLine !== -1 && !isListItem(kept[lastTextLine], indent)) {
          listIntros.add(lastTextLine);
        }

        index = skipListItem(lines, index, indent);
        continue;
      }
    }

    kept.push(line);

    if (!inCodeFence && !isCodeFence(line) && line.trim() !== "") {
      lastTextLine = kept.length - 1;
    }

    index++;
  }

  return collapseBlankLines(dropOrphanedListIntros(kept, listIntros).join("\n"));
}

// A line that introduces a list ("… for the following frameworks:") is left
// dangling once every framework it listed has been removed.
function dropOrphanedListIntros(lines, listIntros) {
  const orphaned = new Set(
    [...listIntros].filter(index => {
      const next = lines.slice(index + 1).find(line => line.trim() !== "");

      return next === undefined || !isListItem(next, 0);
    })
  );

  return lines.filter((_, index) => !orphaned.has(index));
}

// True when `line` is a list item indented by at least `indent` spaces.
function isListItem(line, indent) {
  const match = /^([ \t]*)-\s/.exec(line);

  return match !== null && match[1].length >= indent;
}

// Walks past the section opened by the heading at `start`, up to the next
// heading of the same level or higher.
function skipSection(lines, start, level) {
  const heading = new RegExp(`^#{1,${level}}\\s`);
  let index = start + 1;
  let inCodeFence = false;

  while (index < lines.length) {
    const line = lines[index];

    if (isCodeFence(line)) {
      inCodeFence = !inCodeFence;
    } else if (!inCodeFence && heading.test(line)) {
      break;
    }

    index++;
  }

  return index;
}

// Walks past the list item at `start`, taking the indented lines and code
// blocks that illustrate it but leaving neighbouring prose and items alone.
function skipListItem(lines, start, indent) {
  const continuation = new RegExp(`^[ \\t]{${indent + 1},}\\S`);
  let index = start + 1;

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === "") {
      index++;
      continue;
    }

    if (isCodeFence(line)) {
      index = skipCodeFence(lines, index);
      continue;
    }

    if (/^\s*#/.test(line) || !continuation.test(line)) break;

    index++;
  }

  // Trailing blank lines separate whatever comes next, so hand them back.
  while (index > start + 1 && lines[index - 1].trim() === "") index--;

  return index;
}

function skipCodeFence(lines, start) {
  let index = start + 1;

  while (index < lines.length && !isCodeFence(lines[index])) index++;

  return index + 1;
}

function isCodeFence(line) {
  return /^\s*(```|~~~)/.test(line);
}

function collapseBlankLines(source) {
  return `${source.replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

// Collapses the blank lines and empty arrays left behind by the removals so the
// generated project still passes `prettier --check`.
function tidy(source) {
  return collapseBlankLines(source.replace(/\[\s*\]/g, "[]"));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
