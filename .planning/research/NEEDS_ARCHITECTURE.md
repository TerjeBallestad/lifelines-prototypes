# Architecture Research: Needs-Based Resource System Integration

**Researched:** 2026-01-23
**Confidence:** HIGH (MobX official docs, existing codebase patterns, utility AI research)

---

## Summary

This research addresses how to integrate a needs-based resource system (primary needs, derived wellbeing stats, autonomous AI) into the existing MobX class-based architecture. The core insight: **MobX computed properties naturally model derived stats**, and **utility-based AI decision systems integrate cleanly as methods on Character/ActivityStore**. The existing architecture requires minimal restructuring—primarily splitting Resources into categories and adding computed wellbeing properties.

**Key findings:**
1. Character.resources splits into primary needs, health stats, action resources (keeps MobX reactivity)
2. Derived wellbeing (Mood, Purpose) become computed properties with explicit formulas
3. Autonomous AI uses utility-based decision system in ActivityStore (scores activities, picks highest)
4. No new stores needed—logic fits in Character (derived stats) and ActivityStore (AI decisions)
5. Build order: Primary needs → Derived stats → Autonomous AI (each layer depends on previous)

---

## Current Architecture

From existing codebase analysis:

### Character Entity
```typescript
class Character {
  personality: Personality;     // Big Five traits (0-100 scale)
  capacities: Capacities;       // 6 mental abilities (divergentThinking, etc.)
  resources: Resources;         // 9 values (energy, mood, overskudd, etc.)

  // MobX computed properties for modifiers
  get activeModifiers(): ResourceModifier[]
  get effectiveCapacities(): Capacities

  // Actions
  applyTickUpdate(speedMultiplier: number): void  // Passive drain/recovery
}
```

**Current Resources (9 total):**
- Core vitality: energy, socialBattery, stress
- Mental state: overskudd, mood, motivation
- Stability: security, focus, nutrition

### Store Architecture
- **RootStore**: Container with references to all domain stores
- **CharacterStore**: Manages Character entity creation and lifecycle
- **ActivityStore**: Activity queue management and execution
- **SimulationStore**: Tick loop that drives time-based updates

**Data flow:**
```
SimulationStore.tick()
  → Character.applyTickUpdate() (passive drain/recovery)
  → ActivityStore.processTick() (activity effects)
```

---

## Proposed Changes

### 1. Character Entity Restructure

Split `resources` into three interfaces for clarity:

```typescript
// Primary Needs (7) - basic survival/comfort needs
interface PrimaryNeeds {
  hunger: number;      // 0 = starving, 100 = full
  energy: number;      // 0 = exhausted, 100 = energized
  hygiene: number;     // 0 = filthy, 100 = clean
  bladder: number;     // 0 = desperate, 100 = comfortable
  social: number;      // 0 = isolated, 100 = socially satisfied
  fun: number;         // 0 = bored, 100 = entertained
  security: number;    // 0 = unsafe, 100 = secure
}

// Health Stats (1) - long-term wellbeing
interface HealthStats {
  nutrition: number;   // 0 = malnourished, 100 = healthy diet
}

// Action Resources (4) - mental/emotional capacity for activities
interface ActionResources {
  overskudd: number;       // Norwegian: surplus/capacity/headroom
  socialBattery: number;   // Introvert energy for social situations
  focus: number;           // Attention/concentration
  willpower: number;       // Self-discipline/executive function
}

class Character {
  personality: Personality;
  capacities: Capacities;

  // NEW: Split resources into categories
  @observable primaryNeeds: PrimaryNeeds;
  @observable healthStats: HealthStats;
  @observable actionResources: ActionResources;

  // NEW: Derived wellbeing (computed from other values)
  @computed get mood(): number
  @computed get purpose(): number

  // Existing patterns still work
  @computed get activeModifiers(): ResourceModifier[]
  @computed get effectiveCapacities(): Capacities

  @action applyTickUpdate(speedMultiplier: number): void
}
```

