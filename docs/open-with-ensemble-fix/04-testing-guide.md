# Testing Guide: "Open with Ensemble" Fix

The app is now running from the fix worktree. Please verify the following scenarios.

## Prerequisites

1. The Ensemble app should be running (started from `npm run tauri dev`)
2. You need at least one folder WITHOUT a Scene associated
3. You need at least one folder WITH a Scene associated

## Test Scenarios

### Scenario 1: App Closed + Folder WITHOUT Scene
1. Quit the Ensemble app completely
2. In Finder, right-click on a folder that has NO Scene assigned
3. Select "Open with Ensemble"

**Expected**:
- App opens
- Main window becomes visible
- Launch Claude Code modal appears
- User can select a Scene

### Scenario 2: App Closed + Folder WITH Scene
1. Quit the Ensemble app completely
2. In Finder, right-click on a folder that HAS a Scene assigned (via Projects)
3. Select "Open with Ensemble"

**Expected**:
- App may open briefly or stay in background
- Terminal launches directly with Claude Code
- No need for user interaction

### Scenario 3: App Running (Foreground) + Folder WITHOUT Scene
1. Keep the Ensemble app open in the foreground
2. In Finder, right-click on a folder that has NO Scene
3. Select "Open with Ensemble"

**Expected**:
- Launch Claude Code modal appears
- App stays in foreground

### Scenario 4: App Running (Foreground) + Folder WITH Scene
1. Keep the Ensemble app open in the foreground
2. In Finder, right-click on a folder that HAS a Scene
3. Select "Open with Ensemble"

**Expected**:
- Terminal launches directly
- App behavior unchanged

### Scenario 5: App Running (Background/Minimized) + Folder WITHOUT Scene ⭐ KEY TEST
1. Open the Ensemble app
2. **Minimize it or switch to another app** (so Ensemble is in background)
3. In Finder, right-click on a folder that has NO Scene
4. Select "Open with Ensemble"

**Expected** (THIS WAS THE BROKEN CASE):
- **App comes to foreground**
- **Main window becomes visible**
- Launch Claude Code modal appears
- User can select a Scene

### Scenario 6: App Running (Background) + Folder WITH Scene
1. Open the Ensemble app
2. Minimize it or switch to another app
3. In Finder, right-click on a folder that HAS a Scene
4. Select "Open with Ensemble"

**Expected**:
- Terminal launches directly
- App stays in background (doesn't flash or come to front)

## Verification Checklist

| # | Scenario | Expected Behavior | Pass/Fail |
|---|----------|-------------------|-----------|
| 1 | App closed + no scene | Window visible, modal shown | [ ] |
| 2 | App closed + has scene | Terminal launches silently | [ ] |
| 3 | App foreground + no scene | Modal shown | [ ] |
| 4 | App foreground + has scene | Terminal launches | [ ] |
| 5 | **App background + no scene** | **Window comes to front, modal shown** | [ ] |
| 6 | App background + has scene | Terminal launches, app stays hidden | [ ] |

## Additional Checks

- [ ] No visual/style regressions in the app
- [ ] No console errors (check DevTools with Cmd+Option+I)
- [ ] No Dock flashing issues
- [ ] LauncherModal displays correctly
- [ ] Scene selection works correctly

## After Testing

Once all scenarios pass:
1. Let me know the results
2. I will merge the fix to main and clean up the worktree
