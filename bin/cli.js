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

const FRAMEWORKS = [
  { title: "Angular", value: "angular" },
  { title: "React", value: "react" },
  { title: "Vue", value: "vue" }
];

const LOCKFILES = {
  npm: ["package-lock.json"],
  yarn: ["yarn.lock"],
  pnpm: ["pnpm-lock.yaml"],
  bun: ["bun.lock"],
  deno: ["deno.lock"]
};

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

  const packageManager = packageInstall(targetDir);

  let selectedFrameworks = [];

  while (selectedFrameworks.length === 0) {
    const frameworkResponse = await prompts({
      type: "multiselect",
      name: "frameworks",
      message: "Which frameworks do you want to include?",
      choices: FRAMEWORKS,
      hint: "- Space to select. Enter to confirm",
      validate: value =>
        value.length > 0 ? true : "Please select at least one framework."
    });

    selectedFrameworks = frameworkResponse.frameworks || [];
  }

  deleteUnselectedFrameworkFolders(targetDir, selectedFrameworks);

  updateAstroConfig(targetDir, selectedFrameworks);

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

function deleteUnselectedFrameworkFolders(projectDir, selectedFrameworks) {
  const allFrameworks = FRAMEWORKS.map(f => f.value);

  const frameworksToDelete = allFrameworks.filter(
    f => !selectedFrameworks.includes(f)
  );

  for (const framework of frameworksToDelete) {
    const pageDir = path.join(projectDir, "src", "pages", framework);
    const componentDir = path.join(projectDir, "src", "framework", framework);

    if (fs.existsSync(pageDir)) {
      console.log(`🗑️ Removing ${path.relative(projectDir, pageDir)}`);
      fs.rmSync(pageDir, { recursive: true, force: true });
    }

    if (fs.existsSync(componentDir)) {
      console.log(`🗑️ Removing ${path.relative(projectDir, componentDir)}`);
      fs.rmSync(componentDir, { recursive: true, force: true });
    }
  }
}

function updateAstroConfig(projectDir, selectedFrameworks) {
  const configPath = path.join(projectDir, "astro.config.mjs");

  if (!fs.existsSync(configPath)) {
    console.warn("⚠️ astro.config.mjs not found, skipping integration cleanup.");
    return;
  }

  let content = fs.readFileSync(configPath, "utf-8");

  const allFrameworks = {
    angular: {
      import: /import\s+angular\s+from\s+['"]@analogjs\/astro-angular['"];\s*\n?/,
      integration: /angular\s*\(\s*\{[\s\S]*?\}\s*\)\s*,?\s*/
    },
    react: {
      import: /import\s+react\s+from\s+['"]@astrojs\/react['"];\s*\n?/,
      integration: /react\(\)\s*,?\s*/
    },
    vue: {
      import: /import\s+vue\s+from\s+['"]@astrojs\/vue['"];\s*\n?/,
      integration: /vue\(\)\s*,?\s*/
    }
  };

  for (const [framework, patterns] of Object.entries(allFrameworks)) {
    if (!selectedFrameworks.includes(framework)) {
      content = content.replace(patterns.import, "");
      content = content.replace(patterns.integration, "");
    }
  }

  // Clean up trailing commas inside integrations array
  content = content.replace(
    /integrations:\s*\[\s*,/g,
    "integrations: ["
  );
  content = content.replace(
    /,\s*\]/g,
    "]"
  );

  fs.writeFileSync(configPath, content, "utf-8");
  console.log("🛠️ Updated astro.config.mjs integrations");
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
        yarn: "yarn",
        pnpm: "pnpm install",
        bun: "bun install",
        deno: "deno install",
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
