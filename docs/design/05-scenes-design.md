# Scenes 模块设计规范

## 一、模块概览

Scenes（场景）是 Ensemble 应用的核心功能模块，用于将 Skills 和 MCP Servers 组合成预设配置，以便快速应用到不同项目中。

### 页面列表

| Node ID | 页面名称 | 布局类型 |
|---------|----------|----------|
| `M7mYr` | Scenes 列表 | 单栏 (Sidebar + Main Content) |
| `v7TIk` | Scenes 空状态 | 单栏 (Sidebar + Main Content) |
| `LlxKB` | Scene 详情 | 双栏 (Sidebar + List Panel + Detail Panel) |
| `Ek3cB` | 新建 Scene 模态框 | 模态框 (三栏布局) |

---

## 二、Scenes 列表页 (M7mYr)

### 2.1 页面结构

```
Scenes 列表页 (1440 x 900)
├── Sidebar (260px)
└── Main Content (fill_container)
    ├── Main Header (height: 56px)
    │   ├── Header Left
    │   │   └── Page Title "Scenes"
    │   └── Header Right
    │       └── "New Scene" Button
    └── Content Area (padding: 24px 28px, gap: 20px)
        └── Scenes Grid (gap: 12px)
            └── Scene Card (repeated)
```

### 2.2 Main Header 样式

```
Main Header
├── Layout: height 56px, justify-content: space-between, padding: 0 28px
├── Border: bottom 1px #E5E5E5
│
├── Page Title
│   ├── Font: Inter 16px, weight 600
│   └── Color: #18181B
│
└── "New Scene" Button
    ├── Layout: height 32px, padding: 0 12px, gap 6px, align-items: center
    ├── Background: #18181B
    ├── Corner Radius: 6px
    ├── Icon: Lucide "plus", 14x14, color #FFFFFF
    └── Text: Inter 12px, weight 500, color #FFFFFF
```

### 2.3 Scene 卡片样式

Scene 卡片采用横向布局，包含左侧信息区和右侧元数据区：

```
Scene Card
├── Layout: justify-content: space-between, align-items: center
├── Size: width fill_container
├── Padding: 20px 24px
├── Border: 1px solid #E5E5E5
├── Corner Radius: 8px
│
├── Left Section (gap: 20px)
│   ├── Scene Index
│   │   ├── Font: Inter 11px, weight 600, letter-spacing 0.5
│   │   └── Color: #A1A1AA
│   │   └── Content: "01", "02", "03"...
│   │
│   └── Info (layout: vertical, gap: 4px)
│       ├── Scene Name
│       │   ├── Font: Inter 14px, weight 500
│       │   └── Color: #18181B
│       └── Scene Description
│           ├── Font: Inter 12px, weight normal
│           └── Color: #71717A
│
└── Right Section (gap: 24px)
    ├── Meta (gap: 20px)
    │   ├── Meta Item: Skills
    │   │   ├── Label: Inter 11px, weight 500, color #A1A1AA
    │   │   ├── Value: Inter 11px, weight 600, color #52525B
    │   │   └── Gap: 6px
    │   └── Meta Item: MCPs
    │       └── (same style)
    │
    ├── Status Badge (可选，仅 Active 状态显示)
    │   ├── Padding: 4px 10px
    │   ├── Background: #DCFCE7
    │   ├── Corner Radius: 4px
    │   ├── Text: Inter 10px, weight 600, color #16A34A
    │   └── Content: "Active"
    │
    └── Actions
        └── More Button
            ├── Size: 28x28px
            ├── Corner Radius: 4px
            ├── Icon: Lucide "ellipsis", 16x16, color #A1A1AA
            └── Hover: 可添加 background #F4F4F5
```

---

## 三、Scenes 空状态 (v7TIk)

### 3.1 页面结构

与列表页相同的 Sidebar + Main Content 结构，但 Content Area 居中显示空状态提示。

### 3.2 空状态组件样式

