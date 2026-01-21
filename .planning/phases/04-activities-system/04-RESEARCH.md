# Phase 4: Activities System - Research

**Researched:** 2026-01-21
**Domain:** Activity queue system, XP progression, toast notifications, state management
**Confidence:** HIGH

## Summary

This phase builds an activity system where players queue activities for the character, which execute over time via the existing SimulationStore tick mechanism. Activities have duration (fixed, threshold-based, or variable), drain/restore resources per-tick, award domain XP to the skill system, and can succeed or fail based on character state.

The codebase already has strong foundations: MobX observable state, SimulationStore with tick-based updates, SkillStore with `addDomainXP()` method, Character with `applyTickUpdate()` and resource/personality modifiers. The new Activity entity and ActivityStore will follow the same patterns established in Phases 1-3.

**Primary recommendation:** Use Sonner for toast notifications (lightweight, no-context API), implement ActivityStore with observable queue array and current activity state, integrate activity ticks into SimulationStore's existing tick loop.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | State management | Already in project, handles reactive queue |
| mobx-react-lite | 4.1.1 | React bindings | Already in project, observer pattern |
| Sonner | latest | Toast notifications | Lightweight (<5KB), no context needed, TypeScript-first |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| daisyUI | 5.5.14 | UI components | Queue display, activity cards, styling |
| Tailwind CSS | 4.1.18 | Styling | Consistent with existing components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sonner | react-hot-toast | Similar API, Sonner is slightly more modern, better TS support |
| Sonner | daisyUI toast CSS | daisyUI toast is CSS-only (positioning), needs JS for timing/stacking |
| Sonner | react-toastify | Heavier bundle, more features than needed |

**Installation:**
```bash
npm install sonner
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Activity.ts        # Activity class (mirrors Skill/Character pattern)
│   └── types.ts           # Add ActivityData, ActivityState, DurationMode types
├── stores/
│   ├── ActivityStore.ts   # Queue management, current activity, completion logic
│   └── RootStore.ts       # Add activityStore reference
├── data/
│   └── activities.ts      # Seed data for 5-8 activities
├── components/
│   ├── ActivityCard.tsx   # Single activity display with preview info
│   ├── ActivityQueue.tsx  # Visual queue with reorder/cancel controls
│   └── ActivityPanel.tsx  # Main panel with domain tabs (matches SkillTreePanel)
└── utils/
    └── modifiers.ts       # Extend for activity-specific drain calculations
```

### Pattern 1: Activity Entity Class
**What:** Class-based entity mirroring Character/Skill pattern with `makeAutoObservable`
**When to use:** All activity data representation
**Example:**
```typescript
// Following Character.ts pattern from existing codebase
import { makeAutoObservable } from 'mobx';
import type { ActivityData, SkillDomain, ResourceKey, DurationMode } from './types';

export class Activity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly domain: SkillDomain;
  readonly durationMode: DurationMode;
  readonly baseDuration: number; // ticks (for fixed duration)
  readonly resourceEffects: Partial<Record<ResourceKey, number>>; // per-tick drain/restore
  readonly baseXPRate: number; // domain XP per tick

  // Activity Mastery (1-10) - increases through repetition
  masteryLevel: number = 1;
  masteryXP: number = 0;

  constructor(data: ActivityData) {
    this.id = data.id;
    this.name = data.name;
    // ... assign all fields
    makeAutoObservable(this);
  }

  get masteryBonus(): number {
    // Higher mastery = better efficiency, less drain
    return (this.masteryLevel - 1) * 0.05; // 0-45% bonus at levels 1-10
  }
}
```

### Pattern 2: ActivityStore with Queue
**What:** MobX store managing activity queue as observable array
**When to use:** All activity state management
**Example:**
```typescript
// Following SimulationStore/SkillStore patterns
import { makeAutoObservable, observable } from 'mobx';
import type { Activity } from '../entities/Activity';
import type { RootStore } from './RootStore';

export class ActivityStore {
  queue = observable.array<Activity>([]);
  currentActivity: Activity | null = null;
  currentProgress: number = 0; // ticks elapsed

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  // FIFO queue operations
  enqueue(activity: Activity): void {
    this.queue.push(activity);
  }

  dequeue(): Activity | undefined {
    return this.queue.shift();
  }

  reorder(fromIndex: number, toIndex: number): void {
    const [removed] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, removed);
  }

  cancel(index: number): void {
    this.queue.splice(index, 1);
  }

  // Called by SimulationStore.tick()
  processTick(speedMultiplier: number): void {
    if (!this.currentActivity) {
      this.tryStartNextActivity();
    }
    if (this.currentActivity) {
      this.executeActivityTick(speedMultiplier);
    }
  }
}
```

### Pattern 3: SimulationStore Integration
**What:** Hook activity processing into existing tick loop
**When to use:** Activity execution timing
**Example:**
```typescript
// In SimulationStore.tick() - add after character update
tick(): void {
  this.tickCount += 1;
  this.root.characterStore.character?.applyTickUpdate(this.speed);
  this.root.activityStore.processTick(this.speed); // NEW
}
```

