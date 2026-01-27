import { observer } from 'mobx-react-lite';
import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useRootStore } from '../stores/RootStore';
import type { TelemetryRun, TelemetryDataPoint } from '../stores/TelemetryStore';

// Color scheme for primary needs
const NEED_COLORS: Record<string, string> = {
  hunger: '#ff7300',
  energy: '#387908',
  hygiene: '#8884d8',
  bladder: '#82ca9d',
  social: '#ffc658',
  fun: '#ff6b6b',
  security: '#4ecdc4',
};

// Color scheme for derived stats
const DERIVED_COLORS: Record<string, string> = {
  mood: '#8b5cf6',
  purpose: '#ec4899',
  nutrition: '#14b8a6',
};

// Color scheme for action resources
const RESOURCE_COLORS: Record<string, string> = {
  overskudd: '#3b82f6',
  socialBattery: '#a855f7',
  focus: '#06b6d4',
  willpower: '#f59e0b',
};

type ChartType = 'needs' | 'derived' | 'resources';

/**
 * TelemetryChartsPanel - Recharts visualization of simulation telemetry.
 *
 * Features:
 * - List of completed runs with stats
 * - Selectable runs for chart display
 * - Three chart types: Primary Needs, Derived Stats, Action Resources
 * - Downsampling for large datasets (10k+ points)
 * - Comparison mode for introvert vs extrovert overlay
 */
