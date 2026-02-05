# Hacker News 平台研究报告

## 文档信息
- **日期**: 2026-02-05
- **研究者**: SubAgent P
- **目的**: 为 Ensemble 开源发布制定 Hacker News Show HN 发布策略

---

## 一、平台概述

### 1.1 什么是 Hacker News

Hacker News (HN) 是 Y Combinator 运营的技术社区和新闻聚合网站，专注于计算机科学、创业和技术话题。

**核心特点**:
- 极简设计，功能纯粹
- 高质量技术讨论
- 严格的社区规范
- 无算法推荐，靠投票排名
- Y Combinator 创业者的聚集地

### 1.2 平台影响力

- 累计孵化出 Stripe、Dropbox、Airbnb 等价值超过 4000 亿美元的公司
- 众多成功创业者将早期用户和关键反馈归功于 HN
- 被称为"硅谷精英仍在使用的'丑陋'网站"
- 1000+ YC 校友仍活跃在社区

### 1.3 Show HN 是什么

Show HN 是专门用于展示个人项目和产品的栏目：
- 必须是**可以实际使用或体验**的东西
- 可以是网站、应用、开源项目、硬件等
- **不接受**：博客文章、注册页面、新闻通讯、阅读材料
- Show HN 帖子会出现在专门的 Show 页面，即使没上首页也有曝光机会

---

## 二、社区文化和偏好

### 2.1 核心价值观

**"满足智识好奇心"** 是 HN 的定义内容标准。

HN 用户的典型特征：
- **Maker 心态**: 喜欢动手创造的人
- **好奇心驱动**: 对技术细节有浓厚兴趣
- **反营销**: 对任何营销语言高度敏感
- **直言不讳**: 反馈直接，不留情面
- **技术深度**: 偏好有深度的技术内容

### 2.2 什么内容受欢迎

根据数据分析，HN 最受欢迎的内容类型：

| 内容类型 | 受欢迎程度 | 说明 |
|---------|-----------|------|
| 开源软件 | 极高 | 尽管讨论量适中，但投票最多 |
| 编程技术 | 高 | 技术深度受重视 |
| 创业故事 | 高 | 真实的创业经历 |
| 工具/产品 | 中高 | 必须能实际试用 |
| 科学类 | 较低 | HN 最不感兴趣的前页话题 |

### 2.3 什么会引起反感

- **营销语言**: "革命性"、"颠覆性"、"最佳"等词汇
- **夸大宣传**: 任何形式的过度吹捧
- **假装中立**: 伪装成第三方推广自己的产品
- **缺乏透明度**: 隐藏与项目的关联关系
- **低质量内容**: 仅有注册页面，无法实际体验

---

## 三、Show HN 发布规则

### 3.1 官方规则

1. **标题格式**: 必须以 "Show HN: " 开头
2. **内容要求**: 必须是可以实际运行或体验的东西
3. **禁止内容**: 纯博客、注册页、新闻通讯
4. **正文说明**: 可以在正文框写 1-200 字的产品介绍

### 3.2 Show HN 优势

- 帖子会同时出现在 Show 页面
- 即使没上首页，也能获得曝光
- 有机会通过 Show 页面后续上首页
- 社区对 Show HN 内容相对宽容

### 3.3 发布最佳实践

**官方建议**:
- 使用事实性、直接的语言
- 分享个人故事和技术细节
- 第一人称写作（"我一直在做..."）
- 说明用例，如 "极简主义的桌游计分工具"

**技术要求**:
- 提供免费试用方式
- 减少所有使用障碍
- 对于技术产品，GitHub repo 可作为落地页
- README 和文档的质量至关重要

---

## 四、标题写作技巧

### 4.1 标题格式

```
Show HN: [产品名] – [简洁的用例描述]
```

**好的例子**:
- "Show HN: Raycast – CLI-inspired desktop app for non-coding tasks"
- "Show HN: Gauntlet – Raycast-inspired open-source application launcher"
- "Show HN: Vicinae – A native, Raycast-compatible launcher for Linux"

### 4.2 标题原则

| 原则 | 说明 |
|------|------|
| 简洁明了 | 6-8 个单词为最佳 |
| 说明用例 | 清楚表达产品做什么 |
| 使用主动语态 | 必须包含动词 |
| 避免超级词汇 | 不用 "fastest"、"best"、"first" |
| 控制长度 | 60 字符以内 |

