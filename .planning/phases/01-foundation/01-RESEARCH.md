# Phase 1: Foundation - Research

**Researched:** 2026-01-20
**Domain:** React + MobX + Vite + Tailwind/DaisyUI project scaffolding with Unreal-portable architecture
**Confidence:** HIGH

## Summary

Phase 1 establishes the project foundation: Vite + React + TypeScript scaffolding, MobX state management with the root store pattern, and a basic Character entity demonstrating observable reactivity. The decisions from CONTEXT.md constrain this to a class-based MobX approach (mirroring Unreal Actor patterns) with dark-mode-only DaisyUI styling.

Key research findings:
1. **MobX 6 with `makeAutoObservable`** is the correct approach for class-based entities. The limitation that it cannot be used with class inheritance is acceptable since Character is a standalone entity class, not a subclass.
2. **Root Store pattern** with React Context provides the recommended MobX architecture, enabling cross-store communication and clean separation from React components.
3. **Tailwind 4 + DaisyUI 5** use a new CSS-first configuration model (no tailwind.config.js), with themes configured via `@plugin` directives.
4. **MobX devtools** situation is murky - the packages are poorly maintained. Recommend using browser console + `mobx.spy()` for debugging instead of relying on devtools packages.

**Primary recommendation:** Use the Vite `react-swc-ts` template, configure MobX with class-based stores, set up a single dark theme in DaisyUI via CSS-only config, and establish the root store with React Context from the start.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | ^7.3.x | Build tool | Industry standard, fastest HMR, zero-config for React |
| React | ^19.2.x | UI framework | Specified in project requirements |
| TypeScript | ^5.6.x | Type safety | Types translate to C++ struct definitions |
| MobX | ^6.15.0 | State management | OOP-friendly, classes map to Unreal UCLASS |
| mobx-react-lite | ^4.1.1 | React bindings | Lightweight (1.5kB), functional components only |

### Styling

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | ^4.1.x | Utility CSS | CSS-first config in v4, 5x faster |
| @tailwindcss/postcss | latest | PostCSS integration | Required for Tailwind 4 |
| DaisyUI | ^5.5.x | Component classes | Semantic classes, 75% smaller than v4 |

### Development

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ESLint | ^9.x | Linting | Flat config is current standard |
| Prettier | ^3.x | Formatting | Code style consistency |
| @typescript-eslint/parser | ^8.x | TS parsing for ESLint | Required for TS + ESLint |
| eslint-config-prettier | latest | Disable conflicting rules | Prevents ESLint/Prettier conflicts |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| mobx-react-lite | mobx-react | Full mobx-react supports class components, but we only use functional |
| MobX | MobX-State-Tree | MST has better devtools/serialization but functional model doesn't port to Unreal C++ |
| Tailwind 4 | Tailwind 3 | v3 has more ecosystem support but v4 is current and DaisyUI 5 requires it |

**Installation:**

```bash
# Create project with SWC for faster builds
npm create vite@latest lifelines-prototype -- --template react-swc-ts

cd lifelines-prototype

# Core dependencies
npm install mobx@^6.15.0 mobx-react-lite@^4.1.1

# Styling (Tailwind 4 changed installation)
npm install tailwindcss@^4.1.18 @tailwindcss/postcss postcss daisyui@^5.5.14

# Dev dependencies
npm install -D @types/node
npm install -D eslint@^9 prettier@^3 @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-config-prettier
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── stores/
│   ├── RootStore.ts          # Container for all domain stores
│   ├── CharacterStore.ts     # Character management (Phase 1)
│   └── index.ts              # Context provider + useRootStore hook
│
├── entities/
│   ├── Character.ts          # Character entity class
│   └── types.ts              # Shared interfaces (Personality, Capacities, Resources)
│
├── components/
│   └── CharacterCard.tsx     # Minimal proof-of-concept UI
│
├── App.tsx                   # Root component with StoreProvider
├── main.tsx                  # Entry point
└── index.css                 # Tailwind + DaisyUI config
```

### Pattern 1: Class-Based Entity with makeAutoObservable

**What:** Entity classes use `makeAutoObservable` in constructor to make all properties observable and methods actions.

