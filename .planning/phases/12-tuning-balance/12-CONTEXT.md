# Phase 12: Tuning & Balance - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Runtime balance configuration and observability tools for tuning decay rates, formulas, and thresholds without code changes. Includes validation that autonomous patients survive sustainably and show personality-differentiated behavior.

This phase delivers **developer/designer tooling**, not player-facing features.

</domain>

<decisions>
## Implementation Decisions

### Calculation Trace Overlay
- Dedicated debug panel (not inline hover/click on stats)
- Expandable layers: summary by default, click to see full formula breakdown
- Manual refresh button (not real-time streaming or pause-only)
- Covers derived stats (Mood, Purpose, Nutrition) AND action resources (Overskudd, socialBattery, Focus, Willpower)
- Primary needs not traced (they're inputs, not calculated)

### Runtime Balance Config
- JSON file with hot reload (edits apply without restart)
- Everything tunable: decay rates, formula weights, AND thresholds (critical %, urgent %, etc.)
- Simple debug panel with sliders/inputs that writes to config file
- Named presets supported (save/load different configs for A/B testing)

### Validation Approach
- Background headless simulation (no rendering during test runs)
- Full telemetry captured: needs over time, decisions made, personality correlations, activity frequencies
- In-app charts for results (line graphs showing needs/stats over simulated time)
- Multiple patients run in parallel for personality comparison (introvert vs extrovert side-by-side)

### Tuning Workflow
- Primary goal: explore parameter space (systematic testing, not just fix known issues)
- Data completeness prioritized over iteration speed
- Decision log recording for post-hoc analysis (not full state replay)

### Claude's Discretion
- Batch run support (single vs multiple runs with averaging)
- Chart library choice for results visualization
- Exact debug panel UI layout and organization
- Hot reload mechanism (file watching vs manual trigger)

</decisions>

<specifics>
## Specific Ideas

- Expandable trace layers similar to browser DevTools "Computed" panel
- Presets could include "default", "fast-decay", "easy-mode" for testing different balance philosophies
- 7-day autonomous test is the key validation milestone
- Want to understand relationships between parameters, not just find one working set

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-tuning-balance*
*Context gathered: 2026-01-27*
