import { makeAutoObservable } from 'mobx';
import { Character } from '../entities/Character';
import {
  defaultPersonality,
  defaultCapacities,
  defaultResources,
} from '../entities/types';
import { type RootStore } from './RootStore';

export class CharacterStore {
  character: Character | null = null;

  // Store root reference for cross-store communication (used in future plans)
  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  // Creates a new character with default values
  createCharacter(name: string): Character {
    this.character = new Character({
      id: crypto.randomUUID(),
      name,
      personality: defaultPersonality(),
      capacities: defaultCapacities(),
      resources: defaultResources(),
    });
    // Set root store reference for talent modifier access
    this.character.setRootStore(this.root);
    return this.character;
  }

  // Clears the current character
  clearCharacter(): void {
    this.character = null;
  }

  get hasCharacter(): boolean {
    return this.character !== null;
  }

  // Expose root store for cross-store access (will be used in future plans)
  get rootStore(): RootStore {
    return this.root;
  }
}
