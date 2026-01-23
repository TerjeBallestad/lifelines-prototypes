---
created: 2026-01-23T14:45
title: Move character selection from dev tools to top
area: ui
files:
  - src/components/SimulationControls.tsx
  - src/components/CharacterPanel.tsx
---

## Problem

Character selection is currently buried in dev tools, making it inconvenient to switch between characters during normal gameplay observation. Should be more prominent and accessible next to simulation controls for easier testing and observation of different patient behaviors.

## Solution

Move character selection dropdown/list from dev tools panel to the top bar area near SimulationControls. This gives quick access to switch patients while observing needs decay and activity behavior.
