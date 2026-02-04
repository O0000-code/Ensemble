# Claude.md 功能数据模型设计

> 创建时间: 2026-02-04
> 创建者: SubAgent A3 (数据模型设计)
> 状态: 完成

---

## 一、概述

本文档定义 Claude.md 功能的完整数据模型，包括：
1. TypeScript 类型定义
2. Rust 数据结构
3. Rust 命令接口
4. Store 设计
5. 数据存储结构

所有代码可直接复制使用。

---

## 二、TypeScript 类型定义

### 2.1 基础类型

```typescript
// src/types/claudeMd.ts

/**
 * CLAUDE.md 文件类型
 * - global: 用户级全局 (~/.claude/CLAUDE.md)
 * - project: 项目级 (./CLAUDE.md 或 ./.claude/CLAUDE.md)
 * - local: 本地级 (./CLAUDE.local.md)
 */
export type ClaudeMdType = 'global' | 'project' | 'local';

/**
 * CLAUDE.md 分发目标路径
 */
export type ClaudeMdDistributionPath =
  | '.claude/CLAUDE.md'   // 默认
  | 'CLAUDE.md'
  | 'CLAUDE.local.md';

/**
 * 冲突解决策略
 */
export type ClaudeMdConflictResolution =
  | 'overwrite'   // 覆盖
  | 'backup'      // 备份后覆盖
  | 'skip';       // 跳过

/**
 * CLAUDE.md 文件信息
 * 存储在 ~/.ensemble/claude-md/ 中的被管理文件
 */
export interface ClaudeMdFile {
  /** 唯一标识 (UUID) */
  id: string;

  /** 显示名称 (用户可编辑) */
  name: string;

  /** 描述 (用户可编辑) */
  description: string;

  /** 原始来源路径 (扫描时的路径) */
  sourcePath: string;

  /** 原始来源类型 */
  sourceType: ClaudeMdType;

  /** 文件内容 */
  content: string;

  /** 是否设为全局 */
  isGlobal: boolean;

  /** 分类 ID */
  categoryId?: string;

  /** 标签 ID 列表 */
  tagIds: string[];

  /** 创建时间 (ISO 8601) */
  createdAt: string;

  /** 更新时间 (ISO 8601) */
  updatedAt: string;

  /** 字节大小 */
  size: number;

  /** 自定义图标名称 */
  icon?: string;
}

/**
 * 扫描结果项
 * 扫描时发现的 CLAUDE.md 文件
 */
export interface ClaudeMdScanItem {
  /** 文件路径 */
  path: string;

  /** 文件类型 */
  type: ClaudeMdType;

  /** 文件大小 (字节) */
  size: number;

  /** 最后修改时间 (ISO 8601) */
  modifiedAt: string;

  /** 是否已导入 (在 Ensemble 管理中) */
  isImported: boolean;

  /** 如果已导入，对应的 ClaudeMdFile ID */
  importedId?: string;

  /** 内容预览 (前 500 字符) */
  preview?: string;

  /** 所属项目名称 (从路径推断) */
  projectName?: string;
}

/**
 * 扫描结果
 */
export interface ClaudeMdScanResult {
  /** 扫描到的文件列表 */
  items: ClaudeMdScanItem[];

  /** 扫描的目录数量 */
  scannedDirs: number;

  /** 扫描耗时 (毫秒) */
  duration: number;

  /** 错误信息 (如果有) */
  errors: string[];
}

/**
 * 导入选项
 */
export interface ClaudeMdImportOptions {
  /** 源文件路径 */
  sourcePath: string;

  /** 自定义名称 (可选，默认从文件名/路径推断) */
  name?: string;

  /** 自定义描述 (可选) */
  description?: string;

  /** 分类 ID (可选) */
  categoryId?: string;

  /** 标签 ID 列表 (可选) */
  tagIds?: string[];
}

/**
 * 导入结果
 */
export interface ClaudeMdImportResult {
  /** 是否成功 */
  success: boolean;

  /** 导入的文件 (成功时) */
  file?: ClaudeMdFile;

  /** 错误信息 (失败时) */
  error?: string;
}

/**
 * 分发选项
 */
export interface ClaudeMdDistributionOptions {
  /** 要分发的 ClaudeMdFile ID */
  claudeMdId: string;

  /** 目标项目路径 */
  projectPath: string;

  /** 目标文件路径 (相对于项目根目录) */
  targetPath: ClaudeMdDistributionPath;

  /** 冲突解决策略 */
  conflictResolution: ClaudeMdConflictResolution;
}

/**
 * 分发结果
 */
export interface ClaudeMdDistributionResult {
  /** 是否成功 */
  success: boolean;

  /** 目标文件完整路径 */
  targetPath: string;

  /** 执行的操作 */
  action: 'created' | 'overwritten' | 'backed_up' | 'skipped';

  /** 备份路径 (如果有备份) */
  backupPath?: string;

  /** 错误信息 (失败时) */
  error?: string;
}

/**
 * 设置全局结果
 */
export interface SetGlobalResult {
  /** 是否成功 */
  success: boolean;

  /** 之前的全局文件 ID (如果有) */
  previousGlobalId?: string;

  /** 原有 ~/.claude/CLAUDE.md 的备份路径 (如果需要备份) */
  backupPath?: string;

  /** 错误信息 (失败时) */
  error?: string;
}
```

### 2.2 Scene 扩展

```typescript
// src/types/index.ts - Scene 接口扩展

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;

  // ========== 新增字段 ==========
  /** 关联的 CLAUDE.md 文件 ID 列表 (排除 isGlobal=true 的) */
  claudeMdIds: string[];
}
```

### 2.3 Settings 扩展

```typescript
// src/types/index.ts - AppSettings 接口扩展

export interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;
  autoClassifyNewItems: boolean;
  terminalApp: string;
  claudeCommand: string;
  hasCompletedImport: boolean;
  warpOpenMode: 'tab' | 'window';

  // ========== 新增字段 ==========
  /** CLAUDE.md 分发目标路径 */
  claudeMdDistributionPath: ClaudeMdDistributionPath;
}
```

### 2.4 AppData 扩展

```typescript
// src/types/index.ts - AppData 接口扩展

export interface AppData {
  skills: Skill[];
  mcpServers: McpServer[];
  scenes: Scene[];
  projects: Project[];
  categories: Category[];
  tags: Tag[];
  settings: AppSettings;
  importedPluginSkills?: string[];
  importedPluginMcps?: string[];

  // ========== 新增字段 ==========
  /** 被管理的 CLAUDE.md 文件列表 */
  claudeMdFiles: ClaudeMdFile[];

  /** 当前全局 CLAUDE.md 文件 ID */
  globalClaudeMdId?: string;
}
```

### 2.5 类型导出

```typescript
// src/types/index.ts - 添加导出

export * from './claudeMd';
```

---

## 三、Rust 数据结构

### 3.1 基础类型

