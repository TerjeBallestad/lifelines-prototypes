# Phase 3: Skills System - Research

**Researched:** 2026-01-21
**Domain:** Skill trees, DAG data structures, MobX state management, React visualization
**Confidence:** HIGH

## Summary

This research covers implementing a skills system with domain-based XP, 5-level skills, DAG dependencies, and tabbed visualization. The phase builds on the existing MobX + React + DaisyUI architecture established in Phases 1-2.

The core technical challenges are:
1. Modeling a DAG where skills can have multiple prerequisites
2. Managing domain XP as currency that gets spent on unlocking skill levels
3. Computing skill states (locked/unlockable based on prerequisites met)
4. Visualizing skills with state indicators and prerequisite progress

**Primary recommendation:** Hand-roll a simple DAG using TypeScript Maps (no external library needed). Use MobX ObservableMap for skill collection with computed properties for state derivation. Use DaisyUI tabs with manual state management for domain views.

## Standard Stack

The existing codebase already has all required dependencies. No new libraries needed.

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | ^6.15.0 | Observable state management | Already used for Character/Simulation stores |
| mobx-react-lite | ^4.1.1 | React bindings | Already used for observer components |
| DaisyUI | ^5.5.14 | UI components (tabs, cards, badges) | Already configured in project |
| TypeScript | ~5.9.3 | Type safety | Already configured |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | ^4.1.18 | Utility styling | State-based opacity/grayscale |
| React | ^19.2.0 | UI framework | Tab state management |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled DAG | typescript-graph library | External dependency for simple use case |
| MobX ObservableMap | Plain Map + observable | ObservableMap better for dynamic keyed collections |
| DaisyUI tabs | react-daisyui wrapper | Additional dependency, DaisyUI classes sufficient |

**Installation:** None required - all dependencies already present.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── entities/
│   ├── Skill.ts           # Skill entity class with levels, XP costs
│   └── types.ts           # Add SkillData, SkillDomain, SkillState types
├── stores/
│   ├── SkillStore.ts      # SkillGraph + domain XP + unlock logic
│   └── RootStore.ts       # Add skillStore reference
└── components/
    ├── SkillTreePanel.tsx  # Domain tabs + skill grid container
    ├── SkillCard.tsx       # Individual skill with state + prerequisites
    └── SkillLevelBadge.tsx # "Lv.3" badge component
```

### Pattern 1: Entity Class with MobX (Follow Character Pattern)
**What:** Skill entity as class with makeAutoObservable
**When to use:** All entities that need observable state
**Example:**
```typescript
// Source: Established pattern from src/entities/Character.ts
import { makeAutoObservable } from 'mobx';

export class Skill {
  id: string;
  name: string;
  domain: SkillDomain;
  level: number; // 0-5 (0 = not unlocked)
  prerequisites: string[]; // Skill IDs that must be level >= 1

  constructor(data: SkillData) {
    this.id = data.id;
    this.name = data.name;
    this.domain = data.domain;
    this.level = 0;
    this.prerequisites = data.prerequisites;
    makeAutoObservable(this);
  }

  // Computed: XP cost for next level (escalating)
  get nextLevelCost(): number {
    if (this.level >= 5) return Infinity;
    return this.baseCostCurve(this.level + 1);
  }

  // Action: increment level
  levelUp(): void {
    if (this.level < 5) this.level += 1;
  }

  private baseCostCurve(level: number): number {
    // Linear progression curve: 50, 100, 175, 275, 400
    // Each level adds 50 more than previous increase
    const base = 50;
    const increment = 25;
    let total = 0;
    for (let i = 1; i <= level; i++) {
      total += base + (i - 1) * increment;
    }
    return total - (level > 1 ? this.baseCostCurve(level - 1) : 0);
  }
}
```

### Pattern 2: ObservableMap for Keyed Collections
**What:** Use observable.map for skill storage, not plain objects
**When to use:** Collections with dynamic keys (skill IDs)
**Example:**
```typescript
// Source: MobX official docs - https://mobx.js.org/observable-state.html
import { observable, makeAutoObservable, computed } from 'mobx';

