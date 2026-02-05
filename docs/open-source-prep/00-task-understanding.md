# 开源发布准备 - 任务理解文档

## 一、任务背景

Ensemble 是一个 macOS 桌面应用，用于管理 Claude Code 的 Skills、MCP Servers 和 CLAUDE.md 文件。项目基于 Tauri 2.0 (Rust + React) 构建，已完成第一版的核心功能开发。

**当前目标**：准备项目的开源发布，包括文档撰写、开源协议、GitHub 配置等所有发布前的准备工作。

## 二、项目现状分析

### 2.1 技术架构

| 层次 | 技术 | 版本 |
|------|------|------|
| 桌面框架 | Tauri | 2.9.5 |
| 前端框架 | React | 18.3.1 |
| 类型系统 | TypeScript | 5.9.3 |
| 样式框架 | Tailwind CSS | 4.1.18 |
| 状态管理 | Zustand | 5.0.10 |
| 路由 | React Router | 7.13.0 |
| 图标库 | Lucide Icons | 0.500.0 |
| 后端语言 | Rust | 1.77.2+ |

### 2.2 代码规模

| 类型 | 数量 |
|------|------|
| 前端 TypeScript 文件 | 94 个 |
| 前端代码行数 | ~24,177 行 |
| 后端 Rust 文件 | 19 个 |
| 开发文档 | 100+ 个 |

### 2.3 核心功能

1. **Skills 管理**：扫描、分类、标签、导入、AI 自动分类
2. **MCP Servers 管理**：扫描、配置、工具发现
3. **CLAUDE.md 管理**：扫描、导入、全局设置、项目分发
4. **Scenes 场景管理**：组合 Skills + MCPs + CLAUDE.md 的预设模板
5. **Projects 项目管理**：关联场景、同步配置
6. **Settings 设置**：终端应用选择、Finder 集成、回收站恢复

### 2.4 缺失的开源文件

| 文件 | 状态 | 重要性 |
|------|------|--------|
| README.md | 不存在 | **必需** |
| LICENSE | 不存在 | **必需** |
| CHANGELOG.md | 不存在 | 推荐 |
| CONTRIBUTING.md | 不存在 | 推荐 |
| CODE_OF_CONDUCT.md | 不存在 | 可选 |
| .github/ISSUE_TEMPLATE/ | 不存在 | 推荐 |
| .github/PULL_REQUEST_TEMPLATE.md | 不存在 | 推荐 |

## 三、开源发布任务清单

### 3.1 必需任务

| 编号 | 任务 | 说明 |
|------|------|------|
| T1 | 撰写 README.md | 完整的项目介绍、安装说明、使用方法、截图展示 |
| T2 | 添加 LICENSE | MIT 许可证（Cargo.toml 中已声明） |
| T3 | 应用截图 | 捕获主要页面的高质量截图 |

### 3.2 推荐任务

| 编号 | 任务 | 说明 |
|------|------|------|
| T4 | 撰写 CHANGELOG.md | 版本变更记录 |
| T5 | 撰写 CONTRIBUTING.md | 贡献指南 |
| T6 | 创建 GitHub Issue Templates | Bug 报告、功能请求模板 |
| T7 | 创建 PR Template | Pull Request 模板 |

### 3.3 可选任务

| 编号 | 任务 | 说明 |
|------|------|------|
| T8 | CODE_OF_CONDUCT.md | 行为准则 |
| T9 | Landing Page 设计 | 产品介绍页面（.pen 文件） |
| T10 | GitHub Actions | CI/CD 配置（可后续添加） |

## 四、任务依赖关系

```
T3 (截图) ←── T1 (README) ←── 最终验证
                ↑
T2 (LICENSE) ──┤
                ↑
T4 (CHANGELOG) ─┤
                ↑
T5 (CONTRIBUTING) ─┤
                    ↑
T6 (Issue Templates) ─┤
                       ↑
T7 (PR Template) ──────┘
```

**依赖说明**：
- T3 (截图) 是 T1 (README) 的前置依赖
- T1 (README) 依赖于截图完成
- 其他任务相对独立，可并行执行
- 最终需要整体验证

## 五、执行策略

### Phase 1: 准备阶段
1. 创建 Git Worktree 分支
2. 捕获应用截图（需要运行应用）

### Phase 2: 并行文档撰写
同时执行多个 SubAgent：
- SubAgent A: 撰写 README.md
- SubAgent B: 创建 LICENSE
- SubAgent C: 撰写 CHANGELOG.md
- SubAgent D: 撰写 CONTRIBUTING.md
- SubAgent E: 创建 GitHub Templates

### Phase 3: 验证与整合
1. 检查所有文档一致性
2. 运行应用验证功能
3. 合并到 main 分支

## 六、质量标准

### 6.1 README.md 质量标准
- 项目徽章（License, Version 等）
- 清晰的项目描述和动机
- 高质量截图展示主要功能
- 完整的安装说明（前提条件、步骤）
- 使用说明和快速入门
- 技术架构概述
- 贡献指南链接
- 许可证信息

### 6.2 截图质量标准
- 清晰度：Retina 分辨率
- 内容：展示真实数据而非空状态
- 覆盖：至少包含 Skills、MCP、Scenes、Projects 主要页面
- 格式：PNG 格式，适当压缩

### 6.3 代码仓库标准
- 无敏感信息泄露
- .gitignore 完整
- 版本号一致（package.json, Cargo.toml, tauri.conf.json）

## 七、风险与应对

| 风险 | 应对措施 |
|------|----------|
| 截图需要运行应用 | 使用 `npm run tauri dev` 启动应用后截图 |
| 文档一致性问题 | 定义统一的术语表和风格指南 |
| Git 冲突 | 使用 Worktree 隔离开发 |

## 八、预期产出

完成后，项目应具备以下文件结构：

```
Ensemble2/
├── README.md                 # 项目介绍
├── LICENSE                   # MIT 许可证
├── CHANGELOG.md              # 版本记录
├── CONTRIBUTING.md           # 贡献指南
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── screenshots/          # 应用截图
│       ├── skills-page.png
│       ├── mcp-servers-page.png
│       ├── scenes-page.png
│       └── projects-page.png
└── ... (现有代码)
```

## 九、术语定义

为保证文档一致性，定义以下术语：

| 术语 | 定义 |
|------|------|
| Skill | Claude Code 的技能模块，定义在 SKILL.md 文件中 |
| MCP Server | Model Context Protocol 服务器，提供工具能力 |
| CLAUDE.md | Claude Code 的项目级配置文件 |
| Scene | 场景预设，包含 Skills + MCPs + CLAUDE.md 的组合 |
| Project | 本地项目目录，关联一个 Scene |
| Ensemble | 本应用的名称 |
| Global Scope | 全局作用域，配置写入 ~/.claude/ |
| Project Scope | 项目作用域，配置写入项目 .claude/ 目录 |
