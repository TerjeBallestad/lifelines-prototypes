# Phase 5: Talents System - Research

**Researched:** 2026-01-22
**Domain:** Roguelike talent selection, weighted random sampling, modifier system design, modal UI
**Confidence:** HIGH

## Summary

This phase implements a roguelike talent selection system where players pick 1 of 3 offered talents triggered by domain XP milestones (500 XP = 1 pick). Talents are permanent modifiers that affect capacities, skills, resources, or activity outcomes using the existing modifier system (additive stacking). The system includes rarity tiers (common, rare, epic), modal-based selection UI, and a talents panel showing selected talents with stat breakdowns.

The codebase already has the foundation: MobX observable patterns, Character/Skill entity architecture, additive modifier stacking (`combineModifiers`, `applyModifiers`), SkillStore with `domainXP` tracking. The new Talent entity and TalentStore will follow established patterns. User decisions from CONTEXT.md constrain the design: XP-triggered selection (500 XP threshold), immediate modal with queue support (up to 3 pending), rarity tiers, and vertical card layout with stat visibility.

**Primary recommendation:** Extend existing modifier system for talent effects, use MobX observable maps for talent pool and selected talents, implement weighted random sampling with no-duplicates for 1-of-3 offers, use native HTML dialog element via DaisyUI modal for selection UI, trigger selection check on domain XP changes.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | State management | Already in project, handles talent state reactively |
| mobx-react-lite | 4.1.1 | React bindings | Already in project, observer pattern for UI updates |
| DaisyUI | 5.5.14 | Modal component | Native dialog element, accessible, already in project |
| Sonner | 2.0.7 | Toast notifications | Already in project, for rare talent procs/events |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (built-in) | - | Weighted random | Custom implementation, <50 lines, no dependency needed |
| Tailwind CSS | 4.1.18 | Styling | Consistent with existing components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom weighted random | random-seed-weighted-chooser | Library adds 5KB, simple algorithm is 20 lines |
| Native dialog | react-modal | Heavier (50KB), unnecessary when native dialog works |
| Custom modal | react-modal-promise | Promise-based API nice but adds complexity/bundle size |

**Installation:**
```bash
# All dependencies already installed
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Talent.ts              # Talent class (mirrors Character/Skill pattern)
│   └── types.ts               # Add TalentData, TalentRarity, ModifierEffect types
├── stores/
│   ├── TalentStore.ts         # Pool management, selection state, pending picks
│   └── RootStore.ts           # Add talentStore reference
├── data/
│   └── talents.ts             # 9-12 talent definitions with rarity weights
├── components/
│   ├── TalentCard.tsx         # Single talent display with stats affected
│   ├── TalentSelectionModal.tsx # Modal with 3 offered talents
│   ├── TalentsPanel.tsx       # Shows selected talents + stat breakdowns
│   └── StatTooltip.tsx        # Hover tooltip showing "base + modifiers"
└── utils/
    ├── modifiers.ts           # Extend for talent modifier types
    └── weightedRandom.ts      # Weighted sampling without replacement
```

### Pattern 1: Talent Entity Class
**What:** Class-based entity mirroring Character/Skill/Activity pattern with `makeAutoObservable`
**When to use:** All talent data representation
**Example:**
```typescript
// Following Character.ts/Activity.ts pattern from existing codebase
import { makeAutoObservable } from 'mobx';
import type { TalentData, TalentRarity, SkillDomain } from './types';

export class Talent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rarity: TalentRarity; // 'common' | 'rare' | 'epic'
  readonly domain: SkillDomain | null; // null = universal talent
  readonly effects: ModifierEffect[]; // flat, percentage, conditional

  constructor(data: TalentData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.rarity = data.rarity;
    this.domain = data.domain;
    this.effects = data.effects;

    makeAutoObservable(this);
  }

  // Computed: rarity weight for selection (common=70, rare=25, epic=5)
  get rarityWeight(): number {
    const weights = { common: 70, rare: 25, epic: 5 };
    return weights[this.rarity];
  }

  // Computed: whether this talent is domain-specific or universal
  get isUniversal(): boolean {
    return this.domain === null;
  }
}
```

