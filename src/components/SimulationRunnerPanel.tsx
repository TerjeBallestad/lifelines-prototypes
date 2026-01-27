import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../stores/RootStore';
import { runHeadlessSimulation } from '../utils/headlessSimulation';
import type { HeadlessSimulationResult } from '../utils/headlessSimulation';

const DURATIONS = {
  '1 day': 1440,
  '3 days': 4320,
  '7 days': 10080,
} as const;

const SAMPLE_RATES = {
  'Every tick': 1,
  'Every 10 ticks': 10,
  'Every 60 ticks': 60,
} as const;

type PersonalityPreset = 'Current' | 'Introvert' | 'Extrovert';

/**
 * SimulationRunnerPanel - UI controls for running headless simulations.
 *
 * Allows player/designer to:
 * - Configure simulation duration and sample rate
 * - Select personality presets (Introvert, Extrovert, Current)
 * - Run single or comparison simulations
 * - View progress during simulation
 * - See results summary after completion
 */
export const SimulationRunnerPanel = observer(function SimulationRunnerPanel() {
  const rootStore = useRootStore();

  // Configuration state
  const [duration, setDuration] = useState<keyof typeof DURATIONS>('7 days');
  const [sampleRate, setSampleRate] = useState<keyof typeof SAMPLE_RATES>('Every 10 ticks');
  const [personality, setPersonality] = useState<PersonalityPreset>('Current');

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<HeadlessSimulationResult | null>(null);
  const [comparisonResults, setComparisonResults] = useState<{
    introvert: HeadlessSimulationResult | null;
    extrovert: HeadlessSimulationResult | null;
  }>({ introvert: null, extrovert: null });

  const character = rootStore.characterStore.character;
  if (!character) return null;

  const runSingleSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setLastResult(null);

    const ticks = DURATIONS[duration];
    const rate = SAMPLE_RATES[sampleRate];

    // Store original personality for restoration
    const originalPersonality = { ...character.personality };

    // Apply personality preset
    const personalityOverride = personality === 'Introvert'
      ? { extraversion: 20 }
      : personality === 'Extrovert'
        ? { extraversion: 80 }
        : undefined;

    // Run with progress tracking (approximate via timeout)
    const startTime = Date.now();
    const estimatedDuration = ticks * 0.01; // ~10ms per tick batch (100 ticks)

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const estimatedProgress = Math.min(99, (elapsed / estimatedDuration) * 100);
      setProgress(estimatedProgress);
    }, 100);

    try {
      const result = await runHeadlessSimulation(rootStore, {
        ticks,
        sampleRate: rate,
        personality: personalityOverride,
        characterName: personality === 'Current' ? character.name : `${character.name} (${personality})`,
      });

      setLastResult(result);
      setProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
      // Restore original personality
      Object.assign(character.personality, originalPersonality);
    }
  };

  const runComparison = async () => {
    setIsRunning(true);
    setProgress(0);
    setComparisonResults({ introvert: null, extrovert: null });
    setLastResult(null);

    const ticks = DURATIONS[duration];
    const rate = SAMPLE_RATES[sampleRate];

    // Store original personality
    const originalPersonality = { ...character.personality };

    try {
      // Run introvert
      setProgress(10);
      const introvertResult = await runHeadlessSimulation(rootStore, {
        ticks,
        sampleRate: rate,
        personality: { extraversion: 20 },
        characterName: `${character.name} (Introvert)`,
      });

      setProgress(50);

      // Reset character state for extrovert run
      character.resetNeedsAndResources();

      // Run extrovert
      const extrovertResult = await runHeadlessSimulation(rootStore, {
        ticks,
        sampleRate: rate,
        personality: { extraversion: 80 },
        characterName: `${character.name} (Extrovert)`,
      });

      setComparisonResults({
        introvert: introvertResult,
        extrovert: extrovertResult,
      });
      setProgress(100);
    } finally {
      setIsRunning(false);
      // Restore original personality
      Object.assign(character.personality, originalPersonality);
    }
  };

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-box">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-medium">
        Simulation Runner
      </div>
      <div className="collapse-content space-y-3">
        {/* Configuration */}
        <div className="grid grid-cols-2 gap-2">
          {/* Duration */}
          <div>
            <label className="text-xs text-base-content/70">Duration</label>
            <select
              className="select select-xs select-bordered w-full"
              value={duration}
              onChange={(e) => setDuration(e.target.value as keyof typeof DURATIONS)}
              disabled={isRunning}
            >
              {Object.keys(DURATIONS).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sample Rate */}
          <div>
            <label className="text-xs text-base-content/70">Sample Rate</label>
            <select
              className="select select-xs select-bordered w-full"
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value as keyof typeof SAMPLE_RATES)}
              disabled={isRunning}
            >
              {Object.keys(SAMPLE_RATES).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Personality Presets */}
        <div>
          <label className="text-xs text-base-content/70">Personality</label>
          <div className="btn-group flex gap-1 mt-1">
            {(['Current', 'Introvert', 'Extrovert'] as const).map((p) => (
              <button
                key={p}
                className={`btn btn-xs flex-1 ${personality === p ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPersonality(p)}
                disabled={isRunning}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary flex-1"
            onClick={runSingleSimulation}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
          <button
            className="btn btn-sm btn-secondary flex-1"
            onClick={runComparison}
            disabled={isRunning}
          >
            Run Comparison
          </button>
        </div>

        {/* Progress Indicator */}
        {isRunning && (
          <div className="space-y-1">
            <div className="text-xs text-base-content/70">
              Running... {progress.toFixed(0)}%
            </div>
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            />
          </div>
        )}

        {/* Single Run Results */}
        {lastResult && !comparisonResults.introvert && (
          <ResultsSummary label="Result" result={lastResult} />
        )}

        {/* Comparison Results */}
        {comparisonResults.introvert && comparisonResults.extrovert && (
          <div className="space-y-2">
            <ResultsSummary label="Introvert" result={comparisonResults.introvert} />
            <ResultsSummary label="Extrovert" result={comparisonResults.extrovert} />
          </div>
        )}
      </div>
    </div>
  );
});

// Helper component for displaying result summary
function ResultsSummary({ label, result }: { label: string; result: HeadlessSimulationResult }) {
  const { stats, success } = result;

  return (
    <div className={`p-2 rounded-lg text-xs ${success ? 'bg-success/20' : 'bg-error/20'}`}>
      <div className="font-medium mb-1">
        {label}: {success ? 'Survived' : 'Struggled'}
      </div>
      <div className="grid grid-cols-2 gap-1 text-base-content/80">
        <div>Survival: {(stats.survivalRate * 100).toFixed(1)}%</div>
        <div>Avg Mood: {stats.avgMood.toFixed(1)}</div>
        <div>Min Need: {Math.min(...Object.values(stats.minNeeds)).toFixed(1)}</div>
        <div>Critical: {stats.criticalEvents}</div>
      </div>
    </div>
  );
}
