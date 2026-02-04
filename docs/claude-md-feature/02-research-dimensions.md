# Claude.md 与插件系统研究维度

> 创建时间: 2026-02-04
> 创建者: 研究维度规划 SubAgent (Opus 4.5)

---

## 一、Claude.md 研究维度

### 1.1 配置层级体系

**研究问题**:
- Claude.md 支持哪些配置层级？（用户级、项目级、目录级等）
- 每个层级的文件位置在哪里？
- 不同层级之间是否有命名差异（如 CLAUDE.md vs .claude.md）？
- 是否支持在 `.claude/` 目录下的 CLAUDE.md？

**为什么重要**:
理解配置层级是实现 Claude.md 管理功能的基础。Ensemble 需要知道在哪里读取、创建和管理这些文件。

**建议研究方法**:
- 使用 `claude-code-guide` skill 查询官方文档
- 检查本地 `~/.claude/` 目录结构
- 在不同层级创建测试文件验证行为

### 1.2 文件格式与内容结构

**研究问题**:
- Claude.md 的内容格式是什么？（纯 Markdown？是否支持 Frontmatter？）
- 是否有特殊的语法或标记？
- 内容长度是否有限制？
- 是否支持引用其他文件或模板？

**为什么重要**:
Ensemble 需要理解文件格式以便正确地读取、编辑和验证 Claude.md 内容。

**建议研究方法**:
- 使用 `claude-code-guide` skill 查询文件格式规范
- 分析现有 Claude.md 示例文件
- 测试不同格式的内容是否被正确解析

### 1.3 加载优先级与合并规则

**研究问题**:
- 当存在多个层级的 Claude.md 时，加载顺序是什么？
- 内容是替换还是合并？如果合并，规则是什么？
- 是否可以在子级禁用或覆盖父级的指令？
- 项目级 Claude.md 是否可以引用用户级内容？

**为什么重要**:
理解加载和合并规则直接影响 Scene 分发机制的设计。如果内容是合并的，需要避免重复；如果是替换的，需要确保完整性。

**建议研究方法**:
- 使用 `claude-code-guide` skill 查询官方行为
- 创建多层级测试环境，观察实际加载行为
- 在 Claude Code 会话中验证指令的实际效果

### 1.4 与 Claude Code 的集成方式

**研究问题**:
- Claude.md 是在会话启动时加载还是实时监控？
- 修改 Claude.md 后是否需要重启会话才能生效？
- Claude.md 的内容如何注入到系统提示中？
- 是否有 Claude Code CLI 命令可以操作 Claude.md？

**为什么重要**:
了解集成方式有助于设计 Ensemble 的同步策略，确定何时需要提示用户重启会话。

**建议研究方法**:
- 使用 `claude-code-guide` skill 查询集成机制
- 测试修改 Claude.md 后的会话行为
- 检查 Claude Code 的 CLI 帮助文档

### 1.5 Scene 分发机制设计

**研究问题**:
- Scene 中的 Claude.md 应该如何存储？（完整内容 vs 引用路径）
- 分发到项目时应该采用什么策略？（直接复制 vs symlink）
- 如果项目已有 Claude.md，如何处理冲突？
- 是否需要支持 Claude.md 模板功能？

**为什么重要**:
这是 Ensemble 的核心功能设计，需要在用户体验和功能可靠性之间取得平衡。

**建议研究方法**:
- 分析现有 Skill/MCP 的分发机制作为参考
- 设计多种方案并评估优缺点
- 考虑用户可能的使用场景

### 1.6 用户界面设计需求

**研究问题**:
- Claude.md 管理页面应该提供哪些功能？
- 是否需要 Markdown 编辑器/预览功能？
- 如何展示不同层级的 Claude.md 状态？
- 是否需要设计稿？参考现有哪些页面设计？

**为什么重要**:
UI 设计直接影响用户体验和开发工作量。

**建议研究方法**:
- 查看现有 Ensemble 设计文档
- 分析 Skills/MCP 页面的设计模式
- 与用户确认 UI 需求

---

## 二、插件系统研究维度

