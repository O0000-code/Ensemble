# 第一轮 SubAgent 执行规划 - 信息收集

## 文档信息
- 创建日期: 2026-02-05
- 阶段: Round 1 - Information Gathering
- 目的: 通过多个 SubAgent 并行收集开源发布所需的全部信息

---

## 一、本轮任务目标

在开始撰写任何开源文档之前，需要全面收集以下信息：
1. 项目完整功能清单（从代码和文档两个维度）
2. 优秀开源项目的 README 最佳实践
3. macOS 最佳截图工具推荐
4. Tauri 应用的 CI/CD 最佳实践
5. 演示数据（预设 Skills/MCPs/Categories/Tags）的最佳选择
6. 开源协议的最终确认

---

## 二、SubAgent 任务分配

### SubAgent A: 代码结构与功能分析
**输出文件**: `docs/open-source-prep/research/a-code-structure-analysis.md`

**任务**:
1. 分析 `src/` 目录结构，列出所有页面和组件
2. 分析 `src-tauri/` 后端功能
3. 从代码角度总结完整功能清单
4. 特别关注 Claude.md 管理功能（三位一体中的重要部分）

**需要读取的文件**:
- `src/App.tsx` - 路由配置
- `src/pages/` 下所有页面文件
- `src-tauri/src/lib.rs` - Rust 后端命令
- `src/stores/` - 状态管理

---

### SubAgent B: 开发文档分析
**输出文件**: `docs/open-source-prep/research/b-dev-docs-analysis.md`

**任务**:
1. 阅读 `docs/99-project-completion-report.md` 和其他关键开发文档
2. 提取项目的设计目标、核心功能、技术架构
3. 整理版本历史和重要里程碑
4. 识别可用于 README 的描述内容

**需要读取的文件**:
- `docs/99-project-completion-report.md`
- `docs/00-project-understanding.md`
- `docs/02-development-master-plan.md`
- `docs/claude-md-feature/09-feature-design-proposal.md`
- `docs/claude-md-feature/10-research-summary-report.md`

---

### SubAgent C: 优秀开源项目 README 研究
**输出文件**: `docs/open-source-prep/research/c-readme-best-practices.md`

**任务**:
1. 研究 GitHub 上优秀桌面应用项目的 README 结构
2. 特别关注 Tauri 应用的 README 示例
3. 总结 README 的最佳结构和内容要素
4. 收集徽章（badges）的最佳实践

**研究对象**（通过 WebSearch/WebFetch）:
- Tauri 官方示例项目
- Warp Terminal README
- Raycast README
- Linear App 文档风格

---

### SubAgent D: macOS 截图工具研究
**输出文件**: `docs/open-source-prep/research/d-screenshot-tools.md`

**任务**:
1. 研究 macOS 上最专业的截图工具
2. 评估付费和免费选项
3. 重点关注：窗口截图美化、阴影效果、背景设置
4. 推荐最适合应用展示截图的工具
5. 提供截图最佳实践指南

**研究关键词**:
- macOS screenshot tool app preview
- CleanShot X vs Shottr vs Snagit
- App Store screenshot best practices

---

### SubAgent E: 预设演示数据研究
**输出文件**: `docs/open-source-prep/research/e-demo-data-design.md`

**任务**:
1. 研究 Claude Code 最常用的 Skills（从 awesome-claude-code 等资源）
2. 研究最常用的 MCP Servers
3. 设计合理的分类（Categories）体系
4. 设计实用的标签（Tags）体系
5. 确保演示数据能展示应用的所有核心功能

**研究资源**:
- awesome-claude-code GitHub 仓库
- Claude Code 官方文档
- MCP 官方仓库列表

---

### SubAgent F: CI/CD 与发布流程研究
**输出文件**: `docs/open-source-prep/research/f-cicd-release.md`

**任务**:
1. 研究 Tauri 应用的 GitHub Actions 配置
2. 了解 macOS 应用签名和分发选项
3. 总结开源项目的标准发布流程
4. 研究 CHANGELOG 格式标准（Keep a Changelog）

**研究关键词**:
- Tauri GitHub Actions build
- macOS app code signing open source
- Keep a Changelog format

---

## 三、输出文件目录结构

```
docs/open-source-prep/
├── 00-task-understanding.md          # [已存在] 另一个Agent的理解文档
├── 01-round1-subagent-plan.md        # [本文档] 第一轮执行规划
├── research/                          # [新建] 研究结果目录
│   ├── a-code-structure-analysis.md
│   ├── b-dev-docs-analysis.md
│   ├── c-readme-best-practices.md
│   ├── d-screenshot-tools.md
│   ├── e-demo-data-design.md
│   └── f-cicd-release.md
```

---

## 四、SubAgent 执行要求

### 4.1 通用要求
1. **模型**: 必须使用 Opus 4.5
2. **输出**: 所有结果必须写入指定的 md 文件
3. **格式**: 使用清晰的 Markdown 格式，包含目录、表格、代码块
4. **深度**: 提供详细、可操作的信息，而非泛泛而谈

### 4.2 文件读取要求
每个 SubAgent 在开始任务前必须：
1. 首先读取本规划文档 (`01-round1-subagent-plan.md`)
2. 读取项目理解文档 (`00-task-understanding.md`)
3. 然后读取各自任务指定的文件

### 4.3 输出格式要求
每个研究报告必须包含：
1. 文档信息（日期、作者、目的）
2. 执行摘要（Executive Summary）
3. 详细发现
4. 可操作的建议
5. 参考来源

---

## 五、执行顺序

本轮所有 SubAgent 可以**并行执行**，因为它们之间没有依赖关系。

执行完成后，由 Main Agent 汇总所有研究结果，制定第二轮执行计划。

---

## 六、质量检查点

Main Agent 在收到研究结果后将检查：
1. 所有 6 个研究文件是否都已创建
2. 内容是否足够详细和可操作
3. 是否有需要补充研究的领域
4. 是否可以进入文档撰写阶段