**Migration from current Resources:**
- `energy` → `primaryNeeds.energy` (recontextualized as need, not resource)
- `socialBattery` → `actionResources.socialBattery` (unchanged)
- `stress` → REMOVED (inverse of security/mood, redundant)
- `overskudd` → `actionResources.overskudd` (unchanged)
- `mood` → **COMPUTED** property (derived from needs + personality)
- `motivation` → REMOVED (replaced by purpose + willpower)
- `security` → `primaryNeeds.security` (recontextualized as need)
- `focus` → `actionResources.focus` (unchanged)
- `nutrition` → `healthStats.nutrition` (unchanged)
- NEW: `hunger`, `hygiene`, `bladder`, `fun`, `willpower`, `purpose` (computed)

**Why this structure:**
- Primary needs drain predictably (hunger, bladder faster; security slower)
- Action resources are context-dependent (overskudd drains when activities are hard)
- Derived wellbeing reflects overall state (good if needs met, bad if depleted)
- Maintains existing MobX reactivity patterns

---

### 2. Derived Stats Pattern (MobX Computed)

Mood and Purpose are **not stored state**—they're computed from other values.

#### Pattern: Weighted Sum with Personality Modifiers

```typescript
class Character {
  /**
   * Computed: Mood reflects short-term emotional state.
   * Formula: Weighted average of needs + personality modifiers
   * - High needs satisfaction = high mood
   * - Neuroticism trait lowers baseline
   * - Extraversion increases weight of social need
   */
  @computed get mood(): number {
    const { social, fun, hunger, energy, hygiene } = this.primaryNeeds;
    const { neuroticism, extraversion } = this.personality;

    // Base mood: average of key needs (0-100)
    let baseMood = (social + fun + hunger + energy + hygiene) / 5;

    // Personality modifiers
    // High neuroticism (>50) lowers baseline mood
    if (neuroticism > 50) {
      baseMood -= (neuroticism - 50) * 0.3; // Up to -15 at neuroticism=100
    }

    // High extraversion (>50) increases weight of social need
    if (extraversion > 50) {
      const socialBonus = (social - 50) * (extraversion - 50) / 100;
      baseMood += socialBonus * 0.2;
    }

    return clamp(baseMood, 0, 100);
  }

  /**
   * Computed: Purpose reflects sense of meaning/direction.
   * Formula: Based on security + willpower + nutrition (long-term factors)
   * - Security provides foundation
   * - Willpower enables goal pursuit
   * - Nutrition supports sustained effort
   * - Conscientiousness trait increases baseline
   */
  @computed get purpose(): number {
    const { security } = this.primaryNeeds;
    const { willpower } = this.actionResources;
    const { nutrition } = this.healthStats;
    const { conscientiousness, openness } = this.personality;

    // Base purpose: weighted average of foundational factors
    let basePurpose = (security * 0.4 + willpower * 0.4 + nutrition * 0.2);

    // Conscientiousness increases baseline (self-discipline aids purpose)
    if (conscientiousness > 50) {
      basePurpose += (conscientiousness - 50) * 0.2; // Up to +10
    }

    // Openness provides meaning through exploration
    if (openness > 50) {
      basePurpose += (openness - 50) * 0.1; // Up to +5
    }

    return clamp(basePurpose, 0, 100);
  }
}
```

**Pattern benefits:**
- No manual updates needed (MobX recomputes when dependencies change)
- Formulas are transparent and tunable
- UI automatically reflects changes via observer pattern
- Mirrors existing `effectiveCapacities` computed property pattern

**Formula design principles** (from utility AI research):
1. **Weighted sums** for multi-factor stats (mood, purpose)
2. **Threshold bonuses** for personality effects (if trait > 50, apply bonus)
3. **Nonlinear curves** for diminishing returns (e.g., social need matters more when low)
4. **Clamping** to valid range (0-100) to prevent overflow

---

### 3. Autonomous AI System

AI selects activities based on **utility scoring**—each potential activity gets a score representing how useful it is right now, then AI picks highest-scoring option.

#### Pattern: Utility-Based Decision System

