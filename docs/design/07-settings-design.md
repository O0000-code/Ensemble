# Settings 页面设计规范

## 一、页面概览

Settings 页面是 Ensemble 应用的配置中心，采用单栏居中布局，包含三个主要配置区块：
- **Storage** - 存储路径配置
- **Auto Classify** - 自动分类配置（API Key + Toggle）
- **About** - 应用信息与链接

### 页面基本信息

| 属性 | 值 |
|------|-----|
| Node ID | `qSzzi` |
| 页面尺寸 | 1440 x 900 |
| 布局类型 | 单栏 (Sidebar 260px + Main Content) |
| Content 宽度 | 600px (固定宽度，水平居中) |

---

## 二、整体布局规范

### 2.1 页面结构

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────────┐  ┌─────────────────────────────────────────────┐  │
│  │              │  │  Main Header (56px)                         │  │
│  │              │  ├─────────────────────────────────────────────┤  │
│  │   Sidebar    │  │                                             │  │
│  │   (260px)    │  │          Content Area (600px)               │  │
│  │              │  │          padding: 32px 28px                 │  │
│  │              │  │                                             │  │
│  │              │  │  ┌────────────────────────────────────────┐ │  │
│  │              │  │  │ Storage Section                        │ │  │
│  │              │  │  └────────────────────────────────────────┘ │  │
│  │              │  │              gap: 32px                      │  │
│  │              │  │  ┌────────────────────────────────────────┐ │  │
│  │              │  │  │ Auto Classify Section                  │ │  │
│  │              │  │  └────────────────────────────────────────┘ │  │
│  │              │  │              gap: 32px                      │  │
│  │              │  │  ┌────────────────────────────────────────┐ │  │
│  │              │  │  │ About Section                          │ │  │
│  │              │  │  └────────────────────────────────────────┘ │  │
│  │              │  │                                             │  │
│  └──────────────┘  └─────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 布局参数

| 元素 | 属性 | 值 |
|------|------|-----|
| Sidebar | 宽度 | 260px |
| Sidebar | 右边框 | 1px solid #E5E5E5 |
| Main Content | 宽度 | fill_container |
| Main Header | 高度 | 56px |
| Main Header | padding | 0 28px |
| Main Header | 底边框 | 1px solid #E5E5E5 |
| Content Area | 宽度 | 600px (固定) |
| Content Area | padding | 32px 28px |
| Section 间距 | gap | 32px |

---

## 三、Main Header 规范

### 3.1 结构

```
Main Header
├── Header Left
│   └── pageTitle: "Settings"
```

### 3.2 样式参数

| 元素 | 属性 | 值 |
|------|------|-----|
| Container | 高度 | 56px |
| Container | padding | 0 28px |
| Container | 底边框 | 1px solid #E5E5E5 |
| Container | alignItems | center |
| Container | justifyContent | space_between |
| 页面标题 | 字体 | Inter |
| 页面标题 | 字号 | 16px |
| 页面标题 | 字重 | 600 (SemiBold) |
| 页面标题 | 颜色 | #18181B |

---

## 四、Section 通用规范

所有 Section 使用统一的结构和样式。

### 4.1 Section 结构

```
Section
├── Section Header
│   ├── Title (标题)
│   └── Description (描述)
└── Card (内容卡片)
```

### 4.2 Section Header 样式

| 元素 | 属性 | 值 |
|------|------|-----|
| Container | layout | vertical |
| Container | gap | 4px |
| Container | width | fill_container |
| 标题 | 字体 | Inter |
| 标题 | 字号 | 14px |
| 标题 | 字重 | 600 (SemiBold) |
| 标题 | 颜色 | #18181B |
| 描述 | 字体 | Inter |
| 描述 | 字号 | 12px |
| 描述 | 字重 | 400 (Normal) |
| 描述 | 颜色 | #71717A |

### 4.3 Card 通用样式

| 属性 | 值 |
|------|-----|
| 背景色 | 透明 (仅边框) |
| 边框 | 1px solid #E5E5E5 |
| 圆角 | 8px |
| 内部 padding | 0 (由子项控制) |

### 4.4 Section 与 Card 间距

| 位置 | gap |
|------|-----|
| Section Header → Card | 16px |

---

## 五、Storage Section 详细规范

