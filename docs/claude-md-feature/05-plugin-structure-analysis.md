# 本地插件结构分析报告

> 创建时间: 2026-02-04
> 创建者: SubAgent B2 (插件结构分析者)

---

## 一、插件目录结构

### 1.1 整体目录树

```
~/.claude/plugins/
├── cache/                              # 已安装插件的缓存目录
│   ├── claude-code-settings/           # Marketplace: claude-code-settings
│   │   ├── skill-creator/
│   │   │   └── 1.0.0/                  # 版本目录
│   │   │       ├── .claude-plugin/
│   │   │       │   └── plugin.json     # 插件元数据
│   │   │       ├── .orphaned_at        # 孤立时间戳（可选）
│   │   │       └── skills/
│   │   │           └── skill-creator/
│   │   │               ├── SKILL.md
│   │   │               ├── LICENSE.txt
│   │   │               ├── scripts/    # 可选：脚本目录
│   │   │               ├── references/ # 可选：参考文档
│   │   │               └── assets/     # 可选：资源文件
│   │   └── algorithmic-art/
│   │       └── 1.0.0/
│   │           └── ...
│   │
│   └── claude-plugins-official/        # Marketplace: claude-plugins-official
│       ├── context7/
│       │   └── 27d2b86d72da/           # 版本号可能是 git commit hash
│       │       ├── .claude-plugin/
│       │       │   └── plugin.json
│       │       └── .mcp.json           # MCP 类型插件配置
│       └── swift-lsp/
│           └── 1.0.0/
│               └── README.md           # LSP 类型只有 README
│
├── marketplaces/                       # Marketplace 仓库克隆目录
│   ├── claude-code-settings/           # feiskyer/claude-code-settings 仓库
│   ├── claude-plugins-official/        # anthropics/claude-plugins-official 仓库
│   ├── anthropic-agent-skills/         # anthropics/skills 仓库
│   └── life-sciences/                  # anthropics/life-sciences 仓库
│
├── installed_plugins.json              # 已安装插件清单
├── known_marketplaces.json             # 已知 marketplace 列表
├── config.json                         # 插件配置
├── install-counts-cache.json           # 安装计数缓存
└── repos/                              # 仓库目录（当前为空）
```

### 1.2 Skill 类型插件结构

Skill 类型插件有明确的目录结构规范：

```
{plugin-name}/{version}/
├── .claude-plugin/
│   └── plugin.json              # 必须：插件元数据
├── .orphaned_at                 # 可选：Unix 时间戳，标记孤立时间
├── skills/
│   └── {skill-name}/
│       ├── SKILL.md             # 必须：Skill 主文件
│       ├── LICENSE.txt          # 可选：许可证
│       ├── scripts/             # 可选：可执行脚本
│       │   └── *.py / *.sh
│       ├── references/          # 可选：参考文档
│       │   └── *.md
│       ├── templates/           # 可选：模板文件（部分插件使用）
│       │   └── *.html / *.js
│       └── assets/              # 可选：资源文件
│           └── images, fonts, etc.
```

**示例：skill-creator 插件**

```
skill-creator/1.0.0/
├── .claude-plugin/
│   └── plugin.json
├── .orphaned_at
└── skills/
    └── skill-creator/
        ├── SKILL.md
        ├── LICENSE.txt
        ├── references/
        │   ├── workflows.md
        │   └── output-patterns.md
        └── scripts/
            ├── init_skill.py
            ├── package_skill.py
            └── quick_validate.py
```

**示例：algorithmic-art 插件**

```
algorithmic-art/1.0.0/
├── .claude-plugin/
│   └── plugin.json
├── .orphaned_at
└── skills/
    └── algorithmic-art/
        ├── SKILL.md
        ├── LICENSE.txt
        └── templates/
            ├── generator_template.js
            └── viewer.html
```

### 1.3 MCP 类型插件结构

MCP 类型插件结构更简洁：

```
{plugin-name}/{version}/
├── .claude-plugin/
│   └── plugin.json              # 必须：插件元数据
└── .mcp.json                    # 必须：MCP 服务器配置
```

**示例：context7 插件**

```
context7/27d2b86d72da/
├── .claude-plugin/
│   └── plugin.json
└── .mcp.json
```

### 1.4 LSP 类型插件结构

LSP 类型插件最简单，仅包含说明文档：

```
{plugin-name}/{version}/
└── README.md                    # 仅包含安装说明
```

**示例：swift-lsp 插件**

```
swift-lsp/1.0.0/
└── README.md
```

### 1.5 混合类型插件结构

一些 marketplace 仓库可能同时包含多种类型的内容：

**示例：claude-code-settings 仓库**

