# Claude.md 官方规范研究报告

> 创建时间: 2026-02-04
> 创建者: SubAgent B1 (Claude.md 规范研究者)

---

## 一、配置层级体系

### 1.1 支持的层级

Claude.md 支持三个主要配置层级，从广泛到具体：

1. **用户级（User Scope）**
   - 位置：`~/.claude/CLAUDE.md`
   - 作用域：全局，应用于用户的所有项目
   - 团队共享：否
   - 用途：设置个人偏好、通用编码规范、全局工作流程

2. **项目级（Project Scope）**
   - 位置：项目根目录的 `CLAUDE.md` 或 `.claude/CLAUDE.md`
   - 作用域：整个项目
   - 团队共享：是（通常提交到 git）
   - 用途：项目架构说明、构建命令、团队编码规范

3. **本地级（Local Scope）**
   - 位置：`CLAUDE.local.md` 或 `.claude.local.md`
   - 作用域：仅限当前用户的当前项目
   - 团队共享：否（应添加到 `.gitignore`）
   - 用途：个人项目覆盖设置、本地环境配置

4. **目录级（Directory Scope）** - 用于 Monorepo
   - 位置：子目录中的 `CLAUDE.md`（如 `packages/api/CLAUDE.md`）
   - 作用域：特定子目录/模块
   - 用途：模块特定的上下文和规范

### 1.2 文件路径表

| 层级 | 路径 | 说明 | 团队共享 |
|------|------|------|----------|
| 用户级 | `~/.claude/CLAUDE.md` | 全局默认配置，适用于所有项目 | 否 |
| 项目级 | `./CLAUDE.md` | 项目根目录，主要项目上下文 | 是 |
| 项目级 | `./.claude/CLAUDE.md` | 项目根目录的 .claude 子目录 | 是 |
| 本地级 | `./CLAUDE.local.md` | 项目根目录，个人覆盖设置 | 否 |
| 本地级 | `./.claude.local.md` | 项目根目录（点文件形式） | 否 |
| 目录级 | `./packages/*/CLAUDE.md` | Monorepo 中的模块级配置 | 是 |
| 目录级 | 任意嵌套位置 | 功能/领域特定上下文 | 视情况 |

### 1.3 关于 `.claude/CLAUDE.md` 目录形式

**是的，支持**。Claude Code 支持将 CLAUDE.md 放置在 `.claude/` 子目录中，即 `.claude/CLAUDE.md`。这是一种组织配置文件的替代方案，有助于保持项目根目录整洁。

---

## 二、文件格式规范

### 2.1 内容格式

- **格式**：标准 Markdown
- **大小写敏感**：文件名必须是 `CLAUDE.md`（大写 CLAUDE，小写 .md）
- **无 Frontmatter 要求**：CLAUDE.md 不需要 YAML frontmatter（与 SKILL.md 不同）
- **编码**：UTF-8

### 2.2 推荐的内容结构

根据官方模板和最佳实践，推荐包含以下部分（按需选用）：

```markdown
# 项目名称

一句话项目描述

## Commands
| 命令 | 描述 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm test` | 运行测试 |

## Architecture
```
src/
  components/  # UI 组件
  hooks/       # 自定义 hooks
  utils/       # 工具函数
```

## Key Files
- `src/main.ts` - 应用入口
- `src/config.ts` - 配置管理

## Code Style
- 使用 TypeScript，避免 any
- 组件使用 PascalCase
- 使用 ESLint + Prettier

## Environment
- `DATABASE_URL` - 数据库连接字符串
- `API_KEY` - API 密钥

## Testing
- `npm test` - 运行所有测试
- 使用 Vitest 框架

## Gotchas
- 构建前需要运行 `npm run generate`
- 不要直接修改 `dist/` 目录
```

### 2.3 特殊语法

CLAUDE.md 本身**没有特殊语法**，它是纯 Markdown 文件。但在 SKILL.md 中存在一些特殊语法（如 `!`command`` 动态注入）不适用于 CLAUDE.md。

### 2.4 限制

| 限制类型 | 说明 |
|---------|------|
| **内容长度** | 没有硬性限制，但建议保持简洁。CLAUDE.md 会被添加到每个对话的上下文中，过长会消耗 token |
| **文件引用** | 不支持直接引用或包含其他文件 |
| **安全性** | **不要包含敏感信息**（API 密钥、凭据、数据库连接字符串等），特别是如果提交到版本控制 |

### 2.5 最佳实践原则

1. **简洁**：密集、人类可读的内容
2. **可操作**：命令应可直接复制粘贴执行
3. **项目特定**：记录项目独有的模式，而非通用建议
4. **保持更新**：所有信息应反映当前代码库状态

---

## 三、加载与合并规则

### 3.1 加载顺序

CLAUDE.md 文件按以下顺序加载（从广泛到具体）：

```
1. ~/.claude/CLAUDE.md           # 用户级（最广泛）
2. 项目根目录/CLAUDE.md          # 项目级
3. 项目根目录/.claude/CLAUDE.md  # 项目级（目录形式）
4. 项目根目录/CLAUDE.local.md    # 本地级覆盖
5. 当前目录/CLAUDE.md            # 目录级（如在子目录中运行）
```

**父目录自动发现**：Claude Code 会自动发现父目录中的 CLAUDE.md 文件，这使得 monorepo 设置能够自动工作。

### 3.2 合并规则

| 规则 | 说明 |
|------|------|
| **合并方式** | **内容拼接/合并**，而非替换 |
| **优先级** | 更具体的作用域（本地级、目录级）**增强或覆盖**更广泛的作用域 |
| **冲突处理** | 更具体层级的指令优先 |

**关键点**：
- 所有适用的 CLAUDE.md 文件的内容会被**拼接**在一起
- 这意味着用户级的通用指令会与项目级的特定指令共同生效
- 如果存在冲突的指令，更具体的（项目级 > 用户级）会被优先考虑

### 3.3 额外目录加载

通过环境变量可以控制是否从 `--add-dir` 指定的额外目录加载 CLAUDE.md：

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1
```

