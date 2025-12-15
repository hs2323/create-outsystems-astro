---
title: Getting Started
description: How to get started with OutSystems Astro Islands
slug: 0.1/guides/getting-started
---

Generates [Astro Islands](https://docs.astro.build/en/concepts/islands/) for use in OutSystems that can create self contained interactive code elements from different frameworks. It allows an extension of the front-end with these dynamic libraries.

## When to use this library

* Custom interactive elements that would not be difficult/not possible to build directly in OutSystems.
* Wrappers around interactive elements built in other front-end frameworks.
* Direct migration of traditional code.

## When NOT to use this library

* You will most likely not need to use this library for most of the front-end development. This is similar in use to the custom code development in for the back-end in [O11](https://success.outsystems.com/documentation/11/integration_with_external_systems/extend_logic_with_your_own_code/) and [ODC](https://success.outsystems.com/documentation/outsystems_developer_cloud/building_apps/extend_your_apps_with_custom_code/).
* If the functionality is easily buildable in Service Studio.
* Loading performance of component must be instant. The Astro Island will load after the page/screen has loaded since the initializer and tag will be loaded after.

## Developing

### Astro

Initialize the project:

```bash
npx create-outsystems-astro
```

Create your application inside of Astro. Its recommeneded to keep one component/set of functionality to a single project. Learn more about Astro development in the [Astro docs](https://docs.astro.build/en/getting-started/). Once you have completed development, you can generate the output.

Read the [OutSystems Astro docs](../astro/).

The following frameworks are currently compatible with the OutSystems Astro Islands library:

* [React](https://docs.astro.build/en/guides/integrations-guide/react/)

### OutSystems

Once your output for Astro is generated, you can begin the creation and migration of the component to OutSystems. Currently supported platform versions

* [011](../outsystems/o11)
* [ODC](../outsystems/odc) - Coming Soon!
