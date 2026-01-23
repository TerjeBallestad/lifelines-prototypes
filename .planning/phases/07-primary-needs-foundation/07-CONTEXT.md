# Phase 7: Primary Needs Foundation - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Seven primary needs (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) with differential decay rates and visual feedback. This phase establishes the foundation for all derived stats in later phases. Activities restoring needs and derived wellbeing (Mood, Purpose) are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Decay behavior
- Linear decay: constant rate regardless of current level (Hunger loses X points/hour at 80% same as at 30%)
- Personality modifies base decay rates: high Extraversion = faster Social decay, high Neuroticism = faster Security decay
- Sleep continues physiological decay: Bladder and Hunger still decay during sleep, other needs pause
- 3-4x rate spread between physiological and social needs: Hunger/Bladder/Energy become critical in hours, Social/Fun take a day+

### Need relationships
- Independent decay: each need decays on its own, no cascading effects at the needs layer
- Decay slows asymptotically approaching zero (never quite hitting bottom)
- Critical failure thresholds defined but events deferred: Bladder accident at ~5%, Hunger death at 0%, Energy collapse - trigger points marked now, actual event implementations in later phases

### v1.0 toggle integration
- Global toggle: one switch affects all patients (either old or new system for everyone)
- Toggle lives in top bar/header: visible in main navigation, not hidden
- Shared activities: same activities work for both systems, v1.1 adds need effects on top

### Visual presentation
- Two groups in UI: Physiological (Hunger, Energy, Hygiene, Bladder) separate from Social (Social, Fun, Security)
- Color gradient for urgency: green → yellow → orange → red as need depletes
- Bars + hover details: visual bars normally, hover reveals percentage and decay rate

### Claude's Discretion
- Cross-warnings between needs (if any add value)
- Save data migration approach (initialize fresh vs infer from v1.0)
- Visual bar style (thick Sims-style vs slim modern)
- Exact spacing, typography, and layout details

</decisions>

<specifics>
## Specific Ideas

- Critical failures have real consequences: critically low Bladder = patient pees themselves, critical Hunger = death
- The asymptotic slowdown near zero prevents instant death spirals while still allowing critical state to be dangerous
- Personality influence on decay creates natural variation between patients without affecting activity preferences

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-primary-needs-foundation*
*Context gathered: 2026-01-23*
