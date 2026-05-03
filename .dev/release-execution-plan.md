# Release Execution Plan - SubAgent 规划文档

**日期**: 2026-02-07
**任务**: 完成 Ensemble 发布前的最后准备工作

---

## 执行概览

| SubAgent | 任务 | 输入 | 输出 |
|----------|------|------|------|
| A: Screenshot + README | 复制截图到项目目录并更新 README | 截图文件 + README.md | 更新后的 docs/screenshots/ 和 README.md |
| B: Twitter Post | 撰写 Twitter/X 发布推文 | Reddit/HN 文案 + 截图描述 | launch-posts-twitter.md |
| C: 小红书 Post | 撰写小红书发布帖子 | Reddit/HN 文案 + 截图描述 | launch-posts-xiaohongshu.md |

SubAgent B 和 C 可并行执行。SubAgent A 独立执行。

---

## SubAgent A: Screenshot + README

### 任务描述
1. 将截图从 `/Users/bo/Documents/Development/Ensemble/截图/` 复制到 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/screenshots/`
2. 使用语义化名称重命名
3. 在 README.md 的 Overview section 之后、Features section 之前添加 Hero 图

### 截图映射表

| 原文件名 | 新文件名 | 内容 |
|----------|----------|------|
| `CleanShot 2026-02-07 at 13.27.00@2x.png` | `skills-list.png` | Skills 列表页 |
| `CleanShot 2026-02-07 at 13.27.52@2x.png` | `mcp-servers-list.png` | MCP Servers 列表页 |
| `CleanShot 2026-02-07 at 13.28.14@2x.png` | `claude-md-list.png` | CLAUDE.md 文件列表 |
| `CleanShot 2026-02-07 at 13.28.29@2x.png` | `scenes-list.png` | Scenes 列表页 |
| `CleanShot 2026-02-07 at 13.28.42@2x.png` | `projects-list.png` | Projects 列表页 |
| `CleanShot 2026-02-07 at 13.30.48@2x.png` | `category-filter.png` | 分类筛选视图 |
| `CleanShot 2026-02-07 at 13.32.08@2x.png` | `skill-detail.png` | Skill 详情面板 (Hero 图) |
| `CleanShot 2026-02-07 at 13.32.46@2x.png` | `mcp-detail.png` | MCP Server 详情面板 |
| `CleanShot 2026-02-07 at 13.33.14@2x.png` | `claude-md-detail.png` | CLAUDE.md 详情面板 |
| `CleanShot 2026-02-07 at 13.33.32@2x.png` | `scene-detail.png` | Scene 详情面板 |
| `CleanShot 2026-02-07 at 13.33.51@2x.png` | `project-config.png` | Project 配置面板 |

### README 修改
在 Overview section 末尾（`5. **Launch** Claude Code from Finder with the right configuration` 之后）添加:

```markdown

![Ensemble - Skills Management with Detail Panel](docs/screenshots/skill-detail.png)
```

注意：不要改动 README 的任何其他内容。只在指定位置插入这一行。

---

## SubAgent B: Twitter/X Post

### 任务描述
撰写一条 Twitter/X 发布推文 (主帖 + 线程回复)。

### 上下文文件（必须阅读）
1. `/Users/bo/Documents/Development/Ensemble/launch-posts-reddit.md` — Reddit 文案参考
2. `/Users/bo/Documents/Development/Ensemble/launch-posts-hn.md` — HN 文案参考
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/release-readiness-analysis.md` — 项目完整信息

### 格式规范
- **主帖**: 不超过 280 字符（英文），简洁有力
- **线程 (Thread)**: 3-5 条回复，每条独立成段，补充细节
- 包含 GitHub 链接: `https://github.com/O0000-code/Ensemble`
- 语言: 英文
- 语气: 开发者社区友好、略带个人化 ("I built...")，不过度营销
- 标签建议: #ClaudeCode #AI #MacOS #OpenSource #Tauri

### 截图使用指南
主帖附 3 张截图（用户手动上传）：
1. **大图 (最显眼位置)**: Skill 详情面板 — 完整展示三栏 UI
2. **小图 1**: Scene 详情面板 — 展示 Scenes 核心概念
3. **小图 2**: Project 配置面板 — 展示一键部署

### 输出要求
- 写入文件: `/Users/bo/Documents/Development/Ensemble/launch-posts-twitter.md`
- 格式: 清晰分隔主帖和线程回复
- 标注每条回复的序号和附图说明

---

## SubAgent C: 小红书 Post

### 任务描述
撰写一条小红书发布帖子。

### 上下文文件（必须阅读）
1. `/Users/bo/Documents/Development/Ensemble/launch-posts-reddit.md` — Reddit 文案参考
2. `/Users/bo/Documents/Development/Ensemble/launch-posts-hn.md` — HN 文案参考
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/release-readiness-analysis.md` — 项目完整信息

### 格式规范
- **标题**: 20-30 字中文，带表情符号，吸引点击
- **正文**: 500-1000 字中文
- **语气**: 友好分享型，像对朋友介绍一个好用的工具，不过度技术化
- **结构**: 痛点引入 → 解决方案 → 核心功能 → 技术亮点 → 下载链接
- **标签**: 10-15 个相关标签（中文为主）
- GitHub 链接: `https://github.com/O0000-code/Ensemble`

### 截图使用指南
帖子附 5-6 张图片（轮播格式，用户手动上传）：
1. **封面图 (第 1 张，决定点击率)**: Skill 详情面板 — 展示应用完整 UI
2. **第 2 张**: Skills 列表页 — 展示技能管理
3. **第 3 张**: MCP 详情面板 — 展示工具发现
4. **第 4 张**: Scene 详情面板 — 展示场景预设
5. **第 5 张**: Project 配置面板 — 展示项目部署
6. **(可选) 第 6 张**: 分类筛选视图 — 展示组织能力

### 输出要求
- 写入文件: `/Users/bo/Documents/Development/Ensemble/launch-posts-xiaohongshu.md`
- 格式: 标题、正文、标签、图片使用说明分隔清晰
- 每张图标注对应截图名称和展示重点

---

## 质量标准

1. **准确性**: 所有技术描述必须与 README/CHANGELOG 中的一致
2. **链接**: 只使用 `https://github.com/O0000-code/Ensemble` 这一个 GitHub URL
3. **保守性**: 不对现有文件做任何额外修改，只做规划中明确指定的操作
4. **一致性**: 各平台文案的功能描述要保持一致，不能出现矛盾
