# Phase 10: Activity-Need Integration - Research

**Researched:** 2026-01-23
**Domain:** Activity system mechanics, personality-based modifiers, progressive restoration, UI feedback
**Confidence:** HIGH

## Summary

This phase integrates activities with the needs system, implementing gradual restoration during execution, resource costs scaled by difficulty, and personality alignment modifiers. The existing codebase already has strong foundations: the Activity class tracks difficulty and mastery, the Character class has needs and action resources with personality modifiers, and the ActivityStore handles execution and resource effects.

The standard approach for this domain combines per-tick resource effects (already implemented) with personality-based modifiers (pattern exists in Character.activeModifiers), difficulty-to-cost mapping (straightforward linear scaling), and floating feedback UI (custom implementation using existing libraries). Research on personality-game mechanics integration confirms that Big Five traits significantly affect player behavior and satisfaction, supporting the decision to modify both costs and gains based on alignment.

Key architectural decisions are locked via CONTEXT.md: gradual restoration during activity, linear difficulty-to-cost mapping (1:1), no minimum cost floor, and 25-40% personality modifier strength. This phase extends existing patterns rather than introducing new paradigms.

**Primary recommendation:** Extend Activity.resourceEffects calculation with personality alignment multipliers, add per-tick need restoration to ActivityStore.applyResourceEffects, implement floating number animations using custom components with CSS transitions, and surface personality fit in ActivityCard tooltips.

## Standard Stack

The project already uses a well-established stack for this phase's requirements.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Reactive state management | Already used throughout project, handles computed values and reactivity for personality modifiers |
| React | 19.2.0 | UI framework | Latest version, already in use, handles component lifecycle for feedback animations |
| TypeScript | 5.9.3 | Type safety | Already configured, ensures type-safe personality trait mappings and resource calculations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sonner | 2.0.7 | Toast notifications | Already used for activity completion summaries, supports rich content |
| clsx | 2.1.1 | Conditional classes | Already in project, useful for personality-based styling indicators |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom floating numbers | react-spring / Framer Motion | Animation libraries add 50-100KB bundle size; custom CSS transitions are sufficient for simple float-up-and-fade effects |
| Sonner toasts | Custom modal | Toast library provides positioning, stacking, and timing out-of-box; already integrated |

**Installation:**
```bash
# No new dependencies required
# All needed libraries already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Activity.ts           # Add personality alignment calculations
│   └── Character.ts          # Already has personality modifiers pattern
├── stores/
│   └── ActivityStore.ts      # Extend applyResourceEffects for needs
├── components/
│   ├── ActivityCard.tsx      # Add personality fit tooltip
│   ├── FloatingNumber.tsx    # NEW: Floating feedback component
│   └── ActivityFeedback.tsx  # NEW: Completion summary
└── utils/
    └── personalityFit.ts     # NEW: Alignment calculation utilities
```

### Pattern 1: Personality Alignment Calculation
**What:** Calculate cost/gain modifiers based on Big Five trait alignment with activity characteristics
**When to use:** Every time an activity's resource effects or need restoration are computed

**Example:**
```typescript
// Based on existing Character.activeModifiers pattern
interface ActivityAlignment {
  costMultiplier: number;    // 0.6-1.4 range (25-40% variance)
  gainMultiplier: number;    // 0.6-1.4 range (25-40% variance)
}

function calculatePersonalityAlignment(
  activity: Activity,
  character: Character
): ActivityAlignment {
  const { personality } = character;
  let costMod = 1.0;
  let gainMod = 1.0;

  // Extraversion: social vs solo activities
  if (activity.tags?.includes('social')) {
    // Extroverts: lower costs, higher gains
    costMod -= (personality.extraversion - 50) / 100 * 0.3;
    gainMod += (personality.extraversion - 50) / 100 * 0.3;
  }

  // Conscientiousness: routine/structured activities
  if (activity.tags?.includes('routine')) {
    costMod -= (personality.conscientiousness - 50) / 100 * 0.3;
    gainMod += (personality.conscientiousness - 50) / 100 * 0.3;
  }

  // Clamp to 25-40% range (0.6-1.4)
  costMod = Math.max(0.6, Math.min(1.4, costMod));
  gainMod = Math.max(0.6, Math.min(1.4, gainMod));

  return { costMultiplier: costMod, gainMultiplier: gainMod };
}
```