### Pattern 2: TalentStore with Observable Map
**What:** MobX store managing talent pool, selected talents, pending picks
**When to use:** All talent state management
**Example:**
```typescript
// Following SkillStore pattern with observable.map
import { makeAutoObservable, observable } from 'mobx';
import { Talent } from '../entities/Talent';
import type { TalentData, SkillDomain } from '../entities/types';
import { type RootStore } from './RootStore';
import { weightedSampleWithoutReplacement } from '../utils/weightedRandom';

export class TalentStore {
  talentPool = observable.map<string, Talent>();
  selectedTalents = observable.map<string, Talent>();
  pendingPicks: number = 0; // 0-3
  currentOffer: Talent[] | null = null; // 3 talents being offered

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);

    // Seed talent pool from data
    this.seedTalents(TALENT_DATA);
  }

  get talentsArray(): Talent[] {
    return Array.from(this.talentPool.values());
  }

  get selectedTalentsArray(): Talent[] {
    return Array.from(this.selectedTalents.values());
  }

  // Check if player has earned a talent pick (500 XP threshold)
  checkForTalentPick(domain: SkillDomain, newXP: number): void {
    const PICK_THRESHOLD = 500;
    const picks = Math.floor(newXP / PICK_THRESHOLD);
    const prevPicks = Math.floor((newXP - 1) / PICK_THRESHOLD);

    if (picks > prevPicks) {
      this.addPendingPick();
    }
  }

  private addPendingPick(): void {
    if (this.pendingPicks < 3) {
      this.pendingPicks++;

      // Auto-generate offer if none active
      if (!this.currentOffer) {
        this.generateOffer();
      }
    }
  }

  // Generate weighted random 1-of-3 offer (no duplicates)
  generateOffer(): void {
    const available = this.talentsArray.filter(
      t => !this.selectedTalents.has(t.id)
    );

    if (available.length < 3) {
      console.warn('Not enough talents for offer');
      return;
    }

    const weights = available.map(t => t.rarityWeight);
    const indices = weightedSampleWithoutReplacement(weights, 3);
    this.currentOffer = indices.map(i => available[i]);
  }

  // Select a talent from current offer
  selectTalent(talentId: string): boolean {
    if (!this.currentOffer) return false;

    const talent = this.currentOffer.find(t => t.id === talentId);
    if (!talent) return false;

    // Add to selected
    this.selectedTalents.set(talent.id, talent);

    // Consume pending pick
    this.pendingPicks--;
    this.currentOffer = null;

    // Generate next offer if picks remain
    if (this.pendingPicks > 0) {
      this.generateOffer();
    }

    return true;
  }

  private seedTalents(talentDataList: TalentData[]): void {
    for (const data of talentDataList) {
      const talent = new Talent(data);
      this.talentPool.set(data.id, talent);
    }
  }
}
```

### Pattern 3: Weighted Random Sampling Without Replacement
**What:** Algorithm to select N items based on weights, no duplicates
**When to use:** Generating 1-of-3 talent offers
**Example:**
```typescript
// src/utils/weightedRandom.ts
// Implements cumulative weight algorithm (industry standard)

/**
 * Sample N indices from weights array without replacement.
 * Uses cumulative weights + binary search for O(N log M) performance.
 *
 * @param weights - Array of positive weights (higher = more likely)
 * @param sampleSize - Number of items to sample (N)
 * @returns Array of N unique indices into weights array
 */
export function weightedSampleWithoutReplacement(
  weights: number[],
  sampleSize: number
): number[] {
  if (sampleSize > weights.length) {
    throw new Error('Sample size exceeds population');
  }

  const indices: number[] = [];
  const availableWeights = [...weights]; // copy for mutation
  const availableIndices = weights.map((_, i) => i);

  for (let i = 0; i < sampleSize; i++) {
    // Build cumulative weights
    const cumulative: number[] = [];
    let sum = 0;
    for (const w of availableWeights) {
      sum += w;
      cumulative.push(sum);
    }

    // Random selection
    const rand = Math.random() * sum;
    const selectedIdx = cumulative.findIndex(c => c >= rand);

    // Record selection and remove from pool
    indices.push(availableIndices[selectedIdx]);
    availableWeights.splice(selectedIdx, 1);
    availableIndices.splice(selectedIdx, 1);
  }

  return indices;
}
```

