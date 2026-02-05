# 代码结构与功能分析报告

## 文档信息
- **日期**: 2026-02-05
- **作者**: SubAgent A
- **目的**: 从代码角度全面分析 Ensemble 项目的结构和功能

---

## 执行摘要

Ensemble 是一个基于 Tauri 2.0 (Rust + React) 构建的 macOS 桌面应用，用于管理 Claude Code 的三大核心资源：Skills、MCP Servers 和 CLAUDE.md 文件。项目采用现代前端技术栈（React 18 + TypeScript + Zustand + Tailwind CSS），后端使用 Rust 提供高性能的文件系统操作和配置管理。

### 核心发现

1. **三位一体管理**: Skills、MCP Servers、CLAUDE.md 是应用的核心管理对象
2. **场景与项目**: Scenes 将三者组合成预设，Projects 将场景应用到实际项目目录
3. **AI 自动分类**: 集成 Anthropic API 实现智能分类功能
4. **Finder 集成**: 支持右键菜单启动 Claude Code
5. **回收站恢复**: 已删除项目可恢复
6. **CLAUDE.md 功能完整**: 支持扫描、导入、全局设置、项目分发

---

## 项目结构概览

```
src/
├── App.tsx                 # 路由配置
├── pages/                  # 页面组件（8个主要页面）
├── components/             # UI 组件
│   ├── common/            # 通用组件（Button, Badge, EmptyState 等）
│   ├── layout/            # 布局组件（MainLayout, PageHeader, SlidePanel）
│   ├── skills/            # Skills 相关组件
│   ├── mcps/              # MCP 相关组件
│   ├── claude-md/         # CLAUDE.md 相关组件
│   ├── scenes/            # Scenes 相关组件
│   ├── projects/          # Projects 相关组件
│   └── modals/            # 模态框组件
├── stores/                # Zustand 状态管理（11个 store）
├── types/                 # TypeScript 类型定义
└── utils/                 # 工具函数

src-tauri/
├── src/
│   ├── lib.rs             # Tauri 入口和命令注册
│   ├── commands/          # Rust 命令模块
│   │   ├── skills.rs      # Skills CRUD
│   │   ├── mcps.rs        # MCPs CRUD
│   │   ├── claude_md.rs   # CLAUDE.md 管理
│   │   ├── config.rs      # 配置同步
│   │   ├── classify.rs    # AI 分类
│   │   ├── import.rs      # 导入功能
│   │   ├── trash.rs       # 回收站
│   │   └── ...
│   ├── types/             # Rust 类型定义
│   └── utils/             # 工具函数
```

---

## 页面功能清单

| 页面 | 路由 | 文件 | 核心功能 |
|------|------|------|----------|
| **Skills** | `/skills` | `SkillsPage.tsx` | Skills 列表、搜索、筛选、导入、AI 自动分类、详情面板（类别/标签/图标编辑） |
| **MCP Servers** | `/mcp-servers` | `McpServersPage.tsx` | MCP 列表、搜索、筛选、导入、AI 分类、工具发现（Fetch Tools）、详情面板 |
| **CLAUDE.md** | `/claude-md` | `ClaudeMdPage.tsx` | CLAUDE.md 文件管理、系统扫描、导入、AI 分类、全局设置、项目分发 |
| **Scenes** | `/scenes` | `ScenesPage.tsx` | 场景列表、创建场景（选择 Skills + MCPs + CLAUDE.md）、详情面板 |
| **Projects** | `/projects` | `ProjectsPage.tsx` | 项目列表、创建项目、关联场景、同步配置、清除配置 |
| **Category** | `/category/:categoryId` | `CategoryPage.tsx` | 按分类聚合显示 Skills、MCPs、CLAUDE.md |
| **Tag** | `/tag/:tagId` | `TagPage.tsx` | 按标签聚合显示 Skills、MCPs、CLAUDE.md |
| **Settings** | `/settings` | `SettingsPage.tsx` | CLAUDE.md 分发路径、终端应用、Finder 集成、回收站恢复、关于信息 |

---

## 后端命令清单

