# Phase 6: Integration & Observation - Research

**Researched:** 2026-01-22
**Domain:** React dashboard design, emergence validation, dev tools patterns
**Confidence:** HIGH

## Summary

Phase 6 integrates all systems (personality, capacities, resources, skills, activities, talents) into a unified dashboard that demonstrates emergent behavior. The research focused on five key areas: (1) information-dense dashboard layout patterns, (2) side-by-side comparison UI for validating behavioral differences, (3) emergence testing and validation methodologies, (4) dev tools/debug UI patterns for game balance tuning, and (5) configuration management for runtime parameter adjustment.

The standard approach is to maintain the existing sidebar layout (already using CharacterPanel with radars and gauges) and polish it for information density, add a centralized collapsible dev tools panel using DaisyUI's native `<details>` element, implement side-by-side comparison using CSS Grid or flexbox (no library needed for this prototype), and create preset character archetypes based on Big Five extremes for emergence validation.

**Primary recommendation:** Keep existing React + MobX + DaisyUI stack, use native HTML `<details>` for collapsible dev tools, implement comparison mode with CSS Grid, create 6-8 preset archetypes covering Big Five extremes, and extract balance parameters to a typed configuration object (no external config file needed for prototype).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | 19.2.0 | UI framework | Already in use, modern concurrent features |
| MobX 6 | 6.15.0 | State management | Already implemented, reactive updates ideal for real-time simulation |
| DaisyUI | 5.5.14 | UI components | Already in use, provides collapse/accordion components |
| Recharts | 3.6.0 | Radar charts | Already in use, customizable tooltips for detailed info |
| Tailwind CSS | 4.1.18 | Styling | Already in use, utility-first for rapid dashboard polish |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional classes | Already in use, for dynamic styling based on state |
| TypeScript | 5.9.3 | Type safety | Already in use, essential for config typing |
| sonner | 2.0.7 | Toast notifications | Already in use, for user feedback during testing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<details>` | react-collapsed | Native is simpler, library offers more control (not needed here) |
| CSS Grid/Flexbox | react-split-pane | Library adds resizable panes (overkill for fixed comparison) |
| Config object | JSON file + Zod | External file adds complexity, object is simpler for prototype |

**Installation:**
No new packages needed - all required libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/           # UI components
│   ├── CharacterPanel.tsx       # Already exists - polish this
│   ├── DevToolsPanel.tsx        # NEW: Centralized dev controls
│   ├── ComparisonView.tsx       # NEW: Side-by-side layout
│   └── [existing panels...]
├── config/              # NEW: Configuration
│   └── balance.ts              # Game balance parameters
├── data/                # Seed data
│   └── archetypes.ts           # NEW: Preset characters
└── utils/               # Utilities
    └── archetype.ts            # NEW: Character generation helpers
```

### Pattern 1: Information-Dense Dashboard Layout
**What:** Single unified view with all information visible, using collapsible sections for less critical details
**When to use:** When users need to observe multiple systems simultaneously without switching views
**Example:**
```typescript
// Maintain existing sidebar + main layout, add density
<div className="flex min-h-screen">
  {/* Left sidebar - existing CharacterPanel */}
  <CharacterPanel />

  {/* Main content - all panels visible */}
  <main className="flex-1 p-4">
    {/* Stack all panels vertically */}
    <SkillTreePanel />
    <ActivityPanel />
    <TalentsPanel />

    {/* NEW: Centralized Dev Tools */}
    <DevToolsPanel />
  </main>
</div>
```
**Source:** Current App.tsx already follows this pattern, just needs polish and dev tools addition

