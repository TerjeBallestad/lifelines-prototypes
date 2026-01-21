# Phase 2: Character Core - Research

**Researched:** 2026-01-20
**Domain:** Personality/Capacity/Resource Data Models, Visualization, Time-based Simulation
**Confidence:** HIGH

## Summary

This phase implements the psychological foundation of the character system: Big Five personality traits, mental capacities, and 9 resource types. The primary challenges are:

1. **Visualization**: Radar/pentagon charts for personality+capacities, circular gauges for 9 resources
2. **Modifier system**: Personality affects resource drain/recovery rates with additive stacking (per CONTEXT.md decision)
3. **Time-based simulation**: Hybrid system with real-time base decay plus discrete activity changes

The existing codebase already has basic `Personality`, `Capacities`, and `Resources` interfaces in `src/entities/types.ts` with the Character class in `src/entities/Character.ts`. This phase extends these with the full 9 resources, adds the modifier calculation system, implements time-based drain/recovery, and creates visual representations.

**Primary recommendation:** Use Recharts for the radar chart (native React, SVG-based, minimal D3 dependencies), DaisyUI's built-in radial-progress for circular gauges (already in stack), and a singleton SimulationClock store for time-based resource updates.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Reactive state for resources/modifiers | Already in codebase, computed properties ideal for derived values |
| mobx-react-lite | 4.1.1 | React integration | Already in codebase |
| DaisyUI | 5.5.14 | UI components including radial-progress | Already in codebase, has built-in circular gauge |
| Tailwind CSS | 4.1.18 | Styling | Already in codebase |

### To Install
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^2.15+ | Radar chart for personality/capacities | Pentagon visualization with 5 (personality) or 6 (capacities) vertices |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | react-chartjs-2 | Canvas-based vs SVG; Recharts has better React integration |
| Recharts | Pure SVG | More control but more code; Recharts handles polar math |
| DaisyUI radial-progress | react-circular-progressbar | External dependency; DaisyUI already included |

**Installation:**
```bash
npm install recharts
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── types.ts           # Extended with 9 resources, modifier types
│   ├── Character.ts       # Extended with modifier calculations
│   └── Modifiers.ts       # NEW: Modifier calculation logic
├── stores/
│   ├── RootStore.ts       # Existing
│   ├── CharacterStore.ts  # Existing
│   └── SimulationStore.ts # NEW: Clock singleton + simulation speed
├── components/
│   ├── CharacterCard.tsx  # Existing - will be refactored
│   ├── PersonalityRadar.tsx    # NEW: Radar chart for Big Five
│   ├── CapacitiesRadar.tsx     # NEW: Radar chart for 6 capacities
│   ├── ResourceGauge.tsx       # NEW: Single circular gauge
│   ├── ResourcePanel.tsx       # NEW: All 9 gauges in flat list
│   └── CharacterPanel.tsx      # NEW: Sidebar with all visualizations
└── utils/
    └── modifiers.ts       # Pure functions for modifier math
```

### Pattern 1: Extended Resource Interface (9 Resources)

**What:** Per CONTEXT.md, the Resources interface must include all 9 resource types
**When to use:** Any resource display or modification

```typescript
// src/entities/types.ts - Extended Resources
export interface Resources {
  // Original 3
  energy: number;
  socialBattery: number;
  stress: number;
  // Additional 6 from CONTEXT.md
  overskudd: number;      // Norwegian: surplus/capacity/headroom
  mood: number;
  motivation: number;
  security: number;
  focus: number;          // Focus/Attention
  nutrition: number;      // Nutrition/Health
}

export function defaultResources(): Resources {
  return {
    energy: 100,
    socialBattery: 100,
    stress: 0,            // Low stress = good
    overskudd: 100,
    mood: 50,
    motivation: 50,
    security: 50,
    focus: 100,
    nutrition: 100,
  };
}
```

### Pattern 2: Modifier Calculation with Additive Stacking

**What:** Personality traits affect resource drain/recovery rates. Per CONTEXT.md: subtle (10-20%), additive combination.
**When to use:** Computing effective drain/recovery rates

