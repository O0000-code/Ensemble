# 设计分析文档：Category/Tag 空状态

> 本文档由 SubAgent 1 生成，基于设计稿 `/Users/bo/Downloads/MCP 管理.pen` 的详细分析

## 1. Category 空状态

### 1.1 页面概览

- **节点 ID**: `ytMhv`
- **名称**: `Ensemble - Skills (Filtered by Category, Empty)`
- **页面尺寸**: 1440 x 900 px
- **背景色**: #FFFFFF

### 1.2 页面结构

页面由两个主要区域组成：
1. **Sidebar** (宽度: 260px) - 左侧导航栏
2. **Main Content** - 右侧主内容区

### 1.3 Main Header 区域

- **高度**: 56px
- **内边距**: padding: 0 28px
- **下边框**: stroke #E5E5E5, 1px (bottom only)
- **布局**: 水平分布 (space_between)

#### Header Left
- **节点 ID**: `RMDiU`
- **布局**: 水平排列, gap: 20px

**页面标题 (pageTitle)**:
- 节点 ID: `oTE1X`
- 内容: "Development"
- 字体: Inter, 16px, weight 600
- 颜色: #18181B

**Status Badge**:
- 节点 ID: `yl1QJ`
- **enabled 属性**: `false` (已禁用/隐藏)
- 背景: #DCFCE7
- 圆角: 4px
- 内边距: padding: 4px 8px
- gap: 4px
- 包含:
  - statusDot: 6x6px 圆角矩形, 圆角 3px, 背景 #DCFCE7
  - statusText: "42 enabled", 字体 Inter 11px weight 500, 颜色 #16A34A

### 1.4 Content Area (空状态区域)

- **节点 ID**: `hpoyD`
- **布局**: vertical, alignItems: center, justifyContent: center
- **尺寸**: width: fill_container, height: fill_container
- **内边距**: padding: 24px 28px
- **gap**: 16px

### 1.5 Empty State 组件

- **节点 ID**: `Rde8M`
- **布局**: vertical, alignItems: center
- **gap**: 20px (图标与文字组之间)

#### 1.5.1 Graphic Group (图标)

- **节点 ID**: `n3kkU`
- **尺寸**: 44 x 32 px
- **布局**: none (绝对定位)

**设计概念**: 堆叠卡片效果，3层圆角矩形 + 2条内容暗示线

**Card Back (最后层)**:
- 节点 ID: `jk9Wp`
- 位置: x: 8, y: 10
- 尺寸: 36 x 22 px
- 圆角: 4px
- 填充: 无 (透明)
- 边框: stroke #E4E4E7, 1.5px, align: center

**Card Mid (中间层)**:
- 节点 ID: `IiNtx`
- 位置: x: 4, y: 5
- 尺寸: 36 x 22 px
- 圆角: 4px
- 填充: #FFFFFF
- 边框: stroke #D4D4D8, 1.5px, align: center

**Card Front (最前层)**:
- 节点 ID: `jEtcm`
- 位置: x: 0, y: 0
- 尺寸: 36 x 22 px
- 圆角: 4px
- 填充: #FFFFFF
- 边框: stroke #A1A1AA, 1.5px, align: center

**Content Line 1 (内容暗示线 1)**:
- 节点 ID: `dD6rd`
- 类型: line
- 位置: x: 6, y: 7
- 尺寸: 16 x 0 px (水平线)
- 边框: stroke #D4D4D8, 1.5px, cap: round, align: center

**Content Line 2 (内容暗示线 2)**:
- 节点 ID: `4X7dx`
- 类型: line
- 位置: x: 6, y: 12
- 尺寸: 10 x 0 px (水平线)
- 边框: stroke #E4E4E7, 1.5px, cap: round, align: center

#### 1.5.2 Text Group (文字组)

- **节点 ID**: `wMMi5`
- **布局**: vertical, alignItems: center
- **gap**: 6px

**Empty Title (标题)**:
- 节点 ID: `ChK8i`
- 内容: "No items in this category"
- 字体: Inter
- 字号: 14px
- 字重: 500 (medium)
- 字间距: -0.2px
- 颜色: #A1A1AA

**Empty Description (描述)**:
- 节点 ID: `hkraJ`
- 内容: "Try selecting a different category or add items to this one"
- 字体: Inter
- 字号: 13px
- 字重: normal (400)
- 文字对齐: center
- 颜色: #D4D4D8

---

## 2. Tag 空状态

### 2.1 页面概览

- **节点 ID**: `ZIFP8`
- **名称**: `Ensemble - Skills (Filtered by Tag, Empty)`
- **页面尺寸**: 1440 x 900 px
- **背景色**: #FFFFFF

### 2.2 页面结构

