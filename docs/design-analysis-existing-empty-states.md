# 现有空状态页面设计分析

## 1. 概述

本文档分析了 Ensemble 应用中现有的三个空状态页面设计，并与新的 Category/Tag 空状态进行对比，以确保设计一致性。

### 分析的页面

| 页面名称 | 节点 ID | 用途 |
|---------|--------|------|
| Skills Empty | `DqVji` | Skills 列表为空时显示 |
| MCP Servers Empty | `h1E7V` | MCP Servers 列表为空时显示 |
| Scenes Empty | `v7TIk` | Scenes 列表为空时显示 |

### 新增的空状态页面

| 页面名称 | 节点 ID | 用途 |
|---------|--------|------|
| Category Empty | `ytMhv` | 按 Category 筛选结果为空时显示 |
| Tag Empty | `ZIFP8` | 按 Tag 筛选结果为空时显示 |

---

## 2. 现有空状态设计结构分析

### 2.1 Skills Empty (`DqVji`)

**整体布局**：
- 页面尺寸：1440 × 900px
- 采用左侧边栏 + 右侧主内容区的双栏布局
- 侧边栏宽度：260px
- 主内容区使用 flexbox 垂直居中

**空状态组件结构**：
```
Empty State (id: 6IMPH)
├── Graphic Group (id: mbK2i) - 32×32px
│   ├── V Line - 垂直线，stroke #D4D4D8, 1.5px
│   ├── H Line - 水平线，stroke #D4D4D8, 1.5px
│   ├── D1 Line - 对角线1，stroke #D4D4D8, 1.5px
│   └── D2 Line - 对角线2，stroke #D4D4D8, 1.5px
└── Text Group (id: Dh4vo)
    ├── emptyTitle - "No skills"
    └── emptyDesc - "Add your first skill to get started"
```

**图标设计**：
- 十字星形图案（由4条线组成：垂直线、水平线、两条对角线）
- 所有线条：stroke #D4D4D8, thickness 1.5px
- 图形尺寸：32×32px

**文字样式**：
- 标题：
  - 内容："No skills"
  - 字体：Inter, 14px, weight 500
  - 颜色：#A1A1AA
  - letter-spacing: -0.2px
- 描述：
  - 内容："Add your first skill to get started"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - textAlign: center

**间距**：
- 图标与文字组间距：20px (gap)
- 标题与描述间距：6px (gap)

---

### 2.2 MCP Servers Empty (`h1E7V`)

**空状态组件结构**：
```
Empty State (id: m7zHO)
├── Graphic Group (id: lZPPZ) - 56×24px
│   ├── Circle Left - 实心圆，fill #D4D4D8, 12×12px
│   ├── Circle Right - 空心圆，stroke #D4D4D8, 1.5px, 12×12px
│   └── Line - 连接线，stroke #D4D4D8, 1.5px, 24px宽
└── Text Group (id: PXET6)
    ├── emptyTitle - "No MCP servers"
    └── emptyDesc - "Add servers to extend capabilities"
```

**图标设计**：
- 连接图案（两个圆形通过线条连接）
- 左侧圆：实心，fill #D4D4D8, 12×12px
- 右侧圆：空心，stroke #D4D4D8, 1.5px, 12×12px
- 连接线：stroke #D4D4D8, 1.5px, 24px宽
- 图形尺寸：56×24px

**文字样式**：
- 标题：
  - 内容："No MCP servers"
  - 字体：Inter, 14px, weight 500
  - 颜色：#A1A1AA
  - letter-spacing: -0.2px
- 描述：
  - 内容："Add servers to extend capabilities"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - textAlign: center

**间距**：
- 图标与文字组间距：20px
- 标题与描述间距：6px

---

### 2.3 Scenes Empty (`v7TIk`)

**空状态组件结构**：
```
Empty State (id: rYzRQ)
├── Graphic Group (id: 0FVxL) - 40×32px
│   ├── Rect Back - 最后层，stroke #E4E4E7, 1.5px, cornerRadius 3
│   ├── Rect Mid - 中间层，stroke #D4D4D8, 1.5px, cornerRadius 3
│   └── Rect Front - 最前层，stroke #A1A1AA, 1.5px, cornerRadius 3
└── Text Group (id: BBzpo)
    ├── emptyTitle - "No scenes"
    └── emptyDesc - "Create a scene to bundle configurations"
```