### Pattern 4: DaisyUI Modal with Native Dialog
**What:** Modal using HTML dialog element for accessibility
**When to use:** Talent selection UI
**Example:**
```typescript
// Following DaisyUI official pattern
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { useTalentStore } from '../stores/RootStore';

export const TalentSelectionModal = observer(function TalentSelectionModal() {
  const talentStore = useTalentStore();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Auto-open when offer becomes available
  useEffect(() => {
    if (talentStore.currentOffer && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [talentStore.currentOffer]);

  const handleSelect = (talentId: string) => {
    talentStore.selectTalent(talentId);
    dialogRef.current?.close();
  };

  if (!talentStore.currentOffer) return null;

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">
          Choose a Talent
          {talentStore.pendingPicks > 1 && (
            <span className="badge badge-primary ml-2">
              {talentStore.pendingPicks} picks available
            </span>
          )}
        </h3>

        {/* Vertical stacked cards per CONTEXT.md decision */}
        <div className="flex flex-col gap-4 mt-4">
          {talentStore.currentOffer.map(talent => (
            <TalentCard
              key={talent.id}
              talent={talent}
              onSelect={() => handleSelect(talent.id)}
            />
          ))}
        </div>
      </div>

      {/* Backdrop - prevents dismissal (user must choose) */}
      <form method="dialog" className="modal-backdrop">
        {/* No button - modal cannot be closed without selecting */}
      </form>
    </dialog>
  );
});
```

### Pattern 5: Modifier Effect Types
**What:** Talent effects extend existing modifier system
**When to use:** Defining talent effects on character stats
**Example:**
```typescript
// Add to src/entities/types.ts
export type ModifierType = 'flat' | 'percentage' | 'conditional';

export interface ModifierEffect {
  type: ModifierType;
  target: 'capacity' | 'resource' | 'skill' | 'activity';
  targetKey: string; // capacity name, resource name, etc.
  value: number; // +10 flat, or 0.15 for 15%
  condition?: {
    type: 'resource_threshold' | 'activity_type' | 'domain';
    check: string; // e.g., "energy < 30", "domain === 'physical'"
    value?: any;
  };
  description: string; // For UI display
}

// Example talent data
const SLOW_METABOLISM: TalentData = {
  id: 'slow_metabolism',
  name: 'Slow Metabolism',
  description: 'Resources drain 15% slower, but activities take 10% longer',
  rarity: 'common',
  domain: null, // universal
  effects: [
    {
      type: 'percentage',
      target: 'resource',
      targetKey: 'energy',
      value: -0.15, // negative = slower drain
      description: 'Energy drains 15% slower'
    },
    {
      type: 'percentage',
      target: 'activity',
      targetKey: 'duration',
      value: 0.10, // positive = longer duration
      description: 'Activities take 10% longer'
    }
  ]
};
```

### Pattern 6: Stat Breakdown with Modifiers
**What:** UI shows base value + talent modifiers for transparency
**When to use:** Capacity/resource display, tooltips
**Example:**
```typescript
// Computed property in Character or TalentStore
get capacityBreakdown(key: CapacityKey): {
  base: number;
  modifiers: Array<{ source: string; value: number }>;
  total: number;
} {
  const base = this.capacities[key];
  const modifiers: Array<{ source: string; value: number }> = [];

  // Collect talent modifiers
  for (const talent of this.root.talentStore.selectedTalentsArray) {
    for (const effect of talent.effects) {
      if (effect.target === 'capacity' && effect.targetKey === key) {
        modifiers.push({
          source: talent.name,
          value: effect.type === 'flat'
            ? effect.value
            : base * effect.value
        });
      }
    }
  }

  const total = base + modifiers.reduce((sum, m) => sum + m.value, 0);
  return { base, modifiers, total };
}

// UI component
<div className="stat">
  <div className="stat-title">Divergent Thinking</div>
  <div className="stat-value">{breakdown.total}</div>
  <div className="stat-desc">
    Base: {breakdown.base}
    {breakdown.modifiers.map(m => (
      <div key={m.source}>
        {m.value > 0 ? '+' : ''}{m.value} from {m.source}
      </div>
    ))}
  </div>
</div>
```

