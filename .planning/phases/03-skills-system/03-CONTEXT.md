# Phase 3: Skills System - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Skills exist in a dependency graph where prerequisites gate unlocking. Skills have 5 levels, belong to domains (social, organisational, analytical, etc.), and are unlocked by spending domain XP earned from activities. This phase builds the skill entity, DAG structure, and visualization — activity integration is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### XP & Domain Model
- XP is domain-based, not skill-specific (Social XP, Analytical XP, etc.)
- Activities earn domain XP (Phase 4), spent here to unlock skill levels
- XP is currency: spending 50 XP to unlock leaves you with 50 less
- No XP decay — progress is permanent

### Skill Levels
- Skills have 5 levels (not just locked/unlocked states)
- Each level costs domain XP to unlock
- Escalating costs: higher levels cost more XP than lower levels
- Manual unlock: player clicks to spend XP (not automatic)

### Dependency Structure
- Complex DAG: skills can have multiple prerequisites (need both X and Y for Z)
- Shallow depth: 1-2 levels of prerequisites maximum
- When skill becomes unlockable (prerequisites met): visual change only, no notification
- "Why locked" shows progress toward each prerequisite with status indicators

### Visual Layout
- Tabs per domain: click domain tab to see skills in that domain
- No connection lines between skills (DAG too complex for clean lines)
- Prerequisites listed inline on each skill card
- Skill levels shown as number badge ("Lv.3")
- States: combination of opacity/grayscale + icons (locked faded with lock icon, etc.)

### Claude's Discretion
- Specific skill content (what 5-8 skills, names, descriptions)
- Which domains exist and how skills are categorized
- Whether skills have capacity requirements beyond other skills
- Exact escalating cost curve (50→100→200 or similar)
- Exact visual styling for state combinations

</decisions>

<specifics>
## Specific Ideas

- "Show progress toward each" when explaining why a skill is locked — e.g., "Conversation ✅, Active Listening 40% → need 100%"
- Horizontal reading direction preference (left-to-right flow) even though using tabs

</specifics>

<deferred>
## Deferred Ideas

- Activity mastery system (separate from skill levels) — Phase 4
- How activities generate domain XP — Phase 4

</deferred>

---

*Phase: 03-skills-system*
*Context gathered: 2026-01-21*