### 4.3 避免的标题写法

- 不要使用营销语言
- 不要过度承诺
- 不要使用点击诱饵
- 不要堆砌关键词
- 不要使用感叹号

### 4.4 Ensemble 标题建议

**推荐方案**:
```
Show HN: Ensemble – A macOS app to manage Claude Code Skills and MCP Servers
```

**备选方案**:
```
Show HN: Ensemble – Scene-based configuration manager for Claude Code
Show HN: Ensemble – Manage your Claude Code context with Scenes
```

---

## 五、最佳发布时间

### 5.1 时区考量

HN 用户主要集中在美国，尤其是：
- **旧金山/西雅图** (太平洋时区 PT)
- **纽约** (东部时区 ET)

### 5.2 具体时间建议

| 策略 | 时间 (太平洋时间 PT) | 特点 |
|------|---------------------|------|
| 高曝光策略 | 周一-周五 8:00-10:00 AM | 竞争激烈，但用户最活跃 |
| 低竞争策略 | 周六/周日 7:00-10:00 AM | 上首页概率高 2.5 倍 |
| 折中策略 | 周一/周三 5:00-6:00 PM | 平衡曝光与竞争 |
| 深夜策略 | 周一-周五 0:00-3:00 AM | 低竞争，但曝光有限 |

### 5.3 对中国时区的建议

太平洋时间与北京时间的换算（冬令时）:
- PT 8:00 AM = 北京时间次日 0:00 (午夜)
- PT 10:00 AM = 北京时间次日 2:00 AM

**实际操作建议**:
- 周六/周日 PT 早晨发布 = 北京时间周日/周一凌晨
- 可以提前准备好内容，设定闹钟发布
- 或选择工作日 PT 晚上发布 = 北京时间上午

### 5.4 时间与效果的权衡

| 时间段 | 上首页概率 | 首页曝光量 |
|--------|-----------|-----------|
| 周日早晨 | 最高 (2.5x) | 较低 |
| 工作日早晨 | 中等 | 最高 |
| 工作日深夜 | 较高 | 较低 |

---

## 六、评论区互动策略

### 6.1 第一条评论的重要性

发布后**立即**在评论区发表第一条评论，包含：

1. **个人背景**: 你是谁，为什么做这个项目
2. **问题故事**: 遇到了什么问题
3. **解决方案**: 如何解决的
4. **技术亮点**: 有趣的技术细节
5. **邀请反馈**: 希望得到什么样的反馈

**示例结构**:
```
Hi HN, I'm [name]. I built Ensemble because [personal pain point].

As a Claude Code user, I found myself [describe the problem].
So I built [solution].

Technical notes:
- Built with [tech stack]
- [Interesting technical detail]

I'd love feedback on [specific area]. Happy to answer any questions!
```

### 6.2 回应批评的原则

HN 用户以直言不讳著称，面对批评时：

| 做法 | 说明 |
|------|------|
| 先找共识 | 承认批评中合理的部分 |
| 用数据说话 | 提供具体数据或推理，而非情绪反应 |
| 保持学习心态 | 把批评当作学习机会 |
| 感谢反馈 | 对建设性意见表示感谢 |
| 不要防御 | 避免defensive的回应 |

### 6.3 互动技巧

**应该做的**:
- 分享代码片段、基准测试、架构图
- 快速回应问题
- 提供额外的技术背景
- 邀请深入交流（如 email 或 Discord）

**不应该做的**:
- 让朋友来发"捧场"评论（会被视为spam）
- 使用公司/项目名作为用户名
- 复制粘贴相同的回复
- 忽略技术性问题

### 6.4 评论对排名的影响

- **评论是比投票更强的排名信号**
- 高质量的讨论有助于保持排名
- 但要注意：**评论数超过投票数**会触发惩罚机制

---

## 七、成功案例分析

### 7.1 Raycast 的 Launch HN

**标题**: "Launch HN: Raycast (YC W20) – CLI-inspired desktop app for non-coding tasks"

**成功因素**:
- 清晰的定位：CLI 风格的桌面应用
- 明确的用例：非编码任务
- YC 背景加分
- 即时可用的产品

### 7.2 开源 Launcher 项目

