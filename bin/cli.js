#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Welcome to create-outsystems-astro!");

  // Ask for project name
  const response = await prompts({
    type: "text",
    name: "projectName",
    message: "What should we name your project?",
    initial: "outsystems-astro-app"
  });

  const targetDir = path.resolve(process.cwd(), response.projectName);
  const templateDir = path.join(__dirname, "..", "template");

  // Copy files
  console.log("📦 Copying template...");
  copyDir(templateDir, targetDir);

  // Install dependencies
  console.log("📦 Installing dependencies...");
  try {
    execSync("npm install", { cwd: targetDir, stdio: "inherit" });
  } catch {
    console.warn("⚠️ Failed to automatically install dependencies.");
  }

  console.log(`
✅ All done!

Next steps:
  cd ${response.projectName}
  npm run dev
`);
}

// Simple recursive copy
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