### 2.1 插件安装的资源存储结构

**研究问题**:
- 插件安装的 Skill 存储在哪里？（`~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/`）
- 插件安装的 MCP 存储在哪里？配置格式是什么？
- 插件的目录结构是什么？（`.claude-plugin/plugin.json`, `skills/`, `.mcp.json` 等）
- 插件的元数据（plugin.json）包含哪些字段？

**为什么重要**:
理解存储结构是实现"导入"功能的前提，需要知道从哪里读取插件信息。

**建议研究方法**:
- 直接检查 `~/.claude/plugins/` 目录结构
- 读取 `installed_plugins.json` 分析数据格式
- 对比不同类型插件（Skill 类型 vs MCP 类型）的结构差异

### 2.2 插件与手动安装的区分标识

**研究问题**:
- 如何区分插件安装的 Skill vs 手动安装的 Skill？
- `installed_plugins.json` 中的 scope 字段（user/project）有什么含义？
- 插件的 marketplace 标识符格式是什么？（如 `skill-name@claude-code-settings`）
- 是否有版本信息和安装时间等元数据？

**为什么重要**:
区分来源是实现正确显示和过滤的关键。

**建议研究方法**:
- 分析 `installed_plugins.json` 的数据结构
- 分析 `settings.json` 中 `enabledPlugins` 的格式
- 对比本地 symlink Skills 和插件 Skills 的路径差异

### 2.3 插件配置格式分析

**研究问题**:
- Skill 类型插件：SKILL.md 格式是否与手动创建的一致？
- MCP 类型插件：`.mcp.json` 的格式是什么？
- 插件启用/禁用状态存储在哪里？（`settings.json` 的 `enabledPlugins`）
- 插件是否支持项目级作用域？

**为什么重要**:
了解配置格式才能正确解析和展示插件信息。

**建议研究方法**:
- 读取多个插件的配置文件进行对比
- 分析 MCP 类型插件（如 context7）的 `.mcp.json` 格式
- 检查是否有项目级的插件配置

### 2.4 导入功能设计

**研究问题**:
- 导入后应该存储在哪里？（`~/.ensemble/skills/` 或 `~/.ensemble/mcps/`）
- 导入是复制文件还是创建引用？
- 导入后如何标记"已导入"状态？（建议在 `data.json` 中记录）
- 导入后的 Skill/MCP 应该显示什么来源标记？

**为什么重要**:
这是用户明确提出的需求，需要设计完整的数据流。

**建议研究方法**:
- 分析现有 `data.json` 的数据结构
- 查看现有 Skill/MCP 导入逻辑
- 设计 `importedPluginSkills` 和 `importedPluginMcps` 的数据格式

### 2.5 导入列表过滤逻辑

**研究问题**:
- 如何在导入弹框中过滤已导入的项？
- 过滤判断逻辑是什么？（通过 `data.json` 中的标记列表）
- 已导入项是否应该在某处展示？（如插件来源的 Skill 页面）
- 如果用户删除了导入的项，是否允许重新导入？

**为什么重要**:
用户明确要求已导入的项不应再出现在导入列表中。

**建议研究方法**:
- 分析现有的导入弹框逻辑
- 设计过滤数据流
- 考虑边界情况（如插件更新后的版本变化）

### 2.6 Scene 分发限制

**研究问题**:
- 为什么插件安装的全局资源不能加入 Scene？
- 如何在 UI 中区分可分发/不可分发的资源？
- 是否需要向用户解释这一限制？
- 如果用户强制要求，是否有替代方案？

**为什么重要**:
用户明确提出：插件安装的全局资源"不能"加入 Scene，因为会造成重复加载。

**建议研究方法**:
- 理解 Scene 分发的工作原理
- 分析全局插件的加载机制
- 设计 UI 提示来解释这一行为

### 2.7 现有代码分析

**研究问题**:
- Ensemble 现有的 `pluginsStore.ts` 实现了哪些功能？
- `importStore.ts` 的当前导入逻辑是什么？
- `data.json` 中已有的 `importedPluginSkills` 字段是如何使用的？
- 现有代码是否已经部分实现了相关功能？

