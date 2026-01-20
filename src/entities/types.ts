// Big Five personality dimensions
export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Mental capacities that affect activity success
export interface Capacities {
  divergentThinking: number;
  convergentThinking: number;
  workingMemory: number;
  attentionSpan: number;
  processingSpeed: number;
  emotionalRegulation: number;
}

// Resources that drain and recover
export interface Resources {
  energy: number;
  socialBattery: number;
  stressLevel: number;
}

// Data required to construct a Character
export interface CharacterData {
  id: string;
  name: string;
  personality: Personality;
  capacities: Capacities;
  resources: Resources;
}

// Factory functions - always return valid defaults (0-100 scale, 50 = average)
export function defaultPersonality(): Personality {
  return {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };
}

export function defaultCapacities(): Capacities {
  return {
    divergentThinking: 50,
    convergentThinking: 50,
    workingMemory: 50,
    attentionSpan: 50,
    processingSpeed: 50,
    emotionalRegulation: 50,
  };
}

export function defaultResources(): Resources {
  return {
    energy: 100,
    socialBattery: 100,
    stressLevel: 0,
  };
}
