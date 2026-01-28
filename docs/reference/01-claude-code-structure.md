# Claude Code 本地目录结构分析

> 分析时间: 2026-01-28
> 分析目的: 为 Ensemble 应用的文件操作提供参考

---

## 一、Claude Code 目录结构概览

Claude Code 的配置存储在 `~/.claude/` 目录下：

```
~/.claude/
├── settings.json              # 用户级全局设置
├── settings.json.backup       # 设置备份
├── CLAUDE.md                  # 用户级全局指令（空文件或自定义内容）
├── history.jsonl              # 会话历史
├── stats-cache.json           # 统计缓存
├── statusline.sh              # 状态栏脚本
│
├── skills/                    # 用户级 Skills（symlinks）
├── commands/                  # 用户级自定义命令
├── .commands/                 # 已迁移的命令目录（遗留）
├── plugins/                   # 插件系统
│   ├── config.json           # 插件配置
│   ├── installed_plugins.json # 已安装插件列表
│   ├── known_marketplaces.json
│   ├── marketplaces/         # 市场元数据
│   ├── cache/                # 插件缓存
│   │   └── claude-code-settings/  # 官方 marketplace 插件
│   │       ├── skill-name/
│   │       │   └── 1.0.0/
│   │       │       ├── .claude-plugin/
│   │       │       │   └── plugin.json  # 插件元数据
│   │       │       └── skills/
│   │       │           └── skill-name/
│   │       │               └── SKILL.md
│   └── repos/
│
├── projects/                  # 项目会话数据（按路径命名）
│   └── -Users-bo-Documents-xxx/  # 项目路径转义后的目录名
│       └── {session-id}.jsonl    # 会话记录
│
├── agents/                    # Agent 配置（较少使用）
├── cache/                     # 缓存
├── debug/                     # 调试日志
├── downloads/                 # 下载文件
├── file-history/             # 文件历史
├── ide/                      # IDE 集成
├── paste-cache/              # 粘贴缓存
├── plans/                    # 计划存储
├── session-env/              # 会话环境
├── shell-snapshots/          # Shell 快照
├── tasks/                    # 任务数据
├── telemetry/                # 遥测数据
├── todos/                    # Todo 数据
└── transcripts/              # 转录记录
```

---

## 二、Skills 存储方式

### 2.1 存储位置

Claude Code 的 Skills 有两种来源：

1. **本地 Skills**（symlink 方式）
   - 位置: `~/.claude/skills/`
   - 存储方式: 通过 **symlink** 链接到实际 Skill 目录

2. **插件式 Skills**（Plugin 方式）
   - 位置: `~/.claude/plugins/cache/{marketplace}/{skill-name}/{version}/`
   - 在 `settings.json` 的 `enabledPlugins` 中启用

### 2.2 Skills 目录结构（实际观察）

```
~/.claude/skills/
├── agent-browser -> ../../.agents/skills/agent-browser
├── frontend-design -> ../../.agents/skills/frontend-design
├── remotion-best-practices -> ../../.agents/skills/remotion-best-practices
├── swiftui-expert-skill -> ../../.agents/skills/swiftui-expert-skill
├── vercel-react-best-practices -> ../../.agents/skills/vercel-react-best-practices
└── web-design-guidelines -> ../../.agents/skills/web-design-guidelines
```

**重要发现**: 用户的 Skills 实际存储在 `~/.agents/skills/` 目录，而 `~/.claude/skills/` 只是 symlinks。

### 2.3 单个 Skill 目录结构

```
~/.agents/skills/frontend-design/
├── SKILL.md           # 核心：Skill 定义文件（必需）
└── LICENSE.txt        # 可选：许可证文件
```

部分复杂 Skill 可能包含额外文件：
```
skill-name/
├── SKILL.md
├── LICENSE.txt
└── references/        # 可选：参考文档目录
    ├── state-management.md
    └── modern-apis.md
```

---

## 三、SKILL.md 文件格式

### 3.1 基本结构

SKILL.md 使用 **YAML Frontmatter + Markdown Body** 格式：

```markdown
---
name: skill-name
description: 简短描述，说明技能用途和触发场景
allowed-tools: Tool1, Tool2, Bash(command:*)
license: MIT
metadata:
  author: author-name
  version: "1.0.0"
---

# Skill 标题

## Overview
详细说明...

## Instructions
使用指南...
```