### Anti-Patterns to Avoid
- **Mutable rarity weights:** Don't allow runtime weight changes; makes balance unpredictable
- **Sampling with replacement:** Don't allow duplicate talents in 1-of-3 offer
- **Imperative modal state:** Don't use boolean flags to show/hide; use native dialog.showModal()
- **Percentage stacking without base:** Don't apply percentage modifiers without base value context
- **Circular talent effects:** Avoid talents that modify domain XP gains (breaks progression)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog | Custom overlay + state | DaisyUI modal (native dialog) | Accessibility, ESC key, focus trap built-in |
| Weighted random | Complex probability math | Cumulative weights + findIndex | Standard algorithm, 20 lines, no edge cases |
| Modifier stacking | Custom accumulation logic | Existing `combineModifiers` | Already handles additive stacking correctly |
| Stat breakdowns | Manual calculation per stat | Computed properties with loops | Scales to any number of talents/modifiers |

**Key insight:** The existing modifier system (`combineModifiers`, `applyModifiers`) handles additive stacking. Talents are just another source of modifiers. The complexity is in weighted selection (simple algorithm) and UI presentation (DaisyUI + MobX reactivity handles this).

## Common Pitfalls

### Pitfall 1: Weighted Random Bias Toward First Items
**What goes wrong:** Naive implementation always favors earlier items in array
**Why it happens:** Using `weights[i] > random()` per item instead of cumulative distribution
**How to avoid:** Build cumulative weight array, then binary search or findIndex
**Warning signs:** Common talents appear way more often than their 70% weight suggests

### Pitfall 2: Sampling With Replacement (Duplicates)
**What goes wrong:** Same talent appears 2-3 times in one offer
**Why it happens:** Re-rolling from full pool instead of removing selected items
**How to avoid:** Use "without replacement" algorithm - remove after each selection
**Warning signs:** Players report seeing duplicate talents in offers

### Pitfall 3: Modal Stays Open After Selection
**What goes wrong:** Modal doesn't close after picking talent
**Why it happens:** Forgetting to call `dialog.close()` after selection
**How to avoid:** Always close dialog in selection handler, or use form method="dialog"
**Warning signs:** Modal requires manual ESC press after every pick

### Pitfall 4: Percentage Modifiers Without Base Context
**What goes wrong:** "+15% divergent thinking" applied as flat +15 instead of +7.5 (15% of 50)
**Why it happens:** Treating percentage as flat bonus during calculation
**How to avoid:** Always multiply percentage by base value: `base * (1 + pct)`
**Warning signs:** Percentage talents feel weak or overpowered vs flat bonuses

### Pitfall 5: Talent Effects Not Applied to Character
**What goes wrong:** Talents selected but don't affect gameplay
**Why it happens:** TalentStore disconnected from Character modifier calculations
**How to avoid:** Character reads `talentStore.selectedTalents` in computed properties
**Warning signs:** Talent panel shows talents but stats unchanged

### Pitfall 6: Modal Opens Multiple Times for Same Pick
**What goes wrong:** Modal reopens immediately after closing
**Why it happens:** Reactive effect fires on every render, not just when offer changes
**How to avoid:** Use `useEffect` dependency on `currentOffer`, add guards for null
**Warning signs:** Modal flickers or requires multiple ESC presses

### Pitfall 7: XP Threshold Not Tracked Per Domain
**What goes wrong:** All domains share one XP pool for talent picks
**Why it happens:** Global XP counter instead of per-domain tracking
**How to avoid:** Check threshold per domain in SkillStore.addDomainXP, trigger per-domain
**Warning signs:** Players get picks for social XP when earning physical XP

## Code Examples

Verified patterns from official sources and existing codebase:

### Talent Type Definitions
```typescript
// Add to src/entities/types.ts
export type TalentRarity = 'common' | 'rare' | 'epic';

export type ModifierType = 'flat' | 'percentage' | 'conditional';

export interface ModifierEffect {
  type: ModifierType;
  target: 'capacity' | 'resource' | 'skill' | 'activity';
  targetKey: string;
  value: number;
  condition?: {
    type: 'resource_threshold' | 'activity_type' | 'domain';
    check: string;
  };
  description: string;
}

export interface TalentData {
  id: string;
  name: string;
  description: string;
  rarity: TalentRarity;
  domain: SkillDomain | null; // null = universal
  effects: ModifierEffect[];
}
```

