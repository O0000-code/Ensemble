# Skills 模块设计规范

## 一、模块概览

Skills 模块是 Ensemble 应用的核心功能模块之一，用于管理 Claude Code 的 Skills（技能）。本模块包含以下页面状态：

| Node ID | 页面名称 | 布局类型 | 描述 |
|---------|----------|----------|------|
| `rPgYw` | Skills 列表 | 单栏 | 默认列表展示，显示所有 Skills |
| `DqVji` | Skills 空状态 | 单栏 | 无 Skill 时的引导状态 |
| `xzUxa` | Skills 按分类筛选 | 单栏 | 选中某分类后的筛选结果 |
| `vjc0x` | Skills 按标签筛选 | 单栏 | 选中某标签后的筛选结果 |
| `nNy4r` | Skill 详情 | 双栏 | List Panel (380px) + Detail Panel |

---

## 二、Skills 列表页 (rPgYw)

### 2.1 页面结构

```
├── Sidebar (260px)
└── Main Content (fill_container)
    ├── Main Header (56px)
    │   ├── Header Left
    │   │   ├── Page Title "Skills"
    │   │   └── Status Badge "42 enabled"
    │   └── Header Right
    │       ├── Search Input (220px)
    │       └── Auto Classify Button
    └── Content Area (padding: 24px 28px)
        └── Skills List (gap: 12px)
            └── Skill Item (多个)
```

### 2.2 Main Header 样式

#### 整体容器
| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 28px |
| 布局 | space_between |
| 下边框 | 1px solid #E5E5E5 |

#### Page Title
| 属性 | 值 |
|------|-----|
| 内容 | "Skills" |
| 字体 | Inter |
| 字号 | 16px |
| 字重 | 600 (SemiBold) |
| 颜色 | #18181B |

#### Status Badge (启用状态徽章)
| 属性 | 值 |
|------|-----|
| 背景色 | #DCFCE7 |
| 圆角 | 4px |
| padding | 4px 8px |
| gap | 4px |
| 内部点 | 6x6px, 圆角3px, #DCFCE7 |
| 文字 | "42 enabled" |
| 文字颜色 | #16A34A |
| 文字字号 | 11px |
| 文字字重 | 500 (Medium) |

#### Search Input
| 属性 | 值 |
|------|-----|
| 宽度 | 220px |
| 高度 | 32px |
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 0 10px |
| gap | 8px |
| 搜索图标 | lucide/search, 14x14px, #A1A1AA |
| placeholder | "Search skills..." |
| placeholder 颜色 | #A1A1AA |
| placeholder 字号 | 12px |

#### Auto Classify Button
| 属性 | 值 |
|------|-----|
| 高度 | 32px |
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 0 12px |
| gap | 6px |
| 图标 | lucide/sparkle, 14x14px, #71717A |
| 文字 | "Auto Classify" |
| 文字颜色 | #71717A |
| 文字字号 | 12px |
| 文字字重 | 500 (Medium) |

### 2.3 Content Area 样式

| 属性 | 值 |
|------|-----|
| padding | 24px 28px |
| gap | 16px |
| 布局 | vertical |

### 2.4 Skill Item 样式 (主列表)

#### 容器
| 属性 | 值 |
|------|-----|
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| 背景 | #FFFFFF |
| padding | 14px 16px |
| gap | 14px |
| 布局 | horizontal, alignItems: center |

#### Icon Wrap
| 属性 | 值 |
|------|-----|
| 尺寸 | 36x36px |
| 圆角 | 6px |
| 背景 | #FAFAFA |
| 图标尺寸 | 18x18px |
| 图标颜色 | #52525B |

#### Info (名称 + 描述)
| 属性 | 值 |
|------|-----|
| 布局 | vertical |
| gap | 3px |
| 宽度 | fill_container |
| **名称** | |
| 字体 | Inter |
| 字号 | 13px |
| 字重 | 500 (Medium) |
| 颜色 | #18181B |
| **描述** | |
| 字号 | 12px |
| 字重 | normal |
| 颜色 | #71717A |
| 宽度 | 500px (fixed-width) |

