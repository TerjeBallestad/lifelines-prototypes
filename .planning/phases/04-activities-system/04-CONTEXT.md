# Phase 4: Activities System - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Activities that consume time and resources, train skills via domain XP, and succeed/fail based on character fit. Player assigns activities to a queue; character attempts them based on current state.

</domain>

<decisions>
## Implementation Decisions

### Assignment flow
- Activities organized by skill domain (tabs matching existing domain structure)
- Queue system — stack multiple activities that run in sequence
- Visual queue with controls: player can see upcoming activities, reorder, and cancel
- Duration modes vary by activity type:
  - **Fixed duration** — e.g., eating (until food finished)
  - **Threshold-based** — e.g., sleeping (until rested), pooping (until done)
  - **Variable by character** — affected by skills, personality, talents

### Success/failure mechanics
- **Start check** — Character must have enough willpower/overskudd to begin
- **If start check fails** — Activity skipped (not removed from queue), character refuses
- **During execution** — Resources drain per-tick
- **Early failure** — If key resources deplete during activity, character fails early
- **Quality scaling** — XP gains and outcomes affected by character's current state/personality

### Failure feedback
- Toast notifications for refusals and early failures
- Narrative wording, not numbers ("Alex doesn't have the energy to start this")

### Resource costs
- Resources drain per-tick during activity (matches existing SimulationStore tick)
- Personality affects drain rate: global baseline modifiers + activity-specific adjustments (both stack)
- Some activities RESTORE resources (sleeping restores energy, socializing restores social battery)
- Preview panel shows expected drain/gain before player assigns activity

### XP & progression
- Two separate progression systems:
  - **Activity Mastery (1-10)** — Passive, increases through repetition of that activity
  - **Domain XP** — Each activity belongs to a domain, awards domain-specific XP
- XP awarded per-tick during activity execution
- Character state affects XP gain rate (high focus = more XP, high stress = less)
- **Diminishing returns** — Higher activity mastery = better efficiency BUT less XP (encourages variety)
- Live XP counter visible during activity

### Claude's Discretion
- Exact mastery XP formula and level thresholds
- How mastery affects efficiency (drain reduction %, speed bonus %)
- Toast notification styling and duration
- Specific resource threshold values for starting activities

</decisions>

<specifics>
## Specific Ideas

- Queue feels like a to-do list — player plans character's day
- Threshold-based activities (sleep, bathroom) feel organic — character does them "until done" rather than for fixed time
- Diminishing XP returns on mastered activities encourages trying new things, not grinding

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-activities-system*
*Context gathered: 2026-01-21*
