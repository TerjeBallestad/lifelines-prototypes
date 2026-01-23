# Phase 7: Primary Needs Foundation - Research

**Researched:** 2026-01-23
**Domain:** Needs-based simulation system with differential decay rates
**Confidence:** HIGH

## Summary

This phase implements a seven-need system (Hunger, Energy, Hygiene, Bladder, Social, Fun, Security) with differential decay rates, visual feedback via color-coded bars, and parallel operation with the existing v1.0 resource system via a global toggle. The research examined The Sims needs mechanics, TypeScript simulation patterns, asymptotic decay curves, and feature toggle best practices.

The existing codebase uses MobX for reactive state management with a tick-based simulation system already processing resource decay. The new needs system extends this pattern with additional decay logic, personality modifiers, and visual grouping. The primary challenge is maintaining two parallel systems cleanly while avoiding code duplication and confusion.

**Primary recommendation:** Extend the existing Character entity with a parallel needs system, add a NeedsConfig to BalanceConfigStore for tunable decay rates, implement asymptotic decay using exponential approach curves, and use conditional rendering based on a global toggle stored in RootStore.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Reactive state management | Already used throughout project, automatic dependency tracking |
| mobx-react-lite | 4.1.1 | React integration | Existing pattern for observable components |
| TypeScript | ~5.9.3 | Type safety | Current project standard, provides strong typing for needs |
| React | 19.2.0 | UI framework | Current project framework |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional CSS classes | Color-coded urgency states |
| DaisyUI | 5.5.14 | UI component library | Progress bars and toggles |
| Tailwind CSS | 4.1.18 | Styling | Color gradients for urgency levels |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MobX | Zustand, Redux | Already integrated, no benefit to switching |
| DaisyUI progress bars | Custom HTML5 progress | DaisyUI provides consistent styling |
| Global toggle in RootStore | LocalStorage | Store-based toggle integrates better with MobX reactivity |

**Installation:**
```bash
# No new dependencies required - all libraries already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Character.ts          # Extend with needs system
│   ├── types.ts               # Add Needs interface
├── stores/
│   ├── RootStore.ts           # Add global needsSystemEnabled toggle
│   ├── SimulationStore.ts     # Tick processing (no changes needed)
├── config/
│   ├── balance.ts             # Add NeedsConfig section
├── components/
│   ├── NeedsPanel.tsx         # NEW: Needs display component
│   ├── NeedBar.tsx            # NEW: Individual need bar with color gradient
│   ├── ResourcePanel.tsx      # Existing: conditionally hide when needs enabled
└── utils/
    └── needsDecay.ts          # NEW: Asymptotic decay calculations
```

### Pattern 1: Parallel System with Toggle
**What:** Two resource systems (v1.0 resources, v1.1 needs) exist in the same Character entity, controlled by a global toggle
**When to use:** Migration scenarios where old and new systems must coexist
**Example:**
```typescript
// Source: Based on parallel run pattern from Zalando Engineering (migration technique)
// In Character.ts
export class Character {
  resources: Resources;  // v1.0 system
  needs?: Needs;         // v1.1 system (optional, populated if enabled)

  applyTickUpdate(speedMultiplier: number): void {
    const needsEnabled = this.root?.needsSystemEnabled ?? false;

    if (needsEnabled && this.needs) {
      this.applyNeedsDecay(speedMultiplier);
    } else {
      this.applyResourceDecay(speedMultiplier);
    }
  }
}

// In RootStore.ts
export class RootStore {
  needsSystemEnabled = false;

  toggleNeedsSystem(): void {
    this.needsSystemEnabled = !this.needsSystemEnabled;
    // Re-initialize all characters when toggling
    for (const char of this.characterStore.allCharacters) {
      if (this.needsSystemEnabled) {
        char.initializeNeeds();
      }
    }
  }
}
```

### Pattern 2: Asymptotic Decay Curve
**What:** Decay slows as value approaches zero, preventing instant bottoming-out
**When to use:** When you want critical states to be dangerous but not instant death spirals
**Example:**
```typescript
// Source: Based on exponential decay principles (Wikipedia, TI Education)
// Decay formula: newValue = currentValue - (baseRate * (currentValue / 100) * speedMultiplier)
// This makes decay proportional to current value, slowing near zero

function applyAsymptoticDecay(
  currentValue: number,
  baseDecayRate: number,
  speedMultiplier: number
): number {
  // Asymptotic: decay slows as value approaches zero
  const decayAmount = baseDecayRate * (currentValue / 100) * speedMultiplier;
  const newValue = currentValue - decayAmount;

  // Clamp to [0, 100] range
  return Math.max(0, Math.min(100, newValue));
}

// Alternative: Exponential approach to floor value
function applyAsymptoticToFloor(
  currentValue: number,
  baseDecayRate: number,
  speedMultiplier: number,
  floor = 5  // Never quite reaches 0, bottoms at floor
): number {
  const distance = currentValue - floor;
  const decayAmount = baseDecayRate * (distance / 100) * speedMultiplier;
  return Math.max(floor, currentValue - decayAmount);
}
```