```rust
// src-tauri/src/types.rs - 新增类型

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// CLAUDE.md 相关类型
// ============================================================================

/// CLAUDE.md 文件类型
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMdType {
    Global,
    Project,
    Local,
}

impl ClaudeMdType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClaudeMdType::Global => "global",
            ClaudeMdType::Project => "project",
            ClaudeMdType::Local => "local",
        }
    }
}

/// CLAUDE.md 分发目标路径
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ClaudeMdDistributionPath {
    #[serde(rename = ".claude/CLAUDE.md")]
    ClaudeDir,
    #[serde(rename = "CLAUDE.md")]
    Root,
    #[serde(rename = "CLAUDE.local.md")]
    Local,
}

impl Default for ClaudeMdDistributionPath {
    fn default() -> Self {
        ClaudeMdDistributionPath::ClaudeDir
    }
}

impl ClaudeMdDistributionPath {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClaudeMdDistributionPath::ClaudeDir => ".claude/CLAUDE.md",
            ClaudeMdDistributionPath::Root => "CLAUDE.md",
            ClaudeMdDistributionPath::Local => "CLAUDE.local.md",
        }
    }
}

/// 冲突解决策略
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMdConflictResolution {
    Overwrite,
    Backup,
    Skip,
}

impl Default for ClaudeMdConflictResolution {
    fn default() -> Self {
        ClaudeMdConflictResolution::Backup
    }
}

/// CLAUDE.md 文件信息 (被管理的文件)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdFile {
    /// 唯一标识 (UUID)
    pub id: String,

    /// 显示名称
    pub name: String,

    /// 描述
    pub description: String,

    /// 原始来源路径
    pub source_path: String,

    /// 原始来源类型
    pub source_type: ClaudeMdType,

    /// 文件内容
    pub content: String,

    /// 是否设为全局
    pub is_global: bool,

    /// 分类 ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,

    /// 标签 ID 列表
    #[serde(default)]
    pub tag_ids: Vec<String>,

    /// 创建时间 (ISO 8601)
    pub created_at: String,

    /// 更新时间 (ISO 8601)
    pub updated_at: String,

    /// 字节大小
    pub size: u64,

    /// 自定义图标名称
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}

/// 扫描结果项
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdScanItem {
    /// 文件路径
    pub path: String,

    /// 文件类型
    #[serde(rename = "type")]
    pub file_type: ClaudeMdType,

    /// 文件大小 (字节)
    pub size: u64,

    /// 最后修改时间 (ISO 8601)
    pub modified_at: String,

    /// 是否已导入
    pub is_imported: bool,

    /// 对应的 ClaudeMdFile ID (如果已导入)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub imported_id: Option<String>,

    /// 内容预览 (前 500 字符)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub preview: Option<String>,

    /// 所属项目名称
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project_name: Option<String>,
}

/// 扫描结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdScanResult {
    /// 扫描到的文件列表
    pub items: Vec<ClaudeMdScanItem>,

    /// 扫描的目录数量
    pub scanned_dirs: u32,

    /// 扫描耗时 (毫秒)
    pub duration: u64,

    /// 错误信息
    #[serde(default)]
    pub errors: Vec<String>,
}

/// 导入选项
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdImportOptions {
    /// 源文件路径
    pub source_path: String,

    /// 自定义名称
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,

    /// 自定义描述
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    /// 分类 ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,

    /// 标签 ID 列表
    #[serde(default)]
    pub tag_ids: Vec<String>,
}

/// 导入结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdImportResult {
    /// 是否成功
    pub success: bool,

    /// 导入的文件
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<ClaudeMdFile>,

    /// 错误信息
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// 分发选项
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdDistributionOptions {
    /// 要分发的 ClaudeMdFile ID
    pub claude_md_id: String,

    /// 目标项目路径
    pub project_path: String,

    /// 目标文件路径
    pub target_path: ClaudeMdDistributionPath,

    /// 冲突解决策略
    #[serde(default)]
    pub conflict_resolution: ClaudeMdConflictResolution,
}

/// 分发结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdDistributionResult {
    /// 是否成功
    pub success: bool,

    /// 目标文件完整路径
    pub target_path: String,

    /// 执行的操作
    pub action: String, // "created" | "overwritten" | "backed_up" | "skipped"

    /// 备份路径
    #[serde(skip_serializing_if = "Option::is_none")]
    pub backup_path: Option<String>,

    /// 错误信息
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

/// 设置全局结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetGlobalResult {
    /// 是否成功
    pub success: bool,

    /// 之前的全局文件 ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub previous_global_id: Option<String>,

    /// 备份路径
    #[serde(skip_serializing_if = "Option::is_none")]
    pub backup_path: Option<String>,

    /// 错误信息
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}
```

### 3.2 Scene 结构扩展

```rust
// src-tauri/src/types.rs - Scene 结构修改

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,
    pub mcp_ids: Vec<String>,
    pub created_at: String,
    pub last_used: Option<String>,

    // ========== 新增字段 ==========
    /// 关联的 CLAUDE.md 文件 ID 列表
    #[serde(default)]
    pub claude_md_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedScene {
    pub id: String,
    pub name: String,
    pub description: String,
    pub icon: String,
    pub skill_ids: Vec<String>,
    pub mcp_ids: Vec<String>,
    pub created_at: String,
    pub last_used: Option<String>,
    pub deleted_at: String,

    // ========== 新增字段 ==========
    #[serde(default)]
    pub claude_md_ids: Vec<String>,
}
```

### 3.3 AppData 结构扩展

```rust
// src-tauri/src/types.rs - AppData 结构修改

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub categories: Vec<Category>,
    pub tags: Vec<Tag>,
    pub scenes: Vec<Scene>,
    pub projects: Vec<Project>,
    pub skill_metadata: HashMap<String, SkillMetadata>,
    pub mcp_metadata: HashMap<String, McpMetadata>,
    #[serde(default)]
    pub trashed_scenes: Vec<TrashedScene>,
    #[serde(default)]
    pub trashed_projects: Vec<TrashedProject>,
    #[serde(default)]
    pub imported_plugin_skills: Vec<String>,
    #[serde(default)]
    pub imported_plugin_mcps: Vec<String>,

    // ========== 新增字段 ==========
    /// 被管理的 CLAUDE.md 文件列表
    #[serde(default)]
    pub claude_md_files: Vec<ClaudeMdFile>,

    /// 当前全局 CLAUDE.md 文件 ID
    #[serde(skip_serializing_if = "Option::is_none")]
    pub global_claude_md_id: Option<String>,
}
```

### 3.4 AppSettings 结构扩展

```rust
// src-tauri/src/types.rs - AppSettings 结构修改

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub skill_source_dir: String,
    pub mcp_source_dir: String,
    pub claude_config_dir: String,
    pub anthropic_api_key: Option<String>,
    pub auto_classify_new_items: bool,
    pub terminal_app: String,
    pub claude_command: String,
    #[serde(default = "default_warp_open_mode")]
    pub warp_open_mode: String,
    pub has_completed_import: bool,

    // ========== 新增字段 ==========
    /// CLAUDE.md 分发目标路径
    #[serde(default)]
    pub claude_md_distribution_path: ClaudeMdDistributionPath,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            skill_source_dir: "~/.ensemble/skills".to_string(),
            mcp_source_dir: "~/.ensemble/mcps".to_string(),
            claude_config_dir: "~/.claude".to_string(),
            anthropic_api_key: None,
            auto_classify_new_items: false,
            terminal_app: "Terminal".to_string(),
            claude_command: "claude".to_string(),
            warp_open_mode: "window".to_string(),
            has_completed_import: false,
            claude_md_distribution_path: ClaudeMdDistributionPath::default(),
        }
    }
}
```