export class SkillStore {
  skills = observable.map<string, Skill>();
  domainXP = observable.map<SkillDomain, number>();

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.initializeDomainXP();
  }

  @computed get skillsArray(): Skill[] {
    return Array.from(this.skills.values());
  }

  skillsByDomain(domain: SkillDomain): Skill[] {
    return this.skillsArray.filter(s => s.domain === domain);
  }
}
```

### Pattern 3: DAG as Adjacency List with Validation
**What:** Simple DAG using Map<string, string[]> for prerequisites
**When to use:** Dependency graphs with cycle detection
**Example:**
```typescript
// Source: Topological sort patterns - https://medium.com/@konduruharish/topological-sort-in-typescript-and-c-6d5ecc4bad95
export class SkillGraph {
  private adjacency = new Map<string, string[]>(); // skillId -> prerequisite IDs

  addSkill(id: string, prerequisites: string[]): void {
    this.adjacency.set(id, prerequisites);
  }

  // Check if adding edge would create cycle (Kahn's algorithm)
  wouldCreateCycle(skillId: string, newPrereq: string): boolean {
    // Temporarily add edge and check for cycle
    const existing = this.adjacency.get(skillId) || [];
    this.adjacency.set(skillId, [...existing, newPrereq]);
    const hasCycle = !this.isAcyclic();
    this.adjacency.set(skillId, existing); // Restore
    return hasCycle;
  }

  isAcyclic(): boolean {
    // Kahn's algorithm: if topo sort includes all nodes, no cycle
    const inDegree = new Map<string, number>();
    for (const [id] of this.adjacency) {
      inDegree.set(id, 0);
    }
    for (const [, prereqs] of this.adjacency) {
      for (const prereq of prereqs) {
        inDegree.set(prereq, (inDegree.get(prereq) || 0) + 1);
      }
    }
    const queue = [...inDegree.entries()]
      .filter(([, deg]) => deg === 0)
      .map(([id]) => id);
    let visited = 0;
    while (queue.length > 0) {
      const node = queue.shift()!;
      visited++;
      for (const prereq of this.adjacency.get(node) || []) {
        const newDegree = (inDegree.get(prereq) || 1) - 1;
        inDegree.set(prereq, newDegree);
        if (newDegree === 0) queue.push(prereq);
      }
    }
    return visited === this.adjacency.size;
  }
}
```

### Pattern 4: Computed State Derivation
**What:** Derive skill states (locked/unlockable) from prerequisites via MobX computed
**When to use:** Any derived state that depends on multiple observables
**Example:**
```typescript
// Source: MobX computeds - https://mobx.js.org/computeds.html
export class SkillStore {
  // Computed: check if skill can be unlocked (all prereqs met)
  isUnlockable(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;
    if (skill.level > 0) return false; // Already unlocked
    return skill.prerequisites.every(prereqId => {
      const prereq = this.skills.get(prereqId);
      return prereq && prereq.level >= 1;
    });
  }

  // Computed: get state for display
  getSkillState(skillId: string): 'locked' | 'unlockable' | 'unlocked' | 'mastered' {
    const skill = this.skills.get(skillId);
    if (!skill) return 'locked';
    if (skill.level >= 5) return 'mastered';
    if (skill.level >= 1) return 'unlocked';
    if (this.isUnlockable(skillId)) return 'unlockable';
    return 'locked';
  }

  // Computed: prerequisite progress for "why locked" display
  getPrerequisiteProgress(skillId: string): PrerequisiteStatus[] {
    const skill = this.skills.get(skillId);
    if (!skill) return [];
    return skill.prerequisites.map(prereqId => {
      const prereq = this.skills.get(prereqId);
      return {
        skillId: prereqId,
        name: prereq?.name || 'Unknown',
        required: 1,
        current: prereq?.level || 0,
        met: (prereq?.level || 0) >= 1,
      };
    });
  }
}
```

### Pattern 5: DaisyUI Tabs with React State
**What:** Manual tab switching using React useState + DaisyUI classes
**When to use:** Tabbed navigation without external library
**Example:**
```typescript
// Source: DaisyUI tabs - https://daisyui.com/components/tab/
import { useState } from 'react';
import { observer } from 'mobx-react-lite';

const DOMAINS: SkillDomain[] = ['social', 'organisational', 'analytical', 'physical', 'creative'];