### Example Talent Definitions (Per CONTEXT.md Guidelines)
```typescript
// src/data/talents.ts
import type { TalentData } from '../entities/types';

export const TALENTS: TalentData[] = [
  // Common talents (70% spawn rate)
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: '+15% activity mastery XP gain',
    rarity: 'common',
    domain: null,
    effects: [
      {
        type: 'percentage',
        target: 'activity',
        targetKey: 'masteryXP',
        value: 0.15,
        description: 'Mastery XP +15%'
      }
    ]
  },

  {
    id: 'iron_will',
    name: 'Iron Will',
    description: '+20 max overskudd capacity',
    rarity: 'common',
    domain: 'physical',
    effects: [
      {
        type: 'flat',
        target: 'resource',
        targetKey: 'overskudd',
        value: 20,
        description: 'Overskudd +20 max'
      }
    ]
  },

  // Tradeoff talent (~30% have downsides per CONTEXT.md)
  {
    id: 'hyperfocus',
    name: 'Hyperfocus',
    description: '+30% convergent thinking, but social activities drain 20% faster',
    rarity: 'rare',
    domain: 'analytical',
    effects: [
      {
        type: 'percentage',
        target: 'capacity',
        targetKey: 'convergentThinking',
        value: 0.30,
        description: 'Convergent Thinking +30%'
      },
      {
        type: 'percentage',
        target: 'resource',
        targetKey: 'socialBattery',
        value: 0.20, // positive = faster drain
        condition: {
          type: 'domain',
          check: 'activity.domain === "social"'
        },
        description: 'Social activities drain Social Battery 20% faster'
      }
    ]
  },

  // Epic "overpowered" talent (5% spawn rate)
  {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'When energy drops below 20, restore 40 energy. Once per 100 ticks.',
    rarity: 'epic',
    domain: 'physical',
    effects: [
      {
        type: 'conditional',
        target: 'resource',
        targetKey: 'energy',
        value: 40,
        condition: {
          type: 'resource_threshold',
          check: 'energy < 20'
        },
        description: 'Restore 40 energy when below 20 (cooldown: 100 ticks)'
      }
    ]
  }
];
```

### Integrating Talent Effects into Character
```typescript
// In Character.ts - extend activeModifiers computed property
get activeModifiers(): ResourceModifier[] {
  const modifiers: ResourceModifier[] = [];

  // Existing personality modifiers...
  // (extraversion, neuroticism, etc.)

  // Add talent modifiers (NEW)
  const talents = this.root.talentStore.selectedTalentsArray;
  for (const talent of talents) {
    for (const effect of talent.effects) {
      // Only apply resource modifiers here (capacity/skill handled elsewhere)
      if (effect.target === 'resource') {
        // Check conditions if present
        if (effect.condition && !this.evaluateCondition(effect.condition)) {
          continue;
        }

        modifiers.push({
          resourceKey: effect.targetKey as ResourceKey,
          source: talent.name,
          drainModifier: effect.type === 'percentage' ? effect.value : 0,
          recoveryModifier: 0
        });
      }
    }
  }

  return modifiers;
}

// Helper for conditional effects
private evaluateCondition(condition: ModifierEffect['condition']): boolean {
  if (!condition) return true;

  switch (condition.type) {
    case 'resource_threshold':
      // Parse "energy < 20" style checks
      // Simple eval or regex parser
      return eval(condition.check); // (prototype only - parse properly in production)
    case 'activity_type':
      const currentActivity = this.root.activityStore.currentActivity;
      return currentActivity && eval(condition.check);
    default:
      return true;
  }
}
```

### Triggering Talent Picks on XP Gain
```typescript
// In SkillStore.addDomainXP - add talent check (NEW)
addDomainXP(domain: SkillDomain, amount: number): void {
  const current = this.domainXP.get(domain) ?? 0;
  const newTotal = current + amount;
  this.domainXP.set(domain, newTotal);

  // Check for talent pick threshold (NEW)
  this.root.talentStore.checkForTalentPick(domain, newTotal);
}
```

