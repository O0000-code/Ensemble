# Rust Struct vs TypeScript Type Comparison Report

**Date:** 2026-01-28
**Purpose:** Verify whether Rust backend data structures match TypeScript frontend types, and assess if any mismatch could cause a white screen crash.

---

## 1. Serde Configuration Summary

All Rust structs in `src-tauri/src/types.rs` use:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
```

**This means all snake_case Rust field names are automatically serialized as camelCase in JSON**, which is exactly what the TypeScript frontend expects.

**VERDICT: No snake_case vs camelCase mismatch. The `rename_all = "camelCase"` attribute is present on every single struct.**

---

## 2. Skill Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 4-21)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,        // -> "sourcePath"
    pub scope: String,              // -> "scope"
    pub invocation: Option<String>, // -> "invocation"
    pub allowed_tools: Option<Vec<String>>, // -> "allowedTools"
    pub instructions: String,
    pub created_at: String,         // -> "createdAt"
    pub last_used: Option<String>,  // -> "lastUsed"
    pub usage_count: u32,           // -> "usageCount"
}
```

### TypeScript (`src/types/index.ts`, lines 1-16)
```typescript
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'user' | 'project';
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}
```

### Field-by-Field Comparison

| # | Rust Field | Serialized As | TS Field | TS Type | Match? | Notes |
|---|-----------|--------------|----------|---------|--------|-------|
| 1 | `id: String` | `id` | `id: string` | string | YES | |
| 2 | `name: String` | `name` | `name: string` | string | YES | |
| 3 | `description: String` | `description` | `description: string` | string | YES | |
| 4 | `category: String` | `category` | `category: string` | string | YES | |
| 5 | `tags: Vec<String>` | `tags` | `tags: string[]` | string[] | YES | Non-null Vec |
| 6 | `enabled: bool` | `enabled` | `enabled: boolean` | boolean | YES | |
| 7 | `source_path: String` | `sourcePath` | `sourcePath: string` | string | YES | camelCase rename works |
| 8 | `scope: String` | `scope` | `scope: 'user' \| 'project'` | string literal union | YES | Rust uses plain String; TS is stricter with union type. Backend always sets `"user"` (see skills.rs line 125). Not a crash risk but the TS type is more restrictive. |
| 9 | `invocation: Option<String>` | `invocation` | `invocation?: string` | string \| undefined | YES | Option serializes as null/absent; TS expects optional |
| 10 | `allowed_tools: Option<Vec<String>>` | `allowedTools` | `allowedTools?: string[]` | string[] \| undefined | YES | |
| 11 | `instructions: String` | `instructions` | `instructions: string` | string | YES | |
| 12 | `created_at: String` | `createdAt` | `createdAt: string` | string | YES | |
| 13 | `last_used: Option<String>` | `lastUsed` | `lastUsed?: string` | string \| undefined | YES | |
| 14 | `usage_count: u32` | `usageCount` | `usageCount: number` | number | YES | u32 maps to JS number correctly |

**Skill VERDICT: FULL MATCH. All 14 fields align correctly.**

---

## 3. McpServer Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 23-40)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServer {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,         // -> "sourcePath"
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
    pub provided_tools: Vec<Tool>,   // -> "providedTools"
    pub created_at: String,          // -> "createdAt"
    pub last_used: Option<String>,   // -> "lastUsed"
    pub usage_count: u32,            // -> "usageCount"
}
```

### TypeScript (`src/types/index.ts`, lines 18-33)
```typescript
export interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}
```

### Field-by-Field Comparison

| # | Rust Field | Serialized As | TS Field | TS Type | Match? | Notes |
|---|-----------|--------------|----------|---------|--------|-------|
| 1 | `id: String` | `id` | `id: string` | string | YES | |
| 2 | `name: String` | `name` | `name: string` | string | YES | |
| 3 | `description: String` | `description` | `description: string` | string | YES | |
| 4 | `category: String` | `category` | `category: string` | string | YES | |
| 5 | `tags: Vec<String>` | `tags` | `tags: string[]` | string[] | YES | Non-null Vec |
| 6 | `enabled: bool` | `enabled` | `enabled: boolean` | boolean | YES | |
| 7 | `source_path: String` | `sourcePath` | `sourcePath: string` | string | YES | |
| 8 | `command: String` | `command` | `command: string` | string | YES | |
| 9 | `args: Vec<String>` | `args` | `args: string[]` | string[] | YES | Non-null Vec |
| 10 | `env: Option<HashMap<String, String>>` | `env` | `env?: Record<string, string>` | Record \| undefined | YES | |
| 11 | `provided_tools: Vec<Tool>` | `providedTools` | `providedTools: Tool[]` | Tool[] | YES | Non-null Vec; camelCase rename works |
| 12 | `created_at: String` | `createdAt` | `createdAt: string` | string | YES | |
| 13 | `last_used: Option<String>` | `lastUsed` | `lastUsed?: string` | string \| undefined | YES | |
| 14 | `usage_count: u32` | `usageCount` | `usageCount: number` | number | YES | |

**McpServer VERDICT: FULL MATCH. All 14 fields align correctly.**

---

## 4. Tool Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 42-47)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tool {
    pub name: String,
    pub description: String,
}
```

