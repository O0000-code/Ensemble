# Design Spec Sync - Detail Panel Components

从设计稿 `/Users/bo/Downloads/MCP 管理.pen` 中提取的详细样式规格。

## 1. Category Item (Skill Detail)

**节点 ID:** `wvkyS`
**节点名称:** `Info Item`

### 布局
- **布局方向:** 垂直 (`layout: "vertical"`)
- **Gap 间距:** 8px
- **宽度:** `fill_container` (填充容器宽度)

### 子元素结构

#### 1.1 Label (infoLabel1)
- **类型:** text
- **节点 ID:** `SiUZI`
- **内容:** "Category"
- **字体:** Inter
- **字号:** 11px
- **字重:** 500 (Medium)
- **颜色:** `#71717A` (zinc-500)

#### 1.2 Category Selector
- **类型:** frame
- **节点 ID:** `S5rCh`
- **布局方向:** 水平 (默认)
- **alignItems:** center
- **Gap 间距:** 8px
- **Padding:** `[6, 10]` (上下 6px, 左右 10px)
- **圆角:** 6px
- **边框:** 1px inside `#E5E5E5`

##### 子元素:
1. **catDot** (frame)
   - 尺寸: 8x8px
   - 圆角: 3px
   - 背景色: `#71717A`

2. **catText** (text)
   - 内容: "Design"
   - 字体: Inter, 13px, 500
   - 颜色: `#18181B` (zinc-900)

3. **catChevron** (icon_font)
   - 图标: lucide/chevron-down
   - 尺寸: 14x14px
   - 颜色: `#A1A1AA` (zinc-400)

---

## 2. Tags Item (Skill Detail)

**节点 ID:** `3aXjR`
**节点名称:** `Tags Item`

### 布局
- **布局方向:** 垂直 (`layout: "vertical"`)
- **Gap 间距:** 8px
- **宽度:** `fill_container`

### 子元素结构

#### 2.1 Label (tagsLabel)
- **类型:** text
- **节点 ID:** `lTnaG`
- **内容:** "Tags"
- **字体:** Inter
- **字号:** 11px
- **字重:** 500 (Medium)
- **颜色:** `#71717A`

#### 2.2 Tags Wrap
- **类型:** frame
- **节点 ID:** `ey04Z`
- **布局方向:** 水平 (默认，wrap)
- **Gap 间距:** 8px
- **宽度:** `fill_container`

##### Tag 组件 (可复用)
- **布局:** 水平, alignItems: center
- **Gap 间距:** 6px
- **Padding:** `[6, 10]` (上下 6px, 左右 10px)
- **圆角:** 6px
- **边框:** 1px inside `#E5E5E5`

Tag 子元素:
1. **tagText** (text)
   - 字体: Inter, 12px, 500
   - 颜色: `#18181B`

2. **tagX** (icon_font)
   - 图标: lucide/x
   - 尺寸: 12x12px
   - 颜色: `#A1A1AA`

##### Add Tag 按钮
- **节点 ID:** `m3Sj3`
- **布局:** 水平, alignItems: center
- **Gap 间距:** 4px
- **Padding:** `[6, 10]`
- **圆角:** 6px
- **边框:** 1px inside `#E5E5E5`

子元素:
1. **addIcon** (icon_font)
   - 图标: lucide/plus
   - 尺寸: 12x12px
   - 颜色: `#A1A1AA`

2. **addText** (text)
   - 内容: "Add"
   - 字体: Inter, 12px, 500
   - 颜色: `#A1A1AA`

---

## 3. Detail Header (Skill Detail)

**节点 ID:** `WY86m`
**节点名称:** `Detail Header`

### 布局
- **布局方向:** 水平 (默认)
- **justifyContent:** `space_between`
- **alignItems:** center
- **高度:** 56px
- **宽度:** `fill_container`
- **Padding:** `[0, 28]` (上下 0, 左右 28px)
- **边框:** 1px bottom `#E5E5E5` (仅底部)

### 子元素结构

#### 3.1 Left Section
- **节点 ID:** `4xMvK`
- **布局:** 水平
- **Gap 间距:** 12px
- **alignItems:** center

##### 3.1.1 Icon Container
- **节点 ID:** `FKHzA`
- **类型:** frame
- **尺寸:** 36x36px
- **圆角:** 8px
- **背景色:** `#F4F4F5` (zinc-100)
- **justifyContent:** center
- **alignItems:** center

