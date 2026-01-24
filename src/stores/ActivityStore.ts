import { makeAutoObservable, observable } from 'mobx';
import { toast } from 'sonner';
import { Activity } from '../entities/Activity';
import type { RootStore } from './RootStore';
import type { ActivityData, CapacityKey, ResourceKey, NeedKey } from '../entities/types';
import type { Character } from '../entities/Character';
import { calculatePersonalityAlignment } from '../utils/personalityFit';

// Minimum overskudd required to start any activity
const MIN_OVERSKUDD_TO_START = 20;

// Activity execution state
type CurrentState = 'idle' | 'starting' | 'active' | 'completing';

interface FloatingNumberData {
  id: string;
  value: number;
  label: string;
  timestamp: number;
}

/**
 * ActivityStore - manages the activity queue and execution state.
 * Follows the same MobX pattern as SkillStore/SimulationStore.
 */
export class ActivityStore {
  // Observable activity queue (FIFO)
  queue = observable.array<Activity>();

  // Currently executing activity
  currentActivity: Activity | null = null;

  // Ticks elapsed on current activity
  currentProgress = 0;

  // Current execution state
  currentState: CurrentState = 'idle';

  // Floating numbers for UI feedback
  floatingNumbers = observable.array<FloatingNumberData>();

  // Track cumulative changes for completion summary
  private activityEffectTotals = new Map<string, number>();

  // Private reference to root store
  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  // ============================================================================
  // Queue Operations (Actions)
  // ============================================================================

  /**
   * Add an activity to the end of the queue.
   */
  enqueue(activityData: ActivityData): void {
    const activity = new Activity(activityData);
    this.queue.push(activity);
  }

  /**
   * Remove and return the first activity from the queue.
   */
  dequeue(): Activity | undefined {
    return this.queue.shift();
  }

  /**
   * Move an activity from one position to another in the queue.
   */
  reorder(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length
    ) {
      return;
    }

