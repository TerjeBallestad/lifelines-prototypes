import { makeAutoObservable, observable } from 'mobx';
import { Activity } from '../entities/Activity';
import type { RootStore } from './RootStore';
import type { ActivityData } from '../entities/types';

// Minimum overskudd required to start any activity
const MIN_OVERSKUDD_TO_START = 20;

// Activity execution state
type CurrentState = 'idle' | 'starting' | 'active' | 'completing';

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
  currentProgress: number = 0;

  // Current execution state
  currentState: CurrentState = 'idle';

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

    // Check overskudd threshold
    if (character.resources.overskudd < MIN_OVERSKUDD_TO_START) {
      return {
        canStart: false,
        reason: `${character.name} doesn't have the energy to start this`,
      };
    }

    // Check activity-specific requirements if present
    if (activity.startRequirements) {
      const { minOverskudd, minEnergy } = activity.startRequirements;

      if (minOverskudd !== undefined && character.resources.overskudd < minOverskudd) {
        return {
          canStart: false,
          reason: `${character.name} doesn't have the energy to start this`,
        };
      }

      if (minEnergy !== undefined && character.resources.energy < minEnergy) {
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
}