与 Category 空状态相同的结构：
1. **Sidebar** (宽度: 260px) - 左侧导航栏
2. **Main Content** - 右侧主内容区

### 2.3 Main Header 区域

- **高度**: 56px
- **内边距**: padding: 0 28px
- **下边框**: stroke #E5E5E5, 1px (bottom only)
- **布局**: 水平分布 (space_between)

#### Header Left
- **节点 ID**: `DR3Eb`
- **布局**: 水平排列, gap: 20px

**页面标题 (pageTitle)**:
- 节点 ID: `5GRK4`
- 内容: "React" (示例 Tag 名称)
- 字体: Inter, 16px, weight 600
- 颜色: #18181B

**Status Badge**:
- 节点 ID: `ZA88C`
- **enabled 属性**: `false` (已禁用/隐藏)
- 背景: #DCFCE7
- 圆角: 4px
- 内边距: padding: 4px 8px
- gap: 4px
- 包含:
  - statusDot: 6x6px 圆角矩形, 圆角 3px, 背景 #DCFCE7
  - statusText: "42 enabled", 字体 Inter 11px weight 500, 颜色 #16A34A

### 2.4 Content Area (空状态区域)

- **节点 ID**: `tamod`
- **布局**: vertical, alignItems: center, justifyContent: center
- **尺寸**: width: fill_container, height: fill_container
- **内边距**: padding: 24px 28px
- **gap**: 16px

### 2.5 Empty State 组件

- **节点 ID**: `GXyDc`
- **布局**: vertical, alignItems: center
- **gap**: 20px (图标与文字组之间)

#### 2.5.1 Graphic Group (图标)

- **节点 ID**: `bdy0p`
- **尺寸**: 44 x 32 px
- **布局**: none (绝对定位)

**设计概念**: 堆叠标签效果，3层带小孔的标签形状

**Label Back (最后层)**:
- 节点 ID: `R5FBl`
- 位置: x: 14, y: 16
- 尺寸: 30 x 16 px
- 圆角: [8, 4, 4, 8] (左上、右上、右下、左下)
- 填充: 无 (透明)
- 边框: stroke #E4E4E7, 1.5px, align: center

**Hole Back (最后层小孔)**:
- 节点 ID: `Yq8mm`
- 类型: ellipse (圆形)
- 位置: x: 17, y: 22
- 尺寸: 4 x 4 px
- 填充: #E4E4E7

**Label Mid (中间层)**:
- 节点 ID: `wjLFP`
- 位置: x: 7, y: 8
- 尺寸: 30 x 16 px
- 圆角: [8, 4, 4, 8]
- 填充: #FFFFFF
- 边框: stroke #D4D4D8, 1.5px, align: center

**Hole Mid (中间层小孔)**:
- 节点 ID: `v67Wg`
- 类型: ellipse (圆形)
- 位置: x: 10, y: 14
- 尺寸: 4 x 4 px
- 填充: #D4D4D8

**Label Front (最前层)**:
- 节点 ID: `7PkEQ`
- 位置: x: 0, y: 0
- 尺寸: 30 x 16 px
- 圆角: [8, 4, 4, 8]
- 填充: #FFFFFF
- 边框: stroke #A1A1AA, 1.5px, align: center

**Hole Front (最前层小孔)**:
- 节点 ID: `Ks0xn`
- 类型: ellipse (圆形)
- 位置: x: 3, y: 6
- 尺寸: 4 x 4 px
- 填充: #A1A1AA

#### 2.5.2 Text Group (文字组)

- **节点 ID**: `dMsV6`
- **布局**: vertical, alignItems: center
- **gap**: 6px

**Empty Title (标题)**:
- 节点 ID: `i5bzp`
- 内容: "No items with this tag"
- 字体: Inter
- 字号: 14px
- 字重: 500 (medium)
- 字间距: -0.2px
- 颜色: #A1A1AA

**Empty Description (描述)**:
- 节点 ID: `yTRAW`
- 内容: "Try selecting a different tag or add this tag to some items"
- 字体: Inter
- 字号: 13px
- 字重: normal (400)
- 文字对齐: center
- 颜色: #D4D4D8

---

## 3. 设计规范汇总

### 3.1 颜色规范

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 图标边框 - 最后层 | #E4E4E7 | 最浅灰色 |
| 图标边框 - 中间层 | #D4D4D8 | 中等灰色 |
| 图标边框 - 最前层 | #A1A1AA | 较深灰色 |
| 图标填充 | #FFFFFF | 白色 |
| 标题文字 | #A1A1AA | 较深灰色 |
| 描述文字 | #D4D4D8 | 中等灰色 |
| 页面标题 | #18181B | 接近黑色 |

### 3.2 字体规范