```
Empty State (居中显示)
├── Layout: vertical, gap: 20px, align-items: center
│
├── Graphic Group (40x32px)
│   └── 三层堆叠矩形图标
│       ├── Rect Back: 24x18px, corner-radius 3px, stroke #E4E4E7 1.5px
│       ├── Rect Mid: 24x18px, corner-radius 3px, stroke #D4D4D8 1.5px
│       └── Rect Front: 24x18px, corner-radius 3px, stroke #A1A1AA 1.5px
│
└── Text Group (layout: vertical, gap: 6px)
    ├── Empty Title
    │   ├── Font: Inter 14px, weight 500, letter-spacing -0.2
    │   ├── Color: #A1A1AA
    │   └── Content: "No scenes"
    └── Empty Description
        ├── Font: Inter 13px, weight normal, text-align center
        ├── Color: #D4D4D8
        └── Content: "Create a scene to bundle configurations"
```

---

## 四、Scene 详情页 (LlxKB)

### 4.1 页面结构

```
Scene 详情页 (1440 x 900)
├── Sidebar (260px)
└── Main Content (1180px, layout: none)
    ├── List Panel (380px)
    │   ├── List Header (56px)
    │   └── List Content (padding: 12px, gap: 4px)
    └── Detail Panel (800px, fill)
        ├── Detail Header (56px)
        └── Detail Content (padding: 28px, gap: 28px)
```

### 4.2 List Panel 样式

#### List Header

```
List Header
├── Layout: height 56px, justify-content: space-between, padding: 0 20px
├── Border: bottom 1px #E5E5E5
│
├── Left (gap: 12px)
│   ├── Title
│   │   ├── Font: Inter 14px, weight 600
│   │   └── Color: #18181B
│   │   └── Content: "Scenes"
│   └── Count Badge
│       ├── Padding: 2px 8px
│       ├── Background: #F4F4F5
│       ├── Corner Radius: 10px
│       └── Text: Inter 11px, weight 500, color #71717A
│
└── Right
    └── Add Button (圆形)
        ├── Size: 32x32px
        ├── Background: #18181B
        ├── Corner Radius: 6px
        └── Icon: Lucide "plus", 14x14, color #FFFFFF
```

#### Scene 列表项

```
Scene Item (未选中)
├── Layout: align-items: center, gap: 12px
├── Padding: 12px 14px
├── Corner Radius: 6px
│
├── Icon Container
│   ├── Size: 36x36px
│   ├── Background: #F4F4F5
│   ├── Corner Radius: 8px
│   └── Icon: Lucide icon, 16x16, color #52525B
│
└── Info (layout: vertical, gap: 2px)
    ├── Name
    │   ├── Font: Inter 13px, weight 500
    │   └── Color: #71717A
    └── Meta
        ├── Font: Inter 11px, weight normal
        ├── Color: #A1A1AA
        └── Format: "X Skills · Y MCPs"

Scene Item (选中状态)
├── Background: #FAFAFA
├── Icon Container Background: #FFFFFF
├── Name Color: #18181B
└── Meta Color: #71717A
```

### 4.3 Detail Panel 样式

#### Detail Header

```
Detail Header
├── Layout: height 56px, justify-content: space-between, padding: 0 28px
├── Border: bottom 1px #E5E5E5
│
├── Left (gap: 12px)
│   ├── Icon Container
│   │   ├── Size: 36x36px
│   │   ├── Background: #F4F4F5
│   │   ├── Corner Radius: 8px
│   │   └── Icon: Lucide icon, 18x18, color #18181B
│   │
│   └── Title Wrap (layout: vertical, gap: 2px)
│       ├── Title
│       │   ├── Font: Inter 16px, weight 600
│       │   └── Color: #18181B
│       └── Subtitle
│           ├── Font: Inter 12px, weight normal
│           └── Color: #71717A
│
└── Right (gap: 8px)
    ├── Edit Button
    │   ├── Layout: height 32px, padding: 0 12px, gap: 6px
    │   ├── Border: 1px solid #E5E5E5
    │   ├── Corner Radius: 6px
    │   ├── Icon: Lucide "pencil", 14x14, color #52525B
    │   └── Text: Inter 12px, weight 500, color #52525B
    │
    └── Delete Button
        ├── Layout: height 32px, padding: 0 12px, gap: 6px
        ├── Border: 1px solid #FEE2E2
        ├── Corner Radius: 6px
        ├── Icon: Lucide "trash-2", 14x14, color #DC2626
        └── Text: Inter 12px, weight 500, color #DC2626
```