### 5.1 结构

```
Storage Section (id: dgdNB)
├── Section Header (id: dcR2F)
│   ├── Title: "Storage"
│   └── Description: "Configure where Ensemble stores Skills and MCP configurations"
└── Storage Card (id: vCB6f)
    ├── Skills Path Item
    ├── MCP Path Item
    ├── Claude Path Item
    └── Stats Item
```

### 5.2 Section Header

| 元素 | 内容/值 |
|------|---------|
| 标题 | "Storage" |
| 描述 | "Configure where Ensemble stores Skills and MCP configurations" |

### 5.3 Path Item 行样式

每个 Path Item 行的结构相同：

```
Path Item
├── Left (vertical layout, gap: 2px)
│   ├── Label (标签)
│   └── Path Value (路径值)
└── Action (操作按钮)
```

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| justifyContent | space_between |
| alignItems | center |
| padding | 16px 20px |
| width | fill_container |
| 底边框 | 1px solid #E5E5E5 (内部分隔) |

**Left 区域样式：**

| 属性 | 值 |
|------|-----|
| layout | vertical |
| gap | 2px |

**Label 样式：**

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 13px |
| 字重 | 500 (Medium) |
| 颜色 | #18181B |

**Path Value 样式：**

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 12px |
| 字重 | 400 (Normal) |
| 颜色 | #71717A |

**Action 按钮样式 ("Change")：**

| 属性 | 值 |
|------|-----|
| 内容 | "Change" |
| 字体 | Inter |
| 字号 | 12px |
| 字重 | 500 (Medium) |
| 颜色 | #71717A |

### 5.4 Path Items 数据

| 行 | Label | 默认 Path |
|-----|-------|-----------|
| Skills Path Item | Skills Source Directory | ~/Conductor/Skills |
| MCP Path Item | MCP Servers Source Directory | ~/Conductor/MCPServers |
| Claude Path Item | Claude Code Config Directory | ~/.claude |

### 5.5 Stats Item 样式

Stats Item 是最后一行，显示统计信息，无底边框。

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| gap | 32px |
| padding | 16px 20px |
| width | fill_container |
| 底边框 | 无 |

**每个 Stat 项结构：**

```
Stat Item
├── Value (数值)
└── Label (标签)
```

**Stat 项容器：**

| 属性 | 值 |
|------|-----|
| layout | vertical |
| gap | 2px |

**Value 样式：**

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 13px |
| 字重 | 500 (Medium) |
| 颜色 | #18181B |

**Label 样式：**

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 11px |
| 字重 | 400 (Normal) |
| 颜色 | #A1A1AA |

### 5.6 Stats 数据

| Stat | Value | Label |
|------|-------|-------|
| Skills | 127 | Skills |
| MCPs | 18 | MCPs |
| Scenes | 8 | Scenes |
| Size | 2.4 MB | Total |

---

## 六、Auto Classify Section 详细规范

### 6.1 结构

```
Auto Classify Section (id: 2sG2G)
├── Section Header (id: gUIpk)
│   ├── Title: "Auto Classify"
│   └── Description: "Use Claude to automatically categorize and tag Skills and MCPs"
└── Classify Card (id: Jp442)
    ├── API Key Item
    ├── Auto Run Item
    └── Security Hint
```

### 6.2 Section Header

| 元素 | 内容/值 |
|------|---------|
| 标题 | "Auto Classify" |
| 描述 | "Use Claude to automatically categorize and tag Skills and MCPs" |

### 6.3 API Key Item 行

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| justifyContent | space_between |
| alignItems | center |
| padding | 16px 20px |
| width | fill_container |
| 底边框 | 1px solid #E5E5E5 |

**Left 区域：**

| 元素 | 属性 | 值 |
|------|------|-----|
| Container | layout | vertical |
| Container | gap | 2px |
| Label | 内容 | "Anthropic API Key" |
| Label | 字号 | 13px |
| Label | 字重 | 500 (Medium) |
| Label | 颜色 | #18181B |
| Value | 内容 | "sk-ant-api03-" (已配置时显示掩码) |
| Value | 字号 | 12px |
| Value | 字重 | 400 (Normal) |
| Value | 颜色 | #71717A |

**注意：** 未配置时 Value 可显示 "Not configured"

**Action 按钮 ("Configure")：**

