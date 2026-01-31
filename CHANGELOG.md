# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Updated template explicit peer dependencies @angular-devkit/architect, @angular/cli, hono and vite for Yarn.
- Updated template dependency vue 3.25.7.
- Updated template dependency vitest to 4.0.18.
- Updated template dependency typescript-eslint to 8.54.0.
- Updated template dependency react-dom to 19.2.4.
- Updated template dependency react to 19.2.4.
- Updated template dependency prettier to 3.8.1.
- Updated template dependency happy-dom to 20.4.0.
- Updated template dependency globals to 17.2.0.
- Updated template dependency eslint-plugin-playwright 2.5.1.
- Updated template dependency eslint-plugin-perfectionist to 5.4.0.
- Updated template dependency astro to 5.17.1.
- Updated template dependency angular-eslint to 21.2.0.
- Updated template dependency @types/react to 19.2.10.
- Updated template dependency @types/node to 25.1.0.
- Updated template dependency @testing-library/react to 16.3.2.
- Updated template dependency @playwright/test to 1.58.1.
- Updated template dependency @eslint/compat to 2.0.2.
- Updated template dependency @angular/router to 21.1.2.
- Updated template dependency @angular/platform-server to 21.1.2.
- Updated template dependency @angular/platform-browser to 21.1.2.
- Updated template dependency @angular/language-service to 21.1.2.
- Updated template dependency @angular/core to 21.1.2.
- Updated template dependency @angular/compiler-cli to 21.1.2.
- Updated template dependency @angular/compiler to 21.1.2.
- Updated template dependency @angular/common to 21.1.2.
- Updated template dependency @angular/build to 21.1.2.
- Updated template dependency @angular/animations to 21.1.2.
- Updated template dependency @analogjs/vitest-angular to 2.2.3.
- Updated template dependency @analogjs/vite-plugin-angular to 2.2.3.
- Updated template dependency @analogjs/astro-angular to 2.2.3.
- Changed recommendation of function handler from binding to the ```window``` instead of the ```document``` object.

### Security
- Updated template sub-dependency tar to 7.5.7 due to CVE-2026-24842.
- Updated template sub-dependency hono to 4.11.7 due to CVE-2026-24472, CVE-2026-24398 and CVE-2026-24473.

## [0.4.2] - 2026-01-21

### Changed
- Changing manual chunks output to remove .js in filename.

### Security
- Updated template sub-dependency tar to 7.5.6 due to CVE-2026-23950.

## [0.4.1] - 2026-01-16

### Changed
- Updated docs dependency prettier to 3.8.0.
- Updated docs dependency astro to 5.16.11.
- Updated docs dependency @astrojs/starlight to 0.37.3.
- Updated template dependency happy-dom to 20.3.1.
- Updated template dependency eslint-plugin-vue to 10.7.0.
- Updated template dependency astro to 5.16.11.
- Updated template dependency @types/node to 25.0.9.

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
- Updated template dependency @types/react to 19.2.8.
- Updated template dependency @types/node to 25.0.8.
- Updated template dependency @astrojs/vue to 5.1.4.
- Updated docs dependency typescript-eslint to 8.53.0.
- Updated docs dependency astro to 5.16.9.
- Updated docs dependency @astrojs/starlight to 0.37.2.

### Fixed
- Fixed Deno build and output.
- Fixed Bun build and output.

### Security
- Updated docs sub-dependency h3 to 1.15.5 due to CVE-2026-23527.
- Updated docs sub-dependency devalue to 5.6.2 due to CVE-2026-22774.
- Updated template sub-dependency h3 to 1.15.5 due to CVE-2026-23527.
- Updated template sub-dependency devalue to 5.6.2 due to CVE-2026-22774.
- Updated template dependency undici to 17.8.2 due to CVE-2026-22036. 
- Updated template dependency diff to 8.0.3 due to GHSA-73rr-hh4g-fpgx.
- Updated docs dependency diff to 8.0.3 due to GHSA-73rr-hh4g-fpgx.

## [0.3.0] - 2025-12-24

### Added
- Added GitHub CI publishing to npm.
- Added integration guides for AI agents.
- Added ability to use package managers npm, Yarn, pnpm, Bun and Deno for initialization.
- Added slot processing for output into OutSystems.

### Changed
- Updated docs dependency astro to 5.16.6.
- Updated template dependency vue to 3.25.6.
- Updated template dependency astro to 5.16.6.
- Changed CLI generation to include only requested frameworks.

## [0.2.0] - 2025-12-18

### Added
- Added Vue integration.

### Changed
- Changed folder structure of demo components.
- Updated docs dependency astro to 5.16.5.
- Updated docs dependency @astrojs/starlight to 0.37.1.
- Updated template dependency astro to 5.16.5.
- Updated template dependency react to 19.2.3.
- Updated template dependency react-dom to 19.2.3.

## [0.1.0] - 2025-12-03

### Added
- Added Starlight docs.
- Added template starter.