Icon 子元素:
- 图标: lucide/palette
- 尺寸: 18x18px
- 颜色: `#18181B`

##### 3.1.2 Title Wrap
- **节点 ID:** `ozj5g`
- **布局方向:** 垂直 (`layout: "vertical"`)
- **Gap 间距:** 2px

子元素:
1. **detailTitle4** (text)
   - 内容: "ui-design-expert"
   - 字体: Inter, 16px, 600 (SemiBold)
   - 颜色: `#18181B`

2. **detailSubtitle** (text)
   - 内容: "Design intuitive user interfaces..."
   - 字体: Inter, 12px, normal (400)
   - 颜色: `#71717A`

#### 3.2 Right Section
- **节点 ID:** `XDRXK`
- **布局:** 水平
- **Gap 间距:** 8px
- **alignItems:** center

##### Close Button
- **节点 ID:** `gY79l`
- **尺寸:** 32x32px
- **圆角:** 6px
- **边框:** 1px inside `#E5E5E5`
- **justifyContent:** center
- **alignItems:** center

子元素:
- 图标: lucide/x
- 尺寸: 18x18px
- 颜色: `#71717A`

---

## 4. Detail Content (Skill Detail)

**节点 ID:** `u6jTE`
**节点名称:** `Detail Content`

### 布局
- **布局方向:** 垂直 (`layout: "vertical"`)
- **Gap 间距:** 28px
- **高度:** `fill_container`
- **宽度:** `fill_container`
- **Padding:** `[12, 28, 28, 28]` (top: 12px, right: 28px, bottom: 28px, left: 28px)

### 子元素 Sections

#### 4.1 Info Section
- **节点 ID:** `QMV2U`
- **布局方向:** 垂直
- **Gap 间距:** 16px
- **宽度:** `fill_container`

包含:
- Info Row (水平排列的 Info Items, gap: 32px)
- Category Item (wvkyS)
- Tags Item (3aXjR)

##### Info Row
- **节点 ID:** `NV5If`
- **布局:** 水平
- **Gap 间距:** 32px
- **宽度:** `fill_container`

##### Info Item (通用)
- 布局: 垂直
- Gap: 4px
- 宽度: `fill_container`

#### 4.2 Instructions Section
- **节点 ID:** `uQgpP`
- **布局方向:** 垂直
- **Gap 间距:** 12px
- **宽度:** `fill_container`

子元素:
1. **promptTitle** (text)
   - 内容: "Instructions"
   - 字体: Inter, 14px, 600
   - 颜色: `#18181B`

2. **Instructions Box** (frame)
   - 节点 ID: `IzUVP`
   - 布局: 垂直
   - Gap: 8px
   - Padding: 16px (all sides)
   - 圆角: 8px
   - 背景色: `#FFFFFF`
   - 边框: 1px inside `#E5E5E5`
   - 宽度: `fill_container`

   文本样式:
   - 字体: Inter, 12px, normal
   - 颜色: `#52525B` (zinc-600)
   - 行高: 1.6
   - textGrowth: `fixed-width`

#### 4.3 Configuration Section
- **节点 ID:** `YfOFf`
- **布局方向:** 垂直
- **Gap 间距:** 12px
- **宽度:** `fill_container`

子元素:
1. **configTitle** (text)
   - 内容: "Configuration"
   - 字体: Inter, 14px, 600
   - 颜色: `#18181B`

2. **Config Box** (frame)
   - 节点 ID: `YPldW`
   - 布局: 垂直
   - 圆角: 8px
   - 边框: 1px inside `#E5E5E5`
   - 宽度: `fill_container`

##### Config Item
- 布局: 水平
- Gap: 12px
- Padding: `[12, 14]` (上下 12px, 左右 14px)
- alignItems: center
- 宽度: `fill_container`
- 边框: 1px bottom `#E5E5E5` (非最后一项)

#### 4.4 Source Section
- **节点 ID:** `3guof`
- **布局方向:** 垂直
- **Gap 间距:** 12px
- **宽度:** `fill_container`

子元素:
1. **sourceTitle** (text)
   - 内容: "Source"
   - 字体: Inter, 14px, 600
   - 颜色: `#18181B`

2. **Source Box** (frame)
   - 节点 ID: `1fdGy`
   - 布局: 垂直
   - Gap: 12px
   - Padding: 16px
   - 圆角: 8px
   - 边框: 1px inside `#E5E5E5`
   - 宽度: `fill_container`

##### Source Item
- 布局: 水平
- Gap: 10px
- alignItems: center
- 宽度: `fill_container`