#### Tags 容器
| 属性 | 值 |
|------|-----|
| 布局 | horizontal |
| gap | 6px |

#### 单个 Tag (列表中)
| 属性 | 值 |
|------|-----|
| 圆角 | 3px |
| 背景 (分类) | #F4F4F5 |
| 背景 (普通) | #FAFAFA |
| padding | 3px 8px |
| 文字颜色 | #18181B |
| 文字字号 | 10px |
| 文字字重 | 500 (Medium) |

#### Toggle 开关
| 属性 | 开启状态 | 关闭状态 |
|------|----------|----------|
| 尺寸 | 40x22px | 40x22px |
| 圆角 | 11px | 11px |
| 背景色 | #18181B | #E4E4E7 |
| padding | 2px | 2px |
| 滑块尺寸 | 18x18px | 18x18px |
| 滑块圆角 | 9px | 9px |
| 滑块颜色 | #FFFFFF | #FFFFFF |
| 滑块位置 | justifyContent: end | 默认 |

---

## 三、Skills 空状态 (DqVji)

### 3.1 页面差异

与列表页相比的差异：
- Main Header 无 Status Badge
- Sidebar Categories 显示 "No categories"
- Sidebar Tags 显示 "No tags"
- Content Area 显示空状态组件

### 3.2 空状态组件

#### 容器
| 属性 | 值 |
|------|-----|
| 布局 | vertical, center |
| gap | 20px |
| 填满整个 Content Area |

#### 图形组 (Graphic Group)
| 属性 | 值 |
|------|-----|
| 尺寸 | 32x32px |
| 线条粗细 | 1.5px |
| 线条颜色 | #D4D4D8 |
| 组成 | 十字线 + 两条对角线 |

#### 文字组
| 属性 | 值 |
|------|-----|
| 布局 | vertical, center |
| gap | 6px |
| **标题** | |
| 内容 | "No skills" |
| 字号 | 14px |
| 字重 | 500 (Medium) |
| 颜色 | #A1A1AA |
| letterSpacing | -0.2px |
| **描述** | |
| 内容 | "Add your first skill to get started" |
| 字号 | 13px |
| 字重 | normal |
| 颜色 | #D4D4D8 |
| textAlign | center |

---

## 四、Skills 按分类筛选 (xzUxa)

### 4.1 页面差异

与列表页相比的差异：
- Main Header 标题变为分类名称（如 "Development"）
- Content Area 分为两个 Section

### 4.2 Section 结构

#### Section Header
| 属性 | 值 |
|------|-----|
| 布局 | horizontal |
| gap | 8px |
| padding-bottom | 8px |
| 图标 | lucide/sparkles 或 lucide/plug, 14x14px, #71717A |
| 标题 | "Skills (48)" 或 "MCP Servers (6)" |
| 标题颜色 | #71717A |
| 标题字号 | 12px |
| 标题字重 | 600 (SemiBold) |

#### Section 间距
| 属性 | 值 |
|------|-----|
| Skills Section 与 MCP Section 间距 | 32px |
| Section 内列表项间距 | 12px |

### 4.3 Sidebar 分类选中状态

选中的分类项：
| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |
| 其他样式不变 |

---

## 五、Skills 按标签筛选 (vjc0x)

### 5.1 页面差异

与按分类筛选基本相同：
- Main Header 标题变为标签名称（如 "React"）
- 同样分为 Skills Section 和 MCP Servers Section

### 5.2 Sidebar 标签选中状态

选中的标签：
| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |
| 边框 | 1px solid #E5E5E5 (保持) |

---

## 六、Skill 详情页 (nNy4r)

### 6.1 页面结构

```
├── Sidebar (260px)
├── List Panel (380px)
│   ├── List Header (56px)
│   └── List Content (padding: 12px, gap: 4px)
└── Detail Panel (800px / fill)
    ├── Detail Header (56px)
    └── Detail Content (padding: 28px, gap: 28px)
```

### 6.2 List Panel