#### Info Section

```
Info Section (layout: vertical, gap: 16px)
└── Info Row (gap: 32px, 水平排列)
    └── Info Item (layout: vertical, gap: 4px, width: fill_container)
        ├── Label
        │   ├── Font: Inter 11px, weight 500
        │   └── Color: #71717A
        └── Value
            ├── Font: Inter 13px, weight 500
            └── Color: #18181B

Info Items:
- Created: "Dec 8, 2024"
- Skills Count: "8 skills"
- MCPs Count: "5 servers"
- Used By: "3 projects"
```

#### Included Skills / MCP Servers Section

```
Section
├── Layout: vertical, gap: 12px
│
├── Section Header (justify-content: space-between)
│   ├── Title
│   │   ├── Font: Inter 14px, weight 600
│   │   └── Color: #18181B
│   └── Count Badge
│       ├── Padding: 2px 8px
│       ├── Background: #F4F4F5
│       ├── Corner Radius: 10px
│       └── Text: Inter 11px, weight 500, color #71717A
│
└── Items Box
    ├── Border: 1px solid #E5E5E5
    ├── Corner Radius: 8px
    │
    ├── Item (repeated)
    │   ├── Layout: align-items: center, gap: 12px
    │   ├── Padding: 12px 14px
    │   ├── Border: bottom 1px #E5E5E5 (最后一项无)
    │   │
    │   ├── Icon Container
    │   │   ├── Size: 32x32px
    │   │   ├── Background: #F4F4F5
    │   │   ├── Corner Radius: 6px
    │   │   └── Icon: 14x14, color #52525B
    │   │
    │   └── Info (layout: vertical, gap: 2px)
    │       ├── Name: Inter 13px, weight 500, color #18181B
    │       └── Description: Inter 11px, weight normal, color #71717A
    │
    └── Show More (可选)
        ├── Padding: 12px 14px
        ├── Border: top 1px #E5E5E5
        ├── justify-content: center
        └── Text: 可点击展开更多
```

#### Used by Projects Section

```
Projects Section
├── Layout: vertical, gap: 12px
│
├── Section Header (justify-content: space-between)
│   ├── Left (gap: 8px)
│   │   ├── Title: Inter 14px, weight 600, color #18181B, "Used by Projects"
│   │   └── Count Badge
│   │       ├── Padding: 2px 8px
│   │       ├── Background: #FEF3C7 (黄色警告色)
│   │       ├── Corner Radius: 10px
│   │       └── Text: Inter 11px, weight 600, color #D97706
│   │
│   └── Warning Text
│       ├── Font: Inter 11px, weight normal
│       └── Color: #D97706
│       └── Content: "Changes will affect these projects"
│
└── Projects Grid (gap: 8px, 水平 wrap)
    └── Project Chip
        ├── Layout: align-items: center, gap: 8px
        ├── Padding: 8px 14px
        ├── Border: 1px solid #E5E5E5
        ├── Corner Radius: 6px
        ├── Icon: Lucide "folder", 14x14, color #52525B
        └── Text: Inter 12px, weight 500, color #18181B
```

---

## 五、新建 Scene 模态框 (Ek3cB) - 核心设计

### 5.1 模态框结构概览

```
New Scene Modal (1440 x 900)
├── Modal Overlay
│   ├── Background: #000000 40% opacity (#00000066)
│   └── Layout: none (全屏覆盖)
│
└── Modal Dialog (1280 x 820)
    ├── Position: x: 80, y: 40 (居中)
    ├── Background: #FFFFFF
    ├── Corner Radius: 16px
    ├── Clip: true
    │
    ├── Modal Header (height: 64px)
    └── Modal Body (三栏布局)
        ├── Left Panel - Basic Info (320px)
        ├── Center Panel - Selection (fill_container)
        └── Right Panel - Selected Items (320px)
```

