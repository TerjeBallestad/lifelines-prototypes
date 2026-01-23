---
created: 2026-01-23T17:15
title: Standardize DaisyUI form control structure
area: ui
files: []
---

## Problem

Form controls in the codebase may not follow the standard DaisyUI structure. The correct pattern requires:
- `<label>` element wrapping `<input>` element
- `"input"` class on the `<label>` element
- `"label"` class on `<span>` inside label for the label text

This ensures consistent styling and proper accessibility across all form controls.

## Solution

Audit all form controls (`<input>`, `<select>`, `<textarea>`) and refactor to follow DaisyUI's recommended structure:

```jsx
<label className="input">
  <span className="label">Label Text</span>
  <input type="text" ... />
</label>
```
