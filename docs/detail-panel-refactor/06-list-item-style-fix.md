# 列表项样式对比报告

## 概述

本文档对比分析了 MCP 管理设计稿中，主页面和 Detail 页面的列表项样式差异，为实现正确的列表项组件提供参考。

---

## 1. MCP Server 列表项对比

### 1.1 主页面 Server Item（节点 ID: `VT3Kp`）

**完整结构**：
```
Server Item (frame, 水平布局)
├── Left (frame, 水平布局, gap: 14)
│   ├── Icon Wrap (frame, 40x40, 圆角8, 背景#FAFAFA)
│   │   └── icon_font (database, 20x20, #52525B)
│   └── Info (frame, 垂直布局, gap: 4)
│       ├── server1Name (text, 14px, 500, #18181B)
│       └── server1Desc (text, 12px, normal, #71717A)
├── Right (frame, 水平布局, gap: 16)
│   ├── Stats (frame, 水平布局, gap: 20)
│   │   ├── Stat: zap图标 + "2.4k calls" (11px, #71717A)
│   │   └── Stat: timer图标 + "45ms avg" (11px, #71717A)
│   ├── Status Badge ("Active", 绿色背景#DCFCE7, 文字#16A34A)
│   └── Toggle (开关控件, 40x22)
```

**显示内容**：
- 图标（40x40 容器，圆角8）
- 名称（14px, 500）
- 描述（12px）
- **统计信息**：calls 数量、平均响应时间
- **Active 状态标签**
- **Toggle 开关**

---

### 1.2 Detail 页面 Skill Item（节点 ID: `EkCYJ`）

**完整结构**：
```
Skill Item (frame, 水平布局, gap: 14, padding: [16,20])
├── Icon (frame, 40x40, 圆角8, 背景#FAFAFA)
│   └── icon_font (database, 20x20, #52525B)
├── Info (frame, 垂直布局, gap: 4, width: fill_container)
│   ├── skill1Name (text, 14px, 500, #18181B) - "postgres-mcp"
│   └── skill1Desc (text, 12px, normal, #71717A) - "PostgreSQL database operations"
└── Toggle (frame, 36x20, 圆角10, 背景#18181B)
    └── Knob (frame, 16x16, 圆角8, 白色)
```

**显示内容**：
- 图标（40x40 容器，圆角8）
- 名称（14px, 500）
- 描述（12px）
- **仅 Toggle 开关**（无统计信息，无 Active 标签）

---

### 1.3 MCP Server 列表项差异总结

| 元素 | 主页面 (VT3Kp) | Detail 页面 (EkCYJ) |
|------|----------------|---------------------|
| 图标 | 40x40, 圆角8 | 40x40, 圆角8 |
| 名称 | 14px, 500 | 14px, 500 |
| 描述 | 12px | 12px |
| 统计信息 (calls/avg) | **有** | **无** |
| Active 状态标签 | **有** | **无** |
| Toggle 开关 | 40x22 | 36x20（略小） |
| 整体布局 | space_between | gap: 14 |

**结论**：Detail 页面的 Skill Item 是**简化版**，只保留核心信息（图标、名称、描述）和开关控制，去掉了统计信息和状态标签。

---

## 2. Scene 列表项对比

### 2.1 主页面 Scene Card（节点 ID: `6K9II`）

**完整结构**：
```
Scene Card (frame, 水平布局, justify: space_between)
├── Left (frame, 水平布局, gap: 14)
│   ├── Icon Wrap (frame, 40x40, 圆角8, 背景#FAFAFA)
│   │   └── icon_font (globe, 20x20, #52525B)
│   └── Info (frame, 垂直布局, gap: 4)
│       ├── sceneName1 (text, 14px, 500, #18181B) - "Web Development"
│       └── sceneDesc1 (text, 12px, normal, #71717A) - "Frontend, React, TypeScript..."
├── Right (frame, 水平布局, gap: 24)
│   ├── Meta (frame, 水平布局, gap: 20)
│   │   ├── metaItem1a: "Skills" (标签) + "12" (数值)
│   │   └── metaItem1b: "MCPs" (标签) + "3" (数值)
│   ├── Status Badge ("Active")
│   └── Actions (更多操作按钮, ellipsis 图标)
```

**"X Skills / Y MCPs" 信息样式**：
- 位置：**右侧区域**，在状态标签之前
- 布局：水平排列，gap: 20
- 标签样式：11px, 500, #A1A1AA
- 数值样式：11px, 600, #52525B
- 格式：`Skills 12` 和 `MCPs 3` 分开显示

---

### 2.2 Detail 页面 Scene Item（节点 ID: `Fs7Ov`）