### Skills 命令
| 命令 | 功能 |
|------|------|
| `scan_skills` | 扫描 Skills 目录，返回所有 Skills 列表 |
| `get_skill` | 获取单个 Skill 详情 |
| `update_skill_metadata` | 更新 Skill 元数据（类别、标签、图标） |
| `delete_skill` | 删除 Skill（移至回收站） |

### MCPs 命令
| 命令 | 功能 |
|------|------|
| `scan_mcps` | 扫描 MCPs 目录，返回所有 MCP 列表 |
| `get_mcp` | 获取单个 MCP 详情 |
| `update_mcp_metadata` | 更新 MCP 元数据 |
| `delete_mcp` | 删除 MCP（移至回收站） |
| `fetch_mcp_tools` | 运行 MCP 服务器并获取可用工具列表 |

### CLAUDE.md 命令
| 命令 | 功能 |
|------|------|
| `scan_claude_md_files` | 扫描系统中的 CLAUDE.md 文件 |
| `import_claude_md` | 导入 CLAUDE.md 文件到应用管理 |
| `read_claude_md` | 读取 CLAUDE.md 内容 |
| `get_claude_md_files` | 获取所有已导入的 CLAUDE.md 文件 |
| `update_claude_md` | 更新 CLAUDE.md（内容、元数据） |
| `delete_claude_md` | 删除 CLAUDE.md（移至回收站） |
| `set_global_claude_md` | 设置为全局 CLAUDE.md（复制到 ~/.claude/CLAUDE.md） |
| `unset_global_claude_md` | 取消全局设置 |
| `distribute_claude_md` | 分发 CLAUDE.md 到项目目录 |
| `distribute_scene_claude_md` | 分发场景中的 CLAUDE.md 到多个项目 |

### Symlink 命令
| 命令 | 功能 |
|------|------|
| `create_symlink` | 创建符号链接 |
| `remove_symlink` | 删除符号链接 |
| `is_symlink` | 检查是否为符号链接 |
| `get_symlink_target` | 获取符号链接目标 |
| `create_symlinks` | 批量创建符号链接 |
| `remove_symlinks` | 批量删除符号链接 |

### Config 命令
| 命令 | 功能 |
|------|------|
| `write_mcp_config` | 写入 MCP 配置到 claude_desktop_config.json |
| `sync_project_config` | 同步项目配置（Skills 链接 + MCP 配置） |
| `clear_project_config` | 清除项目配置 |
| `get_project_config_status` | 获取项目配置状态 |

### Data 命令
| 命令 | 功能 |
|------|------|
| `read_app_data` | 读取应用数据 |
| `write_app_data` | 写入应用数据 |
| `read_settings` | 读取设置 |
| `write_settings` | 写入设置 |
| `init_app_data` | 初始化应用数据 |
| `get_categories` / `add_category` / `update_category` / `delete_category` | 分类 CRUD |
| `get_tags` / `add_tag` / `update_tag` / `delete_tag` | 标签 CRUD |
| `get_scenes` / `add_scene` / `update_scene` / `delete_scene` | 场景 CRUD |
| `get_projects` / `add_project` / `update_project` / `delete_project` | 项目 CRUD |

### Dialog 命令
| 命令 | 功能 |
|------|------|
| `select_folder` | 打开文件夹选择对话框 |
| `select_file` | 打开文件选择对话框 |
| `reveal_in_finder` | 在 Finder 中显示文件/文件夹 |

### Classify 命令
| 命令 | 功能 |
|------|------|
| `auto_classify` | 使用 Anthropic API 自动分类 Skills/MCPs/CLAUDE.md |
| `validate_api_key` | 验证 Anthropic API Key |

### Import 命令
| 命令 | 功能 |
|------|------|
| `detect_existing_config` | 检测现有 Claude 配置 |
| `backup_before_import` | 导入前备份 |
| `backup_claude_json` | 备份 claude.json |
| `import_existing_config` | 导入现有配置 |
| `update_skill_scope` | 更新 Skill 作用域（global/project） |
| `update_mcp_scope` | 更新 MCP 作用域 |
| `remove_imported_skills` | 移除已导入的 Skills |
| `remove_imported_mcps` | 移除已导入的 MCPs |
| `install_quick_action` | 安装 Finder Quick Action |
| `launch_claude_for_folder` | 为文件夹启动 Claude |
| `get_launch_args` | 获取启动参数 |
| `open_accessibility_settings` | 打开辅助功能设置 |