### 5.2 Modal Header 样式

```
Modal Header
├── Layout: height 64px, justify-content: space-between, padding: 0 28px
├── Border: bottom 1px #E5E5E5
│
├── Header Left (layout: vertical, gap: 4px)
│   ├── Title
│   │   ├── Font: Inter 18px, weight 600
│   │   └── Color: #18181B
│   │   └── Content: "Create New Scene"
│   └── Subtitle
│       ├── Font: Inter 13px, weight normal
│       └── Color: #71717A
│       └── Content: "Configure skills and MCP servers for this development context"
│
└── Close Button
    ├── Size: 36x36px
    ├── Corner Radius: 8px
    ├── Icon: Lucide "x", 20x20, color #71717A
    └── Hover: background #F4F4F5
```

### 5.3 左栏 - Basic Info Panel (320px)

```
Left Panel - Basic Info
├── Width: 320px
├── Background: #FFFFFF
├── Border: right 1px #E5E5E5
├── Layout: vertical
│
└── Left Content (padding: 24px, gap: 24px)
    ├── Basic Info Section (gap: 20px)
    │   ├── Section Title
    │   │   ├── Font: Inter 14px, weight 600
    │   │   └── Color: #18181B
    │   │   └── Content: "Basic Information"
    │   │
    │   ├── Name Field (gap: 6px)
    │   │   ├── Label: Inter 12px, weight 500, color #52525B, "Scene Name"
    │   │   └── Input
    │   │       ├── Height: 40px
    │   │       ├── Padding: 0 12px
    │   │       ├── Background: #FFFFFF
    │   │       ├── Border: 1px solid #E5E5E5
    │   │       ├── Corner Radius: 6px
    │   │       └── Text: Inter 13px, weight normal, color #18181B
    │   │
    │   └── Description Field (gap: 6px)
    │       ├── Label: Inter 12px, weight 500, color #52525B, "Description"
    │       └── Textarea
    │           ├── Height: 80px
    │           ├── Padding: 12px
    │           ├── Background: #FFFFFF
    │           ├── Border: 1px solid #E5E5E5
    │           ├── Corner Radius: 6px
    │           └── Text: Inter 12px, weight normal, color #18181B, line-height 1.5
    │
    ├── Divider (height: 1px, background: #E4E4E7)
    │
    ├── Summary Section (gap: 16px)
    │   ├── Section Title: "Selection Summary"
    │   │
    │   └── Summary Items (repeated)
    │       ├── Layout: justify-content: space-between
    │       ├── Label (gap: 8px)
    │       │   ├── Icon: 16x16, color #71717A
    │       │   └── Text: Inter 13px, weight normal, color #52525B
    │       └── Value Badge
    │           ├── Padding: 4px 10px
    │           ├── Corner Radius: 4px
    │           ├── Skills: background #F4F4F5, text #18181B
    │           └── MCPs: background #DCFCE7, text #16A34A (有选择时)
    │
    ├── Spacer (fill_container)
    │
    └── Action Buttons (gap: 12px)
        ├── Create Button
        │   ├── Height: 44px
        │   ├── Background: #18181B
        │   ├── Corner Radius: 8px
        │   └── Text: Inter 14px, weight 500, color #FFFFFF, "Create Scene"
        │
        └── Cancel Button
            ├── Height: 44px
            ├── Border: 1px solid #E5E5E5
            ├── Corner Radius: 8px
            └── Text: Inter 14px, weight 500, color #71717A, "Cancel"
```

### 5.4 中栏 - Selection Panel (fill_container)