### Pattern 2: Gradual Need Restoration
**What:** Restore needs per-tick during activity execution, with partial progress retained on interruption
**When to use:** In ActivityStore.applyResourceEffects, alongside existing resource effects

**Example:**
```typescript
// Extend existing ActivityStore.applyResourceEffects
private applyResourceEffects(speedMultiplier: number): void {
  const activity = this.currentActivity;
  const character = this.root.characterStore.character;
  if (!activity || !character) return;

  // Existing resource effects (already handles mastery bonuses)
  for (const [key, baseEffect] of Object.entries(activity.resourceEffects)) {
    // ... existing code ...
  }

  // NEW: Apply need restoration if v1.1 needs system enabled
  if (character.needs && activity.needEffects) {
    const alignment = calculatePersonalityAlignment(activity, character);

    for (const [needKey, baseRestore] of Object.entries(activity.needEffects)) {
      // Apply personality gain multiplier
      const restore = baseRestore * alignment.gainMultiplier * speedMultiplier;

      // Apply to character needs (gradual restoration)
      character.needs[needKey] = Math.max(0, Math.min(100,
        character.needs[needKey] + restore
      ));
    }
  }
}
```

### Pattern 3: Difficulty-Scaled Resource Costs
**What:** Scale resource consumption linearly with effective difficulty (1:1 mapping)
**When to use:** When calculating Overskudd, Willpower, Focus, socialBattery costs

**Example:**
```typescript
// Add to Activity class
interface ResourceCosts {
  overskudd: number;     // Required to start, consumed during
  willpower: number;     // Consumed at start
  focus?: number;        // Consumed during (concentration activities)
  socialBattery?: number; // Consumed during (social activities)
}

function calculateResourceCosts(
  activity: Activity,
  character: Character
): ResourceCosts {
  const effectiveDifficulty = activity.getEffectiveDifficulty(character);
  const alignment = calculatePersonalityAlignment(activity, character);

  // Base costs scale linearly with difficulty (1:1)
  // Difficulty 1 = 5 base cost, Difficulty 5 = 25 base cost
  const baseCost = effectiveDifficulty * 5;

  // Apply personality cost multiplier
  const overskuddCost = baseCost * alignment.costMultiplier;
  const willpowerCost = (baseCost * 0.5) * alignment.costMultiplier;

  // Optional costs based on activity type
  const focusCost = activity.tags?.includes('concentration')
    ? (baseCost * 0.3) * alignment.costMultiplier
    : 0;
  const socialBatteryCost = activity.tags?.includes('social')
    ? (baseCost * 0.4) * alignment.costMultiplier
    : 0;

  return {
    overskudd: overskuddCost,
    willpower: willpowerCost,
    focus: focusCost > 0 ? focusCost : undefined,
    socialBattery: socialBatteryCost > 0 ? socialBatteryCost : undefined
  };
}
```

### Pattern 4: Floating Number Feedback
**What:** Display +/- numbers that float upward from activity card during execution
**When to use:** When needs/resources change during activity execution

**Example:**
```typescript
// Custom component using CSS transitions (no heavy animation library needed)
interface FloatingNumberProps {
  value: number;
  resourceKey: string;
  onComplete: () => void;
}

function FloatingNumber({ value, resourceKey, onComplete }: FloatingNumberProps) {
  const isPositive = value > 0;
  const prefix = isPositive ? '+' : '';

  return (
    <div
      className="absolute pointer-events-none animate-float-up"
      onAnimationEnd={onComplete}
    >
      <span className={clsx(
        'text-sm font-bold',
        isPositive ? 'text-green-500' : 'text-red-500'
      )}>
        {prefix}{value.toFixed(0)} {resourceKey}
      </span>
    </div>
  );
}

// Tailwind config animation
// @keyframes float-up {
//   0% { transform: translateY(0); opacity: 1; }
//   100% { transform: translateY(-40px); opacity: 0; }
// }
// animation-float-up: float-up 1.5s ease-out forwards;
```