### TypeScript (`src/types/index.ts`, lines 35-38)
```typescript
export interface Tool {
  name: string;
  description: string;
}
```

**Tool VERDICT: FULL MATCH.**

---

## 5. Scene Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 49-60)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,     // -> "skillIds"
    pub mcp_ids: Vec<String>,       // -> "mcpIds"
    pub created_at: String,         // -> "createdAt"
    pub last_used: Option<String>,  // -> "lastUsed"
}
```

### TypeScript (`src/types/index.ts`, lines 40-49)
```typescript
export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}
```

**Scene VERDICT: FULL MATCH. All 8 fields align.**

---

## 6. Project Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 62-70)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub scene_id: String,           // -> "sceneId"
    pub last_synced: Option<String>, // -> "lastSynced"
}
```

### TypeScript (`src/types/index.ts`, lines 51-57)
```typescript
export interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
}
```

**Project VERDICT: FULL MATCH. All 5 fields align.**

---

## 7. AppSettings Struct Comparison

### Rust (`src-tauri/src/types.rs`, lines 120-128)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub skill_source_dir: String,           // -> "skillSourceDir"
    pub mcp_source_dir: String,             // -> "mcpSourceDir"
    pub claude_config_dir: String,          // -> "claudeConfigDir"
    pub anthropic_api_key: Option<String>,  // -> "anthropicApiKey"
    pub auto_classify_new_items: bool,      // -> "autoClassifyNewItems"
}
```

### TypeScript (`src/types/index.ts`, lines 72-78)
```typescript
export interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;           // NOTE: Not optional in TS!
  autoClassifyNewItems: boolean;
}
```

### Potential Issue

| # | Rust Field | Serialized As | TS Field | Match? | Notes |
|---|-----------|--------------|----------|--------|-------|
| 1 | `skill_source_dir: String` | `skillSourceDir` | `skillSourceDir: string` | YES | |
| 2 | `mcp_source_dir: String` | `mcpSourceDir` | `mcpSourceDir: string` | YES | |
| 3 | `claude_config_dir: String` | `claudeConfigDir` | `claudeConfigDir: string` | YES | |
| 4 | `anthropic_api_key: Option<String>` | `anthropicApiKey` | `anthropicApiKey: string` | **MINOR MISMATCH** | Rust has `Option<String>` (can be `null`), but TS declares it as required `string`. If the backend sends `null`, TS code expecting a string could get `null` instead. |
| 5 | `auto_classify_new_items: bool` | `autoClassifyNewItems` | `autoClassifyNewItems: boolean` | YES | |

**AppSettings VERDICT: MINOR MISMATCH on `anthropicApiKey`. Rust sends `null` when no API key is set, but TypeScript expects a non-optional `string`. This is unlikely to cause a white screen on its own unless the Settings page tries to call `.length` or `.trim()` on it without a null check.**

---

## 8. Category / Tag Struct Comparison

Both `Category` and `Tag` structs match their TypeScript counterparts exactly:
- `Category`: id, name, color, count -- all match
- `Tag`: id, name, count -- all match

---

## 9. Vec (Array) Nullability Check

**Question:** Are any `Vec` fields wrapped in `Option<>` that the frontend expects to always be arrays?

| Struct | Rust Field | Rust Type | TS Type | Safe? |
|--------|-----------|-----------|---------|-------|
| Skill | tags | `Vec<String>` | `string[]` | YES - always non-null |
| Skill | allowed_tools | `Option<Vec<String>>` | `string[]?` | YES - TS marks it optional |
| McpServer | tags | `Vec<String>` | `string[]` | YES - always non-null |
| McpServer | args | `Vec<String>` | `string[]` | YES - always non-null |
| McpServer | provided_tools | `Vec<Tool>` | `Tool[]` | YES - always non-null |
| Scene | skill_ids | `Vec<String>` | `string[]` | YES - always non-null |
| Scene | mcp_ids | `Vec<String>` | `string[]` | YES - always non-null |

**All Vec fields that the frontend expects as required arrays are indeed `Vec<T>` (not `Option<Vec<T>>`), so they will always serialize as `[]` at minimum, never as `null`.**

---

## 10. McpConfigFile Intermediate Struct Note

The `McpConfigFile` struct (used when reading MCP JSON config files from disk) has a notable explicit rename:

```rust
#[serde(rename = "providedTools")]
pub provided_tools: Option<Vec<Tool>>,
```

This struct has both `#[serde(rename_all = "camelCase")]` AND an explicit `#[serde(rename = "providedTools")]` on the `provided_tools` field. The explicit rename is redundant (camelCase would already produce `providedTools`), but it ensures correctness. The `Option<Vec<Tool>>` here is safe because `parse_mcp_file()` in `mcps.rs` calls `.unwrap_or_default()` when constructing the `McpServer`, converting `None` to `Vec::new()`:

