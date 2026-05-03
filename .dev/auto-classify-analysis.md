# Auto-Classify Feature Analysis

> Generated: 2026-03-19

## Overview

The auto-classify feature uses **Claude CLI** (`claude` command) to automatically assign categories, tags, and icons to three types of items: **Skills**, **MCP Servers**, and **CLAUDE.md files**. It is a purely manual-trigger feature (button click), despite the existence of a `autoClassifyNewItems` settings field that is currently **unused in any UI**.

---

## File Map

### Backend (Rust)

| File | Role |
|------|------|
| `src-tauri/src/commands/classify.rs` | Core classification logic: prompt building, Claude CLI invocation, response parsing |
| `src-tauri/src/commands/mod.rs` | Module registration (`pub mod classify`) |
| `src-tauri/src/lib.rs` | Tauri command registration (`classify::auto_classify`) at line 122 |
| `src-tauri/src/main.rs` | PATH fix for macOS GUI apps (ensures `claude` CLI is findable) |
| `src-tauri/src/types.rs` | `AppSettings.auto_classify_new_items` field (line 208) |
| `src-tauri/src/commands/skills.rs` | `update_skill_metadata` - persists classification results to `data.json` |
| `src-tauri/src/commands/mcps.rs` | `update_mcp_metadata` - persists classification results to `data.json` |
| `src-tauri/src/commands/claude_md.rs` | `update_claude_md` - persists classification results for CLAUDE.md files |
| `src-tauri/src/commands/data.rs` | `add_category`, `add_tag` - creates new categories/tags from classification results |

### Frontend (TypeScript/React)

| File | Role |
|------|------|
| `src/types/index.ts` | `ClassifyItem`, `ClassifyResult` type definitions (lines 126-144) |
| `src/stores/skillsStore.ts` | `autoClassify()` method for Skills (line 314) |
| `src/stores/mcpsStore.ts` | `autoClassify()` method for MCP Servers (line 359) |
| `src/stores/claudeMdStore.ts` | `autoClassify()` method for CLAUDE.md files (line 410) |
| `src/stores/settingsStore.ts` | `autoClassifyNewItems` setting (line 28) - stored but **never consumed** |
| `src/pages/SkillsPage.tsx` | "Auto Classify" button for Skills (line 700-713) |
| `src/pages/McpServersPage.tsx` | "Auto Classify" button for MCPs (lines 696-715, 758-777) - two instances (empty state + normal state) |
| `src/pages/ClaudeMdPage.tsx` | "Auto Classify" button for CLAUDE.md (lines 266-284) |
| `src/pages/CategoryPage.tsx` | "Auto Classify" button (lines 173-180, 203-210) - two instances |
| `src/pages/TagPage.tsx` | "Auto Classify" button (lines 185-192) |
| `src/index.css` | All classification animations (lines 190-547): rainbow border, spinner, success bloom, fade transitions |
| `src/utils/tauri.ts` | `safeInvoke` wrapper used to call `auto_classify` backend command |

---

## Data Types

### `ClassifyItem` (Frontend -> Backend)

```typescript
interface ClassifyItem {
  id: string;
  name: string;
  description: string;
  content?: string;      // For CLAUDE.md files (first 500 chars)
  instructions?: string; // For Skills
  tools?: string[];      // For MCPs - tool names list
}
```

### `ClassifyResult` (Backend -> Frontend)

```typescript
interface ClassifyResult {
  id: string;
  suggested_category: string;
  suggested_tags: string[];
  suggested_icon?: string;
}
```

---

## Complete Workflow

### 1. Trigger

User clicks the **"Auto Classify"** button on any of these pages:
- **SkillsPage** / **McpServersPage** / **ClaudeMdPage** / **CategoryPage** / **TagPage**

Each button calls `autoClassify()` from the corresponding Zustand store.

### 2. Frontend Store Logic (e.g., `skillsStore.autoClassify()`)

