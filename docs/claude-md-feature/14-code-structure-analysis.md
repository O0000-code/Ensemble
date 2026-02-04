# 代码结构分析

> 创建时间: 2026-02-04
> SubAgent: A2 - 代码结构分析
> 状态: 完成

---

## 一、需要新增的文件

### 1.1 前端文件

| 文件路径 | 用途 | 参考文件 |
|----------|------|----------|
| `src/pages/ClaudeMdPage.tsx` | CLAUDE.md 列表页面（含空状态、列表、详情面板） | `src/pages/SkillsPage.tsx`, `src/pages/McpServersPage.tsx` |
| `src/components/claude-md/ClaudeMdCard.tsx` | 列表卡片组件 | `src/components/skills/SkillListItem.tsx` |
| `src/components/claude-md/ClaudeMdBadge.tsx` | 类型角标组件（Global/Project/Local） | `src/components/common/Badge.tsx` |
| `src/components/claude-md/ClaudeMdDetailPanel.tsx` | 详情面板组件 | `src/components/skills/SkillDetailPanel.tsx` |
| `src/components/claude-md/ClaudeMdList.tsx` | 列表容器组件 | 内嵌于页面 |
| `src/components/modals/ImportClaudeMdModal.tsx` | 导入弹窗组件 | `src/components/modals/ImportSkillsModal.tsx` |
| `src/stores/claudeMdStore.ts` | CLAUDE.md 状态管理 | `src/stores/skillsStore.ts`, `src/stores/mcpsStore.ts` |
| `src/types/claudeMd.ts` | TypeScript 类型定义 | `src/types/index.ts` |

### 1.2 后端文件

| 文件路径 | 用途 | 参考文件 |
|----------|------|----------|
| `src-tauri/src/commands/claude_md.rs` | CLAUDE.md 相关 Rust 命令 | `src-tauri/src/commands/skills.rs`, `src-tauri/src/commands/import.rs` |

---

## 二、需要修改的文件

### 2.1 前端修改

| 文件路径 | 修改内容 |
|----------|----------|
| `src/App.tsx` | 添加 `/claude-md` 路由 |
| `src/components/layout/Sidebar.tsx` | 添加 CLAUDE.md 导航项（在 MCP Servers 下方） |
| `src/pages/SettingsPage.tsx` | 添加 Distribution Path 设置项 |
| `src/components/scenes/CreateSceneModal.tsx` | 添加 CLAUDE.md 标签页 |
| `src/types/index.ts` | 导出 CLAUDE.md 相关类型 |
| `src/stores/index.ts` | 导出 claudeMdStore（如果存在此文件） |

### 2.2 后端修改

| 文件路径 | 修改内容 |
|----------|----------|
| `src-tauri/src/commands/mod.rs` | 添加 `pub mod claude_md;` |
| `src-tauri/src/lib.rs` | 注册 CLAUDE.md 相关命令 |
| `src-tauri/src/types.rs` | 添加 `ClaudeMdFile`, `ClaudeMdType` 等类型定义 |

---

## 三、代码模式参考

### 3.1 Store 模式

从 `skillsStore.ts` 和 `mcpsStore.ts` 提取的 Store 模式：

