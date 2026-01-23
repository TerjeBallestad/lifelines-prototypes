# Phase 9: Action Resources - Research

**Researched:** 2026-01-23
**Domain:** MobX computed values, equilibrium-pull regeneration, resource gating
**Confidence:** HIGH

## Summary

This phase implements four action resources (Overskudd, socialBattery, Focus, Willpower) that gate activity affordability. The implementation follows the established v1.1 pattern: MobX computed values for derivation, SmoothedValue for temporal smoothing, and centralized balance config for tuning constants.

The key insight from The Sims design is that action resources should feel organic through equilibrium-pull regeneration. Rather than linear regen, values asymptotically approach their target (computed from Mood, Energy, Purpose, personality), creating natural-feeling dynamics where depleted resources recover quickly at first then slow as they approach full.

The existing codebase already has the foundational patterns: `SmoothedValue` for EMA smoothing, `needToMoodCurve` for sigmoid transforms, `asymptoticClamp` for soft bounds, and the Character class pattern of computed getters plus tick-based updates. This phase extends these patterns to four new action resources.

**Primary recommendation:** Implement action resources as computed getters for targets, with tick-based equilibrium-pull updates using the existing SmoothedValue/exponential approach pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Computed values, observable state | Already in use, reactive derivation |
| mobx-react-lite | 4.1.1 | React observer components | Already in use |
| Sonner | 2.0.7 | Toast notifications | Already in use for activity feedback |
| DaisyUI | 5.5.14 | UI components (progress, tooltip) | Already in use for needs/stats display |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SmoothedValue (internal) | - | Exponential moving average | Temporal smoothing for all action resources |
| balance.ts (internal) | - | Centralized tuning constants | All regen rates, weights, thresholds |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SmoothedValue EMA | Raw lerp per tick | SmoothedValue already proven, encapsulates state |
| Computed getters | Direct state mutation | Computed is MobX idiom, automatic dependency tracking |

**Installation:**
```bash
# No new dependencies - all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   └── types.ts           # Add ActionResources interface
├── config/
│   └── balance.ts         # Add ActionResourcesConfig
├── entities/
│   └── Character.ts       # Add computed targets + tick updates
├── components/
│   ├── ActionResourcesSection.tsx  # New: displays 4 action resources
│   └── NeedsPanel.tsx              # Integrate ActionResourcesSection
└── stores/
    └── ActivityStore.ts   # Update canStartActivity for resource gating
```

### Pattern 1: Equilibrium-Pull Regeneration
**What:** Resources approach a computed target asymptotically rather than via linear regen
**When to use:** All action resources (Overskudd, socialBattery, Focus, Willpower)
**Example:**
```typescript
// Source: Existing SmoothedValue pattern + exponential approach
// Target is computed from Mood, Energy, Purpose, personality
get overskuddTarget(): number {
  if (!this.derivedStats) return 50;
  const { mood, purpose } = this.derivedStats;
  const energy = this.needs?.energy ?? 50;

  // Weighted average: Mood 40%, Energy 35%, Purpose 25%
  const base = mood * 0.4 + energy * 0.35 + purpose * 0.25;

  // Willpower affects regen RATE, not target directly
  return Math.min(100, Math.max(0, base));
}

// In applyActionResourcesUpdate():
if (this.overskuddSmoother) {
  const target = this.overskuddTarget;
  const willpowerFactor = (this.actionResources?.willpower ?? 50) / 100;
  const effectiveAlpha = config.overskuddAlpha * (0.5 + willpowerFactor * 0.5);
  this.overskuddSmoother.setAlpha(effectiveAlpha);
  this.actionResources.overskudd = this.overskuddSmoother.update(target);
}
```