### Usage Stats 命令
| 命令 | 功能 |
|------|------|
| `scan_usage_stats` | 扫描使用统计信息 |

### Plugin 命令
| 命令 | 功能 |
|------|------|
| `detect_installed_plugins` | 检测已安装的插件 |
| `detect_plugin_skills` | 检测插件中的 Skills |
| `detect_plugin_mcps` | 检测插件中的 MCPs |
| `import_plugin_skills` | 导入插件 Skills |
| `import_plugin_mcps` | 导入插件 MCPs |
| `check_plugins_enabled` | 检查插件是否启用 |

### Trash 命令
| 命令 | 功能 |
|------|------|
| `list_trashed_items` | 列出回收站中的项目 |
| `restore_skill` | 恢复已删除的 Skill |
| `restore_mcp` | 恢复已删除的 MCP |
| `restore_claude_md` | 恢复已删除的 CLAUDE.md |

---

## 状态管理结构

### Store 清单

| Store | 文件 | 职责 |
|-------|------|------|
| **appStore** | `appStore.ts` | 全局应用状态（分类、标签、导航状态） |
| **skillsStore** | `skillsStore.ts` | Skills 数据、筛选、CRUD、AI 分类、使用统计 |
| **mcpsStore** | `mcpsStore.ts` | MCP Servers 数据、筛选、CRUD、工具发现、AI 分类 |
| **claudeMdStore** | `claudeMdStore.ts` | CLAUDE.md 文件、扫描、导入、全局设置、分发、AI 分类 |
| **scenesStore** | `scenesStore.ts` | Scenes 数据、CRUD、创建模态框状态 |
| **projectsStore** | `projectsStore.ts` | Projects 数据、CRUD、配置同步 |
| **settingsStore** | `settingsStore.ts` | 应用设置（路径、API Key、终端配置） |
| **importStore** | `importStore.ts` | 导入流程状态和检测结果 |
| **pluginsStore** | `pluginsStore.ts` | 插件检测和导入状态 |
| **launcherStore** | `launcherStore.ts` | Finder 启动器状态 |
| **trashStore** | `trashStore.ts` | 回收站状态和恢复操作 |

### 数据流架构

```
UI (Pages/Components)
        ↓ 读取/更新
Zustand Stores (skillsStore, mcpsStore, claudeMdStore, etc.)
        ↓ 调用
Tauri IPC (invoke)
        ↓
Rust Commands (src-tauri/src/commands/)
        ↓
File System / JSON Storage
```

---

## CLAUDE.md 功能详细分析

CLAUDE.md 是 Ensemble "三位一体"管理的重要组成部分，提供完整的 CLAUDE.md 文件生命周期管理。

### 核心功能

#### 1. 文件扫描 (`scanFiles`)
- 扫描指定路径和用户主目录
- 识别已有的 CLAUDE.md 文件
- 返回文件路径、大小、修改时间
- 标记已导入和未导入状态

#### 2. 文件导入 (`importFile`)
- 从任意位置导入 CLAUDE.md 文件
- 复制内容到应用管理的存储
- 自动生成唯一 ID
- 支持自定义名称和描述

#### 3. 内容管理
- **读取**: 获取文件完整内容
- **更新**: 修改内容、名称、描述、分类、标签、图标
- **删除**: 移至回收站，可恢复

#### 4. 全局设置 (`setGlobal` / `unsetGlobal`)
- 设置某个 CLAUDE.md 为全局配置
- 自动复制内容到 `~/.claude/CLAUDE.md`
- 全局文件会被 Claude Code 默认加载
- 支持取消全局设置

