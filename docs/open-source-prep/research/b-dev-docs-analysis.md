# 开发文档分析报告

## 文档信息
- **日期**: 2026-02-05
- **作者**: SubAgent B
- **目的**: 分析 Ensemble 项目的开发文档，提取可用于 README 的内容

---

## 一、执行摘要

本报告分析了 Ensemble 项目的 5 个核心开发文档，提取了项目愿景、设计目标、核心功能、技术架构和发展历程等关键信息。所有指定文档均已成功读取和分析。

### 关键发现

1. **项目定位明确**: Ensemble 是一款 macOS 桌面应用，专注于管理 Claude Code 的 Skills、MCP Servers 和 CLAUDE.md 文件
2. **技术栈现代**: Tauri 2.0 + React 18 + TypeScript + Tailwind CSS 4，代码规模约 24,000+ 行
3. **功能完善**: 已完成前端 8 个页面、10 个通用组件、38 个 Tauri 后端命令
4. **设计精良**: 与设计稿 1:1 匹配，共实现 19 个设计稿页面/组件
5. **核心理念**: 场景化配置、纯本地存储、管理而非创建

---

## 二、项目愿景与设计目标

### 2.1 核心问题定义

> **Ensemble 核心解决 Claude Code 每安装一个 MCP/Skill 都会占用额外上下文的问题。用户需要根据不同项目/场景按需启用特定的 Skills 和 MCPs。**

### 2.2 设计理念

| 理念 | 说明 |
|------|------|
| **纯本地应用** | 无任何后端服务，所有数据存储在本地 |
| **管理而非创建** | 专注于已有 Skill/MCP 的组织管理，不负责新建 |
| **场景化配置** | 通过 Scene（场景）预设 Skill+MCP+Claude.md 组合，快速应用到项目 |
| **极简高级质感** | 白色背景，克制的色彩使用，精致的排版 |

### 2.3 设计目标

1. 让用户能够组织和分类已有的 Skills 和 MCP Servers
2. 通过 Scene 预设实现配置的快速复用
3. 为不同项目关联不同的场景配置
4. 一键同步配置到项目目录
5. 提供直观、美观的管理界面

### 2.4 可用于 README 的描述

> **核心价值主张**:
> Ensemble helps you manage and organize your Claude Code Skills, MCP Servers, and CLAUDE.md configurations. Create reusable Scenes that bundle your preferred tools, then apply them to any project with a single click.

> **问题陈述**:
> Every MCP Server and Skill you install in Claude Code consumes context. Ensemble solves this by letting you create project-specific configurations, enabling only the tools you need for each task.

---

## 三、核心功能特性提取

### 3.1 功能模块概览

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| **Skills 管理** | 扫描、分类、标签、导入、AI 自动分类 | 完成 |
| **MCP Servers 管理** | 扫描、配置、工具发现 | 完成 |
| **CLAUDE.md 管理** | 扫描、导入、全局设置、项目分发 | 完成 |
| **Scenes 场景管理** | 组合 Skills + MCPs + CLAUDE.md 的预设模板 | 完成 |
| **Projects 项目管理** | 关联场景、同步配置 | 完成 |
| **Settings 设置** | 终端应用选择、Finder 集成、回收站恢复 | 完成 |

### 3.2 详细功能清单

#### Skills 管理
- 自动扫描 `~/.ensemble/skills/` 目录中的 SKILL.md 文件
- 支持分类和标签组织
- 支持搜索和筛选
- 支持 AI 自动分类（Anthropic API 集成）
- 左侧列表 + 右侧详情的双栏布局

#### MCP Servers 管理
- 自动扫描 MCP 配置文件
- 显示每个 MCP 提供的工具列表
- 支持启用/禁用
- 配置可视化展示

#### Scenes 场景管理
- 创建包含 Skills + MCPs + CLAUDE.md 的预设组合
- 场景图标自定义
- 场景复制和编辑
- 三栏布局的创建模态框

#### Projects 项目管理
- 添加本地项目目录
- 为项目关联 Scene
- 一键同步配置到项目
- 支持配置清理

#### CLAUDE.md 管理 (新功能)
- 支持用户级（`~/.claude/CLAUDE.md`）和 Scene 级配置
- 分发策略：复制、符号链接、跳过
- 冲突处理：覆盖、追加、跳过、询问
- 完整管理 Claude Code 的"三件套"

### 3.3 可用于 README 的功能列表

```markdown
## Features

- **Skills Management**: Scan, categorize, and tag your Claude Code skills. Import skills from plugins with automatic detection.

- **MCP Servers Management**: Discover and manage MCP servers. View provided tools and configure settings.

- **Scene Presets**: Create reusable configurations that bundle Skills, MCPs, and CLAUDE.md content together.

- **Project Configuration**: Associate scenes with your local projects and sync configurations with one click.

- **CLAUDE.md Distribution**: Manage user-level and project-level CLAUDE.md files with smart conflict resolution.

- **AI-Powered Classification**: Automatically categorize your skills using Claude's intelligence.

- **Trash & Recovery**: Safely delete items with the ability to recover them later.
```

