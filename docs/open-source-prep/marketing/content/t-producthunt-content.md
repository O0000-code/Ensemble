# Product Hunt 产品页面文案 - Ensemble

## 文档信息
- **日期**: 2026-02-05
- **创作者**: SubAgent T
- **产品**: Ensemble - Claude Code Configuration Manager
- **平台**: Product Hunt

---

## 一、Tagline 候选 (5 个选项)

所有 Tagline 均在 60 字符以内，遵循 [动作] + [目标] + [独特卖点] 公式。

### 选项 1 (推荐)
```
Manage Claude Code configs without context bloat
```
**字符数**: 49
**分析**: 直接点明核心价值 - 解决上下文占用问题

### 选项 2
```
Scene-based config manager for Claude Code
```
**字符数**: 43
**分析**: 突出"场景化"这个独特概念

### 选项 3
```
One app for all your Claude Code configurations
```
**字符数**: 46
**分析**: 强调统一管理，简洁有力

### 选项 4
```
Control your Claude Code context. Finally.
```
**字符数**: 42
**分析**: 情感诉求，"Finally" 暗示长期痛点终于解决

### 选项 5
```
Skills, MCPs, CLAUDE.md - organized at last
```
**字符数**: 43
**分析**: 列举具体功能，吸引了解 Claude Code 的用户

---

## 二、产品描述

### 2.1 短版描述 (140 字符以内)

```
Stop wasting context on unused configs. Ensemble manages your Claude Code Skills, MCPs, and CLAUDE.md with scene-based organization.
```
**字符数**: 133

**备选短版**:
```
Every MCP eats your context. Ensemble lets you organize Claude Code configs by project and enable only what you need.
```
**字符数**: 119

---

### 2.2 长版描述

```markdown
**The Problem**

Every MCP server and Skill you install in Claude Code consumes your precious context window - even when you don't need them. Managing configurations across different projects means manual JSON editing and constant context overhead.

**The Solution**

Ensemble gives you scene-based configuration management for Claude Code. Create preconfigured "Scenes" for different workflows - a web dev scene, a data science scene, a writing scene - and switch between them with one click.

**What You Can Do**

- **Skills Management** - Scan, organize, and tag your Claude Code skills. AI-powered auto-classification keeps things tidy.
- **MCP Servers Management** - Configure servers and discover available tools without touching JSON.
- **CLAUDE.md Management** - Edit your global settings and distribute them across projects.
- **Scenes** - Create configuration presets for different workflows.
- **Projects** - Associate scenes with specific codebases and sync settings instantly.
- **Finder Integration** - Right-click any project folder to apply a scene.

**Built For Claude Code Power Users**

If you've installed more than 5 MCPs and find yourself wishing you could just... turn some off without uninstalling them - Ensemble is for you.

**Free & Open Source**

MIT licensed. Built with Tauri 2.0 + React + Rust for a true native macOS experience.
```

---

## 三、Maker 首评 (First Comment)

这是发布后立即发表的第一条评论，包含背景故事和技术亮点。

```markdown
Hey Product Hunt!

I'm the maker of Ensemble, and I'm excited to share this with you today.

**The Backstory**

I've been using Claude Code heavily for the past months. It's an incredible tool - but there's one thing that kept bothering me.

Every MCP server and Skill I installed meant more context consumed in every single session. Web search MCP? That's context. Database MCP? More context. The filesystem Skill? You guessed it.

I had 12+ configurations installed, and Claude was spending tokens just loading them all - even when I was doing a simple text editing task that needed none of them.

**The "Aha" Moment**

I realized what I needed wasn't fewer tools - I needed *organized* tools. Like how you don't bring every tool from your garage when you're just tightening a loose screw.

That's when I started building Ensemble - a way to create "Scenes" (preconfigured setups) and switch between them based on what I'm actually working on.

**What Makes It Different**

- **Scene-based approach**: Create a "Web Dev" scene with relevant MCPs, a "Writing" scene with minimal tools, a "Data" scene with database connections.
- **Native macOS app**: Built with Tauri 2.0 + Rust, not Electron. Fast, lightweight, feels right at home.
- **Finder integration**: Right-click any project folder to apply a scene instantly.
- **AI-powered organization**: Auto-classify your Skills into meaningful categories.

**Pricing**

Free. Forever. MIT licensed. I built this to scratch my own itch, and I hope it helps others too.

**My Ask**

I'd genuinely love your feedback:
- What features would make this more useful for your workflow?
- Are there other Claude Code pain points I should tackle?

Drop a comment or reach out on GitHub. Every piece of feedback helps!

Thanks for checking out Ensemble!
```

