# Ensemble 项目理解文档

## 一、项目概述

**Ensemble** 是一款 macOS 桌面应用，核心解决 Claude Code 每安装一个 MCP/Skill 都会占用额外上下文的问题。用户需要根据不同项目/场景按需启用特定的 Skills 和 MCPs。

### 核心设计理念
- **纯本地应用**：无任何后端服务，所有数据存储在本地
- **管理而非创建**：专注于已有 Skill/MCP 的组织管理，不负责新建
- **场景化配置**：通过 Scene（场景）预设 Skill+MCP 组合，快速应用到项目
- **极简高级质感**：白色背景，克制的色彩使用，精致的排版

### 技术栈
- **框架**：Tauri 2.0 (Rust 后端 + WebView 前端)
- **前端**：React 18 + TypeScript 5 + Tailwind CSS 4
- **状态管理**：Zustand
- **路由**：React Router
- **图标**：Lucide Icons

---

## 二、核心功能模块

### 2.1 Skills 管理
- **列表页** (Node ID: `rPgYw`)：展示所有 Skills，支持搜索、分类筛选、标签筛选
- **空状态** (Node ID: `DqVji`)：无 Skill 时的引导状态
- **按分类筛选** (Node ID: `xzUxa`)：选中某分类后的列表状态
- **按标签筛选** (Node ID: `vjc0x`)：选中某标签后的列表状态
- **详情页** (Node ID: `nNy4r`)：左侧列表 + 右侧详情的双栏布局

### 2.2 MCP Servers 管理
- **列表页** (Node ID: `hzMDi`)：展示所有 MCP Servers
- **空状态** (Node ID: `h1E7V`)：无 MCP 时的引导状态
- **详情页** (Node ID: `ltFNv`)：显示 MCP 提供的工具列表

### 2.3 Scenes 场景管理
- **列表页** (Node ID: `M7mYr`)：展示所有场景预设
- **空状态** (Node ID: `v7TIk`)：无场景时的引导状态
- **详情页** (Node ID: `LlxKB`)：显示场景包含的 Skills 和 MCPs
- **新建模态框** (Node ID: `Ek3cB`)：三栏布局的创建场景模态框

### 2.4 Projects 项目管理
- **列表页** (Node ID: `y0Mt4`)：项目列表及配置
- **空状态** (Node ID: `F1YbB`)：无项目时的引导状态
- **新建项目** (Node ID: `cdnEv`)：新建项目配置页

### 2.5 Settings 设置
- **设置页面** (Node ID: `qSzzi`)：存储配置 + API Key 配置

### 2.6 通用组件
- **分类下拉** (Node ID: `weNqA`)：Category Dropdown 组件
- **标签下拉** (Node ID: `moMFu`)：Tags Dropdown 组件（带搜索）
- **分类右键菜单** (Node ID: `v4ije`)：Context Menu (Rename/Delete)

---

## 三、核心数据模型

### Skill
```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;           // ~/.ensemble/skills/{name}/
  scope: 'user' | 'project';
  invocation?: string;          // /skill-name
  allowedTools?: string[];
  instructions: string;         // SKILL.md 内容
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}
```

### MCP Server
```typescript
interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;           // ~/.ensemble/mcps/{name}.json
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}
```

### Scene
```typescript
interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;                 // Lucide icon name
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  path: string;                 // 项目绝对路径
  sceneId: string;              // 关联的场景
  lastSynced?: string;
}
```

---

## 四、存储结构

```
~/.ensemble/                     # 应用数据目录
├── config.json                  # 应用设置
├── data.json                    # 分类、标签、场景、项目数据
├── skills/                      # Skill 源文件 (用户管理)
│   ├── frontend-design/
│   │   └── SKILL.md
│   └── github-explorer/
│       └── SKILL.md
└── mcps/                        # MCP 配置文件 (用户管理)
    ├── postgres-mcp.json
    └── filesystem-mcp.json

# 项目配置 (由 App 生成)
~/Projects/my-project/
└── .claude/
    ├── skills/                  # symlinks 指向 ~/.ensemble/skills/
    │   ├── frontend-design -> ~/.ensemble/skills/frontend-design
    │   └── react-expert -> ~/.ensemble/skills/react-expert
    └── mcp.json                 # 生成的 MCP 配置
```

---

## 五、核心工作流

### 项目配置同步流程
```
用户点击 "Sync Configuration"
         │
         ▼
┌─────────────────────────────────────┐
│ 1. 获取项目关联的 Scene             │
│ 2. 获取 Scene 包含的 Skills 和 MCPs │
└─────────────────┬───────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│ 创建 Skills     │ │ 生成 mcp.json  │
│ Symlinks        │ │                │
└─────────────────┘ └─────────────────┘
```

---

## 六、布局结构

### 整体布局
- **Sidebar**: 260px 固定宽度
- **Main Content**: fill_container

### Main Content 三种模式
1. **纯列表**：Skills/MCP Servers/Scenes 列表页
2. **列表+详情**：Skill Detail/MCP Detail/Scene Detail (List Panel 380px + Detail Panel fill)
3. **列表+配置**：Projects 页 (List Panel 400px + Config Panel fill)

---

## 七、设计稿信息

- **设计稿路径**：`/Users/bo/Downloads/MCP 管理.pen`
- **共 19 个页面/组件**
- **需要通过 pencil MCP 工具读取**

---

## 八、开发优先级

1. **项目初始化**：创建 Tauri + React 项目，配置 Tailwind
2. **布局框架**：实现 Sidebar + MainContent 基础布局
3. **通用组件**：Toggle、Badge、Button、Input、SearchInput、Dropdown、Modal
4. **Skills 模块**：列表页 → 详情页 → 筛选功能
5. **MCP 模块**：复用 Skills 的组件结构
6. **Scenes 模块**：列表页 → 详情页 → 新建模态框
7. **Projects 模块**：列表页 → 配置页 → 同步功能
8. **Settings 页面**：存储配置 + API Key 配置
9. **Tauri 后端**：文件扫描 → symlink → 配置生成
10. **自动分类**：Anthropic API 集成

---

## 九、验收标准

1. 所有页面与设计稿 1:1 匹配
2. 所有 19 个页面状态均已实现
3. 项目配置同步（symlink + mcp.json 生成）正常工作
4. 数据持久化正确
5. 错误处理友好
6. 所有交互行为符合文档描述
7. 代码结构清晰，类型完整
8. 无 console 错误和警告