```typescript
import { create } from 'zustand';
import { isTauri, safeInvoke } from '@/utils/tauri';
import { useSettingsStore } from './settingsStore';

interface ClaudeMdFilter {
  search: string;
  type: 'all' | 'global' | 'project' | 'local';
}

interface ClaudeMdState {
  // Data
  claudeMdFiles: ClaudeMdFile[];

  // Selection
  selectedId: string | null;

  // Filter
  filter: ClaudeMdFilter;

  // Loading state
  isLoading: boolean;
  isScanning: boolean;

  // Error state
  error: string | null;

  // Actions
  loadClaudeMdFiles: () => Promise<void>;
  scanClaudeMdFiles: () => Promise<void>;
  importClaudeMd: (sourcePath: string, name: string) => Promise<void>;
  setGlobalClaudeMd: (id: string) => Promise<void>;
  deleteClaudeMd: (id: string) => Promise<void>;
  selectClaudeMd: (id: string | null) => void;
  setFilter: (filter: Partial<ClaudeMdFilter>) => void;
  clearError: () => void;

  // Computed
  getFilteredFiles: () => ClaudeMdFile[];
}

const initialFilter: ClaudeMdFilter = {
  search: '',
  type: 'all',
};

export const useClaudeMdStore = create<ClaudeMdState>((set, get) => ({
  // Initial state
  claudeMdFiles: [],
  selectedId: null,
  filter: initialFilter,
  isLoading: false,
  isScanning: false,
  error: null,

  // Actions
  loadClaudeMdFiles: async () => {
    if (!isTauri()) {
      console.warn('ClaudeMdStore: Cannot load in browser mode');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const files = await safeInvoke<ClaudeMdFile[]>('load_claude_md_files');
      set({ claudeMdFiles: files || [], isLoading: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isLoading: false });
    }
  },

  scanClaudeMdFiles: async () => {
    if (!isTauri()) return;

    set({ isScanning: true, error: null });
    try {
      const scannedFiles = await safeInvoke<ScannedClaudeMdFile[]>('scan_claude_md_files');
      set({ scannedFiles: scannedFiles || [], isScanning: false });
    } catch (error) {
      const message = typeof error === 'string' ? error : String(error);
      set({ error: message, isScanning: false });
    }
  },

  // ... more actions following same pattern

  // Computed
  getFilteredFiles: () => {
    const { claudeMdFiles, filter } = get();
    let filtered = [...claudeMdFiles];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.sourcePath.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter((file) => file.type === filter.type);
    }

    return filtered;
  },
}));
```

### 3.2 页面组件模式

从 `SkillsPage.tsx` 和 `McpServersPage.tsx` 提取的页面模式：

```typescript
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PageHeader, SlidePanel } from '@/components/layout';
import { EmptyState, Button } from '@/components/common';
import { useClaudeMdStore } from '@/stores/claudeMdStore';

export function ClaudeMdPage() {
  // Store
  const {
    claudeMdFiles,
    filter,
    setFilter,
    deleteClaudeMd,
    getFilteredFiles,
    loadClaudeMdFiles,
    error,
    clearError,
  } = useClaudeMdStore();

  // Local state for selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredFiles = getFilteredFiles();

  // Get selected item
  const selectedFile = useMemo(
    () => claudeMdFiles.find((f) => f.id === selectedId) || null,
    [claudeMdFiles, selectedId]
  );

  // Load on mount
  useEffect(() => {
    loadClaudeMdFiles();
  }, [loadClaudeMdFiles]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleItemClick = (id: string) => {
    setSelectedId(id);
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
  };

  // Detail header
  const detailHeader = selectedFile && (
    <div className="flex items-center gap-3">
      {/* Icon and title */}
    </div>
  );

  // Detail content
  const detailContent = selectedFile && (
    <div className="flex flex-col gap-7">
      {/* Detail sections */}
    </div>
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Header */}
      <PageHeader
        title="CLAUDE.md"
        searchValue={filter.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search CLAUDE.md files..."
        actions={
          <Button variant="secondary" size="small" icon={<Download />}>
            Import
          </Button>
        }
      />

      {/* Error notification */}
      {error && (
        <div className="mx-7 mt-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearError} className="text-sm font-medium text-red-700 hover:text-red-800">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content - with shrink animation */}
      <div
        className={`
          flex-1 overflow-y-auto px-7 py-6
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${selectedId ? 'mr-[800px]' : ''}
        `}
      >
        {filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No CLAUDE.md files"
            description="Import CLAUDE.md files to manage them"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredFiles.map((file) => (
              <ClaudeMdCard
                key={file.id}
                file={file}
                compact={!!selectedId}
                selected={file.id === selectedId}
                onClick={() => handleItemClick(file.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide Panel for Detail View */}
      <SlidePanel
        isOpen={!!selectedId}
        onClose={handleCloseDetail}
        width={800}
        header={detailHeader}
      >
        {detailContent}
      </SlidePanel>
    </div>
  );
}
```

