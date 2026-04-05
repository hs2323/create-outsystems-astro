#!/usr/bin/env node
// Sets up create-outsystems-astro in template/node_modules for local development.
// Mirrors what bin/cli.js does via injectIntegrations() at scaffold time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const destPkg = path.join(root, "template", "node_modules", "create-outsystems-astro");

if (fs.existsSync(destPkg)) process.exit(0);

const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));

fs.mkdirSync(destPkg, { recursive: true });

fs.writeFileSync(
  path.join(destPkg, "package.json"),
  JSON.stringify(
    {
      name: "create-outsystems-astro",
      version: rootPkg.version,
      type: "module",
      exports: rootPkg.exports,
    },
    null,
    2
  ) + "\n"
);

// Symlink integrations/ so edits are reflected immediately
fs.symlinkSync(
  path.join(root, "integrations"),
  path.join(destPkg, "integrations"),
  "junction"
);

console.log("🔗 Linked integrations into template/node_modules/create-outsystems-astro");