### Pattern 3: Color-Coded Urgency States
**What:** Progress bars use color gradients (green → yellow → orange → red) based on thresholds
**When to use:** Visual feedback for urgency levels in needs/health systems
**Example:**
```typescript
// Source: Carbon Design System status indicators, UX best practices
function getNeedUrgencyColor(value: number): string {
  if (value >= 70) return 'bg-success';      // Green
  if (value >= 40) return 'bg-warning';      // Yellow/Orange
  if (value >= 20) return 'bg-orange-500';   // Orange
  return 'bg-error';                         // Red (critical)
}

// For gradient bars (DaisyUI/Tailwind)
function getNeedGradientClasses(value: number): string {
  if (value >= 70) return 'bg-gradient-to-r from-green-400 to-green-600';
  if (value >= 40) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
  if (value >= 20) return 'bg-gradient-to-r from-orange-500 to-red-500';
  return 'bg-gradient-to-r from-red-500 to-red-700';
}
```

### Pattern 4: Differential Decay Rates by Category
**What:** Physiological needs decay 3-4x faster than social needs
**When to use:** Creating urgency hierarchy in needs systems
**Example:**
```typescript
// Source: The Sims modding community (MCCC motive decay rates)
// In config/balance.ts
export interface NeedsConfig {
  // Physiological needs (fast decay, 3-4 hour timescale)
  hungerDecayRate: number;      // ~0.8-1.0 per tick
  bladderDecayRate: number;     // ~0.7-0.9 per tick
  energyDecayRate: number;      // ~0.6-0.8 per tick
  hygieneDecayRate: number;     // ~0.4-0.6 per tick

  // Social needs (slow decay, 12-24 hour timescale)
  socialDecayRate: number;      // ~0.2-0.3 per tick
  funDecayRate: number;         // ~0.15-0.25 per tick
  securityDecayRate: number;    // ~0.1-0.2 per tick
}

// The Sims 4 reference: hunger decays in 4-6 hours, bladder in 8-12 hours
// Social needs are roughly 3-4x slower
```

### Anti-Patterns to Avoid
- **Mixing systems in UI:** Don't show both resources and needs simultaneously - user confusion guaranteed
- **Linear decay to zero:** Creates frustrating death spirals where multiple needs bottom out at once
- **Hard-coded decay rates:** All rates must be in BalanceConfig for tuning
- **Toggle per character:** Global toggle only - per-character creates inconsistent experience
- **Shared activity code before Phase 10:** Keep activity-need integration in separate phase

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Feature toggle UI | Custom toggle component | DaisyUI toggle + label | Accessible, keyboard nav, consistent styling |
| Color gradient logic | Manual RGB interpolation | Tailwind gradient classes + thresholds | Browser-optimized, no perf issues |
| Progress bar visualization | Canvas/SVG from scratch | DaisyUI progress bars | Accessibility, responsive, themeable |
| Asymptotic curves | Custom exponential decay | Standard exponential approach formula | Math errors common, use proven formula |
| Toggle state persistence | LocalStorage + sync logic | MobX observable in RootStore | Reactivity built-in, no stale state |

**Key insight:** The Sims franchise has 25+ years of needs system refinement. Don't reinvent decay curves, urgency thresholds, or decay rate ratios - learn from proven patterns.

## Common Pitfalls

### Pitfall 1: Linear Decay Death Spiral
**What goes wrong:** Linear decay (constant rate regardless of value) causes multiple needs to hit zero simultaneously, creating unrecoverable states
**Why it happens:** Context decision chose linear decay for simplicity, but combined with multiple needs, this creates cascading failures
**How to avoid:** Implement asymptotic decay that slows approaching zero, giving player time to react
**Warning signs:** Playtest shows "everything goes red at once" patterns

