# macOS 截图工具研究报告

## 文档信息
- **日期**: 2026-02-05
- **作者**: SubAgent D
- **目的**: 为 Ensemble 开源发布选择最佳截图工具，并提供截图最佳实践指南

---

## 执行摘要

本报告对 macOS 上五款主流截图工具进行了全面评估，包括 CleanShot X、Shottr、Xnapper、Snagit 以及 macOS 系统自带截图工具。经过深入研究，**Xnapper** 被推荐为应用截图展示的最佳选择，原因是其专注于截图美化、自动背景处理、设备边框支持以及极具竞争力的价格。

对于预算有限或需要轻量级解决方案的用户，**Shottr** 是极佳的免费替代品。如果需要全面的截图和录屏功能，**CleanShot X** 是行业标杆。

---

## 工具对比表格

| 功能/工具 | CleanShot X | Xnapper | Shottr | Snagit | macOS 原生 |
|-----------|-------------|---------|--------|--------|------------|
| **价格** | $29 (一次性) | $29.99 (一次性) | $12 / 免费试用 | ~$62.99 (一次性) | 免费 |
| **订阅选项** | Setapp $9.99/月 | 团队版 $5/设备/月 | 无 | 有 | 无 |
| **窗口截图** | 是 | 是 | 是 | 是 | 是 |
| **自动美化背景** | 是 (10+预设) | 是 (核心功能) | 否 | 有限 | 否 |
| **自动阴影效果** | 是 | 是 (自动) | 否 | 是 | 是 (可关闭) |
| **设备边框** | 有限 | 是 (强项) | 否 | 是 | 否 |
| **滚动截图** | 是 | 是 | 是 | 是 | 否 |
| **OCR 文字识别** | 是 | 是 | 是 | 是 | 否 |
| **标注工具** | 全面 | 基础 | 丰富 | 全面 | 否 |
| **屏幕录制** | 是 | 是 | 否 | 是 | 是 |
| **GIF 录制** | 是 | 否 | 否 | 是 | 否 |
| **云存储** | 1GB 起 | 无 | 无 | 有 | 无 |
| **社交媒体预设** | 否 | 是 (核心功能) | 否 | 否 | 否 |
| **敏感信息保护** | 手动 | 自动检测 | 手动 | 手动 | 否 |
| **Apple Silicon 优化** | 是 | 是 | 是 | 是 | 是 |
| **中文支持** | 是 | 是 | 是 | 是 | 是 |

---

## 各工具详细评测

### 1. CleanShot X

**官网**: https://cleanshot.com

**概述**: CleanShot X 是 macOS 上功能最全面的截图和录屏工具，被广泛认为是行业标杆。它提供了从基础截图到高级标注、云分享的一站式解决方案。

**核心功能**:
- 多种截图模式：全屏、窗口、区域、滚动截图
- 强大的标注工具：箭头、形状、文字、高亮、模糊
- 屏幕录制：支持摄像头叠加、音频录制、GIF 导出
- 智能功能：自动隐藏桌面图标、OCR 文字识别
- 10+ 内置背景设计，支持自定义背景上传
- CleanShot Cloud 一键分享

**价格**:
- 一次性购买：$29 (含 1 年更新 + 1GB 云存储)
- 年度续费：$19
- Setapp 订阅：$9.99/月 (含 260+ 其他应用)

**优点**:
- 功能最全面，几乎涵盖所有截图需求
- 界面设计精美，用户体验出色
- 活跃的开发团队，持续更新
- 4.9 星评分 (10,845+ 评价)

**缺点**:
- 设备边框功能不如 Xnapper 专业
- 需要额外付费才能获得持续更新
- 对于只需要简单美化的用户来说功能过多

**适合人群**: 需要全功能截图和录屏解决方案的专业用户

---

### 2. Xnapper

**官网**: https://xnapper.com

**概述**: Xnapper 专注于将截图快速转换为美观的营销素材。它的核心价值在于自动美化功能，能够一键添加背景、阴影、圆角和设备边框。

**核心功能**:
- **自动美化**：自动平衡、背景、圆角、阴影
- **设备边框**：支持多种设备模型展示
- **社交媒体预设**：针对各平台的尺寸比例
- **敏感信息保护**：自动检测并隐藏邮箱等敏感信息
- **OCR 文字识别**：基于 macOS Vision 引擎
- 基础标注工具：箭头、形状、文字、模糊