默认情况下，通过 `--add-dir` 添加的目录**不会**加载其中的 CLAUDE.md 文件。

---

## 四、集成机制

### 4.1 加载时机

- **会话启动时加载**：CLAUDE.md 在 Claude Code 会话启动时被加载
- **成为系统提示的一部分**：CLAUDE.md 的内容被注入到 Claude 的系统提示中
- **每次对话都包含**：每个对话都会自动包含 CLAUDE.md 的上下文

### 4.2 更新生效方式

| 场景 | 是否需要重启 | 说明 |
|------|-------------|------|
| 修改 CLAUDE.md | 可能需要 | 通常需要开始新会话才能看到更改 |
| 使用 `#` 快捷键 | 否 | Claude 自动将学习内容整合到 CLAUDE.md |
| 运行 `/init` | 否 | 立即生成/更新 CLAUDE.md |

**`#` 快捷键**：在 Claude Code 会话中按 `#` 键，可以让 Claude 自动将当前学习到的内容整合到相关的 CLAUDE.md 文件中。

### 4.3 相关 CLI 命令

| 命令 | 功能 |
|------|------|
| `/init` | 自动分析代码库并生成 CLAUDE.md 起始文件 |
| `/clear` | 清除上下文（CLAUDE.md 仍会在新会话中重新加载） |
| `/config` | 访问设置界面（CLAUDE.md 通过文件编辑管理） |

### 4.4 `/init` 命令详解

`/init` 命令是开始使用 CLAUDE.md 最快的方式：

1. 在项目目录中运行 `/init`
2. Claude 会分析项目结构和检测到的技术栈
3. 自动生成基于分析的 CLAUDE.md 起始文件
4. 生成的内容是**起点**，建议根据实际需求进行调整

---

## 五、关键发现总结

### 5.1 核心要点

1. **三层配置体系**：用户级 (`~/.claude/CLAUDE.md`) -> 项目级 (`./CLAUDE.md`) -> 本地级 (`./CLAUDE.local.md`)

2. **支持 `.claude/` 目录形式**：可以使用 `.claude/CLAUDE.md` 路径

3. **纯 Markdown 格式**：无需 frontmatter，无特殊语法

4. **内容合并而非替换**：多层级 CLAUDE.md 的内容会被拼接在一起

5. **会话启动时加载**：修改后通常需要新会话才能生效

6. **支持 Monorepo**：自动发现父目录的 CLAUDE.md，子目录可有自己的配置

7. **`/init` 命令**：快速生成项目特定的 CLAUDE.md

8. **`#` 快捷键**：运行时动态将学习内容整合到 CLAUDE.md

### 5.2 对 Ensemble 设计的影响

| 特性 | 对 Ensemble 的影响 |
|------|-------------------|
| 多层级配置 | Ensemble 需要支持管理多个层级的 CLAUDE.md |
| 用户级文件 | 需要能读写 `~/.claude/CLAUDE.md` |
| 项目级文件 | Scene 分发时需要考虑项目级 CLAUDE.md |
| 内容合并规则 | Scene 分发时避免内容重复 |
| 无特殊格式 | 可以使用简单的 Markdown 编辑器 |
| 会话启动时加载 | 可能需要提示用户重启 Claude Code 会话 |

### 5.3 文件位置对照表（完整）

```
~/.claude/
├── CLAUDE.md                    # 用户级全局配置

项目目录/
├── CLAUDE.md                    # 项目级配置（推荐）
├── CLAUDE.local.md              # 本地覆盖（gitignore）
├── .claude/
│   └── CLAUDE.md                # 项目级配置（目录形式）
├── .claude.local.md             # 本地覆盖（点文件形式）
└── packages/
    └── api/
        └── CLAUDE.md            # 目录级/模块级配置
```

---

## 六、参考来源

- [Claude Code settings - Claude Code Docs](https://code.claude.com/docs/en/settings)
- [Using CLAUDE.MD files: Customizing Claude Code for your codebase | Claude](https://claude.com/blog/using-claude-md-files)
- [The Complete Guide to CLAUDE.md](https://www.builder.io/blog/claude-md-guide)
- [Shipyard | Claude Code CLI Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/)
- [Claude Code - Setting up CLAUDE.md Files Tutorial | ClaudeCode.io](https://codeagents.app/tutorials/claude-md-setup)
- Claude 官方插件: `claude-md-management` (skills/claude-md-improver)

---

*文档版本: 1.0*
*研究完成时间: 2026-02-04*