---

## 四、Gallery 图片说明 (5 张图)

按照推荐的截图顺序组织，每张图包含标题和描述。

### 图 1: Hero Shot
**标题**: `Your Claude Code Command Center`
**描述**:
```
The main dashboard showing Skills, MCP Servers, and CLAUDE.md management at a glance. Everything you need to control your Claude Code configuration in one native macOS app.
```
**拍摄建议**: 展示应用主界面，侧边栏显示三大功能区，主内容区展示概览信息

---

### 图 2: Skills Management
**标题**: `Organize Skills Your Way`
**描述**:
```
Scan and manage all your Claude Code skills. Tag them, categorize them, and let AI auto-classify them into meaningful groups. Toggle individual skills on or off per scene.
```
**拍摄建议**: 展示 Skills 列表视图，显示多个 Skills 带有标签和分类

---

### 图 3: Scenes
**标题**: `One Click to Switch Context`
**描述**:
```
Create Scenes for different workflows. A "Web Dev" scene might include GitHub MCP and web tools. A "Writing" scene might have minimal configs. Switch between them instantly.
```
**拍摄建议**: 展示 Scenes 创建/编辑界面，显示一个场景包含的 Skills/MCPs 选择

---

### 图 4: MCP Servers Configuration
**标题**: `MCP Servers Made Simple`
**描述**:
```
Configure MCP servers visually. Discover available tools, manage settings, and stop editing JSON files manually. See exactly what each server provides.
```
**拍摄建议**: 展示 MCP Servers 配置界面，显示服务器列表和工具发现功能

---

### 图 5: Projects & Finder Integration
**标题**: `Right-Click. Apply Scene. Done.`
**描述**:
```
Associate scenes with specific projects. Use Finder integration to apply configurations with a right-click - no need to open Ensemble at all for daily workflows.
```
**拍摄建议**: 展示 macOS Finder 右键菜单中的 Ensemble 选项，或 Projects 列表与关联的 Scenes

---

## 五、Topics 标签建议

Product Hunt 允许选择多个 Topics 来分类产品。以下是推荐的标签组合：

### 主要标签 (必选)
1. **Developer Tools** - 核心分类
2. **Productivity** - 提升效率
3. **macOS** - 平台定位

### 次要标签 (推荐)
4. **Open Source** - 开源项目
5. **Artificial Intelligence** - AI 相关工具
6. **Tech** - 通用科技

### 备选标签
7. **Software Engineering** - 软件开发
8. **Utilities** - 实用工具

**推荐组合**: `Developer Tools` + `Productivity` + `macOS` + `Open Source`

---

## 六、预设 Q&A (5 个常见问题)

准备好这些 Q&A 可以快速响应评论中的常见问题。

### Q1: Does this work on Windows/Linux?

**A**:
```
Currently Ensemble is macOS only. Claude Code itself is cross-platform, so I understand the demand! Windows support is something I'm considering for the future based on community interest. If you'd like to see it, please drop a comment or create an issue on GitHub - it helps me prioritize!
```

---

### Q2: How does scene-switching actually work? Does it restart Claude Code?

