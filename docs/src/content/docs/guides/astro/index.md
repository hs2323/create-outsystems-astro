---
title: Astro setup
description: Setup Astro JavaScript project
---

# Astro setup

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

Select the framework(s) that you would like to include as part of your project.

This will create the generated files as well as an example component. You can delete the example component resources before starting on your project.

## 🚀 Project Structure

```text
/
├── src/
│   └── framework/
│       └── react/
│           └── Counter.tsx
│       └── vue/
│           └── Counter.vue
│   └── images/
│       └── image.png
│   └── pages/
│       └── react/
│           └── react-counter.astro
│   └── pages/
│       └── vue/
│           └── vue-counter.astro
│   └── styles/
│       └── index.css
└── package.json
```

It is recommended not to mix different frameworks on a single Astro page (.astro file) page. Having multiple Astro islands on an OutSystems page should be fine.

For Angular, keep the framework/angular structure in place or update the `astro.config.mjs` file's transformFilter section. This is the location that Astro will use to modify the Angular files.

### Pages

Each page inside of the pages file should represent an Island that will be imported into OutSystems. The example has them separated by framework name, but you can name them anything you would like. The output script will flatten the index.html to the root of the `output` folder with the name of the folder.

### Framework

The location of the component code.

### Images

Any image assets.

### Styles

Stylesheets that may apply to the component.

## 🧞 Commands

All commands are run from the root of the project, from a terminal, based on your package manager:

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

| Command                    | Action                                           |
| :------------------------- | :----------------------------------------------- |
| `yarn install`             | Installs dependencies                            |
| `yarn run dev`             | Starts local dev server at `localhost:4321`      |
| `yarn run build`           | Build distribution to `./dist/`                  |
| `yarn run output`          | Build OutSystems production site to `./output/`  |
| `yarn run preview`         | Preview build locally, before creating output    |
| `yarn run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn run astro -- --help` | Get help using the Astro CLI                     |

### pnpm

| Command                    | Action                                           |
| :------------------------- | :----------------------------------------------- |
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

| Command                               | Action                                           |
| :------------------------------------ | :----------------------------------------------- |
| `deno install && deno run postinsall` | Installs dependencies                            |
| `deno run dev`                        | Starts local dev server at `localhost:4321`      |
| `deno run build`                      | Build distribution to `./dist/`                  |
| `deno run output:deno`                | Build OutSystems production site to `./output/`  |
| `deno run preview`                    | Preview build locally, before creating output    |
| `deno run astro ...`                  | Run CLI commands like `astro add`, `astro check` |
| `deno run astro -- --help`            | Get help using the Astro CLI                     |

## Parameters