### Pattern 2: Collapsible Dev Tools Panel
**What:** Use native HTML `<details>` element with DaisyUI collapse classes for expandable developer controls
**When to use:** For debug/testing UI that should be accessible but not always visible
**Example:**
```typescript
// Source: https://daisyui.com/components/collapse/
<details className="collapse collapse-arrow bg-base-200 border border-base-300">
  <summary className="collapse-title text-lg font-medium">
    Dev Tools
  </summary>
  <div className="collapse-content">
    {/* Simulation speed */}
    <div className="form-control">
      <label className="label">Simulation Speed: {speed}x</label>
      <input type="range" min="0" max="10" value={speed}
             onChange={e => setSpeed(Number(e.target.value))}
             className="range range-sm" />
    </div>

    {/* Balance parameters */}
    <div className="divider">Balance Parameters</div>
    {Object.entries(balanceConfig).map(([key, value]) => (
      <div key={key} className="form-control">
        <label className="label text-xs">{key}</label>
        <input type="number" value={value}
               onChange={e => updateBalance(key, Number(e.target.value))}
               className="input input-sm input-bordered" />
      </div>
    ))}

    {/* Reset button */}
    <button onClick={resetToDefaults} className="btn btn-sm btn-outline">
      Reset to Defaults
    </button>
  </div>
</details>
```
**Source:** DaisyUI collapse component documentation - https://daisyui.com/components/collapse/

### Pattern 3: Side-by-Side Comparison Mode
**What:** CSS Grid layout with two identical character instances running simultaneously
**When to use:** To validate that different personality/capacity combinations produce visibly different behavior
**Example:**
```typescript
// Split screen using CSS Grid
<div className="grid grid-cols-2 gap-4 min-h-screen">
  {/* Character 1 */}
  <div className="border-r border-base-300">
    <CharacterView characterId={char1Id} />
  </div>

  {/* Character 2 */}
  <div>
    <CharacterView characterId={char2Id} />
  </div>
</div>

// CharacterView mirrors existing layout
function CharacterView({ characterId }: { characterId: string }) {
  return (
    <div className="flex">
      <CharacterPanel characterId={characterId} />
      <main className="flex-1 p-2">
        <SkillTreePanel characterId={characterId} />
        <ActivityPanel characterId={characterId} />
        {/* ... etc */}
      </main>
    </div>
  );
}
```
**Source:** Standard CSS Grid pattern, no library needed - https://kashyapdeepak.medium.com/layout-component-design-patterns-in-react-splitscreen-layout-part-01-4a2cd77ce01

### Pattern 4: Preset Character Archetypes
**What:** Factory functions that generate characters with extreme Big Five trait combinations
**When to use:** For emergence testing - each archetype should produce distinct observable behavior
**Example:**
```typescript
// Source: Big Five personality research + game design patterns
// https://personalitynft.com/personality/traits/big-5/sloan/
// https://www.simplypsychology.org/big-five-personality.html

type ArchetypeConfig = {
  name: string;
  description: string;
  personality: Personality;
  expectedBehavior: string; // What we expect to observe
};

const ARCHETYPES: ArchetypeConfig[] = [
  {
    name: 'The Hermit',
    description: 'Low extraversion, high neuroticism',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 10,  // Very introverted
      agreeableness: 50,
      neuroticism: 90,   // High stress sensitivity
    },
    expectedBehavior: 'Avoids social activities, stress builds quickly, needs frequent rest',
  },
  {
    name: 'The Social Butterfly',
    description: 'High extraversion, low neuroticism',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 90,  // Very extraverted
      agreeableness: 50,
      neuroticism: 10,   // Low stress sensitivity
    },
    expectedBehavior: 'Seeks social activities, handles stress well, rarely needs rest',
  },
  {
    name: 'The Chaotic Creative',
    description: 'High openness, low conscientiousness',
    personality: {
      openness: 90,      // Very open
      conscientiousness: 10, // Very disorganized
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    expectedBehavior: 'Focus drains quickly, motivation unstable, prefers creative activities',
  },
  // ... 3-5 more archetypes covering other extremes
];

// Randomize function for unpredictable testing
function generateRandomArchetype(): CharacterData {
  return {
    id: crypto.randomUUID(),
    name: 'Random Character',
    personality: {
      openness: Math.random() * 100,
      conscientiousness: Math.random() * 100,
      extraversion: Math.random() * 100,
      agreeableness: Math.random() * 100,
      neuroticism: Math.random() * 100,
    },
    capacities: generateCapacities(), // Based on personality
    resources: getInitialResources(),
  };
}
```