**价格**:
| 版本 | 价格 | 设备数 | 说明 |
|------|------|--------|------|
| Basic | $29.99 | 1 | 无水印，含 1 年更新 |
| Personal | $54.99 | 2 | 最受欢迎 |
| Standard | $79.99 | 3 | 最佳性价比 |
| Team | $5/设备/月 | 无限 | 年付享 20% 折扣 |

- 免费版可用，但带水印
- 1 年后可 40% 折扣续费
- 学生优惠可用
- 30 天无理由退款

**优点**:
- 专为截图美化设计，一键生成专业效果
- 设备边框功能强大，适合应用展示
- 社交媒体尺寸预设非常实用
- 自动敏感信息检测独特且实用
- 价格合理，一次性付费

**缺点**:
- 标注功能相对基础
- 无屏幕录制功能
- 无云存储分享功能

**适合人群**: 需要快速制作应用展示截图的开发者和营销人员

---

### 3. Shottr

**官网**: https://shottr.cc

**概述**: Shottr 是一款轻量级但功能丰富的截图工具，专为"关注像素的设计师和开发者"打造。它以极低的价格提供了专业级功能。

**核心功能**:
- 快速截图：区域、窗口、滚动截图
- **像素测量**：直接在屏幕上测量距离
- **颜色取色器**：获取 HEX/RGB 颜色代码
- OCR 文字识别 + QR 码识别
- 丰富的标注工具：文字、形状、高亮、模糊
- 图片叠加、前后对比 GIF

**价格**:
| 版本 | 价格 | 说明 |
|------|------|------|
| Free | $0 | 30 天后提示升级 |
| Basic | $12 | 完整功能解锁 |
| Friends Club | $30 | 实验性功能 + 优先支持 |

- 一个许可证支持 5 台电脑
- 商业使用需要付费许可证

**优点**:
- 极高的性价比 (仅 $12)
- 像素测量和颜色取色功能独特
- 轻量快速，针对 Apple Silicon 优化
- 免费版功能已经很丰富
- 无广告、无账号要求

**缺点**:
- 无自动背景美化功能
- 无设备边框支持
- 无屏幕录制功能
- 界面相对简朴

**适合人群**: 设计师、开发者，需要精确测量和取色功能的用户

---

### 4. Snagit

**官网**: https://www.techsmith.com/snagit.html

**概述**: Snagit 是 TechSmith 出品的老牌截图工具，以其强大的编辑功能和模板系统著称，特别适合制作教程和技术文档。

**核心功能**:
- 全面的截图模式：全屏、窗口、区域、滚动、全景
- 强大的编辑器：21+ 内置模板
- 标注工具：箭头、形状、文字、步骤编号、Callout
- 屏幕录制：支持摄像头叠加
- 云集成：Google Drive、Slack、Microsoft Teams
- AI 辅助功能 (2025 版)

**价格**:
- 一次性购买：约 $62.99 (Windows/Mac)
- 订阅计划可选
- 教育/政府/非营利折扣
- 15 天免费试用

**优点**:
- 功能成熟稳定，行业口碑好
- 模板系统适合批量制作
- 跨平台支持 (Windows + Mac)
- 企业级功能和支持

**缺点**:
- 价格较高
- 界面相对传统
- 自动美化功能不如新工具
- 设备边框功能有限

**适合人群**: 企业用户、技术文档作者、需要跨平台支持的团队

---

### 5. macOS 系统自带截图工具

**快捷键**: Command + Shift + 5

**概述**: macOS 自带的截图工具提供了基础但实用的功能，对于简单需求完全够用。

**核心功能**:
- 截图模式：全屏、窗口、选区
- 屏幕录制：全屏、选区
- 定时器：5 秒、10 秒延迟
- 自动阴影效果 (窗口截图)
- 浮动缩略图预览
- 自定义保存位置

**快捷键**:
| 操作 | 快捷键 |
|------|--------|
| 截图工具栏 | Cmd + Shift + 5 |
| 全屏截图 | Cmd + Shift + 3 |
| 选区截图 | Cmd + Shift + 4 |
| 窗口截图 | Cmd + Shift + 4 + Space |
| 复制到剪贴板 | 加 Control 键 |
| 无阴影窗口截图 | 截图时按住 Option |

**禁用阴影** (终端命令):
```bash
defaults write com.apple.screencapture disable-shadow true
killall SystemUIServer
```

