# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleaed]

### Security

- Patched dependency astro due to CVE-2026-41067.
- Updated sub-dependency hono to 4.12.14 due to GHSA-458j-xx4x-4375.

## [0.8.2] - 2026-04-14

### Security

- Updated sub-dependency hono to 4.12.12 due to GHSA-26pp-8wgv-hjvm, CVE-2026-39410, CVE-2026-39409, CVE-2026-39408 and CVE-2026-39407.
- Updated sub-dependency @hono/node-server to 1.19.14 due to CVE-2026-39406.
- Updated sub-dependency vite to 6.4.2, 7.3.2, and 8.0.8 due to CVE-2026-39363, CVE-2026-39364 and CVE-2026-39365.
- Updated sub-dependency defu to 6.1.6 due to CVE-2026-35209.

## [0.8.1] - 2026-04-03

### Added

- Adding dependency cross-env to run build scripts across environments.

## [0.8.0] - 2026-03-29

### Added

- Added SolidJS integration.
- Added dependency @oxc-project/runtime due to Angular testing issue.

### Changed

- Updated dependency vue to 3.5.31.
- Updated dependency vitest to 4.1.2.
- Updated dependency vite to 8.0.1.
- Updated dependency svelte to 5.55.0.
- Updated dependency preact to 10.29.0.
- Updated dependency nanostores to 1.2.0.
- Updated dependency happy-dom to 20.8.9.
- Updated dependency @vitejs/plugin-vue to 6.0.5.
- Updated dependency @vitejs/plugin-react to 6.0.1.
- Updated dependency @types/node to 25.5.0.
- Updated dependency @sveltejs/vite-plugin-svelte 7.0.0.
- Updated dependency @preact/preset-vite to 2.10.5.
- Updated dependency @nanostores/react to 1.1.0.
- Updated dependency @nanostores/preact to 1.1.0.
- Updated dependency typescript-eslint to 8.57.2.
- Updated dependency eslint-plugin-testing-library to 7.16.2
- Updated dependency eslint-plugin-svelte to 3.16.0.
- Updated dependency eslint-plugin-playwright to 2.10.1.
- Updated dependency eslint-plugin-perfectionist to 5.7.0.
- Updated dependency eslint-plugin-jest to 29.15.1.
- Updated dependency eslint-plugin-jest 29.15.1.
- Updated dependency angular-eslint 21.3.1.
- Updated dependency @eslint/markdown to 8.0.0.
- Updated dependency @angular/router to 21.2.6.
- Updated dependency @angular/platform-server to 21.2.6.
- Updated dependency @angular/platform-browser to 21.2.6.
- Updated dependency @angular/language-service to 21.2.6.
- Updated dependency @angular/core to 21.2.6.
- Updated dependency @angular/compiler-cli to 21.2.6.
- Updated dependency @angular/compiler to 21.2.6.
- Updated dependency @angular/common to 21.2.6.
- Updated dependency @angular/cli to 21.2.5.
- Updated dependency @angular/build to 21.2.5.
- Updated dependency @angular/animations to 21.2.6.
- Updated dependency @angular-devkit/schematics to 21.2.5.
- Updated dependency @angular-devkit/architect to 0.2102.5.

## [0.7.2] - 2026-03-28

### Changed

- Changed build output to run as NODE_ENV=production.

### Security

- Updated sub-dependency path-to-regexp to 8.4.0 due to CVE-2026-4923 and CVE-2026-4926.
- Updated sub-dependency brace-expansion to 1.1.13, 2.0.3 and 5.0.5 due to CVE-2026-33750.
- Updated sub-dependency smol-toml to 1.6.1 due to GHSA-v3rj-xjv7-4jmq.
- Updated sub-dependency yaml to 1.10.3 and 2.8.3 due to CVE-2026-33532.
- Updated dependency happy-dom to 20.8.8 due to CVE-2026-33943.
- Updated sub-dependency picomatch to 2.3.2 and 4.0.4 due to CVE-2026-33672.
- Updated dependency astro to 5.18.1 due to CVE-2026-33769.
- Updated sub-dependency h3 to 1.15.9 due to CVE-2026-33128.
- Updated sub-dependency flatted to 3.4.2 due to CVE-2026-33228.

## [0.7.1] - 2026-03-15

### Security

- Updated sub-dependency undici to 7.24.3 due to CVE-2026-1525, CVE-2026-1526, CVE-2026-1527, CVE-2026-1528, CVE-2026-2229 and CVE-2026-2581.
- Updated sub-dependency flatted to 3.4.1 due to CVE-2026-32141.
- Updated dependency @angular/router to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/platform-server to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/platform-browser to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/language-service to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/core to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/compiler-cli to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/compiler to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/common to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular/cli to 21.2.2 due to CVE-2026-32635.
- Updated dependency @angular/build to 21.2.2 due to CVE-2026-32635.
- Updated dependency @angular/animations to 21.2.4 due to CVE-2026-32635.
- Updated dependency @angular-devkit/schematics to 21.2.2 due to CVE-2026-32635.
- Updated dependency @angular-devkit/architect to 0.2102.2 due to CVE-2026-32635.
- Updated sub-dependency devalue to 5.6.4 due to CVE-2026-30226.
- Updated sub-dependency tar to 7.5.11 due to CVE-2026-31802.
- Updated sub-dependency hono to 4.12.7 due to GHSA-v8w9-8mx6-g223.