```
Center Panel - Selection
├── Width: fill_container
├── Layout: vertical
│
├── Center Header (padding: 16px 24px, gap: 16px)
│   ├── Border: bottom 1px #E5E5E5
│   │
│   ├── Tab Row
│   │   ├── Tab Active (Skills)
│   │   │   ├── Layout: gap 8px, padding: 10px 20px
│   │   │   ├── Border: bottom 2px #18181B
│   │   │   ├── Icon: Lucide "sparkles", 16x16, color #18181B
│   │   │   ├── Text: Inter 13px, weight 600, color #18181B
│   │   │   └── Count Badge
│   │   │       ├── Padding: 2px 8px
│   │   │       ├── Background: #FAFAFA
│   │   │       ├── Corner Radius: 10px
│   │   │       └── Text: Inter 11px, weight 500, color #52525B
│   │   │
│   │   └── Tab Inactive (MCP Servers)
│   │       ├── Layout: gap 8px, padding: 10px 20px
│   │       ├── Border: none
│   │       ├── Icon: Lucide "plug", 16x16, color #71717A
│   │       ├── Text: Inter 13px, weight normal, color #71717A
│   │       └── Count Badge
│   │           ├── Padding: 2px 8px
│   │           ├── Background: #FAFAFA
│   │           ├── Corner Radius: 10px
│   │           └── Text: Inter 11px, weight 500, color #71717A
│   │
│   └── Filter Row (gap: 12px)
│       ├── Search Box
│       │   ├── Height: 40px
│       │   ├── Width: fill_container
│       │   ├── Padding: 0 14px
│       │   ├── Border: 1px solid #E5E5E5
│       │   ├── Corner Radius: 8px
│       │   ├── Gap: 10px
│       │   ├── Icon: Lucide "search", 16x16, color #A1A1AA
│       │   └── Placeholder: Inter 13px, weight normal, color #A1A1AA
│       │
│       ├── Category Filter
│       │   ├── Height: 40px
│       │   ├── Padding: 0 14px
│       │   ├── Border: 1px solid #E5E5E5
│       │   ├── Corner Radius: 8px
│       │   ├── Gap: 8px
│       │   ├── Icon: Lucide "folder", 16x16, color #52525B
│       │   ├── Text: Inter 13px, weight normal, color #52525B
│       │   └── Chevron: Lucide "chevron-down", 14x14, color #71717A
│       │
│       ├── Tag Filter (同上样式)
│       │   └── Icon: Lucide "tag"
│       │
│       └── Select All Button
│           ├── Height: 40px
│           ├── Padding: 0 14px
│           ├── Background: #FAFAFA
│           ├── Corner Radius: 8px
│           ├── Gap: 6px
│           ├── Icon: Lucide "square-check", 14x14, color #52525B
│           └── Text: Inter 12px, weight 500, color #52525B
│
└── Center Content (padding: 20px, gap: 8px)
    └── Skill/MCP Items (repeated)
```

#### 可选列表项样式 (Checkbox Item)

```
Skill Item (未选中)
├── Layout: align-items: center, gap: 14px
├── Padding: 14px 16px
├── Border: 1px solid #E5E5E5
├── Corner Radius: 8px
│
├── Checkbox (未选中)
│   ├── Size: 20x20px
│   ├── Border: 2px solid #D4D4D4
│   ├── Corner Radius: 4px
│   └── Background: transparent
│
├── Icon Container
│   ├── Size: 36x36px
│   ├── Background: #FAFAFA
│   ├── Corner Radius: 8px
│   └── Icon: 18x18, color #52525B
│
├── Info (layout: vertical, gap: 4px, width: fill_container)
│   ├── Name: Inter 13px, weight 500, color #18181B
│   └── Description: Inter 12px, weight normal, color #71717A
│
└── Tags (gap: 6px)
    └── Tag
        ├── Padding: 3px 8px
        ├── Background: #FAFAFA
        ├── Corner Radius: 4px
        └── Text: Inter 10px, weight 500, color #52525B


Skill Item (选中状态)
├── Background: #FAFAFA
├── Border: 1px solid #18181B
│
├── Checkbox (选中)
│   ├── Size: 20x20px
│   ├── Background: #18181B
│   ├── Corner Radius: 4px
│   └── Icon: Lucide "check", 14x14, color #FFFFFF
│
├── Icon Container
│   ├── Background: #FFFFFF (对比)
│   └── Icon Color: #18181B
│
├── Name: weight 600 (加粗)
├── Description: color #52525B (深一点)
│
└── Tags
    └── Background: #FFFFFF
    └── First Tag Text Color: #18181B (高亮)
```