**When to use:** All game entities (Character, Skill, Activity, etc.)

**Limitation:** Cannot use with class inheritance. If inheritance is needed later, switch to `makeObservable` with explicit decorators.

**Example:**
```typescript
// Source: https://mobx.js.org/observable-state.html
import { makeAutoObservable } from 'mobx';

class Character {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  resources: Resources;

  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    this.personality = data.personality;
    this.capacities = data.capacities;
    this.resources = data.resources;

    // Must be called in constructor, not conditionally
    makeAutoObservable(this);
  }

  // Getter becomes @computed automatically
  get displayName(): string {
    return this.name || 'Unnamed Character';
  }

  // Getter becomes @computed automatically
  get isValid(): boolean {
    return this.name.length > 0;
  }

  // Method becomes @action automatically
  setName(name: string): void {
    this.name = name;
  }

  // Method becomes @action automatically
  updatePersonality(updates: Partial<Personality>): void {
    Object.assign(this.personality, updates);
  }
}
```

### Pattern 2: Root Store with React Context

**What:** Single RootStore class holds all domain stores, provided to React via Context.

**When to use:** Always - this is the standard MobX architecture.

**Example:**
```typescript
// Source: https://dev.to/ivandotv/mobx-root-store-pattern-with-react-hooks-318d

// stores/RootStore.ts
import { CharacterStore } from './CharacterStore';

export class RootStore {
  characterStore: CharacterStore;
  // Future: skillStore, activityStore, etc.

  constructor() {
    // All stores receive reference to root for cross-store communication
    this.characterStore = new CharacterStore(this);
  }
}

// stores/index.ts
import { createContext, useContext, ReactNode } from 'react';
import { RootStore } from './RootStore';

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Create single instance - persists for app lifetime
  const store = new RootStore();

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useRootStore(): RootStore {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within StoreProvider');
  }
  return context;
}

// Convenience hooks for individual stores
export function useCharacterStore() {
  return useRootStore().characterStore;
}
```

### Pattern 3: Domain Store Class

**What:** Each domain store manages one category of state and its logic.

**When to use:** For each game system (characters, skills, activities, etc.)

**Example:**
```typescript
// stores/CharacterStore.ts
import { makeAutoObservable } from 'mobx';
import { Character } from '../entities/Character';
import type { RootStore } from './RootStore';

export class CharacterStore {
  character: Character | null = null;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
  }

  // Creates a new character with default values
  createCharacter(name: string): Character {
    this.character = new Character({
      id: crypto.randomUUID(),
      name,
      personality: defaultPersonality(),
      capacities: defaultCapacities(),
      resources: defaultResources(),
    });
    return this.character;
  }

  get hasCharacter(): boolean {
    return this.character !== null;
  }
}
```

### Pattern 4: Observer Component

**What:** React components wrapped with `observer()` automatically re-render when accessed observables change.

**When to use:** Any component that reads from MobX stores.

**Example:**
```typescript
// Source: https://mobx.js.org/react-integration.html
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../stores';

export const CharacterCard = observer(function CharacterCard() {
  const store = useCharacterStore();
  const character = store.character;

  if (!character) {
    return <div className="card bg-base-200">No character</div>;
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{character.displayName}</h2>
        <p>Valid: {character.isValid ? 'Yes' : 'No'}</p>
        <input
          type="text"
          value={character.name}
          onChange={(e) => character.setName(e.target.value)}
          className="input input-bordered"
        />
      </div>
    </div>
  );
});
```

### Anti-Patterns to Avoid

- **Logic in components:** Never compute derived state in React components. Put it in store/entity `@computed` getters.
- **Forgetting observer:** Components that read observables MUST be wrapped with `observer()` or they won't re-render.
- **Creating stores in components:** Store instances should be created once at app root, not in components.
- **Mutating outside actions:** In MobX 6, state changes outside `@action` methods throw errors by default.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique IDs | Math.random string | `crypto.randomUUID()` | Browser native, cryptographically random |
| Observable state | useState for shared state | MobX makeAutoObservable | Cross-component reactivity, computed values |
| Dark mode toggle | CSS media queries + JS | DaisyUI theme config | Single theme = no toggle needed |
| TypeScript React types | Manual typing | @types/react (included by Vite template) | Official types, maintained |