### Pattern 5: Type-Safe Configuration Object
**What:** Centralized balance parameters in a typed TypeScript object with defaults and runtime overrides
**When to use:** For prototype-level balance tuning without external config files
**Example:**
```typescript
// config/balance.ts
// Source: TypeScript type-safe config patterns
// https://betterstack.com/community/guides/scaling-nodejs/typescript-json-type-safety/

export type BalanceConfig = {
  // Resource drain/recovery rates
  baseDrainRates: Record<ResourceKey, number>;
  baseRecoveryRates: Record<ResourceKey, number>;

  // Activity parameters
  minOverskuddToStart: number;
  successProbabilityBase: number; // How much capacity ratio matters
  masteryBonusPerLevel: number;   // +% per mastery level

  // XP progression
  masteryXPOnSuccess: number;
  masteryXPOnFailure: number;
  domainXPMultiplierBase: number;

  // Talent system
  talentPickThreshold: number;
  maxPendingPicks: number;

  // Personality modifiers
  personalityModifierStrength: number; // 0.0 = none, 1.0 = full effect
};

// Default configuration
const DEFAULT_CONFIG: BalanceConfig = {
  baseDrainRates: {
    energy: 0.5,
    socialBattery: 0.3,
    focus: 0.4,
    nutrition: 0.2,
    overskudd: 0.3,
  },
  baseRecoveryRates: {
    stress: 0.2,
    mood: 0.1,
    motivation: 0.1,
    security: 0.05,
  },
  minOverskuddToStart: 20,
  successProbabilityBase: 1.0,
  masteryBonusPerLevel: 0.05,
  masteryXPOnSuccess: 10,
  masteryXPOnFailure: 5,
  domainXPMultiplierBase: 1.0,
  talentPickThreshold: 500,
  maxPendingPicks: 3,
  personalityModifierStrength: 1.0,
};

// Runtime configuration (mutable for dev tools)
export class BalanceConfigManager {
  private config: BalanceConfig;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    makeAutoObservable(this); // MobX reactivity
  }

  get current(): BalanceConfig {
    return this.config;
  }

  update(updates: Partial<BalanceConfig>): void {
    Object.assign(this.config, updates);
  }

  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
  }
}
```
**Source:** TypeScript type-safe configuration patterns with runtime mutability for dev tools

### Anti-Patterns to Avoid
- **Premature optimization:** Don't optimize comparison mode performance until you observe actual issues - two character instances should be fine
- **Over-abstraction:** Don't create a generic "character slot" system - hardcode two slots for comparison mode
- **Config file complexity:** Don't use external JSON + validation library (Zod) for a prototype - TypeScript object is sufficient
- **Resizable panes:** Don't add react-split-pane for user-resizable comparison - fixed 50/50 split is simpler and adequate

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible sections | Custom toggle + CSS animations | Native `<details>` + DaisyUI classes | Accessibility built-in, keyboard nav, searchable content with `hidden="until-found"` |
| Tooltip formatting | Custom hover state management | Recharts `<Tooltip content={CustomComponent} />` | Handles positioning, timing, and multi-series data automatically |
| Random number generation | `Math.random()` for IDs | `crypto.randomUUID()` for IDs | Guaranteed uniqueness, cryptographically random |
| Deep object cloning | Manual spread operators | `structuredClone()` (native) | Handles nested objects, dates, and circular refs |

**Key insight:** Modern web platform (HTML5, native browser APIs) provides many features that previously required libraries. For a prototype, prefer native solutions unless library is already in use.

## Common Pitfalls

### Pitfall 1: MobX Reaction Overhead in Comparison Mode
**What goes wrong:** Running two character instances with full MobX reactivity can cause unnecessary re-renders if observers aren't granular enough
**Why it happens:** Observer components track ALL observables they access - in comparison mode, this doubles the tracking overhead
**How to avoid:**
- Keep observer components small and focused (already doing this)
- Use `observer` on leaf components (CharacterPanel, not just App)
- Consider `reaction` for cross-character comparisons instead of computed values
**Warning signs:** Comparison mode feels sluggish, DevTools shows frequent re-renders

