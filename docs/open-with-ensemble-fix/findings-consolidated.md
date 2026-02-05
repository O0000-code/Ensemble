# Consolidated Investigation Findings: "Open with Ensemble" Bug

## Root Cause Identified

**Commit**: `8a3ec75` - "feat: Add Warp open mode setting and fix window focus behavior"

This commit deliberately removed `set_focus()` from the Rust single-instance handler, delegating window visibility to the frontend. However, the frontend's `focusWindow()` function is insufficient on macOS.

## The Problem Chain

```
1. Rust backend (lib.rs:31-46)
   - Receives --launch argument via single-instance plugin
   - Emits "second-instance-launch" event to frontend
   - Does NOT call set_focus() (intentionally removed in 8a3ec75)

2. Frontend (MainLayout.tsx:98-158)
   - Receives the event, calls handleLaunchPath()
   - Checks hasScene: project exists AND has non-empty sceneId
   - If hasScene: launches terminal silently (CORRECT)
   - If no scene: calls focusWindow() then openLauncher() (BUG HERE)

3. focusWindow() (MainLayout.tsx:161-170)
   - Only calls win.setFocus()
   - Does NOT call win.show() first
   - On macOS, setFocus() alone doesn't make hidden window visible
```

## Before vs After the Regression

### Original Working Code (commit 9ef362c)
```rust
// lib.rs - single instance handler
if let Some(window) = app.get_webview_window("main") {
    let _ = window.emit("second-instance-launch", path.clone());
    let _ = window.set_focus();  // <-- WINDOW FOCUSED IN RUST
}
```

### Current Broken Code (commit 8a3ec75+)
```rust
// lib.rs - single instance handler
if let Some(window) = app.get_webview_window("main") {
    let _ = window.emit("second-instance-launch", path.clone());
    // set_focus() REMOVED - frontend should decide
}
```

```typescript
// MainLayout.tsx - focusWindow helper
const focusWindow = async () => {
  const win = getCurrentWindow();
  await win.setFocus();  // <-- ONLY setFocus, no show()
};
```

## The Fix

The frontend's `focusWindow()` function needs to call `show()` before `setFocus()`:

```typescript
const focusWindow = async () => {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.show();     // <-- ADD THIS LINE
    await win.setFocus();
  } catch (e) {
    console.error('Failed to focus window:', e);
  }
};
```

## Why This Fix is Correct

1. **macOS Behavior**: On macOS, a window that is hidden or minimized will not become visible by just calling `setFocus()`. The `show()` method must be called first to make it visible.

2. **Preserves Original Intent**: The fix still honors the original intent from commit 8a3ec75:
   - Projects WITH scene: still launch silently (focusWindow not called)
   - Projects WITHOUT scene: window becomes visible for user to select scene

3. **Minimal Change**: Single line addition, no architectural changes needed

## Files to Modify

Only ONE file needs modification:
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`
- Line 167: Add `await win.show();` before `await win.setFocus();`

## Testing Scenarios

After the fix, verify:

| Scenario | App State | Folder | Expected Behavior |
|----------|-----------|--------|-------------------|
| 1 | Closed | No Scene | App opens, main window visible, Launch modal shown |
| 2 | Closed | Has Scene | App opens silently, terminal launches directly |
| 3 | Running (foreground) | No Scene | Launch modal shown |
| 4 | Running (foreground) | Has Scene | Terminal launches directly |
| 5 | Running (background/hidden) | No Scene | **App comes to front**, main window visible, Launch modal shown |
| 6 | Running (background/hidden) | Has Scene | Terminal launches directly (app stays hidden) |

Scenario 5 is the critical one that was broken - the fix addresses this specifically.