#### 5. 项目分发 (`distributeToProject`)
- 将 CLAUDE.md 内容分发到项目目录
- 支持三种分发路径：
  - `.claude/CLAUDE.md` (默认)
  - `CLAUDE.md` (项目根目录)
  - `CLAUDE.local.md` (本地配置)
- 可配置是否覆盖现有文件

#### 6. 场景分发 (`distribute_scene_claude_md`)
- 将场景中包含的 CLAUDE.md 批量分发到关联项目
- 支持多项目一键配置

#### 7. AI 自动分类 (`autoClassify`)
- 使用 Anthropic API 分析内容
- 自动建议分类和标签
- 自动建议图标
- 批量处理所有 CLAUDE.md 文件

### 数据模型

```typescript
interface ClaudeMdFile {
  id: string;              // 唯一标识符
  name: string;            // 显示名称
  description: string;     // 描述
  content: string;         // 文件内容
  sourcePath: string;      // 原始路径
  isGlobal: boolean;       // 是否为全局配置
  categoryId: string | null;  // 分类 ID
  tagIds: string[];        // 标签 ID 列表
  icon: string;            // 图标名称
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
}
```

### UI 交互

- **列表视图**: 卡片式展示，显示名称、描述、全局标记
- **详情面板**: 滑动面板显示完整内容和配置选项
- **快捷操作**: 设置全局、分发到项目、编辑元数据
- **扫描模态框**: 显示系统中发现的 CLAUDE.md 文件
- **导入模态框**: 文件选择和导入配置

---

## 完整功能清单总结

### 核心管理功能

| 功能 | Skills | MCPs | CLAUDE.md |
|------|--------|------|-----------|
| 扫描/发现 | yes | yes | yes |
| 导入 | yes | yes | yes |
| 查看详情 | yes | yes | yes |
| 编辑元数据 | yes | yes | yes |
| 分类管理 | yes | yes | yes |
| 标签管理 | yes | yes | yes |
| 图标自定义 | yes | yes | yes |
| AI 自动分类 | yes | yes | yes |
| 删除/恢复 | yes | yes | yes |
| 作用域管理 | yes (global/project) | yes (global/project) | yes (全局设置) |
| 项目分发 | - | - | yes |
| 工具发现 | - | yes (Fetch Tools) | - |

### 组织管理功能

| 功能 | 描述 |
|------|------|
| **Categories** | 分类管理，支持颜色自定义 |
| **Tags** | 标签管理，多对多关联 |
| **Scenes** | 场景预设，组合 Skills + MCPs + CLAUDE.md |
| **Projects** | 项目管理，关联场景并同步配置 |

### 系统集成功能

| 功能 | 描述 |
|------|------|
| **Finder Quick Action** | 右键菜单 "Open with Ensemble" |
| **终端集成** | 支持 Terminal.app、iTerm2、Warp、Alacritty |
| **配置同步** | 自动写入 `.claude/` 目录和 `claude_desktop_config.json` |
| **使用统计** | 读取 Claude 使用记录，显示调用次数 |
| **插件支持** | 检测和导入已安装插件的 Skills/MCPs |

### 用户体验功能

| 功能 | 描述 |
|------|------|
| **滑动详情面板** | 点击列表项从右侧滑入详情面板 |
| **搜索筛选** | 全局搜索 + 分类/标签筛选 |
| **空状态引导** | 友好的空状态提示和操作引导 |
| **错误处理** | 统一的错误提示和恢复机制 |
| **回收站** | 已删除项目可恢复 |

---

## 附录：关键文件路径参考

| 文件 | 路径 |
|------|------|
| 路由配置 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/App.tsx` |
| Skills 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx` |
| MCPs 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx` |
| CLAUDE.md 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ClaudeMdPage.tsx` |
| Scenes 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ScenesPage.tsx` |
| Projects 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/ProjectsPage.tsx` |
| Settings 页面 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SettingsPage.tsx` |
| Rust 入口 | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/lib.rs` |
| Skills Store | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts` |
| MCPs Store | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts` |
| CLAUDE.md Store | `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/claudeMdStore.ts` |

---

*报告生成完成 - SubAgent A*