---

## 四、Rust 命令接口

### 4.1 命令文件结构

```rust
// src-tauri/src/commands/claude_md.rs

use crate::types::{
    AppData, ClaudeMdFile, ClaudeMdType, ClaudeMdScanItem, ClaudeMdScanResult,
    ClaudeMdImportOptions, ClaudeMdImportResult, ClaudeMdDistributionOptions,
    ClaudeMdDistributionResult, ClaudeMdConflictResolution, SetGlobalResult,
};
use crate::utils::{expand_path, get_app_data_dir, get_data_file_path};
use crate::commands::data::{read_app_data, write_app_data};
use chrono::Utc;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::Instant;
use uuid::Uuid;
use walkdir::WalkDir;

// ============================================================================
// 常量定义
// ============================================================================

/// CLAUDE.md 存储目录 (~/.ensemble/claude-md/)
fn get_claude_md_dir() -> PathBuf {
    get_app_data_dir().join("claude-md")
}

/// 全局备份目录 (~/.ensemble/claude-md/global-backup/)
fn get_global_backup_dir() -> PathBuf {
    get_claude_md_dir().join("global-backup")
}

/// 排除的目录名
const EXCLUDED_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    ".svn",
    ".hg",
    "target",
    "build",
    "dist",
    ".cache",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
];

/// 最大扫描深度
const MAX_SCAN_DEPTH: usize = 10;

/// 预览字符数
const PREVIEW_LENGTH: usize = 500;

// ============================================================================
// 扫描命令
// ============================================================================

/// 扫描系统中的 CLAUDE.md 文件
///
/// # Arguments
/// * `scan_paths` - 要扫描的路径列表 (可选，默认扫描 HOME 目录)
/// * `include_home` - 是否包含 ~/Documents, ~/Projects 等常用目录
///
/// # Returns
/// * `ClaudeMdScanResult` - 扫描结果
#[tauri::command]
pub fn scan_claude_md_files(
    scan_paths: Option<Vec<String>>,
    include_home: Option<bool>,
) -> Result<ClaudeMdScanResult, String> {
    let start = Instant::now();
    let mut items: Vec<ClaudeMdScanItem> = Vec::new();
    let mut errors: Vec<String> = Vec::new();
    let mut scanned_dirs: u32 = 0;

    // 读取已导入的文件列表
    let app_data = read_app_data().unwrap_or_default();
    let imported_paths: Vec<String> = app_data.claude_md_files
        .iter()
        .map(|f| f.source_path.clone())
        .collect();

    // 确定要扫描的路径
    let mut paths_to_scan: Vec<PathBuf> = Vec::new();

    // 1. 用户级全局: ~/.claude/CLAUDE.md
    let home = dirs::home_dir().ok_or("Cannot get home directory")?;
    let user_claude_md = home.join(".claude").join("CLAUDE.md");
    if user_claude_md.exists() {
        if let Some(item) = scan_single_file(&user_claude_md, ClaudeMdType::Global, &imported_paths, &app_data) {
            items.push(item);
        }
    }

    // 2. 自定义路径
    if let Some(custom_paths) = scan_paths {
        for path_str in custom_paths {
            let path = expand_path(&path_str);
            if path.exists() && path.is_dir() {
                paths_to_scan.push(path);
            }
        }
    }

    // 3. 默认扫描路径
    if include_home.unwrap_or(true) {
        let default_dirs = vec![
            home.join("Documents"),
            home.join("Projects"),
            home.join("Developer"),
            home.join("Code"),
            home.join("Workspace"),
            home.join("repos"),
        ];
        for dir in default_dirs {
            if dir.exists() && dir.is_dir() {
                paths_to_scan.push(dir);
            }
        }
    }

    // 扫描所有路径
    for base_path in paths_to_scan {
        match scan_directory(&base_path, &imported_paths, &app_data, &mut scanned_dirs) {
            Ok(mut found_items) => items.append(&mut found_items),
            Err(e) => errors.push(format!("{}: {}", base_path.display(), e)),
        }
    }

    // 去重 (基于路径)
    items.sort_by(|a, b| a.path.cmp(&b.path));
    items.dedup_by(|a, b| a.path == b.path);

    let duration = start.elapsed().as_millis() as u64;

    Ok(ClaudeMdScanResult {
        items,
        scanned_dirs,
        duration,
        errors,
    })
}

/// 扫描单个目录
fn scan_directory(
    base_path: &Path,
    imported_paths: &[String],
    app_data: &AppData,
    scanned_dirs: &mut u32,
) -> Result<Vec<ClaudeMdScanItem>, String> {
    let mut items: Vec<ClaudeMdScanItem> = Vec::new();

    for entry in WalkDir::new(base_path)
        .max_depth(MAX_SCAN_DEPTH)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| !is_excluded_dir(e))
    {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };

        if entry.file_type().is_dir() {
            *scanned_dirs += 1;
        }

        let path = entry.path();
        let file_name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n,
            None => continue,
        };

        // 检查是否是 CLAUDE.md 文件
        let file_type = match file_name {
            "CLAUDE.md" => {
                // 区分 ./.claude/CLAUDE.md 和 ./CLAUDE.md
                if path.parent().and_then(|p| p.file_name()).map(|n| n == ".claude").unwrap_or(false) {
                    ClaudeMdType::Project
                } else {
                    ClaudeMdType::Project
                }
            }
            "CLAUDE.local.md" => ClaudeMdType::Local,
            _ => continue,
        };

        if let Some(item) = scan_single_file(path, file_type, imported_paths, app_data) {
            items.push(item);
        }
    }

    Ok(items)
}

/// 扫描单个文件
fn scan_single_file(
    path: &Path,
    file_type: ClaudeMdType,
    imported_paths: &[String],
    app_data: &AppData,
) -> Option<ClaudeMdScanItem> {
    let path_str = path.to_string_lossy().to_string();

    let metadata = path.metadata().ok()?;
    let size = metadata.len();
    let modified_at = metadata.modified().ok()
        .map(|t| chrono::DateTime::<Utc>::from(t).to_rfc3339())
        .unwrap_or_default();

    // 检查是否已导入
    let is_imported = imported_paths.contains(&path_str);
    let imported_id = if is_imported {
        app_data.claude_md_files
            .iter()
            .find(|f| f.source_path == path_str)
            .map(|f| f.id.clone())
    } else {
        None
    };

    // 读取预览内容
    let preview = fs::read_to_string(path).ok().map(|content| {
        if content.len() > PREVIEW_LENGTH {
            format!("{}...", &content[..PREVIEW_LENGTH])
        } else {
            content
        }
    });

    // 推断项目名称
    let project_name = path.parent()
        .and_then(|p| {
            // 如果父目录是 .claude，取父父目录名
            if p.file_name().map(|n| n == ".claude").unwrap_or(false) {
                p.parent().and_then(|pp| pp.file_name())
            } else {
                p.file_name()
            }
        })
        .and_then(|n| n.to_str())
        .map(|s| s.to_string());

    Some(ClaudeMdScanItem {
        path: path_str,
        file_type,
        size,
        modified_at,
        is_imported,
        imported_id,
        preview,
        project_name,
    })
}

/// 判断是否是排除的目录
fn is_excluded_dir(entry: &walkdir::DirEntry) -> bool {
    entry.file_type().is_dir() &&
    entry.file_name().to_str()
        .map(|name| EXCLUDED_DIRS.contains(&name) || name.starts_with('.'))
        .unwrap_or(false)
}

// ============================================================================
// 导入命令
// ============================================================================

/// 导入 CLAUDE.md 文件到 Ensemble 管理
///
/// # Arguments
/// * `options` - 导入选项
///
/// # Returns
/// * `ClaudeMdImportResult` - 导入结果
#[tauri::command]
pub fn import_claude_md(options: ClaudeMdImportOptions) -> Result<ClaudeMdImportResult, String> {
    let source_path = expand_path(&options.source_path);

    // 验证源文件存在
    if !source_path.exists() {
        return Ok(ClaudeMdImportResult {
            success: false,
            file: None,
            error: Some(format!("Source file not found: {}", source_path.display())),
        });
    }

    // 读取文件内容
    let content = fs::read_to_string(&source_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let size = source_path.metadata()
        .map(|m| m.len())
        .unwrap_or(0);

    // 推断文件类型
    let source_type = infer_claude_md_type(&source_path);

    // 生成名称
    let name = options.name.unwrap_or_else(|| {
        infer_name_from_path(&source_path)
    });

    // 创建 ClaudeMdFile
    let now = Utc::now().to_rfc3339();
    let file = ClaudeMdFile {
        id: Uuid::new_v4().to_string(),
        name,
        description: options.description.unwrap_or_default(),
        source_path: source_path.to_string_lossy().to_string(),
        source_type,
        content,
        is_global: false,
        category_id: options.category_id,
        tag_ids: options.tag_ids,
        created_at: now.clone(),
        updated_at: now,
        size,
        icon: None,
    };

    // 保存到 AppData
    let mut app_data = read_app_data()?;
    app_data.claude_md_files.push(file.clone());
    write_app_data(app_data)?;

    Ok(ClaudeMdImportResult {
        success: true,
        file: Some(file),
        error: None,
    })
}

/// 推断文件类型
fn infer_claude_md_type(path: &Path) -> ClaudeMdType {
    let file_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");

    if file_name == "CLAUDE.local.md" {
        ClaudeMdType::Local
    } else if path.to_string_lossy().contains("/.claude/") {
        if path.to_string_lossy().starts_with(&dirs::home_dir().unwrap().to_string_lossy().to_string()) {
            let home_claude = dirs::home_dir().unwrap().join(".claude").join("CLAUDE.md");
            if path == home_claude {
                ClaudeMdType::Global
            } else {
                ClaudeMdType::Project
            }
        } else {
            ClaudeMdType::Project
        }
    } else {
        ClaudeMdType::Project
    }
}

/// 从路径推断名称
fn infer_name_from_path(path: &Path) -> String {
    // 尝试获取项目名称
    path.parent()
        .and_then(|p| {
            if p.file_name().map(|n| n == ".claude").unwrap_or(false) {
                p.parent().and_then(|pp| pp.file_name())
            } else {
                p.file_name()
            }
        })
        .and_then(|n| n.to_str())
        .map(|s| format!("{} CLAUDE.md", s))
        .unwrap_or_else(|| "Imported CLAUDE.md".to_string())
}

// ============================================================================
// 读写命令
// ============================================================================

/// 读取 CLAUDE.md 内容
///
/// # Arguments
/// * `id` - ClaudeMdFile ID
///
/// # Returns
/// * `ClaudeMdFile` - 文件信息和内容
#[tauri::command]
pub fn read_claude_md(id: String) -> Result<ClaudeMdFile, String> {
    let app_data = read_app_data()?;

    app_data.claude_md_files
        .into_iter()
        .find(|f| f.id == id)
        .ok_or_else(|| format!("CLAUDE.md file not found: {}", id))
}

/// 获取所有 CLAUDE.md 文件
#[tauri::command]
pub fn get_claude_md_files() -> Result<Vec<ClaudeMdFile>, String> {
    let app_data = read_app_data()?;
    Ok(app_data.claude_md_files)
}

/// 更新 CLAUDE.md 内容
///
/// # Arguments
/// * `id` - ClaudeMdFile ID
/// * `content` - 新内容 (可选)
/// * `name` - 新名称 (可选)
/// * `description` - 新描述 (可选)
/// * `category_id` - 新分类 (可选)
/// * `tag_ids` - 新标签列表 (可选)
/// * `icon` - 新图标 (可选)
#[tauri::command]
pub fn update_claude_md(
    id: String,
    content: Option<String>,
    name: Option<String>,
    description: Option<String>,
    category_id: Option<String>,
    tag_ids: Option<Vec<String>>,
    icon: Option<String>,
) -> Result<ClaudeMdFile, String> {
    let mut app_data = read_app_data()?;

    let file = app_data.claude_md_files
        .iter_mut()
        .find(|f| f.id == id)
        .ok_or_else(|| format!("CLAUDE.md file not found: {}", id))?;

    // 更新字段
    if let Some(c) = content {
        file.content = c.clone();
        file.size = c.len() as u64;
    }
    if let Some(n) = name {
        file.name = n;
    }
    if let Some(d) = description {
        file.description = d;
    }
    if let Some(cid) = category_id {
        file.category_id = Some(cid);
    }
    if let Some(tids) = tag_ids {
        file.tag_ids = tids;
    }
    if let Some(i) = icon {
        file.icon = Some(i);
    }

    file.updated_at = Utc::now().to_rfc3339();

    let updated_file = file.clone();
    write_app_data(app_data)?;

    Ok(updated_file)
}

/// 删除 CLAUDE.md 文件 (从管理中移除)
#[tauri::command]
pub fn delete_claude_md(id: String) -> Result<(), String> {
    let mut app_data = read_app_data()?;

    // 检查是否是当前全局
    if app_data.global_claude_md_id.as_ref() == Some(&id) {
        return Err("Cannot delete the current global CLAUDE.md. Please unset it first.".to_string());
    }

    // 从 Scene 引用中移除
    for scene in app_data.scenes.iter_mut() {
        scene.claude_md_ids.retain(|cid| cid != &id);
    }

    // 删除文件
    app_data.claude_md_files.retain(|f| f.id != id);

    write_app_data(app_data)?;
    Ok(())
}

// ============================================================================
// 全局设置命令
// ============================================================================

/// 设置某个 CLAUDE.md 为全局
///
/// 流程：
/// 1. 读取当前 ~/.claude/CLAUDE.md
/// 2. 如果存在且非当前管理的文件，备份到 ~/.ensemble/claude-md/global-backup/
/// 3. 取消之前全局文件的 isGlobal 标记
/// 4. 将新文件内容复制到 ~/.claude/CLAUDE.md
/// 5. 设置新文件的 isGlobal 为 true
///
/// # Arguments
/// * `id` - 要设为全局的 ClaudeMdFile ID
#[tauri::command]
pub fn set_global_claude_md(id: String) -> Result<SetGlobalResult, String> {
    let mut app_data = read_app_data()?;

    // 找到目标文件
    let target_file = app_data.claude_md_files
        .iter()
        .find(|f| f.id == id)
        .ok_or_else(|| format!("CLAUDE.md file not found: {}", id))?
        .clone();

    // 全局文件路径
    let home = dirs::home_dir().ok_or("Cannot get home directory")?;
    let global_path = home.join(".claude").join("CLAUDE.md");

    let mut backup_path: Option<String> = None;
    let previous_global_id = app_data.global_claude_md_id.clone();

    // 如果存在全局文件，需要备份
    if global_path.exists() {
        // 检查是否是我们管理的文件
        let is_managed = app_data.claude_md_files
            .iter()
            .any(|f| f.is_global);

        if !is_managed {
            // 不是我们管理的文件，需要备份并导入
            let backup_dir = get_global_backup_dir();
            fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;

            let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
            let backup_file = backup_dir.join(format!("CLAUDE.md.{}.backup", timestamp));
            fs::copy(&global_path, &backup_file).map_err(|e| e.to_string())?;

            backup_path = Some(backup_file.to_string_lossy().to_string());
        }
    }

    // 取消之前全局文件的标记
    for file in app_data.claude_md_files.iter_mut() {
        if file.is_global {
            file.is_global = false;
            file.updated_at = Utc::now().to_rfc3339();
        }
    }

    // 确保 ~/.claude 目录存在
    let claude_dir = global_path.parent().unwrap();
    fs::create_dir_all(claude_dir).map_err(|e| e.to_string())?;

    // 写入全局文件
    fs::write(&global_path, &target_file.content).map_err(|e| e.to_string())?;

    // 设置新的全局标记
    if let Some(file) = app_data.claude_md_files.iter_mut().find(|f| f.id == id) {
        file.is_global = true;
        file.updated_at = Utc::now().to_rfc3339();
    }

    app_data.global_claude_md_id = Some(id);
    write_app_data(app_data)?;

    Ok(SetGlobalResult {
        success: true,
        previous_global_id,
        backup_path,
        error: None,
    })
}

/// 取消全局 CLAUDE.md 设置
///
/// 流程：
/// 1. 删除 ~/.claude/CLAUDE.md
/// 2. 取消文件的 isGlobal 标记
#[tauri::command]
pub fn unset_global_claude_md() -> Result<(), String> {
    let mut app_data = read_app_data()?;

    // 取消所有全局标记
    for file in app_data.claude_md_files.iter_mut() {
        if file.is_global {
            file.is_global = false;
            file.updated_at = Utc::now().to_rfc3339();
        }
    }

    app_data.global_claude_md_id = None;

    // 删除全局文件
    let home = dirs::home_dir().ok_or("Cannot get home directory")?;
    let global_path = home.join(".claude").join("CLAUDE.md");
    if global_path.exists() {
        fs::remove_file(&global_path).map_err(|e| e.to_string())?;
    }

    write_app_data(app_data)?;
    Ok(())
}

// ============================================================================
// 分发命令
// ============================================================================

/// 分发 CLAUDE.md 到项目
///
/// # Arguments
/// * `options` - 分发选项
#[tauri::command]
pub fn distribute_claude_md(options: ClaudeMdDistributionOptions) -> Result<ClaudeMdDistributionResult, String> {
    let app_data = read_app_data()?;

    // 找到源文件
    let source_file = app_data.claude_md_files
        .iter()
        .find(|f| f.id == options.claude_md_id)
        .ok_or_else(|| format!("CLAUDE.md file not found: {}", options.claude_md_id))?;

    // 检查是否是全局文件
    if source_file.is_global {
        return Err("Cannot distribute a global CLAUDE.md. Global files are already available everywhere.".to_string());
    }

    // 构建目标路径
    let project_path = expand_path(&options.project_path);
    let target_path = project_path.join(options.target_path.as_str());

    // 确保父目录存在
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let mut action = "created";
    let mut backup_path: Option<String> = None;

    // 处理冲突
    if target_path.exists() {
        match options.conflict_resolution {
            ClaudeMdConflictResolution::Skip => {
                return Ok(ClaudeMdDistributionResult {
                    success: true,
                    target_path: target_path.to_string_lossy().to_string(),
                    action: "skipped".to_string(),
                    backup_path: None,
                    error: None,
                });
            }
            ClaudeMdConflictResolution::Backup => {
                // 创建备份
                let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
                let backup_file = target_path.with_extension(format!("md.{}.backup", timestamp));
                fs::copy(&target_path, &backup_file).map_err(|e| e.to_string())?;
                backup_path = Some(backup_file.to_string_lossy().to_string());
                action = "backed_up";
            }
            ClaudeMdConflictResolution::Overwrite => {
                action = "overwritten";
            }
        }
    }

    // 写入文件
    fs::write(&target_path, &source_file.content).map_err(|e| e.to_string())?;

    Ok(ClaudeMdDistributionResult {
        success: true,
        target_path: target_path.to_string_lossy().to_string(),
        action: action.to_string(),
        backup_path,
        error: None,
    })
}

/// 批量分发 CLAUDE.md 到项目 (用于 Scene)
///
/// # Arguments
/// * `claude_md_ids` - 要分发的文件 ID 列表
/// * `project_path` - 目标项目路径
/// * `target_path` - 目标文件路径
/// * `conflict_resolution` - 冲突解决策略
#[tauri::command]
pub fn distribute_scene_claude_md(
    claude_md_ids: Vec<String>,
    project_path: String,
    target_path: ClaudeMdDistributionPath,
    conflict_resolution: ClaudeMdConflictResolution,
) -> Result<Vec<ClaudeMdDistributionResult>, String> {
    let mut results: Vec<ClaudeMdDistributionResult> = Vec::new();

    for id in claude_md_ids {
        let options = ClaudeMdDistributionOptions {
            claude_md_id: id,
            project_path: project_path.clone(),
            target_path: target_path.clone(),
            conflict_resolution: conflict_resolution.clone(),
        };

        match distribute_claude_md(options) {
            Ok(result) => results.push(result),
            Err(e) => results.push(ClaudeMdDistributionResult {
                success: false,
                target_path: "".to_string(),
                action: "failed".to_string(),
                backup_path: None,
                error: Some(e),
            }),
        }
    }

    Ok(results)
}

// ============================================================================
// 辅助函数
// ============================================================================

/// 展开路径中的 ~ 为 HOME 目录
fn expand_path(path: &str) -> PathBuf {
    if path.starts_with('~') {
        if let Some(home) = dirs::home_dir() {
            return home.join(&path[2..]);
        }
    }
    PathBuf::from(path)
}
```

