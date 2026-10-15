---
name: outsystems-odc
description: Import Astro Islands output into an OutSystems Developer Cloud (ODC) library or app through the OutSystems MCP server (the `outsystems` plugin, mcp__plugin_outsystems_outsystems__* tools), by delegating edits to Mentor. Use when the user asks to create or update an ODC block, structure or client action for an island, wire the output/ folder into ODC, or publish the change. Not for O11 modules.
---

# OutSystems Developer Cloud (ODC)

This skill brings the files in `output/` into an ODC library or app through the OutSystems MCP server. It automates the manual steps in the ODC guide: https://hs2323.github.io/create-outsystems-astro/guides/outsystems/odc/.

It sits on top of the `outsystems` skill that ships with the OutSystems plugin. Follow that skill for sign-in, the live tool list, Mentor sessions, polling, publishing and confirmation. This skill only adds what is specific to Islands.

Only ODC is supported. For O11, use the `outsystems-o11-service-studio` skill. When both servers are connected, say "in ODC" and name the app in your own requests so they don't reach the O11 tools.

## Prerequisites

- The OutSystems plugin is installed with the tenant set, and the OutSystems tools are available. If not, tell the user to install it (`claude plugin marketplace add OutSystems/outsystems-mcp`, then `claude plugin install outsystems@outsystems --config tenant_hostname=<tenant>`) and restart Claude Code. The tenant is the ODC Portal host, not an O11 environment.
- The target library or app exists and the user can change it. Creating one is a tenant-state change: confirm first.
- The Islands ODC Forge component is installed (https://www.outsystems.com/forge/component-overview/22960/islands-odc).
- `.env` has `ASSET_PATH` set to the library or app name, and `PM run output` has been run so `output/` is current. Re-run it if the components changed since the last build.

## How this differs from O11

- Edits are plain-language prompts to Mentor, not code. Mentor edits the app on the server, one turn at a time, and a turn can take a few minutes.
- The server can't read local files and has no resource upload. Everything Mentor needs from `output/` (expressions, JavaScript, CSS, `opts`, slots) goes into the prompt text.
- A turn that ends `succeeded` only means it finished. Read its completion signals (change applied, validation error count) before moving on, and check the result with the context lookups. Mentor sometimes reports a change that wasn't applied, and UI edits fail more often than logic or data.
- Unpublished edits live only in the Mentor session and are lost when it expires. Publish (a Mentor turn, after confirmation) between major steps.
- The context lookups lag behind a fresh publish and may return nothing for a new app. Empty results don't prove an element is missing.

## Manual steps in ODC Studio

These can't be done reliably through the MCP server. List them for the user, wait for them to confirm, then start or reload the Mentor session so it picks up the latest published revision.

- **Public elements**: add the Islands elements from the ODC guide's "Adding Islands dependency" section: the `Astro` flow, the `AstroIsland` block and the `CreateFunctionProp` client action, plus the Deploy Resource action used in `OnInitialize`. Mentor can sometimes add public elements itself, but adding them in ODC Studio is the reliable path.
- **Resources**: every `.js` file in `output/` and every file in `output/assets/` the island needs, imported from the Data tab (Resources > Import Resource, images as **Add as Resource**), with Deploy Action = Deploy to Target Directory.
  - Work out which files the island needs: start from its `component-url` and `renderer-url` files and follow their relative imports (`./name.hash.js`). Don't import the whole folder; most of it belongs to other islands.
  - Build hashes change on every build, so compare file names with what the app has and tell the user which stale resources to delete rather than adding duplicates.
- **Publish** from ODC Studio after these steps, so a new Mentor session sees them. Reloading a session discards its unpublished edits, so only reload when the session has none or the user agrees.

## Mapping the output to Mentor prompts

Send one focused prompt per piece, in this order, and check each before the next. Give Mentor exact names and values; don't leave them for it to infer.

1. **Props structure**: a structure `<Block>Props` with one attribute per prop and its type. Function handler props are Text attributes holding the generated function name.
2. **Block**: in a UI flow, Public = Yes when it is consumed by other apps. Input parameters per prop, and local variables `Props` (type `<Block>Props`) and `PropsSerialized` (Text).
3. **Handlers**: for each function prop, a client action and an event with matching parameters, the action triggering the event.
4. **PrepareProps client action**: for each function handler, a JavaScript node `SetFunctionProps` with an output parameter `<Handler>Name` (Text) and this code (one block per handler):

   ```js
   const ShowMessageName = $actions.CreateFunctionProp("ShowMessage").UpdatedFunctionName;
   window[ShowMessageName] = $actions.ShowMessage;
   $parameters.ShowMessageName = ShowMessageName;
   ```

   Then an Assign of the inputs (and function names) into `Props`, a JSON Serialize of `Props`, and an Assign of the result to `PropsSerialized`. Ask the user whether Serialize Default Values should be on; the guide explains the trade-off.
5. **OnInitialize / OnParametersChanged**: both call `PrepareProps`. `OnInitialize` also has a Text local `Assets`, assigned the full contents of `output/resources.txt` as an expression, then passed to Deploy Resource. Paste the file contents verbatim into the prompt. Replace that expression after every rebuild, because the names include build hashes.
6. **AstroIsland instance**, from the `<astro-island>` tag in `output/<page>.html`:
   - `ComponentURL`: `Resources.<resource matching component-url>.URL`
   - `RendererURL`: `Resources.<resource matching renderer-url>.URL`
   - `ClientDirective`: the `client` attribute value (`"only"` or `"load"`), except Preact, which is built with `client:only` but must use `"load"` here
   - `Props`: `PropsSerialized`
   - `Opts`: the `opts` attribute value, as a Text literal
   - `Slots`: the quoted text between the tags when there is slot content. Warn the user to sanitize any user input that reaches a slot.
   - Ignore `uid`, `component-export`, `ssr`, `client` and `await-children`; the Islands library supplies them.
7. **CSS**: contents of any `.css` file in `output/assets/` go in the block's Stylesheet.
8. **Design-time preview**: an island renders nothing in ODC Studio, so ask for an If widget named `IfInBrowser` as the block's top-level widget, Condition `False`, with the `AstroIsland` in the False branch and a static mock-up of the component's initial state in the True branch, mirroring its markup and class names. Images shown in the preview must be app images, not resources; the user imports them by hand. Ask before skipping the preview. This is UI work, so expect to check and retry it.

If a step fails twice, stop retrying it: tell the user what to do by hand in ODC Studio, following the guide, and carry on with the next step.

## Working order

1. Confirm the tenant connection (environments or app list), the target app and its asset key. Look up its structures, actions and screens.
2. Read `output/` and work out the island's files, props, handlers, `opts`, slots and CSS.
3. Summarise what will be created or changed, and list the manual steps (public elements, resource files, a publish from ODC Studio). Wait for the user to confirm they are done.
4. Open one Mentor session on the app and send the prompts above in order, checking each turn's completion signals. Offer to publish after the structure and block parameters, and again at the end. Every publish needs the user's confirmation.
5. Report what changed, any steps left to do by hand, and the revision that was published. Release the session once its work is published.