### 3.3 导入弹窗模式

从 `ImportSkillsModal.tsx` 和 `ImportMcpModal.tsx` 提取的弹窗模式：

```typescript
import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info } from 'lucide-react';

interface ImportClaudeMdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportClaudeMdModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportClaudeMdModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Local state for scanned files
  const [scannedFiles, setScannedFiles] = useState<ScannedClaudeMdFile[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Scan on open
  useEffect(() => {
    if (isOpen) {
      scanFiles();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleToggleItem = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    // Import logic...
    onImportComplete?.();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-[520px] h-[580px] bg-white rounded-[16px] flex flex-col overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-[#18181B]">
              Import CLAUDE.md
            </h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              Found {scannedFiles.length} CLAUDE.md files
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA]">
            <X className="w-[18px] h-[18px] text-[#A1A1AA]" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
          {scannedFiles.map((file) => (
            <div
              key={file.sourcePath}
              onClick={() => handleToggleItem(file.sourcePath)}
              className="flex items-center gap-3 py-2.5 px-3 rounded-[6px] hover:bg-[#FAFAFA] cursor-pointer"
            >
              {/* Checkbox */}
              {selectedPaths.has(file.sourcePath) ? (
                <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8]" />
              )}
              {/* Info */}
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-[#18181B]">{file.name}</span>
                <span className="text-[11px] text-[#A1A1AA]">{file.sourcePath}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 px-6 border-t border-[#E5E5E5]">
          <button className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA]">
            <Info className="w-4 h-4 text-[#A1A1AA]" />
          </button>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A]">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedPaths.size === 0 || isImporting}
              className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white ${
                selectedPaths.size === 0 || isImporting
                  ? 'bg-[#18181B]/50 cursor-not-allowed'
                  : 'bg-[#18181B] hover:bg-[#27272A]'
              }`}
            >
              {isImporting ? 'Importing...' : 'Import Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
```

### 3.4 Rust 命令模式

从 `skills.rs` 提取的 Rust 命令模式：

```rust
use crate::types::{ClaudeMdFile, ClaudeMdMetadata, ClaudeMdScanResult};
use crate::utils::{expand_path, get_data_file_path};
use std::fs;
use std::collections::HashMap;

/// Scan for CLAUDE.md files on the system
///
/// Scans common locations:
/// - ~/.claude/CLAUDE.md (user level)
/// - Project directories with CLAUDE.md or .claude/CLAUDE.md
#[tauri::command]
pub fn scan_claude_md_files() -> Result<Vec<ClaudeMdScanResult>, String> {
    let mut results = Vec::new();

    // Scan user level
    if let Some(home) = dirs::home_dir() {
        let user_claude_md = home.join(".claude").join("CLAUDE.md");
        if user_claude_md.exists() {
            results.push(ClaudeMdScanResult {
                source_path: user_claude_md.to_string_lossy().to_string(),
                name: "User CLAUDE.md".to_string(),
                file_type: "global".to_string(),
                preview: read_preview(&user_claude_md),
            });
        }
    }

    // Scan recent projects...

    Ok(results)
}

/// Load managed CLAUDE.md files
#[tauri::command]
pub fn load_claude_md_files(source_dir: String) -> Result<Vec<ClaudeMdFile>, String> {
    let path = expand_path(&source_dir);

    if !path.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    let metadata_map = load_claude_md_metadata();

    if let Ok(entries) = fs::read_dir(&path) {
        for entry in entries.filter_map(|e| e.ok()) {
            let entry_path = entry.path();

            // Check for .md files
            if entry_path.extension().map(|e| e == "md").unwrap_or(false) {
                if let Ok(file) = parse_claude_md_file(&entry_path, &metadata_map) {
                    files.push(file);
                }
            }
        }
    }

    Ok(files)
}

/// Import a CLAUDE.md file
#[tauri::command]
pub fn import_claude_md(
    source_path: String,
    dest_dir: String,
    name: String,
) -> Result<ClaudeMdFile, String> {
    let source = expand_path(&source_path);
    let dest_base = expand_path(&dest_dir);

    if !source.exists() {
        return Err(format!("Source file not found: {}", source_path));
    }

    // Generate unique filename
    let filename = format!("{}.md", sanitize_filename(&name));
    let dest_path = dest_base.join(&filename);

    // Copy file
    fs::copy(&source, &dest_path)
        .map_err(|e| format!("Failed to copy file: {}", e))?;

    // Create metadata
    let id = dest_path.to_string_lossy().to_string();
    // ...

    Ok(ClaudeMdFile {
        id,
        name,
        source_path: source_path.clone(),
        managed_path: dest_path.to_string_lossy().to_string(),
        // ...
    })
}

/// Set a CLAUDE.md as global
#[tauri::command]
pub fn set_global_claude_md(
    id: String,
    ensemble_dir: String,
) -> Result<(), String> {
    let ensemble_path = expand_path(&ensemble_dir);

    // 1. Backup current global if exists and not managed
    if let Some(home) = dirs::home_dir() {
        let global_path = home.join(".claude").join("CLAUDE.md");
        if global_path.exists() {
            // Backup to ~/.ensemble/claude-md/global-backup/
            let backup_dir = ensemble_path.join("claude-md").join("global-backup");
            fs::create_dir_all(&backup_dir)
                .map_err(|e| format!("Failed to create backup directory: {}", e))?;

            let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
            let backup_path = backup_dir.join(format!("CLAUDE.md.{}", timestamp));
            fs::copy(&global_path, &backup_path)
                .map_err(|e| format!("Failed to backup global CLAUDE.md: {}", e))?;
        }
    }

    // 2. Update metadata - unset previous global
    let data_path = get_data_file_path();
    // ...

    // 3. Copy new file to ~/.claude/CLAUDE.md
    // ...

    Ok(())
}

/// Delete a managed CLAUDE.md file
#[tauri::command]
pub fn delete_claude_md(id: String, ensemble_dir: String) -> Result<(), String> {
    // Similar to delete_skill pattern
    let ensemble_path = expand_path(&ensemble_dir);
    let file_path = std::path::Path::new(&id);

    if !file_path.exists() {
        return Err(format!("File not found: {}", id));
    }

    // Move to trash
    let trash_dir = ensemble_path.join("trash").join("claude-md");
    fs::create_dir_all(&trash_dir)
        .map_err(|e| format!("Failed to create trash directory: {}", e))?;

    // ...

    Ok(())
}

// Helper functions
fn load_claude_md_metadata() -> HashMap<String, ClaudeMdMetadata> {
    // Same pattern as load_skill_metadata
    let data_path = get_data_file_path();
    // ...
    HashMap::new()
}

fn read_preview(path: &std::path::Path) -> String {
    fs::read_to_string(path)
        .ok()
        .map(|content| {
            content.lines()
                .take(3)
                .collect::<Vec<_>>()
                .join("\n")
        })
        .unwrap_or_default()
}
```

### 3.5 路由添加模式

从 `App.tsx` 提取的路由模式：

```typescript
// App.tsx
import ClaudeMdPage from './pages/ClaudeMdPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/skills" replace />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="mcp-servers" element={<McpServersPage />} />
          <Route path="claude-md" element={<ClaudeMdPage />} />  {/* 新增 */}
          <Route path="scenes" element={<ScenesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="tag/:tagId" element={<TagPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 3.6 Sidebar 导航项添加模式

从 `Sidebar.tsx` 提取的导航项模式：

```typescript
// Sidebar.tsx - navItems 配置
const navItems = [
  { id: 'skills', label: 'Skills', icon: Sparkles, countKey: 'skills' as const },
  { id: 'mcp-servers', label: 'MCP Servers', icon: Plug, countKey: 'mcpServers' as const },
  { id: 'claude-md', label: 'CLAUDE.md', icon: FileText, countKey: 'claudeMd' as const },  // 新增
  { id: 'scenes', label: 'Scenes', icon: Layers, countKey: 'scenes' as const },
  { id: 'projects', label: 'Projects', icon: Folder, countKey: 'projects' as const },
];

// SidebarProps 需要扩展 counts 类型
interface SidebarProps {
  // ...
  counts: {
    skills: number;
    mcpServers: number;
    claudeMd: number;  // 新增
    scenes: number;
    projects: number;
  };
}
```

### 3.7 Rust lib.rs 命令注册模式

从 `lib.rs` 提取的命令注册模式：

```rust
// lib.rs
mod commands;
pub mod types;
mod utils;

use commands::{classify, config, data, dialog, import, mcps, plugins, skills, symlink, usage, claude_md};  // 新增 claude_md

// ...

.invoke_handler(tauri::generate_handler![
    // ... existing commands ...

    // CLAUDE.md commands (新增)
    claude_md::scan_claude_md_files,
    claude_md::load_claude_md_files,
    claude_md::import_claude_md,
    claude_md::read_claude_md_content,
    claude_md::write_claude_md_content,
    claude_md::set_global_claude_md,
    claude_md::delete_claude_md,
    claude_md::distribute_claude_md,
    claude_md::update_claude_md_metadata,
])
```

---

## 四、关键代码片段

### 4.1 类型定义 - TypeScript

```typescript
// src/types/claudeMd.ts

export type ClaudeMdType = 'global' | 'project' | 'local';

export interface ClaudeMdFile {
  id: string;
  name: string;
  sourcePath: string;       // 原始路径
  managedPath: string;      // ~/.ensemble/claude-md/managed/ 下的路径
  content: string;
  type: ClaudeMdType;
  isGlobal: boolean;        // 是否设为全局
  category?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaudeMdScanResult {
  sourcePath: string;
  name: string;
  fileType: ClaudeMdType;
  preview: string;          // 前几行预览
}

// Scene 扩展
export interface SceneWithClaudeMd extends Scene {
  claudeMdIds: string[];    // 关联的 CLAUDE.md ID 列表
}

// Settings 扩展
export interface AppSettingsWithClaudeMd extends AppSettings {
  claudeMdDistributionPath: '.claude/CLAUDE.md' | 'CLAUDE.md' | 'CLAUDE.local.md';
}
```

### 4.2 类型定义 - Rust

```rust
// src-tauri/src/types.rs 新增

/// CLAUDE.md file type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMdType {
    Global,
    Project,
    Local,
}

/// Managed CLAUDE.md file
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdFile {
    pub id: String,
    pub name: String,
    pub source_path: String,
    pub managed_path: String,
    pub content: String,
    #[serde(rename = "type")]
    pub file_type: String,  // "global" | "project" | "local"
    pub is_global: bool,
    pub category: Option<String>,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// CLAUDE.md scan result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdScanResult {
    pub source_path: String,
    pub name: String,
    pub file_type: String,
    pub preview: String,
}

/// CLAUDE.md metadata (stored in data.json)
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdMetadata {
    pub name: String,
    pub is_global: bool,
    pub category: Option<String>,
    pub tags: Vec<String>,
}

// AppData 扩展
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    // ... existing fields ...

    /// CLAUDE.md metadata
    #[serde(default)]
    pub claude_md_metadata: HashMap<String, ClaudeMdMetadata>,
}

// AppSettings 扩展
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    // ... existing fields ...

    /// CLAUDE.md distribution path preference
    #[serde(default = "default_claude_md_distribution_path")]
    pub claude_md_distribution_path: String,
}

fn default_claude_md_distribution_path() -> String {
    ".claude/CLAUDE.md".to_string()
}
```

### 4.3 角标组件示例

```typescript
// src/components/claude-md/ClaudeMdBadge.tsx
import { Globe, Folder, User } from 'lucide-react';
import type { ClaudeMdType } from '@/types/claudeMd';

interface ClaudeMdBadgeProps {
  type: ClaudeMdType;
  size?: 'small' | 'medium';
}

const badgeConfig = {
  global: {
    icon: Globe,
    label: 'Global',
    bgColor: 'bg-[#EDE9FE]',      // 浅紫
    textColor: 'text-[#7C3AED]',  // 紫色
    iconColor: 'text-[#7C3AED]',
  },
  project: {
    icon: Folder,
    label: 'Project',
    bgColor: 'bg-[#E0F2FE]',      // 浅青
    textColor: 'text-[#0EA5E9]',  // 青色
    iconColor: 'text-[#0EA5E9]',
  },
  local: {
    icon: User,
    label: 'Local',
    bgColor: 'bg-[#FEF3C7]',      // 浅橙
    textColor: 'text-[#F59E0B]',  // 橙色
    iconColor: 'text-[#F59E0B]',
  },
};

export function ClaudeMdBadge({ type, size = 'small' }: ClaudeMdBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeClasses = size === 'small'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-[11px] gap-1.5';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${sizeClasses}
      `}
    >
      <Icon className={`h-3 w-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
}
```

### 4.4 Settings Distribution Path 设置项

```typescript
// SettingsPage.tsx 新增部分

// 在 Storage Section 后添加

{/* CLAUDE.md Section */}
<section>
  <SectionHeader
    title="CLAUDE.md"
    description="Configure CLAUDE.md distribution settings"
  />
  <Card>
    {/* Distribution Path */}
    <Row>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[#18181B]">
          Distribution Path
        </span>
        <span className="text-xs text-[#71717A]">
          Where to place CLAUDE.md in projects
        </span>
      </div>
      <CustomSelect
        value={claudeMdDistributionPath}
        onChange={setClaudeMdDistributionPath}
        options={[
          { value: '.claude/CLAUDE.md', label: '.claude/CLAUDE.md' },
          { value: 'CLAUDE.md', label: 'CLAUDE.md' },
          { value: 'CLAUDE.local.md', label: 'CLAUDE.local.md' },
        ]}
      />
    </Row>
  </Card>
</section>
```

### 4.5 CreateSceneModal CLAUDE.md 标签页

```typescript
// CreateSceneModal.tsx 新增部分

type TabType = 'skills' | 'mcps' | 'claudemd';  // 扩展

// 在 Tab 区域新增
<button
  onClick={() => setActiveTab('claudemd')}
  className={`flex items-center gap-2 px-5 py-2.5 ${
    activeTab === 'claudemd'
      ? 'border-b-2 border-[#18181B]'
      : 'border-b-2 border-transparent'
  }`}
>
  <FileText
    className={`h-4 w-4 ${
      activeTab === 'claudemd' ? 'text-[#18181B]' : 'text-[#71717A]'
    }`}
  />
  <span
    className={`text-[13px] ${
      activeTab === 'claudemd'
        ? 'font-semibold text-[#18181B]'
        : 'font-normal text-[#71717A]'
    }`}
  >
    CLAUDE.md
  </span>
  <span
    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
      activeTab === 'claudemd'
        ? 'bg-[#FAFAFA] text-[#52525B]'
        : 'bg-[#FAFAFA] text-[#71717A]'
    }`}
  >
    {claudeMdFiles.filter(f => !f.isGlobal).length}
  </span>
</button>

// Note: isGlobal 的文件不显示在列表中，因为全局文件不需要添加到 Scene
```

---

## 五、文件目录结构总结

```
src/
├── components/
│   └── claude-md/               # 新增目录
│       ├── ClaudeMdCard.tsx
│       ├── ClaudeMdBadge.tsx
│       ├── ClaudeMdDetailPanel.tsx
│       ├── ClaudeMdList.tsx
│       └── index.ts
├── pages/
│   └── ClaudeMdPage.tsx         # 新增文件
├── stores/
│   └── claudeMdStore.ts         # 新增文件
├── types/
│   ├── claudeMd.ts              # 新增文件
│   └── index.ts                 # 修改：导出 claudeMd 类型
└── App.tsx                      # 修改：添加路由

src-tauri/src/
├── commands/
│   ├── claude_md.rs             # 新增文件
│   └── mod.rs                   # 修改：添加 claude_md 模块
├── lib.rs                       # 修改：注册新命令
└── types.rs                     # 修改：添加新类型
```

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
*SubAgent: A2 - 代码结构分析*
