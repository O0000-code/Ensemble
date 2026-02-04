# 第二轮 SubAgent 执行规划文档

## 本轮目标

**并行执行三个研究 SubAgent**，从不同角度收集信息：
1. B1: Claude.md 官方规范研究
2. B2: 本地插件结构分析
3. B3: Ensemble 现有代码分析

## 前置文档

所有 SubAgent **必须先阅读**以下文档以获取完整上下文：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/00-task-understanding.md` - 任务理解
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/02-research-dimensions.md` - 研究维度规划

---

## SubAgent B1: Claude.md 官方规范研究者

### 基本配置
- **角色**: Claude.md 官方规范研究专家
- **模型**: Opus 4.5
- **任务类型**: 阻断式

### 输出文件
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/04-claudemd-spec-research.md`

### 研究任务

**必须使用的工具**:
- `claude-code-guide` skill（**关键**：必须先使用 Skill 工具加载此 skill，然后才能进行任何查询）
- Web 搜索（补充信息）

**研究问题清单**:

1. **配置层级体系**
   - Claude.md 支持哪些配置层级？（用户级 `~/.claude/CLAUDE.md`、项目级、目录级等）
   - 每个层级的文件位置和命名规范
   - 是否支持 `.claude/CLAUDE.md` 目录形式

2. **文件格式与内容结构**
   - 内容格式规范（纯 Markdown？Frontmatter？）
   - 是否有特殊语法或标记
   - 内容长度限制
   - 是否支持引用其他文件

3. **加载优先级与合并规则**
   - 多层级 Claude.md 的加载顺序
   - 内容是替换还是合并？合并规则？
   - 是否可以禁用或覆盖父级指令

4. **与 Claude Code 的集成方式**
   - 加载时机（会话启动 vs 实时监控）
   - 修改后是否需要重启会话
   - 相关 CLI 命令

### 输出格式

```markdown
# Claude.md 官方规范研究报告

## 一、配置层级体系

### 1.1 支持的层级
[详细说明每个层级]

### 1.2 文件路径表
| 层级 | 路径 | 说明 |
|------|------|------|
| 用户级 | ~/.claude/CLAUDE.md | ... |
| 项目级 | ... | ... |

## 二、文件格式规范

### 2.1 内容格式
[详细说明]

### 2.2 特殊语法
[如有]

### 2.3 限制
[内容长度等]

## 三、加载与合并规则

### 3.1 加载顺序
[详细说明]

### 3.2 合并规则
[详细说明]

## 四、集成机制

### 4.1 加载时机
[说明]

### 4.2 更新生效方式
[说明]

### 4.3 相关 CLI 命令
[如有]

## 五、关键发现总结

[要点汇总，便于后续设计参考]
```

---

## SubAgent B2: 本地插件结构分析者

### 基本配置
- **角色**: 本地文件结构分析专家
- **模型**: Opus 4.5
- **任务类型**: 阻断式

### 输出文件
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/05-plugin-structure-analysis.md`

### 研究任务

**分析的目录和文件**:
- `~/.claude/plugins/` - 插件根目录
- `~/.claude/plugins/installed_plugins.json` - 已安装插件清单
- `~/.claude/settings.json` - 用户设置（含 enabledPlugins）
- 具体插件目录：分析 Skill 类型和 MCP 类型插件的差异

**研究问题清单**:

1. **插件目录结构**
   - `~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/` 的完整结构
   - 不同 marketplace 的差异（claude-code-settings vs claude-plugins-official）
   - Skill 类型插件的目录结构（.claude-plugin/plugin.json, skills/）
   - MCP 类型插件的目录结构（.mcp.json）

2. **插件标识符格式**
   - 格式规范：`{plugin-name}@{marketplace-id}`
   - 如何解析标识符获取存储路径

3. **配置文件格式**
   - `installed_plugins.json` 完整数据结构
   - `plugin.json` 元数据格式
   - `.mcp.json` 配置格式
   - `settings.json` 中 `enabledPlugins` 格式

4. **区分标识**
   - 如何区分插件安装 vs 手动安装
   - scope 字段（user/project）的含义

### 输出格式

