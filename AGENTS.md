# Create OutSystems Astro Islands

## Project Context
- This is a generator to create a template with examples for Astro Islands that will have their output taken and then injected into an OutSystems library, component or application.
- This is not an Astro project that will be deployed on its own. It is only used for the output generation.
- The output generation will be only client side. No server side rendering or server side components will be used.
- The Astro Islands can be used generated with the following frameworks:
    - React
    - Vue
- While unique and custom functionality may be developed, a general use case will be for wrappers around pre-existing modules/libraries/components.

## Generator
- The following other package managers/runtimes are supported:
    - npm
    - Yarn
    - pnpm
    - Bun
    - Deno
- The command to create a project in each
    - npm: ```npx create-outsystems-astro```.
    - Yarn: ```yarn create outsystems-astro```.
    - pnpm: ```pnpm dlx create-outsystems-astro```.
    - Bun: ```bunx create-outsystems-astro```.
    - Deno (only available in Deno 2.6 and up): ```dx create-outsystems-astro```.
- During setup, the startup script will determine which package manager was calling it and remove the other lock files.
- During setup, the startup script will ask for which frameworks should be added. While many frameworks can be used/added, the recommendation is to use only one framework per project.
