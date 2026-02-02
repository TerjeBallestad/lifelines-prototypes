# Post-Mortem Analysis

Run a structured post-mortem analysis of a prototype project to evaluate which features should be included in the final product.

## Process

### Phase 1: Discovery
1. Explore the codebase thoroughly to identify ALL features that were prototyped
2. Look at project structure, planning docs, source code, and configuration files
3. Also identify features that were designed/planned but NOT implemented

### Phase 2: Report Creation
Create a `POST_MORTEM.md` file with the following structure:

```markdown
# [Project Name] Prototype Post-Mortem

## Overview
- Project type and description
- Tech stack
- Scope (LOC, files)
- Versions/milestones shipped

## Feature Evaluation

### [N]. [Feature Name]
**Description:** Brief description of what the feature does

**What Worked:**
- Bullet points of successes

**What Didn't Work:** (if applicable)
- Bullet points of issues

**Evaluation:** `[ PENDING ]`

---
(Repeat for each feature)

## Features NOT Implemented (But Designed)

### [Letter]. [Feature Name]
**Description:** What this feature would do

**Status:** Not implemented

**Evaluation:** `[ PENDING ]`

---

## Summary Table
| # | Feature | Implemented | Evaluation |
|---|---------|-------------|------------|
(All features listed)

## Key Decisions Needed
(List major decisions that affect multiple features)

## Summary Counts
(Tally of each evaluation type)
```

### Phase 3: Interactive Evaluation
Go through EACH feature one by one with the user:
1. Present a brief summary of the feature
2. Highlight key considerations
3. Ask for their evaluation
4. Capture their reasoning and update the report

### Phase 4: Summary
After all features are evaluated:
1. Update the summary table with all evaluations
2. Identify key decisions that still need to be made
3. Calculate summary counts

## Evaluation Options

Use these evaluation tags:

- `✅ INCLUDE` - Include in final game as-is or with refinement
- `⚠️ SIMPLIFY` - Include but reduce complexity
- `🔄 REDESIGN` - Core concept good but needs rework
- `❌ CUT` - Do not include in final game
- `📋 DEFER` - Consider for future expansion/DLC

## Tips for Good Post-Mortems

1. **Be thorough in discovery** - Find ALL features, even small ones
2. **Present neutrally** - Let the user form their own opinion
3. **Capture reasoning** - The "why" is as valuable as the decision
4. **Note dependencies** - Some features affect others
5. **Identify pivots** - Major direction changes that affect multiple features
6. **Keep it conversational** - One feature at a time, don't rush

## Arguments

- `$ARGUMENTS` - Optional: specific focus area or features to prioritize

## Invocation

```
/post-mortem
/post-mortem gameplay-systems
/post-mortem ui-features
```