**图标设计**：
- 堆叠矩形图案（3层圆角矩形，产生层叠效果）
- 最后层（Rect Back）：24×18px, stroke #E4E4E7, 1.5px, cornerRadius 3, 位置 (16, 14)
- 中间层（Rect Mid）：24×18px, stroke #D4D4D8, 1.5px, cornerRadius 3, 位置 (8, 7)
- 最前层（Rect Front）：24×18px, stroke #A1A1AA, 1.5px, cornerRadius 3, 位置 (0, 0)
- 图形容器尺寸：40×32px

**文字样式**：
- 标题：
  - 内容："No scenes"
  - 字体：Inter, 14px, weight 500
  - 颜色：#A1A1AA
  - letter-spacing: -0.2px
- 描述：
  - 内容："Create a scene to bundle configurations"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - textAlign: center

**间距**：
- 图标与文字组间距：20px
- 标题与描述间距：6px

---

## 3. 新增空状态设计分析

### 3.1 Category Empty (`ytMhv`)

**空状态组件结构**：
```
Empty State (id: Rde8M)
├── Graphic Group (id: n3kkU) - 44×32px
│   ├── Card Back - 最后层卡片，stroke #E4E4E7, 1.5px, 36×22px, cornerRadius 4
│   ├── Card Mid - 中间层卡片，fill #FFFFFF, stroke #D4D4D8, 1.5px, 36×22px, cornerRadius 4
│   ├── Card Front - 最前层卡片，fill #FFFFFF, stroke #A1A1AA, 1.5px, 36×22px, cornerRadius 4
│   ├── Content Line 1 - 内容线1，stroke #D4D4D8, 1.5px, 16px宽, round cap
│   └── Content Line 2 - 内容线2，stroke #E4E4E7, 1.5px, 10px宽, round cap
└── Text Group (id: wMMi5)
    ├── emptyTitle - "No items in this category"
    └── emptyDesc - "Try selecting a different category or add items to this one"
```

**图标设计**：
- 堆叠卡片设计（3层圆角矩形 + 2条内容暗示线）
- 卡片尺寸：36×22px
- 最后层：stroke #E4E4E7, 位置 (8, 10)
- 中间层：fill #FFFFFF, stroke #D4D4D8, 位置 (4, 5)
- 最前层：fill #FFFFFF, stroke #A1A1AA, 位置 (0, 0)
- 内容线1：16px宽，stroke #D4D4D8, 1.5px, round cap, 位置 (6, 7)
- 内容线2：10px宽，stroke #E4E4E7, 1.5px, round cap, 位置 (6, 12)
- 图形容器尺寸：44×32px

**Header 特殊处理**：
- 显示当前 Category 名称（如 "Development"）
- Status Badge（绿色启用状态标签）设置 `enabled: false`，需要隐藏

**文字样式**：
- 标题：
  - 内容："No items in this category"
  - 字体：Inter, 14px, weight 500
  - 颜色：#A1A1AA
  - letter-spacing: -0.2px
- 描述：
  - 内容："Try selecting a different category or add items to this one"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - textAlign: center

---

### 3.2 Tag Empty (`ZIFP8`)

**空状态组件结构**：
```
Empty State (id: GXyDc)
├── Graphic Group (id: bdy0p) - 44×32px
│   ├── Label Back - 最后层标签，stroke #E4E4E7, 1.5px, 30×16px, cornerRadius [8,4,4,8]
│   ├── Hole Back - 最后层小孔，fill #E4E4E7, 4×4px
│   ├── Label Mid - 中间层标签，fill #FFFFFF, stroke #D4D4D8, 1.5px, 30×16px, cornerRadius [8,4,4,8]
│   ├── Hole Mid - 中间层小孔，fill #D4D4D8, 4×4px
│   ├── Label Front - 最前层标签，fill #FFFFFF, stroke #A1A1AA, 1.5px, 30×16px, cornerRadius [8,4,4,8]
│   └── Hole Front - 最前层小孔，fill #A1A1AA, 4×4px
└── Text Group (id: dMsV6)
    ├── emptyTitle - "No items with this tag"
    └── emptyDesc - "Try selecting a different tag or add this tag to some items"
```

