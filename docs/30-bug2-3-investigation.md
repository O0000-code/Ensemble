# Bug Investigation: Browse/Change Buttons Not Triggering macOS File Dialog

## Summary

The "Browse" button on the New Project form and the three "Change" buttons on the Settings page do not open the macOS native file selection dialog. The investigation reveals **two distinct root causes**: one in `ProjectsPage.tsx` and one in `SettingsPage.tsx`.

---

## Root Cause 1: ProjectsPage "Browse" Button

### The Broken Call Chain

**File: `src/pages/ProjectsPage.tsx`, lines 207-210**

```tsx
<ProjectConfigPanel
  ...
  onBrowse={() => {
    // In Electron: would open file dialog
    console.log('Browse for folder');
  }}
/>
```

The `onBrowse` callback is a **hardcoded `console.log` stub**. It never calls the store's `selectProjectFolder()` method.

### What Should Happen

The store already has the correct implementation. In `src/stores/projectsStore.ts`, lines 264-281:

```ts
selectProjectFolder: async () => {
  if (!isTauri()) {
    console.warn('ProjectsStore: Cannot select folder in browser mode');
    return;
  }

  try {
    const path = await safeInvoke<string | null>('select_folder');
    if (path) {
      set((state) => ({
        newProject: { ...state.newProject, path },
      }));
    }
  } catch (error) {
    set({ error: String(error) });
  }
},
```

This function correctly:
1. Checks for Tauri environment
2. Calls `safeInvoke<string | null>('select_folder')` to invoke the Rust backend
3. Updates the `newProject.path` state with the selected folder

**But it is never called from the UI.**

### The Fix

In `src/pages/ProjectsPage.tsx`, the `onBrowse` prop must be changed from the console.log stub to call the store's `selectProjectFolder` function.

**Current code (line 207-210):**
```tsx
onBrowse={() => {
  // In Electron: would open file dialog
  console.log('Browse for folder');
}}
```

**Required fix:**
```tsx
onBrowse={() => {
  useProjectsStore.getState().selectProjectFolder();
}}
```

Note: `selectProjectFolder` is already declared in the store's interface and destructured at line 29-44 of ProjectsPage, but not currently used. The simplest approach is to add `selectProjectFolder` to the destructured values and then pass it:

```tsx
// Add to destructured values (around line 29):
const {
  ...
  selectProjectFolder,  // ADD THIS
} = useProjectsStore();

// Then change onBrowse prop (around line 207):
onBrowse={selectProjectFolder}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/ProjectsPage.tsx` | Replace `console.log` stub in `onBrowse` with call to `selectProjectFolder` from the store |

---

## Root Cause 2: SettingsPage "Change" Buttons

### The Broken Call Chain

**File: `src/pages/SettingsPage.tsx`, lines 175-195**

```tsx
const handleChangeDir = (type: 'skills' | 'mcp' | 'claude') => {
  // In a real app, this would open a native directory picker
  // For now, we'll just log the action
  console.log(`Change ${type} directory requested`);

  // Simulate directory selection for demo
  const newPath = prompt(`Enter new ${type} directory path:`);
  if (newPath) {
    switch (type) {
      case 'skills':
        setSkillSourceDir(newPath);
        break;
      case 'mcp':
        setMcpSourceDir(newPath);
        break;
      case 'claude':
        setClaudeConfigDir(newPath);
        break;
    }
  }
};
```

The `handleChangeDir` function uses **`window.prompt()`** (a browser-based text input dialog) instead of the Tauri native directory picker. This is a placeholder/demo implementation that was never replaced.

### What Should Happen

The settings store already has the correct implementation. In `src/stores/settingsStore.ts`, lines 163-188:

```ts
selectDirectory: async (type: 'skill' | 'mcp' | 'claude') => {
  if (!isTauri()) {
    console.warn('Settings: Directory selection not available in browser mode');
    return;
  }

  try {
    const path = await safeInvoke<string | null>('select_folder');
    if (path) {
      if (type === 'skill') {
        set({ skillSourceDir: path });
      } else if (type === 'mcp') {
        set({ mcpSourceDir: path });
      } else {
        set({ claudeConfigDir: path });
      }
      get().saveSettings();
    }
  } catch (error) {
    const message = typeof error === 'string' ? error : String(error);
    console.error('Failed to select directory:', error);
    set({ error: message });
  }
},
```

This function correctly:
1. Checks for Tauri environment
2. Calls `safeInvoke<string | null>('select_folder')` to invoke the Rust backend
3. Updates the correct directory path based on `type`
4. Persists settings via `saveSettings()`

**But it is never called from the UI.** The `selectDirectory` function is not even destructured from the store in `SettingsPage.tsx`.

### The Fix

In `src/pages/SettingsPage.tsx`, the `handleChangeDir` function must be replaced to call the store's `selectDirectory` method.

