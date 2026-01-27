# Phase 12: Tuning & Balance - Research

**Researched:** 2026-01-27
**Domain:** Game balance tooling, runtime configuration, simulation testing
**Confidence:** HIGH

## Summary

Phase 12 delivers developer/designer tooling for tuning game balance without code changes. The existing codebase already has strong foundations: MobX reactive state (allows headless simulation), Recharts for visualization, DaisyUI components for UI, and a BalanceConfigStore pattern. The key technical challenges are: (1) runtime config hot reload in browser (limited by security), (2) calculation trace UI for formula transparency, and (3) headless batch simulation with telemetry capture.

The standard approach is to use localStorage for config persistence (browser security prevents auto-watching external JSON files), build calculation trace panels similar to browser DevTools "Computed" tab, run headless simulations by bypassing React rendering while keeping MobX reactive updates, and use Recharts LineChart for time-series visualization of needs/stats over simulated days.

**Primary recommendation:** Extend existing BalanceConfigStore with localStorage persistence and preset system, build dedicated trace panel using expandable `<details>` pattern (already used in DecisionLogPanel), create headless simulation runner that ticks MobX stores without rendering, and capture telemetry arrays for Recharts visualization.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.15.0 | Reactive state (already installed) | Allows headless simulation - reactions work without rendering, perfect for background testing |
| Recharts | 3.6.0 | Charts (already installed) | React-friendly, handles time-series line charts well, responsive by default |
| localStorage API | Native | Config persistence | Browser-native, synchronous, perfect for dev tool configs and presets |
| DaisyUI | 5.5.14 | UI components (already installed) | Collapse/details patterns for expandable traces, form controls for sliders |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React `<details>` | Native HTML | Expandable sections | Calculation trace layers, formula breakdowns (already used in DecisionLogPanel) |
| Promise.all | Native | Batch runs | Multiple simulations in parallel with controlled concurrency |
| JSON.stringify/parse | Native | Config serialization | Save/load presets to localStorage |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | External JSON files | Can't auto-watch in browser (security), would need manual file upload via FileReader API |
| Recharts | Chart.js, D3 | Recharts already installed, React-friendly, sufficient for time-series needs |
| MobX reactions | Web Workers | Workers add complexity, MobX reactions already work headless, no need |

**Installation:**
```bash
# No new dependencies needed - all tools already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── config/
│   └── balance.ts              # BalanceConfigStore (exists)
├── stores/
│   └── SimulationStore.ts      # Add headless mode support
│   └── TelemetryStore.ts       # NEW: capture needs/stats over time
├── components/
│   ├── DevToolsPanel.tsx       # Extend with nested config sections
│   ├── CalculationTracePanel.tsx  # NEW: formula breakdown overlay
│   ├── SimulationRunnerPanel.tsx  # NEW: headless test controls
│   └── TelemetryChartsPanel.tsx   # NEW: Recharts line graphs
└── utils/
    └── presets.ts              # NEW: save/load config presets
```

### Pattern 1: localStorage Config Persistence with Presets
**What:** Extend BalanceConfigStore to save/restore from localStorage with named presets
**When to use:** Runtime config that survives page refresh, A/B testing different balance philosophies

**Example:**
```typescript
// Extended BalanceConfigStore pattern
export class BalanceConfigStore {
  config: BalanceConfig;

  constructor() {
    // Load from localStorage on init
    this.config = this.loadFromStorage() ?? DEFAULT_BALANCE;
    makeAutoObservable(this);

    // Auto-save on changes (with debounce for performance)
    reaction(
      () => this.config,
      (config) => this.saveToStorage(config),
      { delay: 500 } // Debounce 500ms
    );
  }

  private saveToStorage(config: BalanceConfig): void {
    localStorage.setItem('balance-config', JSON.stringify(config));
  }

  private loadFromStorage(): BalanceConfig | null {
    const stored = localStorage.getItem('balance-config');
    return stored ? JSON.parse(stored) : null;
  }

  // Preset system
  savePreset(name: string): void {
    const presets = this.loadPresets();
    presets[name] = this.config;
    localStorage.setItem('balance-presets', JSON.stringify(presets));
  }

  loadPreset(name: string): void {
    const presets = this.loadPresets();
    if (presets[name]) {
      this.config = presets[name];
    }
  }

  private loadPresets(): Record<string, BalanceConfig> {
    const stored = localStorage.getItem('balance-presets');
    return stored ? JSON.parse(stored) : {};
  }
}
```

### Pattern 2: Calculation Trace with Expandable Layers
**What:** Dedicated debug panel showing formula breakdowns, similar to browser DevTools "Computed" tab
**When to use:** Understanding why derived stats (Mood, Purpose, Overskudd) have current values

