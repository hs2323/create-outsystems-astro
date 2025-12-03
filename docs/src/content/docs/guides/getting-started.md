---
title: Getting Started
description: How to get started with OutSystems Astro Islands
---

Generates [Astro Islands](https://docs.astro.build/en/concepts/islands/) for use in OutSystems that can create self contained interactive code elements from different frameworks. It allows an extension of the front-end with these dynamic libraries.

## When to use this library
- Custom interactive elements that would not be difficult/not possible to build directly in OutSystems.
- Wrappers around interactive elements built in other front-end frameworks.
- Direct migration of traditional code.

## When NOT to use this library
- You will most likely not need to use this library for most of the front-end development. This is similar in use to the custom code development in for the back-end in [O11](https://success.outsystems.com/documentation/11/integration_with_external_systems/extend_logic_with_your_own_code/) and [ODC](https://success.outsystems.com/documentation/outsystems_developer_cloud/building_apps/extend_your_apps_with_custom_code/).
- If the functionality is easily buidable in Service Studio.
- Loading performance of component must be instant. The Astro Island will load after the page/screen has loaded since the initializer and tag will be loaded after.