| 属性 | 值 |
|------|-----|
| 内容 | "Configure" |
| 字体 | Inter |
| 字号 | 12px |
| 字重 | 500 (Medium) |
| 颜色 | #71717A |

### 6.4 Auto Run Item 行

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| justifyContent | space_between |
| alignItems | center |
| padding | 16px 20px |
| width | fill_container |
| 底边框 | 1px solid #E5E5E5 |

**Left 区域：**

| 元素 | 属性 | 值 |
|------|------|-----|
| Container | layout | vertical |
| Container | gap | 2px |
| Label | 内容 | "Auto-classify new items" |
| Label | 字号 | 13px |
| Label | 字重 | 500 (Medium) |
| Label | 颜色 | #18181B |
| Description | 内容 | "Automatically classify newly added Skills and MCPs" |
| Description | 字号 | 12px |
| Description | 字重 | 400 (Normal) |
| Description | 颜色 | #71717A |

**Toggle 组件：**

| 属性 | 值 |
|------|-----|
| 宽度 | 40px |
| 高度 | 22px |
| 圆角 | 11px |
| 背景色 (开启) | #18181B |
| 背景色 (关闭) | #E5E5E5 |
| padding | 2px |
| Knob 尺寸 | 18px x 18px |
| Knob 圆角 | 9px |
| Knob 颜色 | #FFFFFF |
| justifyContent | end (开启) / start (关闭) |

### 6.5 Security Hint 行

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| alignItems | center |
| gap | 6px |
| padding | 12px 20px |
| width | fill_container |
| 边框 | 无 |

**图标：**

| 属性 | 值 |
|------|-----|
| 图标 | shield-check (lucide) |
| 尺寸 | 12px x 12px |
| 颜色 | #A1A1AA |

**文字：**

| 属性 | 值 |
|------|-----|
| 内容 | "Your API key is stored locally and never shared." |
| 字体 | Inter |
| 字号 | 11px |
| 字重 | 400 (Normal) |
| 颜色 | #A1A1AA |

---

## 七、About Section 详细规范

### 7.1 结构

```
About Section (id: qgXlm)
├── Section Header (id: 4RQH2)
│   └── Title: "About"
└── About Card (id: Sivi1)
    ├── App Info
    ├── Divider
    └── Links
```

### 7.2 Section Header

| 元素 | 内容/值 |
|------|---------|
| 标题 | "About" |
| 描述 | 无 |

### 7.3 About Card 特殊样式

About Card 与其他 Card 不同，有内部 padding：

| 属性 | 值 |
|------|-----|
| padding | 20px |
| gap | 16px |
| layout | vertical |
| 边框 | 1px solid #E5E5E5 |
| 圆角 | 8px |

### 7.4 App Info 区域

**结构：**

```
App Info
├── App Icon (48x48)
└── Info Text
    ├── App Name
    └── Version
```

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| alignItems | center |
| gap | 14px |

**App Icon：**

| 属性 | 值 |
|------|-----|
| 尺寸 | 48px x 48px |
| 圆角 | 10px |
| 背景色 | #18181B |
| 内容 | Logo 图形 (与 Sidebar 相同) |

**Info Text：**

| 属性 | 值 |
|------|-----|
| layout | vertical |
| gap | 2px |

**App Name：**

| 属性 | 值 |
|------|-----|
| 内容 | "Ensemble" |
| 字体 | Inter |
| 字号 | 14px |
| 字重 | 600 (SemiBold) |
| 颜色 | #18181B |

**Version：**

| 属性 | 值 |
|------|-----|
| 内容 | "Version 1.0.0 (Build 1)" |
| 字体 | Inter |
| 字号 | 12px |
| 字重 | 400 (Normal) |
| 颜色 | #71717A |

### 7.5 Divider

| 属性 | 值 |
|------|-----|
| 高度 | 1px |
| 宽度 | fill_container |
| 背景色 | #E4E4E7 |

### 7.6 Links 区域

**容器样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| alignItems | center |
| gap | 16px |

**每个 Link 结构：**

```
Link
├── Icon
└── Text
```

**Link 样式：**

| 属性 | 值 |
|------|-----|
| layout | horizontal |
| alignItems | center |
| gap | 6px |

**Icon：**