---

## 四、技术架构摘要

### 4.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Tauri | 2.9.5 | 桌面应用框架 |
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.9.3 | 类型系统 |
| Vite | 6.4.1 | 构建工具 |
| Tailwind CSS | 4.1.18 | 样式框架 |
| Zustand | 5.0.10 | 状态管理 |
| React Router | 7.13.0 | 路由 |
| Lucide Icons | 0.500.0 | 图标库 |
| Rust | 1.77.2+ | 后端语言 |

### 4.2 代码规模

| 类型 | 数量 |
|------|------|
| 前端 TypeScript 文件 | 94 个 |
| 前端代码行数 | ~24,177 行 |
| 后端 Rust 文件 | 19 个 |
| 开发文档 | 100+ 个 |
| 页面组件 | 8 个 |
| 通用组件 | 10 个 |
| 布局组件 | 4 个 |
| Zustand Stores | 6 个 |
| Tauri 命令 | 38 个 |

### 4.3 架构设计

```
前端架构:
src/
├── components/
│   ├── common/          # 通用组件 (10个)
│   ├── layout/          # 布局组件 (4个)
│   ├── skills/          # Skills 模块组件
│   ├── mcps/            # MCP 模块组件
│   ├── scenes/          # Scenes 模块组件
│   └── projects/        # Projects 模块组件
├── pages/               # 页面组件 (8个)
├── stores/              # Zustand stores (6个)
├── hooks/               # 自定义 hooks
├── utils/               # 工具函数
├── types/               # TypeScript 类型
├── App.tsx              # 主应用组件
└── main.tsx             # 入口文件

后端架构:
src-tauri/
├── src/
│   ├── commands/        # 38 个 Tauri 命令
│   │   ├── skills.rs    # Skills 扫描和管理
│   │   ├── mcps.rs      # MCP 扫描和管理
│   │   ├── symlink.rs   # Symlink 操作
│   │   ├── config.rs    # 配置生成
│   │   ├── data.rs      # 数据持久化
│   │   └── dialog.rs    # 文件对话框
│   ├── utils/           # 工具函数
│   ├── types.rs         # 数据类型
│   ├── lib.rs           # 命令注册
│   └── main.rs          # 入口
└── Cargo.toml           # Rust 依赖
```

### 4.4 核心数据模型

```typescript
// Skill
interface Skill {
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

// MCP Server
interface McpServer {
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

// Scene
interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  claudeMdContent?: string;  // 新增
  createdAt: string;
  lastUsed?: string;
}

// Project
interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
}
```

### 4.5 存储结构

```
~/.ensemble/                     # 应用数据目录
├── config.json                  # 应用设置
├── data.json                    # 分类、标签、场景、项目数据
├── skills/                      # Skill 源文件
│   └── {skill-name}/
│       └── SKILL.md
└── mcps/                        # MCP 配置文件
    └── {mcp-name}.json

# 项目配置 (由 Ensemble 生成)
~/Projects/{project}/
└── .claude/
    ├── skills/                  # symlinks 指向 ~/.ensemble/skills/
    ├── mcp.json                 # 生成的 MCP 配置
    └── CLAUDE.md                # 分发的 Claude.md
```

### 4.6 可用于 README 的技术描述

```markdown
## Tech Stack

- **Framework**: [Tauri 2.0](https://tauri.app) - Secure, lightweight desktop apps with Rust backend
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide Icons

## Architecture

Ensemble follows a clean separation between frontend and backend:

- **Frontend**: React-based UI with component-driven architecture
- **Backend**: Rust-powered Tauri commands for file system operations, symlink management, and configuration handling
- **Storage**: Local JSON files in `~/.ensemble/` for full data ownership
```

---

## 五、发展历程与里程碑

### 5.1 开发阶段

根据文档分析，项目经历了以下开发阶段：

| 阶段 | 内容 | 状态 |
|------|------|------|
| 批次 1 | 项目初始化：Tauri 2.0 + React + TypeScript | 完成 |
| 批次 2 | 基础组件库开发：10 个通用组件 | 完成 |
| 批次 3 | 布局组件开发：Sidebar、MainLayout 等 | 完成 |
| 批次 4 | Skills 模块开发 | 完成 |
| 批次 5 | MCP 模块开发 | 完成 |
| 批次 6 | Scenes 模块开发 | 完成 |
| 批次 7 | Projects 模块开发 | 完成 |
| 批次 8 | Settings 模块开发 | 完成 |
| 批次 9 | Tauri 后端开发：38 个命令 | 完成 |
| 批次 10 | 集成与测试 | 完成 |

### 5.2 重要 Git 提交

