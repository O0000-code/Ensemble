# Claude.md 与插件系统功能设计方案

> 创建时间: 2026-02-04
> 创建者: SubAgent B4 (功能设计方案制定者)

---

## 一、设计概述

### 1.1 设计目标

本设计方案旨在为 Ensemble 应用新增两项核心功能：

1. **Claude.md 管理功能**：让用户可以在 Ensemble 中管理和分发 Claude Code 的 CLAUDE.md 配置文件
2. **完善插件资源处理**：确保插件安装的全局资源不会被重复加入 Scene，同时提供清晰的 UI 标识

### 1.2 设计原则

1. **最小侵入性**：不修改插件原始配置，只做导入和标记
2. **与现有架构一致**：复用现有的 Store 模式、Rust 命令结构和 UI 组件风格
3. **数据完整性**：确保与现有 `importedPluginSkills`/`importedPluginMcps` 机制兼容
4. **用户友好**：清晰区分不同来源的资源，防止重复配置
5. **渐进式实现**：分阶段实施，优先实现核心功能

### 1.3 功能范围

**本次设计涵盖**：
- Claude.md 用户级配置管理（`~/.claude/CLAUDE.md`）
- Claude.md 与 Scene 的关联和分发
- 插件资源的 Scene 分发限制
- 插件来源资源的 UI 标识

**本次设计不涵盖**：
- 托管策略级 Claude.md（系统级，需管理员权限）
- 项目规则文件（`.claude/rules/*.md`）的管理
- 插件的直接安装/卸载（这是 Claude Code 的功能）

---

## 二、Claude.md 管理功能

### 2.1 功能定义

#### 2.1.1 核心功能

1. **读取和显示**：读取 `~/.claude/CLAUDE.md` 的内容并在 UI 中显示
2. **编辑和保存**：允许用户在 Ensemble 中编辑用户级 Claude.md
3. **Scene 关联**：每个 Scene 可以关联一段 Claude.md 内容
4. **分发到项目**：将 Scene 的 Claude.md 分发到项目的 `.claude/CLAUDE.md`

#### 2.1.2 支持的层级

| 层级 | 路径 | Ensemble 支持 | 说明 |
|------|------|--------------|------|
| 用户级 | `~/.claude/CLAUDE.md` | 读/写/编辑 | 主要管理对象 |
| Scene 级 | 存储在 data.json | 创建/编辑 | 与 Scene 关联的配置片段 |
| 项目级 | `{project}/.claude/CLAUDE.md` | 写入（分发） | 分发目标 |
| 本地级 | `{project}/CLAUDE.local.md` | 不支持 | 用户个人覆盖，不参与管理 |

### 2.2 数据模型

#### 2.2.1 Scene 扩展

```typescript
interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
  // 新增字段
  claudeMdContent?: string;  // Scene 专属的 Claude.md 内容
}
```

#### 2.2.2 Claude.md 配置类型

```typescript
/**
 * Claude.md 文件信息
 */
interface ClaudeMdFile {
  path: string;           // 文件完整路径
  content: string;        // 文件内容
  exists: boolean;        // 文件是否存在
  lastModified?: string;  // 最后修改时间 (ISO 8601)
  level: 'user' | 'project' | 'local';  // 配置层级
}

/**
 * 用户级 Claude.md 状态
 */
interface UserClaudeMdState {
  path: string;           // ~/.claude/CLAUDE.md
  content: string;
  exists: boolean;
  lastModified?: string;
  isDirty: boolean;       // 是否有未保存的修改
}
```

### 2.3 Store 设计

**方案：扩展 scenesStore + 新增轻量级 claudeMdStore**

#### 2.3.1 新增 claudeMdStore.ts