| 属性 | 值 |
|------|-----|
| 尺寸 | 14px x 14px |
| 颜色 | #71717A |

**Text：**

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 12px |
| 字重 | 500 (Medium) |
| 颜色 | #71717A |

### 7.7 Links 数据

| Link | Icon | Text |
|------|------|------|
| GitHub Link | github | GitHub |
| Docs Link | book-open | Documentation |
| License Link | file-text | MIT License |

---

## 八、组件复用说明

### 8.1 可复用组件列表

1. **Section Header** - 所有 Section 使用相同的标题+描述结构
2. **Card Container** - 统一的卡片容器样式 (border + borderRadius)
3. **Row Item** - 配置项行 (Label + Value + Action 或 Toggle)
4. **Toggle** - 开关组件
5. **Stat Item** - 统计数据项 (Value + Label 垂直排列)
6. **Link Item** - 链接项 (Icon + Text)

### 8.2 Section Header 组件

```typescript
interface SectionHeaderProps {
  title: string;
  description?: string;
}
```

### 8.3 Row Item 组件

```typescript
interface RowItemProps {
  label: string;
  value: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  toggle?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
  description?: string; // 可选的第二行描述
  showDivider?: boolean; // 是否显示底部分隔线
}
```

### 8.4 Stat Item 组件

```typescript
interface StatItemProps {
  value: string | number;
  label: string;
}
```

### 8.5 Link Item 组件

```typescript
interface LinkItemProps {
  icon: string; // lucide icon name
  text: string;
  href: string;
}
```

---

## 九、颜色规范汇总

| 用途 | 颜色值 |
|------|--------|
| 主文字 (标题、Label) | #18181B |
| 次要文字 (Value、描述) | #71717A |
| 辅助文字 (hint、count) | #A1A1AA |
| 边框 / 分隔线 | #E5E5E5 |
| Divider (About) | #E4E4E7 |
| Toggle 开启背景 | #18181B |
| Toggle 关闭背景 | #E5E5E5 |
| Toggle Knob | #FFFFFF |
| 背景色 | #FFFFFF |

---

## 十、字体规范汇总

| 用途 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| 页面标题 | 16px | 600 | #18181B |
| Section 标题 | 14px | 600 | #18181B |
| Section 描述 | 12px | 400 | #71717A |
| Row Label | 13px | 500 | #18181B |
| Row Value | 12px | 400 | #71717A |
| Action 按钮 | 12px | 500 | #71717A |
| Stat Value | 13px | 500 | #18181B |
| Stat Label | 11px | 400 | #A1A1AA |
| Security Hint | 11px | 400 | #A1A1AA |
| Link Text | 12px | 500 | #71717A |
| App Name (About) | 14px | 600 | #18181B |
| Version | 12px | 400 | #71717A |

---

## 十一、间距规范汇总

| 位置 | 间距 |
|------|------|
| Content Area padding | 32px 28px |
| Section 间距 | 32px |
| Section Header → Card | 16px |
| Row Item padding | 16px 20px |
| Row Item 内部 Label-Value gap | 2px |
| Stats Item gap | 32px |
| About Card padding | 20px |
| About Card 内部 gap | 16px |
| App Info gap | 14px |
| Links gap | 16px |
| Link 内部 gap | 6px |
| Security Hint gap | 6px |

---

## 十二、Node ID 索引

| 组件 | Node ID |
|------|---------|
| Settings 页面 | qSzzi |
| Sidebar | QCuAq |
| Main Content | Az64A |
| Main Header | PRBBR |
| Content Area | shgQe |
| Storage Section | dgdNB |
| Storage Section Header | dcR2F |
| Storage Card | vCB6f |
| Skills Path Item | Ej0ia |
| MCP Path Item | BQEuR |
| Claude Path Item | lzL9Z |
| Stats Item | ts0Vi |
| Auto Classify Section | 2sG2G |
| Auto Classify Section Header | gUIpk |
| Classify Card | Jp442 |
| API Key Item | zKQHZ |
| Auto Run Item | gdXpW |
| Toggle | JmsOh |
| Security Hint | Z8hgU |
| About Section | qgXlm |
| About Section Header | 4RQH2 |
| About Card | Sivi1 |
| App Info | vyGGC |
| App Icon | zDWOy |
| Links | wHCP6 |
