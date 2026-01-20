# Project Research Summary

**Project:** Lifelines Prototypes - React Game Prototypes (Skill Trees, Character Systems)
**Domain:** Arcade life-sim with skill tree, traits, and roguelike talents for rehabilitation theme
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

This project is a React prototype for a life-sim game featuring Piaget-inspired skill trees, personality traits, and roguelike talent selection, designed for eventual porting to Unreal Engine. The research reveals a clear architectural imperative: **use plain MobX with OOP classes**, not MobX-State-Tree, because class-based patterns with decorators (`@observable`, `@action`, `@computed`) map almost directly to Unreal's `UCLASS/UPROPERTY/UFUNCTION` system. This decision alone eliminates the need for architectural rewrites during the port.

The core gameplay loop centers on observing a character's skill gaps, assigning activities to generate XP, and watching skills unlock according to a dependency graph. The skill tree must be modeled as an explicit Directed Acyclic Graph (DAG) from day one—ad-hoc conditionals become unmaintainable at scale and don't translate cleanly to any engine. The Hades-style pick-1-of-3 talent selection at milestones provides roguelike variety with minimal complexity.

The primary risk is **over-engineering a prototype**. This is throwaway code designed to test whether the core loop feels fun. The research unanimously recommends time-boxing (2 weeks max), avoiding premature tuning, and keeping game logic completely separate from React components. If the loop isn't fun with instant skill unlocks and placeholder art, no amount of polish will fix it.

## Key Findings

### Recommended Stack

The stack is largely constrained by project requirements (React, Tailwind, DaisyUI, MobX), with research focusing on versions, supporting libraries, and patterns that translate to Unreal C++.

**Core technologies:**
- **React 19.2 + TypeScript 5.6**: Current stable versions; strict TypeScript becomes the spec for C++ type translation
- **Vite 7.3**: Industry standard 2025, 5x faster builds, zero-config
- **MobX 6.15 (NOT MobX-State-Tree)**: Plain MobX with classes mirrors Unreal's UCLASS/UPROPERTY pattern directly
- **Tailwind 4 + DaisyUI 5**: v4 is 5x faster; DaisyUI's semantic classes keep component logic clean
- **Custom React/SVG for skill tree**: Full control, no stale dependencies (beautiful-skill-tree unmaintained since 2020)

**Critical decision:** Plain MobX over MST. MST's functional model approach (`types.model()`) requires architectural rewrite for Unreal. Plain MobX classes transfer directly.

### Expected Features

**Must have (table stakes):**
- Visual skill tree with locked/unlockable/unlocked states
- Clear unlock requirements showing prerequisites and XP needed
- Skill dependencies (Piaget-style "can't go to store without go outside")
- XP accumulation from activities (Sims/Stardew pattern)
- Level-up feedback (visual + audio cue)
- Persistent progress (localStorage sufficient for prototype)
- Trait display with visible effects on gameplay

**Should have (differentiators):**
- Observable skill gaps ("Patient can't X because lacks Y")
- Dependency chain visualization showing root cause
- Pick-1-of-3 talent selection at milestones (Hades Mirror of Night pattern)
- Resource drain from traits (social energy for introverts)
- Activity assignment interface

**Defer (v2+):**
- Respec systems
- Multiple currencies
- Procedural skill trees
- Achievement systems
- Social features/multiplayer

### Architecture Approach

The architecture prioritizes **portability to Unreal C++** through a four-layer structure: React UI (presentation only) -> Root Store (game state container) -> Domain Stores (business logic) -> Entity Classes (data objects). All game logic lives in plain TypeScript classes that could exist outside React entirely. The Root Store pattern maps to Unreal's GameInstance; Domain Stores map to GameInstanceSubsystems; Entity classes map to UObjects.

**Major components:**
1. **RootStore** — Single entry point for all game state, instantiates domain stores, provides cross-store communication
2. **SkillStore + SkillGraph (DAG)** — Skill definitions, unlock states, dependency graph with topological sort and cycle detection
3. **CharacterStore** — Character state, traits, XP pool, current activity
4. **ActivityStore** — Activity definitions, XP generation, requirements checking
5. **TalentStore** — Talent pool, pick-1-of-3 selection, milestone triggers
6. **GameLoopStore** — requestAnimationFrame-based tick, delta time processing, activity XP generation

### Critical Pitfalls

1. **Over-engineering the prototype** — Set hard time limits (2-hour/feature, 2-week/prototype). Ask constantly: "Does this test if the loop is fun?" Write throwaway code intentionally.

2. **State architecture that won't translate to Unreal** — Separate game logic into plain TypeScript classes. Never put game logic in React components or useEffect hooks. Think GameState -> Entities -> Systems.

3. **Building features that don't test the core hypothesis** — Write hypothesis BEFORE coding. Build vertical slice first. Playtest core loop before adding secondary systems.

4. **Skill dependencies as ad-hoc conditionals** — Model as explicit DAG from day one. Skills as nodes, dependencies as edges. Validate acyclic on load. Separate data (definitions) from logic (calculations).

5. **Locking core mechanics behind the skill tree** — Give players full basic moveset from start. Skill tree customizes/specializes, doesn't enable basics. Test loop with all skills unlocked first.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation + Data Model
**Rationale:** Architecture research mandates bottom-up construction. Entity classes and DAG have no dependencies; stores depend on entities; UI depends on stores.
**Delivers:** Entity classes (Skill, Character), SkillGraph DAG implementation, Domain stores, RootStore with React Context
**Addresses:** Visual skill tree (structure), skill dependencies, trait display
**Avoids:** Ad-hoc dependency conditionals, React-specific state architecture