```typescript
import { create } from 'zustand';
import { isTauri, safeInvoke } from '@/utils/tauri';

interface ClaudeMdState {
  // 用户级 Claude.md
  userClaudeMd: {
    path: string;
    content: string;
    exists: boolean;
    lastModified?: string;
    isDirty: boolean;
  };

  // 加载状态
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadUserClaudeMd: () => Promise<void>;
  updateUserClaudeMdContent: (content: string) => void;
  saveUserClaudeMd: () => Promise<void>;
  discardChanges: () => Promise<void>;
  clearError: () => void;
}

export const useClaudeMdStore = create<ClaudeMdState>((set, get) => ({
  userClaudeMd: {
    path: '~/.claude/CLAUDE.md',
    content: '',
    exists: false,
    isDirty: false,
  },
  isLoading: false,
  isSaving: false,
  error: null,

  loadUserClaudeMd: async () => {
    if (!isTauri()) return;
    set({ isLoading: true, error: null });
    try {
      const result = await safeInvoke<ClaudeMdFile>('read_claude_md', {
        path: '~/.claude/CLAUDE.md',
      });
      if (result) {
        set({
          userClaudeMd: {
            path: result.path,
            content: result.content,
            exists: result.exists,
            lastModified: result.lastModified,
            isDirty: false,
          },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  updateUserClaudeMdContent: (content: string) => {
    set((state) => ({
      userClaudeMd: {
        ...state.userClaudeMd,
        content,
        isDirty: true,
      },
    }));
  },

  saveUserClaudeMd: async () => {
    if (!isTauri()) return;
    const { userClaudeMd } = get();
    set({ isSaving: true, error: null });
    try {
      await safeInvoke('write_claude_md', {
        path: userClaudeMd.path,
        content: userClaudeMd.content,
      });
      set((state) => ({
        userClaudeMd: {
          ...state.userClaudeMd,
          exists: true,
          isDirty: false,
          lastModified: new Date().toISOString(),
        },
        isSaving: false,
      }));
    } catch (error) {
      set({ error: String(error), isSaving: false });
    }
  },

  discardChanges: async () => {
    await get().loadUserClaudeMd();
  },

  clearError: () => set({ error: null }),
}));
```

#### 2.3.2 扩展 scenesStore

在 `scenesStore.ts` 中添加 Claude.md 相关功能：

```typescript
// 新增方法
updateSceneClaudeMd: async (sceneId: string, content: string) => {
  await get().updateScene(sceneId, { claudeMdContent: content });
},

// 修改 getAvailableSkills/Mcps，过滤插件来源
getDistributableSkills: () => {
  return useSkillsStore.getState().skills.filter(
    (skill) => skill.installSource !== 'plugin'
  );
},

getDistributableMcps: () => {
  return useMcpsStore.getState().mcpServers.filter(
    (mcp) => mcp.installSource !== 'plugin'
  );
},
```

### 2.4 UI 设计

#### 2.4.1 页面布局选项

**推荐方案：集成到 Scene 详情页**

理由：
- Claude.md 主要与 Scene 分发关联
- 减少导航复杂度
- 与现有 Skills/MCPs 选择器并列

**UI 结构**：

```
Scene 详情/编辑页
├── 基本信息区域
│   ├── 名称
│   └── 描述
├── Skills 选择器（标签页 1）
├── MCPs 选择器（标签页 2）
├── Claude.md 编辑器（标签页 3）★ 新增
│   ├── Markdown 编辑区
│   ├── 预览切换按钮
│   └── 分发策略选项
└── 操作按钮
    ├── 保存
    └── 取消
```

#### 2.4.2 Claude.md 编辑器组件

```tsx
// src/components/scenes/ClaudeMdEditor.tsx
interface ClaudeMdEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  showPreview?: boolean;
}
```

特性：
- 支持 Markdown 语法高亮
- 支持预览模式切换
- 显示字符数统计（官方建议保持简洁）
- 提供模板/示例按钮

#### 2.4.3 用户级 Claude.md 管理入口

在 Settings 页面或独立区域添加：

```
Settings
├── 常规设置
├── 目录设置
├── Claude.md 设置 ★ 新增
│   ├── 用户级 Claude.md 编辑器
│   ├── 保存/重置按钮
│   └── 状态提示（未保存修改等）
└── 其他设置
```

### 2.5 Scene 分发策略

#### 2.5.1 分发机制

当用户将 Scene 应用到项目时：

```
分发流程：
1. 检查项目是否已有 .claude/CLAUDE.md
2. 如果有：
   a. 检查是否为 symlink（之前由 Ensemble 创建）
   b. 如果是 symlink：直接替换
   c. 如果是普通文件：提示用户选择（覆盖/追加/跳过）
3. 如果没有：直接创建
4. 创建方式：复制内容到 .claude/CLAUDE.md
```

#### 2.5.2 分发策略选项

```typescript
type ClaudeMdDistributionStrategy =
  | 'copy'      // 复制内容到项目（推荐）
  | 'symlink'   // 创建 symlink 指向 Ensemble 管理的文件
  | 'skip';     // 跳过，不处理 Claude.md

interface SceneDistributionOptions {
  claudeMdStrategy: ClaudeMdDistributionStrategy;
  conflictResolution: 'overwrite' | 'append' | 'skip' | 'ask';
}
```

**推荐默认策略**：`copy` + `ask`

理由：
- 复制比 symlink 更简单，避免路径问题
- 遇到冲突时让用户决定，避免覆盖重要内容