**A**:
```
Great question! When you switch scenes, Ensemble updates the configuration files that Claude Code reads. Depending on the change:
- For CLAUDE.md changes: Takes effect on the next conversation
- For MCP/Skills changes: May require restarting Claude Code to fully apply

The Finder integration makes this seamless - right-click your project folder, select a scene, and you're ready to go when you start Claude Code.
```

---

### Q3: Is my data safe? Does this connect to any servers?

**A**:
```
Ensemble is fully local and offline. Your configurations never leave your machine - it just reads and writes to the same config files that Claude Code uses. The AI classification feature (if you choose to use it) sends only skill names/descriptions to classify them, never any actual code or personal data. And being open source, you can verify this yourself!
```

---

### Q4: What's the difference between this and just manually editing the config files?

**A**:
```
You can absolutely keep editing JSON files manually - I did that for months! Ensemble adds value in a few ways:

1. **Visual organization**: See all your skills/MCPs at a glance instead of scrolling through JSON
2. **Scene presets**: Switching between 3 different JSON configurations manually gets old fast
3. **No typo risks**: GUI prevents syntax errors that break configs
4. **AI categorization**: Auto-organize your growing collection of tools
5. **Finder integration**: Right-click convenience for project-specific configs

Think of it like the difference between editing .git files manually vs using a Git GUI. Both work, one is just more pleasant for certain workflows.
```

---

### Q5: Why Tauri instead of Electron?

**A**:
```
Performance and native feel! Tauri apps use the system's native webview instead of bundling Chromium, so:
- ~10x smaller app size (Ensemble is under 10MB vs 100MB+ for typical Electron apps)
- Lower memory footprint
- Native macOS look and feel
- Rust backend for configuration file operations means reliability and speed

As a developer tool, I wanted Ensemble to be something that's genuinely pleasant to have running - not another resource hog.
```

---

## 七、感谢投票的回复模板 (3 个版本)

用于回复评论和支持者。每个版本略有不同，避免看起来像复制粘贴。

### 版本 A - 简洁感谢 + 邀请反馈
```
Thank you so much for the support! If you end up trying Ensemble, I'd love to hear what works (and what doesn't) for your workflow. Your feedback directly shapes what I build next!
```

### 版本 B - 表达热情 + 介绍特性
```
Really appreciate you checking out Ensemble! The scene-based approach has been a game-changer for my own Claude Code workflow - hope it does the same for you. Let me know if you have any questions!
```

### 版本 C - 个人化 + 开源强调
```
Thanks for the upvote! Building this has been a labor of love. Since it's open source, if you ever want to contribute or suggest features, the GitHub repo is always open. Appreciate you being part of this journey!
```

---

## 八、使用建议

### 8.1 发布前检查清单

- [ ] Tagline 选择确定（推荐选项 1 或 4）
- [ ] 产品描述已校对
- [ ] 5 张截图准备完成并按顺序排列
- [ ] 首评文案根据实际情况调整
- [ ] Q&A 根据最新功能更新
- [ ] GitHub 链接已添加到产品页面

### 8.2 发布日行动

1. **发布后 1 分钟**: 立即发表首评
2. **发布后 5 分钟**: 在 X/Twitter 发布通知
3. **全天**: 使用 Q&A 模板快速回复问题
4. **全天**: 用感谢模板（轮换使用三个版本）回复支持者

### 8.3 文案调整建议

- 如果目标用户不熟悉 Claude Code，在描述中增加简短解释
- 如果发布日有其他 Claude/Anthropic 相关产品，调整 Tagline 以增加差异化
- 根据早期评论反馈，准备更多针对性的 Q&A

---

## 附录：关键词和短语参考

在回复评论时可以灵活使用的关键表达：

### 描述痛点
- "context bloat"
- "config overhead"
- "JSON fatigue"
- "tool sprawl"

### 描述解决方案
- "scene-based management"
- "organized workflows"
- "one-click switching"
- "native experience"

### 强调价值
- "lean context"
- "right tools for the job"
- "no more manual editing"
- "truly native"

---

*文档结束 - SubAgent T*