### Pitfall 2: Division by Zero in Decay Calculations
**What goes wrong:** JavaScript division by zero returns Infinity, causing NaN propagation in calculations
**Why it happens:** When using percentage-based decay (e.g., `decay * (value / maxValue)`), edge cases at zero cause problems
**How to avoid:** Always use Math.max() to clamp floor values, or check for zero before dividing
**Warning signs:** NaN appearing in need values, progress bars showing 0/0
```typescript
// BAD: Can cause NaN
const decay = baseRate * (current / max);

// GOOD: Safe against zero
const decay = baseRate * (Math.max(1, current) / max);
```

### Pitfall 3: Forgetting Personality Modifiers
**What goes wrong:** Decay rates are constant for all characters, ignoring personality system
**Why it happens:** Context specified personality modifies decay (high Neuroticism = faster Security decay), but easy to forget in implementation
**How to avoid:** Follow existing pattern from Character.ts activeModifiers - create needsModifiers computed property
**Warning signs:** All characters feel identical, personality traits have no gameplay impact

### Pitfall 4: Toggle Without Re-initialization
**What goes wrong:** Switching from resources to needs shows stale/undefined need values
**Why it happens:** Needs not initialized until toggle enabled, but UI tries to render immediately
**How to avoid:** When toggle flips to needs mode, call initializeNeeds() on all characters to populate starting values
**Warning signs:** Blank bars, console errors about undefined need properties

### Pitfall 5: Hard-Coded Thresholds
**What goes wrong:** Critical threshold (20%), urgency colors, decay rates are magic numbers in components
**Why it happens:** Fast prototyping leads to inline constants
**How to avoid:** All thresholds in BalanceConfig, all decay rates in NeedsConfig
**Warning signs:** Search codebase finds `value < 20` in multiple files

### Pitfall 6: UI Group Confusion
**What goes wrong:** Seven needs in one flat list is visually overwhelming
**Why it happens:** Copying ResourcePanel pattern without considering grouping
**How to avoid:** Context specified two groups: Physiological (Hunger, Energy, Hygiene, Bladder) and Social (Social, Fun, Security) - render as separate sections
**Warning signs:** User feedback says "too much information", hard to scan

### Pitfall 7: Hover Details Without Rate Display
**What goes wrong:** Bars show current percentage but not decay rate, making it hard to prioritize
**Why it happens:** Copying v1.0 resource bars that don't show rates
**How to avoid:** Context specified hover reveals percentage AND decay rate - implement tooltip on hover
**Warning signs:** Player can't distinguish which need will become critical first

## Code Examples

Verified patterns from official sources:

### Needs Interface Definition
```typescript
// In entities/types.ts
export interface Needs {
  // Physiological (fast decay)
  hunger: number;       // 0 = starving, 100 = full
  energy: number;       // 0 = exhausted, 100 = rested
  hygiene: number;      // 0 = filthy, 100 = clean
  bladder: number;      // 0 = accident, 100 = empty

  // Social (slow decay)
  social: number;       // 0 = isolated, 100 = fulfilled
  fun: number;          // 0 = bored, 100 = entertained
  security: number;     // 0 = anxious, 100 = secure
}

export type NeedKey = keyof Needs;

export function defaultNeeds(): Needs {
  return {
    hunger: 80,
    energy: 100,
    hygiene: 100,
    bladder: 100,
    social: 70,
    fun: 60,
    security: 50,
  };
}
```

### Balance Config Extension
```typescript
// In config/balance.ts
export interface NeedsConfig {
  // Decay rates per tick (asymptotic formula applied)
  hungerDecayRate: number;
  energyDecayRate: number;
  hygieneDecayRate: number;
  bladderDecayRate: number;
  socialDecayRate: number;
  funDecayRate: number;
  securityDecayRate: number;

  // Personality modifier strength
  personalityModifierNeeds: number;  // Multiplier for personality effects on needs

  // Threshold for critical state
  criticalThreshold: number;  // Below this = red bar + warnings
}

export const DEFAULT_NEEDS_CONFIG: NeedsConfig = {
  // Physiological: 3-4x faster than social
  hungerDecayRate: 0.9,
  energyDecayRate: 0.7,
  hygieneDecayRate: 0.5,
  bladderDecayRate: 0.8,

  // Social: slower decay
  socialDecayRate: 0.25,
  funDecayRate: 0.2,
  securityDecayRate: 0.15,

  personalityModifierNeeds: 1.0,
  criticalThreshold: 20,
};

// Extend BalanceConfig interface
export interface BalanceConfig {
  // ... existing fields
  needs: NeedsConfig;
}
```