```typescript
// src/utils/modifiers.ts
export interface ResourceModifier {
  resourceKey: keyof Resources;
  source: string;           // e.g., "low extraversion"
  drainModifier: number;    // -0.2 to +0.2 (-20% to +20%)
  recoveryModifier: number; // -0.2 to +0.2
}

// Linear scaling: 50 = neutral, extremes matter proportionally
export function personalityToModifier(traitValue: number): number {
  // 0 = -0.20, 50 = 0, 100 = +0.20
  return ((traitValue - 50) / 50) * 0.20;
}

// Combine modifiers additively (per CONTEXT.md decision)
export function combineModifiers(modifiers: number[]): number {
  return modifiers.reduce((sum, mod) => sum + mod, 0);
}

// Calculate effective rate: baseRate * (1 + combinedModifier)
export function applyModifiers(baseRate: number, modifiers: number[]): number {
  const combined = combineModifiers(modifiers);
  return baseRate * (1 + combined);
}
```

### Pattern 3: Simulation Clock Singleton

**What:** Centralized time management for resource drain/recovery
**When to use:** Any time-based resource changes

```typescript
// src/stores/SimulationStore.ts
import { makeAutoObservable, action, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export class SimulationStore {
  // Simulation time (game ticks)
  tickCount = 0;

  // Speed multiplier (1 = normal, 0 = paused)
  speed = 1;

  // Real-time interval handle
  private intervalHandle: number | null = null;

  // Tick rate in ms (how often we update)
  private readonly TICK_RATE_MS = 1000;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, {
      start: action,
      stop: action,
      tick: action,
      setSpeed: action,
    });
  }

  start(): void {
    if (this.intervalHandle !== null) return;
    this.intervalHandle = window.setInterval(() => {
      if (this.speed > 0) {
        this.tick();
      }
    }, this.TICK_RATE_MS);
  }

  stop(): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  tick(): void {
    this.tickCount += 1;
    // Delegate resource updates to character
    this.root.characterStore.character?.applyTickUpdate(this.speed);
  }

  setSpeed(newSpeed: number): void {
    this.speed = Math.max(0, Math.min(10, newSpeed)); // Clamp 0-10x
  }
}
```

### Pattern 4: DaisyUI Radial Progress for Resource Gauges

**What:** Built-in DaisyUI component for circular progress
**When to use:** Displaying any resource as a gauge

```tsx
// src/components/ResourceGauge.tsx
import { observer } from 'mobx-react-lite';

interface ResourceGaugeProps {
  value: number;
  label: string;
  maxValue?: number;
  modifierDescription?: string; // e.g., "+15% drain (low extraversion)"
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

export const ResourceGauge = observer(function ResourceGauge({
  value,
  label,
  maxValue = 100,
  modifierDescription,
  color = 'primary',
}: ResourceGaugeProps) {
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`radial-progress text-${color}`}
        style={{ '--value': percentage, '--size': '4rem' } as React.CSSProperties}
        role="progressbar"
        aria-valuenow={percentage}
        aria-label={label}
      >
        <span className="text-xs">{Math.round(value)}</span>
      </div>
      <span className="text-xs text-base-content/70">{label}</span>
      {modifierDescription && (
        <span className="text-xs text-base-content/50">{modifierDescription}</span>
      )}
    </div>
  );
});
```

### Pattern 5: Recharts Radar Chart for Personality

**What:** Pentagon chart showing Big Five dimensions
**When to use:** Personality visualization (5 points) or Capacities (6 points)

```tsx
// src/components/PersonalityRadar.tsx
import { observer } from 'mobx-react-lite';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { Personality } from '../entities/types';

interface PersonalityRadarProps {
  personality: Personality;
}

export const PersonalityRadar = observer(function PersonalityRadar({
  personality,
}: PersonalityRadarProps) {
  // Transform to Recharts format with full labels (per CONTEXT.md)
  const data = [
    { trait: 'Openness', value: personality.openness },
    { trait: 'Conscientiousness', value: personality.conscientiousness },
    { trait: 'Extraversion', value: personality.extraversion },
    { trait: 'Agreeableness', value: personality.agreeableness },
    { trait: 'Neuroticism', value: personality.neuroticism },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="trait" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
        <Radar
          dataKey="value"
          stroke="oklch(var(--p))"
          fill="oklch(var(--p))"
          fillOpacity={0.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
});
```

### Anti-Patterns to Avoid