## [0.7.0] - 2026-03-08

### Added

- Added peer dependency @babel/core.
- Added Preact integration.

### Changed

- Updated dependency svelte-eslint-parser to 1.6.0.
- Updated dependency svelte to 5.53.7.
- Updated dependency prettier-plugin-svelte to 3.5.1.
- Updated dependency happy-dom to 20.8.3.
- Updated dependency globals to 17.4.0.
- Updated dependency eslint-plugin-playwright to 2.9.0.
- Updated dependency eslint to 9.39.4.
- Updated dependency angular-eslint to 21.3.0.
- Updated dependency @types/node to 25.3.5.
- Updated dependency @nanostores/vue to 1.1.0.
- Updated dependency @eslint/js to 9.39.4.
- Updated dependency @eslint/eslintrc to 3.3.5.
- Updated dependency @eslint/compat to 2.0.3.
- Updated dependency @angular/router to 21.2.1.
- Updated dependency @angular/platform-server to 21.2.1.
- Updated dependency @angular/platform-browser to 21.2.1.
- Updated dependency @angular/language-service to 21.2.1.
- Updated dependency @angular/core to 21.2.1.
- Updated dependency @angular/compiler-cli to 21.2.1.
- Updated dependency @angular/compiler to 21.2.1.
- Updated dependency @angular/common to 21.2.1.
- Updated dependency @angular/cli to 21.2.1.
- Updated dependency @angular/build to 21.2.1.
- Updated dependency @angular/animations to 21.2.1.
- Updated dependency @angular-devkit/schematics to 21.2.1.
- Updated dependency @angular-devkit/architect to 0.2102.1.
- Updated dependency @analogjs/vitest-angular to 2.3.1.
- Updated dependency @analogjs/vite-plugin-angular to 2.3.1.
- Updated dependency @analogjs/astro-angular to 2.3.1.
- Updated dependency Playwright to 1.58.2.

### Fixed

- Fixed generator renaming .gitignore to .npmignore in generated template.
- Fixed Playwright checking for root to be ready.

## [0.6.0] - 2026-02-28

### Added

- Added Svelte integration.

### Changed

- Updated dependency vue-eslint-parser to 10.4.0.
- Updated dependency typescript-eslint to 8.56.1.
- Updated dependency happy-dom to 20.7.0.
- Removed hono peer dependency.
- Updated dependency eslint-plugin-vue to 10.8.0.
- Updated dependency eslint-plugin-testing-library to 7.16.0.
- Updated dependency eslint-plugin-playwright to 2.8.0.
- Updated dependency eslint-plugin-perfectionist to 5.6.0.
- Updated dependency eslint-plugin-jest to 29.15.0.
- Updated dependency eslint-plugin-astro to 1.6.0.
- Updated dependency eslint to 9.39.3.
- Updated dependency dotenv to 17.3.1.
- Updated dependency @vitejs/plugin-vue to 6.0.4.
- Updated dependency @vitejs/plugin-react to 5.1.4.
- Updated dependency @types/react to 19.2.14.
- Updated dependency @types/node to 25.3.2.
- Updated dependency @testing-library/angular to 19.1.0.
- Updated dependency @eslint/js to 9.39.3.
- Updated dependency @angular/cli to 21.2.0.
- Added peer dependency @angular-devkit/schematics.
- Updated dependency @angular-devkit/architect to 0.2102.0.
- Updated dependency vue to 3.5.29.
- Updated dependency nanostores to 1.1.1.
- Updated dependency astro to 5.18.0.

### Fixed

- Fixed inline script Nano Stores for development .astro pages.

## [0.5.0] - 2026-02-28

### Added

- Added improved-yarn-audit for Yarn auditing.
- Added better-npm-audit for npm auditing.
- Added peer dependencies @angular-devkit/architect, @angular/cli, hono, vite and zod.
- Added Nano Stores for React and Vue.

### Changed