```
1. Guard: skip if not in Tauri environment
2. Guard: skip if no items to classify (set error message)
3. Set state: isClassifying=true, classifySuccess=false, error=null
4. Prepare ClassifyItem[] from all items in the store
5. Gather existing categories and tags from useAppStore
6. Call backend: safeInvoke<ClassifyResult[]>('auto_classify', { items, existingCategories, existingTags, availableIcons: ICON_NAMES })
7. On null result: set error "Classification failed"
8. Collect new categories/tags that don't exist yet
9. Create new categories (with predefined color rotation from 8-color palette)
10. Create new tags
11. For each result: call update_skill_metadata / update_mcp_metadata / update_claude_md
12. Reload categories, tags, and items
13. Set classifySuccess=true
14. After 1.5s: trigger fade-out animation (200ms), then reset to idle state
```

**Key difference for CLAUDE.md**: The claudeMdStore looks up category/tag by name to get their IDs, then passes `categoryId` and `tagIds` (not names) to `update_claude_md`. Skills and MCPs store category/tags by name directly.

### 3. Backend `auto_classify` Command

Located in `src-tauri/src/commands/classify.rs`, function `auto_classify()` (line 149):

```
1. Guard: return empty vec if items is empty
2. Build classification prompt via build_classification_prompt()
3. Build JSON schema for structured output (category, tags with ^[a-z]+$ pattern, icon)
4. Execute: Command::new("claude")
     -p <prompt>
     --output-format json
     --json-schema <schema>
     --dangerously-skip-permissions
     --model sonnet
5. Check exit status -> error if non-zero
6. Parse stdout as JSON
7. Extract structured_output.classifications from response
8. Map to Vec<ClassifyResult>
```

### 4. Claude CLI Invocation Details

- **Command**: `claude -p <prompt> --output-format json --json-schema <schema> --dangerously-skip-permissions --model sonnet`
- **Model**: `sonnet` (hardcoded)
- **Flags**: `--dangerously-skip-permissions` (skips all permission prompts)
- **Output format**: JSON with structured output via `--json-schema`
- **PATH resolution**: Fixed at app startup in `main.rs` by running the user's login shell to get the full PATH (line 5-21)

### 5. Classification Prompt

The prompt (`build_classification_prompt`, line 28) includes:
- **Philosophy**: Entropy reduction (fewer, meaningful categories) + semantic accuracy
- **Category Decision Framework**: Validates existing categories (rejects garbage like "aaa", "test"), provides standard categories (Development, Database, Web, DevOps, AI, Research, Writing, Design, Communication, Productivity)
- **Tag Decision Framework**: Single lowercase English words only, 1-2 tags max, pattern `^[a-z]+$`
- **Icon Selection**: From available icon names passed by frontend
- **Items JSON**: Serialized ClassifyItem array

### 6. Result Persistence

Classification results are persisted via:
- **Skills**: `update_skill_metadata(skillId, category, tags, icon)` -> writes to `~/.ensemble/data.json` in `skill_metadata` HashMap
- **MCPs**: `update_mcp_metadata(mcpId, category, tags, icon)` -> writes to `~/.ensemble/data.json` in `mcp_metadata` HashMap
- **CLAUDE.md**: `update_claude_md(id, categoryId, tagIds, icon)` -> writes to CLAUDE.md storage

---

## Error Handling

### Frontend

| Error Scenario | Handling |
|----------------|----------|
| Not in Tauri environment | `console.warn()` + `set({ error: 'Auto-classification is not available in browser mode' })` |
| No items to classify | `set({ error: 'No skills/MCP servers/CLAUDE.md files to classify.' })` |
| `safeInvoke` returns null | `set({ error: 'Classification failed' })` |
| Exception thrown | Catch block: extracts message string, `set({ error: message, isClassifying: false })` |

### Backend (`classify.rs`)

| Error Scenario | Handling |
|----------------|----------|
| Claude CLI not found / spawn fails | `Err("Failed to execute Claude CLI: {error}. Make sure Claude CLI is installed and available in PATH.")` |
| Claude CLI returns non-zero exit | `Err("Claude CLI error: {stderr}\nOutput: {stdout}")` |
| JSON parse failure | `Err("Failed to parse Claude response: {error}. Response: {stdout}")` |
| Missing `structured_output.classifications` | `Err("Invalid response structure: missing structured_output.classifications. Response: {stdout}")` |
| Individual classification entry missing fields | Silently skipped via `filter_map` with `Some(...)` pattern |