### Character Needs Integration
```typescript
// In entities/Character.ts
export class Character {
  // ... existing fields
  needs?: Needs;  // Optional: only populated when needs system enabled

  // Initialize needs when system enabled
  initializeNeeds(): void {
    this.needs = defaultNeeds();
  }

  // Computed: Personality modifiers for needs
  get needsModifiers(): Map<NeedKey, number> {
    const modifiers = new Map<NeedKey, number>();
    const strength = this.root?.balanceConfig?.config.needs.personalityModifierNeeds ?? 1.0;

    // High Extraversion = faster Social decay
    if (this.personality.extraversion > 60) {
      const mod = ((this.personality.extraversion - 50) / 50) * strength;
      modifiers.set('social', 1 + mod);
    }

    // High Neuroticism = faster Security decay
    if (this.personality.neuroticism > 60) {
      const mod = ((this.personality.neuroticism - 50) / 50) * strength;
      modifiers.set('security', 1 + mod);
    }

    return modifiers;
  }

  // Apply needs decay each tick
  applyNeedsDecay(speedMultiplier: number): void {
    if (!this.needs || !this.root?.balanceConfig) return;

    const config = this.root.balanceConfig.config.needs;
    const modifiers = this.needsModifiers;

    // Decay each need with asymptotic curve
    this.needs.hunger = applyAsymptoticDecay(
      this.needs.hunger,
      config.hungerDecayRate * (modifiers.get('hunger') ?? 1),
      speedMultiplier
    );

    // Repeat for other needs...
  }
}
```

### Toggle Implementation
```typescript
// In stores/RootStore.ts
export class RootStore {
  needsSystemEnabled = false;

  constructor() {
    makeAutoObservable(this);
    // ... existing initialization
  }

  toggleNeedsSystem(): void {
    this.needsSystemEnabled = !this.needsSystemEnabled;

    if (this.needsSystemEnabled) {
      // Initialize needs for all characters
      for (const char of this.characterStore.allCharacters) {
        char.initializeNeeds();
      }
    }
  }
}

// In components/SimulationControls.tsx or new SystemToggle component
export const SystemToggle = observer(function SystemToggle() {
  const root = useRootStore();

  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-2">
        <span className="label-text">v1.1 Needs System</span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={root.needsSystemEnabled}
          onChange={() => root.toggleNeedsSystem()}
        />
      </label>
    </div>
  );
});
```

### Need Bar Component
```typescript
// In components/NeedBar.tsx
interface NeedBarProps {
  value: number;
  label: string;
  decayRate: number;
  critical: boolean;
}

export const NeedBar = observer(function NeedBar({
  value,
  label,
  decayRate,
  critical
}: NeedBarProps) {
  const percentage = Math.round(value);
  const colorClass = getNeedUrgencyColor(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className={critical ? 'text-error font-bold' : ''}>{label}</span>
        <span className="text-base-content/70">{percentage}%</span>
      </div>
      <progress
        className={`progress ${colorClass} w-full`}
        value={percentage}
        max="100"
        title={`Decay rate: ${decayRate.toFixed(2)}/tick`}
      />
    </div>
  );
});
```

