# Technology Stack

**Project:** Lifelines Prototypes - React Game Prototypes (Skill Trees, Character Systems)
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

## Executive Summary

The stack is constrained by project requirements (React, Tailwind, DaisyUI, MobX) and the goal of eventual Unreal Engine port. This research focuses on:
1. Validating versions and compatibility
2. Recommending supporting libraries
3. Identifying patterns that translate to Unreal C++

**Key insight:** Use plain MobX with OOP classes (not MobX-State-Tree). MST's functional model-based approach doesn't map cleanly to C++ class hierarchies. Plain MobX with classes mirrors Unreal's UPROPERTY/UCLASS pattern.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | ^19.2.3 | UI framework | Current stable, Activity API useful for UI state hiding | HIGH |
| TypeScript | ^5.6.x | Type safety | Types translate directly to C++ struct definitions | HIGH |
| Vite | ^7.3.x | Build tool | Industry standard 2025, fastest HMR, zero-config | HIGH |

**Rationale:** React 19.2 is stable (released Oct 2025). Vite 7.3 requires Node 20.19+ but offers 5x faster builds. TypeScript strict mode enforced - the type definitions become the spec for Unreal C++ translation.

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.1.x | Utility CSS | v4 is 5x faster, CSS-first config | HIGH |
| DaisyUI | ^5.5.x | Component classes | Semantic classes reduce JSX clutter, 75% smaller CDN | HIGH |

**Rationale:** DaisyUI 5 requires Tailwind 4. Both released stable in 2025 with significant performance improvements. DaisyUI's class-based approach (`btn`, `card`) keeps component logic clean.

**Installation note:** Tailwind 4 changed installation:
```bash
npm install tailwindcss @tailwindcss/postcss postcss
npm install daisyui
```

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| MobX | ^6.15.0 | Reactive state | OOP-friendly, classes with decorators map to C++ | HIGH |
| mobx-react-lite | ^4.1.1 | React bindings | Lightweight (1.5kB), functional components only | HIGH |

**CRITICAL DECISION: MobX vs MobX-State-Tree**

Choose **plain MobX with classes**, NOT MobX-State-Tree. Rationale:

| Criterion | MobX + Classes | MobX-State-Tree |
|-----------|----------------|-----------------|
| OOP patterns | Native class inheritance | Model composition (functional) |
| C++ translation | Direct mapping to UCLASS | Requires architectural rewrite |
| Performance | Faster (no runtime type checking) | Slower (runtime validation) |
| Type safety | TypeScript compile-time | Runtime + TypeScript |
| Learning curve | Familiar OOP | New paradigms |

MST excels at serialization/snapshots, but the functional model approach (`types.model()`) doesn't translate to Unreal's class-based entity system. Plain MobX with classes like:

```typescript
class Skill {
  @observable name: string;
  @observable level: number;
  @computed get effectiveValue() { ... }
  @action levelUp() { ... }
}
```

...maps directly to Unreal:

```cpp
UCLASS()
class USkill : public UObject {
  UPROPERTY() FString Name;
  UPROPERTY() int32 Level;
  UFUNCTION() int32 GetEffectiveValue();
  UFUNCTION() void LevelUp();
};
```

### Data Persistence

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| localStorage | (browser) | Dev save/load | Zero dependencies, sufficient for prototypes | HIGH |
| JSON | (native) | Serialization | Human-readable, debuggable | HIGH |

**Pattern:** Custom save/load with debounced auto-save:
```typescript
// Debounce saves to avoid performance issues
const saveState = debounce(() => {
  localStorage.setItem('lifelines-save', JSON.stringify(store.snapshot));
}, 1000);
```

**NOT RECOMMENDED:** IndexedDB (overkill for prototypes), external state persistence libraries (unnecessary dependency).

### Visualization (Skill Trees)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Custom React/SVG | N/A | Skill tree rendering | Full control, no stale dependencies | HIGH |
| (alternative) beautiful-skill-tree | 1.7.1 | Quick prototyping | Purpose-built, but unmaintained since 2020 | LOW |

**Rationale:** `beautiful-skill-tree` is purpose-built for RPG skill trees but hasn't been updated in 5 years (last publish: 2020). For a prototype, consider:

1. **Quick prototype:** Use beautiful-skill-tree, accept limitations
2. **Production path:** Build custom with React + SVG/CSS Grid

For Piaget-inspired skill dependencies, custom implementation offers:
- Control over dependency visualization (lines, colors, states)
- Ability to show unlock conditions
- No risk of abandoned dependency

**Implementation pattern:**
```typescript
// Skill tree as directed acyclic graph (DAG)
interface SkillNode {
  id: string;
  name: string;
  prerequisites: string[]; // IDs of required skills
  level: number;
  maxLevel: number;
}

// Render with CSS Grid or SVG for connections
```

### Canvas Rendering (if needed)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React + CSS | N/A | Character/activity UI | Sufficient for non-realtime prototypes | HIGH |
| (if animations needed) Konva | ^9.x | 2D canvas with events | Better DX than Pixi, adequate performance | MEDIUM |
| (if high-perf needed) PixiJS | ^8.x | WebGL 2D rendering | 2-3x faster than Konva, game-focused | MEDIUM |

**Decision tree:**
- Prototype with no animations: **React + CSS**
- Prototype with animations/interactions: **Konva** (react-konva)
- Performance-critical game loop: **PixiJS** (@pixi/react)

