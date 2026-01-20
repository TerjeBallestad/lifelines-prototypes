import { makeAutoObservable, action } from 'mobx';
import type { RootStore } from './RootStore';

export class SimulationStore {
  // Observable state
  tickCount = 0;
  speed = 1; // 0 = paused, 1 = normal, up to 10x
  isRunning = false;

  // Private
  private intervalHandle: number | null = null;
  private readonly TICK_RATE_MS = 1000;

  private root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, {
      start: action,
      stop: action,
      tick: action,
      setSpeed: action,
    });
  }

  start(): void {
    if (this.intervalHandle !== null) return;
    this.isRunning = true;
    this.intervalHandle = window.setInterval(() => {
      if (this.speed > 0) {
        this.tick();
      }
    }, this.TICK_RATE_MS);
  }

  stop(): void {
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.isRunning = false;
  }

  tick(): void {
    this.tickCount += 1;
    // Update character resources based on personality and simulation speed
    this.root.characterStore.character?.applyTickUpdate(this.speed);
  }

  setSpeed(newSpeed: number): void {
    this.speed = Math.max(0, Math.min(10, newSpeed));
  }

  // Computed: formatted time display
  get formattedTime(): string {
    const minutes = Math.floor(this.tickCount / 60);
    const seconds = this.tickCount % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