- Updated Deno allowed scripts.
- Updated dependency vue 3.25.7.
- Updated dependency vitest to 4.0.18.
- Updated dependency typescript-eslint to 8.54.0.
- Updated dependency react-dom to 19.2.4.
- Updated dependency react to 19.2.4.
- Updated dependency prettier to 3.8.1.
- Updated dependency happy-dom to 20.4.0.
- Updated dependency globals to 17.3.0.
- Updated dependency eslint-plugin-playwright 2.5.1.
- Updated dependency eslint-plugin-perfectionist to 5.4.0.
- Updated dependency astro to 5.17.1.
- Updated dependency angular-eslint to 21.2.0.
- Updated dependency @types/react to 19.2.10.
- Updated dependency @types/node to 25.1.0.
- Updated dependency @testing-library/react to 16.3.2.
- Updated dependency @eslint/compat to 2.0.2.
- Updated dependency @angular/router to 21.1.2.
- Updated dependency @angular/platform-server to 21.1.2.
- Updated dependency @angular/platform-browser to 21.1.2.
- Updated dependency @angular/language-service to 21.1.2.
- Updated dependency @angular/core to 21.1.2.
- Updated dependency @angular/compiler-cli to 21.1.2.
- Updated dependency @angular/compiler to 21.1.2.
- Updated dependency @angular/common to 21.1.2.
- Updated dependency @angular/build to 21.1.2.
- Updated dependency @angular/animations to 21.1.2.
- Updated dependency @analogjs/vitest-angular to 2.2.3.
- Updated dependency @analogjs/vite-plugin-angular to 2.2.3.
- Updated dependency @analogjs/astro-angular to 2.2.3.
- Changed recommendation of function handler from binding to the `window` instead of the `document` object.

### Security

- Updated sub-dependency express-rate-limit to 8.2.2 due to CVE-2026-30827.
- Updated dependency @angular/router to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/cli to 21.1.5 due to CVE-2026-27970.
- Updated dependency @angular-devkit/architect to 0.2101.5 due to CVE-2026-27970.
- Updated dependency @analogjs/vite-plugin-angular to 2.3.0 due to CVE-2026-27970.
- Updated dependency @angular/platform-server to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/platform-browser" to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/language-service to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/core to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/compiler-cli to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/compiler to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/common to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/build to 21.1.6 due to CVE-2026-27970.
- Updated dependency @angular/animations to 21.1.6 due to CVE-2026-27970.
- Updated dependency @analogjs/astro-angular to 2.3.0 due to CVE-2026-27970.
- Updated sub-dependency minimatch@10 to 10.2.4 due to CVE-2026-27903.
- Updated sub-dependency minimatch@9 to 9.0.9 due to CVE-2026-27903.
- Updated sub-dependency minimatch@3 to 3.1.5 due to CVE-2026-27903.
- Updated sub-dependency rollup to 4.59.0 due to CVE-2026-27606.
- Updated sub-dependency tar to 7.5.8 due to CVE-2026-26960.
- Updated sub-dependency devalue to 5.6.3 due to GHSA-33hq-fvwr-56pm.
- Updated sub-dependency ajv@8 to 8.18.0 due to CVE-2025-69873.
- Updated sub-dependency ajv@6 to 6.14.0 due to CVE-2025-69873.
- Updated sub-dependency qs to 6.14.2 due to CVE-2026-2391.
- Updated sub-dependency @isaacs/brace-expansion to 5.0.1 due to CVE-2026-25547.
- Updated sub-dependency @modelcontextprotocol/sdk to 1.26.0 due to CVE-2026-25536.

## [0.4.2] - 2026-01-21

### Changed

- Changing manual chunks output to remove .js in filename.

### Security

- Updated sub-dependency tar to 7.5.6 due to CVE-2026-23950.

## [0.4.1] - 2026-01-16

### Changed

- Updated dependency happy-dom to 20.3.1.
- Updated dependency eslint-plugin-vue to 10.7.0.
- Updated dependency astro to 5.16.11.
- Updated dependency @types/node to 25.0.9.

### Fixed

- Fixed missing template GitHub Actions npm install.

## [0.4.0] - 2026-01-15

### Added

- Added ESLint linting.
- Added Prettier formatting.
- Added Playwright end-to-end testing.
- Added Testing Library integration testing.
- Added Vitest unit testing.
- Added patch-package.
- Added Angular integration.

### Changed

- Updated temlate dependency astro to 5.16.9.
- Updated dependency @types/react to 19.2.8.
- Updated dependency @types/node to 25.0.8.
- Updated dependency @astrojs/vue to 5.1.4.

### Fixed

- Fixed Deno build and output.
- Fixed Bun build and output.

### Security

- Updated sub-dependency h3 to 1.15.5 due to CVE-2026-23527.
- Updated sub-dependency devalue to 5.6.2 due to CVE-2026-22774.
- Updated dependency undici to 17.8.2 due to CVE-2026-22036.
- Updated dependency diff to 8.0.3 due to GHSA-73rr-hh4g-fpgx.

## [0.3.0] - 2025-12-24

### Added

- Added GitHub CI publishing to npm.
- Added integration guides for AI agents.
- Added ability to use package managers npm, Yarn, pnpm, Bun and Deno for initialization.
- Added slot processing for output into OutSystems.

### Changed

- Updated dependency vue to 3.25.6.
- Updated dependency astro to 5.16.6.
- Changed CLI generation to include only requested frameworks.

## [0.2.0] - 2025-12-18

### Added

- Added Vue integration.

### Changed

- Changed folder structure of demo components.
- Updated dependency astro to 5.16.5.
- Updated dependency react to 19.2.3.
- Updated dependency react-dom to 19.2.3.

## [0.1.0] - 2025-12-03

### Added

- Added Starlight docs.
- Added starter.
