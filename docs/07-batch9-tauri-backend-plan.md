# 批次 9: Tauri 后端开发 - SubAgent 执行规划

## 批次目标
实现 Tauri Rust 后端的所有核心功能，包括文件扫描、Symlink 操作、配置生成和数据持久化。

---

## 参考文档
- `/docs/reference/01-claude-code-structure.md` - Claude Code 目录结构分析
- `/docs/00-project-understanding.md` - 项目理解文档

---

## 核心功能模块

### 1. 文件系统扫描

#### scan_skills
扫描 Skills 目录，解析 SKILL.md 文件，返回 Skill 列表。

**输入**: `source_dir: String` (如 `~/.ensemble/skills`)
**输出**: `Vec<Skill>`

**SKILL.md 格式**:
```markdown
---
name: skill-name
description: Skill description
allowed-tools: Read, Write, Bash(npm:*)
license: MIT
metadata:
  author: author-name
  version: "1.0.0"
---

# Skill Title
Instructions content...
```

#### scan_mcps
扫描 MCP 配置目录，解析 JSON 文件，返回 McpServer 列表。

**输入**: `source_dir: String` (如 `~/.ensemble/mcps`)
**输出**: `Vec<McpServer>`

**MCP JSON 格式**:
```json
{
  "name": "postgres-mcp",
  "description": "PostgreSQL database operations",
  "command": "node",
  "args": ["/path/to/mcp/index.js"],
  "env": {
    "DATABASE_URL": "..."
  },
  "providedTools": [
    {"name": "query", "description": "Execute SQL"}
  ]
}
```

### 2. Symlink 操作

#### create_symlink
创建符号链接，用于将 Skill 链接到项目目录。

**输入**:
- `source: String` - 源路径 (如 `~/.ensemble/skills/my-skill`)
- `target: String` - 目标路径 (如 `/project/.claude/skills/my-skill`)

**实现**:
```rust
use std::os::unix::fs::symlink;
```

#### remove_symlink
删除符号链接。

**输入**: `path: String` - Symlink 路径

### 3. 配置生成

#### write_mcp_config
生成项目级 MCP 配置文件。

**输入**:
- `project_path: String` - 项目路径
- `mcp_servers: Vec<McpServer>` - 要配置的 MCP 列表

**输出**: 生成 `{project_path}/.claude/settings.local.json` 或更新现有配置

**生成格式**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "...",
      "args": [...],
      "env": {...}
    }
  }
}
```

### 4. 数据持久化

#### read_app_data
读取应用数据（分类、标签、场景、项目配置）。

**存储位置**: `~/.ensemble/data.json`

**数据结构**:
```json
{
  "categories": [...],
  "tags": [...],
  "scenes": [...],
  "projects": [...],
  "skillMetadata": {...},
  "mcpMetadata": {...}
}
```

#### write_app_data
保存应用数据。

### 5. 辅助功能

#### select_folder
打开文件夹选择对话框。

**输出**: `Option<String>` - 选中的文件夹路径

#### get_home_dir
获取用户主目录。

#### expand_path
展开路径中的 `~` 符号。

---

## Rust 数据结构

```rust
// src-tauri/src/types.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,
    pub scope: String, // "user" | "project"
    pub invocation: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub instructions: String,
    pub created_at: String,
    pub last_used: Option<String>,
    pub usage_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServer {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub source_path: String,
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<std::collections::HashMap<String, String>>,
    pub provided_tools: Vec<Tool>,
    pub created_at: String,
    pub last_used: Option<String>,
    pub usage_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tool {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,
    pub mcp_ids: Vec<String>,
    pub created_at: String,
    pub last_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub scene_id: String,
    pub last_synced: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppData {
    pub categories: Vec<Category>,
    pub tags: Vec<Tag>,
    pub scenes: Vec<Scene>,
    pub projects: Vec<Project>,
    pub skill_metadata: std::collections::HashMap<String, SkillMetadata>,
    pub mcp_metadata: std::collections::HashMap<String, McpMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMetadata {
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub usage_count: u32,
    pub last_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpMetadata {
    pub category: String,
    pub tags: Vec<String>,
    pub enabled: bool,
    pub usage_count: u32,
    pub last_used: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub skill_source_dir: String,
    pub mcp_source_dir: String,
    pub claude_config_dir: String,
    pub anthropic_api_key: Option<String>,
    pub auto_classify_new_items: bool,
}
```

---

## 文件结构

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── src/
│   ├── main.rs              # 入口和命令注册
│   ├── lib.rs               # 库入口
│   ├── types.rs             # 数据类型定义
│   ├── commands/
│   │   ├── mod.rs           # 命令模块
│   │   ├── skills.rs        # Skills 相关命令
│   │   ├── mcps.rs          # MCP 相关命令
│   │   ├── symlink.rs       # Symlink 操作
│   │   ├── config.rs        # 配置生成
│   │   └── data.rs          # 数据持久化
│   └── utils/
│       ├── mod.rs           # 工具模块
│       ├── path.rs          # 路径处理
│       └── parser.rs        # SKILL.md 解析
```

---

## 依赖配置

**Cargo.toml 依赖**:
```toml
[dependencies]
tauri = { version = "2", features = ["dialog"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
dirs = "5"
walkdir = "2"
yaml-rust2 = "0.8"
```

---

## SubAgent 任务分配

### SubAgent A: 类型定义和工具模块
创建 `types.rs` 和 `utils/` 模块

### SubAgent B: Skills 扫描命令
实现 `scan_skills` 和 SKILL.md 解析

### SubAgent C: MCP 扫描命令
实现 `scan_mcps`

### SubAgent D: Symlink 和配置生成
实现 `create_symlink`, `remove_symlink`, `write_mcp_config`

### SubAgent E: 数据持久化
实现 `read_app_data`, `write_app_data`, `read_settings`, `write_settings`

### SubAgent F: 主程序集成
更新 `main.rs`, 注册所有命令，配置 Tauri

---

## 命令注册示例

```rust
// main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::skills::scan_skills,
            commands::mcps::scan_mcps,
            commands::symlink::create_symlink,
            commands::symlink::remove_symlink,
            commands::config::write_mcp_config,
            commands::config::sync_project_config,
            commands::data::read_app_data,
            commands::data::write_app_data,
            commands::data::read_settings,
            commands::data::write_settings,
            commands::dialog::select_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 前端调用示例

```typescript
import { invoke } from '@tauri-apps/api/core';

// 扫描 Skills
const skills = await invoke<Skill[]>('scan_skills', {
  sourceDir: '~/.ensemble/skills'
});

// 创建 Symlink
await invoke('create_symlink', {
  source: '~/.ensemble/skills/my-skill',
  target: '/project/.claude/skills/my-skill'
});

// 同步项目配置
await invoke('sync_project_config', {
  projectPath: '/project',
  skillIds: ['skill-1', 'skill-2'],
  mcpIds: ['mcp-1']
});
```
