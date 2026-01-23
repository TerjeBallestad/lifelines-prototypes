# Stack Research: Needs-Based Resource System & Autonomous AI

## Summary

The existing React + MobX stack requires NO additional libraries for the needs/resource system. MobX's computed values natively handle interdependent calculations through automatic dependency tracking. Autonomous AI behavior selection should use a **utility scoring system** (not state machines) implemented directly in TypeScript. The existing BalanceConfigStore pattern extends cleanly to needs-system formulas.

**Confidence:** HIGH (verified with MobX official docs, utility AI references, and existing codebase patterns)

---

## Recommendations

### Core Architecture: NO NEW DEPENDENCIES

**Recommendation:** Use existing MobX 6.15.0 with computed values for all derived state.

**Rationale:**
- MobX computed values automatically handle interdependent calculations (Mood from needs, Overskudd from mood+energy+purpose)
- Lazy evaluation and automatic caching prevent performance issues
- Chaining computed values is explicitly supported and optimized
- Existing Character class already demonstrates this pattern (`effectiveCapacities`, `activeModifiers`)

**Integration:**
```typescript
// Existing pattern (Character.ts lines 105-215)
get activeModifiers(): ResourceModifier[] { ... }
get effectiveCapacities(): Capacities { ... }

// Extends cleanly to needs-derived state
get mood(): number {
  // Computed from primary needs
  return calculateMoodFromNeeds(this.needs);
}

get overskudd(): number {
  // Computed from other computed values
  return calculateOverskudd(this.mood, this.energy, this.purpose, this.willpower);
}
```

