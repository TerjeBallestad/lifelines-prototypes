import { makeAutoObservable } from 'mobx';
import { Character } from '../entities/Character';
import {
  defaultPersonality,
  defaultCapacities,
  defaultResources,
  type CharacterData,
} from '../entities/types';
import { type RootStore } from './RootStore';

export class CharacterStore {
  // Multi-character support with map-based storage
  characters = new Map<string, Character>();
  activeCharacterId: string | null = null;

  // Store root reference for cross-store communication (used in future plans)
  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  // Creates a new character with default values
  createCharacter(name: string): Character {
    const char = new Character({
      id: crypto.randomUUID(),
      name,
      personality: defaultPersonality(),
      capacities: defaultCapacities(),
      resources: defaultResources(),
    });
    // Set root store reference for talent modifier access
    char.setRootStore(this.root);
    this.characters.set(char.id, char);
    if (!this.activeCharacterId) {
      this.activeCharacterId = char.id;
    }
    return char;
  }

  // Creates a new character from provided CharacterData
  // When replaceActive is true (default), clears all existing characters and sets new one as active
  createFromData(data: CharacterData, replaceActive = true): Character {
    const char = new Character(data);
    char.setRootStore(this.root);

    if (replaceActive) {
      // Clear all existing characters and set new one as active
      this.characters.clear();
      this.characters.set(char.id, char);
      this.activeCharacterId = char.id;
    } else {
      // Just add to map (for comparison mode)
      this.characters.set(char.id, char);
      if (!this.activeCharacterId) {
        this.activeCharacterId = char.id;
      }
    }
    return char;
  }

  // Gets a character by ID
  getCharacter(id: string): Character | undefined {
    return this.characters.get(id);
  }

  // Removes a character from the map
  removeCharacter(id: string): void {
    this.characters.delete(id);
    if (this.activeCharacterId === id) {
      this.activeCharacterId = null;
    }
  }

  // Clears the active character (for backward compatibility)
  clearCharacter(): void {
    if (this.activeCharacterId) {
      this.removeCharacter(this.activeCharacterId);
    }
  }

  // Sets the active character
  setActiveCharacter(id: string): void {
    if (this.characters.has(id)) {
      this.activeCharacterId = id;
    }
  }

  // Returns the currently active character
  get character(): Character | null {
    if (!this.activeCharacterId) return null;
    return this.characters.get(this.activeCharacterId) ?? null;
  }

  get hasCharacter(): boolean {
    return this.characters.size > 0;
  }

  // Returns all characters as an array
  get allCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  // Expose root store for cross-store access (will be used in future plans)
  get rootStore(): RootStore {
    return this.root;
  }
}