#### 4.5 Scenes Section (Used in Scenes)
- **节点 ID:** `t1s1H`
- **布局方向:** 垂直
- **Gap 间距:** 12px
- **宽度:** `fill_container`

子元素:
1. **scenesTitle** (text)
   - 内容: "Used in Scenes"
   - 字体: Inter, 14px, 600
   - 颜色: `#18181B`

2. **Scenes Grid** (frame)
   - 节点 ID: `JYUdN`
   - 布局: 水平 (wrap)
   - Gap: 8px
   - 宽度: `fill_container`

##### Scene Chip
- 布局: 水平
- Gap: 8px
- Padding: `[8, 14]` (上下 8px, 左右 14px)
- 圆角: 6px
- alignItems: center
- 边框: 1px inside `#E5E5E5`

---

## 5. Detail Header (MCP Detail)

**节点 ID:** `NHemh`
**节点名称:** `Detail Header`

### 布局
- **布局方向:** 水平 (默认)
- **justifyContent:** `space_between`
- **alignItems:** center
- **高度:** 56px
- **宽度:** `fill_container`
- **Padding:** `[0, 28]` (上下 0, 左右 28px)
- **边框:** 1px bottom `#E5E5E5` (仅底部)

### 子元素结构

#### 5.1 Left Section
- **节点 ID:** `Qa8T0`
- **布局:** 水平
- **Gap 间距:** 12px
- **alignItems:** center

##### 5.1.1 Icon Container
- **节点 ID:** `nFvA2`
- **类型:** frame
- **尺寸:** 36x36px
- **圆角:** 8px
- **背景色:** `#F4F4F5` (zinc-100)
- **justifyContent:** center
- **alignItems:** center

Icon 子元素:
- 图标: lucide/folder-open
- 尺寸: 18x18px
- 颜色: `#18181B`

##### 5.1.2 Title Wrap
- **节点 ID:** `P6kwX`
- **布局方向:** 垂直 (`layout: "vertical"`)
- **Gap 间距:** 2px

子元素:
1. **detailTitle4** (text)
   - 内容: "filesystem-mcp"
   - 字体: Inter, 16px, 600 (SemiBold)
   - 颜色: `#18181B`

2. **detailSubtitle** (text)
   - 内容: "File system operations and management"
   - 字体: Inter, 12px, normal (400)
   - 颜色: `#71717A`

#### 5.2 Right Section
- **节点 ID:** `tIbSy`
- **布局:** 水平
- **Gap 间距:** 8px
- **alignItems:** center

##### Close Button
- **节点 ID:** `YIIM8`
- **尺寸:** 32x32px
- **圆角:** 6px
- **边框:** 1px inside `#E5E5E5`
- **justifyContent:** center
- **alignItems:** center

子元素:
- 图标: lucide/x
- 尺寸: 18x18px
- 颜色: `#71717A`

---

## 设计系统颜色参考

| 用途 | 颜色值 | Tailwind 等价 |
|------|--------|---------------|
| 主要文字 | `#18181B` | zinc-900 |
| 次要文字 | `#71717A` | zinc-500 |
| 辅助文字 | `#52525B` | zinc-600 |
| 图标/Placeholder | `#A1A1AA` | zinc-400 |
| 边框 | `#E5E5E5` | neutral-200 |
| 背景(Icon) | `#F4F4F5` | zinc-100 |
| 白色背景 | `#FFFFFF` | white |

## 字体规格汇总

| 用途 | 字号 | 字重 |
|------|------|------|
| Detail Title | 16px | 600 (SemiBold) |
| Section Title | 14px | 600 (SemiBold) |
| 主要文字 | 13px | 500 (Medium) |
| Tag/按钮文字 | 12px | 500 (Medium) |
| 正文/描述 | 12px | 400 (Normal) |
| Label | 11px | 500 (Medium) |

## 间距规格汇总

| 场景 | 间距值 |
|------|--------|
| Section 之间 | 28px |
| Section 内部 (标题与内容) | 12px |
| Info Section 内部 | 16px |
| Info Row 内部 | 32px |
| Label 与控件 | 8px |
| Tag/按钮内部 | 6-8px |
| 容器 Padding (水平) | 28px |
| 容器 Padding (顶部) | 12px |
| 容器 Padding (底部) | 28px |
| Header 高度 | 56px |

---

*文档生成时间: 2026-02-02*
*数据来源: MCP 管理.pen 设计稿*