### 4.2 命令注册

```rust
// src-tauri/src/commands/mod.rs - 添加模块

pub mod classify;
pub mod config;
pub mod data;
pub mod dialog;
pub mod import;
pub mod mcps;
pub mod plugins;
pub mod skills;
pub mod symlink;
pub mod usage;
pub mod claude_md;  // 新增
```

```rust
// src-tauri/src/lib.rs - 添加命令注册

use commands::{classify, config, data, dialog, import, mcps, plugins, skills, symlink, usage, claude_md};

// 在 invoke_handler 中添加:
.invoke_handler(tauri::generate_handler![
    // ... 现有命令 ...

    // CLAUDE.md commands
    claude_md::scan_claude_md_files,
    claude_md::import_claude_md,
    claude_md::read_claude_md,
    claude_md::get_claude_md_files,
    claude_md::update_claude_md,
    claude_md::delete_claude_md,
    claude_md::set_global_claude_md,
    claude_md::unset_global_claude_md,
    claude_md::distribute_claude_md,
    claude_md::distribute_scene_claude_md,
])
```

---

## 五、Store 设计

### 5.1 claudeMdStore 完整实现

```typescript
// src/stores/claudeMdStore.ts

import { create } from 'zustand';
import {
  ClaudeMdFile,
  ClaudeMdScanResult,
  ClaudeMdScanItem,
  ClaudeMdImportOptions,
  ClaudeMdImportResult,
  ClaudeMdDistributionOptions,
  ClaudeMdDistributionResult,
  SetGlobalResult,
  ClaudeMdDistributionPath,
  ClaudeMdConflictResolution,
} from '@/types/claudeMd';
import { isTauri, safeInvoke } from '@/utils/tauri';

// ============================================================================
// Types
// ============================================================================

interface ClaudeMdFilter {
  search: string;
  categoryId: string | null;
  tagIds: string[];
  showGlobalOnly: boolean;
}

interface ClaudeMdState {
  // Data
  files: ClaudeMdFile[];
  globalFileId: string | null;

  // Scan state
  scanResult: ClaudeMdScanResult | null;
  isScanning: boolean;

  // Selection
  selectedFileId: string | null;

  // Filter
  filter: ClaudeMdFilter;

  // Loading states
  isLoading: boolean;
  isImporting: boolean;
  isSetting: boolean;
  isDistributing: boolean;

  // Error state
  error: string | null;

  // Actions
  loadFiles: () => Promise<void>;
  setFiles: (files: ClaudeMdFile[]) => void;
  selectFile: (id: string | null) => void;

  // Scan actions
  scanFiles: (scanPaths?: string[], includeHome?: boolean) => Promise<void>;
  clearScanResult: () => void;

  // Import actions
  importFile: (options: ClaudeMdImportOptions) => Promise<ClaudeMdImportResult | null>;

  // CRUD actions
  updateFile: (id: string, updates: Partial<ClaudeMdFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;

  // Global actions
  setGlobal: (id: string) => Promise<SetGlobalResult | null>;
  unsetGlobal: () => Promise<void>;

  // Distribution actions
  distributeToProject: (options: ClaudeMdDistributionOptions) => Promise<ClaudeMdDistributionResult | null>;

  // Filter actions
  setFilter: (filter: Partial<ClaudeMdFilter>) => void;
  clearFilter: () => void;

  // Error handling
  clearError: () => void;

  // Computed
  getFilteredFiles: () => ClaudeMdFile[];
  getGlobalFile: () => ClaudeMdFile | undefined;
  getNonGlobalFiles: () => ClaudeMdFile[];
  getSelectedFile: () => ClaudeMdFile | undefined;
  getUnimportedScanItems: () => ClaudeMdScanItem[];
}

// ============================================================================
// Initial State
// ============================================================================

const initialFilter: ClaudeMdFilter = {
  search: '',
  categoryId: null,
  tagIds: [],
  showGlobalOnly: false,
};

// ============================================================================
// Store
// ============================================================================

export const useClaudeMdStore = create<ClaudeMdState>((set, get) => ({
  // Initial state
  files: [],
  globalFileId: null,
  scanResult: null,
  isScanning: false,
  selectedFileId: null,
  filter: initialFilter,
  isLoading: false,
  isImporting: false,
  isSetting: false,
  isDistributing: false,
  error: null,

  // ========================================================================
  // Load files
  // ========================================================================
  loadFiles: async () => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot load files in browser mode');
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const files = await safeInvoke<ClaudeMdFile[]>('get_claude_md_files');
      const globalFile = files?.find(f => f.isGlobal);

      set({
        files: files || [],
        globalFileId: globalFile?.id || null,
        isLoading: false,
      });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isLoading: false });
    }
  },

  setFiles: (files) => {
    const globalFile = files.find(f => f.isGlobal);
    set({ files, globalFileId: globalFile?.id || null });
  },

  selectFile: (id) => set({ selectedFileId: id }),

  // ========================================================================
  // Scan files
  // ========================================================================
  scanFiles: async (scanPaths, includeHome = true) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot scan files in browser mode');
      return;
    }

    set({ isScanning: true, error: null });

    try {
      const result = await safeInvoke<ClaudeMdScanResult>('scan_claude_md_files', {
        scanPaths,
        includeHome,
      });

      set({ scanResult: result || null, isScanning: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isScanning: false });
    }
  },

  clearScanResult: () => set({ scanResult: null }),

  // ========================================================================
  // Import file
  // ========================================================================
  importFile: async (options) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot import file in browser mode');
      return null;
    }

    set({ isImporting: true, error: null });

    try {
      const result = await safeInvoke<ClaudeMdImportResult>('import_claude_md', {
        ...options,
      });

      if (result?.success && result.file) {
        set((state) => ({
          files: [...state.files, result.file!],
          isImporting: false,
        }));
      } else {
        set({
          error: result?.error || 'Import failed',
          isImporting: false,
        });
      }

      return result || null;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isImporting: false });
      return null;
    }
  },

  // ========================================================================
  // Update file
  // ========================================================================
  updateFile: async (id, updates) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot update file in browser mode');
      return;
    }

    const file = get().files.find((f) => f.id === id);
    if (!file) return;

    // Optimistic update
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));

    try {
      await safeInvoke('update_claude_md', {
        id,
        content: updates.content,
        name: updates.name,
        description: updates.description,
        categoryId: updates.categoryId,
        tagIds: updates.tagIds,
        icon: updates.icon,
      });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? file : f
        ),
        error: message,
      }));
    }
  },

  // ========================================================================
  // Delete file
  // ========================================================================
  deleteFile: async (id) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot delete file in browser mode');
      return;
    }

    const file = get().files.find((f) => f.id === id);
    if (!file) return;

    // Check if it's global
    if (file.isGlobal) {
      set({ error: 'Cannot delete the current global CLAUDE.md. Please unset it first.' });
      return;
    }

    // Optimistic update
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
    }));

    try {
      await safeInvoke('delete_claude_md', { id });
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set((state) => ({
        files: [...state.files, file],
        error: message,
      }));
    }
  },

  // ========================================================================
  // Set global
  // ========================================================================
  setGlobal: async (id) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot set global in browser mode');
      return null;
    }

    set({ isSetting: true, error: null });

    try {
      const result = await safeInvoke<SetGlobalResult>('set_global_claude_md', { id });

      if (result?.success) {
        // Update local state
        set((state) => ({
          files: state.files.map((f) => ({
            ...f,
            isGlobal: f.id === id,
          })),
          globalFileId: id,
          isSetting: false,
        }));
      } else {
        set({
          error: result?.error || 'Failed to set global',
          isSetting: false,
        });
      }

      return result || null;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isSetting: false });
      return null;
    }
  },

  // ========================================================================
  // Unset global
  // ========================================================================
  unsetGlobal: async () => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot unset global in browser mode');
      return;
    }

    const { globalFileId } = get();
    if (!globalFileId) return;

    set({ isSetting: true, error: null });

    try {
      await safeInvoke('unset_global_claude_md');

      // Update local state
      set((state) => ({
        files: state.files.map((f) => ({
          ...f,
          isGlobal: false,
        })),
        globalFileId: null,
        isSetting: false,
      }));
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isSetting: false });
    }
  },

  // ========================================================================
  // Distribute to project
  // ========================================================================
  distributeToProject: async (options) => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot distribute in browser mode');
      return null;
    }

    set({ isDistributing: true, error: null });

    try {
      const result = await safeInvoke<ClaudeMdDistributionResult>('distribute_claude_md', {
        ...options,
      });

      set({ isDistributing: false });

      if (!result?.success) {
        set({ error: result?.error || 'Distribution failed' });
      }

      return result || null;
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isDistributing: false });
      return null;
    }
  },

  // ========================================================================
  // Filter actions
  // ========================================================================
  setFilter: (filter) => {
    const currentFilter = get().filter;
    set({ filter: { ...currentFilter, ...filter } });
  },

  clearFilter: () => set({ filter: initialFilter }),

  clearError: () => set({ error: null }),

  // ========================================================================
  // Computed
  // ========================================================================
  getFilteredFiles: () => {
    const { files, filter } = get();
    let filtered = [...files];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.description.toLowerCase().includes(searchLower) ||
          file.content.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.categoryId) {
      filtered = filtered.filter((file) => file.categoryId === filter.categoryId);
    }

    // Tags filter
    if (filter.tagIds.length > 0) {
      filtered = filtered.filter((file) =>
        filter.tagIds.some((tag) => file.tagIds.includes(tag))
      );
    }

    // Global only filter
    if (filter.showGlobalOnly) {
      filtered = filtered.filter((file) => file.isGlobal);
    }

    // Sort: global first, then by name
    filtered.sort((a, b) => {
      if (a.isGlobal !== b.isGlobal) {
        return a.isGlobal ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  },

  getGlobalFile: () => {
    const { files, globalFileId } = get();
    return files.find((f) => f.id === globalFileId);
  },

  getNonGlobalFiles: () => {
    const { files } = get();
    return files.filter((f) => !f.isGlobal);
  },

  getSelectedFile: () => {
    const { files, selectedFileId } = get();
    return files.find((f) => f.id === selectedFileId);
  },

  getUnimportedScanItems: () => {
    const { scanResult } = get();
    if (!scanResult) return [];
    return scanResult.items.filter((item) => !item.isImported);
  },
}));

export default useClaudeMdStore;
```