**Core concept** (from utility AI research):
> "Utility-based systems work by scoring every possible action at once and choosing one of the top scoring actions. Instead of explicit priorities, the decision system scores each behavior according to what is happening in the world at that moment."

**Implementation location:** `ActivityStore` (already manages activities and queue)

```typescript
class ActivityStore {
  // Existing queue management
  queue = observable.array<Activity>();
  currentActivity: Activity | null = null;

  /**
   * NEW: Autonomous mode flag
   */
  @observable isAutonomous = false;

  /**
   * NEW: AI decision-making - called by SimulationStore.tick()
   */
  @action autonomousDecision(): void {
    if (!this.isAutonomous || this.hasQueuedActivities) return;

    const character = this.root.characterStore.character;
    if (!character) return;

    // Score all available activities
    const activities = this.availableActivities; // Filter by unlocked skills, etc.
    const scores = activities.map(activity => ({
      activity,
      score: this.calculateUtility(activity, character)
    }));

    // Pick highest-scoring activity (with some randomness)
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.filter(s => s.score > 0.3); // Threshold: don't pick bad options

    if (topScores.length > 0) {
      // Pick from top 3 with weighted randomness (90% best, 5% second, 5% third)
      const weights = [0.9, 0.05, 0.05];
      const index = weightedRandom(weights);
      const chosen = topScores[Math.min(index, topScores.length - 1)];

      this.enqueue(chosen.activity);
    }
  }

  /**
   * NEW: Calculate utility score for an activity
   * Returns 0-1 where 1 = extremely useful right now, 0 = not useful
   */
  private calculateUtility(activity: Activity, character: Character): number {
    let utility = 0;

    // Consider 1: Need urgency (addresses critical needs)
    const needUrgency = this.calculateNeedUrgency(activity, character);
    utility += needUrgency * 0.6; // 60% weight

    // Consider 2: Resource availability (can afford to do it)
    const resourceAvailability = this.calculateResourceAvailability(activity, character);
    utility += resourceAvailability * 0.3; // 30% weight

    // Consider 3: Personality fit (character enjoys this type)
    const personalityFit = this.calculatePersonalityFit(activity, character);
    utility += personalityFit * 0.1; // 10% weight

    return clamp(utility, 0, 1);
  }

  /**
   * How urgent are the needs this activity addresses?
   */
  private calculateNeedUrgency(activity: Activity, character: Character): number {
    let maxUrgency = 0;

    for (const [needKey, effect] of Object.entries(activity.resourceEffects)) {
      if (effect <= 0) continue; // Only care about restoring effects

      const currentValue = this.getNeedValue(character, needKey);
      // Urgency increases as need gets lower (inverse relationship)
      const urgency = 1 - (currentValue / 100);

      // Apply response curve: urgent needs are VERY urgent
      const curvedUrgency = Math.pow(urgency, 2); // Square for exponential urgency

      maxUrgency = Math.max(maxUrgency, curvedUrgency);
    }

    return maxUrgency;
  }

  /**
   * Does character have resources to perform this activity?
   */
  private calculateResourceAvailability(activity: Activity, character: Character): number {
    const { overskudd, willpower, focus } = character.actionResources;

    // Need minimum action resources to start
    const minOverskudd = activity.startRequirements?.minOverskudd ?? 20;

    if (overskudd < minOverskudd) return 0; // Can't do it at all

    // Availability scales with how much surplus we have
    const surplus = (overskudd - minOverskudd) / (100 - minOverskudd);

    // Willpower/focus also matter for complex activities
    const avgActionResources = (willpower + focus) / 200;

    return (surplus * 0.7 + avgActionResources * 0.3);
  }

  /**
   * How well does this activity match character's personality?
   */
  private calculatePersonalityFit(activity: Activity, character: Character): number {
    const { personality } = character;

    // Domain-to-personality mapping
    const domainFits: Record<SkillDomain, number> = {
      'social': personality.extraversion / 100,
      'creative': personality.openness / 100,
      'analytical': personality.conscientiousness / 100,
      'physical': (100 - personality.neuroticism) / 100, // Low neuroticism = comfort with physical
      'organisational': personality.conscientiousness / 100,
    };

    return domainFits[activity.domain] ?? 0.5;
  }

  private getNeedValue(character: Character, key: string): number {
    // Helper to access needs across categories
    if (key in character.primaryNeeds) return character.primaryNeeds[key];
    if (key in character.actionResources) return character.actionResources[key];
    if (key in character.healthStats) return character.healthStats[key];
    return 50; // Default neutral
  }
}
```

