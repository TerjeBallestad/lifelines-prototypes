import type { RootStore } from '../stores/RootStore';
import type { TelemetryRun } from '../stores/TelemetryStore';
import type { BalanceConfig } from '../config/balance';
import type { Personality } from '../entities/types';

export type HeadlessSimulationConfig = {
  /** Number of ticks to simulate (7 days = 7 * 24 * 60 = 10080 at 1 tick/min) */
  ticks: number;
  /** Balance config to use (null = use current) */
  balanceConfig?: BalanceConfig;
  /** Personality override for character */
  personality?: Partial<Personality>;
  /** Sample rate: record every Nth tick (1 = all, 10 = every 10th) */
  sampleRate?: number;
  /** Character name for run identification */
  characterName?: string;
};

export type HeadlessSimulationResult = {
  run: TelemetryRun;
  success: boolean;
  failureReason?: string;
  stats: {
    minNeeds: Record<string, number>;
    avgMood: number;
    criticalEvents: number;
    survivalRate: number; // % of ticks with no critical needs
  };
};

/**
 * Run a headless simulation without React rendering.
 * Yields to event loop every 100 ticks to prevent UI blocking.
 */
export async function runHeadlessSimulation(
  rootStore: RootStore,
  config: HeadlessSimulationConfig
): Promise<HeadlessSimulationResult> {
  const { ticks, balanceConfig, personality, sampleRate = 1 } = config;

  // Apply balance config if provided
  if (balanceConfig) {
    rootStore.balanceConfig.update(balanceConfig);
  }

  // Get or create character
  const character = rootStore.characterStore.character;
  if (!character) {
    return {
      run: null as unknown as TelemetryRun,
      success: false,
      failureReason: 'No character available',
      stats: { minNeeds: {}, avgMood: 0, criticalEvents: 0, survivalRate: 0 },
    };
  }

  // Apply personality override if provided
  if (personality) {
    Object.assign(character.personality, personality);
  }

  // Enable autonomous mode
  character.freeWillEnabled = true;

  // Enable headless mode to skip talent modal popups
  rootStore.talentStore.headlessMode = true;

  // Start telemetry run
  rootStore.telemetryStore.startRun(character);

  // Run simulation
  for (let i = 0; i < ticks; i++) {
    // Tick simulation (this updates character state and triggers AI)
    rootStore.simulationStore.tick();

    // Record telemetry at sample rate
    if (i % sampleRate === 0) {
      const currentActivity = rootStore.activityStore.currentActivity?.name ?? null;
      rootStore.telemetryStore.recordTick(character, i, currentActivity);
    }

    // Yield to event loop every 100 ticks to keep UI responsive
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Disable headless mode after simulation
  rootStore.talentStore.headlessMode = false;

  // End run and get stats
  const run = rootStore.telemetryStore.endRun();
  if (!run) {
    return {
      run: null as unknown as TelemetryRun,
      success: false,
      failureReason: 'Telemetry run failed to complete',
      stats: { minNeeds: {}, avgMood: 0, criticalEvents: 0, survivalRate: 0 },
    };
  }
  const stats = rootStore.telemetryStore.getRunStats(run);

  // Calculate survival rate
  const survivalRate = 1 - (stats.criticalEvents / run.data.length);

  return {
    run,
    success: survivalRate > 0.9, // 90%+ survival = success
    stats: { ...stats, survivalRate },
  };
}

/**
 * 7 in-game days at 1 tick per minute = 10080 ticks.
 * Use sample rate 10 to capture 1008 data points.
 */
export const SEVEN_DAYS_TICKS = 7 * 24 * 60;
export const DEFAULT_SAMPLE_RATE = 10;
