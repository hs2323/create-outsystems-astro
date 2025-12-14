---
title: Astro setup
description: Setup Astro JavaScript project
slug: 0.1/guides/astro
---

# Astro setup

## Current supported frameworks

* [React](https://docs.astro.build/en/guides/integrations-guide/react/).

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

## Converting to OutSystems

* Copy the environment template file to `.env`.
  ```bash
  cp .env.template .env
  ```

* Update the `.env` file and modify the `ASSET_PATH` value to be the application/library/core widget module name in OutSystems.

* Once development is complete, run:
  ```bash
  npm run output
  ```

This will create a set of files that will then need to be coverted to OutSystems components.
