# Create OutSystems Astro Islands

## Project Context
- This is a generator to create a template with examples for Astro Islands that will have their output taken and then injected into an OutSystems library, component or application.
- This is not an Astro project that will be deployed on its own. It is only used for the output generation.
- The output generation will be only client side. No server side rendering or server side components will be used.
- The Astro Islands can be used generated with the following frameworks:
    - Angular
    - Preact
    - Qwik
    - React
    - SolidJS
    - Svelte
    - Twig
    - VanillaJS
    - Vue
- While unique and custom functionality may be developed, a general use case will be for wrappers around pre-existing modules/libraries/components.

## Generator
- npm is the only supported package manager. Create a project with ```npx create-outsystems-astro```.
- During setup, the startup script will ask for which frameworks should be added. While many frameworks can be used/added, the recommendation is to use only one framework per project.
