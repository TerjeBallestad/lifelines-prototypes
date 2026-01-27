import { makeAutoObservable, action } from 'mobx';
import type { Character } from '../entities/Character';
import type { NeedKey } from '../entities/types';

export type TelemetryDataPoint = {
  tick: number;
  timestamp: number;
  characterId: string;
  // Primary needs
  hunger: number;
  energy: number;
  hygiene: number;
  bladder: number;
  social: number;
  fun: number;
  security: number;
  // Derived wellbeing
  mood: number;
  purpose: number;
  nutrition: number;
  // Action resources
  overskudd: number;
  socialBattery: number;
  focus: number;
  willpower: number;
  // Activity info
  currentActivity: string | null;
  criticalNeeds: Array<NeedKey>;
};

export type TelemetryRun = {
  id: string;
  characterName: string;
  personality: { extraversion: number; openness: number; conscientiousness: number };
  startTime: number;
  endTime?: number;
  tickCount: number;
  data: Array<TelemetryDataPoint>;
};

export class TelemetryStore {
  runs: Array<TelemetryRun> = [];
  activeRun: TelemetryRun | null = null;

  constructor() {
    makeAutoObservable(this, {
      startRun: action,
      recordTick: action,
      endRun: action,
      clearRuns: action,
    });
  }

  startRun(character: Character): void {
    this.activeRun = {
      id: `run-${Date.now()}`,
      characterName: character.name,
      personality: {
        extraversion: character.personality.extraversion,
        openness: character.personality.openness,
        conscientiousness: character.personality.conscientiousness,
      },
      startTime: Date.now(),
      tickCount: 0,
      data: [],
    };
  }

  recordTick(character: Character, tick: number, currentActivity: string | null): void {
    if (!this.activeRun) return;

    const criticalNeeds: Array<NeedKey> = [];
    const criticalThreshold = 20;
    for (const key of ['hunger', 'energy', 'hygiene', 'bladder', 'social', 'fun', 'security'] as Array<NeedKey>) {
      if (character.needs[key] < criticalThreshold) {
        criticalNeeds.push(key);
      }
    }

    const point: TelemetryDataPoint = {
      tick,
      timestamp: Date.now(),
      characterId: character.id,
      hunger: character.needs.hunger,
      energy: character.needs.energy,
      hygiene: character.needs.hygiene,
      bladder: character.needs.bladder,
      social: character.needs.social,
      fun: character.needs.fun,
      security: character.needs.security,
      mood: character.derivedStats.mood,
      purpose: character.derivedStats.purpose,
      nutrition: character.derivedStats.nutrition,
      overskudd: character.actionResources.overskudd,
      socialBattery: character.actionResources.socialBattery,
      focus: character.actionResources.focus,
      willpower: character.actionResources.willpower,
      currentActivity,
      criticalNeeds,
    };

    this.activeRun.data.push(point);
    this.activeRun.tickCount = tick;
  }

  endRun(): TelemetryRun | null {
    if (!this.activeRun) return null;
    this.activeRun.endTime = Date.now();
    const completedRun = this.activeRun;
    this.runs.push(completedRun);
    this.activeRun = null;
    return completedRun;
  }

  clearRuns(): void {
    this.runs = [];
    this.activeRun = null;
  }

  // Computed: Get run statistics
  getRunStats(run: TelemetryRun): {
    minNeeds: Record<NeedKey, number>;
    avgMood: number;
    criticalEvents: number;
  } {
    const needs: Array<NeedKey> = ['hunger', 'energy', 'hygiene', 'bladder', 'social', 'fun', 'security'];
    const minNeeds = {} as Record<NeedKey, number>;
    for (const need of needs) {
      minNeeds[need] = Math.min(...run.data.map(d => d[need]));
    }
    const avgMood = run.data.reduce((sum, d) => sum + d.mood, 0) / run.data.length;
    const criticalEvents = run.data.filter(d => d.criticalNeeds.length > 0).length;
    return { minNeeds, avgMood, criticalEvents };
  }
}