**图标设计**：
- 经典标签形态（3层带小孔的标签形状）
- 标签尺寸：30×16px
- 圆角：[8, 4, 4, 8]（左侧更圆，形成标签造型）
- 小孔尺寸：4×4px 圆形
- 最后层：stroke #E4E4E7, 小孔 fill #E4E4E7, 位置 (14, 16)
- 中间层：fill #FFFFFF, stroke #D4D4D8, 小孔 fill #D4D4D8, 位置 (7, 8)
- 最前层：fill #FFFFFF, stroke #A1A1AA, 小孔 fill #A1A1AA, 位置 (0, 0)
- 图形容器尺寸：44×32px

**Header 特殊处理**：
- 显示当前 Tag 名称（如 "React"）
- Status Badge（绿色启用状态标签）设置 `enabled: false`，需要隐藏

**文字样式**：
- 标题：
  - 内容："No items with this tag"
  - 字体：Inter, 14px, weight 500
  - 颜色：#A1A1AA
  - letter-spacing: -0.2px
- 描述：
  - 内容："Try selecting a different tag or add this tag to some items"
  - 字体：Inter, 13px, weight normal
  - 颜色：#D4D4D8
  - textAlign: center

---

## 4. 设计模式总结

### 4.1 通用设计模式

所有空状态页面遵循相同的设计模式：

| 属性 | 值 |
|-----|-----|
| 布局 | flexbox 垂直水平居中 |
| 图标与文字间距 | 20px |
| 标题与描述间距 | 6px |
| 标题字体 | Inter, 14px, weight 500, letter-spacing -0.2px |
| 标题颜色 | #A1A1AA |
| 描述字体 | Inter, 13px, weight normal |
| 描述颜色 | #D4D4D8 |
| 描述对齐 | center |

### 4.2 图标颜色系统

所有空状态图标都使用三层渐进色彩：

| 层级 | 用途 | 颜色 |
|-----|------|------|
| 最后层 | 最远/最淡 | #E4E4E7 |
| 中间层 | 中等 | #D4D4D8 |
| 最前层 | 最近/最深 | #A1A1AA |

### 4.3 图标线条规范

| 属性 | 值 |
|-----|-----|
| 线条粗细 | 1.5px |
| 线条端点 | round cap（适用时） |
| 填充色（需要时） | #FFFFFF |

---

## 5. 异同点对比

### 5.1 相同点

1. **布局结构**：所有空状态都使用相同的垂直居中布局
2. **文字样式**：标题和描述的字体、大小、颜色完全一致
3. **间距规范**：图标-文字间距（20px）和标题-描述间距（6px）统一
4. **颜色系统**：图标使用相同的三层灰度色系
5. **线条规范**：统一使用 1.5px 粗细的线条

### 5.2 不同点

| 方面 | 现有空状态 | 新 Category/Tag 空状态 |
|-----|-----------|---------------------|
| 图标语义 | 抽象图形（十字、连接线、堆叠矩形） | 具象图形（卡片列表、标签形状） |
| Header | 仅显示页面标题 | 显示筛选名称 + 需隐藏 Status Badge |
| 文案风格 | 添加引导（"Add your first..."） | 替代引导（"Try selecting a different..."） |
| 图标复杂度 | 相对简单 | 更复杂（多层元素 + 细节） |

### 5.3 特殊处理

**Category/Tag 空状态的特殊需求**：
1. Header 中的绿色 Status Badge 需要隐藏（设计稿中 `enabled: false`）
2. Header 标题需要动态显示当前选中的 Category 或 Tag 名称
3. 描述文案提供替代方案建议，而非添加新内容的引导

---

## 6. 可复用的设计元素

### 6.1 组件级复用

1. **Text Group 组件**：
   - 标题 + 描述的组合可抽象为通用组件
   - props: `title`, `description`
   - 样式完全统一，可直接复用

2. **Empty State 容器**：
   - 居中布局的容器可复用
   - gap: 20px（图标与文字间距）

