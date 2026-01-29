# Bug Investigation: White Screen on Skill/MCP Item Click

## Summary

When a user clicks on a Skill or MCP item in the list page, the app navigates to a detail route (`/skills/:skillId` or `/mcp-servers/:id`) but renders a **white screen** instead of the expected detail view. The root cause is that the detail pages rely on store data (`skills[]` / `mcpServers[]`) which is **empty in browser mode**, causing the components to render with no visible content.

---

## Investigation Flow

### 1. Router Configuration

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/App.tsx`

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Navigate to="/skills" replace />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="skills/:skillId" element={<SkillDetailPage />} />
      <Route path="mcp-servers" element={<McpServersPage />} />
      <Route path="mcp-servers/:id" element={<McpDetailPage />} />
      {/* ... other routes ... */}
    </Route>
  </Routes>
</BrowserRouter>
```

**Finding:** Routes are correctly defined. `/skills/:skillId` maps to `SkillDetailPage` and `/mcp-servers/:id` maps to `McpDetailPage`. Both are nested inside `<MainLayout />` which renders `<Outlet />`. No missing route definitions.

---

### 2. Navigation Trigger (List Pages)

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx` (lines 35-37)

```tsx
const handleSkillClick = (skillId: string) => {
  navigate(`/skills/${skillId}`);
};
```

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx` (lines 35-37)

```tsx
const handleMcpClick = (id: string) => {
  navigate(`/mcp-servers/${id}`);
};
```

**Finding:** Navigation calls are correct. They use `react-router-dom`'s `useNavigate()` to push to the detail route with the item's ID.

---

### 3. Detail Page Analysis - SkillDetailPage

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillDetailPage.tsx`

Key logic:

```tsx
export function SkillDetailPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const {
    filter, setFilter, selectSkill, selectedSkillId,
    toggleSkill, getFilteredSkills, getEnabledCount, getSelectedSkill,
  } = useSkillsStore();

  const filteredSkills = getFilteredSkills();    // <-- EMPTY in browser mode
  const enabledCount = getEnabledCount();        // <-- 0 in browser mode
  const selectedSkill = getSelectedSkill();      // <-- undefined in browser mode

  useEffect(() => {
    if (skillId) {
      selectSkill(skillId);  // Sets selectedSkillId in store
    }
  }, [skillId, selectSkill]);
```

Then it builds the UI:

```tsx
  // Detail Header (when skill is selected)
  const detailHeader = selectedSkill && ( /* ... JSX ... */ );

  // Detail Content (when skill is selected)
  const detailContent = selectedSkill && ( /* ... JSX ... */ );

  // Empty Detail State
  const emptyDetail = (
    <EmptyState
      icon={<Sparkles className="h-12 w-12" />}
      title="No skill selected"
      description="Select a skill from the list to view its details"
    />
  );

  return (
    <ListDetailLayout
      listWidth={380}
      listHeader={listHeader}
      listContent={listContent}       // <-- List is empty (no skills)
      detailHeader={detailHeader}      // <-- undefined (selectedSkill is undefined)
      detailContent={detailContent}    // <-- undefined (selectedSkill is undefined)
      emptyDetail={emptyDetail}
    />
  );
}
```

**BUG CHAIN:**

1. `useSkillsStore` has `skills: []` (empty array) because `loadSkills()` skips loading in browser mode.
2. `selectSkill(skillId)` sets `selectedSkillId` to the URL param value, but `getSelectedSkill()` returns `undefined` because `skills.find(...)` finds nothing in an empty array.
3. `selectedSkill` is `undefined`, so `detailHeader` and `detailContent` are both `false` (short-circuit `&&`).
4. `getFilteredSkills()` returns `[]`, so `listContent` renders "No skills found" text.
5. `ListDetailLayout` receives `detailHeader=false` and `detailContent=false`.

---

### 4. Detail Page Analysis - McpDetailPage

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpDetailPage.tsx`

Identical pattern:

```tsx
export const McpDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    filter, setFilter, selectMcp, toggleMcp,
    getFilteredMcps, getEnabledCount, getSelectedMcp,
  } = useMcpsStore();

  const filteredMcps = getFilteredMcps();      // <-- EMPTY in browser mode
  const enabledCount = getEnabledCount();      // <-- 0 in browser mode
  const selectedMcp = getSelectedMcp();        // <-- undefined in browser mode

  useEffect(() => {
    if (id) {
      selectMcp(id);  // Sets selectedMcpId but find() returns undefined
    }
  }, [id, selectMcp]);
```

