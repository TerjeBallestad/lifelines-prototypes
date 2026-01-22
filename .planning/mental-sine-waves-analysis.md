# Mental-Sine-Waves Codebase Analysis

**Analyzed:** 2026-01-22
**Purpose:** Compare with lifelines-prototypes, identify good ideas and patterns

## Overview

Mental-sine-waves is a sophisticated character simulation prototype exploring psychological modeling through sine wave harmonics. It shares the same tech stack (React + TypeScript + MobX + Tailwind/DaisyUI) and similar domain concepts but takes a more mathematically ambitious approach.

---

## Shared Concepts

| Concept | mental-sine-waves | lifelines-prototypes |
|---------|-------------------|---------------------|
| Personality | 12 traits (Big 5 + cognitive) | Big 5 + 6 capacities |
| Resources | 12 character state + 45 global | 9 resources (energy, mood, etc.) |
| Skills | 45+ with prerequisites (DAG) | 8+ with prerequisites (DAG) |
| Activities | 5 activities with difficulty | 8 activities with capacity profiles |
| State management | MobX class-based stores | MobX class-based stores |
| Talents/perks | 13 talents (partial impl) | 10 talents (Phase 5) |

---

## Good Ideas Worth Keeping

### 1. Sine Wave Mental Rhythms (Novel)

The most interesting concept: character traits generate composite sine waves representing "mental rhythms."

```typescript
// Traits combine into oscillating waves
convergentWave = sin(focus * t + conscientiousness_phase) * fortitude
divergentWave = sin(creativity * t + extraversion_phase) * fortitude
attentionWave = sign(sin(processingSpeed * t)) * attentionSpan
```

**Why it's interesting:**
- Same character performs differently at different times
- Creates emergent variation without RNG
- Visual representation of personality (waves on screen)
- "Resonance" between character and activity feels intuitive

**Consideration for lifelines:** Could add visual flair to show WHY a character succeeds/fails at activities beyond just capacity matching. The wave visualization is compelling.

### 2. Resonance Matching

Activities have "mental signatures" (ideal trait profiles). Success depends on how well character's current wave aligns with activity's wave.

```typescript
resonance = 1 - |characterWave(t) - activityWave(t)|
```

**Why it's interesting:**
- More nuanced than simple stat comparison
- Creates natural difficulty variation over time
- Working memory affects how many samples to check (elegant integration)

**Consideration for lifelines:** Our capacity-to-success calculation is simpler. Could enhance with time-varying components if we want more dynamic feel.

### 3. Piaget-Based Skill Tiers

Skills organized by cognitive development stages:

| Tier | Stage | Example Skills |
|------|-------|---------------|
| 1 | Sensorimotor | Observation, Imitation |
| 2 | Preoperational | Communication, Categorization |
| 3 | Concrete Operational | Logic, Planning |
| 4 | Formal Operational | Critical Thinking, Synthesis |
| 5 | Post-Formal | Domain Expertise |

