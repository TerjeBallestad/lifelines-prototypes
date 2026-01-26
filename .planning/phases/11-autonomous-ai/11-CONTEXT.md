# Phase 11: Autonomous AI - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Patient autonomously selects activities based on utility scoring of need urgency, personality fit, and resource availability. Player can override at any time. This phase does NOT include balance tuning (Phase 12).

</domain>

<decisions>
## Implementation Decisions

### Decision visibility
- Show top reason when patient picks activity ("Eating because hungry")
- Full breakdown available on demand in a dedicated AI decision log panel
- Panel shows last 5 decisions with scoring details

### Selection behavior
- Mostly pick best-scoring activity, with ~25% chance to pick #2 or #3 instead
- Personality affects variety: high Openness = more variety, high Conscientiousness = more optimal
- Score gap limit: never pick activity that scores <50% of best option

### Override triggers
- Critical needs that trigger override: Hunger, Bladder, Energy (below 15%)
- Same 15% threshold for all three
- In override mode, pure urgency — personality has no influence
- No special "survival mode" indicator needed — top reason already explains it

### Mode switching (Sims-style)
- Free Will toggle per patient (not global)
- Free Will ON: AI fills idle time, player commands always take priority and override
- Free Will OFF: Patient only does what player assigns
- Toggle located near activity queue area
- Default: Free Will ON for new patients

### Claude's Discretion
- Exact utility scoring formula weights
- Behavior when switching modes mid-activity (finish current vs interrupt)
- Behavior when enabling Free Will (immediate pick vs wait for idle)
- AI decision log panel layout and styling

</decisions>

<specifics>
## Specific Ideas

- "Should work like The Sims" — AI fills idle time, player can command anytime, commands override autonomous picks
- Free Will is the toggle that enables/disables autonomous behavior per patient

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-autonomous-ai*
*Context gathered: 2026-01-26*