### Pattern 2: Personality-Inverted Resource (socialBattery)
**What:** Resource drain/charge direction inverts based on Extraversion
**When to use:** socialBattery specifically
**Example:**
```typescript
// Source: 09-CONTEXT.md decisions
// Social context taxonomy: Solo (0), Social (1), Intense (2)
type SocialContext = 0 | 1 | 2;

// In applyActionResourcesUpdate():
const extraversion = this.personality.extraversion;
const context = this.currentSocialContext; // From activity or default

// Neutral zone: Extraversion 40-60 has slow drain/charge in both directions
const isAmbivert = extraversion >= 40 && extraversion <= 60;

if (isAmbivert) {
  // Slow drain regardless of context
  drainRate = config.ambivertDrainRate;
} else if (extraversion > 60) {
  // Extrovert: charges in social, drains solo
  drainRate = context > 0 ? -config.extrovertChargeRate : config.extrovertDrainRate;
} else {
  // Introvert: drains in social, charges solo
  drainRate = context > 0 ? config.introvertDrainRate : -config.introvertChargeRate;
}
```

### Pattern 3: Activity-Consumption Resource (Focus, Willpower)
**What:** Resource depleted by specific activity types, not passive decay
**When to use:** Focus (concentration activities) and Willpower (difficult tasks, decisions)
**Example:**
```typescript
// Focus: only concentration activities deplete it
// Willpower: difficult tasks AND decision-making deplete it
// Both regenerate via rest activities + passive equilibrium pull

// In ActivityStore.applyResourceEffects():
if (activity.requiresConcentration) {
  character.spendFocus(config.focusCostPerTick * speedMultiplier);
}
if (activity.difficulty > 0) {
  character.spendWillpower(activity.difficulty * config.willpowerCostMultiplier);
}

// In Character.applyActionResourcesUpdate():
// Focus: equilibrium pull toward rest-based target
// Willpower: equilibrium pull + Fun activities boost target
```

### Pattern 4: Soft Block at Zero
**What:** Zero resource makes activities expensive, not impossible
**When to use:** socialBattery at zero
**Example:**
```typescript
// Source: 09-CONTEXT.md decision - soft block
// In ActivityStore.canStartActivity():
if (character.actionResources.socialBattery <= 0 && activity.socialContext > 0) {
  // Soft block: require extra Willpower instead of blocking
  const extraWillpowerCost = config.zeroSocialBatteryWillpowerPenalty;
  if (character.actionResources.willpower < extraWillpowerCost) {
    return {
      canStart: false,
      reason: `${character.name} needs ${extraWillpowerCost} Willpower to push through social exhaustion`,
    };
  }
}
```

### Anti-Patterns to Avoid
- **Linear regeneration:** Use equilibrium-pull (EMA) instead - feels more organic
- **Hard caps at zero:** Use soft blocks with Willpower costs instead
- **Computing resources in components:** Keep in Character entity as computed getters
- **Separate smoother instances per resource:** Initialize all smoothers together in initializeActionResources()

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Temporal smoothing | Custom lerp per tick | SmoothedValue class | Encapsulates state, handles alpha changes |
| Toast notifications | Custom toast component | Sonner toast() | Already integrated, consistent styling |
| Progress bar display | Custom div styling | DaisyUI progress | Consistent with existing NeedsPanel |
| Tooltip hover | Custom hover state | DaisyUI tooltip | Already used in DerivedStatsSection |

**Key insight:** The v1.1 needs/wellbeing system already established all the patterns needed. This phase extends them rather than inventing new ones.

## Common Pitfalls

### Pitfall 1: Forgetting to Initialize Smoothers
**What goes wrong:** Action resources jump erratically because SmoothedValue not created
**Why it happens:** Missing initializeActionResources() call or not calling after initializeDerivedStats()
**How to avoid:** Chain initialization: initializeNeeds() -> initializeDerivedStats() -> initializeActionResources()
**Warning signs:** Resources snap to target instead of smoothly approaching

### Pitfall 2: Willpower Affecting Overskudd Value Instead of Rate
**What goes wrong:** Low Willpower directly reduces Overskudd target, creating feedback loop
**Why it happens:** CONTEXT.md specifies "Willpower affects regen rate, not value directly"
**How to avoid:** Use Willpower to modify smoother alpha, not target computation
**Warning signs:** Willpower and Overskudd always at same level