export const SkillTreePanel = observer(function SkillTreePanel() {
  const [activeDomain, setActiveDomain] = useState<SkillDomain>('social');
  const store = useSkillStore();

  return (
    <div className="p-4">
      <div role="tablist" className="tabs tabs-box">
        {DOMAINS.map(domain => (
          <button
            key={domain}
            role="tab"
            className={`tab ${activeDomain === domain ? 'tab-active' : ''}`}
            onClick={() => setActiveDomain(domain)}
          >
            {domain}
            <span className="badge badge-sm ml-2">
              {store.domainXP.get(domain) || 0} XP
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {store.skillsByDomain(activeDomain).map(skill => (
          <SkillCard key={skill.id} skillId={skill.id} />
        ))}
      </div>
    </div>
  );
});
```

### Anti-Patterns to Avoid
- **Don't use plain objects for skill collection:** MobX caches property descriptors aggressively; use ObservableMap for dynamic keys
- **Don't compute state in render:** Use MobX computed properties, not inline calculations
- **Don't store derived state:** Skill "state" (locked/unlockable/etc) should be computed, not stored
- **Don't use external DAG library:** The prerequisite graph is simple enough to hand-roll

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Observable collections | Custom observer pattern | MobX ObservableMap | Automatic dependency tracking, tested |
| Tab component styling | Custom CSS | DaisyUI tabs classes | Consistent with rest of app |
| Level badge UI | Custom component | DaisyUI badge | Consistent styling |
| State-based styling | Complex conditionals | Tailwind opacity/grayscale utilities | Composable, maintainable |

**Key insight:** The codebase already has MobX and DaisyUI. Use their idioms rather than building parallel systems.

## Common Pitfalls

### Pitfall 1: Storing Computed State
**What goes wrong:** Storing `state: 'locked' | 'unlockable'` as a property that needs manual updating
**Why it happens:** Seems simpler than computing on access
**How to avoid:** Use MobX computed properties that derive state from prerequisites
**Warning signs:** Having to call `updateSkillStates()` after any change

### Pitfall 2: Circular Skill Dependencies
**What goes wrong:** Skill A requires B, B requires A - creates impossible unlock
**Why it happens:** Manual data entry errors, no validation
**How to avoid:** Validate DAG is acyclic when loading skill data (Kahn's algorithm)
**Warning signs:** Skills that can never become unlockable

### Pitfall 3: XP Spending Without Validation
**What goes wrong:** Spending XP player doesn't have, or unlocking skills without prerequisites
**Why it happens:** UI and store logic not coordinated
**How to avoid:** All unlock logic goes through store actions that validate first
**Warning signs:** Negative XP, skills unlocked before prerequisites

### Pitfall 4: MobX Computed Not Caching
**What goes wrong:** `getSkillState()` recomputes every render even when dependencies haven't changed
**Why it happens:** Using methods instead of computed getters, or computed not observed
**How to avoid:** Use `get` accessor syntax and ensure component uses `observer()`
**Warning signs:** Slow renders, excessive re-computation in MobX devtools

### Pitfall 5: Forgetting to Add Store to RootStore
**What goes wrong:** `useSkillStore()` returns undefined or crashes
**Why it happens:** Created SkillStore but didn't wire it into RootStore pattern
**How to avoid:** Follow CharacterStore pattern exactly - add to RootStore, add convenience hook
**Warning signs:** "Cannot read property of undefined" errors

## Code Examples

Verified patterns from official sources and existing codebase.

### Type Definitions
```typescript
// Add to src/entities/types.ts
export type SkillDomain = 'social' | 'organisational' | 'analytical' | 'physical' | 'creative';

export type SkillState = 'locked' | 'unlockable' | 'unlocked' | 'mastered';

export interface SkillData {
  id: string;
  name: string;
  description: string;
  domain: SkillDomain;
  prerequisites: string[]; // Skill IDs
}

export interface PrerequisiteStatus {
  skillId: string;
  name: string;
  required: number; // Level required (always 1 for prerequisites)
  current: number;  // Current level of prerequisite
  met: boolean;
}
```

### Store Hook Pattern (Follow Existing Pattern)
```typescript
// Add to src/stores/index.tsx
export function useSkillStore() {
  return useRootStore().skillStore;
}
```

### Skill Card State Styling
```typescript
// Source: Tailwind utilities, DaisyUI card component
const stateStyles: Record<SkillState, string> = {
  locked: 'opacity-50 grayscale',
  unlockable: 'ring-2 ring-primary',
  unlocked: '',
  mastered: 'ring-2 ring-accent',
};

const stateIcons: Record<SkillState, string> = {
  locked: '🔒',
  unlockable: '🔓',
  unlocked: '',
  mastered: '⭐',
};
```

### Escalating Cost Curve
```typescript
// Linear progression curve - balanced for early game approachability
// Level costs: 50, 75, 100, 125, 150 (total to master: 500)
function costForLevel(level: number): number {
  const base = 50;
  const increment = 25;
  return base + (level - 1) * increment;
}

// Example skill domains and starter skills
const STARTER_SKILLS: SkillData[] = [
  // Social domain
  { id: 'eye-contact', name: 'Eye Contact', domain: 'social', prerequisites: [], description: 'Maintain brief eye contact during conversation' },
  { id: 'small-talk', name: 'Small Talk', domain: 'social', prerequisites: ['eye-contact'], description: 'Exchange pleasantries with acquaintances' },
  { id: 'phone-call', name: 'Phone Call', domain: 'social', prerequisites: ['small-talk'], description: 'Make and receive phone calls' },

  // Organisational domain
  { id: 'make-list', name: 'Make a List', domain: 'organisational', prerequisites: [], description: 'Create simple to-do lists' },
  { id: 'follow-routine', name: 'Follow Routine', domain: 'organisational', prerequisites: ['make-list'], description: 'Stick to a basic daily routine' },

  // Physical domain (going outside chain)
  { id: 'go-outside', name: 'Go Outside', domain: 'physical', prerequisites: [], description: 'Leave the house briefly' },
  { id: 'walk-neighborhood', name: 'Walk Neighborhood', domain: 'physical', prerequisites: ['go-outside'], description: 'Take short walks around the block' },
  { id: 'go-to-store', name: 'Go to Store', domain: 'physical', prerequisites: ['go-outside', 'make-list'], description: 'Visit a nearby store' },
];
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MobX decorators | makeAutoObservable | MobX 6 (2020) | Simpler, no decorator config |
| Plain objects for maps | ObservableMap | MobX best practice | Better memory, dynamic keys |
| CSS classes for state | Tailwind utilities | Current | Composable state styles |

**Deprecated/outdated:**
- MobX `@observable` decorators: Still work but makeAutoObservable preferred
- `observable.object()` for dynamic keys: Use `observable.map()` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Exact Skill Content**
   - What we know: Need 5-8 skills in meaningful dependency tree, adult life abilities
   - What's unclear: Exact names, descriptions, which domains
   - Recommendation: Per CONTEXT.md this is Claude's discretion; use examples above as starting point

2. **Capacity Requirements**
   - What we know: CONTEXT.md says "whether skills have capacity requirements beyond other skills" is Claude's discretion
   - What's unclear: Should high-level skills require certain capacity scores?
   - Recommendation: Keep simple for Phase 3 (skills only depend on other skills), add capacity requirements in future if needed

3. **Visual Polish**
   - What we know: States use opacity/grayscale + icons, level as badge
   - What's unclear: Exact CSS values, animations, hover states
   - Recommendation: Start with functional, iterate on visual polish

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns: `/Users/godstemning/projects-local/lifelines-prototypes/src/entities/Character.ts`, `stores/CharacterStore.ts`
- [MobX observable state](https://mobx.js.org/observable-state.html) - ObservableMap patterns
- [MobX computed properties](https://mobx.js.org/computeds.html) - Computed derivation patterns
- [DaisyUI tabs component](https://daisyui.com/components/tab/) - Tab classes and structure

### Secondary (MEDIUM confidence)
- [Topological Sort in TypeScript](https://medium.com/@konduruharish/topological-sort-in-typescript-and-c-6d5ecc4bad95) - DAG cycle detection
- [typescript-graph library](https://segfaultx64.github.io/typescript-graph/) - DAG patterns (though we hand-roll)
- [beautiful-skill-tree](https://github.com/andrico1234/beautiful-skill-tree) - Skill tree data structure patterns

### Tertiary (LOW confidence)
- [Game Progression Curves](https://www.designthegame.com/learning/courses/course/fundamentals-level-curve-design/example-level-curve-formulas-game-progression) - XP cost curve formulas
- [Advanced MobX State Management](https://www.toxigon.com/advanced-state-management-with-mobx) - General patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing codebase dependencies
- Architecture: HIGH - Following established patterns from Character/CharacterStore
- Pitfalls: HIGH - Based on MobX official documentation
- Skill content: MEDIUM - Examples provided, exact content is discretionary
- Cost curve: MEDIUM - Based on game design resources, needs playtesting

**Research date:** 2026-01-21
**Valid until:** 30 days (stable patterns, no major version changes expected)