Since OutSystems does not have a concept of [NULL](https://success.outsystems.com/documentation/11/reference/outsystems_language/data/data_types/available_data_types/#default-and-null-values), you may have to code around NULL/undefined in your library.

### Slots

[Slots](https://docs.astro.build/en/basics/astro-components/#slots) are an optional HTML that can be passed into a component. They are then able to be picked up and used by the Astro Island component. You can use either default slot or named slots (or both).

#### React

The default slot (no name) will go into a React component as the `children` prop name. A named slot will go in as a parameter with the name.

- Astro example:
```astro
  <CounterComponent client:only="react">
      <div slot="header">
          <p>Slot header</p>
      </div>
      <div>
          <p>Slot content</p>
      </div>
  </CounterComponent>
```

- React example:
```tsx
  export default function Component({
      children,
      header,
  }: {
      children: React.ReactNode;
      header: React.ReactNode;
  }) {
      return (
          <>
              {header}
              <div>
                  {children}
              </div>
          </>
      );
  }
```

#### Vue

The default slot (no name) will go into a React component as the `<slot />` name. A named slot will go in as a parameter with the name.

- Astro example:
```tsx
  <CounterComponent client:only="react">
      <div slot="header">
          <p>Slot header</p>
      </div>
      <div>
          <p>Slot content</p>
      </div>
  </CounterComponent>
```

- Vue example:
```vue
  <template>
    <slot name="header" />
    <div>
      <slot />
    </div>
  </template>
```

#### Angular

Angular does not support the use of slots.

## Using OutSystems handlers

Since OutSystems cannot pass in a function handler, it has to be bound to the document. Usually, this is passed in as a name, and that name is a handler for the document function. On the Astro library side, you have to call the following (replace functionName):

```js
document[functionName](value);
```

To pass back an array or object, you must `JSON.stringify` it first. The object must then be deserialized on the OutSystems side.

```js
document[onSelectChange](JSON.stringify(newValues));
```

You cannot send Union types (such as either an array or object) due to OutSystems being strongly typed. For example, if you have instances where you send either 0, 1 or multiple items back to the handler, it is important to have an array for that. If only expecting 0-1 items, an object should be fine.

## Converting to OutSystems

- Copy the environment template file to `.env`.

  ```bash
  cp .env.template .env
  ```

- Update the `.env` file and modify the `ASSET_PATH` value to be the application/library/core widget module name in OutSystems.

- Once development is complete, run:
  ```bash
  npm run output
  ```

This will create a set of files that will then need to be converted to OutSystems components.

## Testing

The generator comes with unit, integration and testing built in. You can use the built in ones or replace them with your own testing framework preferences.

### Unit testing

- [Vitest](https://vitest.dev/)
  The unit tests are placed in the `test/unit` folder. This is primarily for testing functions and logic.

### Integration Testing

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Angular Testing Library](https://testing-library.com/docs/angular-testing-library/intro/)
  The integration tests are placed in the `test/integration` folder. This tests the interaction between the components as a whole. The React and Vue libraries have an equivalent testing library module.

### End-to-End

- [Playwright](https://playwright.dev/)
  The end-to-end tests are placed in the `test/e2e` folder. This tests build the project and then runs a server preview. Playwright will launch a browser and test the page and components. To get started, install the Playwright browsers and necessary dependencies.

### npm

| Command                    | Action                                       |
| :------------------------- | :------------------------------------------- |
| `npm run test`             | Run unit and integration tests               |
| `npm run test:e2e:install` | Install Playwright browsers and dependencies |
| `npm run test:e2e`         | Run the end-to-end tests                     |
| `npm run test:e2e:ui`      | Run the end-to-end tests in UI mode          |

### Yarn

| Command                     | Action                                       |
| :-------------------------- | :------------------------------------------- |
| `yarn run test`             | Run unit and integration tests               |
| `yarn run test:e2e:install` | Install Playwright browsers and dependencies |
| `yarn run test:e2e`         | Run the end-to-end tests                     |
| `yarn run test:e2e:ui`      | Run the end-to-end tests in UI mode          |

### pnpm

| Command                     | Action                                       |
| :-------------------------- | :------------------------------------------- |
| `pnpm run test`             | Run unit and integration tests               |
| `pnpm run test:e2e:install` | Install Playwright browsers and dependencies |
| `pnpm run test:e2e`         | Run the end-to-end tests                     |
| `pnpm run test:e2e:ui`      | Run the end-to-end tests in UI mode          |

### Bun

For end-to-end tests, the Bun Playwright configuration is currently not working.
| Command | Action |
| :------------------------ | :----------------------------------------------- |
| `bun run test` | Run unit and integration tests |
| `bun run test:e2e:install`| Install Playwright browsers and dependencies |
| `bun run test:e2e` | Run the end-to-end tests |
| `bun run test:e2e:ui` | Run the end-to-end tests in UI mode |

### Deno

| Command                     | Action                                       |
| :-------------------------- | :------------------------------------------- |
| `deno run test`             | Run unit and integration tests               |
| `deno run test:e2e:install` | Install Playwright browsers and dependencies |
| `deno run test:e2e:deno`    | Run the end-to-end tests                     |
| `deno run test:e2e:ui:deno` | Run the end-to-end tests in UI mode          |

## Format

- [Prettier](https://prettier.io/)
  Formatting sets the guidelines for the code styles. The rules are able to be updated in the `.prettierrc` file.

### npm

| Command                | Action                          |
| :--------------------- | :------------------------------ |
| `npm run format`       | Run format check                |
| `npm run format:write` | Run format check and fix issues |

### Yarn

| Command                 | Action                          |
| :---------------------- | :------------------------------ |
| `yarn run format`       | Run format check                |
| `yarn run format:write` | Run format check and fix issues |

### pnpm

| Command                 | Action                          |
| :---------------------- | :------------------------------ |
| `pnpm run format`       | Run format check                |
| `pnpm run format:write` | Run format check and fix issues |

### Bun

| Command                | Action                          |
| :--------------------- | :------------------------------ |
| `bun run format`       | Run format check                |
| `bun run format:write` | Run format check and fix issues |

### Deno

| Command                 | Action                          |
| :---------------------- | :------------------------------ |
| `deno run format`       | Run format check                |
| `deno run format:write` | Run format check and fix issues |

## Lint

- [ESLint](https://prettier.io/)
  Linting sets the guidelines and finds errors, bugs and issues. The configuration is set in `eslint.config.mjs`.

### npm

| Command            | Action                    |
| :----------------- | :------------------------ |
| `npm run lint`     | Run linter                |
| `npm run lint:fix` | Run linter and fix issues |

### Yarn

| Command             | Action                    |
| :------------------ | :------------------------ |
| `yarn run lint`     | Run linter                |
| `yarn run lint:fix` | Run linter and fix issues |

### pnpm

| Command             | Action                    |
| :------------------ | :------------------------ |
| `pnpm run lint`     | Run linter                |
| `pnpm run lint:fix` | Run linter and fix issues |

### Bun

| Command            | Action                    |
| :----------------- | :------------------------ |
| `bun run lint`     | Run linter                |
| `bun run lint:fix` | Run linter and fix issues |

### Deno

| Command             | Action                    |
| :------------------ | :------------------------ |
| `deno run lint`     | Run linter                |
| `deno run lint:fix` | Run linter and fix issues |