Same `selectedMcp && (...)` pattern means `detailHeader` and `detailContent` are both `false`.

---

### 5. ListDetailLayout Behavior with Empty Data

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/ListDetailLayout.tsx`

```tsx
export function ListDetailLayout({
  listWidth = 380,
  listHeader,
  listContent,
  detailHeader,
  detailContent,
  emptyDetail,
}: ListDetailLayoutProps) {
  const hasDetail = detailHeader || detailContent;  // <-- false || false = false

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* List Panel */}
      <div style={{ width: `${listWidth}px` }}>
        {/* List Header - renders but empty-looking */}
        <div className="flex h-14 ...">
          {listHeader}   {/* Shows "Skills" / "MCP Servers" header with "0 Active" */}
        </div>
        {/* List Content - renders "No skills found" / empty list */}
        <div className="flex-1 overflow-y-auto p-3">
          {listContent}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex h-full flex-1 flex-col">
        {hasDetail ? (
          <>
            {/* ... detail header and content ... */}
          </>
        ) : (
          // Empty state - THIS IS WHAT RENDERS
          <div className="flex h-full flex-1 items-center justify-center">
            {emptyDetail}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Result:** The layout renders with:
- **Left panel (380px):** Shows list header ("Skills" with "0 Active") and "No skills found" text
- **Right panel:** Shows `emptyDetail` = "No skill selected / Select a skill from the list to view its details"

This is technically NOT a fully "white screen" -- BUT it appears as one because:
1. The left panel has minimal content ("No skills found" is small gray text)
2. The right panel shows a very subtle empty state (light gray icon + light gray text)
3. The overall impression is a nearly blank white page with very faint elements

---

### 6. Store Data Loading - Root Cause

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts` (lines 89-95)

```tsx
loadSkills: async () => {
  // Skip in non-Tauri environment
  if (!isTauri()) {
    console.warn('SkillsStore: Cannot load skills in browser mode');
    set({ isLoading: false });
    return;
  }
  // ... Tauri invoke ...
},
```

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts` (lines 49-55)

```tsx
loadMcps: async () => {
  // Skip in non-Tauri environment
  if (!isTauri()) {
    console.warn('McpsStore: Cannot load MCPs in browser mode');
    set({ isLoading: false });
    return;
  }
  // ... Tauri invoke ...
},
```

**File:** `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx` (lines 46-49)

```tsx
// In browser mode, skip data loading but allow UI preview
if (!isTauri()) {
  console.warn('Running in browser mode - Tauri API not available. Using empty data for UI preview.');
  setIsInitializing(false);
  return;  // <-- Exits immediately, never loads any data
}
```

**Root cause:** When the app runs in a browser (not inside Tauri), **no data is loaded at all**. The stores remain with their initial empty state (`skills: []`, `mcpServers: []`). The list pages show empty lists, and the detail pages can never find any item by ID.

---

## Root Cause (Definitive)

The white screen is caused by the **absence of mock/seed data when running outside the Tauri environment**. The entire data pipeline is guarded by `isTauri()` checks that cause early returns. When the user clicks a skill or MCP item (which would require data to exist in the first place), the detail page:

1. Reads the ID from the URL parameter
2. Calls `selectSkill(id)` / `selectMcp(id)` to set the selected ID in the store
3. Calls `getSelectedSkill()` / `getSelectedMcp()` which does `skills.find(s => s.id === selectedSkillId)` on an **empty array**
4. Gets `undefined`, which causes `detailHeader` and `detailContent` to be `false`
5. `ListDetailLayout` falls through to its empty state

**Additionally**, if this bug also occurs in Tauri mode, there is a **timing/race condition**: the `useEffect` that calls `selectSkill(skillId)` runs after the initial render. On the first render, `selectedSkillId` is still `null`, so `getSelectedSkill()` returns `undefined`. The component re-renders after the effect runs, but if `skills[]` hasn't been populated yet (async loading), the `find()` still returns `undefined`. There is no loading state shown while waiting for the skill data.

---

## Files That Need Modification

### Fix 1: Add Mock/Seed Data for Browser Mode

**Files to modify:**
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts`

**What to do:** When `isTauri()` returns false, populate the stores with mock data instead of leaving them empty. This can be done either:
- (A) In the `loadSkills()` / `loadMcps()` methods: when `!isTauri()`, set mock data instead of returning empty, OR
- (B) Create a separate mock data file and conditionally import it in MainLayout's initialization, OR
- (C) Set non-empty initial state in the store definition for browser mode.

**Recommended approach (A):**

In `skillsStore.ts`, change `loadSkills`:
```tsx
loadSkills: async () => {
  if (!isTauri()) {
    console.warn('SkillsStore: Cannot load skills in browser mode');
    // Load mock data for UI preview
    set({ skills: getMockSkills(), isLoading: false });
    return;
  }
  // ... existing Tauri code ...
},
```

Same pattern for `mcpsStore.ts` `loadMcps`.

### Fix 2: Load Data in Browser Mode (MainLayout)

**File to modify:**
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**What to do:** Remove the early return in the browser mode branch so that `loadSkills()`, `loadMcps()`, etc. are still called (they will load mock data after Fix 1 is applied):

```tsx
if (!isTauri()) {
  console.warn('Running in browser mode - Tauri API not available. Using mock data for UI preview.');
  // DON'T return early -- still call the load functions so they can set mock data
}
```

Or alternatively, call the load functions even in browser mode:

```tsx
if (!isTauri()) {
  console.warn('Running in browser mode...');
  // Load mock data for preview
  await Promise.all([loadSkills(), loadMcps(), loadScenes(), loadProjects()]);
  setIsInitializing(false);
  return;
}
```

### Fix 3: Add Loading/Not-Found Guard to Detail Pages

**Files to modify:**
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillDetailPage.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpDetailPage.tsx`

**What to do:** Add a guard for when the skill/MCP is not found after data has loaded. Currently, if the user navigates directly to `/skills/some-invalid-id`, they see the empty state without any indication that the ID is invalid. Add:

```tsx
// In SkillDetailPage, after getting selectedSkill:
const isLoading = useSkillsStore((s) => s.isLoading);
const skills = useSkillsStore((s) => s.skills);

// If data is loaded but skill not found, show a proper "not found" message
// or redirect back to the list:
useEffect(() => {
  if (!isLoading && skills.length > 0 && skillId && !selectedSkill) {
    // Skill ID from URL doesn't exist in data
    navigate('/skills', { replace: true });
  }
}, [isLoading, skills, skillId, selectedSkill, navigate]);
```

### Fix 4 (Optional): Create Mock Data Module

**New file to create:**
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/utils/mockData.ts`

**What to do:** Create a centralized mock data file with realistic sample Skills and McpServers that can be used when running in browser mode. This keeps mock data out of the store files.

---

## Import Inconsistency Finding (Minor)

The codebase uses two different import styles:

| File | Import Style |
|------|-------------|
| `SkillsPage.tsx` | Relative paths: `'../components/layout/PageHeader'` |
| `SkillDetailPage.tsx` | Relative paths: `'../components/layout/ListDetailLayout'` |
| `McpServersPage.tsx` | Alias paths: `'@/components/layout/PageHeader'` |
| `McpDetailPage.tsx` | Alias paths: `'@/components/layout/ListDetailLayout'` |

Both styles resolve correctly due to the Vite alias configuration and tsconfig paths. This is not a bug, but it is an inconsistency that could be cleaned up.

The `@/` alias is properly configured in both:
- `vite.config.ts`: `resolve: { alias: { "@": resolve(__dirname, "./src") } }`
- `tsconfig.json`: `"paths": { "@/*": ["src/*"] }`

---

## Reproduction Steps

1. Run `npm run dev` (browser mode, not Tauri)
2. Navigate to `http://localhost:1420` -- app redirects to `/skills`
3. The Skills page shows an empty state (no skills loaded)
4. *If mock data were present*: clicking a skill item would navigate to `/skills/:id`
5. The detail page would appear as a near-white screen because `getSelectedSkill()` returns `undefined`

**Note:** In pure browser mode, the list pages themselves are also empty, so there are no items to click. The bug would also manifest if navigating directly to a URL like `http://localhost:1420/skills/some-id`.

---

## Priority Assessment

- **Severity:** High -- the detail pages are completely non-functional in browser mode
- **Scope:** Affects `SkillDetailPage`, `McpDetailPage`, and likely `SceneDetailPage` (same pattern)
- **Fix complexity:** Low -- primarily requires adding mock data and adjusting the initialization flow