### 5.2 scenesStore 扩展

```typescript
// src/stores/scenesStore.ts - 需要修改的部分

import { useClaudeMdStore } from './claudeMdStore';

// 更新 CreateModalState 接口
export interface CreateModalState {
  isOpen: boolean;
  name: string;
  description: string;
  selectedSkillIds: string[];
  selectedMcpIds: string[];
  selectedClaudeMdIds: string[];  // 新增
  activeTab: 'skills' | 'mcps' | 'claudeMd';  // 修改
  search: string;
  categoryFilter: string;
  tagFilter: string[];
}

// 更新 initialCreateModalState
const initialCreateModalState: CreateModalState = {
  isOpen: false,
  name: '',
  description: '',
  selectedSkillIds: [],
  selectedMcpIds: [],
  selectedClaudeMdIds: [],  // 新增
  activeTab: 'skills',
  search: '',
  categoryFilter: '',
  tagFilter: [],
};

// 添加新方法到 ScenesState 接口
interface ScenesState {
  // ... 现有接口 ...

  // CLAUDE.md selection
  toggleClaudeMdSelection: (id: string) => void;
  selectAllClaudeMd: (ids: string[]) => void;

  // Getters for distributable items (exclude plugin/global)
  getDistributableSkills: () => Skill[];
  getDistributableMcps: () => McpServer[];
  getDistributableClaudeMd: () => ClaudeMdFile[];
}

// 在 store 中添加实现
export const useScenesStore = create<ScenesState>((set, get) => ({
  // ... 现有实现 ...

  // CLAUDE.md selection
  toggleClaudeMdSelection: (id) =>
    set((state) => {
      const { selectedClaudeMdIds } = state.createModal;
      const newIds = selectedClaudeMdIds.includes(id)
        ? selectedClaudeMdIds.filter((cid) => cid !== id)
        : [...selectedClaudeMdIds, id];
      return {
        createModal: {
          ...state.createModal,
          selectedClaudeMdIds: newIds,
        },
      };
    }),

  selectAllClaudeMd: (ids) =>
    set((state) => ({
      createModal: {
        ...state.createModal,
        selectedClaudeMdIds: ids,
      },
    })),

  // Distributable getters (exclude plugin/global resources)
  getDistributableSkills: () => {
    const skills = useSkillsStore.getState().skills;
    return skills.filter((skill) => skill.installSource !== 'plugin');
  },

  getDistributableMcps: () => {
    const mcps = useMcpsStore.getState().mcpServers;
    return mcps.filter((mcp) => mcp.installSource !== 'plugin');
  },

  getDistributableClaudeMd: () => {
    const files = useClaudeMdStore.getState().files;
    // 排除 isGlobal=true 的文件
    return files.filter((file) => !file.isGlobal);
  },

  // 修改 createScene 方法以包含 claudeMdIds
  createScene: async () => {
    if (!isTauri()) {
      console.warn('ScenesStore: Cannot create scene in browser mode');
      return null;
    }

    const { createModal } = get();

    if (!createModal.name.trim()) {
      return null;
    }

    try {
      const scene = await safeInvoke<Scene>('add_scene', {
        name: createModal.name.trim(),
        description: createModal.description.trim(),
        icon: 'layers',
        skillIds: createModal.selectedSkillIds,
        mcpIds: createModal.selectedMcpIds,
        claudeMdIds: createModal.selectedClaudeMdIds,  // 新增
      });

      if (!scene) {
        set({ error: 'Failed to create scene' });
        return null;
      }

      set((state) => ({
        scenes: [...state.scenes, scene],
        createModal: {
          ...initialCreateModalState,
          isOpen: false,
        },
        selectedSceneId: scene.id,
        error: null,
      }));

      return scene;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },
}));
```

