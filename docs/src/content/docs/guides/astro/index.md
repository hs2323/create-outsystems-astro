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
```bash
npx create-outsystems-astro
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

For Angular, keep the framework/angular structure in place or update the ```astro.config.mjs``` file's transformFilter section. This is the location that Astro will use to modify the Angular files.

### Pages
Each page inside of the pages file should represent an Island that will be imported into OutSystems. The example has them separated by framework name, but you can name them anything you would like. The output script will flatten the index.html to the root of the ```output``` folder with the name of the folder.

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
| `deno run output`          | Build OutSystems production site to `./output/`  |
| `deno run preview`         | Preview build locally, before creating output    |
| `deno run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `deno run astro -- --help` | Get help using the Astro CLI                     |

## Parameters
Since OutSystems does not have a concept of [NULL](https://success.outsystems.com/documentation/11/reference/outsystems_language/data/data_types/available_data_types/#default-and-null-values), you may have to code around NULL/undefined in your library.

### Slots
[Slots](https://docs.astro.build/en/basics/astro-components/#slots) are an optional HTML that can be passed into a component.  They are then able to be picked up and used by the Astro Island component. You can use either default slot or named slots (or both).

#### React
The default slot (no name) will go into a React component as the ```children``` prop name.  A named slot will go in as a parameter with the name.

- Astro example:
    ```jsx
    ...
    <Component client:only="react">
        <div slot="header">
            <p>Slot header</p>
        </div>
        <div>
            <p>Slot content</p>
        </div>
    </CounterComponent>
    ```

- React example:
    ```js
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
The default slot (no name) will go into a React component as the ```<slot />``` name.  A named slot will go in as a parameter with the name.

- Astro example:
    ```jsx
    ...
    <Component client:only="react">
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
Since OutSystems cannot pass in a function handler, it has to be bound to the document. Usually, this is passed in as a name, and that name is a handler for the document function.  On the Astro library side, you have to call the following (replace functionName):
```js
 document[functionName](value);
 ```

 To pass back an array or object, you must ```JSON.stringify``` it first. The object must then be deserialized on the OutSystems side.
```js
 document[onSelectChange](JSON.stringify(newValues));
 ```

You cannot send Union types (such as either an array or object) due to OutSystems being strongly typed. For example, if you have instances where you send either 0, 1 or multiple items back to the handler, it is important to have an array for that. If only expecting 0-1 items, an object should be fine.

## Converting to OutSystems

- Copy the environment template file to ```.env```.
    ```bash
    cp .env.template .env
    ```

- Update the ```.env``` file and modify the ```ASSET_PATH``` value to be the application/library/core widget module name in OutSystems.

- Once development is complete, run:
    ```bash
    npm run output
    ```

This will create a set of files that will then need to be converted to OutSystems components.