#### List Header
| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 20px |
| 布局 | space_between |
| 下边框 | 1px solid #E5E5E5 |

#### List Header 左侧
| 属性 | 值 |
|------|-----|
| gap | 12px |
| **标题** | "Skills" |
| 标题字号 | 16px |
| 标题字重 | 600 |
| 标题颜色 | #18181B |
| **Badge** | |
| 背景 | #DCFCE7 |
| 圆角 | 4px |
| padding | 4px 8px |
| 点 | 6x6px ellipse, #DCFCE7 |
| 文字 | "127 Active" |
| 文字颜色 | #16A34A |
| 文字字号 | 10px |
| 文字字重 | 600 |

#### List Header 搜索框 (小版本)
| 属性 | 值 |
|------|-----|
| 宽度 | 140px |
| 高度 | 32px |
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 0 10px |
| gap | 6px |
| 图标 | 14x14px, #A1A1AA |
| placeholder | "Search..." |

#### List Content
| 属性 | 值 |
|------|-----|
| padding | 12px |
| gap | 4px |
| 布局 | vertical |

### 6.3 Skill Item (侧边列表 - 简化版)

#### 默认状态
| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| padding | 12px 14px |
| gap | 12px |
| 布局 | horizontal, alignItems: center |
| 背景 | transparent |

#### 选中状态
| 属性 | 值 |
|------|-----|
| 背景 | #FAFAFA |
| 名称字重 | 600 (加粗) |
| 图标背景 | #F4F4F5 |
| 图标颜色 | #18181B |

#### Icon (简化版)
| 属性 | 值 |
|------|-----|
| 尺寸 | 32x32px |
| 圆角 | 6px |
| 背景 | #FAFAFA (选中: #F4F4F5) |
| 图标尺寸 | 16x16px |
| 图标颜色 | #52525B (选中: #18181B) |

#### Info (简化版)
| 属性 | 值 |
|------|-----|
| gap | 2px |
| **名称** | |
| 字号 | 13px |
| 字重 | 500 (选中: 600) |
| 颜色 | #18181B |
| **描述** | |
| 字号 | 11px |
| 字重 | normal |
| 颜色 | #71717A |

#### Toggle (小版本)
| 属性 | 开启状态 |
|------|----------|
| 尺寸 | 36x20px |
| 圆角 | 10px |
| 背景 | #18181B |
| padding | 2px |
| 滑块尺寸 | 16x16px |
| 滑块圆角 | 8px |

### 6.4 Detail Panel

#### Detail Header
| 属性 | 值 |
|------|-----|
| 高度 | 56px |
| padding | 0 28px |
| 布局 | space_between |
| 下边框 | 1px solid #E5E5E5 |

#### Detail Header 左侧
| 属性 | 值 |
|------|-----|
| gap | 12px |
| **图标容器** | |
| 尺寸 | 36x36px |
| 圆角 | 8px |
| 背景 | #F4F4F5 |
| 图标尺寸 | 18x18px |
| 图标颜色 | #18181B |
| **标题容器** | gap: 2px |
| 标题字号 | 16px |
| 标题字重 | 600 |
| 标题颜色 | #18181B |
| 副标题字号 | 12px |
| 副标题颜色 | #71717A |

#### Detail Header 右侧
| 属性 | 值 |
|------|-----|
| gap | 8px |
| **Edit 按钮** | |
| 高度 | 32px |
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 0 12px |
| gap | 6px |
| 图标 | lucide/pencil, 14x14px, #52525B |
| 文字 | "Edit", 12px, 500, #52525B |
| **Toggle (大版本)** | |
| 尺寸 | 44x24px |
| 圆角 | 12px |
| 滑块尺寸 | 20x20px |
| 滑块圆角 | 10px |

#### Detail Content
| 属性 | 值 |
|------|-----|
| padding | 28px |
| gap | 28px |
| 布局 | vertical |

### 6.5 Info Section