### 5.3 settingsStore 扩展

```typescript
// src/stores/settingsStore.ts - 添加新字段

import { ClaudeMdDistributionPath } from '@/types/claudeMd';

interface SettingsState {
  // ... 现有字段 ...

  // 新增
  claudeMdDistributionPath: ClaudeMdDistributionPath;

  // 新增 action
  setClaudeMdDistributionPath: (path: ClaudeMdDistributionPath) => Promise<void>;
}

// 在 store 中添加实现
export const useSettingsStore = create<SettingsState>((set, get) => ({
  // ... 现有实现 ...

  claudeMdDistributionPath: '.claude/CLAUDE.md',

  setClaudeMdDistributionPath: async (path) => {
    if (!isTauri()) {
      console.warn('SettingsStore: Cannot update settings in browser mode');
      return;
    }

    const oldPath = get().claudeMdDistributionPath;

    // Optimistic update
    set({ claudeMdDistributionPath: path });

    try {
      const settings = await safeInvoke<AppSettings>('read_settings');
      if (settings) {
        await safeInvoke('write_settings', {
          ...settings,
          claudeMdDistributionPath: path,
        });
      }
    } catch (error) {
      // Rollback on error
      const message = typeof error === 'string' ? error : String(error);
      set({ claudeMdDistributionPath: oldPath, error: message });
    }
  },
}));
```

