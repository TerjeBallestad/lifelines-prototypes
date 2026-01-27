---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/PROJECT.md
  - .planning/GDD-SUMMARY.md
autonomous: true

must_haves:
  truths:
    - "PROJECT.md reflects GDD vision (design pillars, core fantasy, Norwegian storytelling)"
    - "GDD-SUMMARY.md provides quick reference for development decisions"
  artifacts:
    - path: ".planning/PROJECT.md"
      provides: "Project documentation with GDD vision integrated"
      contains: "Design Pillars"
    - path: ".planning/GDD-SUMMARY.md"
      provides: "Condensed GDD reference for development"
      contains: "Patient Archetypes"
---

<objective>
Update project documentation with Game Design Document vision and create condensed GDD summary.

Purpose: Ensure development decisions align with GDD vision by making key concepts accessible.
Output: Updated PROJECT.md with vision sections, new GDD-SUMMARY.md for quick reference.
</objective>

<execution_context>
@/Users/godstemning/.claude/get-shit-done/workflows/execute-plan.md
@/Users/godstemning/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/Game Design Document 2f3a7d4d678e812b9e10f1902563a625.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update PROJECT.md with GDD Vision</name>
  <files>.planning/PROJECT.md</files>
  <action>
Add new sections to PROJECT.md after "Core Value" section:

1. **Design Pillars** section with three pillars from GDD:
   - Empathetic Curiosity (Empatisk nysgjerrighet) - personality emerges from simple systems
   - Satisfying Growth (Tilfredsstillende vekst) - cozy, satisfying visual feedback
   - Humorous Contrast (Humoristisk kontrast) - lightness between emotional moments

2. **Norwegian Storytelling** section explaining:
   - Focus on identity (Lost -> Found, not Weak -> Strong)
   - "Klokskap over kraft" (wisdom over strength)
   - Victory is realistic competence, not heroic power
   - Core fantasy quote: "The victory isn't heroic, it's watching someone finally answer the phone"

3. Update "Core Value" to align with GDD phrasing (already close, verify match)

Keep existing sections (Requirements, Context, Constraints, Key Decisions) intact.
  </action>
  <verify>Read PROJECT.md, confirm Design Pillars and Norwegian Storytelling sections present</verify>
  <done>PROJECT.md contains GDD vision sections while preserving existing technical content</done>
</task>

<task type="auto">
  <name>Task 2: Create GDD-SUMMARY.md</name>
  <files>.planning/GDD-SUMMARY.md</files>
  <action>
Create condensed GDD reference document (~150-200 lines) containing:

1. **Core Concept** - One paragraph on cozy roguelike life-sim, Norwegian storytelling
2. **Genre Fusion** - Stardew + Hades + Sims table
3. **Design Pillars** - Three pillars with one-line descriptions
4. **Design Principles** - Table from GDD (Simple input/complex sim, Show don't tell, etc.)
5. **Overskudd System** - Central visible resource, core formula, hidden stats
6. **Big Five Personality** - List with brief descriptions
7. **Skill System Overview** - Piaget-inspired tiers (0-4), key mechanics (Foundation Bonus, Decay, Crystallization)
8. **Patient Archetypes** - Table of 8 archetypes with profiles and challenges
9. **Run Structure** - 12-week cohort phases (Intake, Discovery, Stabilization, Graduation)
10. **Meta-Progression** - Diagnostic tools, Intervention skills, Facility upgrades

Format as quick-reference with tables where appropriate. Include "See full GDD for details" note at top.
  </action>
  <verify>Read GDD-SUMMARY.md, confirm all 10 sections present and under 200 lines</verify>
  <done>GDD-SUMMARY.md exists with condensed reference for all key GDD concepts</done>
</task>

</tasks>

<verification>
- [ ] PROJECT.md has Design Pillars section
- [ ] PROJECT.md has Norwegian Storytelling section
- [ ] GDD-SUMMARY.md exists with all key sections
- [ ] Both files are readable quick references (not verbose)
</verification>

<success_criteria>
- PROJECT.md reflects GDD creative vision alongside technical content
- GDD-SUMMARY.md provides actionable reference for development decisions
- Key concepts (Overskudd, archetypes, pillars) easily findable
</success_criteria>

<output>
After completion, create `.planning/quick/001-update-docs-with-gdd/001-SUMMARY.md`
</output>