### 5.5 右栏 - Selected Items Panel (320px)

```
Right Panel - Selected Items
├── Width: 320px
├── Background: #FFFFFF
├── Border: left 1px #E5E5E5
├── Layout: vertical
│
├── Right Header (padding: 16px 20px)
│   ├── Border: bottom 1px #E5E5E5
│   ├── Layout: justify-content: space-between
│   │
│   ├── Title: Inter 14px, weight 600, color #18181B, "Selected Items"
│   │
│   └── Clear All Button
│       ├── Padding: 4px 10px
│       ├── Corner Radius: 4px
│       └── Text: Inter 11px, weight 500, color #DC2626
│
└── Right Content (padding: 16px, gap: 16px)
    ├── Skills Group
    │   ├── Group Header (gap: 8px)
    │   │   ├── Icon: Lucide "sparkles", 14x14, color #18181B
    │   │   ├── Title: Inter 12px, weight 600, color #18181B, "Skills"
    │   │   └── Count: Inter 12px, weight normal, color #71717A, "(12)"
    │   │
    │   └── Skills List (gap: 6px)
    │       └── Selected Item (repeated)
    │
    └── MCP Group
        ├── Group Header (gap: 8px)
        │   ├── Icon: Lucide "plug", 14x14, color #16A34A
        │   ├── Title: Inter 12px, weight 600, color #18181B, "MCP Servers"
        │   └── Count: Inter 12px, weight normal, color #71717A, "(5)"
        │
        └── MCP List (gap: 6px)
            └── Selected Item (repeated)
```

#### 已选项样式 (Selected Item)

```
Selected Item
├── Layout: justify-content: space-between, align-items: center
├── Padding: 10px 12px
├── Background: #FFFFFF
├── Border: 1px solid #E5E5E5
├── Corner Radius: 6px
│
├── Left (gap: 10px)
│   ├── Icon Container
│   │   ├── Size: 24x24px
│   │   ├── Corner Radius: 4px
│   │   ├── Skills: background #F4F4F5, icon color #18181B
│   │   └── MCPs: background #DCFCE7, icon color #16A34A
│   │   └── Icon: 12x12
│   │
│   └── Name: Inter 12px, weight 500, color #18181B
│
└── Remove Button
    ├── Size: 20x20px
    ├── Corner Radius: 4px
    ├── Icon: Lucide "x", 12x12, color #A1A1AA
    └── Hover: background #FEE2E2, icon color #DC2626
```

---

## 六、交互状态说明

### 6.1 Tab 切换

| 状态 | Icon 颜色 | Text 样式 | Border |
|------|-----------|-----------|--------|
| Active | #18181B | 600 weight, #18181B | bottom 2px #18181B |
| Inactive | #71717A | normal weight, #71717A | none |

### 6.2 Checkbox 状态

| 状态 | Background | Border | Icon |
|------|------------|--------|------|
| Unchecked | transparent | 2px #D4D4D4 | none |
| Checked | #18181B | none | check #FFFFFF |

### 6.3 列表项选中状态

| 属性 | 未选中 | 选中 |
|------|--------|------|
| Background | transparent | #FAFAFA |
| Border Color | #E5E5E5 | #18181B |
| Name Weight | 500 | 600 |
| Icon Background | #FAFAFA | #FFFFFF |

### 6.4 按钮 Hover 状态

```
Primary Button (Create Scene)
├── Default: background #18181B
└── Hover: background #27272A

Secondary Button (Cancel)
├── Default: background transparent, border #E5E5E5
└── Hover: background #F4F4F5

Danger Button (Delete)
├── Default: border #FEE2E2, text #DC2626
└── Hover: background #FEE2E2

Remove Icon
├── Default: color #A1A1AA
└── Hover: color #DC2626, container background #FEE2E2
```