### Frontend Error Display

Errors are displayed as a red notification bar below the page header (visible in McpServersPage at line 783+). The error can be dismissed via `clearError()`.

---

## SSL Configuration

**There is NO custom SSL/TLS configuration anywhere in the auto-classify feature.**

- The `reqwest` dependency in `Cargo.toml` (line 32: `reqwest = { version = "0.12", features = ["json"] }`) is used by the **deprecated** `validate_api_key` function (lines 249-277 in `classify.rs`), which is marked `#[allow(dead_code)]` and never called.
- No `NODE_TLS_REJECT_UNAUTHORIZED` or equivalent settings exist in the frontend.
- No custom certificate configuration exists in the Rust backend.
- The active classification path uses `Command::new("claude")` (subprocess), not HTTP requests, so SSL is handled entirely by the Claude CLI itself.
- `Cargo.lock` shows `native-tls`, `rustls`, `openssl` dependencies exist in the dependency tree (from `reqwest`), but none are configured with custom options.

---

## `autoClassifyNewItems` Setting (Unused)

The `autoClassifyNewItems` boolean exists throughout the settings pipeline:

- **Rust**: `AppSettings.auto_classify_new_items` (types.rs:208), defaults to `false`
- **Frontend type**: `AppSettings.autoClassifyNewItems` (types/index.ts:104)
- **Settings store**: Stored, loaded, saved, has setter `setAutoClassifyNewItems`
- **UI**: **NOT referenced in any `.tsx` component** - there is no toggle or checkbox for this setting
- **Logic**: **NOT consumed anywhere** - no code checks this value to trigger automatic classification

This appears to be a **planned but unimplemented feature** for automatically classifying newly imported/detected items.

---

## UI/Animation States

The button cycles through three visual states:

| State | Icon | Text | CSS Classes |
|-------|------|------|-------------|
| **Idle** | `<Sparkles>` | "Auto Classify" | (default) |
| **Classifying** | `<span className="ai-spinner">` (rainbow spinner) | "Classifying..." (rainbow gradient text) | `ai-classifying` (rotating rainbow border + pulse glow) |
| **Success** | `<Check>` (rainbow entrance animation) | "Done!" (rainbow gradient text) | `classify-success-bg` (rainbow border + bloom + sparkle) |
| **Fading out** | Same as success but fading | Same but fading | `classify-fading-out` (200ms fade-out) |

The success state lasts 1.5 seconds, followed by a 200ms fade-out back to idle. The idle icon gets a 200ms `classify-fade-in` animation when restoring.

---

## Key Functions Summary

| Function | Location | Purpose |
|----------|----------|---------|
| `build_classification_prompt()` | `classify.rs:28` | Constructs the AI prompt with items, categories, tags, icons |
| `auto_classify()` | `classify.rs:149` | Tauri command: runs Claude CLI and parses results |
| `autoClassify()` | `skillsStore.ts:314` | Frontend: orchestrates Skill classification |
| `autoClassify()` | `mcpsStore.ts:359` | Frontend: orchestrates MCP classification |
| `autoClassify()` | `claudeMdStore.ts:410` | Frontend: orchestrates CLAUDE.md classification |
| `update_skill_metadata()` | `skills.rs:61` | Persists skill category/tags/icon to data.json |
| `update_mcp_metadata()` | `mcps.rs` | Persists MCP category/tags/icon to data.json |
| `update_claude_md()` | `claude_md.rs` | Persists CLAUDE.md category/tags/icon |
| `addCategory()` | `appStore.ts` -> `data.rs:139` | Creates new category with color |
| `addTag()` | `appStore.ts` -> `data.rs` | Creates new tag |
| `validate_api_key()` | `classify.rs:250` | **DEPRECATED** - Dead code, never called |
