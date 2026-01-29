# Bug Fix Plan - 3 Issues

**Date**: 2026-01-28

---

## Bug Analysis Summary

### Bug 1: White Screen on Skill/MCP Item Click

**Symptom**: Clicking a specific Skill or MCP item in the list page causes the entire page to go white.

**Navigation flow**:
- SkillsPage: `navigate(`/skills/${skillId}`)` → mounts SkillDetailPage
- McpServersPage: `navigate(`/mcp-servers/${id}`)` → mounts McpDetailPage

**Investigation findings**:
- TypeScript compilation passes cleanly (no errors)
- Rust structs use `#[serde(rename_all = "camelCase")]` — all field names match TypeScript types exactly
- All Vec fields are non-optional in Rust (always `[]`, never `null`)
- All component files exist and export correctly (both named and default exports)
- React Router v7.13.0 is used — BrowserRouter/Routes API is backward compatible
- Routes are correctly defined in App.tsx

**Root cause assessment**:
The exact crash point cannot be definitively isolated through static code analysis alone. However, the most likely cause is a **race condition between navigation and state**: when navigating from `/skills` to `/skills/:id`, the `SkillDetailPage` mounts and renders BEFORE the `useEffect` that calls `selectSkill(skillId)` fires. On the first render, `selectedSkill` is `undefined`, so the detail section shows an empty state. After the effect, the component re-renders with the selected skill.

Without a React Error Boundary, ANY unhandled rendering error in the component tree would cause the entire app to show a white screen (React's default error behavior).

**Fix strategy (defense-in-depth)**:
1. Add a `React Error Boundary` to catch rendering errors gracefully
2. In SkillDetailPage: sync `selectedSkillId` immediately (not just in useEffect)
3. In McpDetailPage: same immediate sync
4. Add optional chaining for safety on property accesses

### Bug 2: Browse Button in New Project Not Working

**Root cause**: `ProjectsPage.tsx` line 207-210 — the `onBrowse` prop uses a `console.log` stub instead of the store's `selectProjectFolder` method.

```tsx
// CURRENT (broken)
onBrowse={() => {
  console.log('Browse for folder');
}}

// FIX
onBrowse={selectProjectFolder}
```

The store's `selectProjectFolder` method (projectsStore.ts lines 264-281) correctly invokes the Tauri `select_folder` command. It just was never wired to the UI.

### Bug 3: Settings Change Buttons Not Working

**Root cause**: `SettingsPage.tsx` lines 175-195 — `handleChangeDir` uses `window.prompt()` instead of the store's `selectDirectory` method.

```tsx
// CURRENT (broken)
const newPath = prompt(`Enter new ${type} directory path:`);

// FIX
selectDirectory(typeMap[type]);
```

The store's `selectDirectory` method (settingsStore.ts lines 163-188) correctly invokes the Tauri `select_folder` command. It just was never wired to the UI.

**Note**: There's a type mismatch — the page uses `'skills'` (plural) but the store expects `'skill'` (singular). The fix must include a type mapping.

---

## Files to Modify

| File | Bug | Change |
|------|-----|--------|
| `src/components/common/ErrorBoundary.tsx` | 1 | NEW — React Error Boundary component |
| `src/components/layout/MainLayout.tsx` | 1 | Wrap Outlet with ErrorBoundary |
| `src/pages/SkillDetailPage.tsx` | 1 | Immediate selectedSkillId sync + defensive coding |
| `src/pages/McpDetailPage.tsx` | 1 | Immediate selectedMcpId sync + defensive coding |
| `src/pages/ProjectsPage.tsx` | 2 | Wire onBrowse to selectProjectFolder |
| `src/pages/SettingsPage.tsx` | 3 | Wire handleChangeDir to selectDirectory |

## Files NOT Modified (backend is correct)

- `src-tauri/src/commands/dialog.rs` — `select_folder` works correctly
- `src-tauri/src/lib.rs` — commands registered, dialog plugin initialized
- `src-tauri/Cargo.toml` — `tauri-plugin-dialog = "2"` present
- `src-tauri/capabilities/default.json` — `dialog:default` permission granted
- `src/stores/projectsStore.ts` — `selectProjectFolder` implemented correctly
- `src/stores/settingsStore.ts` — `selectDirectory` implemented correctly
- `src/utils/tauri.ts` — `safeInvoke` works correctly

---

## Execution Plan

### Step 1: Create ErrorBoundary component
A simple React Error Boundary that catches rendering errors and displays a fallback UI with retry capability.

### Step 2: Fix SkillDetailPage
- Call `selectSkill(skillId)` immediately in the render (via useMemo or direct call) instead of only in useEffect
- Add optional chaining on property accesses for safety

### Step 3: Fix McpDetailPage
- Same approach as SkillDetailPage

### Step 4: Wrap Outlet in MainLayout with ErrorBoundary

### Step 5: Fix ProjectsPage Browse button
- Destructure `selectProjectFolder` from the store
- Pass it as the `onBrowse` prop

### Step 6: Fix SettingsPage Change buttons
- Destructure `selectDirectory` from the store
- Replace `handleChangeDir` to use `selectDirectory` with type mapping

### Step 7: Verify
- Run `npx tsc --noEmit` to check TypeScript compilation
- Run `npm run build` to check full build