- **Multiple setInterval timers:** Use single SimulationStore clock, never create timers in components
- **Mutating resources directly:** Always go through MobX actions for Unreal portability
- **Hardcoded modifier values:** Use computed properties that derive from personality
- **DOM-based animations for gauges:** DaisyUI handles this; don't add JS animation libraries

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Radar/spider chart | SVG polygon math | Recharts RadarChart | Polar coordinates, axis labels, responsiveness |
| Circular progress | SVG arc with stroke-dasharray | DaisyUI radial-progress | Already styled, accessible, theme-integrated |
| Timer management | Raw setInterval per resource | Single SimulationStore clock | Drift prevention, centralized speed control |
| Reactive derived values | Manual recalculation | MobX computed | Automatic caching, dependency tracking |

**Key insight:** DaisyUI already includes radial-progress component that matches the design system. Adding react-circular-progressbar would duplicate functionality and add bundle size.

## Common Pitfalls

### Pitfall 1: Timer Drift with Multiple Intervals

**What goes wrong:** Each resource has its own setInterval, they drift apart over time
**Why it happens:** JavaScript timers are not precise; multiple timers compound errors
**How to avoid:** Single SimulationStore clock that broadcasts ticks to all subscribers
**Warning signs:** Resources updating at slightly different times, visual jitter

### Pitfall 2: Computed Properties Not Updating

**What goes wrong:** MobX computed values seem stale or don't trigger re-renders
**Why it happens:** Accessing observables outside of tracked context (e.g., in callbacks)
**How to avoid:** Ensure all reads happen within observer components or reactions
**Warning signs:** Console warnings about reading observables outside of reactive context

### Pitfall 3: Stress Inversion Confusion

**What goes wrong:** High stress shown as "full" gauge when it should feel bad
**Why it happens:** Stress is inverse (0 = good, 100 = bad) unlike other resources
**How to avoid:** Either invert display (100-stress) or use warning/error colors at high values
**Warning signs:** Users confused about stress meter meaning

### Pitfall 4: Modifier Display Clutter

**What goes wrong:** Too many modifier details visible at once, overwhelming UI
**Why it happens:** Trying to show all math at all times
**How to avoid:** Per CONTEXT.md: "Simple label visible, hover/click reveals exact math"
**Warning signs:** Character panel feels like a spreadsheet

### Pitfall 5: Resource Boundary Edge Cases

**What goes wrong:** Resources go negative or above 100, UI breaks
**Why it happens:** Drain/recovery rates not clamped properly
**How to avoid:** Always clamp resources to [0, 100] in the update action
**Warning signs:** NaN in displays, visual glitches at 0% or 100%

## Code Examples

Verified patterns from official sources:

### Recharts Radar Chart Setup

```tsx
// Source: Recharts documentation and GeeksForGeeks tutorial
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { subject: 'Openness', value: 65 },
  { subject: 'Conscientiousness', value: 80 },
  { subject: 'Extraversion', value: 30 },
  { subject: 'Agreeableness', value: 55 },
  { subject: 'Neuroticism', value: 45 },
];

<ResponsiveContainer width="100%" height={300}>
  <RadarChart data={data}>
    <PolarGrid />
    <PolarAngleAxis dataKey="subject" />
    <PolarRadiusAxis angle={90} domain={[0, 100]} />
    <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
  </RadarChart>
</ResponsiveContainer>
```

### DaisyUI Radial Progress

```html
<!-- Source: DaisyUI official documentation -->
<!-- Basic usage -->
<div class="radial-progress" style="--value:70;" role="progressbar">70%</div>

<!-- Custom size and color -->
<div
  class="radial-progress text-primary"
  style="--value:70; --size:4rem; --thickness:4px;"
  role="progressbar"
>
  70%
</div>
```

### MobX Clock Singleton Pattern

```typescript
// Source: Swizec Teller - Modeling Time in React
import { makeAutoObservable, action } from 'mobx';

class SimulationClock {
  tickCount = 0;
  private intervalHandle: number | null = null;

  constructor(private tickRateMs = 1000) {
    makeAutoObservable(this);
  }

  @action
  tick(): void {
    this.tickCount += 1;
  }

  start(): void {
    if (this.intervalHandle) return;
    this.intervalHandle = window.setInterval(() => this.tick(), this.tickRateMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

// Export singleton instance
export const simulationClock = new SimulationClock();
```

### Computed Modifiers in Character Class

