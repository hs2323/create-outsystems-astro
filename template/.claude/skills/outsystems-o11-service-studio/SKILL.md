---
name: outsystems-o11-service-studio
description: Import Astro Islands output into an OutSystems 11 (O11) Reactive module through the Service Studio MCP server (mcp__servicestudio__* tools). Use when the user asks to inspect, create or update an O11 block, resource, structure or client action for an island, wire the output/ folder into Service Studio, or publish the module. Not for ODC or O11 Traditional modules.
---

# OutSystems 11 Service Studio

This skill drives Service Studio through its MCP server (`servicestudio`) to bring the files in `output/` into an O11 Reactive module. It automates the manual steps in the O11 guide: https://hs2323.github.io/create-outsystems-astro/guides/outsystems/o11/.

Only O11 Reactive modules are supported. If the target module is Traditional (the `*Traditional` tools are the only ones returning results), stop and tell the user.

## Prerequisites

- Service Studio is running with the target module open, and its MCP server is connected (the `mcp__servicestudio__*` tools are available). If the tools are missing, ask the user to enable the MCP server in Service Studio and add it to Claude Code.
- The module references `AstroIsland_Lib` from the Islands O11 Forge component (https://www.outsystems.com/forge/component-overview/22857/islands-o11). Check with `listApps`: it lists the open module and its references.
- `.env` has `ASSET_PATH` set to the module name, and `PM run output` has been run so `output/` is current. Re-run it if the components changed since the last build.

## Session token

1. Call `createSessionToken` once, at the start, with `clientName: "Claude Code"`. The user approves it in Service Studio.
2. Pass the returned token as `sessionToken` on every other call. Reuse it after reconnects; never request a second one in the same session.

## Reading the module

Always read before writing. Pass `eSpaceName` from a `name` returned by `listApps`.

| Need | Tools |
| --- | --- |
| Modules loaded | `listApps` |
| Blocks | `getWebBlockNames`, `getWebBlock` |
| Resources (JS, images, CSS imported as resources) | `getResourceNames`, `getResource` |
| Props structures | `getStructures` |
| Client actions (`PrepareProps`, `OnInitialize`, handlers) | `getActionNames`, `getClientAction` |
| Events of a block | `getEvents`, `getEventHandlers` |
| Images | `getImageNames`, `getImage` |
| Themes / block CSS | `getThemeNames`, `getTheme` |
| Errors and warnings | `getValidationMessages` |

The `get*` tools take `includeJson`: `"Never"` returns Model API C# that recreates the object, `"Always"` returns JSON. Use `"Never"` when you are about to write, so you can copy the exact Model API shape, type names and imports from an existing object (for example an existing block that already uses the `AstroIsland` block) instead of guessing them.

## Writing to the module

Changes go through a three-step chain:

1. `applyModelApiCode` with `code` as a full lambda `eSpace => { ... }` (no `eSpace.Save`, the host adds it), the `imports` it needs and `eSpaceName`. It returns `mutatedOmlPath`. Keep each call small and focused; several calls chain on the same in-flight OML.
2. `omlMerge` with that `mutatedOmlPath`. The user may see a Compare-and-Merge dialog. If `merged` is false, nothing was applied: read the conflicts, fix the code and try again.
3. `getValidationMessages` with `filter: ["error", "warning"]` and fix anything you introduced.

If a chain goes wrong, `omlReset` discards it so the next call starts from the live module.

`omlPublish` performs a 1-Click Publish. Only publish when the user asks for it. It returns `blocked` until the user grants write permission in the MCP Server dialog; tell them so rather than retrying.

## Mapping the output to the module

Follow the O11 guide for each block. The pieces, and where they come from in `output/`:

- **Resources**: every `.js` file in `output/` and every file in `output/assets/` is a module resource with Public = Yes and Deploy Action = Deploy to Target Directory. Images are added as resources, not images. The build hashes change on every build, so compare file names against `getResourceNames` and replace stale ones rather than adding duplicates. If the Model API cannot upload a file's content, list the files for the user to import from the Data tab and continue once they confirm.
- **Props structure**: in the Data tab, a structure named `<Block>Props` with one attribute per prop. Function handler props are Text attributes holding the generated function name.
- **Block**: in a UI Flow, Public = Yes when consumed by other modules. Input parameters per prop, and local variables `Props` (the props structure) and `PropsSerialized` (Text).
- **PrepareProps client action**: for each function handler, a JavaScript node `SetFunctionProps` that binds the handler to `window` and outputs its name:

  ```js
  const ShowMessageName = $actions.CreateFunctionProp("ShowMessage").UpdatedFunctionName;
  window[ShowMessageName] = $actions.ShowMessage;
  $parameters.ShowMessageName = ShowMessageName;
  ```

  Then an Assign of inputs (and function names) into `Props`, a JSON Serialize of `Props`, and an Assign of the result to `PropsSerialized`. Ask the user whether Serialize Default Values should be on; the guide explains the trade-off.
- **OnInitialize / OnParametersChanged**: both call `PrepareProps`. `OnInitialize` also assigns a Text local `Assets` the contents of `output/resources.txt` and passes it to `AstroIsland_Lib`'s `Deploy Resource` action. Replace that expression after every rebuild, because the names include build hashes.
- **AstroIsland block instance**, from the `<astro-island>` tag in `output/<page>.html`:
  - `ComponentURL`: `Resources.<resource matching component-url>.URL`
  - `RendererURL`: `Resources.<resource matching renderer-url>.URL`
  - `ClientDirective`: the `client` attribute value (`"only"` or `"load"`), except Preact, which is built with `client:only` but must use `"load"` here
  - `Props`: `PropsSerialized`
  - `Opts`: the `opts` attribute value, as a Text literal
  - `Slots`: the quoted text between the tags when there is slot content. Warn the user to sanitize any user input that reaches a slot.
  - Ignore `uid`, `component-export`, `ssr`, `client` and `await-children`; the Islands module supplies them.
- **CSS**: contents of any `.css` file in `output/assets/` go in the block's Stylesheet.

## Working order

1. Token, `listApps`, confirm the target module and that `AstroIsland_Lib` is referenced (`omlRefreshReferences` if the user updated the Forge component).
2. Read `output/` and the current state of the block, structure, actions and resources.
3. Summarise to the user what will be created or changed before writing.
4. Apply in small steps: resources, structure, block parameters and locals, `PrepareProps`, lifecycle handlers, the `AstroIsland` instance, CSS. Merge and check validation after each step.
5. Report what changed, any manual steps left, and offer to publish.
