import { makeAutoObservable } from 'mobx';
import type { RootStore } from './RootStore';

export class CharacterStore {
  // Will hold Character entity in Plan 03
  // Placeholder property to prove MobX works
  initialized = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this);
  }

  // Placeholder action - will become createCharacter in Plan 03
  markInitialized(): void {
    this.initialized = true;
  }

  get isReady(): boolean {
    return this.initialized;
  }
}