```
claude-code-settings/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json                   # MCP 配置
├── skills/                     # Skills
├── commands/                   # Slash Commands
├── agents/                     # Agents
├── plugins/                    # 子插件
├── settings/                   # 设置文件
└── guidances/                  # 指导文档
```

### 1.6 Command 类型（Slash Commands）

在 claude-plugins-official 中发现了 `commands/` 目录：

```
{plugin-name}/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── {command-name}.md       # Slash command 定义
└── README.md
```

**示例：code-review 插件**

```
code-review/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── code-review.md          # /code-review 命令
└── README.md
```

命令文件格式（带 YAML frontmatter）：
```markdown
---
allowed-tools: Bash(gh issue view:*), Bash(gh search:*)...
description: Code review a pull request
disable-model-invocation: false
---

[命令指令内容]
```

---

## 二、插件标识符格式

### 2.1 格式规范

```
{plugin-name}@{marketplace-id}
```

**组成部分**：
- `plugin-name`: 插件名称，通常与插件目录名一致
- `@`: 分隔符
- `marketplace-id`: Marketplace 标识符

**示例**：
- `skill-creator@claude-code-settings`
- `context7@claude-plugins-official`
- `swift-lsp@claude-plugins-official`

### 2.2 路径解析规则

从插件标识符推导存储路径的规则：

```
插件标识符: {plugin-name}@{marketplace-id}
存储路径: ~/.claude/plugins/cache/{marketplace-id}/{plugin-name}/{version}/
```

**示例**：
```
标识符: skill-creator@claude-code-settings
版本: 1.0.0
路径: ~/.claude/plugins/cache/claude-code-settings/skill-creator/1.0.0/
```

**注意**：
- 版本号通常是 `1.0.0` 格式
- 对于 MCP 类型插件，版本号可能是 git commit hash（如 `27d2b86d72da`）
- 实际路径需要从 `installed_plugins.json` 中的 `installPath` 字段获取

### 2.3 installPath 路径差异

发现存在两种不同的安装路径模式：

**模式 1**: `~/.claude/plugins/cache/...`（新路径）
```
/Users/bo/.claude/plugins/cache/claude-plugins-official/context7/27d2b86d72da
```

**模式 2**: `~/.claude/projects/plugins/cache/...`（旧路径）
```
/Users/bo/.claude/projects/plugins/cache/claude-code-settings/skill-creator/1.0.0
```

这可能是 Claude Code 版本升级导致的路径变更。

---

## 三、配置文件格式

### 3.1 installed_plugins.json

完整数据结构：

```json
{
  "version": 2,
  "plugins": {
    "{plugin-name}@{marketplace-id}": [
      {
        "scope": "user",                // 作用域：user | project
        "installPath": "/Users/bo/.claude/plugins/cache/{marketplace-id}/{plugin-name}/{version}",
        "version": "1.0.0",             // 版本号
        "installedAt": "2025-12-29T18:26:37.974Z",    // 安装时间（ISO 8601）
        "lastUpdated": "2025-12-29T18:26:37.974Z",   // 最后更新时间
        "gitCommitSha": "759c06630e974ded7f8366b6eae02a126a0b3562"  // 可选：git commit
      }
    ]
  }
}
```

**字段说明**：

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| version | number | 是 | 配置文件版本，当前为 2 |
| plugins | object | 是 | 插件映射表，key 为插件标识符 |
| scope | string | 是 | 作用域：`user`（全局）或 `project`（项目级） |
| installPath | string | 是 | 插件安装的完整路径 |
| version | string | 是 | 插件版本号 |
| installedAt | string | 是 | 安装时间（ISO 8601 格式） |
| lastUpdated | string | 是 | 最后更新时间 |
| gitCommitSha | string | 否 | Git commit SHA（部分插件有） |

**注意**：每个插件可以有多个安装记录（数组），支持同一插件在不同作用域的多次安装。

### 3.2 plugin.json（插件元数据）