### Anti-Patterns to Avoid
- **Instant restoration on completion:** Violates CONTEXT.md decision; restoration must be gradual during execution
- **Complex diminishing returns formulas:** CONTEXT.md explicitly states no diminishing returns; repeating same activity restores same amount
- **Minimum cost floors:** CONTEXT.md states mastered activities can become nearly free; don't artificially limit reduction
- **Recalculating personality fit every tick:** Compute once at activity start, cache for duration

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated number transitions | Custom interpolation logic | CSS transitions + React state | Browser-optimized, simpler, already handles interruption cleanup |
| Personality trait to modifier mapping | Hardcoded if-else chains | Utility function with trait configs | Character.activeModifiers already demonstrates pattern; maintainable and testable |
| Activity tagging system | Custom metadata on Activity | Extend ActivityData with tags?: string[] | Type-safe, follows existing ActivityData pattern |
| Resource cost calculations | Inline math in ActivityStore | Computed getter on Activity class | Follows Activity.getEffectiveDifficulty pattern; testable in isolation |

**Key insight:** This phase extends existing architectural patterns (MobX computed values, per-tick effects, personality modifiers) rather than introducing new paradigms. The Activity and Character classes already model the domain well; this phase connects them with alignment calculations.

## Common Pitfalls

### Pitfall 1: Personality Modifier Stacking
**What goes wrong:** Applying personality modifiers at multiple layers (activity start, per-tick, completion) causes compounding that exceeds 25-40% bounds
**Why it happens:** Multiple code paths handle resource effects; easy to apply alignment multiplier in each
**How to avoid:** Calculate alignment once at activity start, store on currentActivity state, apply consistently in single location (applyResourceEffects)
**Warning signs:** Personality effects feel extreme (60%+ variance); costs/gains differ significantly from tooltip predictions

### Pitfall 2: Need Restoration State Loss on Interruption
**What goes wrong:** Cancelling activity resets needs to pre-activity state, losing gradual progress
**Why it happens:** Storing "original needs state" and restoring it on cancel
**How to avoid:** Never store or restore previous state; needs are continuously updated per-tick and kept on interruption
**Warning signs:** Players report "lost progress" when canceling activities; needs jump backward

### Pitfall 3: Zero-Cost Activities Breaking Game Logic
**What goes wrong:** Mastered basic activities (toilet, sleep, eat) with 0 cost can't start because canStartActivity checks minOverskudd
**Why it happens:** CONTEXT.md states basic needs are free, but activity start gate checks overskudd threshold
**How to avoid:** Special-case basic need activities OR lower global minimum to 5 overskudd OR tag them as "essential" and skip gate
**Warning signs:** Character can't perform basic actions when low on overskudd despite them being "free"

### Pitfall 4: Tooltip Predictions vs Actual Costs Mismatch
**What goes wrong:** ActivityCard tooltip shows costs, but actual execution differs due to wellbeing/personality drift
**Why it happens:** Tooltip computed at render time, actual costs computed at activity start (personality/wellbeing changed)
**How to avoid:** Accept minor drift (wellbeing changes slowly) OR snapshot personality fit at tooltip render and store on queue entry
**Warning signs:** Players report "costs aren't what the card said"; confusion about personality fit

### Pitfall 5: Floating Numbers Performance at Scale
**What goes wrong:** Spawning many floating number components (multi-need restoration) causes frame drops
**Why it happens:** Each floating number is a React component with animations; 7+ needs × multiple activities = many DOM nodes
**How to avoid:** Pool floating number components OR batch multiple changes into single display ("+5 Hunger, +3 Social") OR limit to 3 most significant changes
**Warning signs:** FPS drops during busy simulation; React dev tools shows hundreds of FloatingNumber instances

