# Phase 6: Integration & Observation - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

All systems work together to produce emergent behavior visible on a dashboard. The player observes character attempting activities, succeeding and failing based on personality/capacity fit. Different characters produce visibly different behavior patterns. No diagnostic labels — behavior emerges from underlying systems.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Single unified view — everything visible at once (personality, capacities, resources, skills, activities, talents)
- Keep current sidebar layout — CharacterPanel on left, main content in center, just polish and unify
- Detailed information density — expose calculations, modifier sources, detailed tooltips everywhere
- Centralized Dev Tools panel — one collapsible section for all simulation speed, personality sliders, debug info

### Emergence Testing Tools
- Both presets and randomize — 3-4 preset archetypes plus a randomize button
- 6-8 character archetypes covering Big Five extremes and combinations
- Side-by-side comparison mode — split screen showing two characters running simultaneously
- Mirror layout in comparison — both characters show identical panels side by side

### Polish & Labeling Audit
- Permissive labeling — Big Five trait names and descriptive language fine, just avoid clinical/DSM terms
- Current labeling is fine — just verify no clinical terms exist, don't actively reword
- No onboarding — this is a prototype for validation, not end users
- Consistency polish only — ensure consistent spacing, colors, typography across panels

### Game Balance
- Dual balance goal — characters feel different AND pace is engaging
- Both config file and live sliders — config file for defaults, Dev Tools sliders for experimentation
- Expose all balance parameters — drain/recovery rates, XP/progression speed, success probability factors
- Reset to defaults option — one-click reset all balance parameters

### Claude's Discretion
- Exact preset archetype definitions (as long as 6-8 exist showing contrasts)
- Specific balance parameter ranges and defaults
- How to organize the centralized Dev Tools panel
- Implementation details of comparison mode layout

</decisions>

<specifics>
## Specific Ideas

- Comparison mode should make it obvious when two different personalities produce different outcomes from the same activity
- Balance should allow characters to fail activities meaningfully — not everything should succeed
- Dev Tools panel should feel like a game dev debug menu — powerful but organized

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-integration-observation*
*Context gathered: 2026-01-22*