### Pitfall 3: Hard Block on Zero Resources
**What goes wrong:** Player can't do anything when socialBattery hits zero
**Why it happens:** Using canStart: false instead of soft block with Willpower cost
**How to avoid:** socialBattery zero = social activities cost extra Willpower, not blocked
**Warning signs:** Character stuck unable to do social activities despite having Willpower

### Pitfall 4: Not Distinguishing Activity Social Context
**What goes wrong:** All activities treated same for socialBattery
**Why it happens:** Missing social context classification on activities
**How to avoid:** Tag activities with SocialContext (0=Solo, 1=Social, 2=Intense)
**Warning signs:** Introverts drain socialBattery doing solo hobbies

### Pitfall 5: Toast Spam on Resource Checks
**What goes wrong:** Multiple toasts per second during simulation
**Why it happens:** Showing toast on every canStartActivity check, not just execution failures
**How to avoid:** Toast only when activity actually fails at execution time, not on preview
**Warning signs:** Toast pile-up, UI unusable

## Code Examples

Verified patterns from existing codebase:

### ActionResources Interface (types.ts)
```typescript
// Source: Pattern matches existing DerivedStats interface
export interface ActionResources {
  overskudd: number;      // Computed from Mood + Energy + Purpose
  socialBattery: number;  // Personality-inverted based on Extraversion
  focus: number;          // Depleted by concentration activities
  willpower: number;      // Depleted by difficult tasks + decisions
}

export function defaultActionResources(): ActionResources {
  return {
    overskudd: 70,      // Start moderate, will adjust to computed target
    socialBattery: 70,  // Start moderate
    focus: 100,         // Start full
    willpower: 80,      // Start high
  };
}
```

### ActionResourcesConfig (balance.ts)
```typescript
// Source: Pattern matches existing DerivedStatsConfig
export interface ActionResourcesConfig {
  // Overskudd
  overskuddAlpha: number;           // Smoothing alpha (0.1 = moderate)
  overskuddMoodWeight: number;      // Weight for Mood in target (0.4)
  overskuddEnergyWeight: number;    // Weight for Energy in target (0.35)
  overskuddPurposeWeight: number;   // Weight for Purpose in target (0.25)

  // socialBattery
  socialBatteryAlpha: number;       // Smoothing alpha
  introvertDrainRate: number;       // Drain per tick in social (0.5)
  introvertChargeRate: number;      // Charge per tick solo (0.3)
  extrovertDrainRate: number;       // Drain per tick solo (0.4)
  extrovertChargeRate: number;      // Charge per tick social (0.4)
  ambivertDrainRate: number;        // Slow drain both contexts (0.1)
  zeroSocialBatteryWillpowerCost: number; // Extra cost at zero (20)

  // Focus
  focusAlpha: number;               // Smoothing alpha
  focusRegenRate: number;           // Passive regen per tick
  focusCostPerTick: number;         // Cost during concentration

  // Willpower
  willpowerAlpha: number;           // Smoothing alpha
  willpowerRegenRate: number;       // Passive regen per tick
  willpowerFunBoost: number;        // Extra regen during Fun activities
  willpowerDecisionCost: number;    // Cost per decision
}
```

### Computed Target Pattern (Character.ts)
```typescript
// Source: Matches existing computedMoodTarget pattern
get overskuddTarget(): number {
  if (!this.derivedStats || !this.needs || !this.root?.balanceConfig) return 50;

  const config = this.root.balanceConfig.actionResourcesConfig;
  const { mood, purpose } = this.derivedStats;
  const energy = this.needs.energy;

  // Weighted sum of inputs
  const target =
    mood * config.overskuddMoodWeight +
    energy * config.overskuddEnergyWeight +
    purpose * config.overskuddPurposeWeight;

  return Math.min(100, Math.max(0, target));
}

get overskuddBreakdown(): StatBreakdown {
  if (!this.derivedStats || !this.needs || !this.root?.balanceConfig) {
    return { total: 50, contributions: [] };
  }

  const config = this.root.balanceConfig.actionResourcesConfig;
  const { mood, purpose } = this.derivedStats;
  const energy = this.needs.energy;

  return {
    total: Math.round(this.actionResources?.overskudd ?? 50),
    contributions: [
      { source: 'Mood', value: Math.round(mood * config.overskuddMoodWeight) },
      { source: 'Energy', value: Math.round(energy * config.overskuddEnergyWeight) },
      { source: 'Purpose', value: Math.round(purpose * config.overskuddPurposeWeight) },
    ],
  };
}
```