**Key insight:** Phase 1 is scaffolding. Use built-in Vite features, browser APIs, and library conventions. Don't optimize prematurely.

## Common Pitfalls

### Pitfall 1: makeAutoObservable with Inheritance

**What goes wrong:** Using `makeAutoObservable` on a class that extends another class throws an error.

**Why it happens:** MobX cannot reliably infer which properties to observe across the prototype chain.

**How to avoid:** For Phase 1, don't use inheritance. Character is a standalone class. If inheritance is needed later, switch to `makeObservable` with explicit annotations.

**Warning signs:** Runtime error: "makeAutoObservable can only be used for classes that don't have a superclass"

### Pitfall 2: Tailwind 4 Config File Confusion

**What goes wrong:** Creating `tailwind.config.js` which doesn't work with Tailwind 4's CSS-first config.

**Why it happens:** Tailwind 4 changed configuration from JS to CSS. Old tutorials still show JS config.

**How to avoid:** Configure Tailwind/DaisyUI entirely in `src/index.css` using `@plugin` directives. No `tailwind.config.js` needed.

**Warning signs:** Config changes not taking effect, build errors mentioning config file

### Pitfall 3: Missing observer() Wrapper

**What goes wrong:** Component reads from MobX store but doesn't re-render when store changes.

**Why it happens:** Without `observer()`, React doesn't know to subscribe to MobX observables.

**How to avoid:** ALWAYS wrap components that access store data with `observer()` from mobx-react-lite.

**Warning signs:** Console shows store value changed but UI is stale

### Pitfall 4: DaisyUI Class Name Conflicts

**What goes wrong:** Tailwind utility classes don't override DaisyUI component styles.

**Why it happens:** CSS specificity - DaisyUI component classes may have higher specificity.

**How to avoid:** Use DaisyUI semantic classes for components (`btn`, `card`), Tailwind utilities for layout/spacing. For overrides, use `!` prefix (e.g., `!bg-red-500`).

**Warning signs:** Tailwind class applied but DaisyUI style still showing

### Pitfall 5: ESLint 9 Flat Config vs Legacy Config

**What goes wrong:** ESLint rules not applying, or cryptic errors about config format.

**Why it happens:** ESLint 9 uses `eslint.config.js` (flat config), not `.eslintrc.*` files.

**How to avoid:** Use flat config format. Vite template may generate legacy config - update to flat config format.

**Warning signs:** ESLint not finding config, or "Invalid configuration" errors

## Code Examples

Verified patterns from official sources:

### Tailwind 4 + DaisyUI 5 CSS Configuration (Dark Mode Only)

```css
/* src/index.css */
/* Source: https://daisyui.com/docs/config/ */

@import "tailwindcss";

@plugin "daisyui" {
  themes: dark --default;
  logs: false;
}

/* Optional: ensure dark color scheme for browser UI */
:root {
  color-scheme: dark;
}
```

### PostCSS Configuration

```javascript
// postcss.config.js
// Source: https://vite.dev/guide/
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### TypeScript Strict Configuration

```json
// tsconfig.json (extend Vite defaults)
// Source: https://www.typescriptlang.org/tsconfig/strict.html
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true
  }
}
```

### ESLint 9 Flat Config

```javascript
// eslint.config.js
// Source: https://dev.to/denivladislav/set-up-a-new-react-project-vite-typescript-eslint-prettier-and-pre-commit-hooks-3abn
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
    ],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  eslintConfigPrettier,
);
```

### Default Value Factory Functions

```typescript
// entities/types.ts
// Pattern for default values (from CONTEXT.md decisions)

export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface Capacities {
  divergentThinking: number;
  convergentThinking: number;
  workingMemory: number;
  attentionSpan: number;
  processingSpeed: number;
  emotionalRegulation: number;
}

export interface Resources {
  energy: number;
  socialBattery: number;
  stressLevel: number;
}

// Factory functions - always return valid defaults
export function defaultPersonality(): Personality {
  return {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };
}