**Integration with SimulationStore:**
```typescript
// In SimulationStore.tick()
tick(): void {
  this.tickCount += 1;

  // 1. Passive character updates (existing)
  for (const char of this.root.characterStore.allCharacters) {
    char.applyTickUpdate(this.speed);
  }

  // 2. Process activity queue (existing)
  this.root.activityStore.processTick(this.speed);

  // 3. NEW: Autonomous decision (if no queue and autonomous mode)
  this.root.activityStore.autonomousDecision();
}
```

**Why utility-based AI:**
- **Adaptive:** Responds dynamically to character state (hungry → picks eating)
- **Transparent:** Easy to debug/tune by adjusting weights
- **Personality-aware:** Different characters make different choices
- **Proven pattern:** Used in The Sims, FEAR AI, other life sims

**Alternative considered:** Behavior trees (hierarchical if-then). **Rejected because:** More rigid, harder to balance competing needs, requires explicit priority ordering.

---

### 4. New/Modified Stores

**No new stores needed.** Logic distributes across existing stores:

| Store | New Responsibilities |
|-------|---------------------|
| **Character** | Computed properties for mood/purpose, extended resource categories |
| **ActivityStore** | Utility scoring, autonomous decision method |
| **SimulationStore** | Call autonomousDecision() in tick loop |
| **CharacterStore** | No changes (just creates Character instances) |

**Why no NeedsStore/AIStore:**
- Needs are Character properties (belongs to entity)
- AI decisions are about activity selection (belongs to ActivityStore)
- Derived stats are computed from Character state (computed properties, not separate state)

---

## Build Order

Dependencies between components dictate sequence:

### Phase 1: Primary Needs Foundation
**No dependencies** - can build standalone

1. **Update Types** (.planning/research/types.ts)
   - Define PrimaryNeeds, HealthStats, ActionResources interfaces
   - Update CharacterData to use new structure
   - Add migration utilities for existing Resources → new structure

2. **Restructure Character Entity**
   - Split `resources` into `primaryNeeds`, `healthStats`, `actionResources`
   - Update drain/recovery rates constants (BASE_DRAIN_RATES, BASE_RECOVERY_RATES)
   - Maintain existing MobX patterns (makeAutoObservable, actions, computed)

3. **Update Passive Tick Updates**
   - Modify `Character.applyTickUpdate()` to handle new categories
   - Adjust drain formulas per need type (hunger drains fast, security slow)

4. **UI: Needs Display Panel**
   - Component showing 7 primary needs as progress bars
   - Color-coded by urgency (green >70, yellow 40-70, red <40)
   - Replace old Resources display

**Deliverable:** Character has primary needs that drain/recover, UI displays them

---

### Phase 2: Derived Wellbeing Stats
**Depends on:** Phase 1 (primary needs exist)

5. **Add Computed Properties to Character**
   - Implement `get mood()` formula (needs + personality)
   - Implement `get purpose()` formula (security + willpower + nutrition)
   - Test that computed values update when dependencies change

6. **Update UI to Display Derived Stats**
   - Mood/Purpose indicators (separate from needs)
   - Show formula breakdown on hover (tooltips explaining calculation)
   - Visual differentiation (icon, position) from primary needs

7. **Tune Formulas**
   - Playtest to validate mood/purpose feel right
   - Adjust weights, personality modifiers as needed
   - Document final formulas in code comments

**Deliverable:** Mood and Purpose automatically reflect character state

---

### Phase 3: Autonomous AI Decision System
**Depends on:** Phases 1-2 (needs + derived stats drive decisions)