### Pattern 4: Start Check Pattern
**What:** Validate character state before activity begins
**When to use:** Activity start conditions
**Example:**
```typescript
canStartActivity(activity: Activity): { canStart: boolean; reason?: string } {
  const character = this.root.characterStore.character;
  if (!character) return { canStart: false, reason: 'No character' };

  // Check overskudd/willpower threshold
  if (character.resources.overskudd < 20) {
    return {
      canStart: false,
      reason: `${character.name} doesn't have the energy to start this`
    };
  }

  // Activity-specific checks could go here
  return { canStart: true };
}
```

### Pattern 5: Duration Modes
**What:** Three duration calculation strategies
**When to use:** Different activity types
**Example:**
```typescript
type DurationMode =
  | { type: 'fixed'; ticks: number }                    // eating: 30 ticks
  | { type: 'threshold'; resource: ResourceKey; target: number }  // sleep until energy >= 80
  | { type: 'variable'; baseTicks: number; skillModifier?: string }; // affected by skills

isActivityComplete(activity: Activity, progress: number): boolean {
  const character = this.root.characterStore.character!;

  switch (activity.durationMode.type) {
    case 'fixed':
      return progress >= activity.durationMode.ticks;
    case 'threshold':
      const { resource, target } = activity.durationMode;
      return character.resources[resource] >= target;
    case 'variable':
      const baseTime = activity.durationMode.baseTicks;
      const modifier = 1 - activity.masteryBonus; // faster with mastery
      return progress >= baseTime * modifier;
  }
}
```

### Anti-Patterns to Avoid
- **Polling for activity state:** Don't use separate setInterval for activities; integrate into SimulationStore tick
- **Direct character mutation from Activity:** Always go through Character methods for resource changes
- **Imperative queue management:** Use MobX observable array, not manual state + forceUpdate
- **Tight coupling to UI:** ActivityStore should not import React; use observer pattern

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom div + setTimeout | Sonner | Handles stacking, timing, accessibility, animations |
| Queue data structure | Custom linked list | MobX observable array | Built-in reactivity, splice/push/shift work correctly |
| Drag-to-reorder | Manual drag handlers | daisyUI list + splice | Complex drag state management not worth it for MVP |
| XP formulas | Complex curve fitting | Simple polynomial | Polynomial curves are industry standard, exponential gets astronomical |

**Key insight:** The existing codebase patterns (MobX observables, class entities, store integration) handle most complexity. Focus on domain logic, not infrastructure.

## Common Pitfalls

### Pitfall 1: Timer Drift with Multiple Intervals
**What goes wrong:** Creating separate setInterval for activity timing causes drift from SimulationStore
**Why it happens:** Two intervals run independently, gradually desync
**How to avoid:** All time-based updates flow through single SimulationStore.tick()
**Warning signs:** Activity completion timing feels "off" compared to resource drain

### Pitfall 2: Resource Modification Ordering
**What goes wrong:** Activity modifies resources, then Character.applyTickUpdate also modifies
**Why it happens:** Both run in same tick without coordination
**How to avoid:** Activity tick runs AFTER character passive update, OR activity temporarily overrides base rates
**Warning signs:** Resources drain/recover at unexpected rates during activities

### Pitfall 3: Toast Flooding
**What goes wrong:** Many toasts appear in rapid succession (e.g., every failed tick)
**Why it happens:** Triggering toast on every state check
**How to avoid:** Toast only on state TRANSITIONS (activity start, fail, complete), not every tick
**Warning signs:** Toast stack grows rapidly, notifications overlap

### Pitfall 4: Queue Reactivity Issues
**What goes wrong:** UI doesn't update when queue changes
**Why it happens:** Using plain array instead of observable array, or mutating in place
**How to avoid:** Use `observable.array<T>()`, use splice/push/shift (not index assignment for structural changes)
**Warning signs:** Queue shows stale data, requires manual refresh

### Pitfall 5: Mastery XP Overflow
**What goes wrong:** High-level players accumulate infinite mastery on one activity
**Why it happens:** No cap on mastery level or no diminishing returns
**How to avoid:** Cap mastery at level 10, implement diminishing XP gains
**Warning signs:** Single activity mastery dominates all others

## Code Examples

Verified patterns from official sources and existing codebase:

### Activity Type Definitions
```typescript
// Add to src/entities/types.ts
export type DurationMode =
  | { type: 'fixed'; ticks: number }
  | { type: 'threshold'; resource: ResourceKey; target: number }
  | { type: 'variable'; baseTicks: number };

export type ActivityState = 'queued' | 'starting' | 'active' | 'completed' | 'failed';

export interface ActivityData {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  durationMode: DurationMode;
  resourceEffects: Partial<Record<ResourceKey, number>>; // negative = drain, positive = restore
  baseXPRate: number;
  startRequirements?: {
    minOverskudd?: number;
    minEnergy?: number;
    // etc.
  };
}
```

### Sonner Toast Setup
```typescript
// In App.tsx - add Toaster component
import { Toaster } from 'sonner';

