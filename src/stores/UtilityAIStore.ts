import { makeAutoObservable, observable } from 'mobx';
import type { RootStore } from './RootStore';
import { Activity } from '../entities/Activity';
import type { Character } from '../entities/Character';
import type {
  AIDecision,
  UtilityWeights,
  UtilityFactors,
} from '../types/autonomy';
import { DEFAULT_UTILITY_WEIGHTS } from '../types/autonomy';
import {
  calculateUtilityScore,
  shouldOverrideToCriticalMode,
  scoreInCriticalMode,
} from '../utils/utilityScoring';
import { weightedSampleWithoutReplacement } from '../utils/weightedRandom';
import { STARTER_ACTIVITIES } from '../data/activities';
import type { NeedKey } from '../entities/types';

/**
 * UtilityAIStore - manages autonomous activity selection for characters.
 *
 * When Free Will is enabled and the character is idle (no current activity
 * and no player-queued activities), this store:
 * 1. Scores all available activities using utility functions
 * 2. Selects from top candidates with weighted random selection
 * 3. Enqueues the selected activity
 * 4. Logs the decision for debugging/insight
 *
 * Critical mode: When any physiological need is below 15%, the AI
 * overrides normal scoring to prioritize survival needs.
 */
export class UtilityAIStore {
  /** Last 5 AI decisions for debugging and player insight */
  decisionLog = observable.array<AIDecision>([]);

  /** Utility weights for scoring factors */
  private weights: UtilityWeights = DEFAULT_UTILITY_WEIGHTS;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  /**
   * Computed getter for the current character.
   */
  get character(): Character | null {
    return this.root.characterStore.character;
  }

  /**
   * Get all activities that the character can currently start.
   * Creates Activity instances from STARTER_ACTIVITIES and filters
   * by canStartActivity check.
   */
  getAvailableActivities(): Array<Activity> {
    const character = this.character;
    if (!character) return [];

    const activities: Array<Activity> = [];
    for (const data of STARTER_ACTIVITIES) {
      const activity = new Activity(data);
      const check = this.root.activityStore.canStartActivity(activity);
      if (check.canStart) {
        activities.push(activity);
      }
    }
    return activities;
  }

  /**
   * Make an autonomous decision about which activity to select.
   * Returns null if no character, no available activities, or conditions not met.
   *
   * In critical mode (any physiological need < 15%):
   * - Scores using pure urgency (survival override)
   * - Picks the highest scoring activity (no variety)
   *
   * In normal mode:
   * - Scores all activities with 5 utility factors
   * - Takes top 5 candidates
   * - Filters out any scoring < 50% of best score
   * - Uses weighted random selection with personality-based variety
   */
  makeDecision(): AIDecision | null {
    const character = this.character;
    if (!character) return null;

    const availableActivities = this.getAvailableActivities();
    if (availableActivities.length === 0) return null;

    const isCriticalMode = shouldOverrideToCriticalMode(character);
    const currentActivity = this.root.activityStore.currentActivity;

    if (isCriticalMode) {
      return this.makeDecisionInCriticalMode(
        availableActivities,
        character,
        currentActivity
      );
    } else {
      return this.makeDecisionInNormalMode(
        availableActivities,
        character,
        currentActivity
      );
    }
  }

