# 第二轮 SubAgent 执行规划 - 文案创作

## 文档信息
- **日期**: 2026-02-05
- **阶段**: Round 2 - Content Creation
- **目的**: 为各平台创建多风格版本的宣传文案

---

## 一、本轮任务目标

基于第一轮研究结果，为每个目标平台创建可直接使用的宣传文案，包含多种风格版本。

---

## 二、SubAgent 任务分配

### SubAgent S: X/Twitter 文案创作
**输出文件**: `docs/open-source-prep/marketing/content/s-twitter-content.md`

**创作内容**:
1. **Thread 版本 A - 夸张宣传版** (7 条推文)
2. **Thread 版本 B - 客观陈述版** (7 条推文)
3. **Thread 版本 C - 谦虚克制版** (7 条推文)
4. **单条推文版本** (用于分享)
5. **标签组合建议**
6. **配图建议**

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/n-twitter.md`
- `docs/open-source-prep/marketing/research/r-case-studies.md`
- `docs/open-source-prep/marketing/02-research-summary.md`

---

### SubAgent T: Product Hunt 文案创作
**输出文件**: `docs/open-source-prep/marketing/content/t-producthunt-content.md`

**创作内容**:
1. **Tagline 候选** (5 个选项)
2. **产品描述** (短版 + 长版)
3. **Maker 首评** (第一条评论)
4. **Gallery 图片说明** (5 张图配文)
5. **常见问题回答** (预设 Q&A)
6. **感谢投票的回复模板**

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/o-producthunt.md`
- `docs/open-source-prep/marketing/research/r-case-studies.md`

---

### SubAgent U: Hacker News 文案创作
**输出文件**: `docs/open-source-prep/marketing/content/u-hackernews-content.md`

**创作内容**:
1. **标题候选** (5 个选项)
2. **第一条评论** (详细版，包含背景故事)
3. **技术细节补充评论**
4. **回复批评的模板**
5. **回复赞扬的模板**

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/p-hackernews.md`
- `docs/open-source-prep/marketing/research/r-case-studies.md`

---

### SubAgent V: 中文平台文案创作 (V2EX + 即刻)
**输出文件**: `docs/open-source-prep/marketing/content/v-chinese-content.md`

**创作内容**:

**V2EX 部分**:
1. **帖子版本 A - 客观分享版** (适合 /go/share)
2. **帖子版本 B - 技术深度版** (适合 /go/macos)
3. **帖子版本 C - 求反馈版** (适合 /go/apple)

**即刻部分**:
1. **动态版本 A - 产品发布版**
2. **动态版本 B - 日常分享版**
3. **动态版本 C - 求助反馈版**

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/q-chinese-tech.md`

---

### SubAgent W: 小红书文案创作
**输出文件**: `docs/open-source-prep/marketing/content/w-xiaohongshu-content.md`

**创作内容**:
1. **图文版本 A - 效率工具推荐版**
2. **图文版本 B - 程序员必备版**
3. **图文版本 C - AI 工具分享版**
4. **标题候选** (每版本 3 个)
5. **标签组合** (每版本)
6. **封面图建议**
7. **图片文案** (卡片式内容)

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/m-xiaohongshu.md`

---

### SubAgent X: 少数派 + 掘金文案创作
**输出文件**: `docs/open-source-prep/marketing/content/x-sspai-juejin-content.md`

**创作内容**:

**少数派部分**:
1. **Matrix 投稿文章大纲**
2. **文章开头** (500字)
3. **核心卖点段落**
4. **使用场景段落**

**掘金部分**:
1. **技术文章大纲**
2. **沸点版本** (3 个)
3. **标签建议**

**必须阅读的研究文件**:
- `docs/open-source-prep/marketing/research/q-chinese-tech.md`

---

## 三、文案创作要求

### 3.1 产品信息（所有 SubAgent 必须使用）

**产品名称**: Ensemble

**一句话描述**:
- EN: The unified configuration manager for Claude Code - Skills, MCPs, and CLAUDE.md in one place.
- CN: Claude Code 三位一体配置管理器 - Skills、MCPs、CLAUDE.md 统一管理

**核心痛点**:
- EN: Every MCP/Skill installed in Claude Code consumes context in every session.
- CN: Claude Code 每安装一个 MCP/Skill 都会占用额外上下文。

**核心解决方案**:
- EN: Scene-based configuration management - enable tools per project/scenario.
- CN: 场景化配置管理 - 按项目/场景需求启用工具。

**关键特性**:
1. Skills Management (扫描、分类、标签、AI 分类)
2. MCP Servers Management (配置、工具发现)
3. CLAUDE.md Management (全局设置、项目分发)
4. Scenes (组合预设)
5. Projects (关联场景、一键同步)
6. Finder Integration (右键菜单)

**技术栈**: Tauri 2.0 + React + Rust

**平台**: macOS only

**许可证**: MIT (开源)

**GitHub URL**: [待填写]

### 3.2 风格要求

**夸张宣传版 (Bold)**:
- 使用强力动词和形容词
- 制造紧迫感和兴奋感
- 突出独特性和创新性
- 示例: "Finally!", "Game-changer", "终于有人解决了这个问题！"

**客观陈述版 (Objective)**:
- 以事实为基础
- 清晰说明功能和用途
- 适合技术社区
- 示例: "解决了...问题", "提供了...功能"

**谦虚克制版 (Humble)**:
- 低调展示
- 强调解决个人痛点
- 邀请反馈和建议
- 示例: "我做了一个小工具...", "希望对大家有用", "欢迎反馈"

---

## 四、输出文件目录结构

```
docs/open-source-prep/marketing/
├── content/                           # 文案目录
│   ├── s-twitter-content.md
│   ├── t-producthunt-content.md
│   ├── u-hackernews-content.md
│   ├── v-chinese-content.md
│   ├── w-xiaohongshu-content.md
│   └── x-sspai-juejin-content.md
```

---

## 五、SubAgent 执行要求

### 5.1 通用要求
1. **模型**: 必须使用 Opus 4.5
2. **输出**: 所有结果必须写入指定的 md 文件
3. **格式**: 文案应该可以直接复制使用

### 5.2 文件读取要求
每个 SubAgent 在开始任务前必须：
1. 阅读本规划文档（获取产品信息）
2. 阅读指定的研究文件

### 5.3 输出格式要求
每个文案文件必须包含：
1. 平台概述
2. 多个版本的完整文案
3. 配套元素（标签、配图建议等）
4. 使用建议

---

## 六、执行顺序

本轮所有 SubAgent 可以**并行执行**。
