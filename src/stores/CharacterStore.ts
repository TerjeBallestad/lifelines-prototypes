import { makeAutoObservable } from 'mobx';
import type { RootStore } from './RootStore';

export class CharacterStore {
  // Will hold Character entity in Plan 03
  // Placeholder property to prove MobX works
  initialized = false;

  // Store root reference for cross-store communication (used in future plans)
  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  // Placeholder action - will become createCharacter in Plan 03
  markInitialized(): void {
    this.initialized = true;
  }

  get isReady(): boolean {
    return this.initialized;
  }

  // Expose root store for cross-store access (will be used in future plans)
  get rootStore(): RootStore {
    return this.root;
  }
}
