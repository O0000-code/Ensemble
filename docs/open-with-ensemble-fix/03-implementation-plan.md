# Implementation Plan: Fix "Open with Ensemble" Window Visibility

## Summary

This is a minimal, surgical fix that requires modifying only ONE function in ONE file.

## The Change

**File**: `src/components/layout/MainLayout.tsx`
**Function**: `focusWindow()` (approximately lines 161-170)

### Current Code
```typescript
const focusWindow = async () => {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.setFocus();
  } catch (e) {
    console.error('Failed to focus window:', e);
  }
};
```

### Fixed Code
```typescript
const focusWindow = async () => {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.show();     // Make window visible first (required on macOS)
    await win.setFocus(); // Then bring to front
  } catch (e) {
    console.error('Failed to focus window:', e);
  }
};
```

## Implementation Steps

1. **Create Git Worktree**
   ```bash
   git worktree add ../Ensemble2-fix-open-with fix/open-with-ensemble-window
   ```

2. **Make the Code Change**
   - Edit `src/components/layout/MainLayout.tsx`
   - Add `await win.show();` before `await win.setFocus();`

3. **Test the Fix**
   - Run `npm run tauri dev`
   - Test all 6 scenarios from the findings document

4. **Verification Checklist**
   - [ ] Scenario 1: App closed + folder no scene → window visible, modal shows
   - [ ] Scenario 2: App closed + folder has scene → terminal launches silently
   - [ ] Scenario 3: App running (foreground) + no scene → modal shows
   - [ ] Scenario 4: App running (foreground) + has scene → terminal launches
   - [ ] Scenario 5: App running (background) + no scene → **window comes to front, modal shows**
   - [ ] Scenario 6: App running (background) + has scene → terminal launches, app stays hidden
   - [ ] No visual/style regressions
   - [ ] No console errors

5. **Merge to Main**
   - Once verified, merge the fix branch to main
   - Remove the worktree

## Risk Assessment

**Risk Level**: Very Low

- Single line addition
- No architectural changes
- No new dependencies
- The `show()` method is a standard Tauri window API
- Worst case: window shows briefly before hiding (acceptable trade-off)

## Rollback Plan

If issues arise, revert the single line addition and re-evaluate approach.