---

## 六、数据存储结构

### 6.1 目录结构

```
~/.ensemble/
├── data.json                    # 应用数据 (包含 claudeMdFiles)
├── settings.json                # 应用设置 (包含 claudeMdDistributionPath)
├── skills/                      # Skills 源文件
├── mcps/                        # MCPs 配置文件
└── claude-md/                   # CLAUDE.md 相关 (新增)
    └── global-backup/           # 全局文件备份
        └── CLAUDE.md.{timestamp}.backup
```

### 6.2 data.json 完整结构

```json
{
  "categories": [
    {
      "id": "uuid-1",
      "name": "Development",
      "color": "#3B82F6",
      "count": 5
    }
  ],
  "tags": [
    {
      "id": "uuid-2",
      "name": "TypeScript",
      "count": 3
    }
  ],
  "scenes": [
    {
      "id": "uuid-3",
      "name": "Web Development",
      "description": "Frontend development scene",
      "icon": "code",
      "skillIds": ["skill-1", "skill-2"],
      "mcpIds": ["mcp-1"],
      "claudeMdIds": ["claude-md-1", "claude-md-2"],
      "createdAt": "2026-02-04T10:00:00Z",
      "lastUsed": "2026-02-04T12:00:00Z"
    }
  ],
  "projects": [],
  "skillMetadata": {},
  "mcpMetadata": {},
  "trashedScenes": [],
  "trashedProjects": [],
  "importedPluginSkills": [],
  "importedPluginMcps": [],
  "claudeMdFiles": [
    {
      "id": "uuid-claude-1",
      "name": "Global Rules",
      "description": "My global coding rules",
      "sourcePath": "/Users/bo/.claude/CLAUDE.md",
      "sourceType": "global",
      "content": "# Global Rules\n\n- Use TypeScript\n- Follow ESLint",
      "isGlobal": true,
      "categoryId": "uuid-1",
      "tagIds": ["uuid-2"],
      "createdAt": "2026-02-04T10:00:00Z",
      "updatedAt": "2026-02-04T10:00:00Z",
      "size": 128,
      "icon": "globe"
    },
    {
      "id": "uuid-claude-2",
      "name": "Frontend Project",
      "description": "Frontend specific rules",
      "sourcePath": "/Users/bo/Projects/frontend/.claude/CLAUDE.md",
      "sourceType": "project",
      "content": "# Frontend Rules\n\n- Use React 18\n- Use Tailwind CSS",
      "isGlobal": false,
      "categoryId": "uuid-1",
      "tagIds": [],
      "createdAt": "2026-02-04T11:00:00Z",
      "updatedAt": "2026-02-04T11:00:00Z",
      "size": 96
    }
  ],
  "globalClaudeMdId": "uuid-claude-1"
}
```