#### Info Row (Created / Usage / Last Used)
| 属性 | 值 |
|------|-----|
| 布局 | horizontal |
| gap | 32px |
| **每个 Info Item** | |
| 布局 | vertical |
| gap | 4px |
| 宽度 | fill_container |
| **Label** | |
| 字号 | 11px |
| 字重 | 500 |
| 颜色 | #71717A |
| **Value** | |
| 字号 | 13px |
| 字重 | 500 |
| 颜色 | #18181B |

#### Category Selector
| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 6px 10px |
| gap | 8px |
| **颜色点** | 8x8px, 圆角3px, #71717A |
| **文字** | 13px, 500, #18181B |
| **Chevron** | lucide/chevron-down, 14x14px, #A1A1AA |

### 6.6 Tags Section (详情页)

#### Tag (可删除)
| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 6px 10px |
| gap | 6px |
| 文字 | 12px, 500, #18181B |
| X 图标 | lucide/x, 12x12px, #A1A1AA |

#### Add Tag 按钮
| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 6px 10px |
| gap | 4px |
| + 图标 | lucide/plus, 12x12px, #A1A1AA |
| 文字 | "Add", 12px, 500, #A1A1AA |

### 6.7 Instructions Section

#### Section Title
| 属性 | 值 |
|------|-----|
| 字号 | 14px |
| 字重 | 600 |
| 颜色 | #18181B |

#### Instructions Box
| 属性 | 值 |
|------|-----|
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| 背景 | #FFFFFF |
| padding | 16px |
| gap | 8px |
| 布局 | vertical |
| **内容文字** | |
| 字号 | 12px |
| 字重 | normal |
| 颜色 | #52525B |
| lineHeight | 1.6 |

### 6.8 Configuration Section

#### Config Box
| 属性 | 值 |
|------|-----|
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| 布局 | vertical |

#### Config Item
| 属性 | 值 |
|------|-----|
| padding | 12px 14px |
| gap | 12px |
| 布局 | horizontal, alignItems: center |
| 分隔线 | 底部 1px solid #E5E5E5 (最后一项无) |
| **Label** | 12px, 500, #71717A |
| **Value** | 12px, normal, #18181B |

#### Invocation Badges
| Badge 类型 | 背景色 | 文字颜色 |
|------------|--------|----------|
| User | #DCFCE7 | #16A34A |
| Claude | #EEF2FF | #4F46E5 |

### 6.9 Source Section

#### Source Box
| 属性 | 值 |
|------|-----|
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| padding | 16px |
| gap | 12px |
| 布局 | vertical |

#### Source Item
| 属性 | 值 |
|------|-----|
| 布局 | horizontal |
| gap | 10px |
| **Label** | 12px, 500, #71717A |
| **Value** | 12px, normal, #18181B |

#### Scope Badge
| Badge 类型 | 背景色 | 文字颜色 |
|------------|--------|----------|
| Personal | #FEF3C7 | #D97706 |

### 6.10 Used in Scenes Section

#### Scene Chip
| 属性 | 值 |
|------|-----|
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| padding | 8px 14px |
| gap | 8px |
| 图标 | lucide/layers, 14x14px, #52525B |
| 文字 | 12px, 500, #18181B |

---

## 七、组件复用说明

### 7.1 跨页面复用的组件

| 组件 | 使用页面 | 说明 |
|------|----------|------|
| Toggle (大) | 列表页 Skill Item | 40x22px |
| Toggle (中) | 详情页 Header | 44x24px |
| Toggle (小) | List Panel Skill Item | 36x20px |
| Search Input (大) | Main Header | 220px 宽 |
| Search Input (小) | List Panel Header | 140px 宽 |
| Status Badge | Main Header / List Header | 绿色启用状态 |
| Skill Item (完整) | 列表页 Content Area | 带完整描述和标签 |
| Skill Item (简化) | 详情页 List Panel | 简化描述，无标签 |
| Section Header | 筛选页 | 带图标的区块标题 |
| Empty State | 空状态页 | 居中的提示组件 |

### 7.2 主列表 vs 侧边列表对比