### 3.2 Frontmatter 字段说明

| 字段 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `name` | **是** | Skill 唯一标识符 | `frontend-design` |
| `description` | **是** | 描述触发场景和用途 | `Create distinctive, production-grade...` |
| `allowed-tools` | 否 | 允许使用的工具列表 | `Read, Write, Bash(npm:*)` |
| `license` | 否 | 许可证类型 | `MIT`, `Apache-2.0` |
| `metadata` | 否 | 额外元数据 | `author`, `version` |

### 3.3 allowed-tools 格式

```yaml
# 单个工具
allowed-tools: Read

# 多个工具（逗号分隔）
allowed-tools: Read, Write, Glob, Grep

# 带通配符的 Bash 命令
allowed-tools: Bash(npm:*), Bash(node:*)

# 完整示例
allowed-tools: Read, Write, Glob, Grep, Task, Bash(cat:*), Bash(ls:*), Bash(tree:*), Bash(codex:*)
```

### 3.4 实际示例

**示例 1: 简单 Skill**
```markdown
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces...
```

**示例 2: 带工具限制的 Skill**
```markdown
---
name: agent-browser
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction.
allowed-tools: Bash(agent-browser:*)
---

# Browser Automation with agent-browser
...
```

**示例 3: 带元数据的 Skill**
```markdown
---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices
...
```

---

## 四、MCP 配置方式

### 4.1 用户级配置

MCP 配置在 `settings.json` 中的 `mcpServers` 字段：

**位置**: `~/.claude/settings.json`

```json
{
  "mcpServers": {
    "server-name": {
      "command": "/path/to/mcp/server",
      "args": ["arg1", "arg2"],
      "env": {
        "API_KEY": "xxx"
      }
    }
  },
  "_disabled_mcpServers": {
    "disabled-server": {
      "command": "...",
      "args": [],
      "env": {}
    }
  }
}
```

### 4.2 项目级配置

项目级配置存储在项目目录的 `.claude/` 文件夹中：

**位置**: `{project}/.claude/settings.local.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run typecheck:*)",
      "Bash(npm run:*)",
      "Bash(npx tsc:*)"
    ],
    "deny": []
  }
}
```

**注意**: 当前观察到的项目级配置主要用于 **permissions**，未发现项目级 `mcp.json` 文件。

### 4.3 MCP Server 配置结构

```json
{
  "server-name": {
    "command": "string",      // 必需: 启动命令
    "args": ["string"],       // 可选: 命令参数数组
    "env": {                  // 可选: 环境变量
      "KEY": "value"
    }
  }
}
```

---

## 五、插件系统 (Plugins)

### 5.1 目录结构

```
~/.claude/plugins/
├── config.json               # 插件系统配置
├── installed_plugins.json    # 已安装插件清单
├── known_marketplaces.json   # 已知市场列表
├── marketplaces/             # 市场元数据缓存
├── cache/                    # 插件缓存
│   └── claude-code-settings/ # Anthropic 官方市场
│       └── skill-name/
│           └── 1.0.0/
│               ├── .claude-plugin/
│               │   └── plugin.json
│               └── skills/
│                   └── skill-name/
│                       └── SKILL.md
└── repos/                    # Git 仓库（较少使用）
```

### 5.2 plugin.json 格式

```json
{
  "name": "skill-creator",
  "version": "1.0.0",
  "description": "Guide for creating effective skills...",
  "author": {
    "name": "Anthropic",
    "url": "https://github.com/anthropics/skills"
  },
  "homepage": "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
  "license": "Apache-2.0",
  "keywords": ["skill", "creator", "meta-skill", "anthropic", "official"]
}
```

### 5.3 installed_plugins.json 格式

```json
{
  "version": 2,
  "plugins": {
    "skill-name@marketplace": [
      {
        "scope": "user",
        "installPath": "/Users/bo/.claude/projects/plugins/cache/...",
        "version": "1.0.0",
        "installedAt": "2025-12-07T07:35:26.893Z",
        "lastUpdated": "2025-12-07T07:35:26.893Z",
        "gitCommitSha": "759c06630e974ded7f8366b6eae02a126a0b3562"
      }
    ]
  }
}
```