  /**
   * Make decision in critical mode - pure survival override.
   * Picks the activity that best addresses critical needs.
   */
  private makeDecisionInCriticalMode(
    activities: Array<Activity>,
    character: Character,
    currentActivity: Activity | null
  ): AIDecision | null {
    // Score all activities using critical mode scoring
    const scored = activities.map((activity) => ({
      activity,
      score: scoreInCriticalMode(activity, character),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Pick the highest scoring activity
    const best = scored[0];
    if (!best || best.score <= 0) return null;

    // Calculate utility factors for breakdown (even in critical mode for logging)
    const isCurrentActivity = currentActivity?.id === best.activity.id;
    const { factors } = calculateUtilityScore(
      best.activity,
      character,
      this.weights,
      isCurrentActivity
    );

    // Generate top reason for critical mode
    const topReason = this.generateTopReason(
      best.activity,
      character,
      factors,
      true
    );

    // Build top alternatives (next 2 best)
    const topAlternatives = scored.slice(1, 3).map((s) => ({
      activityId: s.activity.id,
      activityName: s.activity.name,
      score: s.score,
    }));

    return {
      timestamp: Date.now(),
      activityId: best.activity.id,
      activityName: best.activity.name,
      topReason,
      score: best.score,
      breakdown: factors,
      topAlternatives,
      criticalMode: true,
    };
  }

  /**
   * Make decision in normal mode - weighted utility scoring with variety.
   */
  private makeDecisionInNormalMode(
    activities: Array<Activity>,
    character: Character,
    currentActivity: Activity | null
  ): AIDecision | null {
    // Score all activities with full utility function
    const scored = activities.map((activity) => {
      const isCurrentActivity = currentActivity?.id === activity.id;
      const { score, factors } = calculateUtilityScore(
        activity,
        character,
        this.weights,
        isCurrentActivity
      );
      return { activity, score, factors };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Take top 5 candidates
    const topCandidates = scored.slice(0, 5);

    if (topCandidates.length === 0) return null;

    const bestScore = topCandidates[0]?.score ?? 0;
    if (bestScore <= 0) return null;

    // Filter: remove any scoring < 50% of best score
    const viable = topCandidates.filter((c) => c.score >= bestScore * 0.5);

    if (viable.length === 0) return null;

    // Calculate personality-based variety multiplier
    // Higher openness = more variety (flatter distribution)
    // Higher conscientiousness = less variety (prefer top choice)
    const varietyMultiplier =
      1.0 +
      (character.personality.openness - 50) * 0.01 -
      (character.personality.conscientiousness - 50) * 0.005;

    // Apply varietyMultiplier to weights for selection
    // Higher varietyMultiplier flattens the weight distribution
    // The multiplier raises each score to its power (1/multiplier)
    // Values > 1 flatten differences (more random), < 1 amplify (less random)
    const adjustedWeights = viable.map(({ score }) =>
      Math.pow(score, 1 / varietyMultiplier)
    );

    // Weighted random selection
    const [selectedIndex] = weightedSampleWithoutReplacement(
      adjustedWeights,
      1
    );

    if (selectedIndex === undefined) return null;

    const selected = viable[selectedIndex];

    if (!selected) return null;

    // Generate top reason based on dominant factor
    const topReason = this.generateTopReason(
      selected.activity,
      character,
      selected.factors,
      false
    );

    // Build top alternatives (next 2 best from viable, excluding selected)
    const alternatives = viable
      .filter((v) => v.activity.id !== selected.activity.id)
      .slice(0, 2)
      .map((v) => ({
        activityId: v.activity.id,
        activityName: v.activity.name,
        score: v.score,
      }));

    return {
      timestamp: Date.now(),
      activityId: selected.activity.id,
      activityName: selected.activity.name,
      topReason,
      score: selected.score,
      breakdown: selected.factors,
      topAlternatives: alternatives,
      criticalMode: false,
    };
  }

  /**
   * Generate a human-readable reason for the activity selection.
   * In critical mode: identifies the critical need.
   * In normal mode: identifies the dominant utility factor.
   */
  generateTopReason(
    activity: Activity,
    character: Character,
    factors: UtilityFactors,
    criticalMode: boolean
  ): string {
    // In critical mode, find the critical need
    if (criticalMode) {
      const { hunger, bladder, energy } = character.needs;
      let criticalNeed = '';
      let criticalValue = 100;

      if (hunger < 15 && hunger < criticalValue) {
        criticalNeed = 'Hunger';
        criticalValue = hunger;
      }
      if (bladder < 15 && bladder < criticalValue) {
        criticalNeed = 'Bladder';
        criticalValue = bladder;
      }
      if (energy < 15 && energy < criticalValue) {
        criticalNeed = 'Energy';
        criticalValue = energy;
      }

      return `${activity.name} because ${criticalNeed} critical (${Math.round(criticalValue)}%)`;
    }

    // In normal mode, find the dominant factor
    const factorScores: Array<{ name: string; value: number; reason: string }> =
      [
        {
          name: 'needUrgency',
          value: factors.needUrgency,
          reason: this.getNeedReasonText(activity, character),
        },
        {
          name: 'personalityFit',
          value: factors.personalityFit,
          reason: 'it fits personality',
        },
        {
          name: 'resourceAvailability',
          value: factors.resourceAvailability,
          reason: 'resources available',
        },
        {
          name: 'willpowerMatch',
          value: factors.willpowerMatch,
          reason: "it's easy enough",
        },
        {
          name: 'moodDelta',
          value: factors.moodDelta,
          reason: 'it would boost mood',
        },
      ];

    // Find the highest scoring factor
    factorScores.sort((a, b) => b.value - a.value);
    const dominant = factorScores[0];

    return `${activity.name} because ${dominant?.reason ?? 'it seemed right'}`;
  }

  /**
   * Get a need-specific reason text based on the activity's need effects.
   */
  private getNeedReasonText(activity: Activity, character: Character): string {
    if (!activity.needEffects) return 'needs attention';

    // Find the need with lowest value that this activity restores
    const needKeys = Object.keys(activity.needEffects) as Array<NeedKey>;
    let lowestNeed: NeedKey = 'hunger';
    let lowestValue = 100;

    for (const needKey of needKeys) {
      const restoration = activity.needEffects[needKey] ?? 0;
      if (restoration > 0) {
        const currentValue = character.needs[needKey];
        if (currentValue < lowestValue) {
          lowestValue = currentValue;
          lowestNeed = needKey;
        }
      }
    }

    // Map need key to human-readable reason
    const needReasonMap: Record<NeedKey, string> = {
      hunger: 'hungry',
      energy: 'tired',
      hygiene: 'needs cleaning',
      bladder: 'needs bathroom',
      social: 'lonely',
      fun: 'bored',
      security: 'anxious',
    };

    return needReasonMap[lowestNeed];
  }

  /**
   * Add a decision to the log, keeping only the last 5.
   */
  addDecision(decision: AIDecision): void {
    this.decisionLog.push(decision);
    if (this.decisionLog.length > 5) {
      this.decisionLog.shift();
    }
  }

  /**
   * Process one tick of AI decision-making.
   * Called by SimulationStore.tick() (or directly for testing).
   *
   * Conditions for making a decision:
   * 1. Character exists
   * 2. freeWillEnabled is true
   * 3. ActivityStore is idle (no current activity)
   * 4. No player-queued activities
   */
  processTick(): void {
    const character = this.character;
    if (!character) return;

    // Check Free Will is enabled
    if (!character.freeWillEnabled) return;

    // Check idle state
    if (!this.root.activityStore.isIdle) return;

    // Check no player queue
    if (this.root.activityStore.queue.length > 0) return;

    // Make decision
    const decision = this.makeDecision();
    if (!decision) return;

    // Find the activity data and enqueue it
    const activityData = STARTER_ACTIVITIES.find(
      (a) => a.id === decision.activityId
    );
    if (activityData) {
      this.root.activityStore.enqueue(activityData);
      this.addDecision(decision);
    }
  }
}
