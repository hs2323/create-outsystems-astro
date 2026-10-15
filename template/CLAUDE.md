# CLAUDE.md

## Relationship to AGENTS.md

This document extends and specializes the general agent behaviors defined in [AGENTS.md](./AGENTS.md).

**Precedence Rule**: When there are conflicts or overlapping guidance between these documents, **CLAUDE.md takes precedence** for all interactions with Claude models. AGENTS.md provides the foundational agent patterns, while this document contains Claude-specific overrides and optimizations.

## Skills

- `outsystems-o11-service-studio` (`.claude/skills/outsystems-o11-service-studio/SKILL.md`): use it to import the `output/` folder into an OutSystems 11 Reactive module through the Service Studio MCP server (`mcp__servicestudio__*` tools), or to inspect, update or publish that module.
- `outsystems-odc` (`.claude/skills/outsystems-odc/SKILL.md`): use it to import the `output/` folder into an OutSystems Developer Cloud (ODC) library or app through the OutSystems MCP server (the `outsystems` plugin), by delegating the edits to Mentor, or to publish the change.
