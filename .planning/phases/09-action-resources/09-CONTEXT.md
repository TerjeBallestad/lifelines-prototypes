# Phase 9: Action Resources - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Overskudd, socialBattery, Focus, and Willpower are computed from needs and personality, gating which activities are affordable. This phase implements the resource computation and display — activity costs and consumption are Phase 10.

</domain>

<decisions>
## Implementation Decisions

### socialBattery Dynamics
- 3-level social context taxonomy: Solo (alone), Social (with others), Intense (deep connection)
- Inverse drain/charge based on Extraversion personality:
  - Introverts drain during social activities, charge when solo
  - Extroverts drain when solo, charge during social activities
- Soft block at zero: social activities become very expensive (high Willpower cost) but remain possible
- Neutral zone for ambiverts (Extraversion 40-60): slow drain in both contexts, slow charge in both — flexible but no strong preferences

### Overskudd Formula
- Primary inputs: Mood + Energy + Purpose (the three wellbeing indicators)
- Willpower affects Overskudd regeneration rate, not the value directly — depleted Willpower means slower recovery
- No floor: zero Overskudd is valid since only difficult activities require it — patient can still rest, watch TV, do passive activities
- Equilibrium pull regeneration: constantly pulls toward target value computed from Mood+Energy+Purpose, fast when far from target, slow when close

### Focus Behavior
- Depleted by concentration activities only (reading, studying, complex tasks)
- Mindless/passive activities don't affect Focus
- Regenerates via rest activities + some passive regeneration over time

### Willpower Behavior
- Depleted by difficult/unpleasant tasks AND decision-making in general
- Activities that fight personality or require significant effort drain Willpower
- Regenerates via rest + enjoyment (Fun activities rebuild willpower, not just sleep)

### UI Display
- Activities always selectable and can be queued — fail at execution time with toast showing reason (e.g., "Needs 30 Overskudd, you have 15")
- Action Resources displayed in separate section from Primary Needs — clear visual separation between what you NEED vs what you CAN DO
- Single color per resource type (not threshold-based color changes like needs)
- Tooltip breakdown on hover showing inputs: "Overskudd: Mood (72) + Energy (45) + Purpose (60) = 59"

### Claude's Discretion
- Exact formula weights for Overskudd computation
- Equilibrium pull speed constants
- Specific colors for each action resource
- Toast styling and duration

</decisions>

<specifics>
## Specific Ideas

- "Zero Overskudd is ok — this just means the character should rest, or they can watch TV"
- Activity failure happens at execution time, not selection time — lets players plan ahead even if resources aren't currently sufficient

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-action-resources*
*Context gathered: 2026-01-23*