### Pitfall 2: Comparing Identical Archetypes
**What goes wrong:** Testing emergence by comparing two similar characters produces no visible behavioral difference
**Why it happens:** Small personality differences (e.g., 45 vs 55) produce minimal modifier deltas given threshold-based system
**How to avoid:**
- Use extreme trait differences (10 vs 90, not 40 vs 60)
- Document "expected behavior" for each archetype
- Create intentionally contrasting pairs (Hermit vs Social Butterfly)
**Warning signs:** Comparison mode shows two characters behaving identically despite different personalities

### Pitfall 3: Untyped Balance Config Updates
**What goes wrong:** Runtime balance adjustments from dev tools lose type safety, leading to invalid values (negative rates, out-of-range percentages)
**Why it happens:** Input event handlers return strings, easy to forget validation/clamping
**How to avoid:**
```typescript
// BAD: Direct assignment without validation
updateBalance(key, Number(e.target.value)); // Could be NaN, negative, etc.

// GOOD: Validate and clamp
function updateBalance<K extends keyof BalanceConfig>(
  key: K,
  value: BalanceConfig[K]
) {
  // Type-safe validation per config type
  if (typeof value === 'number') {
    value = Math.max(0, value); // Clamp to non-negative
  }
  balanceConfig.update({ [key]: value });
}
```
**Warning signs:** Simulation breaks after adjusting dev tools sliders, NaN values in UI

### Pitfall 4: Premature Config File Extraction
**What goes wrong:** Creating external JSON config file too early adds complexity without benefit
**Why it happens:** "Best practice" thinking - many games use config files, so this should too
**How to avoid:**
- For prototype: TypeScript object is sufficient and type-safe
- Only extract to JSON if non-programmers need to edit values
- If extracting, use runtime validation (Zod) to catch mismatches
**Warning signs:** Spending time on JSON schema validation instead of gameplay testing

### Pitfall 5: Clinical Terminology Creep
**What goes wrong:** Adding features like "diagnosis," "symptoms," "treatment" labels that medicalize the character
**Why it happens:** Domain language from research (mental health) bleeds into implementation
**How to avoid:**
- Audit all UI text for DSM/clinical terms (depression, anxiety, disorder, diagnosis)
- Use descriptive language instead ("feeling low" not "depressed")
- Big Five trait names are fine (Openness, Conscientiousness, etc.)
- Keep focus on observable behavior, not diagnostic labels
**Warning signs:** Tester feedback mentions feeling "diagnosed" or "labeled" by the game
**Source:** Mental health representation best practices - https://safeinourworld.org/news/breaking-the-stigma-mental-health-representation/

## Code Examples

Verified patterns from current codebase and official sources:

### Centralized Dev Tools Panel (NEW)
```typescript
// components/DevToolsPanel.tsx
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../stores/RootStore';

export const DevToolsPanel = observer(function DevToolsPanel() {
  const { simulationStore, balanceConfig } = useRootStore();

  return (
    <details className="collapse collapse-arrow bg-base-200 border border-base-300 mt-4">
      <summary className="collapse-title text-lg font-medium">
        Dev Tools
      </summary>
      <div className="collapse-content">
        {/* Simulation Speed - already exists in SimulationControls */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Simulation Speed</span>
            <span className="label-text-alt">{simulationStore.speed}x</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={simulationStore.speed}
            onChange={e => simulationStore.setSpeed(Number(e.target.value))}
            className="range range-sm"
          />
        </div>

        {/* Personality sliders - already exist in CharacterPanel, could move here */}
        <div className="divider text-sm">Personality Override</div>
        {/* ... */}

        {/* NEW: Balance parameters */}
        <div className="divider text-sm">Balance Parameters</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Min Overskudd to Start</span>
            </label>
            <input
              type="number"
              value={balanceConfig.minOverskuddToStart}
              onChange={e => balanceConfig.update({
                minOverskuddToStart: Math.max(0, Number(e.target.value))
              })}
              className="input input-xs input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Mastery XP (Success)</span>
            </label>
            <input
              type="number"
              value={balanceConfig.masteryXPOnSuccess}
              onChange={e => balanceConfig.update({
                masteryXPOnSuccess: Math.max(1, Number(e.target.value))
              })}
              className="input input-xs input-bordered"
            />
          </div>

          {/* Add more balance parameters as needed */}
        </div>

        {/* Reset button */}
        <button
          onClick={() => balanceConfig.reset()}
          className="btn btn-sm btn-outline btn-warning mt-4 w-full"
        >
          Reset All to Defaults
        </button>
      </div>
    </details>
  );
});
```