### 6.3 settings.json 完整结构

```json
{
  "skillSourceDir": "~/.ensemble/skills",
  "mcpSourceDir": "~/.ensemble/mcps",
  "claudeConfigDir": "~/.claude",
  "anthropicApiKey": null,
  "autoClassifyNewItems": false,
  "terminalApp": "Terminal",
  "claudeCommand": "claude",
  "warpOpenMode": "window",
  "hasCompletedImport": true,
  "claudeMdDistributionPath": ".claude/CLAUDE.md"
}
```

---

## 七、边界情况和错误处理

### 7.1 扫描边界情况

| 场景 | 处理方式 |
|------|----------|
| 无权限访问目录 | 跳过该目录，记录到 errors 数组 |
| 文件太大 (>1MB) | 仍然扫描，但不加载预览 |
| 符号链接 | 不跟随，避免循环 |
| 扫描超时 (>30秒) | 中断扫描，返回已有结果 |

### 7.2 导入边界情况

| 场景 | 处理方式 |
|------|----------|
| 文件已导入 | 返回已存在的 ClaudeMdFile |
| 文件不存在 | 返回错误 |
| 文件无读取权限 | 返回错误 |
| 文件内容为空 | 允许导入 |

### 7.3 全局设置边界情况

| 场景 | 处理方式 |
|------|----------|
| ~/.claude 目录不存在 | 自动创建 |
| 已有全局文件 (非 Ensemble 管理) | 备份到 global-backup |
| 已有全局文件 (Ensemble 管理) | 仅更新标记 |
| 目标文件已是全局 | 无操作 |

### 7.4 分发边界情况

| 场景 | 处理方式 |
|------|----------|
| 目标项目不存在 | 返回错误 |
| 目标文件已存在 | 根据 conflictResolution 处理 |
| 无写入权限 | 返回错误 |
| 分发全局文件 | 拒绝，返回错误 |

---

## 八、与现有系统的兼容性

### 8.1 类型兼容性

- `Scene.claudeMdIds` 使用 `#[serde(default)]`，确保旧数据可正常解析
- `AppData.claudeMdFiles` 使用 `#[serde(default)]`，确保旧数据可正常解析
- `AppSettings.claudeMdDistributionPath` 使用 `#[serde(default)]`，使用默认值

### 8.2 数据迁移

无需显式迁移。当读取旧版 data.json 时：
- `claudeMdFiles` 默认为空数组
- `globalClaudeMdId` 默认为 null
- `Scene.claudeMdIds` 默认为空数组

### 8.3 API 向后兼容

所有新增命令不影响现有命令。现有的 `add_scene` 和 `update_scene` 命令需要更新以支持 `claudeMdIds` 参数。

---

## 九、检查清单

- [x] 设计了完整的 TypeScript 类型
- [x] 设计了完整的 Rust 数据结构
- [x] 设计了所有 Rust 命令接口
  - [x] scan_claude_md_files
  - [x] import_claude_md
  - [x] read_claude_md
  - [x] get_claude_md_files
  - [x] update_claude_md
  - [x] delete_claude_md
  - [x] set_global_claude_md
  - [x] unset_global_claude_md
  - [x] distribute_claude_md
  - [x] distribute_scene_claude_md
- [x] 设计了 claudeMdStore 完整接口
- [x] 设计了 scenesStore 扩展
- [x] 设计了 settingsStore 扩展
- [x] 设计了数据存储结构
- [x] 考虑了边界情况和错误处理
- [x] 确保与现有系统兼容

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
*创建者: SubAgent A3 (数据模型设计)*