**为什么重要**:
避免重复造轮子，了解现有实现才能正确扩展。

**建议研究方法**:
- 阅读 `src/stores/pluginsStore.ts`
- 阅读 `src/stores/importStore.ts`
- 分析 `data.json` 的完整数据结构

---

## 三、研究优先级排序

### 高优先级（必须先完成）

| 优先级 | 研究维度 | 原因 |
|--------|----------|------|
| P0 | 2.1 插件安装的资源存储结构 | 是所有插件相关功能的基础 |
| P0 | 1.1 Claude.md 配置层级体系 | 是 Claude.md 管理功能的基础 |
| P0 | 2.7 现有代码分析 | 了解当前实现状态，避免重复工作 |

### 中优先级（核心设计依赖）

| 优先级 | 研究维度 | 原因 |
|--------|----------|------|
| P1 | 1.2 文件格式与内容结构 | 决定如何读取和展示 Claude.md |
| P1 | 1.3 加载优先级与合并规则 | 影响 Scene 分发策略设计 |
| P1 | 2.2 插件与手动安装的区分标识 | 影响导入功能和 UI 展示 |
| P1 | 2.3 插件配置格式分析 | 影响数据解析逻辑 |
| P1 | 2.4 导入功能设计 | 核心需求，依赖存储结构研究 |

### 一般优先级（可并行或后续）

| 优先级 | 研究维度 | 原因 |
|--------|----------|------|
| P2 | 1.4 与 Claude Code 的集成方式 | 有助于设计更好的用户体验 |
| P2 | 1.5 Scene 分发机制设计 | 依赖加载规则研究 |
| P2 | 2.5 导入列表过滤逻辑 | 依赖导入功能设计 |
| P2 | 2.6 Scene 分发限制 | 需求已明确，设计相对简单 |
| P2 | 1.6 用户界面设计需求 | 可以在开发阶段并行进行 |

---

## 四、建议的 SubAgent 分配方案

根据研究维度的相关性和依赖关系，建议分配以下 SubAgent：

### SubAgent B1: Claude.md 官方规范研究者

**负责维度**:
- 1.1 配置层级体系
- 1.2 文件格式与内容结构
- 1.3 加载优先级与合并规则
- 1.4 与 Claude Code 的集成方式

**需要使用的工具**:
- `claude-code-guide` skill（主要工具，查询 Claude Code 官方文档）
- Web 搜索（补充最新信息）

**需要输出的内容**:
- Claude.md 官方规范汇总
- 各层级配置文件路径表
- 加载和合并规则说明
- 集成机制描述

**输出文件路径**:
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/03-claudemd-spec-research.md`

---

### SubAgent B2: 本地文件结构分析者

**负责维度**:
- 2.1 插件安装的资源存储结构
- 2.2 插件与手动安装的区分标识
- 2.3 插件配置格式分析

**需要使用的工具**:
- 读取本地文件系统（`~/.claude/plugins/`, `~/.claude/settings.json` 等）
- 文件结构分析命令（ls, cat, tree）

**需要输出的内容**:
- 插件目录结构详细说明
- 各类型插件的配置格式示例
- 插件标识符格式规范
- Skill 类型与 MCP 类型插件的差异对比表

**输出文件路径**:
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/04-plugin-structure-analysis.md`

---

### SubAgent B3: Ensemble 现有代码分析者

**负责维度**:
- 2.7 现有代码分析

**需要使用的工具**:
- 读取项目源代码文件
- 代码搜索（Grep/Glob）

**需要输出的内容**:
- `pluginsStore.ts` 功能分析
- `importStore.ts` 逻辑分析
- `data.json` 数据结构完整说明
- 现有已实现功能清单
- 需要扩展的功能点列表