### Archetype Factory Functions (NEW)
```typescript
// data/archetypes.ts
import type { CharacterData, Personality } from '../entities/types';

type ArchetypeConfig = {
  name: string;
  description: string;
  personality: Personality;
  expectedBehavior: string;
};

// Source: Big Five personality trait research
// High/low thresholds at 10/90 to produce strong observable differences
export const ARCHETYPES: ArchetypeConfig[] = [
  {
    name: 'The Hermit',
    description: 'Introverted, anxious',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 10,
      agreeableness: 50,
      neuroticism: 90,
    },
    expectedBehavior: 'Social battery drains quickly, stress builds easily, avoids social activities',
  },
  {
    name: 'The Social Butterfly',
    description: 'Extraverted, resilient',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 90,
      agreeableness: 70,
      neuroticism: 10,
    },
    expectedBehavior: 'Thrives on social interaction, low stress, mood stays positive',
  },
  {
    name: 'The Perfectionist',
    description: 'Highly conscientious, anxious',
    personality: {
      openness: 50,
      conscientiousness: 90,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 70,
    },
    expectedBehavior: 'Focus drains slowly, motivation stable, stressed by failure',
  },
  {
    name: 'The Free Spirit',
    description: 'Open, disorganized',
    personality: {
      openness: 90,
      conscientiousness: 10,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    expectedBehavior: 'Focus drains quickly, motivation unstable, overskudd varies',
  },
  {
    name: 'The Competitor',
    description: 'Low agreeableness, high conscientiousness',
    personality: {
      openness: 50,
      conscientiousness: 90,
      extraversion: 50,
      agreeableness: 10,
      neuroticism: 30,
    },
    expectedBehavior: 'Social battery drains, focus stable, motivation high',
  },
  {
    name: 'The Peacemaker',
    description: 'High agreeableness, low neuroticism',
    personality: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 90,
      neuroticism: 10,
    },
    expectedBehavior: 'Social battery recovers quickly, mood stable, stress low',
  },
];

// Generate initial capacities based on personality (existing logic)
function generateCapacitiesFromPersonality(p: Personality): Capacities {
  // Use same logic as existing system
  // High C -> higher cognitive, low C -> lower cognitive
  // High N -> lower emotional regulation, etc.
  return {
    cognitive: 40 + (p.conscientiousness * 0.2) + (p.openness * 0.1),
    physical: 45 + (p.conscientiousness * 0.1),
    social: 40 + (p.extraversion * 0.2) + (p.agreeableness * 0.1),
    emotional: 50 - (p.neuroticism * 0.2),
    creative: 40 + (p.openness * 0.3),
  };
}

export function createArchetypeCharacter(
  archetypeIndex: number
): CharacterData {
  const archetype = ARCHETYPES[archetypeIndex];
  return {
    id: crypto.randomUUID(),
    name: archetype.name,
    personality: archetype.personality,
    capacities: generateCapacitiesFromPersonality(archetype.personality),
    resources: {
      energy: 100,
      socialBattery: 100,
      stress: 0,
      mood: 100,
      focus: 100,
      motivation: 100,
      nutrition: 100,
      overskudd: 100,
      security: 100,
    },
  };
}

export function createRandomCharacter(): CharacterData {
  const personality: Personality = {
    openness: Math.random() * 100,
    conscientiousness: Math.random() * 100,
    extraversion: Math.random() * 100,
    agreeableness: Math.random() * 100,
    neuroticism: Math.random() * 100,
  };

  return {
    id: crypto.randomUUID(),
    name: 'Random Character',
    personality,
    capacities: generateCapacitiesFromPersonality(personality),
    resources: {
      energy: 100,
      socialBattery: 100,
      stress: 0,
      mood: 100,
      focus: 100,
      motivation: 100,
      nutrition: 100,
      overskudd: 100,
      security: 100,
    },
  };
}
```