| 属性 | 主列表 Skill Item | 侧边列表 Skill Item |
|------|-------------------|---------------------|
| padding | 14px 16px | 12px 14px |
| 圆角 | 8px | 6px |
| 边框 | 1px solid #E5E5E5 | 无 (选中时有背景) |
| 图标容器 | 36x36px | 32x32px |
| 图标大小 | 18x18px | 16x16px |
| 名称字号 | 13px | 13px |
| 描述字号 | 12px | 11px |
| 描述宽度 | 500px | auto |
| 显示标签 | 是 | 否 |
| Toggle 尺寸 | 40x22px | 36x20px |
| gap | 14px | 12px |

---

## 八、颜色规范汇总

### 8.1 主要颜色

| 用途 | 颜色值 |
|------|--------|
| 主文字 | #18181B |
| 次要文字 | #71717A |
| 占位符/禁用 | #A1A1AA |
| 边框 | #E5E5E5 |
| 分隔线 | #E4E4E7 |
| 浅灰背景 | #FAFAFA |
| 中灰背景 | #F4F4F5 |
| 白色 | #FFFFFF |
| 黑色 (Toggle 开) | #18181B |
| Toggle 关闭 | #E4E4E7 |

### 8.2 状态颜色

| 用途 | 背景色 | 文字颜色 |
|------|--------|----------|
| 启用状态 (绿色) | #DCFCE7 | #16A34A |
| User Badge | #DCFCE7 | #16A34A |
| Claude Badge | #EEF2FF | #4F46E5 |
| Personal Scope | #FEF3C7 | #D97706 |

### 8.3 分类颜色点

| 分类 | 颜色 |
|------|------|
| Development | #18181B |
| Design | #71717A |
| Research | (待确认) |
| Productivity | (待确认) |
| Other | (待确认) |

---

## 九、字体规范汇总

### 9.1 字体系列

所有文字使用 **Inter** 字体

### 9.2 字号规范

| 用途 | 字号 | 字重 |
|------|------|------|
| 页面标题 | 16px | 600 |
| Section 标题 | 14px | 600 |
| 列表项名称 | 13px | 500 |
| 正文 | 12px | normal |
| 小标签 | 11px | 500 |
| 微小标签 | 10px | 500/600 |
| Sidebar Section 标题 | 10px | 600 |

### 9.3 特殊文字样式

| 用途 | 额外样式 |
|------|----------|
| CATEGORIES / TAGS 标题 | letterSpacing: 0.8px |
| Page Title (空状态) | letterSpacing: -0.2px |
| App Name "Ensemble" | letterSpacing: -0.3px |

---

## 十、间距规范汇总

### 10.1 页面级间距

| 区域 | Padding |
|------|---------|
| Main Content Area | 24px 28px |
| Detail Content | 28px |
| List Content | 12px |
| Header | 0 28px (Main) / 0 20px (List) |

### 10.2 组件间距

| 组件/区域 | Gap |
|-----------|-----|
| 主列表项之间 | 12px |
| 侧边列表项之间 | 4px |
| Detail 各 Section 之间 | 28px |
| Section 内各项之间 | 16px |
| 筛选页 Section 之间 | 32px |
| Tags 之间 | 6px / 8px |

---

## 十一、图标规范

### 11.1 常用图标

| 用途 | 图标名称 | 尺寸 |
|------|----------|------|
| 导航 - Skills | sparkles | 16px |
| 导航 - MCP | plug | 16px |
| 导航 - Scenes | layers | 16px |
| 导航 - Projects | folder | 16px |
| 搜索 | search | 14px |
| 设置 | settings | 18px |
| 添加 | plus | 12px |
| 编辑 | pencil | 14px |
| 删除标签 | x | 12px |
| 下拉箭头 | chevron-down | 14px |
| Auto Classify | sparkle | 14px |

### 11.2 Skill 类型图标示例

| Skill 类型 | 图标名称 |
|------------|----------|
| 前端开发 | code |
| GitHub | github |
| 文献研究 | book-open |
| SwiftUI | smartphone |
| 艺术创作 | palette |
| UI 设计 | palette |
| React | atom |
| API | server |
| 数据库 | database |
