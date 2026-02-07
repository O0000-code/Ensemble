# MCP Import Detection Bug - Root Cause Analysis & Fix Plan

## Problem Statement
When clicking "Import" for MCPs in Ensemble, only "roam-research" is detected, despite 18 MCPs being configured in `~/.claude.json`.

## Root Cause Analysis

### Root Cause 1: HTTP MCPs Break JSON Parsing (CRITICAL)

**Location:** `src-tauri/src/types.rs:262-266`

```rust
pub struct ClaudeMcpConfig {
    pub command: String,         // ← REQUIRED field
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
}
```

**Problem:** `command: String` is a required field. Two MCPs in `~/.claude.json` are HTTP-type MCPs (`sentry`, `figma`) that have `url` instead of `command`:

```json
"sentry": { "type": "http", "url": "https://mcp.sentry.dev/mcp" }
"figma": { "type": "http", "url": "https://mcp.figma.com/mcp" }
```

When serde tries to deserialize the `mcpServers` HashMap, it fails on these entries because `command` is missing. **This causes the ENTIRE `~/.claude.json` parse to fail silently** (the code uses `if let Ok(...)`).

**Fallback behavior:** The code falls back to reading `~/.claude/settings.json`, which only contains "roam-research". This is why only "roam-research" is detected.

### Root Cause 2: extract_mcp_config Reads Wrong File

**Location:** `src-tauri/src/commands/import.rs:622-673`

```rust
fn extract_mcp_config(item, claude_path, dest_dir) {
    let settings_path = claude_path.join("settings.json");  // ← reads settings.json
    // ... but MCPs are in ~/.claude.json, not ~/.claude/settings.json
}
```

**Problem:** Even if detection were fixed, the import/extraction function reads from `~/.claude/settings.json` instead of `~/.claude.json`. MCPs detected from `.claude.json` can't be properly extracted.

### Root Cause 3: Sync Hardcodes stdio Type

**Location:** `src-tauri/src/commands/config.rs:24-32`

```rust
let mut server_config = json!({
    "type": "stdio",          // ← Hardcoded as stdio
    "command": mcp.command,
    "args": mcp.args,
});
```

**Problem:** When generating project `.mcp.json`, HTTP MCPs would get incorrect `type: "stdio"` and `command: ""` instead of `type: "http"` and `url: "..."`.

## Verification

- `~/.claude.json` line 180-351: 18 MCPs including `sentry` (http) and `figma` (http)
- `~/.claude/settings.json` line 42-51: Only `roam-research`
- `ClaudeMcpConfig.command`: `String` (required, not Option)

## Fix Strategy (Conservative & Minimal)

### Principle: Add `#[serde(default)]` + optional fields. Keep `command: String` everywhere else.

For `ClaudeMcpConfig` (the parsing struct), make `command` have a default (`""`) so HTTP MCPs don't break the parse. Add `url` and `mcp_type` as optional fields to carry HTTP MCP info.

For all downstream types (`DetectedMcp`, `McpConfigFile`, `McpServer`), ADD optional `url` and `mcp_type` fields without changing existing required fields. This ensures backward compatibility.

## Files to Modify

### Backend (Rust)

| File | Change | Risk |
|------|--------|------|
| `src-tauri/src/types.rs` | Add fields to ClaudeMcpConfig, DetectedMcp, McpConfigFile, McpServer | Low - only adding optional fields |
| `src-tauri/src/commands/import.rs` | Fix detection to pass url/type, fix extraction to read .claude.json | Medium - core logic change |
| `src-tauri/src/commands/config.rs` | Handle HTTP MCPs in sync | Low - conditional logic |
| `src-tauri/src/commands/mcps.rs` | Read url/mcp_type from McpConfigFile | Low - pass through fields |

### Frontend (TypeScript)

| File | Change | Risk |
|------|--------|------|
| `src/types/index.ts` | Add url?, mcpType? to DetectedMcp, McpServer | Low - optional fields |
| `src/components/modals/ImportMcpModal.tsx` | Show URL for HTTP MCPs | Low - display only |

## Detailed Changes

### 1. types.rs - ClaudeMcpConfig
```rust
pub struct ClaudeMcpConfig {
    #[serde(default)]                                          // NEW
    pub command: String,                                        // Now defaults to "" when missing
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]          // NEW
    pub url: Option<String>,                                    // NEW
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]  // NEW
    pub mcp_type: Option<String>,                               // NEW
}
```