### Comparison Mode Layout (NEW)
```typescript
// components/ComparisonView.tsx
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { CharacterPanel } from './CharacterPanel';
import { SkillTreePanel } from './SkillTreePanel';
import { ActivityPanel } from './ActivityPanel';
import { TalentsPanel } from './TalentsPanel';
import { useRootStore } from '../stores/RootStore';
import { ARCHETYPES, createArchetypeCharacter } from '../data/archetypes';

export const ComparisonView = observer(function ComparisonView() {
  const rootStore = useRootStore();
  const [char1Id, setChar1Id] = useState<string | null>(null);
  const [char2Id, setChar2Id] = useState<string | null>(null);

  const createComparison = (arch1: number, arch2: number) => {
    // Create two characters with different archetypes
    const c1 = rootStore.characterStore.createCharacter(
      createArchetypeCharacter(arch1)
    );
    const c2 = rootStore.characterStore.createCharacter(
      createArchetypeCharacter(arch2)
    );
    setChar1Id(c1.id);
    setChar2Id(c2.id);
  };

  if (!char1Id || !char2Id) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Emergence Validation</h2>
        <p className="mb-4">Select two archetypes to compare:</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Archetype selection UI */}
          {ARCHETYPES.map((arch, i) => (
            <div key={i} className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title">{arch.name}</h3>
                <p className="text-sm">{arch.description}</p>
                <p className="text-xs opacity-70">{arch.expectedBehavior}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Example preset comparisons */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Suggested Comparisons:</h3>
          <button
            onClick={() => createComparison(0, 1)}
            className="btn btn-sm btn-outline"
          >
            Hermit vs Social Butterfly
          </button>
          <button
            onClick={() => createComparison(2, 3)}
            className="btn btn-sm btn-outline ml-2"
          >
            Perfectionist vs Free Spirit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 min-h-screen">
      {/* Character 1 */}
      <CharacterView characterId={char1Id} />

      {/* Divider */}
      <div className="border-l border-base-300" />

      {/* Character 2 */}
      <CharacterView characterId={char2Id} />
    </div>
  );
});

// Mirror existing layout for each character
function CharacterView({ characterId }: { characterId: string }) {
  return (
    <div className="flex">
      <CharacterPanel characterId={characterId} />
      <main className="flex-1 p-2 overflow-y-auto">
        <SkillTreePanel characterId={characterId} />
        <ActivityPanel characterId={characterId} />
        <TalentsPanel characterId={characterId} />
      </main>
    </div>
  );
}
```

### Custom Recharts Tooltip (Enhancement)
```typescript
// components/CapacitiesRadar.tsx (enhanced)
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts';

// Custom tooltip showing breakdown
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-base-100 border border-base-300 rounded p-2 shadow-lg">
      <p className="font-semibold">{data.axis}</p>
      <p className="text-sm">
        Base: {data.base}
      </p>
      {data.talents && data.talents.length > 0 && (
        <>
          <p className="text-xs mt-1 opacity-70">Talent modifiers:</p>
          {data.talents.map((t: any) => (
            <p key={t.name} className="text-xs ml-2">
              {t.name}: +{t.bonus}
            </p>
          ))}
        </>
      )}
      <p className="text-sm font-bold mt-1">
        Total: {data.value}
      </p>
    </div>
  );
};

// Use in RadarChart
<RadarChart data={capacityData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="axis" />
  <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
  <Tooltip content={<CustomTooltip />} />
</RadarChart>
```
**Source:** Recharts custom tooltip pattern - https://madlogos.github.io/recharts/Widget_31_Tooltip.html

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| mobx-react Provider/inject | React Context + useContext | 2020-2021 | Simpler, more idiomatic React, better testing |
| react-split-pane for layouts | CSS Grid/Flexbox | 2022+ | Native browser support, no library dependency |
| External JSON config + validation | TypeScript objects (for prototypes) | 2024+ | Type safety without runtime overhead, simpler for dev |
| Custom collapse components | Native `<details>` element | 2023+ | Accessibility built-in, less code to maintain |