### Pitfall 6: Personality Trait Range Assumptions
**What goes wrong:** Alignment calculations assume traits are 0-100 scale, but edge cases (undefined, negative) break
**Why it happens:** Not validating personality trait values from character creation or serialization
**How to avoid:** Clamp trait values in Character constructor; validate in alignment calculation; default to 50 (neutral)
**Warning signs:** NaN in cost calculations; "cannot read property of undefined" errors; extreme modifier values

## Code Examples

Verified patterns from existing codebase:

### Activity Resource Effects (Existing Pattern)
```typescript
// Source: src/stores/ActivityStore.ts lines 341-364
private applyResourceEffects(speedMultiplier: number): void {
  const activity = this.currentActivity;
  const character = this.root.characterStore.character;
  if (!activity || !character) return;

  for (const [key, baseEffect] of Object.entries(activity.resourceEffects)) {
    const resourceKey = key as ResourceKey;
    let effect = baseEffect * speedMultiplier;

    // Mastery reduces drain, modestly increases restore
    if (effect < 0) {
      effect *= 1 - activity.masteryDrainReduction;
    } else {
      effect *= 1 + activity.masteryBonus * 0.5;
    }

    // Apply to character resources (clamp handled in updateResources)
    const newValue = Math.max(
      0,
      Math.min(100, character.resources[resourceKey] + effect)
    );
    character.resources[resourceKey] = newValue;
  }
}
```

### Personality Modifiers (Existing Pattern)
```typescript
// Source: src/entities/Character.ts lines 900-1009
get activeModifiers(): ResourceModifier[] {
  const modifiers: ResourceModifier[] = [];
  const {
    extraversion,
    neuroticism,
    conscientiousness,
    openness,
    agreeableness,
  } = this.personality;

  // Get personality modifier strength from balance config (default 1.0)
  const strength = this.root?.balanceConfig?.personalityModifierStrength ?? 1.0;

  // Helper to apply strength multiplier to personality modifiers
  const scaledModifier = (traitValue: number) =>
    personalityToModifier(traitValue) * strength;

  // Extraversion effects
  if (extraversion < 50) {
    modifiers.push({
      resourceKey: 'socialBattery',
      source: 'low extraversion',
      drainModifier: scaledModifier(100 - extraversion),
      recoveryModifier: 0,
    });
  }
  // ... more traits

  return modifiers;
}
```

### Difficulty-Based Calculation (Existing Pattern)
```typescript
// Source: src/entities/Activity.ts lines 193-202
getEffectiveDifficulty(character: Character): number {
  const skillReduction = this.calculateSkillReduction(character);
  const masteryReduction = this.calculateMasteryReduction();

  const effectiveDifficulty =
    this.baseDifficulty - skillReduction - masteryReduction;

  // Clamp to 1-5 range
  return Math.max(1, Math.min(5, effectiveDifficulty));
}
```