**优点**:
- 完全免费
- 无需安装
- 系统级集成，启动快速
- 基础功能足够日常使用

**缺点**:
- 无标注功能
- 无滚动截图
- 无自动美化
- 无设备边框
- 无 OCR

**适合人群**: 只需基础截图功能的普通用户

---

## 最终推荐

### 首选推荐: Xnapper ($29.99)

**推荐理由**:

1. **专为应用展示设计**: Xnapper 的核心功能就是将截图快速转换为美观的营销素材，这完美契合 Ensemble 开源发布的需求。

2. **一键美化**: 自动添加背景、阴影、圆角，无需手动调整，大幅提高效率。

3. **设备边框支持**: 可以将 App 截图放入 MacBook/iPhone 等设备模型中，提升专业感。

4. **社交媒体预设**: 内置各平台的尺寸预设，方便在 Twitter、GitHub、Product Hunt 等平台分享。

5. **价格合理**: $29.99 一次性付费，无订阅负担。

6. **自动敏感信息保护**: 在展示应用时自动隐藏邮箱等敏感信息。

### 备选推荐

| 场景 | 推荐工具 | 理由 |
|------|----------|------|
| 预算有限 | Shottr ($12) | 性价比极高，测量和取色功能独特 |
| 需要全功能 | CleanShot X ($29) | 功能最全面，包括录屏和 GIF |
| 企业/跨平台 | Snagit (~$63) | 企业级功能，模板系统强大 |
| 仅基础需求 | macOS 原生 | 免费，基础功能够用 |

### 购买建议

如果只买一个工具：**Xnapper** (适合营销展示)

如果买两个工具：**Xnapper** + **Shottr** (美化 + 开发调试)

如果需要全能方案：**CleanShot X** (几乎涵盖所有需求)

---

## 截图最佳实践指南

### 1. 分辨率设置

**Mac App Store 要求**:
- 推荐尺寸：2880 x 1800 px
- 注意：Mac App Store 不接受 M 系列 MacBook 的默认分辨率截图，需要调整

**GitHub/社交媒体**:
- GitHub README：建议 1200-1600 px 宽
- Twitter：1200 x 675 px (1.91:1)
- Product Hunt：1270 x 760 px

**最佳实践**:
```
# 在 Retina 显示器上，实际截图会是 2x 分辨率
# 如需特定尺寸，可在 Xnapper 或 CleanShot X 中调整
```

### 2. 背景颜色选择

**推荐渐变背景** (HEX 值):

| 风格 | 起始色 | 结束色 | 适用场景 |
|------|--------|--------|----------|
| 专业蓝 | #667eea | #764ba2 | 技术产品 |
| 清新绿 | #11998e | #38ef7d | 效率工具 |
| 温暖橙 | #f093fb | #f5576c | 创意应用 |
| 深邃紫 | #4776E6 | #8E54E9 | 企业级应用 |
| 简约灰 | #bdc3c7 | #2c3e50 | 极简风格 |
| 暗色模式 | #1a1a2e | #16213e | 深色主题应用 |

**设计原则**:
- 深色/对比色背景 + 粗体标题 = 高端感
- 中性背景可将注意力集中在应用本身
- 背景颜色应与应用品牌色协调