**Example:**
```typescript
// Calculation trace for Overskudd
// Summary layer (default collapsed)
<details className="collapse collapse-arrow">
  <summary className="collapse-title">
    Overskudd: {char.actionResources.overskudd.toFixed(1)} (breakdown)
  </summary>

  {/* Formula breakdown layer */}
  <div className="collapse-content">
    <div className="text-sm space-y-1">
      <div>= (Mood × {weights.mood}) + (Energy × {weights.energy}) + (Purpose × {weights.purpose})</div>
      <div>= ({char.derivedStats.mood} × 0.4) + ({char.needs.energy} × 0.35) + ({char.derivedStats.purpose} × 0.25)</div>
      <div>= {char.derivedStats.mood * 0.4} + {char.needs.energy * 0.35} + {char.derivedStats.purpose * 0.25}</div>
      <div className="font-bold">= {char.actionResources.overskudd}</div>

      {/* Click to expand for deeper layers */}
      <details className="text-xs mt-2">
        <summary>Where does Mood come from?</summary>
        {/* Recursive breakdown of Mood formula */}
      </details>
    </div>
  </div>
</details>
```

### Pattern 3: Headless Simulation Runner
**What:** Run simulation ticks without React rendering by directly calling store methods
**When to use:** Background validation tests, batch parameter exploration

**Example:**
```typescript
export class HeadlessSimulationRunner {
  private root: RootStore;

  // Run simulation for N ticks without rendering
  async runHeadless(ticks: number, speed: number = 1): Promise<TelemetryData> {
    const telemetry = new TelemetryStore();

    for (let i = 0; i < ticks; i++) {
      // Directly tick stores (bypasses React rendering)
      this.root.simulationStore.tick();

      // Capture telemetry
      telemetry.recordTick(this.root.characterStore.character);

      // Yield to event loop periodically (prevent blocking)
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return telemetry.getData();
  }

  // Run multiple simulations in parallel (batch testing)
  async runBatch(configs: BalanceConfig[], ticksPerRun: number): Promise<TelemetryData[]> {
    const runs = configs.map(config => {
      // Create isolated store per run
      const root = new RootStore();
      root.balanceConfig.config = config;
      const runner = new HeadlessSimulationRunner(root);
      return runner.runHeadless(ticksPerRun);
    });

    // Run in parallel with controlled concurrency
    const results = await Promise.all(runs);
    return results;
  }
}
```

### Pattern 4: Telemetry Capture for Time-Series Charts
**What:** Store arrays of { tick, needs, derivedStats, actionResources } for Recharts LineChart
**When to use:** Visualizing needs/stats over simulated time, personality comparison charts

**Example:**
```typescript
export class TelemetryStore {
  data: Array<{
    tick: number;
    hunger: number;
    energy: number;
    mood: number;
    overskudd: number;
    // ... all stats
  }> = [];

  recordTick(character: Character): void {
    this.data.push({
      tick: this.data.length,
      hunger: character.needs.hunger,
      energy: character.needs.energy,
      mood: character.derivedStats.mood,
      overskudd: character.actionResources.overskudd,
      // ... capture all stats
    });
  }

  // Use with Recharts
  renderChart(): JSX.Element {
    return (
      <LineChart width={800} height={400} data={this.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tick" label="Simulation Ticks" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hunger" stroke="#ff7300" name="Hunger" />
        <Line type="monotone" dataKey="energy" stroke="#387908" name="Energy" />
        <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
      </LineChart>
    );
  }
}
```

### Anti-Patterns to Avoid
- **External JSON files with FileReader:** Browser security prevents auto-watching files. Users must manually re-select files. Use localStorage instead for hot reload.
- **Real-time streaming traces:** Too much UI churn. Use manual refresh button pattern (user clicks to update).
- **Full state replay:** Massive memory cost. Record decision log + aggregate stats, not every tick's full state.
- **Blocking synchronous simulations:** Long simulations block UI. Yield to event loop periodically (`await setTimeout(0)`).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG line charts | Recharts LineChart | Handles responsive sizing, tooltips, axes, legends, and time-series data out of box |
| Config persistence | Custom file I/O | localStorage + JSON | Browser security blocks file watching, localStorage is synchronous and reliable |
| Expandable UI layers | Custom accordion | HTML `<details>`/`<summary>` + DaisyUI | Native HTML, accessible, already used in DecisionLogPanel pattern |
| Batch concurrency | Manual Promise.all | Promise.all with limit | JavaScript promises handle concurrency well, just need to chunk into batches to avoid memory issues |
| Reactive updates | Manual observers | MobX reactions/autorun | Already in stack, works headless without rendering |