| 提交 | 说明 |
|------|------|
| `30153b7` | feat: Complete frontend implementation of Ensemble app |
| `e1714ec` | feat: Complete Tauri backend implementation |
| `2d3e599` | Merge branch 'feature/trash-recovery' |
| `08dfb57` | feat: Add trash recovery feature for deleted items |
| `b526c5a` | fix: Center empty state on Skills page |
| `4258196` | Merge branch 'feature/settings-simplify' |
| `41d6820` | refactor: Remove Storage section from Settings page |

### 5.3 功能演进

1. **初始版本**: Skills + MCP Servers 基础管理
2. **场景功能**: 添加 Scenes 模块，支持配置组合
3. **项目集成**: Projects 模块，实现配置同步
4. **Claude.md 支持**: 完整的 CLAUDE.md 管理功能（三位一体）
5. **插件系统**: 插件资源检测和导入
6. **回收站功能**: 删除项的恢复机制

### 5.4 设计稿验证

项目与设计稿 1:1 匹配，共实现 19 个设计稿页面/组件：

- Skills 列表、空状态、分类筛选、标签筛选、详情页
- MCP Servers 列表、空状态、详情页
- Scenes 列表、空状态、详情页、新建模态框
- Projects 列表、空状态、新建项目
- Settings 页面
- 分类下拉、标签下拉、分类右键菜单

---

## 六、可用于 README 的内容建议

### 6.1 项目标语建议

**选项 A（强调统一管理）**:
> Your Command Center for Claude Code - Manage Skills, MCPs, and CLAUDE.md in One Place

**选项 B（强调场景化）**:
> Scene-Based Configuration Manager for Claude Code

**选项 C（强调问题解决）**:
> Stop Context Bloat - Load Only What You Need for Each Project

### 6.2 项目简介建议

```markdown
# Ensemble

A native macOS application for managing Claude Code configurations. Ensemble helps you organize Skills, MCP Servers, and CLAUDE.md files into reusable Scenes that can be applied to any project.

## Why Ensemble?

Claude Code is powerful, but every installed MCP Server and Skill consumes context in every session. Ensemble solves this by letting you:

- **Organize** your growing collection of Skills and MCPs
- **Bundle** related tools into reusable Scenes
- **Apply** project-specific configurations with one click
- **Sync** your setup across multiple projects

Built with Tauri for native performance, all data stays on your machine.
```

### 6.3 功能截图建议

根据完成的页面，建议捕获以下截图：

1. **Skills Page** - 展示分类、标签筛选功能
2. **MCP Servers Page** - 展示工具发现功能
3. **Scene Detail** - 展示 Skills + MCPs + Claude.md 组合
4. **Project Configuration** - 展示一键同步功能
5. **Create Scene Modal** - 展示三栏选择界面

### 6.4 安装说明建议

```markdown
## Installation

### Prerequisites

- macOS 11.0 (Big Sur) or later
- [Node.js](https://nodejs.org/) 18+ (for development)
- [Rust](https://www.rust-lang.org/) 1.77+ (for development)

### Download

Download the latest release from the [Releases](https://github.com/O0000-code/Ensemble/releases) page.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/O0000-code/Ensemble.git
cd Ensemble

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```
```

### 6.5 快速开始建议

```markdown
## Quick Start

1. **Launch Ensemble** - Open the app after installation

2. **Scan Skills** - Ensemble automatically detects Skills in `~/.ensemble/skills/`

3. **Scan MCPs** - MCP configurations are loaded from Claude Code settings

4. **Create a Scene** - Bundle your favorite Skills and MCPs together

5. **Add a Project** - Point to your project directory

6. **Sync Configuration** - Apply the Scene to your project with one click

Your project now has a customized Claude Code setup in `.claude/`!
```

---

## 七、参考来源

本报告分析了以下文档：

1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/99-project-completion-report.md` - 项目完成报告
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/00-project-understanding.md` - 项目理解文档
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/02-development-master-plan.md` - 开发总规划
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/09-feature-design-proposal.md` - Claude.md 功能设计方案
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/10-research-summary-report.md` - Claude.md 研究总结报告

---

## 八、附录：术语表

为保证文档一致性，以下术语已在开发文档中定义：

| 术语 | 定义 |
|------|------|
| **Skill** | Claude Code 的技能模块，定义在 SKILL.md 文件中 |
| **MCP Server** | Model Context Protocol 服务器，提供工具能力 |
| **CLAUDE.md** | Claude Code 的项目级配置文件 |
| **Scene** | 场景预设，包含 Skills + MCPs + CLAUDE.md 的组合 |
| **Project** | 本地项目目录，关联一个 Scene |
| **Ensemble** | 本应用的名称 |
| **Global Scope** | 全局作用域，配置写入 `~/.claude/` |
| **Project Scope** | 项目作用域，配置写入项目 `.claude/` 目录 |

---

*报告版本: 1.0*
*分析完成时间: 2026-02-05*
