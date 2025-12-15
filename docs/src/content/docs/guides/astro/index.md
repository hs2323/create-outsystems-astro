---
title: Astro setup
description: Setup Astro JavaScript project
---

# Astro setup

## Current supported frameworks
- [React](https://docs.astro.build/en/guides/integrations-guide/react/).

## Getting started
Run the Create OutSystems Astro generator:
```bash
npx create-outsystems-astro
```
This will create the generated files as well as an example component.

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

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build distribution to `./dist/`                  |
| `npm run output`          | Build OutSystems production site to `./output/`  |
| `npm run preview`         | Preview build locally, before creating output    |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Parameters
Since OutSystems does not have a concept of [NULL](https://success.outsystems.com/documentation/11/reference/outsystems_language/data/data_types/available_data_types/#default-and-null-values), you may have to code around NULL/undefined in your library.

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
