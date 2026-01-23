import { makeAutoObservable } from 'mobx';
import { CharacterStore } from './CharacterStore';
import { SimulationStore } from './SimulationStore';
import { createContext, useContext } from 'react';
import { SkillStore } from './SkillStore';
import { ActivityStore } from './ActivityStore';
import { TalentStore } from './TalentStore';
import { BalanceConfigStore } from '../config/balance';

export class RootStore {
  characterStore: CharacterStore;
  simulationStore: SimulationStore;
  skillStore: SkillStore;
  activityStore: ActivityStore;
  talentStore: TalentStore;
  balanceConfig: BalanceConfigStore;

  // v1.1 Primary Needs System toggle
  needsSystemEnabled = false;

  constructor() {
    this.characterStore = new CharacterStore(this);
    this.simulationStore = new SimulationStore(this);
    this.skillStore = new SkillStore(this);
    this.activityStore = new ActivityStore(this);
    this.talentStore = new TalentStore(this);
    this.balanceConfig = new BalanceConfigStore();

    // Make RootStore observable for needsSystemEnabled toggle
    makeAutoObservable(this, {
      characterStore: false,
      simulationStore: false,
      skillStore: false,
      activityStore: false,
      talentStore: false,
      balanceConfig: false,
    });
  }

  /**
   * Action: Toggle between v1.0 resource system and v1.1 needs system.
   * When enabling v1.1, initializes needs on all existing characters.
   */
  toggleNeedsSystem(): void {
    this.needsSystemEnabled = !this.needsSystemEnabled;

    // When enabling, initialize needs on all characters
    if (this.needsSystemEnabled) {
      for (const char of this.characterStore.allCharacters) {
        char.initializeNeeds();
      }
    }
  }
}
export const StoreContext = createContext<RootStore | null>(null);

export function useRootStore(): RootStore {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRootStore must be used within StoreProvider');
  }
  return context;
}

// Convenience hooks for individual stores
export function useCharacterStore() {
  return useRootStore().characterStore;
}

export function useSimulationStore() {
  return useRootStore().simulationStore;
}

// Convenience hook for skill store access
export function useSkillStore() {
  return useRootStore().skillStore;
}

// Convenience hook for activity store access
export function useActivityStore() {
  return useRootStore().activityStore;
}

// Convenience hook for talent store access
export function useTalentStore() {
  return useRootStore().talentStore;
}

// Convenience hook for balance config access
export function useBalanceConfig() {
  return useRootStore().balanceConfig;
}
