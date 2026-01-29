# White Screen Root Cause Analysis

## Issue Summary

When clicking on a Skill or MCP item from the list page, the app shows a white screen instead of the detail view.

## Root Cause

**The skill/MCP IDs are file paths containing forward slashes, which are not URL-encoded when navigating.**

### How IDs are generated (Rust backend)

In `src-tauri/src/commands/skills.rs` (line 108):
```rust
let id = skill_dir.to_string_lossy().to_string();
```

This generates IDs like: `/Users/bo/.ensemble/skills/test-skill`

In `src-tauri/src/commands/mcps.rs` (line 95):
```rust
let id = file_path.to_string_lossy().to_string();
```

This generates IDs like: `/Users/bo/.ensemble/mcps/test-mcp.json`

### How navigation happens (React frontend)

In `src/pages/SkillsPage.tsx` (line 36):
```typescript
navigate(`/skills/${skillId}`);
```

In `src/pages/McpServersPage.tsx` (line 36):
```typescript
navigate(`/mcp-servers/${id}`);
```

### The Problem

When a user clicks a skill with ID `/Users/bo/.ensemble/skills/test-skill`:

1. The code calls `navigate('/skills//Users/bo/.ensemble/skills/test-skill')`
2. React Router interprets this as: `/skills/` + `/Users` + `/bo` + `/.ensemble` + `/skills` + `/test-skill`
3. The `:skillId` param only captures the first segment: `Users` (without leading slash)
4. `selectSkill('Users')` is called, which doesn't match any skill
5. `getSelectedSkill()` returns `undefined`
6. The detail content renders with `undefined` data, causing a white screen or crash

### Why the ErrorBoundary doesn't catch it

The code in `SkillDetailPage.tsx` has conditional rendering:
```typescript
const detailContent = selectedSkill && (
  // ... detail JSX
);
```

When `selectedSkill` is `undefined`, `detailContent` is `false` (not JSX).

The `ListDetailLayout` then shows the `emptyDetail` state because `hasDetail` is false:
```typescript
const hasDetail = detailHeader || detailContent;
```

But wait - `detailHeader` also checks `selectedSkill && (...)`, so both are falsy.

The result is an empty detail panel, but the LIST panel still tries to render. The issue is that when React Router misparses the URL, the entire app's routing state may become inconsistent.

## Data Format Comparison

### Real Claude Code SKILL.md format
```yaml
---
name: codex-skill
description: Use when user asks to leverage codex...
allowed-tools: Read, Write, Glob, Grep, Task, Bash(cat:*)
---

# Codex

You are operating in **codex exec**...
```

### Test SKILL.md format
```yaml
---
name: test-skill
description: A test skill for development
allowed-tools: Read, Write, Bash
license: MIT
metadata:
  author: Test Author
  version: "1.0.0"
---

# Test Skill
...
```

Both formats are valid - the Rust parser handles both correctly.

### Test MCP JSON format
```json
{
  "name": "test-mcp",
  "description": "A test MCP server for development",
  "command": "node",
  "args": ["/path/to/mcp/index.js"],
  "env": {
    "TEST_VAR": "test_value"
  },
  "providedTools": [
    {
      "name": "test_tool",
      "description": "A test tool"
    }
  ]
}
```

### What Rust returns (types.rs)
```rust
pub struct Skill {
    pub id: String,              // Full file path
    pub name: String,            // From frontmatter or folder name
    pub description: String,     // From frontmatter
    pub category: String,        // From metadata or empty
    pub tags: Vec<String>,       // From metadata or empty
    pub enabled: bool,           // From metadata or true
    pub source_path: String,     // Full file path
    pub scope: String,           // "user"
    pub invocation: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub instructions: String,
    pub created_at: String,
    pub last_used: Option<String>,
    pub usage_count: u32,
}
```

### What TypeScript expects (types/index.ts)
```typescript
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;  // camelCase (Rust uses rename_all = "camelCase")
  scope: 'user' | 'project';  // More restrictive type
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}
```

The types match correctly due to `#[serde(rename_all = "camelCase")]` in Rust.

## The Fix

### Option 1: URL-encode the IDs (Recommended)

Modify navigation to encode the ID:
```typescript
// In SkillsPage.tsx
navigate(`/skills/${encodeURIComponent(skillId)}`);

// In SkillDetailPage.tsx - decode the param
const { skillId: encodedSkillId } = useParams<{ skillId: string }>();
const skillId = encodedSkillId ? decodeURIComponent(encodedSkillId) : null;
```

Same for MCPs.

### Option 2: Use a different ID scheme

Instead of using file paths as IDs, generate a URL-safe ID:
- Hash of the path
- Just the skill name (if unique)
- UUID generated on first scan

This would require changes to the Rust backend and metadata storage.

### Option 3: Use query parameters

```typescript
navigate(`/skills?id=${encodeURIComponent(skillId)}`);
```

Then read from `useSearchParams()` instead of `useParams()`.

## Recommended Fix

**Option 1 is the simplest and least invasive.**

Files to modify:
1. `src/pages/SkillsPage.tsx` - encode on navigate
2. `src/pages/SkillDetailPage.tsx` - decode on receive
3. `src/pages/McpServersPage.tsx` - encode on navigate
4. `src/pages/McpDetailPage.tsx` - decode on receive

## Fix Applied

The fix (Option 1: URL-encode the IDs) has been implemented in:

1. `src/pages/SkillsPage.tsx` - Added `encodeURIComponent()` on navigate
2. `src/pages/SkillDetailPage.tsx` - Added `decodeURIComponent()` on receive, `encodeURIComponent()` on navigate
3. `src/pages/McpServersPage.tsx` - Added `encodeURIComponent()` on navigate
4. `src/pages/McpDetailPage.tsx` - Added `decodeURIComponent()` on receive, `encodeURIComponent()` on navigate

## Verification Steps

1. Start the app with `npm run tauri dev`
2. Navigate to Skills page
3. Click on a skill item
4. Verify detail page loads correctly
5. Check browser URL shows encoded path (e.g., `/skills/%2FUsers%2Fbo%2F...`)
6. Refresh page - verify skill is still selected
7. Repeat for MCPs

## Related Files

- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/commands/skills.rs`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/commands/mcps.rs`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/types.rs`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/types/index.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillDetailPage.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpDetailPage.tsx`
