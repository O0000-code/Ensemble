# 第一轮 SubAgent 执行规划 - 平台研究

## 文档信息
- **日期**: 2026-02-05
- **阶段**: Round 1 - Platform Research
- **目的**: 深入研究各目标平台的特点、用户群体和内容策略

---

## 一、本轮任务目标

通过多个 SubAgent 并行研究各目标平台，为文案创作提供充分的平台洞察。

---

## 二、SubAgent 任务分配

### SubAgent M: 小红书 (RedNote) 平台研究
**输出文件**: `docs/open-source-prep/marketing/research/m-xiaohongshu.md`

**研究内容**:
1. 平台用户画像和活跃特点
2. 开发者工具/效率工具类内容的表现
3. 成功的科技产品发布案例
4. 内容格式要求（图片尺寸、视频时长、文字限制）
5. 标签（话题）使用策略
6. 最佳发布时间
7. 平台调性和文案风格
8. 注意事项和避坑指南

**研究方法**: WebSearch 研究小红书运营策略、科技博主经验分享

---

### SubAgent N: X (Twitter) 平台研究
**输出文件**: `docs/open-source-prep/marketing/research/n-twitter.md`

**研究内容**:
1. 开发者社区在 X 的活跃情况
2. 开源项目发布的最佳实践
3. Thread 写作技巧
4. 标签使用策略 (#buildinpublic, #opensource 等)
5. 成功的开发者工具发布案例
6. 最佳发布时间（考虑时区）
7. 互动策略
8. 个人账号 vs 项目账号策略

**研究方法**: WebSearch 研究开发者 Twitter 运营、开源项目推广

---

### SubAgent O: Product Hunt 平台研究
**输出文件**: `docs/open-source-prep/marketing/research/o-producthunt.md`

**研究内容**:
1. Product Hunt 发布流程和规则
2. 发布前准备清单
3. 最佳发布时间（时区考虑）
4. 产品页面优化（标语、描述、截图）
5. 成功案例分析（开发者工具类）
6. Hunter 和 Maker 策略
7. 发布日互动策略
8. 后续跟进策略

**研究方法**: WebSearch 研究 Product Hunt 发布策略和经验分享

---

### SubAgent P: Hacker News 平台研究
**输出文件**: `docs/open-source-prep/marketing/research/p-hackernews.md`

**研究内容**:
1. Hacker News 社区文化和偏好
2. Show HN 发布规则和最佳实践
3. 标题写作技巧
4. 成功的 Show HN 案例分析
5. 评论区互动策略
6. 最佳发布时间
7. 避免被降权的注意事项
8. 与 Reddit 的区别

**研究方法**: WebSearch 研究 HN 发布策略

---

### SubAgent Q: 中文技术社区研究（V2EX、即刻、掘金、少数派）
**输出文件**: `docs/open-source-prep/marketing/research/q-chinese-tech.md`

**研究内容**:
1. **V2EX**: 发帖规则、节点选择、社区文化
2. **即刻**: 圈子选择、内容风格、互动特点
3. **掘金**: 文章发布、SEO 优化、沸点使用
4. **少数派**: 投稿流程、内容标准、Matrix 社区
5. 各平台的用户画像对比
6. 各平台的内容偏好
7. 各平台的最佳发布策略

**研究方法**: WebSearch 研究各平台运营经验

---

### SubAgent R: 开源项目宣传案例研究
**输出文件**: `docs/open-source-prep/marketing/research/r-case-studies.md`

**研究内容**:
1. 成功的开源项目发布案例（如 Cursor, Warp, Raycast）
2. 他们的多平台宣传策略
3. 首发渠道选择
4. 内容节奏和时间线
5. 病毒传播的关键因素
6. 失败案例和教训
7. 对 Ensemble 的启示

**研究方法**: WebSearch 研究开源项目推广案例

---

## 三、输出文件目录结构

```
docs/open-source-prep/marketing/
├── 00-task-understanding.md          # 任务理解
├── 01-round1-research-plan.md        # 本文档
├── research/                          # 研究结果目录
│   ├── m-xiaohongshu.md
│   ├── n-twitter.md
│   ├── o-producthunt.md
│   ├── p-hackernews.md
│   ├── q-chinese-tech.md
│   └── r-case-studies.md
```

---

## 四、SubAgent 执行要求

### 4.1 通用要求
1. **模型**: 必须使用 Opus 4.5
2. **输出**: 所有结果必须写入指定的 md 文件
3. **格式**: 使用清晰的 Markdown 格式
4. **深度**: 提供详细、可操作的信息

### 4.2 文件读取要求
每个 SubAgent 在开始任务前必须：
1. 首先阅读 `docs/open-source-prep/marketing/00-task-understanding.md`
2. 然后阅读本规划文档

### 4.3 研究要求
1. 使用 WebSearch 进行研究
2. 提供具体的数据和案例
3. 包含可操作的建议
4. 标注信息来源

### 4.4 输出格式要求
每个研究报告必须包含：
1. 平台概述
2. 用户画像
3. 内容策略
4. 具体建议
5. 注意事项
6. 参考来源

---

## 五、执行顺序

本轮所有 SubAgent 可以**并行执行**，因为它们之间没有依赖关系。

---

## 六、质量检查点

Main Agent 在收到研究结果后将检查：
1. 所有 6 个研究文件是否都已创建
2. 内容是否足够详细和可操作
3. 是否包含具体案例和数据
4. 是否可以进入文案创作阶段
