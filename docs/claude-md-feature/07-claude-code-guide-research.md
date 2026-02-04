# Claude Code Guide 官方规范研究报告

> 创建时间: 2026-02-04
> 研究方法: 通过 WebFetch 直接获取 Claude Code 官方文档（code.claude.com）

---

## 一、Claude.md 基本概念

### 1.1 定义和作用

**CLAUDE.md** 是 Claude Code 的**记忆系统文件**，用于存储跨会话的持久化上下文和指令。Claude Code 在每次会话启动时会自动读取这些文件。

官方定义：
> "Claude Code can remember your preferences across sessions, like style guidelines and common commands in your workflow."

核心作用：
- **持久化记忆**：存储项目信息、编码规范、常用命令
- **会话初始化**：每次会话启动时自动加载到 Claude 的上下文
- **团队协作**：项目级配置可通过 git 共享给团队
- **个人偏好**：用户级和本地级配置保持个人设置

### 1.2 官方推荐使用场景

根据官方最佳实践文档，CLAUDE.md 适合包含：

| 应该包含 | 不应包含 |
|------------|------------|
| Claude 无法猜测的 Bash 命令 | Claude 可以通过读取代码推断的内容 |
| 与默认不同的代码风格规则 | Claude 已知的标准语言规范 |
| 测试说明和首选测试运行器 | 详细的 API 文档（应链接而非内嵌） |
| 仓库规范（分支命名、PR 约定） | 经常变化的信息 |
| 项目特定的架构决策 | 长篇解释或教程 |
| 开发环境特殊设置（必需的环境变量） | 文件逐个描述代码库 |
| 常见陷阱或非显而易见的行为 | "写干净代码"等不言自明的做法 |

---

## 二、配置层级体系

### 2.1 托管策略配置（Managed Policy）