**Skill 类型插件示例**：

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
  "keywords": [
    "skill",
    "creator",
    "meta-skill",
    "anthropic",
    "official",
    "claude-code"
  ]
}
```

**MCP 类型插件示例**：

```json
{
  "name": "context7",
  "description": "Upstash Context7 MCP server for up-to-date documentation lookup...",
  "author": {
    "name": "Upstash"
  }
}
```

**字段说明**：

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| name | string | 是 | 插件名称 |
| description | string | 是 | 插件描述 |
| version | string | 否 | 插件版本（MCP 类型可能没有） |
| author | object | 是 | 作者信息 |
| author.name | string | 是 | 作者名称 |
| author.url | string | 否 | 作者链接 |
| author.email | string | 否 | 作者邮箱 |
| homepage | string | 否 | 插件主页 |
| repository | string | 否 | 仓库地址 |
| license | string | 否 | 许可证 |
| keywords | array | 否 | 关键词数组 |

### 3.3 .mcp.json（MCP 类型）

**简单格式**：

```json
{
  "{server-name}": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

**完整格式（带多个服务器）**：

```json
{
  "mcpServers": {
    "exa": {
      "type": "http",
      "url": "https://mcp.exa.ai/mcp",
      "headers": {}
    },
    "chrome": {
      "type": "stdio",
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"],
      "env": {}
    }
  }
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 连接类型：`stdio`（默认）或 `http` |
| command | string | 执行命令（stdio 类型） |
| args | array | 命令参数 |
| env | object | 环境变量 |
| url | string | HTTP URL（http 类型） |
| headers | object | HTTP 请求头（http 类型） |

### 3.4 settings.json - enabledPlugins

```json
{
  "enabledPlugins": {
    "skill-creator@claude-code-settings": true,
    "context7@claude-plugins-official": true,
    "swift-lsp@claude-plugins-official": true
  },
  "mcpServers": {
    "roam-research": {
      "command": "roam-research-mcp",
      "args": [],
      "env": {
        "ROAM_API_TOKEN": "...",
        "ROAM_GRAPH_NAME": "..."
      }
    }
  }
}
```

**enabledPlugins 字段**：
- Key: 插件标识符（`{plugin-name}@{marketplace-id}`）
- Value: `true`（已启用）或 `false`（已禁用）

**mcpServers 字段**：
- 用户手动配置的 MCP 服务器
- 这些**不是**通过插件安装的，而是直接在 settings.json 中配置的

### 3.5 SKILL.md 格式

```markdown
---
name: skill-creator
description: Guide for creating effective skills...
license: Complete terms in LICENSE.txt
---

# Skill Creator

[Skill 内容...]
```

**Frontmatter 字段**：
- `name`: Skill 名称（必须）
- `description`: Skill 描述（必须）
- `license`: 许可证说明（可选）

### 3.6 known_marketplaces.json

```json
{
  "{marketplace-id}": {
    "source": {
      "source": "github",           // 或 "git"
      "repo": "owner/repo-name",    // 或 "url": "https://..."
    },
    "installLocation": "/Users/bo/.claude/plugins/marketplaces/{marketplace-id}",
    "lastUpdated": "2026-02-03T17:15:21.341Z"
  }
}
```

---

## 四、Skill 类型 vs MCP 类型对比

| 特征 | Skill 类型 | MCP 类型 | LSP 类型 |
|------|-----------|---------|---------|
| **主要配置文件** | `skills/{name}/SKILL.md` | `.mcp.json` | `README.md` |
| **元数据文件** | `.claude-plugin/plugin.json` | `.claude-plugin/plugin.json` | 无 |
| **存储位置** | `~/.claude/plugins/cache/{marketplace}/{name}/{version}/` | 同左 | 同左 |
| **内容结构** | 包含指令、脚本、参考文档 | MCP 服务器配置 | 安装说明 |
| **运行方式** | 作为上下文注入 | 作为 MCP 服务器运行 | 依赖系统 LSP |
| **可选目录** | `scripts/`, `references/`, `assets/`, `templates/` | 无 | 无 |
| **启用控制** | `settings.json` - `enabledPlugins` | 同左 | 同左 |
| **典型用途** | 扩展 Claude 能力的指令集 | 外部工具集成 | 语言服务器 |

### 4.1 识别插件类型的方法

```
if (存在 skills/ 目录) {
    类型 = "Skill"
} else if (存在 .mcp.json) {
    类型 = "MCP"
} else if (存在 commands/ 目录) {
    类型 = "Command (Slash Command)"
} else if (仅存在 README.md) {
    类型 = "LSP"
} else {
    类型 = "Unknown"
}
```

---

## 五、区分插件 vs 手动安装

### 5.1 区分方法

**插件安装的 Skill/MCP**：
1. 存储在 `~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/`
2. 在 `installed_plugins.json` 中有记录
3. 在 `settings.json` 的 `enabledPlugins` 中有条目
4. 标识符格式：`{plugin-name}@{marketplace-id}`

**手动安装的 Skill**：
1. 存储在 `~/.claude/skills/` 或项目目录
2. 不在 `installed_plugins.json` 中
3. 通过 symlink 或直接放置

**手动配置的 MCP**：
1. 直接在 `~/.claude/settings.json` 的 `mcpServers` 字段中配置
2. 不在 `installed_plugins.json` 中
3. 没有 `@{marketplace-id}` 后缀

### 5.2 scope 字段含义

| Scope | 含义 | 存储位置 | 生效范围 |
|-------|------|----------|----------|
| `user` | 用户级/全局 | `~/.claude/plugins/cache/...` | 所有项目 |
| `project` | 项目级 | 项目目录下 | 仅当前项目 |

**重要**：
- 当前发现的所有插件都是 `user` scope
- 项目级插件可能存储在项目的 `.claude/` 目录下
- 插件安装的全局资源**不应该**加入 Scene 分发（会造成重复加载）

### 5.3 .orphaned_at 文件

部分插件目录包含 `.orphaned_at` 文件：
- 内容：Unix 时间戳（毫秒）
- 含义：标记插件被标记为"孤立"的时间
- 用途：可能用于清理不再需要的插件缓存

示例：
```
1769843935627  # 对应某个 ISO 时间
```

---

## 六、Marketplace 目录结构

### 6.1 Marketplace 仓库类型

**类型 1：单插件仓库**
```
anthropic-agent-skills/
├── skills/
│   ├── skill-creator/
│   ├── algorithmic-art/
│   └── ...
└── .claude-plugin/
    └── plugin.json
```

**类型 2：多类型仓库**
```
claude-plugins-official/
├── plugins/                    # 内部插件
│   ├── code-review/
│   ├── swift-lsp/
│   └── ...
├── external_plugins/           # 外部插件
│   ├── context7/
│   ├── supabase/
│   └── ...
└── .claude-plugin/
    └── plugin.json
```

**类型 3：综合仓库**
```
claude-code-settings/
├── .claude-plugin/
├── .mcp.json
├── skills/
├── commands/
├── agents/
├── plugins/
├── settings/
└── guidances/
```

### 6.2 external_plugins vs plugins

在 `claude-plugins-official` 仓库中：
- `plugins/`: Anthropic 维护的官方插件
- `external_plugins/`: 第三方贡献的插件（如 context7、supabase）

---

## 七、Ensemble data.json 中的相关字段

### 7.1 importedPluginSkills

```json
{
  "importedPluginSkills": [
    "algorithmic-art@claude-code-settings",
    "skill-installer@claude-code-settings",
    "skill-installer@claude-code-settings|skill-installer",
    "skill-creator@claude-code-settings|skill-creator"
  ]
}
```

**格式**：
- 简单格式：`{plugin-name}@{marketplace-id}`
- 带 skill 名格式：`{plugin-name}@{marketplace-id}|{skill-name}`

**用途**：记录已导入的插件 Skills，用于在导入列表中过滤已导入项

### 7.2 importedPluginMcps

```json
{
  "importedPluginMcps": []
}
```

当前为空，格式应与 importedPluginSkills 类似

---

## 八、关键发现总结

### 8.1 结构发现

1. **三种主要插件类型**：
   - Skill 类型：包含 `skills/` 目录和 `SKILL.md`
   - MCP 类型：包含 `.mcp.json` 配置
   - LSP 类型：仅包含 `README.md`
   - Command 类型：包含 `commands/` 目录

2. **统一的元数据**：所有类型都使用 `.claude-plugin/plugin.json`

3. **安装路径变化**：存在新旧两种路径格式

4. **版本号格式**：
   - 语义化版本：`1.0.0`
   - Git commit hash：`27d2b86d72da`

### 8.2 标识符规则

1. **格式**：`{plugin-name}@{marketplace-id}`
2. **解析**：可通过 `@` 分割获取插件名和 marketplace
3. **路径推导**：需要结合 `installed_plugins.json` 的 `installPath`

### 8.3 区分规则

1. **插件安装 vs 手动安装**：
   - 检查是否在 `installed_plugins.json` 中
   - 检查标识符是否包含 `@{marketplace-id}`

2. **全局 vs 项目级**：
   - 检查 `scope` 字段（`user` vs `project`）

### 8.4 导入功能设计建议

1. **导入标记**：
   - 使用 `importedPluginSkills` 和 `importedPluginMcps` 数组
   - 格式：`{plugin-id}` 或 `{plugin-id}|{resource-name}`

2. **过滤已导入项**：
   - 在显示导入列表时检查是否在 imported 数组中

3. **不可加入 Scene**：
   - 插件安装的全局资源不应加入 Scene（会重复）
   - 可通过检查来源路径判断

### 8.5 需要注意的边界情况

1. **一个插件可能包含多个 Skills**：
   - 如 `skill-creator` 插件中的 `skills/skill-creator/`
   - 可能需要 `{plugin-id}|{skill-name}` 格式标记

2. **MCP 配置有两种格式**：
   - 简单格式：直接是服务器配置
   - 完整格式：包含 `mcpServers` 包装器

3. **路径可能变化**：
   - 新版本可能使用 `~/.claude/plugins/cache/`
   - 旧版本使用 `~/.claude/projects/plugins/cache/`
   - 应从 `installPath` 字段读取实际路径

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