### 5.4 settings.json 中的插件启用

```json
{
  "enabledPlugins": {
    "skill-name@claude-code-settings": true,
    "another-skill@claude-code-settings": true
  }
}
```

---

## 六、Symlink 机制说明

### 6.1 当前实现方式

Claude Code 使用 symlink 将 Skills 链接到 `~/.claude/skills/`：

```bash
# 实际存储位置
~/.agents/skills/frontend-design/SKILL.md

# Symlink 位置
~/.claude/skills/frontend-design -> ../../.agents/skills/frontend-design
```

### 6.2 Ensemble 应用的实现建议

Ensemble 应用需要：

1. **用户级 Skills 存储**: `~/.ensemble/skills/{skill-name}/SKILL.md`
2. **同步到 Claude Code**: 创建 symlink 到 `~/.claude/skills/`
3. **项目级配置**: 在项目的 `.claude/skills/` 创建 symlinks

```bash
# 用户级同步
ln -s ~/.ensemble/skills/my-skill ~/.claude/skills/my-skill

# 项目级同步
ln -s ~/.ensemble/skills/my-skill ~/Projects/my-app/.claude/skills/my-skill
```

### 6.3 MCP 配置同步

```bash
# 读取 Ensemble 配置
~/.ensemble/mcps/postgres-mcp.json

# 合并写入 Claude Code 配置
~/.claude/settings.json -> mcpServers 字段
```

---

## 七、配置优先级

### 7.1 Skills 加载顺序

1. **插件 Skills** (`enabledPlugins` 中启用的)
2. **用户级 Skills** (`~/.claude/skills/`)
3. **项目级 Skills** (`{project}/.claude/skills/`)

### 7.2 设置优先级

1. **项目级设置** (`{project}/.claude/settings.local.json`) - 最高优先级
2. **用户级设置** (`~/.claude/settings.json`) - 基础配置

### 7.3 MCP 配置优先级

目前观察到 MCP 配置只在用户级 `settings.json` 中定义，未发现项目级独立的 `mcp.json`。

---

## 八、关键发现总结

### 8.1 Skills

| 特性 | 说明 |
|------|------|
| 存储格式 | 目录 + SKILL.md 文件 |
| 用户级位置 | `~/.claude/skills/` (symlinks) |
| 实际存储 | 用户自定义位置（如 `~/.agents/skills/`）|
| 文件格式 | YAML Frontmatter + Markdown |
| 必需字段 | `name`, `description` |
| 可选字段 | `allowed-tools`, `license`, `metadata` |

### 8.2 MCP

| 特性 | 说明 |
|------|------|
| 配置位置 | `~/.claude/settings.json` |
| 配置字段 | `mcpServers` |
| 禁用配置 | `_disabled_mcpServers` |
| 项目级配置 | 未观察到独立 mcp.json |

### 8.3 项目级配置

| 特性 | 说明 |
|------|------|
| 目录位置 | `{project}/.claude/` |
| 配置文件 | `settings.local.json` |
| 主要用途 | 权限配置 (permissions) |
| Skills 目录 | `{project}/.claude/skills/` (symlinks) |

---

## 九、Ensemble 应用设计建议

基于以上分析，Ensemble 应用应该：

1. **Skills 管理**
   - 存储在 `~/.ensemble/skills/`
   - 同步时创建 symlinks 到 `~/.claude/skills/` 和项目级 `.claude/skills/`
   - 生成标准的 SKILL.md 文件

2. **MCP 管理**
   - 存储在 `~/.ensemble/mcps/`
   - 同步时更新 `~/.claude/settings.json` 的 `mcpServers` 字段
   - 注意保留用户现有配置，只增/删/改 Ensemble 管理的 MCP

3. **项目配置**
   - 创建项目 `.claude/` 目录
   - 创建 `skills/` 子目录放置 symlinks
   - 可选创建 `settings.local.json` 设置权限

4. **Scene 同步流程**
   ```
   Scene -> Skills + MCPs
         |
         ├── Skills: 创建 symlinks 到 .claude/skills/
         └── MCPs: 合并到 .claude/settings.json
   ```