### Activity Failure Toast (ActivityStore.ts)
```typescript
// Source: Existing toast pattern in ActivityStore
// Called at execution time, not selection time
if (character.actionResources.overskudd < activity.overskuddCost) {
  toast.error(`Cannot start: ${activity.name}`, {
    description: `Needs ${activity.overskuddCost} Overskudd, you have ${Math.round(character.actionResources.overskudd)}`,
    duration: 4000,
  });
  this.dequeue();
  return;
}
```

### ActionResourcesSection Component Pattern
```typescript
// Source: Matches DerivedStatsSection structure
interface ActionResourcesSectionProps {
  actionResources: ActionResources;
  overskuddBreakdown: StatBreakdown;
  socialBatteryBreakdown: StatBreakdown;
  // ...other breakdowns
}

export const ActionResourcesSection = observer(function ActionResourcesSection({
  actionResources,
  overskuddBreakdown,
  socialBatteryBreakdown,
}: ActionResourcesSectionProps) {
  return (
    <div className="border-t border-base-300 pt-4 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-base-content/70 mb-3">
        Action Resources
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <ActionResourceBar
          label="Overskudd"
          value={actionResources.overskudd}
          breakdown={overskuddBreakdown}
          color="primary"
        />
        {/* ... other resources */}
      </div>
    </div>
  );
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linear regen | Equilibrium-pull (EMA) | Phase 8 | Smoother, more organic feel |
| Hard resource blocks | Soft blocks with Willpower cost | Phase 9 design | Player agency preserved |
| Resources in v1.0 Resources type | Separate ActionResources type | Phase 9 | Clear separation of concerns |

**Deprecated/outdated:**
- v1.0 Resources.overskudd: Will be replaced by computed ActionResources.overskudd
- BASE_DRAIN_RATES for overskudd: Replaced by equilibrium-pull pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Exact formula weights for Overskudd**
   - What we know: Mood + Energy + Purpose inputs, weighted average
   - What's unclear: Optimal weights (0.4/0.35/0.25 is starting point)
   - Recommendation: Start with equal weights, tune in Phase 12

2. **Social context of existing activities**
   - What we know: Need to tag activities as Solo/Social/Intense
   - What's unclear: Which existing activities are social vs solo
   - Recommendation: Add socialContext field to ActivityData, default to Solo (0)

3. **Focus vs Willpower boundary**
   - What we know: Focus for concentration, Willpower for difficulty
   - What's unclear: Some activities might require both
   - Recommendation: Allow activities to cost both, tune ratios per activity

## Sources

### Primary (HIGH confidence)
- Existing codebase: Character.ts, balance.ts, SmoothedValue.ts, curves.ts
- 09-CONTEXT.md: User decisions on resource behavior

### Secondary (MEDIUM confidence)
- [MobX Computed Values](https://mobx.js.org/computeds.html) - Official docs on computed derivation
- [Sonner Documentation](https://sonner.emilkowal.ski/) - Toast API reference
- [Exponential Decay in Game Design](https://blog.nerdbucket.com/diminishing-returns-in-game-design-exponential-decay-and-convergent-series/article) - Formula patterns
- [GMTK - The Genius AI Behind The Sims](https://gmtk.substack.com/p/the-genius-ai-behind-the-sims) - Motives system design

### Tertiary (LOW confidence)
- [Spring-Roll-Call](https://theorangeduck.com/page/spring-roll-call) - Damper/lerp approach patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Extends existing patterns from Phase 7/8
- Pitfalls: HIGH - Based on existing codebase patterns and CONTEXT.md constraints

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable domain)
