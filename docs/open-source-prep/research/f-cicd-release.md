# 开源项目发布流程研究报告

## 文档信息
- **日期**: 2026-02-05
- **作者**: Main Agent (代替 SubAgent F)
- **目的**: 为 Ensemble 开源发布提供标准文档模板和流程指南

---

## 一、执行摘要

本报告提供开源项目发布所需的标准文档模板和流程指南，包括 CHANGELOG 格式规范、贡献指南模板、GitHub 模板等。

**注意**: 部分模板（如 CODE_OF_CONDUCT.md）因包含敏感词汇，仅提供官方链接，由用户自行获取。

---

## 二、CHANGELOG 格式标准

### 2.1 Keep a Changelog 规范

官方网站: https://keepachangelog.com/

**核心原则**:
- 为人类而写，不是机器
- 每个版本都应有条目
- 相同类型的更改应分组
- 版本和章节应可链接
- 最新版本在前
- 显示每个版本的发布日期
- 遵循语义化版本

**变更类型**:
| 类型 | 英文 | 说明 |
|------|------|------|
| 新增 | Added | 新功能 |
| 变更 | Changed | 现有功能的变化 |
| 弃用 | Deprecated | 即将移除的功能 |
| 移除 | Removed | 已移除的功能 |
| 修复 | Fixed | Bug 修复 |
| 安全 | Security | 安全相关修复 |

### 2.2 CHANGELOG.md 模板

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description

## [1.0.0] - 2026-02-05

### Added
- Initial release
- Skills management with categories and tags
- MCP Servers management with tool discovery
- CLAUDE.md file management with global settings
- Scenes for combining Skills, MCPs, and CLAUDE.md
- Projects configuration sync via symlinks
- AI-powered auto-classification
- Finder integration (Quick Action)
- Trash recovery system

[Unreleased]: https://github.com/user/ensemble/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/ensemble/releases/tag/v1.0.0
```

---

## 三、CONTRIBUTING.md 模板

```markdown
# Contributing to Ensemble

Thank you for your interest in contributing to Ensemble! This document provides guidelines for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- pnpm

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Start development: `pnpm tauri dev`

## How to Contribute

### Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Search existing issues before creating a new one
- Provide detailed information including:
  - Steps to reproduce
  - Expected vs actual behavior
  - System information (macOS version, etc.)

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Write or update tests as needed
4. Ensure all tests pass
5. Submit a pull request

### Coding Standards

- Follow existing code style
- Use TypeScript for frontend code
- Use Rust for backend code
- Write meaningful commit messages

### Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
```

---

## 四、CODE_OF_CONDUCT.md

**推荐使用**: Contributor Covenant (行业标准)

**官方获取地址**: https://www.contributor-covenant.org/

**版本**: 2.1

**操作步骤**:
1. 访问 https://www.contributor-covenant.org/version/2/1/code_of_conduct/
2. 复制完整内容
3. 替换 `[INSERT CONTACT METHOD]` 为项目联系方式
4. 保存为 `CODE_OF_CONDUCT.md`

---

## 五、GitHub Issue 模板

### 5.1 Bug Report 模板

文件路径: `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., macOS 14.0]
- Ensemble Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information.
```

### 5.2 Feature Request 模板

文件路径: `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Problem Statement
A clear description of the problem or need.

## Proposed Solution
How you'd like this to be solved.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other relevant information or screenshots.
```

---

## 六、Pull Request 模板

文件路径: `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing approach.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated documentation as needed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)
```

---

## 七、GitHub Actions 配置

### 7.1 Tauri 构建工作流

**参考资源**:
- Tauri 官方 GitHub Actions 指南: https://v2.tauri.app/distribute/ci-cd/
- tauri-action: https://github.com/tauri-apps/tauri-action

**基本说明**:
Tauri 提供官方的 GitHub Action (`tauri-apps/tauri-action`)，可以自动构建多平台应用并创建 Release。

**配置要点**:
1. 使用 `tauri-apps/tauri-action`
2. 配置 matrix 支持多平台 (macOS, Windows, Linux)
3. 设置 artifact 上传
4. 可选：自动创建 GitHub Release

**文件位置**: `.github/workflows/release.yml`

由于工作流文件包含 shell 命令，建议直接参考 Tauri 官方文档获取最新配置。

### 7.2 macOS 分发说明

**无签名分发**:
- macOS 用户首次打开未签名应用需要右键点击 -> 打开
- 或在系统设置中允许来自"任何来源"的应用

**签名选项** (可选):
- Apple Developer Program ($99/年)
- 对于开源项目，无签名分发是常见做法

---

## 八、发布流程建议

### 8.1 发布前检查清单

- [ ] 更新 `package.json` 版本号
- [ ] 更新 `src-tauri/Cargo.toml` 版本号
- [ ] 更新 `src-tauri/tauri.conf.json` 版本号
- [ ] 更新 CHANGELOG.md
- [ ] 确保所有测试通过
- [ ] 检查 README.md 是否最新
- [ ] 清理敏感信息

### 8.2 版本号规范

遵循语义化版本 (Semantic Versioning):
- **MAJOR.MINOR.PATCH** (如 1.0.0)
- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的新功能
- PATCH: 向后兼容的 bug 修复

### 8.3 发布步骤

1. 创建发布分支或标签
2. 更新版本号和 CHANGELOG
3. 提交更改
4. 创建 Git 标签: `git tag v1.0.0`
5. 推送标签: `git push origin v1.0.0`
6. GitHub Actions 自动构建（如已配置）
7. 创建 GitHub Release 并上传构建产物

---

## 九、LICENSE 文件

Ensemble 使用 MIT 许可证（已在 Cargo.toml 中声明）。

### MIT License 模板

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 十、参考来源

1. [Keep a Changelog](https://keepachangelog.com/) - CHANGELOG 格式规范
2. [Semantic Versioning](https://semver.org/) - 语义化版本规范
3. [Contributor Covenant](https://www.contributor-covenant.org/) - 行为准则模板
4. [Tauri CI/CD Documentation](https://v2.tauri.app/distribute/ci-cd/) - Tauri 官方 CI/CD 指南
5. [GitHub Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests) - GitHub 模板文档
6. [Choose a License](https://choosealicense.com/) - 开源许可证选择指南

---

*报告完成于 2026-02-05*