```rust
provided_tools: config.provided_tools.unwrap_or_default(),
```

This guarantees the final `McpServer.provided_tools` is always a non-null array.

---

## 11. App.tsx Routing Configuration

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Navigate to="/skills" replace />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="skills/:skillId" element={<SkillDetailPage />} />
      <Route path="mcp-servers" element={<McpServersPage />} />
      <Route path="mcp-servers/:id" element={<McpDetailPage />} />
      <Route path="scenes" element={<ScenesPage />} />
      <Route path="scenes/:id" element={<SceneDetailPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:id" element={<ProjectsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

The routing is standard React Router v6, with the default route redirecting to `/skills`. No catch-all or error boundary route is defined (a `*` fallback route is absent), which means navigating to an unknown path would render nothing inside `MainLayout`.

---

## 12. Conclusion

### Field Name Mismatches: NONE

All Rust structs use `#[serde(rename_all = "camelCase")]`, which correctly converts every snake_case field name to camelCase during JSON serialization. The field names the TypeScript frontend expects are an exact match with what the Rust backend produces.

### Could field name mismatch cause the white screen? NO

There is no camelCase vs snake_case mismatch. The serialization layer is correctly configured. If the frontend were receiving `provided_tools` instead of `providedTools`, or `source_path` instead of `sourcePath`, it would cause `undefined` values on the TypeScript side. But this is NOT the case -- the `rename_all` attribute handles this correctly.

### Minor Issues Found (not crash-causing)

1. **`AppSettings.anthropicApiKey`**: Rust type is `Option<String>` but TypeScript declares it as required `string` (not `string?`). The backend default is `None`, which serializes to `null`. If the frontend code accesses this property without a null guard, it could throw. However, this would only affect the Settings page, not the initial app load.

2. **`Skill.scope`**: Rust uses `String` but TypeScript expects `'user' | 'project'` union literal type. The backend currently always sets this to `"user"`. If it ever sent a different string, TypeScript would accept it at runtime (union types are compile-time only), so this is not a runtime risk.

3. **No error boundary route**: The React Router configuration lacks a `*` catch-all route, which could cause a blank render area (though not a full white screen) if the URL path is invalid.

### The white screen cause is NOT a Rust-to-TypeScript field name mismatch.

The investigation should focus on other potential causes such as:
- JavaScript runtime errors in component rendering (uncaught exceptions without error boundaries)
- Tauri command invocation failures (permissions, missing directories)
- State management issues (stores failing to initialize)
- Missing error handling in async data loading
