import { CharacterStore } from './CharacterStore';
import { SimulationStore } from './SimulationStore';
import { SkillStore } from './SkillStore';
import { createContext, useContext } from 'react';

export class RootStore {
  characterStore: CharacterStore;
  simulationStore: SimulationStore;
  skillStore: SkillStore;

  constructor() {
    this.characterStore = new CharacterStore(this);
    this.simulationStore = new SimulationStore(this);
    this.skillStore = new SkillStore(this);
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