**输出文件路径**:
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/05-existing-code-analysis.md`

---

### SubAgent B4: 功能设计方案制定者

**负责维度**:
- 1.5 Scene 分发机制设计
- 2.4 导入功能设计
- 2.5 导入列表过滤逻辑
- 2.6 Scene 分发限制
- 1.6 用户界面设计需求

**需要使用的工具**:
- 读取前序 SubAgent 的研究输出
- 读取现有设计文档（参考 Skills/MCP 页面设计）

**需要输出的内容**:
- Claude.md 管理功能方案
- 插件导入功能方案
- 数据模型设计（新增字段）
- UI 页面设计建议
- 边界情况处理方案

**输出文件路径**:
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/06-feature-design-proposal.md`

---

## 五、研究依赖关系

### 依赖关系图

```
                          ┌─────────────────────┐
                          │  SubAgent B1        │
                          │  Claude.md 规范研究  │
                          └──────────┬──────────┘
                                     │
     ┌───────────────────────────────┼───────────────────────────────┐
     │                               │                               │
     ▼                               ▼                               │
┌─────────────────────┐    ┌─────────────────────┐                   │
│  SubAgent B2        │    │  SubAgent B3        │                   │
│  插件结构分析       │    │  现有代码分析       │                   │
└──────────┬──────────┘    └──────────┬──────────┘                   │
           │                          │                               │
           └────────────┬─────────────┘                               │
                        │                                             │
                        ▼                                             │
              ┌─────────────────────┐                                 │
              │  SubAgent B4        │◄────────────────────────────────┘
              │  功能设计方案       │
              └─────────────────────┘
```

### 可并行执行的研究

以下 SubAgent 可以**并行执行**，因为它们之间没有直接依赖：

1. **SubAgent B1** (Claude.md 规范研究) - 使用 claude-code-guide skill
2. **SubAgent B2** (插件结构分析) - 分析本地文件系统
3. **SubAgent B3** (现有代码分析) - 分析项目代码

### 需要等待的研究

**SubAgent B4** (功能设计方案) **必须等待** B1、B2、B3 全部完成后才能开始，因为：
- 需要 B1 的 Claude.md 规范来设计 Scene 分发机制
- 需要 B2 的插件结构信息来设计导入功能
- 需要 B3 的代码分析来确定需要扩展的功能点

### 执行建议

**第一批（并行）**:
- 同时启动 SubAgent B1、B2、B3
- 预计耗时：15-30 分钟

**第二批（串行）**:
- 等待第一批全部完成
- 启动 SubAgent B4
- 预计耗时：15-20 分钟

**总预计时间**: 30-50 分钟

---

## 六、附录：本地已发现的关键信息

### 6.1 已确认的目录结构

```
~/.claude/
├── CLAUDE.md                  # 用户级（当前为空文件）
├── settings.json              # 用户级设置（含 enabledPlugins）
├── plugins/
│   ├── installed_plugins.json # 已安装插件清单
│   ├── cache/
│   │   ├── claude-code-settings/  # Anthropic 官方 marketplace
│   │   │   └── {skill-name}/{version}/
│   │   │       ├── .claude-plugin/plugin.json
│   │   │       └── skills/{skill-name}/SKILL.md
│   │   └── claude-plugins-official/  # 另一个 marketplace
│   │       └── {plugin-name}/{version}/
│   │           ├── .claude-plugin/plugin.json
│   │           └── .mcp.json  # MCP 类型插件的配置
└── skills/                    # 用户级 Skills（当前为空）

~/.ensemble/
├── data.json                  # Ensemble 数据文件
│   ├── importedPluginSkills   # 已导入的插件 Skills 标记
│   └── importedPluginMcps     # 已导入的插件 MCPs 标记
├── skills/                    # Ensemble 管理的 Skills（symlinks）
└── mcps/                      # Ensemble 管理的 MCPs（JSON 配置）
```

### 6.2 已确认的插件标识符格式

- 格式: `{plugin-name}@{marketplace-id}`
- 示例: `skill-creator@claude-code-settings`, `context7@claude-plugins-official`

### 6.3 已确认的数据存在

`~/.ensemble/data.json` 中已有字段:
- `importedPluginSkills`: 已导入的插件 Skills 列表
- `importedPluginMcps`: 已导入的插件 MCPs 列表

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