```typescript
// Pattern for personality-based modifiers
import { makeAutoObservable, computed } from 'mobx';

class Character {
  personality: Personality;
  resources: Resources;

  constructor(/* ... */) {
    makeAutoObservable(this);
  }

  // Computed: Get all active modifiers for a resource
  get socialBatteryModifiers(): ResourceModifier[] {
    const mods: ResourceModifier[] = [];

    // Low extraversion = faster social drain
    if (this.personality.extraversion < 50) {
      const strength = ((50 - this.personality.extraversion) / 50) * 0.20;
      mods.push({
        resourceKey: 'socialBattery',
        source: 'low extraversion',
        drainModifier: strength,  // Positive = drains faster
        recoveryModifier: 0,
      });
    }

    return mods;
  }

  // Computed: Effective drain rate for social battery
  get socialBatteryDrainRate(): number {
    const baseRate = 1; // units per tick
    const modifiers = this.socialBatteryModifiers.map(m => m.drainModifier);
    return applyModifiers(baseRate, modifiers);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3.js direct DOM manipulation | Recharts declarative components | 2020+ | Better React integration, no DOM conflicts |
| Custom circular progress SVGs | DaisyUI radial-progress | DaisyUI 3+ | Built-in, accessible, themed |
| MobX decorators (@observable) | makeAutoObservable | MobX 6 (2020) | Simpler syntax, no decorator config |
| Multiple timers per system | Single simulation clock | Best practice | Prevents drift, centralized control |

**Deprecated/outdated:**
- `@observable` / `@action` decorators: Use makeAutoObservable instead (still works but requires config)
- react-vis radar chart: Deprecated, don't use
- Manual setInterval in components: Use store-based clock pattern

## Open Questions

Things that couldn't be fully resolved:

1. **Exact personality-to-resource mappings**
   - What we know: All 5 Big Five dimensions should affect at least one resource (per CONTEXT.md)
   - What's unclear: The specific mappings (which trait affects which resource, in what direction)
   - Recommendation: Define initial mappings based on psychology research, expose in dev UI for tuning

2. **Resource interaction rules**
   - What we know: CONTEXT.md marks this as "Claude's Discretion"
   - What's unclear: Whether/how resources affect each other (e.g., high stress -> faster energy drain)
   - Recommendation: Start without interactions, add if needed for emergent behavior

3. **Extremes-matter-more curve vs linear**
   - What we know: CONTEXT.md marks this as "Claude's Discretion"
   - What's unclear: Whether to use linear scaling or a curve where extremes (0, 100) have outsized effect
   - Recommendation: Start with linear (simpler to understand), can add curve if feels too subtle

4. **Consequence effects at resource boundaries**
   - What we know: CONTEXT.md confirms boundaries have consequences (exhaustion at 0 energy)
   - What's unclear: Exact effects to implement
   - Recommendation: Define simple flag states (isExhausted, isOverstressed) as computed properties

## Sources

### Primary (HIGH confidence)
- [DaisyUI Radial Progress](https://daisyui.com/components/radial-progress/) - Official component documentation
- [react-circular-progressbar GitHub](https://github.com/kevinsqi/react-circular-progressbar) - API and customization reference
- [MobX Computed Values](https://mobx.js.org/computeds.html) - Official MobX documentation
- [MobX Actions](https://mobx.js.org/actions.html) - Timer patterns

### Secondary (MEDIUM confidence)
- [Recharts Radar Chart](https://recharts.github.io/en-US/api/Radar/) - Official API
- [GeeksForGeeks Recharts Radar Tutorial](https://www.geeksforgeeks.org/create-a-radar-chart-using-recharts-in-reactjs/) - Implementation guide
- [Swizec - Modeling Time in React](https://swizec.com/blog/modeling-time-in-react/) - Clock singleton pattern

### Tertiary (LOW confidence)
- Game Mechanics Wiki - Resource drain patterns (general concepts, no code)
- Paradox Forums - Additive vs multiplicative stacking discussion
- Various game design resources on Big Five implementation in games

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing DaisyUI + adding well-documented Recharts
- Architecture: HIGH - MobX patterns well-established, timer singleton proven pattern
- Pitfalls: HIGH - Common issues documented in MobX and game dev resources
- Modifier math: MEDIUM - Game design best practices, but specific tuning is project-specific

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (stable libraries, no expected breaking changes)