**Source:** [MobX Computed Values Official Docs](https://mobx.js.org/computeds.html)

---

### Derived State Pattern: MobX Computed Getters

**Recommendation:** Model needs as observable state, wellbeing metrics as computed getters.

**Rationale:**
- Primary needs (Hunger, Energy, Hygiene, etc.) are **observable properties** that change over time
- Derived wellbeing (Mood, Purpose) are **computed getters** that recalculate automatically
- Action resources (Overskudd) are **computed from computed values** (MobX handles multi-level dependencies)
- Zero risk of stale/inconsistent state due to automatic dependency tracking

**MobX Performance Characteristics:**
- Computed values suspend when not observed (no wasted calculations)
- Structural comparison available via `computed.struct` if needed
- Chained computations automatically optimized

**Pattern:**
```typescript
export class Character {
  // Observable: Primary needs (mutate over time)
  needs = {
    hunger: 100,
    energy: 100,
    hygiene: 100,
    bladder: 100,
    social: 100,
    fun: 100,
    security: 100,
  };

  // Computed: Derived wellbeing (auto-updates when needs change)
  get mood(): number {
    // Averages need satisfaction with weights
    const needsArray = Object.values(this.needs);
    return weightedAverage(needsArray, MOOD_WEIGHTS);
  }

  get purpose(): number {
    // Activity-personality fit (computed from current activity + personality)
    const activity = this.root?.activityStore.currentActivity;
    return calculatePurpose(activity, this.personality);
  }

  // Computed from computed values (multi-level derivation)
  get overskudd(): number {
    return clamp(
      this.mood * 0.3 +
      this.energy * 0.3 +
      this.purpose * 0.2 +
      this.willpower * 0.2
    );
  }
}
```

**Why NOT use reactions:** Reactions are for side effects. Our derived state has no side effects, so computed values are the correct primitive.

**Source:** [MobX Computed Values](https://mobx.js.org/computeds.html)

---

### Autonomous AI: Utility Scoring (NOT State Machines)

**Recommendation:** Implement utility AI with weighted scoring for activity selection.

**Rationale:**
- State machines are brittle for needs-based systems (combinatorial explosion of states)
- Utility AI is industry-standard for The Sims-style simulations
- Weighted scoring naturally handles multiple competing needs
- Easily tunable via BalanceConfigStore pattern

**Implementation Location:** New file `src/ai/UtilityAI.ts`

**Pattern:**
```typescript
export interface ActivityUtility {
  activity: Activity;
  score: number;
  breakdown: { factor: string; value: number }[]; // For debugging
}

export class UtilityAI {
  /**
   * Score an activity based on character's current needs + personality.
   * Returns 0-100 utility score.
   */
  static scoreActivity(
    activity: Activity,
    character: Character,
    config: BalanceConfig
  ): number {
    let score = 0;

    // Factor 1: Need satisfaction (which needs does this activity restore?)
    const needScore = this.calculateNeedScore(activity, character);
    score += needScore * 0.5; // 50% weight

    // Factor 2: Resource feasibility (can character afford this?)
    const resourceScore = this.calculateResourceScore(activity, character);
    score += resourceScore * 0.3; // 30% weight

    // Factor 3: Personality fit (does character enjoy this type of activity?)
    const personalityScore = this.calculatePersonalityFit(activity, character);
    score += personalityScore * 0.2; // 20% weight

    return clamp(score, 0, 100);
  }

  /**
   * Select best activity from available options.
   * Returns top-scoring activity or null if none viable.
   */
  static selectActivity(
    availableActivities: Activity[],
    character: Character,
    config: BalanceConfig
  ): Activity | null {
    const scored = availableActivities.map(activity => ({
      activity,
      score: this.scoreActivity(activity, character, config)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Return highest scoring activity with score > threshold
    const best = scored[0];
    return best && best.score > config.minUtilityThreshold ? best.activity : null;
  }
}
```

**Why NOT behavior trees:** Overkill for this scope. Utility scoring is simpler and sufficient for needs-based selection.

**Why NOT state machines:** Needs-based systems have too many state combinations (hungry+tired+lonely+bored = explosion). Utility AI evaluates all factors simultaneously.

**Sources:**
- [Utility System Wikipedia](https://en.wikipedia.org/wiki/Utility_system)
- [Game AI Pro - Introduction to Utility Theory (PDF)](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf)
- [The Shaggy Dev - Utility AI](https://shaggydev.com/2023/04/19/utility-ai/)

---

### Balance Configuration: Extend Existing Pattern

**Recommendation:** Add needs-system formulas to BalanceConfigStore.

**Rationale:**
- Existing BalanceConfigStore (src/config/balance.ts) already provides runtime-tunable parameters
- Needs decay rates, mood weights, and utility thresholds belong in balance config
- MobX reactivity means UI/dev tools can tune formulas live

**Extension:**
```typescript
export interface BalanceConfig {
  // ... existing fields ...

  // Needs system
  needDecayRatePerTick: Record<NeedKey, number>; // Hunger, Energy, etc.
  moodWeights: Record<NeedKey, number>; // How each need contributes to Mood
  overskuddFormula: { mood: number; energy: number; purpose: number; willpower: number }; // Weights

  // Autonomous AI
  minUtilityThreshold: number; // Minimum score to select activity (0-100)
  utilityWeights: { needs: number; resources: number; personality: number }; // Factor weights
}
```

**Why centralize:** Game balance iteration requires tweaking formulas. Centralized config enables rapid experimentation without code changes.

**Source:** Existing pattern in `src/config/balance.ts`

---

## Integration Notes

### How This Fits Existing Architecture

**Character Entity:**
- Add `needs` observable object (primary needs)
- Add computed getters for `mood`, `purpose`, `overskudd` (derived wellbeing)
- Existing `applyTickUpdate()` method extends to decay needs

**ActivityStore:**
- Add `selectAutonomousActivity()` method using UtilityAI
- Existing `canStartActivity()` pattern extends to check derived resources
- Existing `processTick()` already handles activity execution

**RootStore:**
- No changes needed (UtilityAI uses existing stores via root reference)

**BalanceConfigStore:**
- Extend interface with needs-system parameters
- Existing update/reset pattern unchanged

**Unreal Portability:**
- Computed values map to Unreal's `UPROPERTY(BlueprintReadOnly)` getters
- Utility AI is pure calculation logic (portable to C++)
- BalanceConfigStore maps to Unreal DataAsset

---

## What NOT to Add

### State Machine Library (xstate, etc.)

**Why avoid:**
- Needs-based systems don't fit state machine paradigm
- Would introduce unnecessary complexity for linear need satisfaction
- Utility AI is more appropriate for continuous numerical evaluation

**When to revisit:** If you add complex behaviors with sequential steps (e.g., "go to kitchen, then cook, then eat"), behavior trees or state machines become useful. Current scope doesn't need this.

### Immutable State Library (immer, etc.)

**Why avoid:**
- MobX is built for mutable state with automatic tracking
- Immutability would fight against MobX's design philosophy
- Existing codebase successfully uses mutable pattern (Character.resources.energy = X)

**Unreal note:** Unreal also uses mutable state (UProperties), so current pattern ports correctly.

### Math/Formula Libraries (mathjs, etc.)

**Why avoid:**
- Needs calculations are simple weighted averages and linear formulas
- TypeScript native math is sufficient (Math.min, Math.max, Math.round)
- Library overhead not justified for basic arithmetic

**When to revisit:** If you add complex statistical analysis or curve fitting for balance tuning, consider a library. Current needs-system formulas don't require this.

### Utility AI Frameworks (goap.js, etc.)

**Why avoid:**
- Utility scoring is ~50 lines of pure functions
- Frameworks add learning curve and bundle size for marginal benefit
- Direct implementation provides full control for balance tuning

**When to revisit:** If you add GOAP (Goal-Oriented Action Planning) with complex goal hierarchies, consider a framework. Current autonomous selection is simpler.

### Redux/Zustand/Other State Management

**Why avoid:**
- MobX already chosen and working well (PROJECT.md decision log)
- Switching state management mid-project is high risk, low reward
- MobX computed values are perfect fit for derived needs

**Already decided:** React + MobX validated in v1.0 (3-day prototype, 4,430 LOC)

---

## Version Verification

**Current Dependencies (package.json):**
- `mobx: ^6.15.0` - Latest stable (released 2024-12-20)
- `mobx-react-lite: ^4.1.1` - Latest (released 2024-12-02)
- `react: ^19.2.0` - Current
- `typescript: ~5.9.3` - Current

**Verification:** No updates needed. MobX 6.15.0 is current and fully supports computed value chaining.

**Source:** Verified via package.json and [MobX GitHub Releases](https://github.com/mobxjs/mobx/releases)

---

## Implementation Checklist

When implementing needs-system, use this stack:

- [ ] MobX computed getters for Mood (from needs)
- [ ] MobX computed getters for Purpose (from activity fit)
- [ ] MobX computed getters for Overskudd (from mood/energy/purpose/willpower)
- [ ] Pure utility scoring functions in `src/ai/UtilityAI.ts`
- [ ] Extended BalanceConfigStore with needs-system parameters
- [ ] NO new npm dependencies

---

## Original v1.0 Stack (Preserved for Reference)

### Core Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React | ^19.2.0 | UI framework | HIGH |
| TypeScript | ~5.9.3 | Type safety | HIGH |
| Vite | ^7.2.4 | Build tool | HIGH |

### Styling

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Tailwind CSS | ^4.1.18 | Utility CSS | HIGH |
| DaisyUI | ^5.5.14 | Component classes | HIGH |

### State Management

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| MobX | ^6.15.0 | Reactive state | HIGH |
| mobx-react-lite | ^4.1.1 | React bindings | HIGH |

### Data Persistence

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| localStorage | (browser) | Dev save/load | HIGH |
| JSON | (native) | Serialization | HIGH |

### Visualization

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Recharts | ^3.6.0 | Charts for skill visualization | HIGH |

### Supporting Libraries

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| clsx | ^2.1.1 | Conditional classes | HIGH |
| sonner | ^2.0.7 | Toast notifications | HIGH |

---

*Researched: 2026-01-23 (Updated for v1.1 needs-system milestone)*
*Original: 2026-01-20 (v1.0 foundation stack)*

**Sources:**
- [MobX Computed Values Official Docs](https://mobx.js.org/computeds.html)
- [Utility System (Wikipedia)](https://en.wikipedia.org/wiki/Utility_system)
- [Game AI Pro - Introduction to Utility Theory (PDF)](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf)
- [The Shaggy Dev - Utility AI](https://shaggydev.com/2023/04/19/utility-ai/)
- [The Sims 4 Balance System](https://sims.fandom.com/wiki/Balance)
- [Toolify AI - Implementing Utility AI](https://www.toolify.ai/ai-news/enhance-game-ai-implementing-utility-ai-with-examples-2212089)
- [MobX GitHub Releases](https://github.com/mobxjs/mobx/releases)