function App() {
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      {/* existing content */}
    </div>
  );
}

// In ActivityStore - trigger toasts
import { toast } from 'sonner';

private notifyRefusal(activity: Activity, reason: string): void {
  toast.error(reason, {
    description: `${activity.name} skipped`,
    duration: 3000,
  });
}

private notifyCompletion(activity: Activity): void {
  toast.success(`${activity.name} completed!`, {
    duration: 2000,
  });
}
```

### Mastery XP Formula (Claude's Discretion Implementation)
```typescript
// Mastery levels 1-10, escalating XP requirements
// Formula: 100 * level^1.5 (polynomial, not exponential)
getMasteryXPRequired(level: number): number {
  if (level >= 10) return Infinity;
  return Math.floor(100 * Math.pow(level + 1, 1.5));
}
// Level 1->2: 283 XP
// Level 5->6: 665 XP
// Level 9->10: 1000 XP

// Mastery effects on efficiency
getMasteryDrainReduction(masteryLevel: number): number {
  // 0% at level 1, up to 27% at level 10
  return (masteryLevel - 1) * 0.03;
}

getMasterySpeedBonus(masteryLevel: number): number {
  // 0% at level 1, up to 18% at level 10
  return (masteryLevel - 1) * 0.02;
}

// Diminishing XP returns (encourages variety)
getDomainXPMultiplier(masteryLevel: number): number {
  // 100% at level 1, down to 10% at level 10
  return 1 - (masteryLevel - 1) * 0.1;
}
```

### Resource Effect Application
```typescript
// During activity tick - apply resource effects
applyActivityEffects(activity: Activity, speedMultiplier: number): void {
  const character = this.root.characterStore.character!;
  const masteryBonus = activity.masteryBonus;

  for (const [key, baseEffect] of Object.entries(activity.resourceEffects)) {
    const resourceKey = key as ResourceKey;
    let effect = baseEffect! * speedMultiplier;

    // Mastery reduces drain, increases restore
    if (effect < 0) {
      effect *= (1 - this.getMasteryDrainReduction(activity.masteryLevel));
    } else {
      effect *= (1 + masteryBonus * 0.5); // modest restore bonus
    }

    // Personality modifier stacking (from CONTEXT.md decision)
    const personalityMod = character.effectiveDrainRate(resourceKey) -
                          (BASE_DRAIN_RATES[resourceKey] ?? 0);
    effect += personalityMod * speedMultiplier;

    character.resources[resourceKey] = clampResource(
      character.resources[resourceKey] + effect
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global state polling | MobX observer pattern | Already using | UI updates automatically |
| Custom toast divs | Sonner/react-hot-toast | 2023-2024 | <5KB, accessible, animated |
| Boolean flags for state | State machine pattern | Long-standing | Cleaner transitions, no invalid states |
| Exponential XP curves | Polynomial curves | Game design consensus | Achievable high levels, predictable progression |

**Deprecated/outdated:**
- Manual DOM manipulation for toasts: Use declarative libraries
- setInterval per-system: Single tick loop, multiple subscribers

## Open Questions

Things that couldn't be fully resolved:

1. **Resource threshold for starting activities**
   - What we know: User decided "enough willpower/overskudd to begin"
   - What's unclear: Exact threshold value (10? 20? 30?)
   - Recommendation: Start with 20, make configurable via constant

2. **Early failure detection granularity**
   - What we know: "If key resources deplete during activity, character fails early"
   - What's unclear: Which resources are "key" per activity, exact failure threshold
   - Recommendation: Per-activity config `failureConditions: { resource: ResourceKey, threshold: number }[]`

3. **XP display during activity**
   - What we know: "Live XP counter visible during activity"
   - What's unclear: UI placement, update frequency
   - Recommendation: Show in ActivityCard when active, update every tick

## Sources

### Primary (HIGH confidence)
- Existing codebase: Character.ts, Skill.ts, SimulationStore.ts, SkillStore.ts patterns
- [MobX Documentation - Observable State](https://mobx.js.org/observable-state.html)
- [Game Programming Patterns - State](https://gameprogrammingpatterns.com/state.html)
- [Game Programming Patterns - Event Queue](https://gameprogrammingpatterns.com/event-queue.html)

### Secondary (MEDIUM confidence)
- [Sonner GitHub](https://github.com/emilkowalski/sonner) - Toast API patterns
- [react-hot-toast](https://react-hot-toast.com/) - Alternative toast patterns
- [daisyUI Toast Component](https://daisyui.com/components/toast/) - CSS positioning classes

### Tertiary (LOW confidence)
- WebSearch results for XP formulas - general game design patterns, not specific to this domain

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries, patterns verified in codebase
- Architecture: HIGH - Following established entity/store/component pattern
- Pitfalls: HIGH - Based on existing codebase analysis and verified game patterns
- XP formulas: MEDIUM - Standard game design patterns, specifics are Claude's discretion

**Research date:** 2026-01-21
**Valid until:** 30 days (stable patterns, no fast-moving dependencies)