**Gauntlet**: "Show HN: Gauntlet – Raycast-inspired open-source application launcher"
- 明确标注"开源"
- 说明灵感来源
- Plugin-first 的技术特点

**Vicinae**: "Show HN: Vicinae – A native, Raycast-compatible launcher for Linux"
- 强调"原生"和"兼容性"
- 针对特定平台（Linux）
- 填补市场空白

### 7.3 成功模式总结

| 因素 | 说明 |
|------|------|
| 解决真实问题 | 来自个人真实痛点 |
| 技术有深度 | 有值得讨论的技术细节 |
| 开源/免费 | 降低尝试门槛 |
| 即时可用 | 不是"即将推出" |
| 填补空白 | 解决现有工具的不足 |

---

## 八、避免被降权的注意事项

### 8.1 排名算法基础

HN 的排名公式：
```
Score = (P-1) / (T+2)^1.8
```
- P = 点数（减去提交者自己的票）
- T = 发布后的小时数
- 1.8 是时间衰减指数

### 8.2 惩罚机制

**自动惩罚触发条件**:

| 情况 | 惩罚 |
|------|------|
| 评论数 > 投票数 | "争议帖"惩罚，可能用 (votes/comments)^2 或 ^3 降权 |
| 被多人 flag | 可能被自动隐藏 |
| 过于热门的讨论 | "过热讨论"降权 |

**典型案例**: 一个 40+ 评论但投票很少的帖子，可能在 1 小时内从 #1 掉到不可见。

### 8.3 Shadowban 风险

**可能触发 shadowban 的行为**:
- 频繁发布自己网站的链接
- 账户新且立即发推广内容
- 被多人举报
- 使用多个账户互相投票
- 评论包含 spam 特征

**如何检测**: 用未登录的浏览器查看你的帖子/评论是否可见

**如何解除**: 发邮件到 hn@ycombinator.com

### 8.4 避免惩罚的策略

1. **建立账户历史**: 发布前先正常使用一段时间
2. **不要拉票**: 不要让朋友专门来投票或评论
3. **避免争议话题**: 不要引发政治或敏感讨论
4. **保持透明**: 明确说明你是项目作者
5. **控制评论热度**: 避免评论数远超投票数

---

## 九、HN 用户对开发者工具的期望

### 9.1 用户画像

| 特征 | 说明 |
|------|------|
| 身份 | 开发者、创业者、技术管理者 |
| 地区 | 主要是美国，尤其是硅谷和纽约 |
| 偏好 | 命令行友好、开源、高性能 |
| 价值观 | 技术深度、创新、实用性 |

### 9.2 对开发者工具的期望

**功能层面**:
- 解决真实的开发痛点
- 能立即试用（最好免费）
- 有清晰的 README 和文档
- 代码质量高

**技术层面**:
- 性能优秀
- 架构清晰
- 安全可靠
- 依赖合理

**体验层面**:
- 安装简单
- 上手容易
- 配置灵活
- 有良好的错误提示

### 9.3 什么样的开发者工具在 HN 受欢迎

根据历史数据和社区讨论：

1. **解决共同痛点的工具** - 越多人有同样问题越好
2. **有技术创新的工具** - 新的方法或架构
3. **开源工具** - 可以查看和贡献代码
4. **CLI/终端工具** - HN 用户偏爱命令行
5. **macOS 原生工具** - 很多用户使用 Mac 开发

---

## 十、针对 Ensemble 的建议

### 10.1 定位策略

**推荐角度**:
- 强调解决 Claude Code 用户的真实痛点（上下文占用问题）
- 突出 "Scenes" 场景化配置的独特性
- 开源优势
- macOS 原生应用

### 10.2 标题建议

**主推标题**:
```
Show HN: Ensemble – Manage Claude Code Skills, MCPs, and CLAUDE.md in one place
```

**备选**:
```
Show HN: Ensemble – Scene-based config manager for Claude Code (macOS)
Show HN: Ensemble – Stop cluttering your Claude Code context with unused tools
```

### 10.3 第一条评论模板