8. **Implement Utility Scoring in ActivityStore**
   - Add `calculateUtility()` method
   - Implement need urgency, resource availability, personality fit considerations
   - Add response curves (e.g., urgency squared for criticality)

9. **Add Autonomous Decision Logic**
   - `autonomousDecision()` method in ActivityStore
   - Scoring all activities, picking highest utility
   - Integration with SimulationStore.tick()

10. **Add Autonomous Toggle UI**
    - Button to enable/disable autonomous mode
    - Visual indicator when AI is controlling character
    - Manual queue overrides autonomous (player control takes precedence)

11. **Tune AI Behavior**
    - Adjust consideration weights (need urgency vs resource availability)
    - Test personality differentiation (introvert avoids social, etc.)
    - Add variety/randomness to prevent repetitive loops

**Deliverable:** Character autonomously selects activities based on needs and personality

---

### Phase 4: Polish and Balance
**Depends on:** All previous phases

12. **Formula Refinement**
    - Response curves for needs (linear, quadratic, sigmoid?)
    - Personality modifier strengths
    - Action resource drain rates during activities

13. **Debug Tools**
    - Overlay showing current utility scores for all activities
    - Logs explaining AI decision rationale ("Picked Sleep because energy=15, urgency=0.9")
    - Manual need adjustment sliders for testing

14. **Documentation**
    - Code comments explaining formulas
    - Design doc for how to add new needs/derived stats
    - Balancing guide for weights and thresholds

**Deliverable:** System is tunable, debuggable, documented

---

## Integration Points

Where new code touches existing code:

### 1. Character.ts
**Changes:**
- Split `resources` field into three new interfaces
- Add computed properties `mood`, `purpose`
- Update `applyTickUpdate()` for new resource categories
- Adjust `activeModifiers` to reference new structure

**Risk:** Breaking existing Activity resource effects. **Mitigation:** Migration script + comprehensive tests.

### 2. ActivityStore.ts
**Changes:**
- Add `isAutonomous` flag
- Add `calculateUtility()` and `autonomousDecision()` methods
- Extend `processTick()` to call autonomous decision

**Risk:** None (additive changes, no existing code modified)

### 3. SimulationStore.ts
**Changes:**
- Add `autonomousDecision()` call in `tick()` method

**Risk:** None (single line addition)

### 4. Activity Entity
**Changes:**
- Update `resourceEffects` to reference new need keys (hunger, hygiene, etc.)
- Add metadata for AI scoring (e.g., `addressesNeeds: ['hunger', 'hygiene']`)

**Risk:** Data migration for existing activities. **Mitigation:** Update seed data in data/activities.ts.

### 5. UI Components
**Changes:**
- New ResourcesPanel component with categorized needs
- DerivedStatsDisplay component for mood/purpose
- AutonomousToggle component

**Risk:** None (new components, not modifying existing)

---

## Response Curves and Considerations

Pattern from utility AI research:

> "The real art of building a character's AI lies in selecting considerations and pairing them with appropriate response curves."

### Response Curve Types

```typescript
// Linear: 1:1 mapping (value = score)
function linear(value: number): number {
  return value;
}

// Quadratic: Emphasizes extremes (low values become VERY urgent)
function quadratic(value: number): number {
  return Math.pow(value, 2);
}

// Inverse quadratic: High values become VERY important
function inverseQuadratic(value: number): number {
  return 1 - Math.pow(1 - value, 2);
}

// Sigmoid: S-curve (smooth threshold around midpoint)
function sigmoid(value: number, steepness = 10): number {
  return 1 / (1 + Math.exp(-steepness * (value - 0.5)));
}
```

**Usage in utility scoring:**
```typescript
// Critical needs (hunger, bladder) use quadratic for urgency
const hungerUrgency = quadratic(1 - hunger / 100);

// Optional needs (fun) use linear
const funUrgency = linear(1 - fun / 100);

// Threshold-based needs (security) use sigmoid
const securityUrgency = sigmoid((100 - security) / 100);
```

---

## Formula Design Principles

From existing codebase and utility AI research:

### 1. Normalize All Inputs (0-1 scale)
```typescript
// Convert 0-100 needs to 0-1 for calculations
const normalizedHunger = hunger / 100;
```

### 2. Use Weighted Sums for Multi-Factor Stats
```typescript
// Mood = weighted average, not simple average
const mood = (social * 0.3 + fun * 0.3 + energy * 0.2 + hygiene * 0.2);
```

### 3. Apply Personality as Modifiers, Not Multipliers
```typescript
// GOOD: Additive modifier
baseMood += (extraversion - 50) * 0.2;

// BAD: Multiplicative modifier (creates exponential effects)
baseMood *= (extraversion / 50);
```

### 4. Clamp Final Values
```typescript
// Always clamp to valid range
return clamp(finalValue, 0, 100);
```

### 5. Use Thresholds for Personality Effects
```typescript
// Only apply if trait > 50 (avoid noise from neutral traits)
if (neuroticism > 50) {
  baseMood -= (neuroticism - 50) * 0.3;
}
```

---

## Anti-Patterns to Avoid

### 1. Storing Derived State
**Bad:**
```typescript
class Character {
  @observable mood: number = 50; // Manually updated mood

  updateMood(): void {
    // Recalculate mood from needs
    this.mood = (this.hunger + this.energy) / 2;
  }
}
```

**Good:**
```typescript
class Character {
  @computed get mood(): number {
    // Auto-updates when dependencies change
    return (this.hunger + this.energy) / 2;
  }
}
```

**Why:** Computed properties guarantee consistency, no manual sync needed.

---

### 2. Magic Numbers in Formulas
**Bad:**
```typescript
get mood() {
  return this.social * 0.37 + this.fun * 0.24 + this.energy * 0.39;
}
```

**Good:**
```typescript
// Constants with explanations
const MOOD_WEIGHTS = {
  social: 0.3,   // Social connection strongly affects mood
  fun: 0.2,      // Entertainment has moderate impact
  energy: 0.2,   // Physical state affects emotions
  hygiene: 0.15, // Cleanliness affects self-perception
  hunger: 0.15,  // Basic comfort matters
};

get mood() {
  const { social, fun, energy, hygiene, hunger } = this.primaryNeeds;
  return (
    social * MOOD_WEIGHTS.social +
    fun * MOOD_WEIGHTS.fun +
    energy * MOOD_WEIGHTS.energy +
    hygiene * MOOD_WEIGHTS.hygiene +
    hunger * MOOD_WEIGHTS.hunger
  );
}
```

**Why:** Tunable, self-documenting, values sum to 1.0 for clarity.

---

### 3. Complex Branching in Utility Scoring
**Bad:**
```typescript
calculateUtility(activity: Activity): number {
  if (character.hunger < 30 && activity.id === 'eat') return 1.0;
  else if (character.energy < 20 && activity.id === 'sleep') return 0.9;
  else if (character.social < 40 && activity.domain === 'social') return 0.8;
  // ... 20 more conditions
}
```

**Good:**
```typescript
calculateUtility(activity: Activity): number {
  // Weighted sum of independent considerations
  const needUrgency = this.calculateNeedUrgency(activity);
  const resourceAvailability = this.calculateResourceAvailability(activity);
  const personalityFit = this.calculatePersonalityFit(activity);

  return (
    needUrgency * 0.6 +
    resourceAvailability * 0.3 +
    personalityFit * 0.1
  );
}
```

**Why:** Scalable, tunable, each consideration is independent and testable.

---

### 4. Ignoring Disqualifiers
**Bad:**
```typescript
// Scores activity even when impossible to perform
const score = calculateUtility(activity);
enqueue(activity); // Might fail when trying to start!
```

**Good:**
```typescript
const score = calculateUtility(activity);

// Zero score disqualifies immediately (from utility AI research)
if (score < 0.3) return; // Threshold: don't pick bad options

// Check start requirements before queuing
const check = canStartActivity(activity);
if (!check.canStart) return;

enqueue(activity);
```

**Why:** Prevents AI from making impossible decisions.

