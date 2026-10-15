---
title: Claude Code with OutSystems Developer Cloud (ODC)
description: How to use Claude Code and the OutSystems MCP server to import Islands into OutSystems Developer Cloud
---

[OutSystems MCP](https://success.outsystems.com/documentation/outsystems_developer_cloud/agentic_development/outsystems_mcp/) connects an AI agent to your ODC tenant. The agent reads your apps, and hands edits to Mentor, the OutSystems AI, which changes the app on the server. Projects created with `create-outsystems-astro` include a [Claude Code](https://code.claude.com/docs) skill that uses it to carry out the steps in the [ODC guide](../../outsystems/odc/) for you: creating the props structure, building the block and wiring the `AstroIsland` component.

This only works for ODC. For OutSystems 11, see [Claude Code with O11](../o11/).

## Prerequisites

- [Claude Code](https://code.claude.com/docs) installed.
- An ODC tenant with OutSystems MCP enabled, and the ODC permissions to change and publish the library or app (Asset management > Change).
- The [Islands ODC Forge component](https://www.outsystems.com/forge/component-overview/22960/islands-odc) installed.
- A library or app to host your islands (see [Building a separate library](../../outsystems/odc/#building-a-separate-library)).
- A project generated with `create-outsystems-astro`. The skill lives in `.claude/skills/outsystems-odc/SKILL.md` and is referenced from `CLAUDE.md`.

## Connect Claude Code to ODC

OutSystems provides a Claude Code plugin that adds the MCP server and its own `outsystems` skill. The Islands skill builds on it.

- Add the OutSystems marketplace and install the plugin with your tenant hostname, the host of your ODC Portal URL (for example `mycompany.outsystems.dev`, without `https://`):

  ```sh
  claude plugin marketplace add OutSystems/outsystems-mcp
  claude plugin install outsystems@outsystems --config tenant_hostname=mycompany.outsystems.dev
  ```

- Run `claude mcp list`. It should show `plugin:outsystems:outsystems` with the URL `https://mycompany.outsystems.dev/mcp`. Restart Claude Code.

- Ask Claude Code something only your tenant can answer, such as "Which environments do I have in my ODC tenant?". It returns a sign-in link. Open it, sign in and approve access.

:::note
If Claude Code runs in a container or sandbox, the page your browser is sent to after sign-in fails to load. Sign-in already succeeded: copy the full URL from the address bar and paste it into Claude Code to finish.
:::

If you also use the [O11 Service Studio MCP server](../o11/), mention ODC and the app name in your requests, so Claude Code uses the right one.

## How changes are made

ODC works differently from the O11 integration:

- **Mentor makes the edits.** Claude Code sends Mentor one request per step, such as "add a `CounterProps` structure with…". Each one can take a few minutes. Claude Code checks each result before moving on, because Mentor sometimes reports a change that didn't go through.
- **Changes stay in the Mentor session until published.** A session that sits idle expires, and unpublished changes are lost, so Claude Code offers to publish between major steps.
- **Claude Code asks before publishing.** Your ODC roles apply to every request, exactly as in ODC Portal.

## Import your islands

- Set `ASSET_PATH` in `.env` to the name of your library or app, then generate the output:

  ```sh
  npm run output
  ```

- Ask Claude Code to import the output. For example:

  ```
  In ODC, import the Counter island from output/ into the CounterLib library.
  Create a Counter block with InitialCount and ShowMessage parameters.
  ```

Claude Code will:

1. Find the library and read its structures, actions and screens.
2. Read `output/` and summarise what it will create, before changing anything.
3. List the steps you need to do in ODC Studio (see [Steps in ODC Studio](#steps-in-odc-studio)), and wait for you to finish them.
4. Ask Mentor for each piece in turn, checking the result after each one:
   - The `<Block>Props` structure.
   - The block's input parameters and `Props`/`PropsSerialized` local variables.
   - Client actions and events for function handlers.
   - The `PrepareProps` client action, including `SetFunctionProps` for function handlers.
   - `OnInitialize` and `OnParametersChanged`, including the `Deploy Resource` list from `output/resources.txt`.
   - The `AstroIsland` component: `ComponentURL`, `RendererURL`, `ClientDirective`, `Props`, `Opts` and `Slots`.
   - Block CSS from any output stylesheets.
   - A design-time preview: the `AstroIsland` goes in the False branch of an `IfInBrowser` widget whose condition is `False`, and the True branch holds a static mock-up of the component.
5. Report what changed and what is left to do by hand, and offer to publish.

If Mentor can't make a change after a retry, Claude Code tells you how to do it in ODC Studio, following the [ODC guide](../../outsystems/odc/), and carries on.

### Steps in ODC Studio

The MCP server can't read files from your disk, and adding dependencies is more reliable in ODC Studio, so some steps stay manual:

- **Islands dependency**: add the Islands public elements, as in [Adding Islands dependency](../../outsystems/odc/#adding-islands-dependency).
- **Resources**: Claude Code works out which files in `output/` and `output/assets/` the island loads and lists them. In ODC Studio, open the Data tab, right-click Resources, import the listed files (images with **Add as Resource**) and set Deploy Action to **Deploy to Target Directory**. Only import the files Claude Code lists; `output/assets/` also holds the files for every other island in the project.
- **Publish** from ODC Studio, then tell Claude Code you are done. Mentor works from the latest published version, so it then sees the new elements and resources.
- **Preview images**: images shown in the design-time preview must be added as app images.

## Updating after a rebuild

Output file names include build hashes, so every `npm run output` produces new resource names. Ask Claude Code to update the block, for example:

```
I rebuilt the output. In ODC, update the Counter block in CounterLib to use the new files.
```

It lists the new resource files for you to import and the stale ones to delete, then asks Mentor to update the `ComponentURL` and `RendererURL` expressions and the `Assets` list in `OnInitialize`.

## Other things you can ask

- "In ODC, list the structures and client actions in CounterLib."
- "Compare the props in src/pages/react/counter.astro with the CounterProps structure in ODC."
- "Publish CounterLib."
- "Deploy CounterLib from Development to QA."

## Troubleshooting

- **No OutSystems tools in Claude Code**: check `claude mcp list` for `plugin:outsystems:outsystems`, then restart Claude Code.
- **`tenant_not_allowed`**: sign-in worked, but OutSystems MCP isn't enabled for your tenant, or the hostname is an O11 environment rather than your ODC tenant. Ask your administrator to enable it.
- **Mentor says it succeeded but nothing changed**: ask Claude Code to check the element again and retry with a smaller request, or make the change in ODC Studio.
- **Changes lost**: the Mentor session expired before a publish. Ask Claude Code to start again; the steps already published are kept.
- **Publish failed or timed out**: don't publish again while one is running. Ask Claude Code to check the publish status first.
- **Plugin out of date**: run `claude plugin marketplace update outsystems`, then `claude plugin update outsystems@outsystems`, and restart Claude Code.