```
Hi HN, I built Ensemble because I was frustrated with how Claude Code handles
MCP servers and Skills.

Every MCP/Skill you enable occupies context space, even when you don't need it.
I found myself constantly enabling/disabling tools depending on what project
I was working on.

Ensemble solves this with "Scenes" – predefined configurations you can switch
between instantly:
- "Web Dev" scene with relevant MCPs
- "Data Analysis" scene with different tools
- Per-project CLAUDE.md management

Tech stack: SwiftUI, native macOS app.

The app is open source: [GitHub link]

I'd love to hear:
- How do you currently manage your Claude Code config?
- What features would make this more useful for you?

Happy to answer any questions!
```

### 10.4 发布时间建议

**首选**: 周六或周日 PT 8:00-10:00 AM（北京时间周日/周一 0:00-2:00 AM）
- 竞争较少，上首页概率高
- 周末 HN 用户更有时间尝试新工具

**备选**: 周二或周三 PT 8:00-10:00 AM
- 工作日用户活跃度最高
- 适合追求最大曝光量

### 10.5 发布前准备清单

| 项目 | 状态 |
|------|------|
| GitHub 仓库公开且 README 完善 | [ ] |
| 应用可直接下载或通过 Homebrew 安装 | [ ] |
| 有清晰的截图或 GIF 演示 | [ ] |
| 准备好第一条评论的内容 | [ ] |
| 账户有一定的历史活动 | [ ] |
| 了解常见问题的回答 | [ ] |

### 10.6 互动准备

**预期问题与回答准备**:
1. "为什么不直接用配置文件？" → 解释 GUI 的便利性
2. "和 X 工具有什么区别？" → 准备对比说明
3. "为什么只支持 macOS？" → 解释 SwiftUI 选择
4. "会不会影响性能？" → 提供技术说明

---

## 参考来源

### 官方资源
- [Show HN Guidelines](https://news.ycombinator.com/showhn.html)
- [Hacker News Guidelines](https://news.ycombinator.com/newsguidelines.html)
- [Hacker News FAQ](https://news.ycombinator.com/newsfaq.html)

### 策略指南
- [How to launch a dev tool on Hacker News](https://www.markepear.dev/blog/dev-tool-hacker-news-launch)
- [How to do a successful Hacker News launch](https://lucasfcosta.com/2023/08/21/hn-launch.html)
- [A Writer's Guide to Hacker News](https://pithandpip.com/blog/hacker-news)
- [How to post on Hacker News](https://wiredcraft.com/blog/how-to-post-on-hacker-news/)

### 技术分析
- [How Hacker News ranking algorithm works](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d)
- [How Hacker News ranking really works](http://www.righto.com/2013/11/how-hacker-news-ranking-really-works.html)
- [hacker-news-undocumented](https://github.com/minimaxir/hacker-news-undocumented)

### 发布时间研究
- [Best time to post to Hacker News](https://simonhartcher.com/posts/2025-09-10-best-times-to-post-on-hacker-news-according-to-claude/)
- [The Best Time to Submit To Hacker News](https://chanind.github.io/2019/05/07/best-time-to-submit-to-hacker-news.html)
- [The Best Time to Post on Hacker News](https://blog.rmotr.com/the-best-time-to-post-on-hacker-news-2935118cb3d6)

### 社区文化
- [The Hidden Power of Hacker News](https://digitalmirai.medium.com/the-hidden-power-of-hacker-news-why-silicon-valleys-elite-still-use-this-ugly-website-e5e6be6034c8)
- [The Evolution Of Hacker News](https://techcrunch.com/2013/05/18/the-evolution-of-hacker-news/)
- [Which topics get the upvote on Hacker News](https://blog.datadive.net/which-topics-get-the-upvote-on-hacker-news/)

### 案例参考
- [Launch HN: Raycast](https://news.ycombinator.com/item?id=22466994)
- [Show HN: Gauntlet](https://news.ycombinator.com/item?id=40250462)
- [Show HN: Vicinae](https://news.ycombinator.com/item?id=45188116)

---

## 附录：快速参考卡

### Show HN 发布检查清单

```
发布前:
□ 产品可以实际使用
□ GitHub README 完善
□ 准备好第一条评论
□ 选好发布时间
□ 账户有活动历史

标题格式:
Show HN: [产品名] – [简洁用例描述]

第一条评论包含:
□ 自我介绍
□ 问题背景
□ 解决方案
□ 技术亮点
□ 反馈邀请

发布后:
□ 快速回应评论
□ 用数据回应批评
□ 感谢建设性反馈
□ 不要拉朋友来投票
```