| 元素 | 字体 | 字号 | 字重 | 字间距 | 对齐 |
|------|------|------|------|--------|------|
| 标题 | Inter | 14px | 500 | -0.2px | center |
| 描述 | Inter | 13px | normal | - | center |
| 页面标题 | Inter | 16px | 600 | - | left |

### 3.3 间距规范

| 位置 | 数值 |
|------|------|
| 图标与文字组之间 | 20px |
| 标题与描述之间 | 6px |
| Content Area 内边距 | 24px 28px |
| Header 内边距 | 0 28px |

### 3.4 尺寸规范

| 元素 | 尺寸 |
|------|------|
| Category 图标容器 | 44 x 32 px |
| Category 卡片 | 36 x 22 px |
| Tag 图标容器 | 44 x 32 px |
| Tag 标签形状 | 30 x 16 px |
| Tag 小孔 | 4 x 4 px |
| Header 高度 | 56px |

---

## 4. SVG 代码参考

### 4.1 Category 空状态图标 SVG

```svg
<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Back (最后层) -->
  <rect x="8.75" y="10.75" width="34.5" height="20.5" rx="3.25" stroke="#E4E4E7" stroke-width="1.5"/>

  <!-- Card Mid (中间层) -->
  <rect x="4.75" y="5.75" width="34.5" height="20.5" rx="3.25" fill="white" stroke="#D4D4D8" stroke-width="1.5"/>

  <!-- Card Front (最前层) -->
  <rect x="0.75" y="0.75" width="34.5" height="20.5" rx="3.25" fill="white" stroke="#A1A1AA" stroke-width="1.5"/>

  <!-- Content Line 1 -->
  <line x1="6" y1="7" x2="22" y2="7" stroke="#D4D4D8" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Content Line 2 -->
  <line x1="6" y1="12" x2="16" y2="12" stroke="#E4E4E7" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### 4.2 Tag 空状态图标 SVG

```svg
<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Label Back (最后层) -->
  <rect x="14.75" y="16.75" width="28.5" height="14.5" rx="4" ry="4" stroke="#E4E4E7" stroke-width="1.5"
        style="border-radius: 8px 4px 4px 8px;"/>
  <!-- Hole Back -->
  <circle cx="19" cy="24" r="2" fill="#E4E4E7"/>

  <!-- Label Mid (中间层) -->
  <rect x="7.75" y="8.75" width="28.5" height="14.5" fill="white" stroke="#D4D4D8" stroke-width="1.5"
        style="border-radius: 8px 4px 4px 8px;"/>
  <!-- Hole Mid -->
  <circle cx="12" cy="16" r="2" fill="#D4D4D8"/>

  <!-- Label Front (最前层) -->
  <rect x="0.75" y="0.75" width="28.5" height="14.5" fill="white" stroke="#A1A1AA" stroke-width="1.5"
        style="border-radius: 8px 4px 4px 8px;"/>
  <!-- Hole Front -->
  <circle cx="5" cy="8" r="2" fill="#A1A1AA"/>
</svg>
```

**注意**: Tag 图标使用不对称圆角 `[8, 4, 4, 8]`，表示左上角和左下角圆角较大 (8px)，右上角和右下角圆角较小 (4px)。这在 SVG 中需要使用 path 元素才能精确实现。

---

## 5. 重要实现细节

### 5.1 Status Badge 隐藏

在空状态下，Header 中的绿色 Status Badge (`enabled: false`) 应该被隐藏。这通过 `enabled: false` 属性控制。

代码实现时需要:
- 当显示空状态时，不渲染 Status Badge
- 或者使用条件渲染: `{!isEmpty && <StatusBadge />}`

### 5.2 布局居中

空状态组件需要在内容区域中垂直和水平居中:
- 使用 `flex` 布局
- `alignItems: center` (水平居中)
- `justifyContent: center` (垂直居中)

### 5.3 两种空状态的区别

| 特性 | Category 空状态 | Tag 空状态 |
|------|----------------|-----------|
| 图标设计 | 堆叠卡片 (方形) | 堆叠标签 (带小孔) |
| 标题文案 | "No items in this category" | "No items with this tag" |
| 描述文案 | "Try selecting a different category or add items to this one" | "Try selecting a different tag or add this tag to some items" |

### 5.4 侧边栏选中状态示例

在设计稿中：
- **Category 空状态页面**: 侧边栏的 "Development" category 显示选中状态 (fill: #F4F4F5)
- **Tag 空状态页面**: 侧边栏的 "React" tag 显示选中状态 (fill: #F4F4F5)

---

## 6. 待补充信息

1. 确认 Tag 图标的不对称圆角在 React + Tailwind 中的最佳实现方式
2. 确认现有代码库中是否有可复用的图标组件
3. 确认 Status Badge 隐藏的具体逻辑条件
