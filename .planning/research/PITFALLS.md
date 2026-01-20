# Domain Pitfalls: React Skill Tree Game Prototype

**Domain:** Arcade life-sim with skill tree / character development (React prototype)
**Researched:** 2026-01-20
**Confidence:** MEDIUM (WebSearch verified with multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, invalidate the prototype, or waste significant time.

### Pitfall 1: Over-Engineering the Prototype

**What goes wrong:** Building production-quality architecture, complex state management, and polished features when the goal is validating whether the core loop feels fun.

**Why it happens:** Developer instinct to "do it right" from the start. Fear of technical debt. Habit of building for scale before validating the concept.

**Consequences:**
- Prototype takes weeks instead of days
- Core hypothesis never tested because energy spent on infrastructure
- Sunk cost fallacy prevents pivoting when loop isn't fun
- Code won't port to Unreal C++ anyway

**Warning signs:**
- Setting up Redux/complex state management before core loop works
- Spending time on folder structure, abstractions, or "clean architecture"
- Building features beyond minimum needed to test the hypothesis
- Prototype timeline extends beyond 1-2 weeks

**Prevention:**
- Set hard time limits: 2-hour max per feature, 2-week max per prototype
- Use simplest possible state (useState, maybe Zustand)
- Ask constantly: "Does this help me test if the loop is fun?"
- Write "throwaway code" intentionally - it's a prototype

**Phase relevance:** Phase 1 (Core Loop). Enforce time-boxing from day one.

**Sources:**
- [Codecks: Scope Creep in Game Development](https://www.codecks.io/blog/2025/how-to-avoid-scope-creep-in-game-development/)
- [Valtorian: MVP Development Mistakes](https://www.valtorian.com/blog/mvp-development-non-technical-founders-costly-mistakes)

---

### Pitfall 2: State Architecture That Won't Translate to Unreal

**What goes wrong:** Using React-specific patterns (Context, hooks, component state) that have no equivalent in Unreal's C++/Blueprint architecture. When it's time to port, nothing transfers.

**Why it happens:** React's state model is fundamentally different from game engine architectures (ECS, Actors, GameInstance). Developers optimize for React without considering the target platform.

**Consequences:**
- Zero code reuse when porting to Unreal
- Mental models don't transfer (React re-renders vs. Tick functions)
- Architecture decisions validated in React may not work in Unreal
- Time wasted re-learning how to structure the same systems

**Warning signs:**
- Heavy use of React-specific patterns (useEffect for game logic, Context for game state)
- State scattered across many components
- No separation between "game logic" and "UI rendering"
- Treating React components as game entities

**Prevention:**
- Separate game logic into plain TypeScript/JavaScript classes
- Use a central "game state" object that could exist outside React
- Think in terms of: GameState, Entities, Systems (ECS-lite)
- Document architecture decisions with "How would this work in Unreal?" notes
- Consider using Zustand store as stand-in for Unreal's GameInstance

**Phase relevance:** Phase 1 (Architecture). Define separation early.

**Sources:**
- [Wikipedia: Entity Component System](https://en.wikipedia.org/wiki/Entity_component_system)
- [Unreal Stack: Blueprint vs C++ Migration](https://unrealstack.com/blueprint-vs-c-in-unreal-engine/)

---

### Pitfall 3: Building Features That Don't Test the Core Hypothesis

**What goes wrong:** Adding traits, talents, activities, and complex systems before validating that the basic skill progression feels rewarding.

**Why it happens:** Feature creep feels like progress. The full vision is exciting. Testing a minimal loop feels incomplete.

**Consequences:**
- Can't isolate what's working vs. what isn't
- Complex systems mask fundamental problems with core progression
- Wasted effort on features that may be cut
- "Is it fun?" becomes impossible to answer

**Warning signs:**
- Adding systems before core loop is playtested
- Excitement about features rather than validation
- "While I'm at it, I'll also add..."
- Prototype scope grows beyond original hypothesis

**Prevention:**
- Write hypothesis BEFORE coding: "Players will feel rewarded when X"
- Build vertical slice: one skill tree branch, one activity, one session
- Playtest core loop before adding any secondary systems
- Use feature flags to disable complexity during testing

**Phase relevance:** Phase 1 (Vertical Slice). Lock scope before building.

**Sources:**
- [Tono Game Consultants: Game Prototyping](https://tonogameconsultants.com/prototyping/)
- [PlaytestCloud: Playtesting Early Prototypes](https://help.playtestcloud.com/en/articles/1290649-playtesting-an-early-prototype-of-your-game)

---

### Pitfall 4: Skill Tree Dependencies Without Proper Data Structure

**What goes wrong:** Implementing skill dependencies as ad-hoc conditionals rather than a proper directed acyclic graph (DAG). Results in bugs, circular dependencies, and unmaintainable unlock logic.

**Why it happens:** Simple conditionals work for 3-5 skills. Complexity explodes at 10+ skills with multiple dependency paths.

**Consequences:**
- Circular dependency bugs crash the game
- Unlock logic becomes spaghetti code
- Adding new skills requires touching multiple places
- Balance changes require code changes instead of data changes

**Warning signs:**
- Skill unlock logic in component render methods
- "if skill A and skill B then skill C" scattered throughout code
- No clear visualization of dependency graph
- Hard to answer "what can the player unlock next?"

**Prevention:**
- Model skill tree as explicit DAG from the start
- Skills as nodes, dependencies as edges
- Validate graph is acyclic on load (topological sort)
- Separate data (skill definitions) from logic (unlock calculations)
- Use adjacency list or matrix representation

**Phase relevance:** Phase 1 (Data Model). Design data structure before UI.

**Sources:**
- [Wikipedia: Dependency Graph](https://en.wikipedia.org/wiki/Dependency_graph)
- [Runevision: Procedural Game Progression Dependency Graphs](https://blog.runevision.com/2024/10/procedural-game-progression-dependency.html)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or suboptimal prototypes.

### Pitfall 5: Complex Nested State Causing Re-render Cascades

**What goes wrong:** Deep nesting of skill/trait/activity state causes entire UI to re-render on every change, making the game feel sluggish.

**Why it happens:** React's default behavior re-renders children when parent state changes. Games have frequent state updates (XP gains, cooldowns, etc.).

**Consequences:**
- UI lag on state changes
- Poor game feel
- Debugging performance issues instead of testing fun
- Premature optimization rabbit holes

**Warning signs:**
- Visible lag when gaining XP or unlocking skills
- React DevTools showing excessive re-renders
- useEffect/useMemo proliferating to "fix" performance
- State updates feel "heavy"

**Prevention:**
- Flatten state structure where possible
- Use Zustand with selectors for fine-grained subscriptions
- Keep frequently-changing state (timers, XP) separate from stable state (skill definitions)
- Profile early if lag appears; don't assume the cause

**Phase relevance:** Phase 2 (Polish). Only optimize if actually slow.

**Sources:**
- [DeveloperWay: React State Management 2025](https://www.developerway.com/posts/react-state-management-2025)
- [Makers Den: State Management Trends 2025](https://makersden.io/blog/react-state-management-in-2025)

---

### Pitfall 6: Locking Core Mechanics Behind the Skill Tree

**What goes wrong:** Making essential gameplay actions require skill unlocks, frustrating players in early game and obscuring the fun.

**Why it happens:** Desire to make skill tree feel impactful. Copying games that do this poorly (Assassin's Creed Origins, Mirror's Edge Catalyst, Sekiro).

**Consequences:**
- Early game feels incomplete/frustrating
- Players can't evaluate if the full loop is fun
- Core mechanics hidden behind grind
- Playtesters blame "not unlocked enough" for unfun experience

**Warning signs:**
- Basic actions (move, interact) gated by unlocks
- "The game gets good after 30 minutes" feedback
- Players confused about what they can do
- Skill tree feels mandatory rather than customizing

**Prevention:**
- Give players full basic moveset from the start
- Skill tree should customize/specialize, not enable basics
- Test core loop with all skills unlocked first
- Ask: "If a player never touched the skill tree, could they still play?"

**Phase relevance:** Phase 1 (Design). Decide what's core vs. optional early.

**Sources:**
- [Medium: Game Design - Skill Trees](https://medium.com/@thomas_1379/game-design-is-easy-2f8150a82734)
- [GDKeys: Keys to Meaningful Skill Trees](https://gdkeys.com/keys-to-meaningful-skill-trees/)

---

### Pitfall 7: Boring Filler Upgrades in Skill Tree

**What goes wrong:** Skill tree filled with "+5% damage" type upgrades that don't meaningfully change gameplay or feel rewarding.

**Why it happens:** Need to fill out the tree. Easier to design stat bumps than new mechanics. Copying RPG conventions without understanding why.

**Consequences:**
- Players don't care about progression
- Skill points feel meaningless
- "Why bother?" feedback from testers
- Progression system fails to motivate

**Warning signs:**
- Most skills are percentage increases
- Players don't notice when they unlock something
- No "build diversity" - all paths feel the same
- Skill names are generic ("Improved X", "Better Y")

**Prevention:**
- Every skill should change how you play, not just numbers
- Include "signature" skills that define playstyles
- Test: "Would a player ever NOT take this skill?" If always yes, it's filler.
- Piaget-inspired: Skills should unlock new cognitive capabilities, not just amplify existing ones

**Phase relevance:** Phase 1 (Skill Design). Design interesting skills before building UI.

**Sources:**
- [Adrian Crook: Skill Tree Design Guide](https://adriancrook.com/skill-tree-design-ultimate-guide-for-freemium-games/)
- [Gamedeveloper: Storytelling Through Skill Trees](https://www.gamedeveloper.com/design/storytelling-through-skill-trees)

---

### Pitfall 8: XP/Progression Tuning Too Early

**What goes wrong:** Spending hours balancing XP curves, level thresholds, and progression pacing before knowing if the core loop is fun.

**Why it happens:** Feels like important game design work. Numbers are satisfying to tweak. Avoiding the harder question of "is this fun?"

**Consequences:**
- Wasted tuning effort if loop changes
- False signal: "It's not fun because progression is too slow" (real issue: loop isn't fun)
- Bikeshedding on numbers instead of testing mechanics
- Spreadsheet-driven development

**Warning signs:**
- Detailed XP spreadsheets before playable prototype
- Debates about level curve formulas
- "It'll feel better with proper tuning"
- Players given specific XP amounts in test rather than natural earning

**Prevention:**
- Use placeholder progression: fast unlocks, everything available
- Tune AFTER validating core loop is fun with instant gratification
- Progression tuning is a polish phase activity
- Let playtesters earn XP naturally, then observe pain points

**Phase relevance:** Phase 3 (Tuning). Explicitly defer to late phase.

**Sources:**
- [Gamedeveloper: Quantitative Design - XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)
- [Number Analytics: Mastering Progression Systems](https://www.numberanalytics.com/blog/mastering-progression-systems-game-design)

---

### Pitfall 9: Roguelike Talents Without Meaningful Synergies

**What goes wrong:** Power-ups that are individually interesting but don't combine in satisfying ways, making runs feel samey.

**Why it happens:** Designing talents in isolation. Not considering how they interact. Copying from games without understanding why they work.

**Consequences:**
- "Optimal" builds emerge quickly
- Runs feel interchangeable
- No "broken combo" moments of delight
- Talent choices don't feel meaningful

**Warning signs:**
- All talents are stat modifications
- Players always pick the same talents
- No "I wonder if X + Y would work" discussions
- Talents don't reference each other

**Prevention:**
- Design talents in pairs/groups that synergize
- Include at least one "combo breaker" talent per category
- Playtest with intent to find broken combos (then decide if fun-broken or bad-broken)
- Study Hades, Slay the Spire, Risk of Rain 2 for synergy design

**Phase relevance:** Phase 2 (Talent System). When talents are introduced, design for synergy.

**Sources:**
- [Wayline: Roguelike Itemization](https://www.wayline.io/blog/roguelike-itemization-balancing-randomness-player-agency)
- [GameRant: Roguelikes with Innovative Power-Up Systems](https://gamerant.com/roguelikes-innovative-power-up-systems/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

### Pitfall 10: Neglecting Game Feel in Prototype

**What goes wrong:** Prototype has correct mechanics but feels lifeless - no feedback, no juice, no satisfaction.

**Why it happens:** Treating prototype as purely functional. "I'll add polish later." Feedback effects feel non-essential.

**Consequences:**
- False negative: "Loop isn't fun" (actually: loop has no feedback)
- Playtesters can't evaluate true potential
- Prototype doesn't represent final feel

**Warning signs:**
- Actions complete silently
- No visual confirmation of progress
- Numbers change but nothing else happens
- Feels like using a spreadsheet

**Prevention:**
- Add minimal juice even in prototype: sound on unlock, number pop on XP gain, brief highlight
- 30 minutes of polish can transform perceived fun
- Test with and without feedback to isolate effect
- Juice is not polish - it's part of the hypothesis

**Phase relevance:** Phase 1 (Core Loop). Include minimal juice from start.

**Sources:**
- [Gamedeveloper: 6 Mistakes That Drain Juice](https://www.gamedeveloper.com/design/6-mistakes-that-ll-drain-the-juice-out-of-your-game)
- [Wayline: The Juice Problem](https://www.wayline.io/blog/the-juice-problem-how-exaggerated-feedback-is-harming-game-design)

---

### Pitfall 11: React Game Loop Anti-Patterns

**What goes wrong:** Using React's render cycle as game loop, or misusing requestAnimationFrame with state updates.

**Why it happens:** Trying to make React do what it wasn't designed for. Unfamiliarity with game loop patterns.

**Consequences:**
- Inconsistent timing across refresh rates
- Physics/progression speed varies by device
- State update overhead in hot path
- Memory leaks from uncleared animation frames

**Warning signs:**
- Game speed changes on different monitors
- useEffect dependencies causing loop restarts
- State updates on every frame
- "Why is this slower on my laptop?"

**Prevention:**
- Use requestAnimationFrame with delta time for animations
- Keep game state in refs or external store, not component state for hot paths
- Throttle state updates to reasonable frequency (10-30 fps for UI, not 60)
- Clean up animation frames in useEffect cleanup

**Phase relevance:** Phase 1 (Technical Foundation). Decide loop strategy early.

**Sources:**
- [OpenReplay: requestAnimationFrame in React](https://blog.openreplay.com/use-requestanimationframe-in-react-for-smoothest-animations/)
- [Aleksandr Hovhannisyan: Performant Game Loops](https://www.aleksandrhovhannisyan.com/blog/javascript-game-loop/)

---

### Pitfall 12: Not Defining "Fun" Before Building

**What goes wrong:** Building features without clear hypothesis of what makes them enjoyable. No criteria for success.

**Why it happens:** Assumption that the vision is obvious. Eagerness to build rather than plan. "I'll know fun when I see it."

**Consequences:**
- Can't evaluate if prototype succeeds
- Scope creep from unclear goals
- Arguments about subjective "fun"
- No clear stopping point for iteration

**Warning signs:**
- "Is this fun?" met with shrugs
- Different team members have different success criteria
- Adding features to "make it more fun" without direction
- No playtest questions defined

**Prevention:**
- Write hypothesis before coding: "It will feel satisfying when X because Y"
- Define 3 specific questions for playtesters
- Create success criteria: "If playtesters say Z, hypothesis validated"
- Distinguish "fun to build" from "fun to play"

**Phase relevance:** Phase 0 (Planning). Define before any code.

**Sources:**
- [Taylor EDU: Iterative Design and Playtesting](https://cse.taylor.edu/~jdenning/classes/sys270/slides/13_playtesting.html)
- [Board Game Design Lab: Playtest Like a Boss](https://boardgamedesignlab.com/playtest-like-a-boss/)

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| Phase 0 | Planning | Unclear hypothesis | Write specific testable hypothesis before coding |
| Phase 1 | Core Loop | Over-engineering | Time-box to 2 weeks, use simplest possible code |
| Phase 1 | Skill Tree | Ad-hoc dependencies | Design as DAG from start, separate data from logic |
| Phase 1 | State | React-specific patterns | Separate game logic from React rendering layer |
| Phase 2 | Traits/Talents | No synergies | Design interactions between systems, not isolated features |
| Phase 2 | Activities | Feature creep | Each activity must test a specific hypothesis |
| Phase 3 | Tuning | Premature optimization | Only tune after core loop validated |
| Phase 3 | Polish | Missing juice | Include minimal feedback from Phase 1 |
| All | Scope | Scope creep | Hard time limits, constant "does this test hypothesis?" |

---

## Prototype-Specific Checklist

Before considering prototype "done," verify:

- [ ] Core hypothesis clearly stated and tested
- [ ] Playtesters gave feedback on specific questions
- [ ] Game logic separable from React (could port to Unreal)
- [ ] Skill tree uses proper dependency graph
- [ ] No core mechanics locked behind progression
- [ ] Minimal game feel/juice included
- [ ] Time spent < 2-3 weeks
- [ ] Features limited to what's needed to test hypothesis
- [ ] Clear answer to "Is the loop fun? Why/why not?"

---

## Summary: Top 5 Mistakes to Avoid

1. **Over-engineering** - This is a prototype, not a product. Throwaway code is correct.
2. **Testing features instead of hypothesis** - Build minimum needed to answer "Is this fun?"
3. **React-specific architecture** - Separate game logic for eventual Unreal port.
4. **Skill dependencies as conditionals** - Use proper DAG from day one.
5. **Tuning before validating** - Prove the loop is fun before balancing numbers.

---

## Sources

### Skill Tree Design
- [Medium: Game Design - Skill Trees](https://medium.com/@thomas_1379/game-design-is-easy-2f8150a82734)
- [Adrian Crook: Skill Tree Design Guide](https://adriancrook.com/skill-tree-design-ultimate-guide-for-freemium-games/)
- [GDKeys: Keys to Meaningful Skill Trees](https://gdkeys.com/keys-to-meaningful-skill-trees/)
- [Wayline: Building Skill Trees in Unity](https://www.wayline.io/blog/unity-skill-tree-scriptable-objects)

### Prototype & MVP Development
- [Codecks: Avoiding Scope Creep](https://www.codecks.io/blog/2025/how-to-avoid-scope-creep-in-game-development/)
- [Wayline: Scope Creep in Indie Games](https://www.wayline.io/blog/scope-creep-indie-games-avoiding-development-hell)
- [Tono Consultants: Game Prototyping](https://tonogameconsultants.com/prototyping/)
- [Valtorian: MVP Development Mistakes](https://www.valtorian.com/blog/mvp-development-non-technical-founders-costly-mistakes)

### React State & Performance
- [DeveloperWay: React State Management 2025](https://www.developerway.com/posts/react-state-management-2025)
- [Makers Den: State Management Trends 2025](https://makersden.io/blog/react-state-management-in-2025)
- [OpenReplay: requestAnimationFrame in React](https://blog.openreplay.com/use-requestanimationframe-in-react-for-smoothest-animations/)
- [Growin: React Performance Optimization 2025](https://www.growin.com/blog/react-performance-optimization-2025/)

### Game Architecture & Porting
- [Wikipedia: Entity Component System](https://en.wikipedia.org/wiki/Entity_component_system)
- [Game Programming Patterns: Architecture](https://gameprogrammingpatterns.com/architecture-performance-and-games.html)
- [Unreal Stack: Blueprint vs C++](https://unrealstack.com/blueprint-vs-c-in-unreal-engine/)

### Roguelike & Progression Design
- [Wayline: Roguelike Itemization](https://www.wayline.io/blog/roguelike-itemization-balancing-randomness-player-agency)
- [Gamedeveloper: XP Thresholds](https://www.gamedeveloper.com/design/quantitative-design---how-to-define-xp-thresholds-)
- [Grid Sage Games: Designing for Mastery in Roguelikes](https://www.gridsagegames.com/blog/2025/08/designing-for-mastery-in-roguelikes-w-roguelike-radio/)

### Game Feel & Playtesting
- [Gamedeveloper: 6 Mistakes That Drain Juice](https://www.gamedeveloper.com/design/6-mistakes-that-ll-drain-the-juice-out-of-your-game)
- [Wayline: The Juice Problem](https://www.wayline.io/blog/the-juice-problem-how-exaggerated-feedback-is-harming-game-design)
- [Board Game Design Lab: Playtest Like a Boss](https://boardgamedesignlab.com/playtest-like-a-boss/)