### Phase 2: Core Loop
**Rationale:** Activity -> XP -> Skill unlock is the fundamental loop. Cannot validate fun without this working.
**Delivers:** Activity system, GameLoopStore with tick processing, XP generation, cross-store integration
**Addresses:** XP accumulation from activities, level-up feedback, activity assignment interface
**Avoids:** Over-engineering (use placeholder activities), premature tuning

### Phase 3: Skill Tree UI
**Rationale:** Visualization depends on functioning store layer. Build UI after data model stabilizes.
**Delivers:** SkillTreeView component, node rendering with states, connection lines (SVG), interaction handling
**Addresses:** Visual skill tree (rendering), observable skill gaps, dependency visualization
**Avoids:** Logic in components (UI reads from stores, dispatches actions only)

### Phase 4: Traits + Talents
**Rationale:** Secondary systems that enhance core loop. Only build after loop validates.
**Delivers:** TraitStore with modifiers, TalentStore with pick-1-of-3, resource drain mechanics
**Addresses:** Trait effects visible, resource drain from traits, pick-1-of-3 talent selection
**Avoids:** Features without synergies (design talents in pairs), isolated systems

### Phase 5: Polish + Persistence
**Rationale:** Juice and save/load are polish. Only invest after core loop proven fun.
**Delivers:** Level-up animations, XP gain indicators, localStorage save/load, snapshot serialization
**Addresses:** Skill unlock animations, persistent progress, personality-aware narration
**Avoids:** Premature tuning, neglecting game feel

### Phase Ordering Rationale

- **Bottom-up construction required:** Architecture research shows entity classes have no dependencies, stores depend on entities, UI depends on stores. Building out-of-order creates coupling problems.
- **Core loop validation first:** Pitfalls research emphasizes testing hypothesis before adding features. Phases 1-3 create minimal playable slice.
- **Traits/Talents deferred:** These enhance the loop but don't define it. Adding too early obscures whether base progression is fun.
- **Unreal portability:** Every phase produces code that transfers. Phase 1-2 are pure TypeScript; Phase 3 separates UI from logic; Phase 4-5 add systems that map to Unreal patterns.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Skill Tree UI):** SVG connection rendering, layout algorithms for DAG visualization. Consider researching dagre or custom force-directed layout.
- **Phase 4 (Traits + Talents):** Synergy design patterns. Study Hades/Slay the Spire implementations. Balance complexity vs. prototype scope.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** MobX documentation is excellent. DAG algorithms well-documented.
- **Phase 2 (Core Loop):** requestAnimationFrame patterns established. Activity-XP flow straightforward.
- **Phase 5 (Polish):** localStorage serialization standard. Animation patterns documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official docs (React 19.2, MobX 6.15, Vite 7.3, Tailwind 4, DaisyUI 5) |
| Features | HIGH | Multiple authoritative game design sources (Hades, Stardew, Sims) + rehabilitation game research |
| Architecture | HIGH | MobX official docs + Unreal official docs confirm pattern mapping |
| Pitfalls | MEDIUM | WebSearch verified but some sources are blog posts; core warnings consistent across sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Skill tree visualization library:** beautiful-skill-tree unmaintained. Custom SVG implementation recommended but may need layout algorithm research.
- **Trait modifier system:** How traits affect XP/activities not fully specified. Design during Phase 4 planning.
- **Talent synergies:** Roguelike talent combos require intentional design. Risk of stat-only talents if not planned.
- **Game loop timing:** requestAnimationFrame vs. setInterval tradeoffs. Prototype can use either; performance only matters if lag observed.

## Sources

### Primary (HIGH confidence)
- [MobX Documentation](https://mobx.js.org/) — defining data stores, observable state, actions
- [MobX-State-Tree GitHub](https://github.com/mobxjs/mobx-state-tree) — v7.0.2, why NOT to use for Unreal port
- [Unreal Engine: Programming Subsystems](https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-subsystems-in-unreal-engine) — GameInstanceSubsystem pattern
- [Vite Documentation](https://vite.dev/guide/) — v7.3.1 current
- [DaisyUI Documentation](https://daisyui.com/) — v5.5.14 current
- [GDKeys: Meaningful Skill Trees](https://gdkeys.com/keys-to-meaningful-skill-trees/) — design principles
- [Hades Wiki: Mirror of Night](https://hades.fandom.com/wiki/Mirror_of_Night) — roguelike progression model

### Secondary (MEDIUM confidence)
- [MobX Root Store Pattern](https://dev.to/ivandotv/mobx-root-store-pattern-with-react-hooks-318d) — React Context integration
- [DeveloperWay: React State Management 2025](https://www.developerway.com/posts/react-state-management-2025) — performance patterns
- [Codecks: Scope Creep](https://www.codecks.io/blog/2025/how-to-avoid-scope-creep-in-game-development/) — prototype discipline
- [Adrian Crook: Skill Tree Design](https://adriancrook.com/skill-tree-design-ultimate-guide-for-freemium-games/) — gating and pacing

### Tertiary (LOW confidence)
- [beautiful-skill-tree npm](https://www.npmjs.com/package/beautiful-skill-tree) — v1.7.1, last updated 2020, NOT recommended
- Various game design blog posts on roguelike progression — consistent but not authoritative

---
*Research completed: 2026-01-20*
*Ready for roadmap: yes*
