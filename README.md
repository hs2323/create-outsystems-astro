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
- [React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/)

## Getting started
Run the Create OutSystems Astro generator:

### npm
```bash
npx create-outsystems-astro
```

### Yarn
```bash
yarn create outsystems-astro
```

### pnpm
```bash
pnpm dlx create-outsystems-astro
```

### Bun
```bash
bunx create-outsystems-astro
```

### Deno
The Deno DX command is available in [Deno 2.6](https://deno.com/blog/v2.6).
```bash
dx create-outsystems-astro
```

This will create the generated files as well as an example component.

[View the full documentation](https://hs2323.github.io/create-outsystems-astro/guides/getting-started/).

## 🚀 Project Structure

```text
/
├── public/
├── src/
│   └── components/
│       └── Counter.tsx
│   └── images/
│       └── image.png
│   └── pages/
│       └── counter.astro
│   └── styles/
│       └── index.css
└── package.json
```

### Pages
Each page inside of the pages file should represent an Island that will be imported into OutSystems.

### Components
The location of the component code.

### Images
Any image assets.

### Styles
Stylesheets that may apply to the component.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

### npm

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build distribution to `./dist/`                  |
| `npm run output`          | Build OutSystems production site to `./output/`  |
| `npm run preview`         | Preview build locally, before creating output    |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Yarn

| Command                   | Action                                            |
| :------------------------ | :-----------------------------------------------  |
| `yarn install`             | Installs dependencies                            |
| `yarn run dev`             | Starts local dev server at `localhost:4321`      |
| `yarn run build`           | Build distribution to `./dist/`                  |
| `yarn run output`          | Build OutSystems production site to `./output/`  |
| `yarn run preview`         | Preview build locally, before creating output    |
| `yarn run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn run astro -- --help` | Get help using the Astro CLI                     |

### pnpm

| Command                   | Action                                            |
| :------------------------ | :-----------------------------------------------  |
| `pnpm install`             | Installs dependencies                            |
| `pnpm run dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm run build`           | Build distribution to `./dist/`                  |
| `pnpm run output`          | Build OutSystems production site to `./output/`  |
| `pnpm run preview`         | Preview build locally, before creating output    |
| `pnpm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro -- --help` | Get help using the Astro CLI                     |

### Bun

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build distribution to `./dist/`                  |
| `bun run output:bun`      | Build OutSystems production site to `./output/`  |
| `bun run preview`         | Preview build locally, before creating output    |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

### Deno

| Command                   | Action                                            |
| :------------------------ | :-----------------------------------------------  |
| `deno install`             | Installs dependencies                            |
| `deno run dev`             | Starts local dev server at `localhost:4321`      |
| `deno run build`           | Build distribution to `./dist/`                  |
| `deno run output:deno`     | Build OutSystems production site to `./output/`  |
| `deno run preview`         | Preview build locally, before creating output    |
| `deno run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `deno run astro -- --help` | Get help using the Astro CLI                     |

## Getting Started
Delete the demo application under the ```src``` folder and being to build your own application. 

## Converting to OutSystems

Once development is complete, run the output generation command:

### npm
```bash
npm run output
```

### Yarn
```bash
yarn run output
```

### pnpm
```bash
pnpm run output
```

### Bun
```bash
bun run output:bun
```

### Deno
```bash
deno run output:deno
```

This will create a set of files that will then need to be coverted to OutSystems components.