**推荐工具**:
- [uiGradients](https://uigradients.com/) - 260+ 预设渐变
- [CSS Gradient](https://cssgradient.io/) - 自定义渐变生成器
- [Brand Gradients](http://www.brandgradients.com/) - 品牌渐变参考

### 3. 阴影效果

**macOS 默认阴影参数** (如需手动添加):
- 偏移：(0, -50)
- 模糊半径：70pt
- 不透明度：60%

**最佳实践**:
- 使用 Xnapper/CleanShot X 的自动阴影功能
- 避免过重的阴影，保持自然
- 深色背景上使用较淡的阴影
- 浅色背景上使用较深的阴影

**禁用系统阴影**（如需干净截图）:
```bash
# 方法1：截图时按住 Option 键
# 方法2：终端命令永久禁用
defaults write com.apple.screencapture disable-shadow true
killall SystemUIServer
```

### 4. 构图建议

**应用展示截图构图**:

1. **突出核心功能**
   - 每张截图聚焦一个核心功能点
   - 避免展示空白或无关内容
   - 使用真实、有意义的数据

2. **保持一致性**
   - 所有截图使用相同的背景风格
   - 统一的阴影效果和圆角
   - 一致的尺寸和比例

3. **添加上下文**
   - 简短标题说明功能
   - 可添加功能标注箭头
   - 使用步骤编号展示流程

4. **设备边框使用**
   - 完整应用展示时使用设备边框
   - 功能细节截图可不使用边框
   - 确保设备型号与目标用户相关

**构图示例**:
```
+----------------------------------+
|       功能标题 (可选)              |
|  +----------------------------+  |
|  |                            |  |
|  |      应用窗口截图            |  |
|  |                            |  |
|  +----------------------------+  |
|       功能说明文字 (可选)         |
+----------------------------------+
       背景 (渐变或纯色)
```

### 5. 其他最佳实践

**截图前准备**:
- [ ] 清理桌面图标 (CleanShot X 可自动隐藏)
- [ ] 关闭通知免打扰模式
- [ ] 准备有意义的演示数据
- [ ] 检查应用窗口大小合适

**导出设置**:
- 格式：PNG (无损) 或 JPEG (较小文件)
- PNG 适合：含文字、UI 元素的截图
- JPEG 适合：包含照片的截图

**文件命名**:
```
# 推荐命名格式
ensemble-feature-name-01.png
ensemble-dark-mode-screenshot.png
ensemble-skills-management.png
```

---

## 参考来源

### 工具对比与评测
- [Shottr vs CleanShot X in 2025: Difference and use cases](https://setapp.com/app-reviews/cleanshot-x-vs-shottr)
- [CleanshotX vs. Shottr vs. Xnapper: The Best Screenshot Tools for Mac Compared](https://toolfolio.io/productive-value/compare-cleanshotx-shottr-and-xnapper-to-find-the-best-screenshot-tool-for-your-mac-needs)
- [CleanShot X vs Xnapper: Which screenshot tool is best? [2025]](https://thesweetbits.com/cleanshot-vs-xnapper/)
- [The Best Screenshot Apps for Mac (Free and Paid)](https://thesweetbits.com/best-screenshot-apps-for-mac/)
- [10 Best Mac Screenshot Apps in 2026](https://storychief.io/blog/best-screenshot-tool-for-mac)

### 官方网站
- [CleanShot X 官网](https://cleanshot.com)
- [Xnapper 官网及定价](https://xnapper.com/pricing)
- [Shottr 官网](https://shottr.cc)
- [Shottr 购买页面](https://shottr.cc/purchase.html)
- [Snagit - TechSmith](https://www.techsmith.com/snagit.html)

### macOS 截图指南
- [Take a screenshot on Mac - Apple Support](https://support.apple.com/en-us/102646)
- [How to remove the shadow from screenshots on your Mac](https://macpaw.com/how-to/remove-mac-screenshot-shadow)
- [How to automate perfect screenshots for the Mac App Store](https://www.jessesquires.com/blog/2025/03/24/automate-perfect-mac-screenshots/)

### 截图最佳实践
- [Screenshots for App Store and Google Play in 2025: Complete Guide](https://asomobile.net/en/blog/screenshots-for-app-store-and-google-play-in-2025-a-complete-guide/)
- [Best Practices - SCRNSHTS](https://scrnshts.club/best-practices/)
- [36 Beautiful Color Gradients For Your Next Design Project](https://digitalsynopsis.com/design/beautiful-color-ui-gradients-backgrounds/)

### 设备模型工具
- [MockUPhone](https://mockuphone.com/)
- [Device Shots - Free Device Mockup Design Generator](https://deviceshots.com/)
- [AppMockUp Studio](https://app-mockup.com/)
- [Mockuuups Studio](https://mockuuups.studio/)

---

## 附录: 工具快速对比卡片

```
┌─────────────────────────────────────────────────────────────┐
│  推荐选择流程图                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  需要什么功能？                                               │
│       │                                                     │
│       ├── 快速美化 + 设备边框 ──→ Xnapper ($29.99)           │
│       │                                                     │
│       ├── 全功能截图 + 录屏 ───→ CleanShot X ($29)          │
│       │                                                     │
│       ├── 像素测量 + 取色 ────→ Shottr ($12)                │
│       │                                                     │
│       ├── 企业模板 + 跨平台 ──→ Snagit (~$63)               │
│       │                                                     │
│       └── 仅基础截图 ────────→ macOS 原生 (免费)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*报告完成于 2026-02-05，SubAgent D*