**Current code (lines 175-195):**
```tsx
const handleChangeDir = (type: 'skills' | 'mcp' | 'claude') => {
  console.log(`Change ${type} directory requested`);
  const newPath = prompt(`Enter new ${type} directory path:`);
  if (newPath) {
    switch (type) {
      case 'skills':
        setSkillSourceDir(newPath);
        break;
      case 'mcp':
        setMcpSourceDir(newPath);
        break;
      case 'claude':
        setClaudeConfigDir(newPath);
        break;
    }
  }
};
```

**Required fix:**

1. Add `selectDirectory` to the destructured store values (around line 158):
```tsx
const {
  ...
  selectDirectory,  // ADD THIS
} = useSettingsStore();
```

2. Replace the entire `handleChangeDir` function with:
```tsx
const handleChangeDir = (type: 'skills' | 'mcp' | 'claude') => {
  // Map from SettingsPage type names to store type names
  const typeMap: Record<string, 'skill' | 'mcp' | 'claude'> = {
    skills: 'skill',
    mcp: 'mcp',
    claude: 'claude',
  };
  selectDirectory(typeMap[type]);
};
```

Note: There is a **type mismatch** between the page and the store. The page uses `'skills'` (plural) while the store expects `'skill'` (singular). The mapping above handles this.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/SettingsPage.tsx` | Destructure `selectDirectory` from the store; replace the `handleChangeDir` stub with a call to `selectDirectory` |

---

## Backend Verification: No Issues Found

The Tauri backend is correctly configured and ready. All pieces are in place:

### 1. Dialog Command (`src-tauri/src/commands/dialog.rs`)

```rust
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
pub fn select_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let result = app.dialog().file().blocking_pick_folder();
    Ok(result.map(|p| p.to_string()))
}
```

This correctly uses `tauri_plugin_dialog::DialogExt` and calls `blocking_pick_folder()` to open the macOS native folder picker.

### 2. Command Registration (`src-tauri/src/lib.rs`, lines 68-69)

```rust
.invoke_handler(tauri::generate_handler![
    ...
    dialog::select_folder,
    dialog::select_file,
    ...
])
```

Both dialog commands are registered in the invoke handler.

### 3. Plugin Initialization (`src-tauri/src/lib.rs`, line 11)

```rust
.plugin(tauri_plugin_dialog::init())
```

The dialog plugin is properly initialized.

### 4. Cargo Dependency (`src-tauri/Cargo.toml`, line 27)

```toml
tauri-plugin-dialog = "2"
```

The `tauri-plugin-dialog` crate is included.

### 5. Capabilities (`src-tauri/capabilities/default.json`)

```json
{
  "permissions": [
    "core:default",
    "dialog:default",
    "shell:default"
  ]
}
```

The `dialog:default` permission is granted.

### 6. Tauri Utility (`src/utils/tauri.ts`)

```ts
export const safeInvoke = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | null> => {
  if (!isTauri()) {
    console.warn(`Tauri not available. Cannot invoke: ${command}`);
    return null;
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
};
```

The `safeInvoke` wrapper correctly detects the Tauri environment and dynamically imports from `@tauri-apps/api/core` (the Tauri 2.x path).

---

## Complete Fix Summary

### File 1: `src/pages/ProjectsPage.tsx`

**Problem:** `onBrowse` callback is a `console.log` stub (line 207-210).

**Fix:** Add `selectProjectFolder` to the destructured store values and wire it to the `onBrowse` prop.

1. At the destructuring block (around line 29-44), add `selectProjectFolder` to the list.
2. Replace:
   ```tsx
   onBrowse={() => {
     // In Electron: would open file dialog
     console.log('Browse for folder');
   }}
   ```
   With:
   ```tsx
   onBrowse={selectProjectFolder}
   ```

### File 2: `src/pages/SettingsPage.tsx`

**Problem:** `handleChangeDir` uses `window.prompt()` instead of the native dialog (lines 175-195).

**Fix:** Add `selectDirectory` to the destructured store values and replace the handler.

1. At the destructuring block (around line 158-172), add `selectDirectory` to the list.
2. Replace the entire `handleChangeDir` function body:
   ```tsx
   const handleChangeDir = (type: 'skills' | 'mcp' | 'claude') => {
     const typeMap: Record<string, 'skill' | 'mcp' | 'claude'> = {
       skills: 'skill',
       mcp: 'mcp',
       claude: 'claude',
     };
     selectDirectory(typeMap[type]);
   };
   ```

### No Backend Changes Needed

The Rust backend (`dialog.rs`), command registration (`lib.rs`), Cargo dependencies, capabilities, store implementations (`projectsStore.ts`, `settingsStore.ts`), and the Tauri utility wrapper (`tauri.ts`) are all correctly implemented. The bug is purely a **frontend wiring issue** -- the UI components were left with placeholder/stub handlers and never connected to the already-working store methods.
