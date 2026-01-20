# Phase 1: Foundation - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffolding and core architecture. React app runs with MobX architecture that mirrors Unreal patterns. Includes root store with React Context integration and a basic Character entity with observable properties that trigger React re-renders.

</domain>

<decisions>
## Implementation Decisions

### Character entity shape
- Class-based entity with `makeAutoObservable` — methods live on the entity, closer to Unreal Actor pattern
- Include placeholder slots for personality, capacities, resources with default values (not nullable)
- Default values via factory functions like `defaultPersonality()` — always has data, even if placeholder
- Include basic computed property (like `displayName` or `isValid`) to prove the MobX pattern works

### UI scaffolding
- Dark mode only — single dark theme, faster to build
- Blank canvas layout — no sidebar/header shell, layout emerges as features are built
- Just base styles from DaisyUI — add components as needed in later phases
- Minimal visible proof — simple card showing character name + one property to prove reactivity works visually

### Dev tooling
- MobX devtools integration from the start — useful for debugging store state
- TypeScript strict mode — `strict: true`, `noImplicitAny`, etc.
- No testing infrastructure yet — skip tests for prototype
- ESLint + Prettier — standard setup with auto-formatting

### Claude's Discretion
- Exact MobX devtools package choice
- Store hierarchy structure
- Hot reload boundary configuration
- Placeholder property names for personality/capacities/resources slots

</decisions>

<specifics>
## Specific Ideas

- Character should feel like an Unreal Actor — class-based with methods, not just a data bag
- The minimal proof-of-concept card validates the full chain: store → observable → React re-render

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-20*