export function defaultCapacities(): Capacities {
  return {
    divergentThinking: 50,
    convergentThinking: 50,
    workingMemory: 50,
    attentionSpan: 50,
    processingSpeed: 50,
    emotionalRegulation: 50,
  };
}

export function defaultResources(): Resources {
  return {
    energy: 100,
    socialBattery: 100,
    stressLevel: 0,
  };
}
```

### MobX Debugging (Without Devtools Package)

```typescript
// In development, add to main.tsx for debugging
// Source: https://mobx.js.org/api.html#spy
import { spy } from 'mobx';

if (import.meta.env.DEV) {
  spy((event) => {
    if (event.type === 'action') {
      console.log(`[MobX Action] ${event.name}`, event.arguments);
    }
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | CSS @plugin config | Tailwind 4 (Jan 2025) | No JS config file needed |
| .eslintrc.* files | eslint.config.js (flat) | ESLint 9 (Apr 2024) | Different config format |
| mobx-react | mobx-react-lite | MobX 6 (2020) | Smaller bundle, functional only |
| Provider/inject | React Context | MobX 6 (2020) | Standard React patterns |
| @observable decorator | makeAutoObservable | MobX 6 (2020) | Less boilerplate |

**Deprecated/outdated:**
- `mobx-react-devtools` package: Last updated 7 years ago, use browser console + `mobx.spy()` instead
- `tailwind.config.js`: Replaced by CSS-first config in Tailwind 4
- `.eslintrc.*` files: Deprecated in favor of flat config

## Open Questions

Things that couldn't be fully resolved:

1. **MobX Devtools Status**
   - What we know: The Chrome extension exists but hasn't been actively maintained. The `mobx-devtools-mst` package is for MST specifically.
   - What's unclear: Whether the Chrome extension works reliably with MobX 6 + React 19.
   - Recommendation: Skip devtools package integration for Phase 1. Use `mobx.spy()` for debugging. Revisit if debugging becomes painful.

2. **React 19 + MobX Compatibility**
   - What we know: mobx-react-lite 4.1.1 is listed as compatible with React 19.
   - What's unclear: Whether any edge cases exist with React 19's new features (Activity API, etc.)
   - Recommendation: Proceed with standard patterns. No special handling expected for Phase 1's simple use case.

## Sources

### Primary (HIGH confidence)
- [MobX Official: Creating Observable State](https://mobx.js.org/observable-state.html) - makeAutoObservable API, limitations
- [MobX Official: React Integration](https://mobx.js.org/react-integration.html) - observer(), mobx-react-lite
- [MobX Official: Actions](https://mobx.js.org/actions.html) - action patterns
- [Vite Official: Getting Started](https://vite.dev/guide/) - project scaffolding
- [DaisyUI: Config](https://daisyui.com/docs/config/) - Tailwind 4 CSS-first config
- [DaisyUI: Themes](https://daisyui.com/docs/themes/) - theme configuration
- [TypeScript: TSConfig strict](https://www.typescriptlang.org/tsconfig/strict.html) - strict mode options

### Secondary (MEDIUM confidence)
- [MobX Root Store Pattern with React Hooks](https://dev.to/ivandotv/mobx-root-store-pattern-with-react-hooks-318d) - RootStore + Context pattern
- [Complete Guide to Setting Up React with TypeScript and Vite](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2) - 2026 setup guide
- [Set up a new React project: Vite, TypeScript, ESLint, Prettier](https://dev.to/denivladislav/set-up-a-new-react-project-vite-typescript-eslint-prettier-and-pre-commit-hooks-3abn) - ESLint 9 flat config

### Tertiary (LOW confidence)
- [mobx-devtools-mst npm](https://www.npmjs.com/package/mobx-devtools-mst) - package status (last updated 9 months ago, looking for maintainers)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs verified all versions and APIs
- Architecture: HIGH - MobX root store pattern is well-documented and stable
- Pitfalls: HIGH - Based on official migration guides and documented limitations
- Devtools: LOW - Package maintenance status unclear

**Research date:** 2026-01-20
**Valid until:** 60 days (stack is stable, no major releases expected)

---
*Phase: 01-foundation*
*Research completed: 2026-01-20*