**Key insight:** Browser environment has strict security limits on file system access. Don't fight it - use localStorage for dev tools. It's synchronous, persists across sessions, and perfect for config presets.

## Common Pitfalls

### Pitfall 1: Assuming File Watching Works in Browser
**What goes wrong:** Try to watch external JSON file for changes, nothing happens, users confused why edits don't apply
**Why it happens:** Browser security prevents JavaScript from accessing file system or auto-detecting file changes
**How to avoid:** Use localStorage for config persistence with manual "Load Preset" button, or accept that users must refresh page after editing external files
**Warning signs:** Documentation mentions FileReader API or "watch JSON file" - these won't auto-reload

### Pitfall 2: Blocking UI with Long Simulations
**What goes wrong:** Start 7-day (10,080 ticks) headless simulation, browser freezes, tab becomes unresponsive
**Why it happens:** JavaScript is single-threaded, tight loops block event loop
**How to avoid:** Yield to event loop every ~100 ticks (`await setTimeout(0, 0)`), or run in Web Worker (more complex)
**Warning signs:** Simulation runner has no `await` statements inside loop, Chrome DevTools shows "long task" warnings

### Pitfall 3: Memory Explosion from Full State Capture
**What goes wrong:** Record entire character state every tick for 7 days, browser runs out of memory
**Why it happens:** 10,080 ticks × full state object = huge array, especially with multiple parallel runs
**How to avoid:** Record only aggregate stats (needs, derived stats, action resources) not full MobX store, or sample every Nth tick
**Warning signs:** Telemetry data array grows unbounded, memory profiler shows large retained objects

### Pitfall 4: Nested Config Objects Breaking MobX Reactivity
**What goes wrong:** Update `balanceConfig.needs.hungerDecayRate`, UI doesn't update
**Why it happens:** MobX reactivity requires observable nested objects, deep updates may not trigger reactions
**How to avoid:** Use `makeAutoObservable(this, {}, { deep: true })` or restructure updates to replace entire nested object
**Warning signs:** Config UI changes values but display doesn't update, need to refresh page to see changes

### Pitfall 5: Recharts Performance with Large Datasets
**What goes wrong:** Pass 10,080 data points to LineChart, rendering is slow, tooltips lag
**Why it happens:** Recharts renders all points as SVG elements, DOM becomes large
**How to avoid:** Downsample data (every 10th tick, or use averages), or limit chart to last N points
**Warning signs:** Chart takes seconds to render, DevTools profiler shows long Recharts render time

## Code Examples

Verified patterns from official sources:

### Recharts Time-Series Line Chart
```typescript
// Source: https://recharts.github.io/en-US/api/LineChart/
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Telemetry data format
const data = [
  { tick: 0, hunger: 100, energy: 100, mood: 70 },
  { tick: 1, hunger: 99.2, energy: 99.3, mood: 69.8 },
  // ... more ticks
];

// Basic time-series chart
<LineChart width={800} height={400} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="tick" label={{ value: 'Simulation Ticks', position: 'insideBottom', offset: -5 }} />
  <YAxis domain={[0, 100]} label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="hunger" stroke="#ff7300" name="Hunger" />
  <Line type="monotone" dataKey="energy" stroke="#387908" name="Energy" />
  <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
</LineChart>

// Performance: For large datasets, downsample or limit
const displayData = data.filter((_, i) => i % 10 === 0); // Every 10th point
```

### localStorage Config Persistence
```typescript
// Source: https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
// Pattern: Custom hook for localStorage sync

function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage in BalanceConfigStore
export class BalanceConfigStore {
  config: BalanceConfig;

  constructor() {
    this.config = this.loadConfig();
    makeAutoObservable(this);

    // Auto-save with debounce
    reaction(
      () => this.config,
      (config) => {
        localStorage.setItem('balance-config', JSON.stringify(config));
      },
      { delay: 500 } // Debounce 500ms to avoid excessive writes
    );
  }

  private loadConfig(): BalanceConfig {
    const stored = localStorage.getItem('balance-config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse stored config, using defaults');
      }
    }
    return { ...DEFAULT_BALANCE };
  }
}
```

### MobX Headless Simulation (No Rendering)
```typescript
// Source: https://mobx.js.org/reactions.html
// Pattern: Use autorun/reaction for non-UI side effects

export class HeadlessSimulationRunner {
  private root: RootStore;
  private disposer?: IReactionDisposer;

  runSimulation(ticks: number): TelemetryData {
    const telemetry = new TelemetryStore();

    // Optional: Track changes without rendering
    this.disposer = autorun(() => {
      // This runs whenever observed values change
      const char = this.root.characterStore.character;
      if (char) {
        telemetry.recordTick(char);
      }
    });

    // Drive simulation manually
    for (let i = 0; i < ticks; i++) {
      this.root.simulationStore.tick(); // MobX reactions fire, no React render
    }

    // Cleanup
    this.disposer?.();
    return telemetry.getData();
  }
}
```

