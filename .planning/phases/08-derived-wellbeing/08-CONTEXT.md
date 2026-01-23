# Phase 8: Derived Wellbeing - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Mood and Purpose emerge as computed stats from primary needs and activity-personality alignment, affecting patient capability. Nutrition exists as a slow-moving health stat. This phase does NOT include action resources (Overskudd, socialBattery, Focus, Willpower) — those are Phase 9.

</domain>

<decisions>
## Implementation Decisions

### Mood computation
- Curve-based contribution from needs (inspired by GMTK Sims analysis)
- Low needs affect Mood dramatically, high needs contribute little (diminishing returns)
- Going from 20→40 on a need increases Mood significantly, going from 80→100 barely registers
- Physiological needs have steeper curves (more sensitive to drops)
- Asymptotic behavior at extremes — Mood approaches 0 and 100 slowly, preventing death spirals
- Smoothed/lagged response — Mood trends toward computed value over time, feels emotional not mechanical

### Purpose computation
- Personality-based equilibrium (baseline around 50%, modified by traits like Conscientiousness/Openness)
- Meaningful activities boost Purpose above baseline with smooth/lag
- Without meaningful activities, Purpose naturally decays back toward equilibrium
- "Meaningful" = activity aligns with personality traits AND builds skills (both combined)
- Low Purpose has dual effect: reduces Overskudd AND affects AI activity selection (motivation)

### Nutrition mechanics
- Simple food quality tiers: Bad/OK/Good/Great
- Very slow changes — represents long-term diet, changes over in-game days
- Low Nutrition affects both Energy regeneration AND drags down Mood baseline
- Bad diet pushes Nutrition toward a floor (chronic poor diet = chronic effects)

### Visual feedback
- Mood, Purpose, Nutrition displayed in same NeedsPanel as primary needs
- Clear visual grouping/separator between Primary Needs and Derived Stats sections
- Mood shown as icon/emoji indicator (face that changes with level) rather than bar
- Hover tooltip shows breakdown of what's affecting Mood/Purpose ("Hunger: -15, Energy: -10")

### Claude's Discretion
- Exact curve formulas for need-to-Mood contribution
- Specific lag/smoothing constants for Mood and Purpose
- Personality trait modifiers for Purpose equilibrium
- Mood emoji/icon design choices
- Tooltip formatting and breakdown presentation

</decisions>

<specifics>
## Specific Ideas

- "Use curves like explained in the GMTK article where needs affect moods based on current value"
- Same asymptotic approach as need decay — goes slower as approaching extremes
- Purpose should "try to reach some equilibrium and meaningful activities increase it, then it takes a while to go back"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-derived-wellbeing*
*Context gathered: 2026-01-23*