    const [removed] = this.queue.splice(fromIndex, 1);
    if (removed) {
      this.queue.splice(toIndex, 0, removed);
    }
  }

  /**
   * Remove an activity from the queue by index.
   */
  cancel(index: number): void {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Clear all activities from the queue.
   */
  clearQueue(): void {
    this.queue.splice(0);
  }

  /**
   * Cancel the currently executing activity.
   * Progress and partial effects are kept (no rollback).
   */
  cancelCurrent(): void {
    if (this.currentActivity) {
      toast.info(`Cancelled: ${this.currentActivity.name}`);
      this.currentActivity = null;
      this.currentProgress = 0;
      this.currentState = 'idle';
      this.activityEffectTotals.clear();
    }
  }

  // ============================================================================
  // Activity Start Check
  // ============================================================================

  /**
   * Check if the character can start an activity.
   * Returns { canStart: true } if allowed, or { canStart: false, reason: "..." } if not.
   */
  canStartActivity(activity: Activity): { canStart: boolean; reason?: string } {
    const character = this.root.characterStore.character;

    if (!character) {
      return { canStart: false, reason: 'No character available' };
    }

    // v1.1 vs v1.0: Check appropriate overskudd source
    const overskudd = this.root.needsSystemEnabled && character.actionResources
      ? character.actionResources.overskudd
      : character.resources.overskudd;

    // Check overskudd threshold
    if (overskudd < MIN_OVERSKUDD_TO_START) {
      return {
        canStart: false,
        reason: `${character.name} doesn't have the energy to start this`,
      };
    }

    // Check activity-specific requirements if present
    if (activity.startRequirements) {
      const { minOverskudd, minEnergy } = activity.startRequirements;

      if (minOverskudd !== undefined && overskudd < minOverskudd) {
        return {
          canStart: false,
          reason: `${character.name} doesn't have the energy to start this`,
        };
      }

      // v1.1 vs v1.0: Check appropriate energy source
      const energy = this.root.needsSystemEnabled && character.needs
        ? character.needs.energy
        : character.resources.energy;

      if (minEnergy !== undefined && energy < minEnergy) {
        return {
          canStart: false,
          reason: `${character.name} is too tired to start this`,
        };
      }
    }

    return { canStart: true };
  }

  // ============================================================================
  // Computed Getters
  // ============================================================================

  /**
   * Returns true if no activity is currently executing and state is idle.
   */
  get isIdle(): boolean {
    return this.currentState === 'idle' && this.currentActivity === null;
  }

  /**
   * Returns the number of activities in the queue.
   */
  get queueLength(): number {
    return this.queue.length;
  }

  /**
   * Returns true if there are any activities queued or in progress.
   */
  get hasQueuedActivities(): boolean {
    return this.queue.length > 0 || this.currentActivity !== null;
  }

  // ============================================================================
  // Root Store Access
  // ============================================================================

  /**
   * Expose root store for cross-store access.
   */
  get rootStore(): RootStore {
    return this.root;
  }

  // ============================================================================
  // Floating Number Management
  // ============================================================================

  /**
   * Emit a floating number for UI display.
   * Numbers auto-expire after 2 seconds.
   */
  private emitFloatingNumber(label: string, value: number): void {
    // Only emit if change is significant (>= 0.5)
    if (Math.abs(value) < 0.5) return;

    this.floatingNumbers.push({
      id: `${label}-${Date.now()}-${Math.random()}`,
      value,
      label,
      timestamp: Date.now(),
    });

    // Auto-cleanup after 2 seconds
    setTimeout(() => {
      this.cleanupExpiredFloatingNumbers();
    }, 2000);
  }

  /**
   * Remove expired floating numbers.
   */
  cleanupExpiredFloatingNumbers(): void {
    const now = Date.now();
    const expired = this.floatingNumbers.filter(fn => now - fn.timestamp > 2000);
    expired.forEach(fn => {
      const index = this.floatingNumbers.indexOf(fn);
      if (index >= 0) this.floatingNumbers.splice(index, 1);
    });
  }

  /**
   * Remove a specific floating number by id.
   * Called by UI when animation completes.
   */
  removeFloatingNumber(id: string): void {
    const index = this.floatingNumbers.findIndex(fn => fn.id === id);
    if (index >= 0) this.floatingNumbers.splice(index, 1);
  }

  // ============================================================================
  // Tick Processing
  // ============================================================================

  /**
   * Try to start the next activity in the queue.
   * Skips activities that can't be started and notifies user.
   */
  private tryStartNextActivity(): void {
    if (this.currentActivity || this.queue.length === 0) return;

    const next = this.queue[0];
    if (!next) return;

    const check = this.canStartActivity(next);

    if (check.canStart) {
      this.currentActivity = this.dequeue() || null;
      this.currentProgress = 0;
      this.currentState = 'active';
      this.activityEffectTotals.clear(); // Reset cumulative tracking
      toast.success(`Started: ${this.currentActivity?.name}`);
    } else {
      // Skip this activity, notify, try next
      toast.error(check.reason ?? 'Cannot start activity', {
        description: `${next.name} skipped`,
        duration: 3000,
      });
      this.dequeue(); // Remove from queue
      this.tryStartNextActivity(); // Try next recursively
    }
  }

  /**
   * Check if the current activity is complete based on its duration mode.
   */
  private isActivityComplete(): boolean {
    const activity = this.currentActivity;
    if (!activity) return false;

    const character = this.root.characterStore.character;
    if (!character) return false;

    switch (activity.durationMode.type) {
      case 'fixed':
        return this.currentProgress >= activity.durationMode.ticks;
      case 'threshold': {
        const { resource, target } = activity.durationMode;
        return character.resources[resource] >= target;
      }
      case 'needThreshold': {
        // v1.1: Check needs instead of resources
        const { need, target } = activity.durationMode;
        if (!character.needs) return true; // v1.0 mode - complete immediately
        return character.needs[need] >= target;
      }
      case 'variable': {
        const baseTime = activity.durationMode.baseTicks;
        const speedBonus = 1 - activity.masterySpeedBonus;
        return this.currentProgress >= baseTime * speedBonus;
      }
    }
  }

  /**
   * Calculate success probability based on character capacities vs activity capacityProfile.
   * Returns 0-1 probability where:
   * - 1.0 = character capacities meet or exceed all activity requirements
   * - 0.5 = character capacities are roughly half the requirements
   * - Higher mastery level provides a bonus to success probability
   */
  private calculateSuccessProbability(): number {
    const activity = this.currentActivity;
    const character = this.root.characterStore.character;
    if (!activity || !character) return 0;

    const capacityProfile = activity.capacityProfile;
    const profileEntries = Object.entries(capacityProfile) as [
      CapacityKey,
      number,
    ][];

    // If no capacity profile defined, activity always succeeds
    if (profileEntries.length === 0) return 1;

    // Calculate how well character capacities match activity requirements
    let totalRatio = 0;
    for (const [capacityKey, targetValue] of profileEntries) {
      const characterValue = character.effectiveCapacities[capacityKey];
      // Ratio capped at 1.5 (exceeding requirements helps, but with diminishing returns)
      const ratio = Math.min(1.5, characterValue / targetValue);
      totalRatio += ratio;
    }

    // Average ratio across all required capacities
    const averageRatio = totalRatio / profileEntries.length;

    // Base probability: 50% at ratio 0.5, 100% at ratio 1.0+
    const baseProbability = Math.min(1, averageRatio);

    // Mastery bonus: +5% per mastery level (up to +45% at level 10)
    // This represents learned efficiency overcoming natural capacity gaps
    const masteryBonus = activity.masteryBonus;
    const finalProbability = Math.min(1, baseProbability + masteryBonus);

    return finalProbability;
  }

  /**
   * Determine if activity succeeds or fails based on probability.
   * Returns { success: boolean, probability: number }
   */
  private rollForSuccess(): { success: boolean; probability: number } {
    const probability = this.calculateSuccessProbability();
    const roll = Math.random();
    return {
      success: roll <= probability,
      probability,
    };
  }

  /**
   * Complete the current activity with success/fail mechanics.
   */
  private completeActivity(): void {
    const activity = this.currentActivity;
    if (!activity) return;

    const character = this.root.characterStore.character;
    const { success, probability } = this.rollForSuccess();

    if (success) {
      // SUCCESS: Full mastery XP, normal domain XP
      activity.addMasteryXP(10);

      // Build summary description from cumulative changes
      const significantChanges = Array.from(this.activityEffectTotals.entries())
        .filter(([, val]) => Math.abs(val) >= 1)
        .map(([key, val]) => {
          const sign = val >= 0 ? '+' : '';
          return `${key}: ${sign}${val.toFixed(0)}`;
        })
        .slice(0, 4); // Max 4 changes to keep toast readable

      const description = significantChanges.length > 0
        ? significantChanges.join(', ')
        : undefined;

      toast.success(`Completed: ${activity.name}!`, {
        description,
        duration: 3000,
      });
    } else {
      // FAILURE: Reduced mastery XP (50%), reduced domain XP happens via multiplier
      activity.addMasteryXP(5); // Half XP on failure

      // Apply penalty resource effects (additional drain on key resources)
      if (character) {
        const penaltyDrain = 5; // Flat penalty

        if (this.root.needsSystemEnabled && character.actionResources) {
          // v1.1: Drain action resources
          character.actionResources.overskudd = Math.max(
            0,
            character.actionResources.overskudd - penaltyDrain
          );
          character.actionResources.willpower = Math.max(
            0,
            character.actionResources.willpower - penaltyDrain
          );
        } else {
          // v1.0: Drain legacy resources
          character.resources.overskudd = Math.max(
            0,
            character.resources.overskudd - penaltyDrain
          );
          character.resources.mood = Math.max(
            0,
            character.resources.mood - penaltyDrain
          );
        }
      }

      const probabilityPercent = Math.round(probability * 100);
      toast.error(`Failed: ${activity.name}`, {
        description: character
          ? `${character.name} struggled with this activity (${probabilityPercent}% success chance)`
          : `Activity failed (${probabilityPercent}% success chance)`,
        duration: 3000,
      });
    }

    this.currentActivity = null;
    this.currentProgress = 0;
    this.currentState = 'idle';
  }

  /**
   * Calculate escape valve multiplier for struggling patients.
   * When any physiological need is below 20%, reduce activity costs by 50%.
   * This prevents total paralysis when patient is in crisis.
   */
  private calculateEscapeValve(character: Character): number {
    if (!character.needs) return 1.0; // v1.0 mode, no escape valve

    const physiologicalNeeds = ['hunger', 'energy', 'hygiene', 'bladder'] as const;
    const needs = character.needs;
    const isStrugging = physiologicalNeeds.some(
      need => needs[need] < 20
    );

    return isStrugging ? 0.5 : 1.0;
  }

  /**
   * Estimate expected duration of an activity in ticks.
   * Used to spread resource costs over the activity duration.
   */
  private estimateActivityDuration(activity: Activity): number {
    switch (activity.durationMode.type) {
      case 'fixed':
        return activity.durationMode.ticks;
      case 'variable':
        return activity.durationMode.baseTicks * (1 - activity.masterySpeedBonus);
      case 'threshold':
      case 'needThreshold':
        // Estimate ~30 ticks for threshold activities
        return 30;
    }
  }

  /**
   * Apply per-tick resource effects from the current activity.
   * v1.1: Also handles need restoration and action resource costs.
   */
  private applyResourceEffects(speedMultiplier: number): void {
    const activity = this.currentActivity;
    const character = this.root.characterStore.character;
    if (!activity || !character) return;

    // Calculate escape valve multiplier (struggling patient gets 50% cost reduction)
    const escapeValve = this.calculateEscapeValve(character);

    // v1.1: Apply difficulty-based action resource costs
    if (character.actionResources) {
      const costs = activity.getResourceCosts(character);
      const estimatedDuration = this.estimateActivityDuration(activity);

      // Spread costs over activity duration (per-tick drain)
      const perTickMultiplier = speedMultiplier / estimatedDuration;

      // Apply escape valve to costs
      const overskuddDrain = costs.overskudd * perTickMultiplier * escapeValve;
      const willpowerDrain = costs.willpower * perTickMultiplier * escapeValve;
      const focusDrain = costs.focus * perTickMultiplier * escapeValve;
      const socialBatteryDrain = costs.socialBattery * perTickMultiplier * escapeValve;

      // Apply drains to action resources
      character.actionResources.overskudd = Math.max(
        0,
        character.actionResources.overskudd - overskuddDrain
      );
      character.actionResources.willpower = Math.max(
        0,
        character.actionResources.willpower - willpowerDrain
      );
      character.actionResources.focus = Math.max(
        0,
        character.actionResources.focus - focusDrain
      );
      character.actionResources.socialBattery = Math.max(
        0,
        character.actionResources.socialBattery - socialBatteryDrain
      );

      // Track cumulative drains for completion summary
      if (overskuddDrain > 0) {
        const current = this.activityEffectTotals.get('Overskudd') ?? 0;
        this.activityEffectTotals.set('Overskudd', current - overskuddDrain);
      }
    }

    // Calculate alignment for need restoration and v1.0 resource effects
    const alignment = calculatePersonalityAlignment(
      activity.tags,
      character.personality
    );

    // v1.0 ONLY: Apply legacy resource effects (skip in v1.1 mode)
    if (!this.root.needsSystemEnabled) {
      for (const [key, baseEffect] of Object.entries(activity.resourceEffects)) {
        const resourceKey = key as ResourceKey;
        let effect = baseEffect * speedMultiplier;

        // Mastery reduces drain, modestly increases restore
        if (effect < 0) {
          // DRAIN: apply mastery reduction, alignment cost multiplier, escape valve
          effect *= 1 - activity.masteryDrainReduction;
          effect *= alignment.costMultiplier;  // aligned = lower costs
          effect *= escapeValve;               // struggling = lower costs
        } else {
          // RESTORE: apply mastery bonus, alignment gain multiplier
          effect *= 1 + activity.masteryBonus * 0.5;
          effect *= alignment.gainMultiplier;  // aligned = higher gains
        }

        // Apply to character resources (clamp handled in updateResources)
        const newValue = Math.max(
          0,
          Math.min(100, character.resources[resourceKey] + effect)
        );
        character.resources[resourceKey] = newValue;
      }
    }

    // v1.1 Need restoration (if needs system enabled)
    if (character.needs && activity.needEffects) {
      for (const [needKey, baseRestore] of Object.entries(activity.needEffects)) {
        // Apply personality gain multiplier
        let restore = baseRestore * alignment.gainMultiplier * speedMultiplier;

        // Apply mastery bonus (same pattern as resource restore)
        restore *= 1 + activity.masteryBonus * 0.5;

        // Update need (clamped to 0-100)
        const key = needKey as NeedKey;
        character.needs[key] = Math.max(0, Math.min(100, character.needs[key] + restore));

        // Emit floating number for significant changes
        if (Math.abs(restore) >= 0.5) {
          this.emitFloatingNumber(needKey, restore);
        }

        // Track cumulative changes for completion summary
        const current = this.activityEffectTotals.get(needKey) ?? 0;
        this.activityEffectTotals.set(needKey, current + restore);
      }
    }
  }

  /**
   * Award domain XP based on activity execution.
   */
  private awardDomainXP(speedMultiplier: number): void {
    const activity = this.currentActivity;
    if (!activity) return;

    const baseXP = activity.baseXPRate * speedMultiplier;
    const adjustedXP = baseXP * activity.domainXPMultiplier;

    this.root.skillStore.addDomainXP(activity.domain, adjustedXP);
  }

  /**
   * Process one tick of activity execution.
   * Called by SimulationStore.tick().
   */
  processTick(speedMultiplier: number): void {
    // Try to start next activity if idle
    if (!this.currentActivity) {
      this.tryStartNextActivity();
    }

    // Execute current activity tick
    if (this.currentActivity) {
      this.currentProgress += speedMultiplier;
      this.applyResourceEffects(speedMultiplier);
      this.awardDomainXP(speedMultiplier);

      // Check completion
      if (this.isActivityComplete()) {
        this.completeActivity();
      }
    }
  }
}