#### 2.5.3 分发内容合并规则

当用户选择"追加"时：

```markdown
<!-- Existing project CLAUDE.md content -->
[原有内容]

---
<!-- Added by Ensemble Scene: {scene-name} -->

[Scene 的 claudeMdContent]
```

---

## 三、插件资源处理

### 3.1 导入功能设计

#### 3.1.1 当前实现回顾

根据代码分析，导入功能**已基本实现**：

1. **检测**：`detect_plugin_skills` / `detect_plugin_mcps` 命令
2. **导入**：`import_plugin_skills` / `import_plugin_mcps` 命令
3. **标记**：`importedPluginSkills` / `importedPluginMcps` 数组
4. **过滤**：`getUnimportedPluginSkills()` / `getUnimportedPluginMcps()`

#### 3.1.2 导入流程确认

```
导入流程：
1. 检测插件 Skills/MCPs
   └─ 调用 detect_plugin_skills/mcps，传入已导入 ID 列表
   └─ 返回结果中 isImported=true 的已过滤

2. 用户选择要导入的项
   └─ UI 仅显示 isImported=false 的项

3. 执行导入
   └─ 调用 import_plugin_skills/mcps
   └─ 复制到 ~/.ensemble/skills/ 或 ~/.ensemble/mcps/
   └─ 返回导入的 pluginId 列表

4. 更新已导入标记
   └─ addImportedPluginSkills/Mcps(ids)
   └─ persistImportedPluginIds() 写入 data.json

5. 刷新列表
   └─ loadSkills() / loadMcps()
```

### 3.2 已导入标记机制

#### 3.2.1 标记格式

```typescript
// 两种格式
const pluginId = "plugin-name@marketplace";           // 基本格式
const pluginSkillId = "plugin-name@marketplace|skill-name";  // 带资源名格式
```

#### 3.2.2 标记存储

```json
// ~/.ensemble/data.json
{
  "importedPluginSkills": [
    "algorithmic-art@claude-code-settings",
    "skill-creator@claude-code-settings|skill-creator"
  ],
  "importedPluginMcps": [
    "context7@claude-plugins-official"
  ]
}
```

#### 3.2.3 标记判断逻辑

```typescript
// 在 Rust 后端 detect_plugin_skills 中
fn is_skill_imported(
  plugin_id: &str,
  skill_name: &str,
  imported_list: &[String]
) -> bool {
  // 检查完整 ID
  let full_id = format!("{}|{}", plugin_id, skill_name);
  if imported_list.contains(&full_id) {
    return true;
  }
  // 检查简化 ID（向后兼容）
  imported_list.contains(&plugin_id.to_string())
}
```

### 3.3 Scene 分发限制

#### 3.3.1 限制原理

插件安装的 Skill/MCP 是**全局生效**的，在任何项目中 Claude Code 都会加载它们。如果将这些资源加入 Scene 并分发到项目：
- 会在项目的 `.claude/skills/` 或 `.mcp.json` 中创建重复配置
- 导致资源被加载两次（一次全局，一次项目级）
- 可能引起冲突或混乱

#### 3.3.2 实现方案

**方案 A：在 UI 层过滤（推荐）**

```typescript
// scenesStore.ts
getDistributableSkills: () => {
  return useSkillsStore.getState().skills.filter(
    (skill) => skill.installSource !== 'plugin'
  );
},

getDistributableMcps: () => {
  return useMcpsStore.getState().mcpServers.filter(
    (mcp) => mcp.installSource !== 'plugin'
  );
},
```

在 Scene 创建/编辑 Modal 中：
- 使用 `getDistributableSkills/Mcps` 而不是 `getAvailableSkills/Mcps`
- 或显示所有资源但禁用插件来源的项

**方案 B：在 UI 中显示但禁用**

```tsx
// SceneSkillSelector.tsx
{skills.map((skill) => {
  const isPlugin = skill.installSource === 'plugin';
  return (
    <SkillItem
      key={skill.id}
      skill={skill}
      disabled={isPlugin}
      disabledReason={isPlugin ? "Plugin resources are globally available" : undefined}
      selected={selectedIds.includes(skill.id)}
      onToggle={() => !isPlugin && toggleSelection(skill.id)}
    />
  );
})}
```

**推荐**：方案 A + 方案 B 结合
- 默认过滤掉插件资源（方案 A）
- 提供"显示全部"开关，显示时插件资源为禁用状态（方案 B）

### 3.4 UI 标识设计

#### 3.4.1 来源徽章

