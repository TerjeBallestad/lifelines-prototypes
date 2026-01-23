# Phase 10: Activity-Need Integration - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Activities restore specific needs, consume resources scaled by difficulty, and integrate personality alignment. This creates the core gameplay loop where patients perform activities that affect their needs and resources. Autonomous AI decision-making is Phase 11.

</domain>

<decisions>
## Implementation Decisions

### Need Restoration
- Restoration happens **gradually during activity**, not immediately on completion
- If activity is interrupted/cancelled, patient **keeps partial restoration** (no lost progress)
- **No diminishing returns** — repeating same activity restores same amount each time
- Activities can **restore multiple needs** at once (e.g., eating with friends restores Hunger and Social)

### Resource Cost Scaling
- Difficulty maps to costs **linearly (1:1)** — difficulty 4 costs 4x difficulty 1
- **No minimum cost floor** — mastered activities can become nearly free
- **No mercy mechanics needed** — basic need activities (toilet, sleep, eat) are free anyway
- **Resource consumption model:**
  - **Overskudd**: Visible to player, required to start, consumed during activity
  - **Willpower**: Hidden, consumed at activity start
  - **Focus**: Hidden, consumed during concentration activities
  - **socialBattery**: Hidden, consumed during social activities
  - All resources visible in prototype for debugging

### Personality Alignment
- Personality affects **both costs and gains** (not difficulty rating)
- Aligned activities: lower costs AND higher need restoration
- Misaligned activities: higher costs AND lower need restoration
- **All Big Five traits** affect relevant activities:
  - Extraversion: social vs solo activities
  - Openness: creative/novel activities
  - Conscientiousness: routine/structured activities
  - Agreeableness: cooperative activities
  - Neuroticism: stress-related activities
- Wellbeing resources also factor into alignment effects
- **Modifier strength: 25-40%** (moderate — clear advantage without dominating choices)

### Activity Feedback
- **Floating numbers** during activity showing restoration in progress (+5 Hunger)
- **Completion summary** after activity finishes (toast/popup with all changes)
- **Personality alignment in tooltip only** — cards stay clean, details on hover

### Claude's Discretion
- Tooltip cost display format (numeric, relative, or visual)
- Exact floating number animation style
- Completion summary presentation (toast duration, styling)
- Specific trait-to-activity mappings within Big Five framework

</decisions>

<specifics>
## Specific Ideas

- Basic need restoration activities (toilet, sleep, eat) should be free — this is the death spiral prevention
- Resource visibility in prototype helps debugging, but final game shows only Overskudd as "cost"
- Abstract resource system will be added later and will also be affected by personality alignment

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-activity-need-integration*
*Context gathered: 2026-01-23*
