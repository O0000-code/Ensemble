# 第一轮 SubAgent 执行规划 - 调查阶段

## 一、本轮目标

并行发布多个 SubAgent，全面收集项目中需要检查的各类问题，为后续分析和修改提供完整数据。

## 二、SubAgent 任务分配

### SubAgent 1: Console 语句调查
**任务**: 搜索并分类所有 console 语句
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/console-statements.md`

**执行步骤**:
1. 使用 Grep 工具搜索所有 `.ts`、`.tsx`、`.js` 文件中的 `console.log`
2. 使用 Grep 工具搜索所有 `console.warn`
3. 使用 Grep 工具搜索所有 `console.error`
4. 对每个发现的语句，记录:
   - 文件路径和行号
   - 完整的代码上下文（前后 5 行）
   - 初步分类: `debug`(调试)、`error-handling`(错误处理)、`business`(业务日志)、`unknown`(不确定)
5. 将结果写入输出文件

**输出格式**:
```markdown
# Console 语句调查报告

## 统计摘要
- console.log: X 处
- console.warn: X 处
- console.error: X 处

## 详细列表

### 1. [文件路径:行号]
**类型**: console.log/warn/error
**分类**: debug/error-handling/business/unknown
**代码上下文**:
```
[代码]
```
**分析**: [为什么这样分类]
```

---

### SubAgent 2: 敏感信息调查
**任务**: 搜索可能的敏感信息
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/sensitive-info.md`

**执行步骤**:
1. 搜索 `api_key`、`apiKey`、`API_KEY` 相关模式
2. 搜索 `password`、`secret`、`token` 相关模式
3. 搜索硬编码路径 `/Users/` 模式
4. 搜索 `.env` 文件引用
5. 检查是否有 `.env` 文件在版本控制中
6. 对每个发现，评估风险级别

**输出格式**:
```markdown
# 敏感信息调查报告

## 统计摘要
- API Key 相关: X 处
- 密码相关: X 处
- 硬编码路径: X 处

## 详细列表

### 1. [文件路径:行号]
**类型**: api-key/password/path/other
**风险级别**: high/medium/low
**代码上下文**:
```
[代码]
```
**分析**: [风险评估]
**建议**: [处理建议]
```

---

### SubAgent 3: 前端 Lint 检查
**任务**: 运行前端代码检查工具
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/frontend-lint.md`

**执行步骤**:
1. 检查项目根目录是否有 ESLint 配置 (`.eslintrc.*`, `eslint.config.*`)
2. 检查 `package.json` 中的 lint 脚本
3. 如果有配置，运行 `npm run lint` 或 `npx eslint src/`
4. 记录所有 warning 和 error
5. 检查 TypeScript 编译是否有错误 (`npm run build` 或 `tsc --noEmit`)

**输出格式**:
```markdown
# 前端 Lint 检查报告

## ESLint 配置
- 配置文件: [路径]
- 规则集: [使用的规则]

## ESLint 结果
### Errors (X 个)
[列表]

### Warnings (X 个)
[列表]

## TypeScript 检查结果
[结果]
```

---

### SubAgent 4: Rust Clippy 检查
**任务**: 运行 Rust 代码检查工具
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/rust-clippy.md`

**执行步骤**:
1. 进入 `src-tauri` 目录
2. 运行 `cargo clippy -- -W clippy::all 2>&1`
3. 记录所有 warning 和建议
4. 运行 `cargo build` 确认可以编译

**输出格式**:
```markdown
# Rust Clippy 检查报告

## Clippy 结果

### Warnings (X 个)
[详细列表，包含文件路径、行号、警告内容]

### Suggestions
[改进建议]

## 编译状态
- 编译是否成功: Yes/No
- 编译警告数量: X
```

---

### SubAgent 5: 前端依赖分析
**任务**: 检查前端未使用的依赖
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/frontend-deps.md`

**执行步骤**:
1. 读取 `package.json`，列出所有 dependencies 和 devDependencies
2. 对每个依赖，搜索项目中是否有 import 语句
3. 检查是否有依赖只在配置文件中使用（如 vite 插件）
4. 标记可能未使用的依赖

**输出格式**:
```markdown
# 前端依赖分析报告

## Dependencies (X 个)
| 依赖名 | 版本 | 使用状态 | 使用位置 |
|-------|-----|---------|---------|
| xxx   | x.x | used/unused/config-only | [文件列表] |

## DevDependencies (X 个)
[同上格式]

## 可能未使用的依赖
[列表及分析]
```

---

### SubAgent 6: Rust 依赖分析
**任务**: 检查 Rust 未使用的依赖
**输出文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-source-prep/reports/investigation/rust-deps.md`

**执行步骤**:
1. 读取 `src-tauri/Cargo.toml`，列出所有依赖
2. 搜索 Rust 代码中的 `use` 语句
3. 检查 `[features]` 中引用的依赖
4. 运行 `cargo tree` 查看依赖树（如果可用）
5. 标记可能未使用的依赖

**输出格式**:
```markdown
# Rust 依赖分析报告

## Dependencies
| 依赖名 | 版本 | 使用状态 | 使用位置 |
|-------|-----|---------|---------|

## 可能未使用的依赖
[列表及分析]

## 依赖树
[cargo tree 输出摘要]
```

## 三、执行要求

1. 每个 SubAgent **必须**将结果写入指定的输出文件
2. 输出格式必须严格遵循上述模板
3. 对于不确定的分类，标记为 `unknown` 并说明原因
4. 搜索时使用完整的代码上下文，便于后续分析
5. 不要做任何修改，只做调查和记录

## 四、目录结构

执行前需要确保目录存在:
```
docs/open-source-prep/reports/
└── investigation/
    ├── console-statements.md
    ├── sensitive-info.md
    ├── frontend-lint.md
    ├── rust-clippy.md
    ├── frontend-deps.md
    └── rust-deps.md
```