### Needs Panel with Grouping
```typescript
// In components/NeedsPanel.tsx
interface NeedsPanelProps {
  needs: Needs;
  decayRates: Map<NeedKey, number>;
  criticalThreshold: number;
}

export const NeedsPanel = observer(function NeedsPanel({
  needs,
  decayRates,
  criticalThreshold
}: NeedsPanelProps) {
  const physiological: NeedKey[] = ['hunger', 'energy', 'hygiene', 'bladder'];
  const social: NeedKey[] = ['social', 'fun', 'security'];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Physiological Group */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-base-content/70">Physiological</h3>
        <div className="grid grid-cols-2 gap-4">
          {physiological.map(key => (
            <NeedBar
              key={key}
              value={needs[key]}
              label={getNeedLabel(key)}
              decayRate={decayRates.get(key) ?? 0}
              critical={needs[key] < criticalThreshold}
            />
          ))}
        </div>
      </div>

      {/* Social Group */}
      <div>
        <h3 className="text-sm font-bold mb-3 text-base-content/70">Social & Wellbeing</h3>
        <div className="grid grid-cols-2 gap-4">
          {social.map(key => (
            <NeedBar
              key={key}
              value={needs[key]}
              label={getNeedLabel(key)}
              decayRate={decayRates.get(key) ?? 0}
              critical={needs[key] < criticalThreshold}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

function getNeedLabel(key: NeedKey): string {
  const labels: Record<NeedKey, string> = {
    hunger: 'Hunger',
    energy: 'Energy',
    hygiene: 'Hygiene',
    bladder: 'Bladder',
    social: 'Social',
    fun: 'Fun',
    security: 'Security',
  };
  return labels[key];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Linear decay to zero | Asymptotic decay with floor | Research findings 2026 | Prevents death spirals, gives reaction time |
| Single flat resource list | Grouped by category (Physiological/Social) | User research 2024-2026 | Reduces cognitive load, clearer priorities |
| Global state toggles via LocalStorage | MobX reactive toggles in RootStore | MobX adoption 2020+ | Automatic UI updates, no stale state |
| Custom progress bars | DaisyUI/Tailwind component library | 2023+ | Accessibility built-in, consistent theming |
| Hard-coded decay rates | Runtime-tunable BalanceConfig | Game design iteration needs 2024+ | Rapid iteration without code changes |

**Deprecated/outdated:**
- **The Sims 1 linear decay**: Modern games use curves to avoid death spirals (The Sims 4 uses decay modifiers, not pure linear)
- **Single-color progress bars**: Modern UX uses gradient color states for urgency (green → yellow → orange → red is standard)
- **Redux for simple state**: MobX provides simpler patterns for observable game state in 2026

## Open Questions

Things that couldn't be fully resolved:

1. **Exact decay rate calibration**
   - What we know: The Sims 4 hunger decays in 4-6 hours, bladder in 8-12 hours; 3-4x spread between physiological and social
   - What's unclear: Project's tick rate (currently 1000ms) and desired gameplay session length (30 min? 2 hours?)
   - Recommendation: Start with suggested rates in DEFAULT_NEEDS_CONFIG, use DevTools to tune during playtesting

2. **Sleep-time decay behavior**
   - What we know: Context specifies Bladder and Hunger decay during sleep, others pause
   - What's unclear: How to detect "sleep" state - is it an activity? A character flag?
   - Recommendation: Defer sleep-specific logic to Phase 10 (Activity-Need Integration) when sleep activity exists

3. **Critical failure event triggers**
   - What we know: Context defines thresholds (Bladder accident at ~5%, critical UI at 20%)
   - What's unclear: Whether Phase 7 should implement event triggers or just visual warnings
   - Recommendation: Phase 7 focuses on decay + visual feedback; defer actual failure events to later phase

4. **Save data migration strategy**
   - What we know: Context leaves this to Claude's discretion (initialize fresh vs infer from v1.0)
   - What's unclear: Whether to map v1.0 resources to v1.1 needs (e.g., energy → energy) or start fresh
   - Recommendation: Initialize fresh with defaultNeeds() - simpler and avoids semantic mismatches

## Sources

### Primary (HIGH confidence)
- MobX Official Documentation - https://mobx.js.org/the-gist-of-mobx.html
- Existing codebase patterns (Character.ts, SimulationStore.ts, balance.ts) - verified implementation patterns
- TypeScript MobX state management (GitHub mobxjs/mobx) - https://github.com/mobxjs/mobx

### Secondary (MEDIUM confidence)
- The Sims modding community motive decay rates - https://www.patreon.com/posts/tutorial-mod-31900358
- Parallel run migration pattern (Zalando Engineering) - https://engineering.zalando.com/posts/2021/11/parallel-run.html
- Exponential decay fundamentals (TI Education, Wikipedia) - https://education.ti.com/-/media/61029F0123F4416E8EB2173B61503A45
- Carbon Design System status indicators - https://carbondesignsystem.com/patterns/status-indicator-pattern/
- Feature flags in React best practices - https://medium.com/@ignatovich.dm/implementing-feature-flags-in-react-a-comprehensive-guide-f85266265fb3

### Tertiary (LOW confidence)
- TypeScript ECS libraries (sim-ecs, tick-knock) - https://github.com/NSSTC/sim-ecs - referenced for simulation patterns but not directly applicable
- BProgress React progress library - https://www.cssscript.com/modern-progress-bar-bprogress/ - alternative to DaisyUI if more customization needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, patterns exist in codebase
- Architecture: HIGH - Extending proven MobX patterns, parallel system approach well-documented
- Pitfalls: MEDIUM - Common game dev mistakes documented, but specific to project's needs system

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days, stable domain - needs systems are well-established patterns)