**Deprecated/outdated:**
- `mobx-react` Provider pattern: Use React Context instead (as current codebase does)
- Class-based React components: Use functional components + hooks (already doing this)
- `Math.random()` for unique IDs: Use `crypto.randomUUID()` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal archetype count for emergence validation**
   - What we know: Research suggests 6-8 archetypes covering Big Five extremes
   - What's unclear: Exact number needed to validate all emergent behaviors
   - Recommendation: Start with 6 contrasting pairs, add more if gaps found

2. **Performance threshold for comparison mode**
   - What we know: MobX + React should handle two character instances fine
   - What's unclear: Whether real-time simulation of two characters at 10x speed causes lag
   - Recommendation: Implement and test, optimize only if needed (measure first)

3. **Balance parameter exposure level**
   - What we know: All parameters should be adjustable for experimentation
   - What's unclear: Whether to expose every drain/recovery rate or group them
   - Recommendation: Start with high-level parameters (multipliers), expose granular rates if needed

4. **Comparison mode persistence**
   - What we know: Comparison view should allow side-by-side observation
   - What's unclear: Should comparison state persist across page reloads?
   - Recommendation: No persistence for prototype - ephemeral testing is sufficient

## Sources

### Primary (HIGH confidence)
- DaisyUI Collapse component - https://daisyui.com/components/collapse/ (verified via WebFetch)
- Current codebase structure (App.tsx, CharacterPanel.tsx, Character.ts entities)
- MobX React integration docs - https://mobx.js.org/react-integration.html
- Recharts API documentation - https://recharts.org/

### Secondary (MEDIUM confidence)
- [Building Reusable Split Screen Layouts in React](https://www.linkedin.com/pulse/building-reusable-split-screen-layouts-react-annamalai-palani-t8g8c) - CSS Grid pattern
- [Layout Component Design Patterns in React - SplitScreen Layout](https://kashyapdeepak.medium.com/layout-component-design-patterns-in-react-splitscreen-layout-part-01-4a2cd77ce01) - Split screen patterns
- [Type-Safe JSON in TypeScript](https://betterstack.com/community/guides/scaling-nodejs/typescript-json-type-safety/) - Configuration patterns
- [Best practices for MobX with React](https://iconof.com/best-practices-for-mobx-with-react/) - MobX optimization patterns
- [Big Five Personality Traits Model](https://personalitynft.com/personality/traits/big-5/) - Personality archetype research
- [32 Big 5 Personality Trait Combinations](https://personalitynft.com/personality/traits/big-5/sloan/) - SLOAN archetype patterns

### Tertiary (LOW confidence)
- [Emergent Behavior in Multi-Agent Systems](https://www.nature.com/articles/s41598-025-15057-x) - Validation methodology (2025 research)
- [Keep it together: 5 essential design patterns for dev tool UIs](https://evilmartians.com/chronicles/keep-it-together-5-essential-design-patterns-for-dev-tool-uis) - Dev tools patterns
- [Safe In Our World: Mental Health Representation](https://safeinourworld.org/news/breaking-the-stigma-mental-health-representation/) - Avoiding stigma/labels
- [Mental Health Representation in Games](https://checkpointorg.com/mental-health-representation/) - Best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, verified versions in package.json
- Architecture: HIGH - Patterns match existing codebase structure (MobX + React Context)
- Pitfalls: MEDIUM - Based on general MobX/React best practices, not phase-specific testing
- Emergence testing: MEDIUM - Big Five archetype research verified, but game-specific validation untested

**Research date:** 2026-01-22
**Valid until:** ~30 days (stable domain - React/MobX patterns don't change rapidly)