For a prototype exploring game mechanics (not rendering performance), React + CSS is sufficient.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| uuid | ^11.x | Unique IDs for entities | All entity creation | HIGH |
| lodash-es | ^4.17.x | Utility functions | debounce, cloneDeep, etc. | HIGH |
| zod | ^3.24.x | Runtime validation | Save file validation, API contracts | HIGH |
| clsx | ^2.x | Conditional classes | Tailwind class composition | HIGH |

**NOT RECOMMENDED:**
- Immer: MobX already handles mutable-style updates with immutable semantics
- React Query: No backend in prototypes
- Form libraries: DaisyUI + controlled inputs sufficient

---

## Development Dependencies

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @types/react | ^19.x | React types | HIGH |
| @types/node | ^22.x | Node types | HIGH |
| eslint | ^9.x | Linting | HIGH |
| prettier | ^3.x | Formatting | HIGH |
| vitest | ^3.x | Testing | HIGH |
| @testing-library/react | ^16.x | Component testing | HIGH |

---

## Installation Commands

```bash
# Create project
npm create vite@latest lifelines-prototype -- --template react-swc-ts

# Core dependencies
npm install react@^19.2.3 react-dom@^19.2.3

# Styling
npm install tailwindcss@^4.1.18 @tailwindcss/postcss postcss daisyui@^5.5.14

# State management
npm install mobx@^6.15.0 mobx-react-lite@^4.1.1

# Utilities
npm install uuid lodash-es zod clsx

# Dev dependencies
npm install -D @types/react @types/react-dom @types/node typescript @types/uuid @types/lodash-es
npm install -D eslint prettier vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## TypeScript Configuration for Unreal Translation

Enable strict settings to catch type issues that would cause problems in C++:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Why:** C++ requires explicit types. Strict TypeScript catches patterns that would require rewriting for Unreal.

---

## Data Structure Patterns for Unreal Translation

Design TypeScript types that map to Unreal equivalents:

| TypeScript | Unreal C++ | Notes |
|------------|------------|-------|
| `string` | `FString` | Unicode support |
| `number` | `int32` or `float` | Be explicit about integers vs floats |
| `boolean` | `bool` | Direct mapping |
| `Array<T>` | `TArray<T>` | Dynamic arrays |
| `Map<K, V>` | `TMap<K, V>` | Hash maps |
| `Set<T>` | `TSet<T>` | Unique collections |
| `Record<string, T>` | `TMap<FString, T>` | String-keyed maps |
| `interface Foo` | `USTRUCT() FFoo` | Data containers |
| `class Foo` | `UCLASS() UFoo` | Objects with behavior |

**Pattern example:**
```typescript
// TypeScript
interface SkillData {
  id: string;
  name: string;
  prerequisites: string[];
  maxLevel: number;
}

class Skill {
  @observable data: SkillData;
  @observable currentLevel: number = 0;

  @computed get isUnlocked(): boolean {
    return this.data.prerequisites.every(id =>
      skillStore.getSkill(id).currentLevel > 0
    );
  }
}
```

```cpp
// Equivalent Unreal C++
USTRUCT()
struct FSkillData {
  UPROPERTY() FString Id;
  UPROPERTY() FString Name;
  UPROPERTY() TArray<FString> Prerequisites;
  UPROPERTY() int32 MaxLevel;
};

UCLASS()
class USkill : public UObject {
  UPROPERTY() FSkillData Data;
  UPROPERTY() int32 CurrentLevel = 0;

  UFUNCTION() bool IsUnlocked() const;
};
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| State | MobX | MobX-State-Tree | MST patterns don't translate to C++ OOP |
| State | MobX | Zustand | Less OOP-friendly, fewer computed properties |
| State | MobX | Redux Toolkit | Excessive boilerplate for prototypes |
| Skill Trees | Custom | beautiful-skill-tree | Unmaintained (5 years), React 18 compatibility unknown |
| Canvas | CSS/SVG | Pixi.js | Overkill for UI prototypes |
| Build | Vite | Next.js | SSR unnecessary for prototype |
| Testing | Vitest | Jest | Vitest native to Vite ecosystem |

---

## Sources

### HIGH Confidence (Official Documentation)
- [MobX Documentation](https://mobx.js.org/) - React integration, defining data stores
- [MobX-State-Tree GitHub](https://github.com/mobxjs/mobx-state-tree) - v7.0.2 (Feb 2025)
- [Vite Documentation](https://vite.dev/guide/) - v7.3.1 current
- [DaisyUI Documentation](https://daisyui.com/) - v5.5.14 current
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - Released Jan 2025
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2) - Oct 2025
- [Unreal Engine Data Structures](https://store.algosyntax.com/tutorials/unreal-engine/data-structures-in-unreal-engine-5-tarray-tmap-and-tset/) - TArray, TMap, TSet

### MEDIUM Confidence (Verified Community Sources)
- [MobX Best Practices](https://iconof.com/best-practices-for-mobx-with-react/) - RootStore pattern
- [MobX-State-Tree 2025 Assessment](https://coolsoftware.dev/blog/mobx-state-tree-react-2025/) - React Compiler compatibility
- [Canvas Engines Comparison](https://benchmarks.slaylines.io/) - Pixi vs Konva benchmarks

### LOW Confidence (Needs Validation)
- [beautiful-skill-tree npm](https://www.npmjs.com/package/beautiful-skill-tree) - v1.7.1, last updated 2020
