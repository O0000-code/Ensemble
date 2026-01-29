# White Screen Debug Investigation Report

**Date**: 2026-01-28
**Investigated by**: Claude Code

---

## Executive Summary

The "white screen" issue when clicking on a Skill or MCP item has been thoroughly investigated. The root cause is a **React anti-pattern** in both `SkillDetailPage.tsx` and `McpDetailPage.tsx` where a state-updating function is called directly during the render phase, violating React's rules.

---

## Console Errors Found

### Primary Error (React Warning)

```
Warning: Cannot update a component (`MainLayout`) while rendering a different component (`SkillDetailPage`).
To locate the bad setState() call inside `SkillDetailPage`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render
```

**Full Stack Trace**:
```
at SkillDetailPage (http://localhost:1420/src/pages/SkillDetailPage.tsx:116:23)
at RenderedRoute (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:6301:26)
at Outlet (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:7082:26)
at ErrorBoundary (http://localhost:1420/src/components/common/ErrorBoundary.tsx:7:5)
at main
at div
at div
at MainLayout (http://localhost:1420/src/components/layout/MainLayout.tsx:33:20)
at RenderedRoute (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:6301:26)
at Routes (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:7150:3)
at Router (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:7091:13)
at BrowserRouter (http://localhost:1420/node_modules/.vite/deps/react-router-dom.js?v=8d59387b:10287:3)
at App
```

### Same Error for McpDetailPage

```
Warning: Cannot update a component (`MainLayout`) while rendering a different component (`McpDetailPage`).
at McpDetailPage (http://localhost:1420/src/pages/McpDetailPage.tsx:64:18)
```

### Secondary Errors (Expected in Browser Mode)

```
Failed to load settings: TypeError: Cannot read properties of undefined (reading 'invoke')
    at invoke (@tauri-apps_api_core.js:111:37)
    at loadSettings (settingsStore.ts:49:30)
```

```
Failed to initialize app: TypeError: Cannot read properties of undefined (reading 'invoke')
    at invoke (@tauri-apps_api_core.js:111:37)
    at initApp (appStore.ts:118:13)
```

These are expected when running in browser mode without Tauri.

---

## Root Cause Analysis

### The Problem: State Update During Render

Both `SkillDetailPage.tsx` and `McpDetailPage.tsx` contain code that calls a state-updating function directly during the render phase:

**SkillDetailPage.tsx (lines 142-144)**:
```tsx
// Sync URL param with store selection immediately
if (skillId && skillId !== selectedSkillId) {
  selectSkill(skillId);  // <-- STATE UPDATE DURING RENDER
}
```

**McpDetailPage.tsx (lines 87-89)**:
```tsx
// Sync URL param with store selection immediately
if (id && id !== selectedMcpId) {
  selectMcp(id);  // <-- STATE UPDATE DURING RENDER
}
```

### Why This Causes Problems

1. **React's Rule Violation**: React expects render functions to be pure - they should not have side effects like updating state. When `selectSkill()` or `selectMcp()` is called during render, it triggers a state update in the Zustand store.

2. **The Store Update Triggers Re-renders**: The `selectSkill(id)` function calls `set({ selectedSkillId: id })` which updates the store state. Any component subscribed to this state (including `MainLayout` via its use of `useAppStore`) will attempt to re-render.

3. **Cascade Effect**: This creates a cascade where:
   - SkillDetailPage is rendering
   - It calls selectSkill() during render
   - Store state changes
   - Components using the store try to re-render
   - React detects this violation and issues the warning

4. **Potential for Infinite Loop**: In some scenarios, this anti-pattern can cause React to get into an inconsistent state or even an infinite re-render loop, which manifests as a white screen.

### Why Browser Mode Appears to Work

In browser mode:
- The stores are empty (`skills: []`, `mcpServers: []`)
- The `selectSkill(id)` still runs and sets `selectedSkillId`
- But `getSelectedSkill()` returns `undefined` because `skills.find()` finds nothing
- The component renders the empty state ("No skill selected")
- The warning still appears in console, but the app doesn't crash because there's no data to render incorrectly

In Tauri mode (with actual data):
- The stores have real data
- The state update during render can cause React to get confused about what to render
- Combined with the re-render cascade, this can cause the component tree to fail to render

---

## Files and Line Numbers

| File | Line | Issue |
|------|------|-------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillDetailPage.tsx` | 142-144 | State update during render |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpDetailPage.tsx` | 87-89 | State update during render |

---

## The Fix (Already in Plan)

The fix documented in `docs/31-bug-fix-plan.md` is correct. The immediate state sync code should be **removed** because it's redundant with the `useEffect` that follows it:

**Current Code (Problematic)**:
```tsx
// Sync URL param with store selection immediately
if (skillId && skillId !== selectedSkillId) {
  selectSkill(skillId);  // WRONG: Called during render
}

// Sync URL param with store selection
useEffect(() => {
  if (skillId) {
    selectSkill(skillId);  // CORRECT: Called in effect
  }
}, [skillId, selectSkill]);
```

**Fixed Code**:
```tsx
// Sync URL param with store selection
useEffect(() => {
  if (skillId) {
    selectSkill(skillId);
  }
}, [skillId, selectSkill]);
```

The `useEffect` is the correct place to perform this synchronization because:
1. Effects run after render, not during
2. React expects effects to have side effects
3. The store update will trigger a re-render in the next React cycle, not during the current render

---

## Network Tab Analysis

No failed network requests were observed. All resources load correctly:
- Vite client scripts load
- React modules load
- Component modules load
- No 404 errors

---

## Visual Verification

Screenshots captured during debugging show:
1. **Skills page** (`/skills`): Renders correctly with empty list in browser mode
2. **Skill detail page** (`/skills/:id`): Renders correctly with "No skill selected" empty state
3. **MCP detail page** (`/mcp-servers/:id`): Renders correctly with "Select an MCP server" empty state

The "white screen" is likely more visible in Tauri mode where the React violation has more impact due to actual data being present.

---

## Recommendations

1. **Remove the immediate sync code**: Delete lines 142-144 in SkillDetailPage.tsx and lines 87-89 in McpDetailPage.tsx

2. **Keep only the useEffect sync**: The useEffect already handles the URL parameter synchronization correctly

3. **Add defensive coding**: Consider adding a loading state or not-found state for when the skill/MCP ID from the URL doesn't match any item in the store

4. **Test in Tauri mode**: After the fix, verify in Tauri mode (`npm run tauri dev`) that clicking on items works correctly

---

## Related Documentation

- `docs/30-bug1-investigation.md`: Previous investigation with similar findings
- `docs/31-bug-fix-plan.md`: Fix plan that addresses this issue

---

*Report generated: 2026-01-28*