---

## Unreal Engine Portability Notes

The proposed architecture maintains portability:

### Character Derived Stats
**MobX pattern:**
```typescript
class Character {
  @computed get mood(): number {
    return this.calculateMood();
  }
}
```

**Unreal C++ equivalent:**
```cpp
UCLASS()
class UCharacter : public UObject {
public:
  UFUNCTION(BlueprintPure, Category = "Wellbeing")
  float GetMood() const {
    return CalculateMood();
  }

private:
  float CalculateMood() const {
    // Same formula logic as TS version
    return (PrimaryNeeds.Social + PrimaryNeeds.Fun) / 2.0f;
  }
};
```

**Transfer:** Direct 1:1 mapping. Computed properties → BlueprintPure functions.

---

### Utility AI Scoring
**MobX pattern:**
```typescript
class ActivityStore {
  calculateUtility(activity: Activity): number {
    // Weighted sum of considerations
  }
}
```

**Unreal C++ equivalent:**
```cpp
UCLASS()
class UActivitySubsystem : public UGameInstanceSubsystem {
public:
  UFUNCTION(BlueprintCallable)
  float CalculateUtility(UActivity* Activity) {
    // Same weighted sum logic
  }
};
```

**Transfer:** Direct. Utility calculations are pure functions, no platform-specific logic.

---

### Resource Categories
**MobX pattern:**
```typescript
class Character {
  primaryNeeds: PrimaryNeeds;
  actionResources: ActionResources;
}
```

**Unreal C++ equivalent:**
```cpp
USTRUCT(BlueprintType)
struct FPrimaryNeeds {
  UPROPERTY(EditAnywhere, BlueprintReadWrite)
  float Hunger = 100.0f;

  UPROPERTY(EditAnywhere, BlueprintReadWrite)
  float Energy = 100.0f;
  // ...
};

UCLASS()
class UCharacter : public UObject {
  UPROPERTY(EditAnywhere, BlueprintReadWrite)
  FPrimaryNeeds PrimaryNeeds;

  UPROPERTY(EditAnywhere, BlueprintReadWrite)
  FActionResources ActionResources;
};
```

**Transfer:** Interfaces become USTRUCTs. Observable properties → UPROPERTY.

---

## Tuning and Debug Tools

### Utility Score Debugger (UI Overlay)

```typescript
// Component for development/testing
const UtilityDebugger = observer(() => {
  const { activityStore, characterStore } = useRootStore();
  const character = characterStore.character;

  if (!character) return null;

  const activities = activityStore.availableActivities;
  const scores = activities.map(activity => ({
    name: activity.name,
    score: activityStore.calculateUtility(activity, character),
    breakdown: {
      needUrgency: activityStore.calculateNeedUrgency(activity, character),
      resourceAvail: activityStore.calculateResourceAvailability(activity, character),
      personalityFit: activityStore.calculatePersonalityFit(activity, character),
    }
  }));

  scores.sort((a, b) => b.score - a.score);

  return (
    <div className="utility-debugger">
      <h3>AI Decision Scores</h3>
      {scores.map(s => (
        <div key={s.name}>
          <strong>{s.name}</strong>: {s.score.toFixed(2)}
          <ul>
            <li>Need Urgency: {s.breakdown.needUrgency.toFixed(2)} (60%)</li>
            <li>Resource Avail: {s.breakdown.resourceAvail.toFixed(2)} (30%)</li>
            <li>Personality Fit: {s.breakdown.personalityFit.toFixed(2)} (10%)</li>
          </ul>
        </div>
      ))}
    </div>
  );
});
```

**Use:** Toggle overlay during playtesting to see why AI makes certain choices.

---

### Need Adjustment Panel (Testing Tool)

```typescript
const NeedAdjuster = observer(() => {
  const { characterStore } = useRootStore();
  const character = characterStore.character;

  if (!character) return null;

  return (
    <div className="need-adjuster">
      <h3>Manual Need Adjustment (Dev Tool)</h3>
      {Object.entries(character.primaryNeeds).map(([key, value]) => (
        <label key={key}>
          {key}: {value}
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => {
              character.primaryNeeds[key] = parseInt(e.target.value);
            }}
          />
        </label>
      ))}
    </div>
  );
});
```