在 Skills/MCPs 列表中，为插件来源的资源添加徽章：

```tsx
// SkillCard.tsx / McpCard.tsx
{skill.installSource === 'plugin' && (
  <Badge variant="secondary" className="text-xs">
    <Package className="w-3 h-3 mr-1" />
    Plugin
  </Badge>
)}
```

#### 3.4.2 分组显示

在列表中将插件来源的资源分组显示在底部：

```
Skills
├── 本地 Skills
│   ├── my-custom-skill
│   └── project-helper
├── 分隔线 ─────────────────
└── 插件 Skills（全局可用）
    ├── skill-creator (Plugin)
    └── algorithmic-art (Plugin)
```

#### 3.4.3 详情面板标识

在 Skill/MCP 详情面板中显示来源信息：

```
来源: Plugin (skill-creator@claude-code-settings)
Marketplace: claude-code-settings
版本: 1.0.0
状态: 已启用 / 已禁用
```

---

## 四、数据模型详细设计

### 4.1 Scene 模型扩展

```typescript
// src/types/index.ts

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
  // 新增字段
  claudeMdContent?: string;  // Scene 的 Claude.md 内容
  claudeMdStrategy?: ClaudeMdDistributionStrategy;  // 分发策略
}

export type ClaudeMdDistributionStrategy = 'copy' | 'symlink' | 'skip';
```

### 4.2 data.json 结构

```json
{
  "categories": [...],
  "tags": [...],
  "scenes": [
    {
      "id": "uuid-1",
      "name": "Web Development",
      "description": "Frontend development scene",
      "icon": "code",
      "skillIds": ["/Users/bo/.ensemble/skills/agent-browser"],
      "mcpIds": ["/Users/bo/.ensemble/mcps/filesystem.json"],
      "createdAt": "2026-02-04T10:00:00Z",
      "lastUsed": "2026-02-04T12:00:00Z",
      "claudeMdContent": "# Code Style\n\n- Use TypeScript\n- Follow ESLint rules",
      "claudeMdStrategy": "copy"
    }
  ],
  "projects": [...],
  "skillMetadata": {...},
  "mcpMetadata": {...},
  "trashedScenes": [],
  "trashedProjects": [],
  "importedPluginSkills": [
    "skill-creator@claude-code-settings|skill-creator",
    "algorithmic-art@claude-code-settings"
  ],
  "importedPluginMcps": [
    "context7@claude-plugins-official"
  ]
}
```

### 4.3 新增类型定义

```typescript
// src/types/index.ts - 新增类型

// ==================== Claude.md 相关类型 ====================

/**
 * Claude.md 文件信息（从 Rust 后端返回）
 */
export interface ClaudeMdFile {
  path: string;
  content: string;
  exists: boolean;
  lastModified?: string;
  level: ClaudeMdLevel;
}

/**
 * Claude.md 配置层级
 */
export type ClaudeMdLevel = 'user' | 'project' | 'local';

/**
 * Claude.md 分发策略
 */
export type ClaudeMdDistributionStrategy = 'copy' | 'symlink' | 'skip';

/**
 * Claude.md 冲突解决策略
 */
export type ClaudeMdConflictResolution = 'overwrite' | 'append' | 'skip' | 'ask';

/**
 * Scene 分发选项
 */
export interface SceneDistributionOptions {
  claudeMdStrategy: ClaudeMdDistributionStrategy;
  conflictResolution: ClaudeMdConflictResolution;
}

/**
 * 分发 Claude.md 的结果
 */
export interface ClaudeMdDistributionResult {
  success: boolean;
  targetPath: string;
  action: 'created' | 'overwritten' | 'appended' | 'skipped';
  error?: string;
}
```

### 4.4 Rust 数据结构

```rust
// src-tauri/src/types.rs

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeMdFile {
    pub path: String,
    pub content: String,
    pub exists: bool,
    pub last_modified: Option<String>,
    pub level: String,  // "user" | "project" | "local"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeMdDistributionResult {
    pub success: bool,
    pub target_path: String,
    pub action: String,  // "created" | "overwritten" | "appended" | "skipped"
    pub error: Option<String>,
}
```

---

## 五、Rust 后端扩展

### 5.1 新增命令

#### 5.1.1 Claude.md 读写命令

