import { CharacterStore } from './CharacterStore';
import { SimulationStore } from './SimulationStore';

export class RootStore {
  characterStore: CharacterStore;
  simulationStore: SimulationStore;
  // Future: skillStore, activityStore, talentStore

  constructor() {
    this.characterStore = new CharacterStore(this);
    this.simulationStore = new SimulationStore(this);
  }
}