```markdown
# 本地插件结构分析报告

## 一、插件目录结构

### 1.1 整体目录树
```
~/.claude/plugins/
├── ...
```

### 1.2 Skill 类型插件结构
[具体示例和说明]

### 1.3 MCP 类型插件结构
[具体示例和说明]

## 二、插件标识符格式

### 2.1 格式规范
[说明]

### 2.2 路径解析规则
[如何从标识符推导存储路径]

## 三、配置文件格式

### 3.1 installed_plugins.json
```json
[完整结构示例]
```

### 3.2 plugin.json
```json
[完整结构示例]
```

### 3.3 .mcp.json (MCP 类型)
```json
[完整结构示例]
```

### 3.4 settings.json - enabledPlugins
```json
[结构示例]
```

## 四、Skill 类型 vs MCP 类型对比

| 特征 | Skill 类型 | MCP 类型 |
|------|-----------|---------|
| 存储位置 | ... | ... |
| 配置文件 | ... | ... |
| ... | ... | ... |

## 五、区分插件 vs 手动安装

### 5.1 区分方法
[详细说明]

### 5.2 scope 字段含义
[说明 user/project]

## 六、关键发现总结

[要点汇总，便于后续设计参考]
```

---

## SubAgent B3: Ensemble 现有代码分析者

### 基本配置
- **角色**: Ensemble 代码分析专家
- **模型**: Opus 4.5
- **任务类型**: 阻断式

### 输出文件
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/06-existing-code-analysis.md`

### 研究任务

**需要分析的文件**:
- `src/stores/pluginsStore.ts` - 插件状态管理
- `src/stores/importStore.ts` - 导入功能状态管理
- `src/stores/skillsStore.ts` - Skills 状态管理
- `src/stores/mcpStore.ts` - MCP 状态管理
- `src/stores/scenesStore.ts` - Scenes 状态管理
- `~/.ensemble/data.json` - 数据文件结构

**研究问题清单**:

1. **pluginsStore.ts 分析**
   - 已实现的功能列表
   - 插件数据如何加载和解析
   - 是否已有导入相关功能

2. **importStore.ts 分析**
   - 当前导入逻辑
   - 导入来源支持哪些
   - 如何判断已导入项

3. **data.json 分析**
   - 完整数据结构说明
   - `importedPluginSkills` 和 `importedPluginMcps` 的当前使用方式
   - 是否有 Claude.md 相关字段

4. **现有 Store 设计模式**
   - Store 的通用设计模式
   - 与 Rust 后端交互方式
   - 数据持久化机制

### 输出格式

```markdown
# Ensemble 现有代码分析报告

## 一、Store 文件分析

### 1.1 pluginsStore.ts
**文件路径**: src/stores/pluginsStore.ts
**已实现功能**:
- [ ] 功能1
- [ ] 功能2

**关键代码片段**:
```typescript
// 重要逻辑
```

**与导入相关的逻辑**:
[说明]

### 1.2 importStore.ts
[类似结构]

### 1.3 skillsStore.ts
[关键功能说明]

### 1.4 mcpStore.ts
[关键功能说明]

### 1.5 scenesStore.ts
[关键功能说明，特别是 Scene 如何包含 Skills/MCPs]

## 二、data.json 数据结构

### 2.1 完整结构
```json
{
  // 完整结构说明
}
```

### 2.2 importedPluginSkills 字段
**当前状态**: [是否使用，使用方式]
**数据格式**: [具体格式]

### 2.3 importedPluginMcps 字段
**当前状态**: [是否使用，使用方式]
**数据格式**: [具体格式]

## 三、通用设计模式

### 3.1 Store 设计模式
[说明 Zustand 使用方式]

### 3.2 与 Rust 后端交互
[invoke 命令使用方式]

### 3.3 数据持久化
[保存和加载机制]

## 四、已实现 vs 待实现功能

### 4.1 已实现功能清单
- 功能1
- 功能2
- ...

### 4.2 需要扩展的功能点
- 功能点1：[具体说明]
- 功能点2：[具体说明]
- ...

## 五、代码扩展建议

基于现有代码分析，为 Claude.md 管理和插件导入功能提供扩展建议：
[具体建议]
```

---

## 执行检查点

### B1 (Claude.md 规范研究)
- [ ] 已使用 Skill 工具加载 claude-code-guide
- [ ] 已查询配置层级
- [ ] 已查询文件格式
- [ ] 已查询加载规则
- [ ] 输出文件已创建

### B2 (插件结构分析)
- [ ] 已分析 plugins 目录
- [ ] 已分析 installed_plugins.json
- [ ] 已分析 settings.json
- [ ] 已分析具体插件配置
- [ ] 输出文件已创建

### B3 (现有代码分析)
- [ ] 已分析 pluginsStore.ts
- [ ] 已分析 importStore.ts
- [ ] 已分析相关 Store
- [ ] 已分析 data.json
- [ ] 输出文件已创建

---

## 下一步

等待三个 SubAgent 全部完成后，汇总研究结果，创建第三轮 SubAgent 执行规划文档，发布 SubAgent B4 进行功能设计方案制定。

---

*规划版本: 1.0*
*创建时间: 2026-02-04*