**路径**：
- macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`
- Linux: `/etc/claude-code/CLAUDE.md`
- Windows: `C:\Program Files\ClaudeCode\CLAUDE.md`

**说明**：
- 由 IT/DevOps 管理的组织级指令
- **优先级最高**，无法被覆盖
- 用途：公司编码标准、安全策略、合规要求
- 共享范围：组织内所有用户

### 2.2 用户级配置（User Scope）

**路径**: `~/.claude/CLAUDE.md`

**说明**:
- 个人偏好，适用于所有项目
- 用途：代码风格偏好、个人工具快捷方式
- 共享范围：仅限本人（跨所有项目）
- 优先级：最低（被项目级和本地级覆盖）

### 2.3 项目级配置（Project Scope）

**路径**: `./CLAUDE.md` 或 `./.claude/CLAUDE.md`

**说明**:
- **两种路径均受支持**，可任选其一
- 团队共享的项目指令
- 用途：项目架构、编码标准、常见工作流
- 共享范围：团队成员（通过版本控制）
- 优先级：覆盖用户级配置

### 2.4 项目规则模块（Project Rules）

**路径**: `./.claude/rules/*.md`

**说明**:
- 模块化、主题特定的项目指令
- 支持 YAML frontmatter 中的 `paths` 字段进行条件加载
- 用途：语言特定指南、测试约定、API 标准
- 共享范围：团队成员（通过版本控制）
- 优先级：与 `.claude/CLAUDE.md` 相同

示例（条件规则）：
```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
```

### 2.5 本地级配置（Local Scope）

**路径**: `./CLAUDE.local.md`

**说明**:
- 个人项目特定偏好
- **自动添加到 .gitignore**
- 用途：个人沙箱 URL、首选测试数据
- 共享范围：仅限本人（当前项目）
- 优先级：覆盖项目级配置

### 2.6 目录级配置（Directory-level）

**说明**:
- Claude Code **支持**子目录中的 CLAUDE.md
- 工作方式：
  - 向上递归：从当前目录向上递归到根目录，读取所有找到的 CLAUDE.md
  - 向下发现：子目录中的 CLAUDE.md **按需加载**（仅当 Claude 读取该子树中的文件时）
- 用途：Monorepo 中的模块特定配置

### 2.7 配置层级总结表

| 层级 | 路径 | 优先级 | 共享范围 | 用例 |
|------|------|--------|----------|------|
| 托管策略 | 系统级路径（见 2.1） | 最高（不可覆盖） | 组织内所有用户 | 公司策略、安全要求 |
| 用户级 | `~/.claude/CLAUDE.md` | 最低 | 仅本人（所有项目） | 个人偏好 |
| 用户级规则 | `~/.claude/rules/*.md` | 低于项目规则 | 仅本人（所有项目） | 个人工作流 |
| 项目级 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 中 | 团队（通过 git） | 项目标准 |
| 项目规则 | `./.claude/rules/*.md` | 与项目级相同 | 团队（通过 git） | 模块化指令 |
| 本地级 | `./CLAUDE.local.md` | 高 | 仅本人（当前项目） | 个人覆盖 |
| 目录级 | 子目录中的 `CLAUDE.md` | 按需加载 | 视情况 | Monorepo 模块 |

---

## 三、文件格式规范

### 3.1 格式要求

- **文件格式**：标准 Markdown
- **编码**：UTF-8
- **无特殊语法**：CLAUDE.md 是纯 Markdown 文件，无需特殊语法或 frontmatter

### 3.2 命名规则

- **命名**：`CLAUDE.md`（大写 CLAUDE，小写扩展名）
- **本地变体**：`CLAUDE.local.md`
- **大小写敏感**：是（必须使用大写 CLAUDE）

### 3.3 内容限制

- **没有硬性长度限制**
- **建议保持简洁**：因为 CLAUDE.md 会被加载到每个会话的上下文中
- 官方建议：对于每一行，问自己 *"如果删除这一行，Claude 会犯错吗？"* 如果不会，就删掉它

### 3.4 导入语法（@import）

CLAUDE.md 支持使用 `@path/to/file` 语法导入其他文件：

```markdown
See @README for project overview and @package.json for available npm commands.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

导入规则：
- **相对路径和绝对路径均支持**
- 相对路径相对于包含导入的文件解析，而非工作目录
- **递归导入**：被导入的文件可以再导入其他文件，最大深度 5 层
- **代码块中不解析**：代码块和行内代码中的 `@` 不会被当作导入
- **首次审批**：首次遇到外部导入时，Claude Code 会显示审批对话框

---

## 四、加载和合并规则

### 4.1 加载顺序

官方文档明确说明的加载顺序：

1. **托管策略**（最高优先级，无法被覆盖）
2. **命令行参数**（临时会话覆盖）
3. **本地级**（`.claude/settings.local.json`、`CLAUDE.local.md`）
4. **项目级**（`.claude/settings.json`、`CLAUDE.md`）
5. **用户级**（`~/.claude/CLAUDE.md`）

### 4.2 合并规则

- **内容是合并（Merge），不是替换（Replace）**
- 所有适用的 CLAUDE.md 文件内容会**拼接**在一起
- 更具体的作用域**添加到**或**覆盖**更广泛的作用域
- 层级结构中靠上的文件先加载，提供基础，更具体的记忆在此基础上构建

### 4.3 递归查找机制

Claude Code 的记忆查找方式：
1. 从当前工作目录开始
2. **向上递归**到根目录（不包括根目录本身）
3. 读取沿途找到的所有 `CLAUDE.md` 或 `CLAUDE.local.md` 文件
4. 子目录中的 CLAUDE.md 是**按需发现**的（仅当 Claude 读取这些子树中的文件时才包含）

### 4.4 额外目录的 CLAUDE.md 加载

- 通过 `--add-dir` 标志添加的额外目录，默认**不会**加载其中的 CLAUDE.md
- 要启用，需设置环境变量：
  ```bash
  CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
  ```

---

## 五、Claude Code 集成

### 5.1 加载时机

- **会话启动时**：所有 CLAUDE.md 文件在 Claude Code 启动时自动加载到上下文
- **子目录按需加载**：子目录中的 CLAUDE.md 仅当 Claude 处理该目录中的文件时加载

### 5.2 更新生效方式

| 方法 | 说明 |
|------|------|
| **新会话** | 修改 CLAUDE.md 后，通常需要开始新会话才能看到更改 |
| **`/memory` 命令** | 在会话中直接编辑记忆文件 |
| **`/init` 命令** | 生成/重新生成 CLAUDE.md |
| **`/clear` 命令** | 清除上下文（CLAUDE.md 会在后续重新加载） |

### 5.3 相关 CLI 命令

| 命令 | 功能 |
|------|------|
| `/init` | 分析代码库并生成 CLAUDE.md 起始文件 |
| `/memory` | 在系统编辑器中打开任意记忆文件进行编辑 |
| `/clear` | 在不相关任务之间重置上下文 |

### 5.4 `/init` 命令详解

官方说明：
> "Bootstrap a CLAUDE.md for your codebase with the `/init` command"

`/init` 会：
1. 分析代码库检测构建系统、测试框架、代码模式
2. 生成基于分析的 CLAUDE.md 起始文件
3. 生成的内容是**起点**，建议根据实际需求调整

---

## 六、最佳实践

### 6.1 官方推荐的 CLAUDE.md 编写原则

1. **保持简洁**：过长的 CLAUDE.md 会导致 Claude 忽略重要指令
2. **具体明确**："使用 2 空格缩进" 优于 "正确格式化代码"
3. **结构化组织**：使用 Markdown 标题分组相关指令
4. **定期审查**：随项目演进更新内容
5. **测试有效性**：如果 Claude 不遵循某条规则，可能是文件太长导致规则被忽略

### 6.2 官方推荐的 CLAUDE.md 格式示例

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

### 6.3 强调重要性的技巧

- 可以通过添加强调词（如 "IMPORTANT" 或 "YOU MUST"）来提高 Claude 对指令的遵守度

### 6.4 `.claude/rules/` 最佳实践

- **保持规则聚焦**：每个文件覆盖一个主题（如 `testing.md`、`api-design.md`）
- **使用描述性文件名**：文件名应指示规则内容
- **谨慎使用条件规则**：仅当规则真正适用于特定文件类型时才添加 `paths` frontmatter
- **使用子目录组织**：分组相关规则（如 `frontend/`、`backend/`）

---

## 七、关键发现总结

### 7.1 核心架构

1. **六层配置体系**：托管策略 → 用户级 → 用户规则 → 项目级 → 项目规则 → 本地级

2. **双路径项目配置**：支持 `./CLAUDE.md` 和 `./.claude/CLAUDE.md` 两种路径

3. **模块化规则系统**：`.claude/rules/*.md` 支持条件加载

4. **导入系统**：`@path/to/file` 语法支持文件引用和递归导入

### 7.2 合并策略

- **内容合并，非替换**
- 优先级从高到低：托管策略 > 命令行 > 本地级 > 项目级 > 用户级
- 子目录 CLAUDE.md 按需加载

### 7.3 文件特性

| 特性 | 值 |
|------|-----|
| 格式 | Markdown |
| Frontmatter | 不需要（规则文件可选） |
| 命名 | 大写 CLAUDE（大小写敏感） |
| 长度限制 | 无硬限制，建议简洁 |
| 导入支持 | 是（`@` 语法） |
| 自动 gitignore | `CLAUDE.local.md` 自动添加 |

### 7.4 与 Skills 的对比

| 特性 | CLAUDE.md | Skills |
|------|-----------|--------|
| 加载时机 | 每次会话启动 | 按需加载 |
| 适用场景 | 广泛适用的规则 | 特定场景的知识/工作流 |
| Frontmatter | 不需要 | 需要 |
| 上下文消耗 | 持续占用 | 仅在调用时 |

官方建议：
> "CLAUDE.md is loaded every session, so only include things that apply broadly. For domain knowledge or workflows that are only relevant sometimes, use skills instead."

---

## 八、对 Ensemble 设计的影响

### 8.1 Scene 分发策略

基于合并规则，Ensemble 在分发 Claude.md 到项目时需要考虑：
- **不应替换**：项目可能已有 CLAUDE.md，应采用追加或合并策略
- **考虑 symlink**：与 Skill 一致，可以使用 symlink 指向 Ensemble 管理的源文件
- **本地配置独立**：CLAUDE.local.md 应由用户自行管理，不参与 Scene 分发

### 8.2 UI 设计考虑

- 需要支持 Markdown 编辑和预览
- 需要显示不同层级的 CLAUDE.md 状态
- 可能需要提示用户重启 Claude Code 会话以使更改生效

### 8.3 数据模型扩展

Scene 需要新增字段存储 Claude.md 配置：
```typescript
interface Scene {
  // ...existing fields
  claudeMdContent?: string;  // 场景的 Claude.md 内容
}
```

---

## 九、参考来源

- [Memory Documentation](https://code.claude.com/docs/en/memory.md) - 官方记忆系统文档
- [Settings Documentation](https://code.claude.com/docs/en/settings.md) - 官方配置系统文档
- [Best Practices](https://code.claude.com/docs/en/best-practices.md) - 官方最佳实践指南
- [Skills Documentation](https://code.claude.com/docs/en/skills.md) - Skills 与 CLAUDE.md 的关系

---

*文档版本: 2.0*
*研究完成时间: 2026-02-04*
*研究方法: 通过 WebFetch 直接获取 Claude Code 官方文档*
