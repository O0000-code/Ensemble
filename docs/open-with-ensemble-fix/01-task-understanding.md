# Open with Ensemble Logic Fix - Task Understanding Document

## Problem Statement

The "Open with Ensemble" macOS contextual menu feature has inconsistent behavior based on two scenarios that need to be handled differently.

## Two Distinct Scenarios

### Scenario 1: Folder WITHOUT Scene Association
**Condition**: User right-clicks a folder → "Open with Ensemble" → Folder has NO Scene selected in Ensemble

**Expected Behavior**:
1. App should become visible (main window shown)
2. Launch Claude Code modal should appear
3. User selects a Scene in the modal
4. After selection, proceed with terminal launch

**Current Problem**:
- App hides itself unconditionally
- Main window is not shown
- User cannot select a Scene because no UI is visible

### Scenario 2: Folder WITH Scene Association
**Condition**: User right-clicks a folder → "Open with Ensemble" → Folder HAS a Scene already selected

**Expected Behavior**:
1. App should remain silent (no main window)
2. Directly open terminal with proper configuration
3. Launch Claude Code modal can appear (for confirmation/progress)
4. No need to show main app window since there's nothing to configure

**Current Behavior**: This scenario appears to work correctly

## Symptom Details

1. **When app is CLOSED**: Using "Open with Ensemble" wakes up the app and shows it on top (main window appears) - but then the logic seems to hide it unconditionally

2. **When app is ALREADY OPEN**: Using "Open with Ensemble" causes a flash in Dock (right side) - something trying to appear then quickly disappearing

## Root Cause Hypothesis

The window visibility logic appears to be:
- Unconditionally hiding the main window after processing the "open with" request
- Missing the conditional check: "Does this folder have a Scene?"
- The logic should be: IF no scene → show main window; IF has scene → stay silent

## Historical Note

User mentions this functionality worked correctly at some point, then broke after subsequent changes. This suggests a regression was introduced.

## Success Criteria

1. **Scenario 1** (no scene): App main window MUST be shown, user can interact with Launch modal to select scene
2. **Scenario 2** (has scene): App stays silent, terminal launches directly
3. No regressions to existing functionality
4. No visual/style changes to existing UI

## Technical Context

This is a Tauri 2.0 application with:
- Rust backend for system operations
- React + TypeScript frontend
- The "Open with Ensemble" likely involves:
  - macOS URL scheme or file association handling
  - Tauri's deep link or file open handlers
  - Window visibility management via Tauri APIs
  - Project/Scene lookup logic

## Files to Investigate

The investigation should cover:
1. Rust backend: `src-tauri/src/` - especially main.rs, lib.rs, any commands related to opening/launching
2. Frontend: `src/` - components and hooks related to window management, launch modal
3. Tauri config: `src-tauri/tauri.conf.json` - deep link configuration
4. Any event listeners for file/folder opening