**完整结构**：
```
Scene Item (frame, 水平布局, gap: 14, padding: [16,20])
├── scene1Icon (frame, 40x40, 圆角8, 背景#F4F4F5)
│   └── icon_font (globe, 20x20, #52525B)
└── Info (frame, 垂直布局, gap: 4, width: fill_container)
    ├── scene1Name (text, 14px, 500, #18181B) - "Web Development"
    └── scene1Meta (text, 12px, normal, #71717A) - "12 Skills · 3 MCPs"
```

**"X Skills / Y MCPs" 信息样式**：
- 位置：**左侧 Info 区域内**，作为描述行
- 格式：单行文本 `"12 Skills · 3 MCPs"`
- 样式：12px, normal, #71717A
- 使用中间点 `·` 分隔

---

### 2.3 Scene 列表项差异总结

| 元素 | 主页面 (6K9II) | Detail 页面 (Fs7Ov) |
|------|----------------|---------------------|
| 图标 | 40x40, 背景#FAFAFA | 40x40, 背景#F4F4F5 |
| 名称 | 14px, 500 | 14px, 500 |
| 描述 | 完整描述文本 | **无描述** |
| Skills/MCPs 信息 | **右侧分开显示** | **左侧单行合并** |
| Active 状态标签 | **有** | **无** |
| 操作按钮 | **有** (ellipsis) | **无** |
| 整体布局 | space_between | gap: 14 |

**关键差异**：
1. Detail 页面没有描述文本，改为显示 Skills/MCPs 统计
2. Skills/MCPs 信息从右侧移到左侧，作为第二行显示
3. 格式从分开显示改为 `"X Skills · Y MCPs"` 单行格式
4. 去掉了 Active 状态标签和操作按钮

---

## 3. 关键样式规范

### 3.1 通用样式

```css
/* 列表项容器 */
.list-item {
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #E5E5E5;
  width: 100%;
}

/* 图标容器 */
.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #FAFAFA; /* 或 #F4F4F5 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图标 */
.icon {
  width: 20px;
  height: 20px;
  color: #52525B;
}

/* 名称 */
.name {
  font-size: 14px;
  font-weight: 500;
  color: #18181B;
}

/* 描述/元信息 */
.description {
  font-size: 12px;
  font-weight: normal;
  color: #71717A;
}
```

### 3.2 Toggle 开关样式

**主页面 Toggle**：
```css
.toggle-main {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #18181B;
  padding: 2px;
}
.toggle-main .knob {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: white;
}
```

**Detail 页面 Toggle**：
```css
.toggle-detail {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: #18181B;
  padding: 2px;
}
.toggle-detail .knob {
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: white;
}
```

### 3.3 状态标签样式（仅主页面使用）

```css
.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  background: #DCFCE7;
}
.status-badge-text {
  font-size: 10px;
  font-weight: 600;
  color: #16A34A;
}
```

---

## 4. 实现建议

### 4.1 MCP Detail 页面的 Skill Item

组件应该：
- 显示：图标、名称、描述、Toggle 开关
- **不显示**：calls 统计、响应时间、Active 标签
- 布局：水平，左侧信息填充剩余空间，右侧仅 Toggle

```tsx
// Skill Item 简化版
<div className="flex items-center gap-3.5 p-4 px-5 rounded-lg border">
  <IconWrap icon={item.icon} />
  <div className="flex-1 flex flex-col gap-1">
    <span className="text-sm font-medium text-zinc-900">{item.name}</span>
    <span className="text-xs text-zinc-500">{item.description}</span>
  </div>
  <Toggle checked={item.enabled} />
</div>
```

### 4.2 Scene Detail 页面的 Scene Item

组件应该：
- 显示：图标、名称、`"X Skills · Y MCPs"` 统计
- **不显示**：完整描述、Active 标签、操作按钮
- 布局：水平，左侧信息填充剩余空间

```tsx
// Scene Item 简化版
<div className="flex items-center gap-3.5 p-4 px-5 rounded-lg border">
  <IconWrap icon={item.icon} />
  <div className="flex-1 flex flex-col gap-1">
    <span className="text-sm font-medium text-zinc-900">{item.name}</span>
    <span className="text-xs text-zinc-500">
      {item.skillCount} Skills · {item.mcpCount} MCPs
    </span>
  </div>
</div>
```

---

## 5. 总结

| 页面位置 | 列表项类型 | 显示内容 | 不显示内容 |
|----------|-----------|----------|-----------|
| MCP 主页面 | Server Item | 图标、名称、描述、统计、状态、开关 | - |
| MCP Detail | Skill Item | 图标、名称、描述、开关 | 统计、状态 |
| Scene 主页面 | Scene Card | 图标、名称、描述、Skills/MCPs、状态、操作 | - |
| Scene Detail | Scene Item | 图标、名称、`X Skills · Y MCPs` | 描述、状态、操作 |

**核心原则**：Detail 页面的列表项是简化版，保留核心识别信息，去掉统计和状态相关元素。
