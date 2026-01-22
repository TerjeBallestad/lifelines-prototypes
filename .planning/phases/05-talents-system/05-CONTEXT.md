# Phase 5: Talents System - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Roguelike talent selection system where players pick 1 of 3 offered talents that permanently modify the character's capabilities. Talents create interesting modifier effects — some chaotic, some overpowered — that compound emergently. This phase covers talent entity, store, selection UI, and integration with existing systems.

</domain>

<decisions>
## Implementation Decisions

### Selection Trigger
- Domain XP threshold triggers talent picks (earning 500 total domain XP = 1 pick)
- Future: Will connect to quest/milestone system; for prototype, XP threshold simulates this
- Immediate modal when pick earned — must choose to continue
- Can queue up to 3 pending picks — modal shows count if multiple available

### Modifier Design
- All modifier types allowed: flat bonuses, percentage multipliers, and conditional effects
- Prefer fun, interesting effects over simple stat boosts
- Some talents can be intentionally overpowered — creates chaos and excitement
- ~30% of talents have tradeoffs (upside AND downside)
- Emergent combos — talents don't explicitly reference each other but effects can compound
- Once selected, talents are permanent (roguelike commitment)

### Talent Presentation
- Vertical list layout in modal — stacked cards with detail per talent
- Rarity tiers that affect power (common, rare, epic) — excitement when rare appears
- Card shows: name, description, affected stats (which capacities/resources change)
- 9-12 talents total in pool per requirements

### Effect Visibility
- Dedicated talents panel showing all selected talents
- Explicit breakdown on affected stats — hover/tooltip shows "base: 50, +10 from [Talent Name]"
- Occasional toasts for significant talent events (rare procs, major effects)

### Claude's Discretion
- Whether to enforce domain spread in 3-talent offers
- Visual active/inactive state for conditional talents
- Exact XP threshold number (500 suggested, can tune)
- Rarity distribution in the talent pool
- Specific talent designs within the guidelines

</decisions>

<specifics>
## Specific Ideas

- "Talents should feel fun and semi-random"
- "Some talents should create a little chaos"
- "Some talents could be overpowered" — not everything needs to be balanced
- Future connection to quest/milestone system for more varied triggers

</specifics>

<deferred>
## Deferred Ideas

- Quest/milestone system for talent triggers — future phase
- Talent respec/reset mechanism — explicitly decided against for roguelike feel

</deferred>

---

*Phase: 05-talents-system*
*Context gathered: 2026-01-22*
