# OutSystems Astro Islands
Generates [Astro Islands](https://docs.astro.build/en/concepts/islands/) for use in OutSystems that can create self contained interactive code elements from different frameworks. It allows an extension of the front-end with these dynamic libraries.

## When to use this library
- Custom interactive elements that would be difficult/not possible to build directly in OutSystems.
- Wrappers around interactive elements built in other front-end frameworks.
- Direct migration of external traditional code.

## When NOT to use this library
- You will most likely not need to use this library for most of the front-end development. This is similar in use to the custom code development in for the back-end in [O11](https://success.outsystems.com/documentation/11/integration_with_external_systems/extend_logic_with_your_own_code/) and [ODC](https://success.outsystems.com/documentation/outsystems_developer_cloud/building_apps/extend_your_apps_with_custom_code/).
- If the functionality is easily buidable in Service Studio.
- Loading performance of component must be instant. The Astro Island will load after the page/screen has loaded since the initializer and tag will be loaded after.

## Current supported frameworks
- [Angular](https://analogjs.org/docs/packages/astro-angular/overview)
- [Preact](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Qwik](https://qwik.dev/docs/integrations/astro/)
- [React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [SolidJS](https://docs.astro.build/en/guides/integrations-guide/solid-js/)
- [Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/)
- [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/)

## Getting started
Run the Create OutSystems Astro generator:

```bash
npx create-outsystems-astro
```

This will create the generated files as well as an example component.

[View the full documentation](https://hs2323.github.io/create-outsystems-astro/guides/getting-started/).

## 🚀 Project Structure

```text
/
├── public/
├── src/
│   └── framework/
│       └── [NAME]/
│           └── components/
│               └── Counter.tsx
│   └── lib/
│       └── library.ts
│   └── images/
│       └── image.png
│   └── pages/
│       └── [NAME]/
│           └── page.astro
│   └── styles/
│       └── index.css
│   └── stores/
│       └── store.ts
├── test/
│   └── e2e
│       └── [NAME]/
│           └── counter.spec.ts
│   └── integration
│       └── [NAME]/
│           └── counter.test.tsx
│           └── conter.test.ts
│   └── unit
        └── counter.test.ts
└── package.json
```

### Src

#### Framework Components
The location of the component code. Each framework has its own separate folder.

#### Lib
Cane be use for shared/library logic that is not part of the visual presentation of the component.

#### Images
Any image assets.

#### Pages
Each page inside of the pages file should represent an Island that will be imported into OutSystems. This is for setup/development and the actual page will not be used for the final output. Pages may be split by framework if using multiple frameworks.

#### Styles
Stylesheets that may apply to the component.

#### Stores
Nano Stores for use in components.

### Test

#### E2E
End-to-end tests using Playwright.

#### Integration
Integration tests that test the whole component structure. Written using Testing Library specific providers.

#### Unit
Unit tests for functions or shared code/libraries.


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build distribution to `./dist/`                  |
| `npm run output`          | Build OutSystems production site to `./output/`  |
| `npm run preview`         | Preview build locally, before creating output    |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run audit`           | Run audit of modules                             |

## Getting Started
Delete the demo application under the ```src``` folder and being to build your own application. It is recommended to keep the folder structure. The frameworks/[NAME]/components should be kept for asset building.

## Converting to OutSystems

Once development is complete, run the output generation command:

```bash
npm run output
```

This will create a set of files that will then need to be coverted to OutSystems components.
