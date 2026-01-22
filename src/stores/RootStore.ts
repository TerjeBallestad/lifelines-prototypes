import { CharacterStore } from './CharacterStore';
import { SimulationStore } from './SimulationStore';
import { createContext, useContext } from 'react';
import { SkillStore } from './SkillStore';
import { ActivityStore } from './ActivityStore';
import { TalentStore } from './TalentStore';

export class RootStore {
  characterStore: CharacterStore;
  simulationStore: SimulationStore;
  skillStore: SkillStore;
  activityStore: ActivityStore;
  talentStore: TalentStore;

  constructor() {
    this.characterStore = new CharacterStore(this);
    this.simulationStore = new SimulationStore(this);
    this.skillStore = new SkillStore(this);
    this.activityStore = new ActivityStore(this);
    this.talentStore = new TalentStore(this);
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