**Why it's interesting:**
- Grounded in real developmental psychology
- Creates natural progression (can't learn abstract reasoning without concrete first)
- Gives semantic meaning to skill prerequisites

**Consideration for lifelines:** Our skills are domain-based (social, physical, etc.) but lack this developmental framing. Could be valuable for future "patient progression" narratives.

### 4. Hidden Stats with Discovery

OverskuddSystemet prototype shows only "Overskudd" (mental surplus) while hiding underlying factors (nutrition, security, purpose, etc.). Player discovers hidden stats through activities.

**Why it's interesting:**
- Mirrors real mental health (you don't see "serotonin level")
- Creates incentive for exploration
- Diagnosis/discovery as gameplay mechanic

**Consideration for lifelines:** Currently we show everything. Could explore hiding some factors for more emergent observation gameplay.

### 5. Interest-Based Bonuses

Characters have interest keywords. Activities matching interests get +20% performance bonus.

```typescript
interestBonus = character.interests.includes(activity.interest) ? 0.2 : 0
```

**Why it's interesting:**
- Encourages learning character backgrounds
- Not just stats - personality flavor matters
- Simple to implement, high narrative value

**Consideration for lifelines:** We don't have interests yet. Could add to make characters feel more individual beyond just numbers.

### 6. Rich Resource Taxonomy (45 types)

Resources organized semantically:
- **Cognitive:** Insight, Knowledge, Research, Truth, Wisdom, Ideas
- **Social:** Connection, Influence, Reputation, Trust
- **Physical:** Materials, Infrastructure, Momentum
- **Spiritual:** Purpose, Vision, Beauty, Wonder

**Why it's interesting:**
- Different activities yield different resource types
- Creates meaningful choice about what to pursue
- Resources feel like real outcomes, not just XP

**Consideration for lifelines:** We have simpler resources (energy, mood, stress). Could expand for richer feedback.

### 7. Time-of-Day Modifiers

Recovery rates vary by time:
- Morning: +20% regen
- Evening: -20% regen
- Night: +50% regen (if resting)

**Why it's interesting:**
- Encourages strategic timing
- Feels realistic (morning person vs night owl)
- Simple formula, high impact

**Consideration for lifelines:** We have time simulation but no day/night modifiers yet.

---

## Coding Patterns to Consider

### Pattern 1: Satisfies for Exhaustive Records

```typescript
export const AllSkills = {
  observation: new ASkill(...),
  imitation: new ASkill(...),
  // ...
} satisfies Record<SkillID, ASkill>
```

Ensures all enum values are covered at compile time.

### Pattern 2: Trait Manipulation Utilities

```typescript
sumTraits(a: CharacterTraits, b: CharacterTraits): CharacterTraits
subtractTraits(a, b): CharacterTraits
compareTraits(a, b): boolean
```

Clean helpers for trait math. We have similar with `combineModifiers`.

### Pattern 3: Norwegian Labels

Several components use Norwegian:
- "Overskudd" = Mental surplus
- "Trygghet" = Security
- "Ferdigheter" = Skills

**Note:** If targeting Norwegian users, consider i18n from the start.

### Pattern 4: Math Breakdown Display

OverskuddSystemet shows live calculation breakdown:

```
regenRate = 1.2 (base)
  × 1.1 (nutrition: 55/50 → +10%)
  × 0.9 (energy: 40/50 → -10%)
  × 1.2 (morning bonus)
  = 1.19/hour
```

Valuable for debugging and player understanding.

---

## Key Differences

| Aspect | mental-sine-waves | lifelines-prototypes |
|--------|-------------------|---------------------|
| **Core mechanic** | Wave resonance matching | Capacity profile matching |
| **Randomness** | Deterministic (waves) + probabilistic rewards | Deterministic success calc |
| **Visualization** | SVG wave graphs | Radar charts, gauges |
| **Complexity** | Higher (sine math, samples) | Simpler (linear ratios) |
| **Prototypes** | 5 different game systems | 1 unified progression |
| **Polish** | Exploratory/rough | More structured (GSD workflow) |
| **Talents** | Partial implementation | Full implementation (Phase 5) |

---

## Recommendations

### Worth Adapting

1. **Interest system** - Easy win, adds character flavor
2. **Time-of-day modifiers** - Realistic, strategic depth
3. **Math breakdown display** - Great for debugging, optional for players
4. **Hidden stat discovery** - For future "diagnosis" gameplay

### Worth Observing

1. **Wave visualization** - Compelling but complex; consider for v2
2. **Rich resource taxonomy** - May overcomplicate current scope
3. **Resonance matching** - Interesting alternative to capacity profiles

### Skip for Now

1. **Sine wave math** - Significant complexity, unclear player benefit
2. **Piaget tiers** - Our domain-based categories work fine
3. **45 resource types** - Too granular for current prototype

---

## Interesting Code Snippets

### Wave Generation

```typescript
function makeConvergentThinkingWave(t: number, traits: CharacterTraits): number {
  const amplitude = traits.fortitude / 100
  const frequency = traits.focus * 0.3
  const phase = traits.conscientiousness * 0.3
  const verticalShift = traits.neuroticism / 100

  return Math.sin(frequency * t + phase) * amplitude + verticalShift
}
```

### Resonance Calculation

```typescript
function calculateResonance(t: number, char: CharacterTraits, activity: CharacterTraits): number {
  const samples = Math.round(((char.workingMemory - 1) * (5 - 1)) / 99 + 1)
  let highest = 0

  for (let i = 0; i < samples; i++) {
    const sampleTime = t - i * 0.15
    const charWave = traitsToWave(t, char)
    const actWave = traitsToWave(sampleTime, activity)
    const alignment = 1 - Math.abs(charWave - actWave)
    highest = Math.max(highest, alignment)
  }

  return Math.max(0, Math.min(1, highest))
}
```

### Time-of-Day Modifier

```typescript
function getTimeOfDayModifier(hour: number): number {
  if (hour >= 6 && hour < 12) return 1.2   // Morning boost
  if (hour >= 18 && hour < 22) return 0.8  // Evening dip
  if (hour >= 22 || hour < 6) return 1.5   // Night recovery
  return 1.0 // Afternoon
}
```

---

## Conclusion

Mental-sine-waves explores character psychology through mathematical elegance. The sine wave resonance system is novel but adds complexity. For lifelines-prototypes, the most valuable takeaways are:

1. **Interest system** for character individuality
2. **Time-of-day modifiers** for strategic depth
3. **Hidden stats with discovery** for future diagnosis mechanics
4. **Math breakdown display** for debugging/transparency

The wave mechanics are fascinating but may be overkill for a prototype focused on validating emergent behavior from simpler systems. Our capacity-profile approach achieves similar goals with less cognitive overhead.

---

*Analysis by Claude for lifelines-prototypes project*