```rust
// src-tauri/src/commands/claude_md.rs

/// 读取 Claude.md 文件
#[tauri::command]
pub fn read_claude_md(path: String) -> Result<ClaudeMdFile, String> {
    let expanded_path = expand_path(&path);

    let exists = expanded_path.exists();
    let content = if exists {
        fs::read_to_string(&expanded_path).map_err(|e| e.to_string())?
    } else {
        String::new()
    };

    let last_modified = if exists {
        expanded_path
            .metadata()
            .ok()
            .and_then(|m| m.modified().ok())
            .map(|t| {
                chrono::DateTime::<chrono::Utc>::from(t)
                    .to_rfc3339()
            })
    } else {
        None
    };

    let level = if path.contains("CLAUDE.local.md") {
        "local"
    } else if path.starts_with("~/.claude") || path.contains(".claude/CLAUDE.md") {
        "user"
    } else {
        "project"
    };

    Ok(ClaudeMdFile {
        path: expanded_path.to_string_lossy().to_string(),
        content,
        exists,
        last_modified,
        level: level.to_string(),
    })
}

/// 写入 Claude.md 文件
#[tauri::command]
pub fn write_claude_md(path: String, content: String) -> Result<(), String> {
    let expanded_path = expand_path(&path);

    // 确保父目录存在
    if let Some(parent) = expanded_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(&expanded_path, content).map_err(|e| e.to_string())?;

    Ok(())
}

/// 检测项目的 Claude.md 状态
#[tauri::command]
pub fn detect_project_claude_md(project_path: String) -> Result<ClaudeMdFile, String> {
    let project_path = expand_path(&project_path);

    // 优先检查 .claude/CLAUDE.md
    let claude_dir_path = project_path.join(".claude").join("CLAUDE.md");
    if claude_dir_path.exists() {
        return read_claude_md(claude_dir_path.to_string_lossy().to_string());
    }

    // 其次检查根目录 CLAUDE.md
    let root_path = project_path.join("CLAUDE.md");
    if root_path.exists() {
        return read_claude_md(root_path.to_string_lossy().to_string());
    }

    // 都不存在，返回空状态
    Ok(ClaudeMdFile {
        path: claude_dir_path.to_string_lossy().to_string(),
        content: String::new(),
        exists: false,
        last_modified: None,
        level: "project".to_string(),
    })
}

/// 分发 Claude.md 到项目
#[tauri::command]
pub fn distribute_claude_md(
    project_path: String,
    content: String,
    strategy: String,        // "copy" | "symlink" | "skip"
    conflict_resolution: String,  // "overwrite" | "append" | "skip"
    scene_name: Option<String>,
) -> Result<ClaudeMdDistributionResult, String> {
    if strategy == "skip" {
        return Ok(ClaudeMdDistributionResult {
            success: true,
            target_path: String::new(),
            action: "skipped".to_string(),
            error: None,
        });
    }

    let project_path = expand_path(&project_path);
    let target_path = project_path.join(".claude").join("CLAUDE.md");

    // 确保 .claude 目录存在
    let claude_dir = project_path.join(".claude");
    fs::create_dir_all(&claude_dir).map_err(|e| e.to_string())?;

    let exists = target_path.exists();

    if exists && conflict_resolution == "skip" {
        return Ok(ClaudeMdDistributionResult {
            success: true,
            target_path: target_path.to_string_lossy().to_string(),
            action: "skipped".to_string(),
            error: None,
        });
    }

    let final_content = if exists && conflict_resolution == "append" {
        let existing = fs::read_to_string(&target_path).map_err(|e| e.to_string())?;
        let separator = match &scene_name {
            Some(name) => format!("\n\n---\n<!-- Added by Ensemble Scene: {} -->\n\n", name),
            None => "\n\n---\n<!-- Added by Ensemble -->\n\n".to_string(),
        };
        format!("{}{}{}", existing, separator, content)
    } else {
        content
    };

    // 根据策略写入
    match strategy.as_str() {
        "copy" => {
            fs::write(&target_path, final_content).map_err(|e| e.to_string())?;
        }
        "symlink" => {
            // symlink 策略需要先将内容保存到 Ensemble 管理的位置
            // 然后创建 symlink 指向该位置
            // 这里简化处理，使用 copy
            fs::write(&target_path, final_content).map_err(|e| e.to_string())?;
        }
        _ => {
            return Err(format!("Unknown strategy: {}", strategy));
        }
    }

    let action = if exists {
        if conflict_resolution == "append" {
            "appended"
        } else {
            "overwritten"
        }
    } else {
        "created"
    };

    Ok(ClaudeMdDistributionResult {
        success: true,
        target_path: target_path.to_string_lossy().to_string(),
        action: action.to_string(),
        error: None,
    })
}
```

#### 5.1.2 注册命令