### 2. types.rs - DetectedMcp
```rust
pub struct DetectedMcp {
    pub name: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
    pub scope: Option<String>,
    pub project_path: Option<String>,
    pub url: Option<String>,        // NEW
    pub mcp_type: Option<String>,   // NEW
}
```

### 3. types.rs - McpConfigFile
```rust
pub struct McpConfigFile {
    pub name: String,
    pub description: Option<String>,
    #[serde(default)]                                          // NEW
    pub command: String,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub provided_tools: Option<Vec<Tool>>,
    #[serde(skip_serializing_if = "Option::is_none")]          // NEW
    pub url: Option<String>,                                    // NEW
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]  // NEW
    pub mcp_type: Option<String>,                               // NEW
    // ... existing plugin fields unchanged
}
```

### 4. types.rs - McpServer
```rust
pub struct McpServer {
    // ... all existing fields unchanged ...
    #[serde(skip_serializing_if = "Option::is_none")]          // NEW
    pub url: Option<String>,                                    // NEW
    #[serde(skip_serializing_if = "Option::is_none")]          // NEW
    pub mcp_type: Option<String>,                               // NEW
}
```

### 5. import.rs - detect_existing_config
In the detection loop, pass url and mcp_type:
```rust
for (name, config) in claude_json.mcp_servers {
    detected_mcps.push(DetectedMcp {
        name,
        command: config.command.clone(),  // "" for HTTP MCPs
        args: config.args.unwrap_or_default(),
        env: config.env,
        scope: Some("user".to_string()),
        project_path: None,
        url: config.url.clone(),         // NEW
        mcp_type: config.mcp_type.clone(), // NEW
    });
}
```

### 6. import.rs - extract_mcp_config (REWRITE)
Change from reading `settings.json` to reading `~/.claude.json`:
```rust
fn extract_mcp_config(item, _claude_path, dest_dir) -> Result<(), String> {
    // Read ~/.claude.json instead of settings.json
    let claude_json = read_claude_json()?;

    // Search in user-scope mcpServers first
    let mcp_config = claude_json.mcp_servers.get(&item.name);

    // If not found, search in project-scope mcpServers
    let mcp_config = mcp_config.or_else(|| {
        claude_json.projects.values()
            .flat_map(|p| p.mcp_servers.get(&item.name))
            .next()
    });

    // Also fallback to settings.json for backward compatibility
    // ... create McpConfigFile with url and mcp_type ...
}
```

### 7. import.rs - update_mcp_scope
When writing HTTP MCPs back to .claude.json:
```rust
let claude_mcp_config = ClaudeMcpConfig {
    command: mcp_config.command.clone(),
    args: mcp_config.args.clone(),
    env: mcp_config.env.clone(),
    url: mcp_config.url.clone(),         // NEW
    mcp_type: mcp_config.mcp_type.clone(), // NEW
};
```

### 8. config.rs - write_mcp_config
Handle HTTP MCPs in sync:
```rust
for mcp in mcp_servers {
    let is_http = mcp.mcp_type.as_deref() == Some("http");
    let server_config = if is_http {
        json!({
            "type": "http",
            "url": mcp.url.as_deref().unwrap_or(""),
        })
    } else {
        // existing stdio logic
        json!({
            "type": "stdio",
            "command": mcp.command,
            "args": mcp.args,
        })
    };
    // ... env handling ...
}
```

### 9. mcps.rs - parse_mcp_file
Pass through url and mcp_type from McpConfigFile to McpServer.

### 10. Frontend types/index.ts
```typescript
export interface DetectedMcp {
    // ... existing fields ...
    url?: string;      // NEW
    mcpType?: string;  // NEW
}

export interface McpServer {
    // ... existing fields ...
    url?: string;      // NEW
    mcpType?: string;  // NEW
}
```

### 11. ImportMcpModal.tsx
For HTTP MCPs, display URL instead of empty command info.

## Testing Checklist
- [ ] Detection: All 18 top-level MCPs + project-level MCPs detected
- [ ] HTTP MCPs (sentry, figma) properly detected with URL
- [ ] stdio MCPs detected with command as before
- [ ] Import: MCPs can be imported to ~/.ensemble/mcps/
- [ ] HTTP MCP config files correctly stored with url and type
- [ ] Existing imported MCPs still load correctly (backward compat)
- [ ] Scope change: HTTP MCPs written correctly to .claude.json
- [ ] Project sync: HTTP MCPs generate correct .mcp.json
- [ ] Display: HTTP MCPs show URL in import modal and detail page