---

## 七、颜色系统汇总

### 7.1 文字颜色

| 用途 | 颜色值 |
|------|--------|
| 标题/强调 | #18181B |
| 正文 | #52525B |
| 次要文字 | #71717A |
| 占位符/禁用 | #A1A1AA |
| 极淡文字 | #D4D4D8 |

### 7.2 背景色

| 用途 | 颜色值 |
|------|--------|
| 页面背景 | #FFFFFF |
| 选中项/Hover | #FAFAFA |
| Badge 背景 | #F4F4F5 |
| 成功/MCP 相关 | #DCFCE7 |
| 警告背景 | #FEF3C7 |
| 危险背景 | #FEE2E2 |
| Modal Overlay | #00000066 (40% black) |

### 7.3 边框色

| 用途 | 颜色值 |
|------|--------|
| 默认边框 | #E5E5E5 |
| 分隔线 | #E4E4E7 |
| 选中边框 | #18181B |
| 危险边框 | #FEE2E2 |

### 7.4 功能色

| 用途 | 颜色值 |
|------|--------|
| 成功/Active | #16A34A |
| 警告 | #D97706 |
| 危险/删除 | #DC2626 |

---

## 八、尺寸规范汇总

### 8.1 布局尺寸

| 组件 | 宽度 | 高度 |
|------|------|------|
| Modal Dialog | 1280px | 820px |
| Left Panel | 320px | fill |
| Center Panel | fill_container | fill |
| Right Panel | 320px | fill |
| Modal Header | fill | 64px |
| Filter Row | fill | 40px |

### 8.2 组件尺寸

| 组件 | 高度 | Padding |
|------|------|---------|
| Input | 40px | 0 12px |
| Textarea | 80px | 12px |
| Button (Primary) | 44px | 0 16px |
| Button (Secondary) | 32px | 0 12px |
| Checkbox | 20x20px | - |
| Icon Container (Large) | 36x36px | - |
| Icon Container (Small) | 24x24px | - |

### 8.3 间距规范

| 位置 | Gap/Padding |
|------|-------------|
| Left Content | padding 24px, gap 24px |
| Center Header | padding 16px 24px, gap 16px |
| Center Content | padding 20px, gap 8px |
| Right Content | padding 16px, gap 16px |
| Form Field | gap 6px (label-input) |
| Section | gap 16-20px |
| Item List | gap 6-8px |

---

## 九、Lucide 图标使用

### 9.1 导航图标

| 用途 | 图标名 |
|------|--------|
| Skills | sparkles |
| MCP Servers | plug |
| Scenes | layers |
| Projects | folder |

### 9.2 操作图标

| 用途 | 图标名 |
|------|--------|
| 新建/添加 | plus |
| 关闭 | x |
| 编辑 | pencil |
| 删除 | trash-2 |
| 搜索 | search |
| 下拉 | chevron-down |
| 勾选 | check |
| 全选 | square-check |
| 更多 | ellipsis |

### 9.3 分类图标

| 用途 | 图标名 |
|------|--------|
| 分类 | folder |
| 标签 | tag |
| 代码 | code |
| 数据库 | database |
| 文件 | file-code |

---

## 十、实现注意事项

1. **三栏布局响应式**：中栏使用 `fill_container`，确保在不同宽度下正常伸缩

2. **Checkbox 组件**：需要自定义样式，默认浏览器样式不符合设计要求

3. **Tab 下划线动画**：切换 Tab 时可添加 transition 动画

4. **列表虚拟化**：如果 Skills/MCPs 数量很多，考虑使用虚拟列表

5. **搜索防抖**：搜索输入建议添加 300ms 防抖

6. **键盘导航**：Modal 应支持 ESC 关闭，Tab 键导航

7. **Selected Items 排序**：建议按添加顺序或字母顺序排列

8. **Clear All 确认**：清空所有选择时建议添加确认提示