```rust
// src-tauri/src/commands/mod.rs

pub mod claude_md;

// 在 main.rs 中注册
.invoke_handler(tauri::generate_handler![
    // 现有命令...
    commands::claude_md::read_claude_md,
    commands::claude_md::write_claude_md,
    commands::claude_md::detect_project_claude_md,
    commands::claude_md::distribute_claude_md,
])
```

### 5.2 配置同步流程

#### 5.2.1 Scene 应用到项目的完整流程

```
apply_scene_to_project(project_path, scene_id)
│
├── 1. 获取 Scene 配置
│   └── 从 data.json 读取 scene
│
├── 2. 同步 Skills
│   ├── 过滤掉 installSource === 'plugin' 的 skills
│   └── 为每个 skill 创建 symlink 到项目 .claude/skills/
│
├── 3. 同步 MCPs
│   ├── 过滤掉 installSource === 'plugin' 的 mcps
│   └── 合并到项目 .mcp.json
│
├── 4. 同步 Claude.md ★ 新增
│   ├── 检查 scene.claudeMdContent 是否存在
│   ├── 如果存在：
│   │   ├── 检查项目 .claude/CLAUDE.md 是否存在
│   │   ├── 根据 conflictResolution 处理冲突
│   │   └── 根据 claudeMdStrategy 写入内容
│   └── 如果不存在：跳过
│
└── 5. 更新项目同步状态
    └── 更新 project.lastSynced
```

#### 5.2.2 扩展现有同步命令

```rust
// 修改 sync_project_config 命令
#[tauri::command]
pub fn sync_project_config(
    project_path: String,
    scene_id: String,
    claude_md_options: Option<ClaudeMdSyncOptions>,
) -> Result<SyncResult, String> {
    // ... 现有 skill/mcp 同步逻辑

    // 新增 Claude.md 同步
    if let Some(options) = claude_md_options {
        if let Some(content) = options.content {
            distribute_claude_md(
                project_path.clone(),
                content,
                options.strategy.unwrap_or("copy".to_string()),
                options.conflict_resolution.unwrap_or("ask".to_string()),
                options.scene_name,
            )?;
        }
    }

    Ok(SyncResult { ... })
}

#[derive(Debug, Deserialize)]
pub struct ClaudeMdSyncOptions {
    pub content: Option<String>,
    pub strategy: Option<String>,
    pub conflict_resolution: Option<String>,
    pub scene_name: Option<String>,
}
```

---

## 六、UI 变更清单

### 6.1 新增页面/组件

| 组件名 | 路径 | 说明 |
|-------|------|------|
| `ClaudeMdEditor` | `src/components/claude-md/ClaudeMdEditor.tsx` | Markdown 编辑器组件 |
| `ClaudeMdPreview` | `src/components/claude-md/ClaudeMdPreview.tsx` | Markdown 预览组件 |
| `UserClaudeMdPanel` | `src/components/settings/UserClaudeMdPanel.tsx` | Settings 中的用户级 Claude.md 管理面板 |
| `SceneClaudeMdTab` | `src/components/scenes/SceneClaudeMdTab.tsx` | Scene 编辑器中的 Claude.md 标签页 |
| `ClaudeMdDistributionOptions` | `src/components/scenes/ClaudeMdDistributionOptions.tsx` | 分发策略选择组件 |

### 6.2 修改的现有页面/组件

| 组件名 | 路径 | 修改内容 |
|-------|------|----------|
| `CreateSceneModal` | `src/components/scenes/CreateSceneModal.tsx` | 添加 Claude.md 标签页；过滤插件资源 |
| `SceneDetailPanel` | `src/components/scenes/SceneDetailPanel.tsx` | 显示关联的 Claude.md 内容 |
| `SkillCard` | `src/components/skills/SkillCard.tsx` | 添加 Plugin 徽章 |
| `McpCard` | `src/components/mcps/McpCard.tsx` | 添加 Plugin 徽章 |
| `SkillsPage` | `src/pages/SkillsPage.tsx` | 分组显示（本地/插件） |
| `McpsPage` | `src/pages/McpsPage.tsx` | 分组显示（本地/插件） |
| `SettingsPage` | `src/pages/SettingsPage.tsx` | 添加 Claude.md 设置区域 |

### 6.3 新增 Store

| Store 名 | 路径 | 说明 |
|----------|------|------|
| `claudeMdStore` | `src/stores/claudeMdStore.ts` | 管理用户级 Claude.md 状态 |

### 6.4 修改的现有 Store

| Store 名 | 修改内容 |
|----------|----------|
| `scenesStore` | 添加 `updateSceneClaudeMd`、`getDistributableSkills`、`getDistributableMcps` |