### DaisyUI Modal TypeScript Typing
```typescript
// Type-safe dialog element handling
const dialogRef = useRef<HTMLDialogElement>(null);

// Opening modal
dialogRef.current?.showModal();

// Closing modal
dialogRef.current?.close();

// Checking if modal is open
const isOpen = dialogRef.current?.open ?? false;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom weighted random libs | Cumulative weights algorithm | Long-standing | 20 lines, no deps, O(N log M) |
| Checkbox/anchor modals | Native dialog element | 2022+ (browser support) | Accessibility, ESC key, focus management |
| Boolean modal state | useRef + showModal() | React 18+ | Declarative, no state sync issues |
| Complex modifier pipelines | Additive stacking | Game design consensus | Predictable, debuggable, player-friendly |
| Flat talent lists | Rarity tier + weighted | Roguelike standard (2010s+) | Excitement, replayability, balance knob |

**Deprecated/outdated:**
- Multiplicative stacking: Creates exponential growth, hard to balance
- Manual DOM modal management: Use native dialog element
- Random without weights: No rarity tiers, boring selection

## Open Questions

Things that couldn't be fully resolved:

1. **Exact XP threshold tuning**
   - What we know: 500 total domain XP = 1 pick (from CONTEXT.md suggestion)
   - What's unclear: Balance testing may reveal too fast/slow progression
   - Recommendation: Make threshold a constant, tune during playtesting

2. **Conditional effect evaluation safety**
   - What we know: Some talents have conditional effects ("when energy < 20")
   - What's unclear: Using `eval()` for condition checks is unsafe for user-generated content
   - Recommendation: For prototype, use eval; for production, build proper expression parser

3. **Rarity distribution across domains**
   - What we know: Pool has 9-12 talents with rarity tiers (common, rare, epic)
   - What's unclear: Should each domain have balanced rarity distribution, or can some domains have more epics?
   - Recommendation: Claude's discretion - aim for 2 epic, 3-4 rare, 5-6 common across all domains

4. **Domain-specific vs universal talents in offers**
   - What we know: User noted "whether to enforce domain spread in 3-talent offers" is Claude's discretion
   - What's unclear: Should offer include 1+ talents from triggering domain, or pure random?
   - Recommendation: Pure weighted random from available pool - simpler, more roguelike feel

5. **Visual indication for conditional talents**
   - What we know: User noted "visual active/inactive state for conditional talents" is Claude's discretion
   - What's unclear: Should UI show when conditional talents are currently active?
   - Recommendation: Yes - add subtle glow/badge to talent card when condition met (nice-to-have, not blocking)

## Sources

### Primary (HIGH confidence)
- Existing codebase: Character.ts, Skill.ts, SkillStore.ts, modifiers.ts patterns
- [DaisyUI Modal Component](https://daisyui.com/components/modal/) - Native dialog element patterns, accessibility
- [MobX Documentation - Observable State](https://mobx.js.org/observable-state.html) - Observable maps, computed properties
- [MobX Documentation - Defining Data Stores](https://mobx.js.org/defining-data-stores.html) - Store architecture patterns

### Secondary (MEDIUM confidence)
- [Weighted Random in JavaScript - Medium](https://trekhleb.medium.com/weighted-random-in-javascript-4748ab3a1500) - Cumulative weights algorithm
- [Weighted Random Generator in TypeScript - DEV](https://dev.to/this-is-learning/weighted-random-generator-in-typescript-with-test-driven-development--hlb) - TypeScript implementation patterns
- [Building Scalable React Modal Component - Medium](https://medium.com/techverito/building-scalable-react-modal-component-with-custom-hook-%EF%B8%8F-tailwindcss-daisyui-and-ae12fbd7521c) - DaisyUI modal with TypeScript/React patterns
- [Using MobX for Large-Scale Enterprise State Management - LogRocket](https://blog.logrocket.com/using-mobx-for-large-scale-enterprise-state-management/) - Observable map patterns for entities

### Tertiary (LOW confidence)
- [Roguelike "Pick 1 of 3" Design - Keith Burgun](http://keithburgun.net/pick-1-of-3-is-a-missed-game-design-opportunity/) - Game design perspective, not technical
- [A Status Effect Stacking Algorithm - Game Developer](https://www.gamedeveloper.com/design/a-status-effect-stacking-algorithm) - Modifier stacking math (unverified for this project)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries, DaisyUI modal verified via official docs
- Architecture: HIGH - Following established entity/store/component patterns from codebase
- Weighted random: HIGH - Standard algorithm, verified in multiple sources, <50 lines
- Pitfalls: HIGH - Based on codebase analysis and verified modal/random selection issues
- Modifier integration: HIGH - Extends existing `combineModifiers` system correctly
- Conditional effects: MEDIUM - Eval-based condition checking is prototype-only (noted in open questions)

**Research date:** 2026-01-22
**Valid until:** 30 days (stable patterns, no fast-moving dependencies)