export const TelemetryChartsPanel = observer(function TelemetryChartsPanel() {
  const { telemetryStore } = useRootStore();
  const runs = telemetryStore.runs;

  // Selected run(s) for display
  const [selectedRunIds, setSelectedRunIds] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<ChartType>('needs');

  // Auto-select most recent run when new runs are added
  const lastRunId = runs[runs.length - 1]?.id;
  useEffect(() => {
    if (lastRunId) {
      setSelectedRunIds(new Set([lastRunId]));
    }
  }, [lastRunId]);

  // Get selected runs
  const selectedRuns = useMemo(
    () => runs.filter((r) => selectedRunIds.has(r.id)),
    [runs, selectedRunIds]
  );

  const toggleRunSelection = (runId: string) => {
    setSelectedRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        // Limit to 2 selected for comparison
        if (next.size >= 2) {
          // Remove oldest selection
          const oldest = next.values().next().value;
          if (oldest) next.delete(oldest);
        }
        next.add(runId);
      }
      return next;
    });
  };

  const clearRuns = () => {
    telemetryStore.clearRuns();
    setSelectedRunIds(new Set());
  };

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-box">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium">
        Telemetry Charts ({runs.length} runs)
      </div>
      <div className="collapse-content space-y-3">
        {/* Run List */}
        {runs.length === 0 ? (
          <p className="text-sm text-base-content/60">
            No simulation runs yet. Run a simulation to see telemetry.
          </p>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-base-content/70">
                Select 1-2 runs to compare
              </span>
              <button
                onClick={clearRuns}
                className="btn btn-xs btn-ghost text-error"
              >
                Clear All
              </button>
            </div>
            <ul className="space-y-1">
              {runs.map((run) => {
                const stats = telemetryStore.getRunStats(run);
                const isSelected = selectedRunIds.has(run.id);
                return (
                  <li
                    key={run.id}
                    onClick={() => toggleRunSelection(run.id)}
                    className={`p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-base-300 hover:bg-base-300/80'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{run.characterName}</span>
                      <span className="text-base-content/60">
                        {run.data.length} points
                      </span>
                    </div>
                    <div className="text-base-content/70 mt-0.5">
                      E:{run.personality.extraversion} | Survival:{' '}
                      {((1 - stats.criticalEvents / run.data.length) * 100).toFixed(0)}%
                      | Mood: {stats.avgMood.toFixed(0)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Chart Type Selection */}
        {selectedRuns.length > 0 && (
          <>
            <div className="btn-group flex gap-1">
              {(['needs', 'derived', 'resources'] as const).map((type) => (
                <button
                  key={type}
                  className={`btn btn-xs flex-1 ${
                    chartType === type ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => setChartType(type)}
                >
                  {type === 'needs'
                    ? 'Needs'
                    : type === 'derived'
                      ? 'Derived'
                      : 'Resources'}
                </button>
              ))}
            </div>

            {/* Charts */}
            <div className="bg-base-300 rounded-lg p-2" style={{ minHeight: 250 }}>
              {selectedRuns.length === 1 && selectedRuns[0] ? (
                selectedRuns[0].data.length > 0 ? (
                  <SingleRunChart run={selectedRuns[0]} chartType={chartType} />
                ) : (
                  <div className="text-xs text-base-content/60 p-4">
                    No data points in this run
                  </div>
                )
              ) : selectedRuns.length >= 2 && selectedRuns[0] && selectedRuns[1] ? (
                <ComparisonChart runs={[selectedRuns[0], selectedRuns[1]]} chartType={chartType} />
              ) : (
                <div className="text-xs text-base-content/60 p-4">
                  Click on a run above to display charts
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// Single Run Chart
// ============================================================================

interface SingleRunChartProps {
  run: TelemetryRun;
  chartType: ChartType;
}

function SingleRunChart({ run, chartType }: SingleRunChartProps) {
  const data = useMemo(() => downsampleData(run.data), [run.data]);
  const { keys, colors, title } = getChartConfig(chartType);

  return (
    <div>
      <div className="text-xs font-medium mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="tick"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => formatTick(v)}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            labelFormatter={(v) => `Tick ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          {keys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key]}
              dot={false}
              strokeWidth={1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Comparison Chart
// ============================================================================

interface ComparisonChartProps {
  runs: [TelemetryRun, TelemetryRun];
  chartType: ChartType;
}

function ComparisonChart({ runs, chartType }: ComparisonChartProps) {
  const { keys, colors, title } = getChartConfig(chartType);
  const [run1, run2] = runs;

  // Merge data from both runs for overlay
  const mergedData = useMemo(() => {
    const data1 = downsampleData(run1.data);
    const data2 = downsampleData(run2.data);

    // Use first run as base, add second run values with suffix
    const maxLen = Math.max(data1.length, data2.length);
    const merged: Array<Record<string, number>> = [];

    for (let i = 0; i < maxLen; i++) {
      const point1 = data1[i];
      const point2 = data2[i];

      const mergedPoint: Record<string, number> = {
        tick: point1?.tick ?? point2?.tick ?? i,
      };

      // Add values from run 1 with _1 suffix
      for (const key of keys) {
        mergedPoint[`${key}_1`] = point1 ? (point1 as unknown as Record<string, number>)[key] ?? 0 : 0;
        mergedPoint[`${key}_2`] = point2 ? (point2 as unknown as Record<string, number>)[key] ?? 0 : 0;
      }

      merged.push(mergedPoint);
    }

    return merged;
  }, [run1, run2, keys]);

  // Generate line configs for both runs
  const lineConfigs = useMemo(() => {
    const configs: Array<{
      dataKey: string;
      stroke: string;
      strokeDasharray?: string;
      name: string;
    }> = [];

    // Pick one representative key per chart type for cleaner comparison
    const primaryKey = keys[0]; // e.g., 'hunger' for needs, 'mood' for derived
    if (!primaryKey) return configs;

    // Run 1: solid lines
    configs.push({
      dataKey: `${primaryKey}_1`,
      stroke: colors[primaryKey] ?? '#888',
      name: run1.characterName,
    });

    // Run 2: dashed lines
    configs.push({
      dataKey: `${primaryKey}_2`,
      stroke: colors[primaryKey] ?? '#888',
      strokeDasharray: '5 5',
      name: run2.characterName,
    });

    return configs;
  }, [run1, run2, keys, colors]);

  return (
    <div>
      <div className="text-xs font-medium mb-2">
        {title} - Comparison ({keys[0]})
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={mergedData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="tick"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => formatTick(v)}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            labelFormatter={(v) => `Tick ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          {lineConfigs.map((config) => (
            <Line
              key={config.dataKey}
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.stroke}
              strokeDasharray={config.strokeDasharray}
              name={config.name}
              dot={false}
              strokeWidth={1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getChartConfig(chartType: ChartType): {
  keys: string[];
  colors: Record<string, string>;
  title: string;
} {
  switch (chartType) {
    case 'needs':
      return {
        keys: ['hunger', 'energy', 'hygiene', 'bladder', 'social', 'fun', 'security'],
        colors: NEED_COLORS,
        title: 'Primary Needs',
      };
    case 'derived':
      return {
        keys: ['mood', 'purpose', 'nutrition'],
        colors: DERIVED_COLORS,
        title: 'Derived Wellbeing',
      };
    case 'resources':
      return {
        keys: ['overskudd', 'socialBattery', 'focus', 'willpower'],
        colors: RESOURCE_COLORS,
        title: 'Action Resources',
      };
  }
}

/**
 * Downsample data for chart rendering performance.
 * If data has more than 500 points, sample every Nth point.
 */
function downsampleData(data: TelemetryDataPoint[]): TelemetryDataPoint[] {
  const MAX_POINTS = 500;
  if (data.length <= MAX_POINTS) return data;

  const step = Math.ceil(data.length / MAX_POINTS);
  const sampled: TelemetryDataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    const point = data[i];
    if (point) sampled.push(point);
  }

  // Always include the last point
  const lastPoint = data[data.length - 1];
  const lastSampled = sampled[sampled.length - 1];
  if (lastPoint && lastSampled !== lastPoint) {
    sampled.push(lastPoint);
  }

  return sampled;
}

/**
 * Format tick number for X-axis display.
 * Shows day markers for long simulations.
 */
function formatTick(tick: number): string {
  if (tick >= 1440) {
    const days = Math.floor(tick / 1440);
    return `D${days}`;
  }
  if (tick >= 60) {
    const hours = Math.floor(tick / 60);
    return `${hours}h`;
  }
  return `${tick}`;
}