---

## 七、实施优先级

### 7.1 Phase 1: 核心功能（必须实现）

- [x] ~~已实现：插件资源导入和标记机制~~
- [ ] 插件资源的 Scene 分发限制
  - [ ] `scenesStore` 添加 `getDistributableSkills/Mcps` 方法
  - [ ] `CreateSceneModal` 使用过滤后的列表
- [ ] Skills/MCPs 列表的 Plugin 徽章
  - [ ] `SkillCard` 添加徽章
  - [ ] `McpCard` 添加徽章
- [ ] Scene 模型扩展
  - [ ] 添加 `claudeMdContent` 字段
  - [ ] 更新 TypeScript 类型
  - [ ] 更新 Rust 数据结构

### 7.2 Phase 2: Claude.md 基础功能

- [ ] Rust 后端 Claude.md 命令
  - [ ] `read_claude_md`
  - [ ] `write_claude_md`
  - [ ] `detect_project_claude_md`
- [ ] `claudeMdStore` 创建
- [ ] Scene 创建/编辑中的 Claude.md 标签页
  - [ ] `ClaudeMdEditor` 组件
  - [ ] 集成到 `CreateSceneModal`

### 7.3 Phase 3: 完整分发功能

- [ ] `distribute_claude_md` 命令
- [ ] 分发策略 UI
  - [ ] `ClaudeMdDistributionOptions` 组件
- [ ] 冲突处理对话框
- [ ] 扩展 `sync_project_config` 命令

### 7.4 Phase 4: 增强功能

- [ ] 用户级 Claude.md 管理
  - [ ] `UserClaudeMdPanel` 组件
  - [ ] 集成到 Settings 页面
- [ ] Markdown 预览
  - [ ] `ClaudeMdPreview` 组件
- [ ] Skills/MCPs 分组显示
- [ ] 插件详情显示（来源、版本、marketplace）

---

## 八、边界情况处理

### 8.1 场景：项目已有 CLAUDE.md

**问题**：用户项目中可能已存在 CLAUDE.md，可能是手动创建或其他工具生成的。

**处理方案**：
1. **首次分发时**：弹出对话框询问用户
   - 覆盖：完全替换现有内容
   - 追加：在现有内容后添加 Scene 配置（带分隔标记）
   - 跳过：保持现有文件不变
2. **后续分发时**：
   - 如果内容包含 Ensemble 标记（`<!-- Added by Ensemble`），仅更新 Ensemble 部分
   - 否则按用户设置的默认策略处理

```typescript
// 冲突检测
interface ClaudeMdConflict {
  projectPath: string;
  existingContent: string;
  isEnsembleManaged: boolean;  // 是否包含 Ensemble 标记
  lastModified: string;
}
```

### 8.2 场景：插件更新后版本变化

**问题**：插件通过 Claude Code 更新后，版本号变化，可能导致已导入的资源与源不一致。

**处理方案**：
1. **检测机制**：在加载 Skills/MCPs 时，比较导入资源的 `pluginId` 和当前插件版本
2. **UI 提示**：如果版本不一致，显示"有新版本可用"提示
3. **重新导入**：用户可以选择重新导入以获取更新的版本

```typescript
interface PluginVersionCheck {
  pluginId: string;
  importedVersion: string;
  currentVersion: string;
  hasUpdate: boolean;
}
```

### 8.3 场景：插件被禁用

**问题**：用户在 Claude Code 中禁用了某个插件，但 Ensemble 中已有导入的资源。

**处理方案**：
1. **显示状态**：在 UI 中显示"原插件已禁用"状态
2. **功能不受影响**：导入的资源仍然可用（因为是复制的）
3. **可选同步**：提供"同步插件状态"选项，可以批量禁用/启用关联资源

### 8.4 场景：删除已导入的资源

**问题**：用户删除了从插件导入的 Skill/MCP，但标记仍然存在。

**处理方案**：
1. **删除时更新标记**：在 `deleteSkill`/`deleteMcp` 中同时移除 `importedPluginSkills`/`importedPluginMcps` 中的对应项
2. **重新检测时可见**：删除后，该资源会重新出现在导入列表中

```typescript
// skillsStore.deleteSkill 扩展
deleteSkill: async (id) => {
  const skill = get().skills.find(s => s.id === id);

  // 执行删除
  await safeInvoke('delete_skill', { id });

  // 如果是插件导入的，移除导入标记
  if (skill?.installSource === 'plugin' && skill?.pluginId) {
    const { removeImportedPluginSkill } = usePluginsStore.getState();
    removeImportedPluginSkill(skill.pluginId);
  }

  // 更新状态
  set((state) => ({
    skills: state.skills.filter(s => s.id !== id),
  }));
}
```

