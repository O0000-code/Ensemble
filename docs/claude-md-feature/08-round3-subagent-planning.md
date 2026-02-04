# 第三轮 SubAgent 执行规划文档

## 本轮目标

基于前两轮的研究结果，由 **SubAgent B4** 制定完整的功能设计方案。

## 前置研究成果总结

### Claude.md 官方规范（来自 07-claude-code-guide-research.md）

1. **六层配置体系**：
   - 托管策略（最高优先级）
   - 用户级：`~/.claude/CLAUDE.md`
   - 用户规则：`~/.claude/rules/*.md`
   - 项目级：`./CLAUDE.md` 或 `./.claude/CLAUDE.md`
   - 项目规则：`./.claude/rules/*.md`
   - 本地级：`./CLAUDE.local.md`

2. **合并规则**：内容是**合并**而非替换

3. **文件格式**：纯 Markdown，支持 `@path/to/file` 导入语法

4. **加载时机**：会话启动时加载，修改后通常需要新会话生效

### 插件结构（来自 05-plugin-structure-analysis.md）

1. **四种插件类型**：Skill、MCP、LSP、Command

2. **标识符格式**：`{plugin-name}@{marketplace-id}`

3. **存储位置**：`~/.claude/plugins/cache/{marketplace}/{plugin-name}/{version}/`

4. **已有字段**：`importedPluginSkills` 和 `importedPluginMcps`

### 现有代码（来自 06-existing-code-analysis.md）

1. **已实现**：
   - pluginsStore 的插件检测和导入功能
   - 使用 `installSource` 区分来源（`'local'` | `'plugin'`）
   - Scene 通过 `skillIds` 和 `mcpIds` 关联资源

2. **未实现**：
   - Claude.md 管理功能
   - Scene 分发限制（插件资源不能加入 Scene）

---

## SubAgent B4: 功能设计方案制定者

### 基本配置
- **角色**: 功能架构设计师
- **模型**: Opus 4.5
- **任务类型**: 阻断式

### 输入文档

**必须阅读的文档**（按顺序）：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/00-task-understanding.md` - 任务理解
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/07-claude-code-guide-research.md` - Claude.md 官方规范
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/05-plugin-structure-analysis.md` - 插件结构分析
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/06-existing-code-analysis.md` - 现有代码分析

### 输出文件
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/claude-md-feature/09-feature-design-proposal.md`

### 设计任务

#### 任务一：Claude.md 管理功能设计

需要设计：

1. **数据模型**
   - Claude.md 配置如何存储
   - 是否需要新的 Store
   - 如何与 Scene 关联

2. **功能范围**
   - 支持哪些层级的 Claude.md 管理（用户级？项目级？）
   - 是否需要编辑功能
   - Scene 分发时的 Claude.md 处理策略

3. **UI 设计**
   - 是否需要独立的 Claude.md 页面
   - 如何在 Scene 中展示/编辑 Claude.md
   - 参考现有设计（Skills/MCP 页面）

#### 任务二：插件资源处理设计

需要设计：

1. **导入功能**
   - 导入后的数据存储位置
   - 已导入标记机制（不删除原配置）
   - 导入列表过滤逻辑

2. **Scene 分发限制**
   - 如何识别插件来源的资源
   - 如何在 UI 中处理（过滤/禁用/提示）
   - 确保插件资源不会被加入 Scene

3. **UI 标识**
   - 如何在列表中区分插件/本地来源
   - 是否需要特殊徽章或分组

#### 任务三：数据模型扩展

需要设计：

1. **Scene 模型扩展**
   ```typescript
   interface Scene {
     // ...existing fields
     claudeMdContent?: string;  // 或其他方案
   }
   ```

2. **data.json 扩展**
   - Claude.md 相关字段
   - 确保与现有 `importedPluginSkills`/`importedPluginMcps` 兼容

3. **Rust 后端扩展**
   - 新增的 Tauri 命令
   - 配置同步时的 Claude.md 处理

### 输出格式

```markdown
# Claude.md 与插件系统功能设计方案

> 创建时间: 2026-02-04
> 创建者: SubAgent B4 (功能设计方案制定者)

## 一、设计概述

### 1.1 设计目标
[简要说明设计目标]

### 1.2 设计原则
[列出关键设计原则]

### 1.3 功能范围
[明确本次设计涵盖的功能]

## 二、Claude.md 管理功能

### 2.1 功能定义
[详细说明 Claude.md 管理功能]

### 2.2 数据模型
```typescript
// 新增的类型定义
```

### 2.3 Store 设计
[新增 Store 或扩展现有 Store]

### 2.4 UI 设计
[页面布局、交互设计]

### 2.5 Scene 分发策略
[Claude.md 如何参与 Scene 分发]

## 三、插件资源处理

### 3.1 导入功能设计
[详细说明导入流程]

### 3.2 已导入标记机制
[如何标记已导入，不删除原配置]

### 3.3 Scene 分发限制
[如何限制插件资源加入 Scene]

### 3.4 UI 标识设计
[如何在 UI 中区分来源]

## 四、数据模型详细设计

### 4.1 Scene 模型扩展
```typescript
interface Scene {
  // 完整定义
}
```

### 4.2 data.json 结构
```json
{
  // 完整结构
}
```

### 4.3 新增类型定义
```typescript
// 所有新增类型
```

## 五、Rust 后端扩展

### 5.1 新增命令
```rust
// 命令签名
```

### 5.2 配置同步流程
[Claude.md 在项目同步时的处理]

## 六、UI 变更清单

### 6.1 新增页面/组件
[列出需要新增的页面和组件]

### 6.2 修改的现有页面/组件
[列出需要修改的页面和组件]

## 七、实施优先级

### 7.1 Phase 1: 核心功能
[必须实现的功能]

### 7.2 Phase 2: 增强功能
[可选的增强功能]

## 八、边界情况处理

### 8.1 场景1: ...
[处理方案]

### 8.2 场景2: ...
[处理方案]

## 九、设计决策说明

### 9.1 决策1: ...
**背景**: ...
**方案**: ...
**理由**: ...

## 十、总结

[设计方案总结]
```

---

## 执行检查点

- [ ] 已阅读所有前置文档
- [ ] Claude.md 管理功能设计完整
- [ ] 插件资源处理设计完整
- [ ] 数据模型设计完整
- [ ] Rust 后端扩展设计完整
- [ ] UI 变更清单完整
- [ ] 实施优先级明确
- [ ] 边界情况考虑周全
- [ ] 设计决策有明确理由

---

## 下一步

根据 SubAgent B4 的设计方案，进入实施阶段：
1. 创建 Git Worktree
2. 实施设计方案
3. 验证测试

---

*规划版本: 1.0*
*创建时间: 2026-02-04*