### 6.2 样式级复用

```css
/* 标题样式 */
.empty-state-title {
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.2px;
  color: #A1A1AA;
}

/* 描述样式 */
.empty-state-description {
  font-family: Inter;
  font-size: 13px;
  font-weight: 400;
  color: #D4D4D8;
  text-align: center;
}

/* 容器样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.empty-state-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
```

### 6.3 图标颜色 Token

```typescript
const emptyStateColors = {
  layer1: '#E4E4E7', // 最后层
  layer2: '#D4D4D8', // 中间层
  layer3: '#A1A1AA', // 最前层
  fill: '#FFFFFF',   // 填充色
};
```

---

## 7. 设计一致性要点

### 7.1 必须遵循的规范

1. **颜色精确匹配**：
   - 标题：#A1A1AA
   - 描述：#D4D4D8
   - 图标三层色：#E4E4E7, #D4D4D8, #A1A1AA

2. **字体精确匹配**：
   - 字体家族：Inter
   - 标题：14px, 500, -0.2px letter-spacing
   - 描述：13px, normal

3. **间距精确匹配**：
   - 图标-文字：20px
   - 标题-描述：6px

4. **线条精确匹配**：
   - 粗细：1.5px
   - 端点：round（适用时）

### 7.2 注意事项

1. **Header 处理**：Category/Tag 空状态需要隐藏 Status Badge
2. **图标绘制**：使用 SVG 或自定义组件绘制，确保尺寸和位置精确
3. **响应式**：内容区域使用 flexbox 居中，适应不同屏幕尺寸
4. **无障碍**：确保对比度符合 WCAG 标准

---

## 8. 附录：图标 SVG 参考

### 8.1 Category 空状态图标

```svg
<svg width="44" height="32" viewBox="0 0 44 32" fill="none">
  <!-- 最后层卡片 -->
  <rect x="8" y="10" width="36" height="22" rx="4" stroke="#E4E4E7" stroke-width="1.5"/>
  <!-- 中间层卡片 -->
  <rect x="4" y="5" width="36" height="22" rx="4" fill="white" stroke="#D4D4D8" stroke-width="1.5"/>
  <!-- 最前层卡片 -->
  <rect x="0" y="0" width="36" height="22" rx="4" fill="white" stroke="#A1A1AA" stroke-width="1.5"/>
  <!-- 内容线1 -->
  <line x1="6" y1="7" x2="22" y2="7" stroke="#D4D4D8" stroke-width="1.5" stroke-linecap="round"/>
  <!-- 内容线2 -->
  <line x1="6" y1="12" x2="16" y2="12" stroke="#E4E4E7" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

### 8.2 Tag 空状态图标

```svg
<svg width="44" height="32" viewBox="0 0 44 32" fill="none">
  <!-- 最后层标签 -->
  <rect x="14" y="16" width="30" height="16" rx="8" ry="4" stroke="#E4E4E7" stroke-width="1.5"/>
  <circle cx="19" cy="24" r="2" fill="#E4E4E7"/>
  <!-- 中间层标签 -->
  <rect x="7" y="8" width="30" height="16" rx="8" ry="4" fill="white" stroke="#D4D4D8" stroke-width="1.5"/>
  <circle cx="12" cy="16" r="2" fill="#D4D4D8"/>
  <!-- 最前层标签 -->
  <rect x="0" y="0" width="30" height="16" rx="8" ry="4" fill="white" stroke="#A1A1AA" stroke-width="1.5"/>
  <circle cx="5" cy="8" r="2" fill="#A1A1AA"/>
</svg>
```

---

## 9. 总结

本分析文档详细记录了 Ensemble 应用中现有空状态页面的设计规范，以及新增的 Category/Tag 空状态设计。关键发现：

1. **高度一致性**：所有空状态遵循统一的设计语言
2. **语义化图标**：每种空状态使用与其内容相关的图标
3. **三层色彩系统**：图标使用渐进式灰度色彩创造层次感
4. **可复用性高**：文字样式、间距规范可直接复用

实现时应严格遵循这些规范，确保新增的 Category/Tag 空状态与现有设计保持一致。