### Batch Simulation with Controlled Concurrency
```typescript
// Source: https://medium.com/better-programming/several-variations-on-how-to-batch-run-tasks-in-parallel-tasks-grinding-ecf8324ddca3
// Pattern: Batch Promise.all to control concurrency

async function runBatchSimulations(
  configs: BalanceConfig[],
  ticksPerRun: number,
  maxConcurrent: number = 5
): Promise<TelemetryData[]> {
  const results: TelemetryData[] = [];

  // Chunk into batches
  for (let i = 0; i < configs.length; i += maxConcurrent) {
    const batch = configs.slice(i, i + maxConcurrent);

    // Run batch in parallel
    const batchResults = await Promise.all(
      batch.map(config => {
        const root = new RootStore();
        root.balanceConfig.config = config;
        const runner = new HeadlessSimulationRunner(root);
        return runner.runSimulation(ticksPerRun);
      })
    );

    results.push(...batchResults);
  }

  return results;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External config files | localStorage for browser dev tools | 2020s (browser security tightening) | Must use localStorage or manual file upload, can't auto-watch files |
| Synchronous long simulations | Async with event loop yielding | 2020s (better UX practices) | Prevents UI freezing, keeps browser responsive |
| Custom chart libraries | Recharts/react-chartjs-2 | 2019-2020 | React-friendly declarative APIs, less boilerplate |
| Redux DevTools pattern | Custom debug overlays | 2021+ | Game dev needs domain-specific tools (formula traces, simulation runners) |

**Deprecated/outdated:**
- **FileReader API for config hot reload:** Browsers block auto-watching for security. Use localStorage instead.
- **Web Workers for every simulation:** Overkill for short simulations. Async with yielding is simpler and sufficient.
- **Custom observability from scratch:** MobX reactions already provide reactive updates without rendering.

## Open Questions

Things that couldn't be fully resolved:

1. **Multi-patient parallel comparison performance**
   - What we know: Can run multiple characters in parallel using Promise.all with batching
   - What's unclear: Memory limits for N characters × 10,080 ticks. Browser may struggle with 10+ parallel runs.
   - Recommendation: Start with 2-3 parallel characters, measure memory usage, implement sampling if needed

2. **Hot reload trigger mechanism**
   - What we know: Browser can't auto-watch JSON files. Options are: (1) localStorage + manual trigger, (2) FileReader API + manual upload
   - What's unclear: User preference - some devs want external files (easier to track in git), others prefer localStorage (no file management)
   - Recommendation: Implement localStorage first (simpler), add export/import JSON buttons for git-friendly workflow

3. **Calculation trace depth (recursive formulas)**
   - What we know: Overskudd depends on Mood, which depends on 7 needs. Can nest `<details>` elements.
   - What's unclear: How many layers deep before UI becomes cluttered? Should we show full dependency graph?
   - Recommendation: 2 layers max (stat → inputs), with optional "Show full chain" button for advanced debugging

## Sources

### Primary (HIGH confidence)
- [Recharts LineChart API](https://recharts.github.io/en-US/api/LineChart/) - Official documentation for time-series charts
- [MobX Reactions Documentation](https://mobx.js.org/reactions.html) - Authoritative guide for headless reactions
- [localStorage Web API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Browser storage API (implicitly verified, standard API)

### Secondary (MEDIUM confidence)
- [localStorage React patterns](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/) - Josh Comeau's guide, widely cited pattern
- [Batch Promise.all concurrency](https://medium.com/better-programming/several-variations-on-how-to-batch-run-tasks-in-parallel-tasks-grinding-ecf8324ddca3) - Verified pattern for controlled parallelism
- [FileReader API limitations](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) - Browser security constraints documented

### Tertiary (LOW confidence - requires validation)
- WebSearch results on game telemetry patterns - General principles, need domain-specific verification
- WebSearch results on React debug panel patterns - Directional guidance, Reactotron example not directly applicable

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, patterns verified in existing codebase
- Architecture: HIGH - MobX headless verified, Recharts documented, localStorage is standard API
- Pitfalls: HIGH - Browser security limits well-documented, performance issues are common knowledge
- Batch simulation: MEDIUM - Promise.all pattern verified, but memory limits need testing with actual data volume
- Calculation trace UI: MEDIUM - Pattern clear (expandable details), but depth/UX needs iteration

**Research date:** 2026-01-27
**Valid until:** 2026-04-27 (90 days - stable ecosystem, minimal churn expected)
