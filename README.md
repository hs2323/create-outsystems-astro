# OutSystems Astro Islands
Generates [Astro Islands](https://docs.astro.build/en/concepts/islands/) for use in OutSystems that can create self contained interactive code elements from different frameworks. It allows an extension of the front-end with these dynamic libraries.

## When to use this library
- Custom interactive elements that would not be difficult/not possible to build directly in OutSystems.
- Wrappers around interactive elements built in other front-end frameworks.
- Direct migration of traditional code.

## When NOT to use this library
- You will most likely not need to use this library for most of the front-end development. This is similar in use to the custom code development in for the back-end in [O11](https://success.outsystems.com/documentation/11/integration_with_external_systems/extend_logic_with_your_own_code/) and [ODC](https://success.outsystems.com/documentation/outsystems_developer_cloud/building_apps/extend_your_apps_with_custom_code/).
- If the functionality is easily buidable in Service Studio.
- Loading performance of component must be instant. The Astro Island will load after the page/screen has loaded since the initializer and tag will be loaded after.

## Current supported frameworks
- [React](https://docs.astro.build/en/guides/integrations-guide/react/)
- [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/)

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


## Getting Started
Delete the demo application under the ```src``` flder and choose your framework(s) to build the components in.

## Converting to OutSystems

Once development is complete, run:
```bash
npm run output
```

This will create a set of files that will then need to be coverted to OutSystems components.