### 8.5 场景：Scene 中包含已删除的资源

**问题**：Scene 引用的 skillId/mcpId 对应的资源被删除。

**处理方案**：
1. **显示警告**：在 Scene 详情中显示"包含不存在的资源"警告
2. **同步时跳过**：分发到项目时，跳过不存在的资源
3. **清理功能**：提供"清理无效引用"按钮

---

## 九、设计决策说明

### 9.1 Claude.md 存储方式

**背景**：
- Scene 的 Claude.md 内容需要持久化
- 有两种方案：存在 data.json 中 vs 存为独立文件

**方案**：存储在 data.json 的 `scene.claudeMdContent` 字段中

**理由**：
1. **简化管理**：避免额外的文件管理逻辑
2. **原子更新**：Scene 的所有配置在同一处更新，保证一致性
3. **已有模式**：与现有的 metadata 存储方式一致
4. **内容适度**：Claude.md 内容通常较短（官方建议简洁），不会显著增加 data.json 大小

### 9.2 Scene 分发策略选择

**背景**：
- 需要决定分发 Claude.md 时使用复制还是 symlink

**方案**：默认使用 `copy`（复制）策略

**理由**：
1. **独立性**：复制后项目的 Claude.md 独立于 Ensemble，即使卸载 Ensemble 也不受影响
2. **版本控制**：复制的文件可以被 git 追踪，便于团队协作
3. **简单可靠**：避免 symlink 的路径问题和权限问题
4. **符合官方设计**：Claude Code 的 CLAUDE.md 设计就是独立文件

### 9.3 插件资源与 Scene 的关系

**背景**：
- 用户明确要求插件安装的全局资源不能加入 Scene

**方案**：在 UI 层过滤，显示但禁用

**理由**：
1. **透明性**：用户可以看到所有资源，理解为什么某些资源不能选择
2. **教育性**：通过禁用原因提示，帮助用户理解全局/项目级的区别
3. **灵活性**：未来如果需求变化，易于调整
4. **防误操作**：从根本上防止重复配置

### 9.4 用户级 Claude.md 管理位置

**背景**：
- 需要决定用户级 Claude.md 管理放在哪个页面

**方案**：放在 Settings 页面的独立区域

**理由**：
1. **语义清晰**：用户级配置属于"设置"范畴
2. **低频操作**：用户级 Claude.md 修改频率较低，不需要独立页面
3. **集中管理**：与其他全局设置放在一起，便于统一管理
4. **避免混淆**：与 Scene 级 Claude.md 明确区分

---

## 十、总结

### 10.1 核心要点

1. **Claude.md 管理**
   - 支持用户级（`~/.claude/CLAUDE.md`）和 Scene 级配置
   - Scene 级配置存储在 `data.json` 的 `scene.claudeMdContent` 字段
   - 分发策略默认使用复制，支持冲突处理

2. **插件资源处理**
   - 已有的导入和标记机制完善
   - 新增 Scene 分发限制：过滤 `installSource === 'plugin'` 的资源
   - UI 添加 Plugin 徽章和来源信息显示

3. **数据模型扩展**
   - `Scene` 接口新增 `claudeMdContent` 和 `claudeMdStrategy` 字段
   - 新增 `ClaudeMdFile`、`ClaudeMdDistributionResult` 等类型
   - Rust 后端新增 4 个 Claude.md 相关命令

4. **实施优先级**
   - Phase 1: 插件资源限制和 UI 标识（基础）
   - Phase 2: Claude.md 基础读写功能
   - Phase 3: 完整分发功能
   - Phase 4: 增强功能

### 10.2 预期效果

完成本设计方案后，Ensemble 将能够：
- 完整管理 Claude Code 的"三件套"：Skills、MCPs、Claude.md
- 清晰区分本地资源和插件资源，防止重复配置
- 将 Scene 配置（含 Claude.md）一键分发到项目
- 提供直观的 UI 展示资源来源和状态

### 10.3 后续考虑

1. **规则文件支持**：未来可考虑支持 `.claude/rules/*.md` 的管理
2. **模板系统**：提供常用 Claude.md 模板
3. **导入/导出**：支持 Scene 配置（含 Claude.md）的导入导出
4. **版本历史**：为 Claude.md 内容提供版本历史功能

---

*设计方案版本: 1.0*
*创建时间: 2026-02-04*
*创建者: SubAgent B4 (功能设计方案制定者)*
