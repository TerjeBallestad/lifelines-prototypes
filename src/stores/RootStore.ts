import { CharacterStore } from './CharacterStore';

export class RootStore {
  characterStore: CharacterStore;
  // Future: skillStore, activityStore, talentStore, resourceStore

  constructor() {
    this.characterStore = new CharacterStore(this);
  }
}
