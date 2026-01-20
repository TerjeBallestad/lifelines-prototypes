# Phase 2: Character Core - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the psychological foundation — Big Five personality, mental capacities, and resources — with personality affecting how resources drain/recover. Character displays these systems visually. Creating activities or interactions are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Visual Representation
- Personality: Radar/pentagon chart for Big Five
- Labels: Full psychology terms (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
- Capacities: Combined view with personality (unified visualization showing both)
- Resources: Circular gauges for all 9 resources
- All 9 resource gauges shown as flat list (no grouping) — visible in prototype, not in final game

### Resource Types (9 total)
- Energy
- Social Battery
- Stress
- Overskudd (surplus/capacity/headroom)
- Mood
- Motivation
- Security
- Focus/Attention
- Nutrition/Health

### Personality Effects
- Modifier strength: Subtle (±10-20%) — noticeable over time, not dramatic
- All five Big Five dimensions affect at least one resource
- Affects both drain AND recovery rates
- Multiple modifiers combine additively (+10% from E, +5% from N = +15%)
- Feedback: Show modifiers explicitly ("+15% drain (low extraversion)")
- Detail levels: Simple label visible, hover/click reveals exact math
- Personality adjustable via dev sliders for testing emergence

### Claude's Discretion
- Whether to use linear scaling or extremes-matter-more curve for trait effects
- Whether/how resources affect each other (e.g., high stress → faster energy drain)

### Resource Behavior
- Timing: Hybrid — base decay is real-time, activities cause discrete changes
- Boundaries: Consequences at extremes (exhaustion at 0 energy, etc.)
- Speed: Configurable via speed slider in debug UI
- Recovery: Affected by personality (same as drain)

### Claude's Discretion
- Exact consequence effects at resource boundaries
- Resource interaction rules (if any)

### Information Hierarchy
- Resources most prominent — they're the "health bars"
- Character panel as persistent sidebar (always visible)
- Density: Minimal at a glance, details on hover/click (expand pattern)
- Active personality modifiers shown on demand (when interacting with a resource)

</decisions>

<specifics>
## Specific Ideas

- Resources should be visible in the prototype for observation, but hidden from players in the final game (emergence without explicit meters)
- "Overskudd" is Norwegian — represents mental/emotional surplus/capacity/headroom
- Combined visualization for personality + capacities keeps the conceptual link visible

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-character-core*
*Context gathered: 2026-01-20*