### Need Restoration Extension (NEW - Follows Existing Pattern)
```typescript
// Extend ActivityData interface
interface ActivityData {
  // ... existing fields
  needEffects?: Partial<Record<NeedKey, number>>; // positive = restore, per tick
}

// Add to Activity class constructor
this.needEffects = data.needEffects ?? {};

// Extend ActivityStore.applyResourceEffects (after existing resource effects)
// Apply need restoration if v1.1 needs system enabled
if (character.needs && activity.needEffects) {
  const alignment = this.calculatePersonalityAlignment(activity, character);

  for (const [needKey, baseRestore] of Object.entries(activity.needEffects)) {
    const restore = baseRestore * alignment.gainMultiplier * speedMultiplier;

    character.needs[needKey as NeedKey] = Math.max(0, Math.min(100,
      character.needs[needKey as NeedKey] + restore
    ));

    // Emit floating number event if significant change (>= 1)
    if (Math.abs(restore) >= 1) {
      this.emitFloatingNumber(needKey, restore);
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Instant restoration on completion | Gradual per-tick restoration | Phase 10 (this phase) | Allows interruption without losing progress; feels more realistic |
| Fixed activity costs | Difficulty-scaled costs | Phase 9.1 + Phase 10 | Skill progression meaningfully reduces resource pressure |
| No personality influence on activities | Personality affects both costs and gains | Phase 10 (this phase) | Creates meaningful character differentiation; aligns with Big Five research |
| Generic feedback ("Activity completed") | Floating numbers + detailed summary | Phase 10 (this phase) | Players understand what changed and why |

**Deprecated/outdated:**
- Fixed-cost activities: All activities now scale costs with difficulty
- Completion-only effects: Effects apply gradually during execution
- Hidden personality fit: Now surfaced in tooltips for informed decision-making

## Open Questions

1. **Activity tagging system details**
   - What we know: Need tags for personality alignment (social, routine, creative, cooperative, stressful)
   - What's unclear: Should tags be on ActivityData directly, or separate metadata? Should they support multiple simultaneous tags?
   - Recommendation: Add `tags?: string[]` to ActivityData; allows multiple tags; keep flexible for future expansion

2. **Floating number aggregation strategy**
   - What we know: Multiple needs can restore simultaneously (+Hunger, +Social, +Fun)
   - What's unclear: Show separate floating numbers for each, or batch into one display?
   - Recommendation: Start with individual numbers, add batching if performance becomes issue (Pitfall 5)

3. **Wellbeing resource integration with personality alignment**
   - What we know: CONTEXT.md states "Wellbeing resources also factor into alignment effects"
   - What's unclear: How do mood/purpose/nutrition affect alignment multipliers? Additive or multiplicative?
   - Recommendation: Start without wellbeing integration (already complex with Big Five); add in Phase 11 if needed

4. **Escape valve implementation specifics**
   - What we know: ACTV-04 requires cost reduction when patient struggling (needs below threshold)
   - What's unclear: What threshold? Which needs? How much reduction?
   - Recommendation: Below 20 in any physiological need (hunger/energy/hygiene/bladder), apply 50% cost reduction; emergency override

## Sources

### Primary (HIGH confidence)
- Existing codebase at `/Users/godstemning/projects-local/lifelines-prototypes/src/`
  - entities/Activity.ts - Difficulty calculation, mastery bonuses
  - entities/Character.ts - Personality modifiers, needs system
  - stores/ActivityStore.ts - Activity execution, resource effects
  - config/balance.ts - Configuration patterns, default values
  - data/activities.ts - Activity examples with resourceEffects

### Secondary (MEDIUM confidence)
- [Towards a system of customized video game mechanics based on player personality](https://www.sciencedirect.com/science/article/pii/S1875952116000045) - Big Five traits and difficulty adaptation
- [The Big Five personality traits and online gaming: A systematic review and meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8997197/) - Conscientiousness protective role
- [Artificial Emotion: Simulating Mood and Personality](https://www.gamedeveloper.com/design/artificial-emotion-simulating-mood-and-personality) - Personality simulation patterns
- [Motion (Framer Motion)](https://react-spring.dev/) - React animation library (if needed for complex feedback)

### Tertiary (LOW confidence - not used in recommendations)
- [NumberFlow for React](https://number-flow.barvian.me/) - Animated number transitions (overkill for this use case)
- WebSearch results on game lifecycle patterns - General game design, not specific to needs/personality systems

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, no new dependencies needed
- Architecture: HIGH - Extends existing Activity/Character patterns, verified in codebase
- Pitfalls: HIGH - Identified from codebase review and CONTEXT.md constraints
- Personality alignment: MEDIUM - Pattern exists (Character.activeModifiers) but need-specific application is new

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable domain, established patterns)

**Research constraints from CONTEXT.md:**
- ✓ Gradual restoration during activity (locked decision)
- ✓ Linear difficulty-to-cost mapping 1:1 (locked decision)
- ✓ No minimum cost floor (locked decision)
- ✓ Personality affects both costs and gains (locked decision)
- ✓ All Big Five traits affect activities (locked decision)
- ✓ 25-40% modifier strength (locked decision)
- ✓ Floating numbers during activity (locked decision)
- ✓ Completion summary after finish (locked decision)
- ◇ Tooltip cost display format (Claude's discretion)
- ◇ Exact animation style (Claude's discretion)
- ◇ Trait-to-activity mappings (Claude's discretion within Big Five framework)
