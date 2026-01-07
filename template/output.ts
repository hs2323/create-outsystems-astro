import * as fs from "node:fs";
import * as path from "node:path";
import beautify from "js-beautify";
import dotenv from 'dotenv';
dotenv.config();

const { html: beautifyHtml } = beautify;

/**
 * Extracts all <astro-island>...</astro-island> blocks from HTML.
 */
function keepAstroIslands(html: string): string {
  const astroIslandRegex = /<astro-island\b[^>]*>[\s\S]*?<\/astro-island>/gi;
  const islands = html.match(astroIslandRegex) || [];
  return islands.join("\n");
}

function formatAstroIslandAttributes(html: string): string {
  // For each <astro-island ...>, put attributes on new lines
  return html.replace(
    /<astro-island\b([^>]*)>/gi,
    (match, attrs) => {

      // 🔥 Convert HTML-encoded quotes to actual quotes
      const decoded = attrs.replace(/&quot;/g, '""');

      // Split attributes by whitespace
      const formattedAttrs = decoded
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(attr => `  ${attr}`) // indent each attr
        .join("\n");

      return `<astro-island\n${formattedAttrs}>`;
    }
  );
}

/**
 * Stringifies the inner contents of astro-islands for exporting to OutSystems.
 * @param html
 * @returns 
 */
function stringifyAstroIslandContents(html: string): string {
  return html.replace(
    /(<astro-island\b[^>]*>)([\s\S]*?)(<\/astro-island>)/gi,
    (_match, openTag, inner, closeTag) => {
      const cleanedInner = inner.replace(/<!--\s*astro:end\s*-->/gi, "");
      
      // Trim leading/trailing newlines
      const trimmed = cleanedInner.replace(/^\s+|\s+$/g, "");

      const lines = trimmed.split(/\r?\n/);

      const stringified = lines
        .map((line, index) => {
          const escaped = line
            .replace(/\\/g, "\\\\")   // escape backslashes first
            .replace(/"/g, '""');    // escape quotes

          // No trailing + on the last line
          return index === lines.length - 1
            ? `"${escaped}"`
            : `"${escaped}" +`;
        })
        .join("\n");

      return `${openTag}\n${stringified}\n${closeTag}`;
    }
  );
}

/**
 * Recursively collects files with a given extension in a directory.
 */
function getAllFilesWithExtension(dir: string, ext: string): string[] {
  let results: string[] = [];

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFilesWithExtension(filePath, ext));
    } else if (filePath.endsWith(ext)) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Ensures a directory exists before writing or copying.
 */
function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Recursively deletes a directory.
 */
function clearDirectory(dir: string) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      clearDirectory(entryPath);
      fs.rmdirSync(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }
}

/**
 * Recursively copies a directory and its contents.
 */
function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Source directory not found: ${src}`);
    return;
  }

  ensureDirExists(dest);

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Converts dist/foo/index.html → output/foo.html
 * Keeps dist/index.html as output/index.html
 */
function getFlattenedHtmlOutputPath(inputFile: string, inputDir: string, outputDir: string): string {
  const relative = path.relative(inputDir, inputFile);
  const parts = relative.split(path.sep);

  if (parts.length > 1 && parts[parts.length - 1] === "index.html") {
    const folderName = parts[parts.length - 2];
    return path.join(outputDir, `${folderName}.html`);
  }

  return path.join(outputDir, relative);
}

/**
 * Processes and flattens HTML files (expanded output)
 */
function processAllHTML(inputDir: string, outputDir: string): void {
  const htmlFiles = getAllFilesWithExtension(inputDir, ".html");
  if (htmlFiles.length === 0) {
    console.warn(`⚠️ No HTML files found in ${inputDir}`);
    return;
  }

  for (const inputFile of htmlFiles) {
    const outputFile = getFlattenedHtmlOutputPath(inputFile, inputDir, outputDir);
    const html = fs.readFileSync(inputFile, "utf-8");

    // Filter to only keep astro-islands
    const filtered = keepAstroIslands(html);

    // Beautify / expand the HTML before writing
    const beautified = beautifyHtml(filtered, {
      indent_size: 2,
      preserve_newlines: true,
      max_preserve_newlines: 1,
      wrap_line_length: 120,
      unformatted: ["code", "pre", "em", "strong"],
    });

    const prettyHtml = formatAstroIslandAttributes(beautified);
    const innerStringifiedHtml = stringifyAstroIslandContents(prettyHtml);

    ensureDirExists(path.dirname(outputFile));
    fs.writeFileSync(outputFile, innerStringifiedHtml, "utf-8");

    console.log(`✅ Processed HTML: ${path.relative(inputDir, inputFile)} → ${path.relative(outputDir, outputFile)}`);
  }
}

/**
 * Copies all .js files from dist/ to output/
 */
function copyAllJSFiles(inputDir: string, outputDir: string): void {
  const jsFiles = getAllFilesWithExtension(inputDir, ".js");
  if (jsFiles.length === 0) {
    console.warn(`⚠️ No JavaScript files found in ${inputDir}`);
    return;
  }

  for (const inputFile of jsFiles) {
    const relativePath = path.relative(inputDir, inputFile);
    const outputFile = path.join(outputDir, relativePath);

    ensureDirExists(path.dirname(outputFile));
    fs.copyFileSync(inputFile, outputFile);

    console.log(`📜 Copied JS: ${relativePath}`);
  }
}

function prefixAssetPathsInFile(filePath: string) {
  const ASSET_PATH = process.env.ASSET_PATH || "";
  let content = fs.readFileSync(filePath, "utf-8");

  // Replace "/assets/..." inside string literals with prefixed path
  // Match quotes + /assets/ at start of string
  content = content.replace(/(["'`])\/assets\//g, `$1/${ASSET_PATH}/`);

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Prefixed asset paths in ${filePath}`);
}

function processAllJsFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processAllJsFiles(fullPath);
    } else if (entry.name.endsWith(".js")) {
      prefixAssetPathsInFile(fullPath);
    }
  }
}


/**
 * Main function
 */
function processOutput() {
  const inputDir = path.resolve("dist");
  const outputDir = path.resolve("output");
  const assetsSrc = path.join(inputDir, "assets");
  const assetsDest = path.join(outputDir, "assets");

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  // 🧹 Clear output directory before writing
  if (fs.existsSync(outputDir)) {
    console.log("🧹 Clearing output directory...");
    clearDirectory(outputDir);
  } else {
    ensureDirExists(outputDir);
  }

  console.log("⚙️ Processing HTML files...");
  processAllHTML(inputDir, outputDir);

  console.log("📦 Copying assets...");
  copyDirectory(assetsSrc, assetsDest);

  console.log("📜 Copying JavaScript files...");
  copyAllJSFiles(inputDir, outputDir);

  console.log("📜 Processing asset paths...");
  processAllJsFiles("output");

  console.log("✅ Done!");
}

processOutput();