**Use:** Quickly test edge cases (what happens when hunger = 0? energy = 100?)

---

## Sources

### HIGH Confidence (Official Documentation & Verified Patterns)

**MobX Computed Properties:**
- [MobX: Deriving information with computeds](https://mobx.js.org/computeds.html) - Official pattern for derived values
- [MobX: The gist of MobX](https://mobx.js.org/the-gist-of-mobx.html) - Core principle: "Find the smallest amount of state you need, and derive all the other things"
- [Adding Computed Values to MobX Observable Classes | Medium](https://medium.com/dataseries/adding-computed-values-to-mobx-observable-classes-1e3b01a93ebd) - Class-based implementation

**Utility AI Architecture:**
- [Utility system - Wikipedia](https://en.wikipedia.org/wiki/Utility_system) - The Sims' utility AI with personality integration
- [Design Patterns for the Configuration of Utility-Based AI](https://course.ccs.neu.edu/cs5150f13/readings/dill_designpatterns.pdf) - Response curves, considerations pattern
- [An Introduction to Utility Theory - Game AI Pro](http://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf) - David "Rez" Graham (Sims AI programmer)
- [Choosing Effective Utility-Based Considerations - Game AI Pro 3](http://www.gameaipro.com/GameAIPro3/GameAIPro3_Chapter13_Choosing_Effective_Utility-Based_Considerations.pdf) - Mike Lewis on consideration design

**Existing Codebase:**
- Character.ts: activeModifiers computed property, applyTickUpdate pattern
- ActivityStore.ts: Queue management, processTick integration
- SimulationStore.ts: Tick loop architecture

### MEDIUM Confidence (Community Patterns & Recent Research)

**AI Decision Making:**
- [The Art of Building Worlds: AI-Powered Life Simulation | Medium](https://medium.com/@gianlucabailo/the-art-of-building-worlds-a-deep-dive-into-ai-powered-life-simulation-fdf62cc0ba60) - LLM-powered agents with contextual reasoning, personality archetypes
- [Game AI Planning: GOAP, Utility, and Behavior Trees](https://tonogameconsultants.com/game-ai-planning/) - Comparison of decision-making architectures

**Sims Autonomy Research:**
- [Deeper Social Autonomy - Sims 4 Mod](https://www.curseforge.com/sims4/mods/deeper-social-autonomy) - Community research on improving needs-based autonomy (moods, traits, preferences affect decisions)
- [An Introduction to Utility AI - The Shaggy Dev](https://shaggydev.com/2023/04/19/utility-ai/) - Practical implementation guide

### Supporting Sources (Context & Background)

- [MobX Recipes: Use computed.struct for computed objects](https://alexhisen.gitbook.io/mobx-recipes/use-computedstruct-for-computed-objects) - Structural comparison for complex derived objects
- [Decision-making AI in digital games (Academic)](https://www.diva-portal.org/smash/get/diva2:1673140/FULLTEXT01.pdf) - Survey of game AI techniques
- [AI 101: Introducing Utility AI - AI and Games](https://www.aiandgames.com/p/ai-101-introducing-utility-ai) - Educational overview

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Character restructure | **HIGH** | Follows existing MobX patterns in codebase, clear migration path |
| Derived stats pattern | **HIGH** | MobX computed properties are official pattern, formula design is standard |
| Utility AI architecture | **HIGH** | Proven pattern in life sims (The Sims), research papers from industry experts |
| Build order | **HIGH** | Clear dependency chain, each phase builds on previous |
| Unreal portability | **HIGH** | Computed → BlueprintPure, utility scoring → pure functions, direct mapping |
| Formula specifics | **MEDIUM** | Weights and curves need playtesting, but structure is sound |

---

**Researched:** 2026-01-23
**Valid until:** Stable patterns, no fast-moving dependencies. Formulas will need tuning during implementation.
