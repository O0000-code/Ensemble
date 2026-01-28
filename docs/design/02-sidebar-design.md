# Sidebar 组件设计规范

## 一、整体结构

```
Sidebar (260px)
├── Sidebar Header (56px)
│   ├── Logo (24x24)
│   └── App Name "Ensemble"
├── Sidebar Content (fill_container, padding: 16px 16px 8px 16px)
│   ├── Top Content (gap: 24px)
│   │   ├── Nav Section (gap: 2px)
│   │   │   ├── Nav Item - Skills
│   │   │   ├── Nav Item - MCP Servers
│   │   │   ├── Nav Item - Scenes
│   │   │   └── Nav Item - Projects
│   │   ├── Divider
│   │   ├── Categories Section (gap: 12px)
│   │   │   ├── Section Header
│   │   │   └── Categories List (gap: 2px)
│   │   ├── Divider
│   │   └── Tags Section (gap: 12px)
│   │       ├── Section Header
│   │       └── Tags Grid (wrap, gap: 6px)
│   └── Sidebar Footer
│       └── Settings Button
└── Right Border (1px)
```

---

## 二、Sidebar Container

```css
.sidebar {
  width: 260px;
  height: fill_container;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
}
```

| 属性 | 值 |
|------|-----|
| 宽度 | 260px |
| 高度 | fill_container (100%) |
| 背景色 | #FFFFFF |
| 右边框 | 1px solid #E5E5E5 |
| 布局 | vertical (flex-direction: column) |

---

## 三、Sidebar Header (Logo 区域)

```css
.sidebar-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #E5E5E5;
}
```

### 3.1 Logo 图标

```css
.logo {
  width: 24px;
  height: 24px;
  background-color: #18181B;
  border-radius: 6px;
}

/* Logo 内部图形均为白色 #FFFFFF */
.logo-triangle {
  stroke: #FFFFFF;
  stroke-width: 0.4px;
  fill: transparent;
}

.logo-hexagon,
.logo-circle,
.logo-square {
  fill: #FFFFFF;
}
```

| 属性 | 值 |
|------|-----|
| 尺寸 | 24 x 24 px |
| 背景色 | #18181B |
| 圆角 | 6px |
| 内部图形颜色 | #FFFFFF |

### 3.2 App Name

```css
.app-name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #18181B;
  letter-spacing: -0.3px;
}
```

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 14px |
| 字重 | 600 (SemiBold) |
| 颜色 | #18181B |
| 字间距 | -0.3px |

---

## 四、Sidebar Content

```css
.sidebar-content {
  flex: 1;
  padding: 16px 16px 8px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
}
```

| 属性 | 值 |
|------|-----|
| Padding Top | 16px |
| Padding Right | 16px |
| Padding Bottom | 8px |
| Padding Left | 16px |
| Gap (主要区块间) | 24px |
| 布局 | space-between (Top Content 与 Footer 分开) |

---

## 五、Navigation Section

### 5.1 Nav Section Container

```css
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

### 5.2 Navigation Item - Normal 状态

```css
.nav-item {
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.nav-item-icon {
  width: 16px;
  height: 16px;
  color: #71717A;
}

.nav-item-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400; /* normal */
  color: #71717A;
}

.nav-item-count {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #A1A1AA;
}
```

| 属性 | Normal 状态 |
|------|-------------|
| 高度 | 36px |
| Padding | 0 10px |
| 圆角 | 6px |
| Gap | 10px |
| 背景色 | transparent |
| 边框 | none |
| 图标尺寸 | 16 x 16 px |
| 图标颜色 | #71717A |
| 文字字号 | 13px |
| 文字字重 | 400 (normal) |
| 文字颜色 | #71717A |
| 计数字号 | 11px |
| 计数字重 | 500 |
| 计数颜色 | #A1A1AA |

### 5.3 Navigation Item - Active 状态

```css
.nav-item.active {
  background-color: #FFFFFF;
  border: 1px solid #E5E5E5;
}

.nav-item.active .nav-item-icon {
  color: #18181B;
}

.nav-item.active .nav-item-label {
  font-weight: 500;
  color: #18181B;
}
```

| 属性 | Active 状态 |
|------|-------------|
| 背景色 | #FFFFFF |
| 边框 | 1px solid #E5E5E5 |
| 图标颜色 | #18181B |
| 文字字重 | 500 (medium) |
| 文字颜色 | #18181B |
| 计数颜色 | #A1A1AA (不变) |

### 5.4 Navigation Icons (Lucide)

| 导航项 | 图标名称 |
|--------|----------|
| Skills | sparkles |
| MCP Servers | plug |
| Scenes | layers |
| Projects | folder |

---

## 六、Divider (分割线)

```css
.divider {
  width: 100%;
  height: 1px;
  background-color: #E4E4E7;
}
```

| 属性 | 值 |
|------|-----|
| 宽度 | 100% (fill_container) |
| 高度 | 1px |
| 颜色 | #E4E4E7 |

---

## 七、Categories Section

### 7.1 Section Header

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #A1A1AA;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.section-add-icon {
  width: 12px;
  height: 12px;
  color: #A1A1AA;
  cursor: pointer;
}
```

| 属性 | 值 |
|------|-----|
| 标题字体 | Inter |
| 标题字号 | 10px |
| 标题字重 | 600 (SemiBold) |
| 标题颜色 | #A1A1AA |
| 标题字间距 | 0.8px |
| 标题大写 | uppercase |
| Add 图标 | plus (Lucide) |
| Add 图标尺寸 | 12 x 12 px |
| Add 图标颜色 | #A1A1AA |

### 7.2 Categories List

```css
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

### 7.3 Category Item - Normal 状态

```css
.category-item {
  height: 32px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  /* 颜色根据分类不同而变化 */
}

.category-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400; /* normal */
  color: #52525B;
}

.category-count {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #A1A1AA;
}
```

| 属性 | Normal 状态 |
|------|-------------|
| 高度 | 32px |
| Padding | 0 10px |
| 圆角 | 6px |
| Gap | 10px |
| 背景色 | transparent |
| 圆点尺寸 | 8 x 8 px |
| 圆点圆角 | 4px (完全圆形) |
| 文字字号 | 13px |
| 文字字重 | 400 (normal) |
| 文字颜色 | #52525B |
| 计数字号 | 11px |
| 计数字重 | 500 |
| 计数颜色 | #A1A1AA |

### 7.4 Category Item - Active 状态

```css
.category-item.active {
  background-color: #F4F4F5;
}
```

| 属性 | Active 状态 |
|------|-------------|
| 背景色 | #F4F4F5 |
| 其他样式 | 不变 |

### 7.5 Category Dot 颜色

| 分类 | 圆点颜色 |
|------|----------|
| Development | #18181B |
| Design | #71717A |
| Research | #71717A |
| Productivity | #DCFCE7 (浅绿) |
| Uncategorized | #71717A |

---

## 八、Tags Section

### 8.1 Section Header

与 Categories Section Header 相同:

```css
.tags-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-title {
  /* 样式同 .section-title */
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #A1A1AA;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
```

### 8.2 Tags Grid

```css
.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

| 属性 | 值 |
|------|-----|
| 布局 | flex wrap |
| Gap | 6px |

### 8.3 Tag Chip

```css
.tag-chip {
  padding: 5px 10px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
}

.tag-chip-text {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #52525B;
}
```

| 属性 | 值 |
|------|-----|
| Padding | 5px 10px |
| 边框 | 1px solid #E5E5E5 |
| 圆角 | 4px |
| 背景色 | transparent |
| 字体 | Inter |
| 字号 | 11px |
| 字重 | 500 |
| 文字颜色 | #52525B |

### 8.4 More Tag (+N)

```css
.more-tag {
  padding: 5px 10px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
}

.more-tag-text {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #A1A1AA;
}
```

| 属性 | 值 |
|------|-----|
| 样式 | 同 Tag Chip |
| 文字颜色 | #A1A1AA (更浅) |
| 格式 | "+12" |

---

## 九、Sidebar Footer

```css
.sidebar-footer {
  padding: 0 0 0 -6px; /* 轻微左偏移对齐 */
}
```

### 9.1 Settings Button

```css
.settings-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
}

.settings-button:hover {
  background-color: #F4F4F5;
}

.settings-icon {
  width: 18px;
  height: 18px;
  color: #71717A;
}
```

| 属性 | 值 |
|------|-----|
| 按钮尺寸 | 32 x 32 px |
| 圆角 | 6px |
| 图标 | settings (Lucide) |
| 图标尺寸 | 18 x 18 px |
| 图标颜色 | #71717A |

---

## 十、颜色值汇总表

### 10.1 背景色

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| Sidebar 背景 | #FFFFFF | 纯白 |
| Logo 背景 | #18181B | 深黑 |
| Nav Active 背景 | #FFFFFF | 纯白 |
| Category Active 背景 | #F4F4F5 | 浅灰 |
| Hover 背景 | #F4F4F5 | 浅灰 |

### 10.2 边框色

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| Sidebar 右边框 | #E5E5E5 | 浅灰 |
| Header 底边框 | #E5E5E5 | 浅灰 |
| Nav Active 边框 | #E5E5E5 | 浅灰 |
| Divider | #E4E4E7 | 浅灰 (略暗) |
| Tag Chip 边框 | #E5E5E5 | 浅灰 |

### 10.3 文字颜色

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| App Name | #18181B | 深黑 |
| Nav Active 文字 | #18181B | 深黑 |
| Nav Normal 文字 | #71717A | 中灰 |
| Category 文字 | #52525B | 深灰 |
| Section Title | #A1A1AA | 浅灰 |
| Count 数字 | #A1A1AA | 浅灰 |
| Tag 文字 | #52525B | 深灰 |
| More Tag 文字 | #A1A1AA | 浅灰 |

### 10.4 图标颜色

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| Nav Active 图标 | #18181B | 深黑 |
| Nav Normal 图标 | #71717A | 中灰 |
| Section Add 图标 | #A1A1AA | 浅灰 |
| Settings 图标 | #71717A | 中灰 |

### 10.5 Category Dot 颜色

| 分类 | 颜色值 | 说明 |
|------|--------|------|
| Development | #18181B | 深黑 |
| Design | #71717A | 中灰 |
| Research | #71717A | 中灰 |
| Productivity | #DCFCE7 | 浅绿 |
| Uncategorized | #71717A | 中灰 |

---

## 十一、字体规范汇总

| 元素 | 字体 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|------|--------|
| App Name | Inter | 14px | 600 | auto | -0.3px |
| Nav Label | Inter | 13px | 400/500 | auto | 0 |
| Nav Count | Inter | 11px | 500 | auto | 0 |
| Section Title | Inter | 10px | 600 | auto | 0.8px |
| Category Label | Inter | 13px | 400 | auto | 0 |
| Category Count | Inter | 11px | 500 | auto | 0 |
| Tag Text | Inter | 11px | 500 | auto | 0 |

---

## 十二、间距规范汇总

| 位置 | 间距值 |
|------|--------|
| Sidebar Content Padding | 16px 16px 8px 16px |
| Header Padding | 0 20px |
| Header Gap (Logo - Name) | 10px |
| Top Content Gap (大区块) | 24px |
| Nav Section Gap | 2px |
| Nav Item Gap (内部) | 10px |
| Nav Item Padding | 0 10px |
| Categories Section Gap | 12px |
| Categories List Gap | 2px |
| Category Item Gap | 10px |
| Category Item Padding | 0 10px |
| Tags Section Gap | 12px |
| Tags Grid Gap | 6px |
| Tag Chip Padding | 5px 10px |

---

## 十三、组件状态变化说明

### Navigation Item 状态

| 状态 | 背景色 | 边框 | 图标颜色 | 文字颜色 | 文字字重 |
|------|--------|------|----------|----------|----------|
| Normal | transparent | none | #71717A | #71717A | 400 |
| Hover | #F4F4F5 | none | #71717A | #71717A | 400 |
| Active | #FFFFFF | 1px #E5E5E5 | #18181B | #18181B | 500 |

### Category Item 状态

| 状态 | 背景色 | 其他变化 |
|------|--------|----------|
| Normal | transparent | - |
| Hover | #F4F4F5 | - |
| Active | #F4F4F5 | - |

### Tag Chip 状态

| 状态 | 背景色 | 边框 | 文字颜色 |
|------|--------|------|----------|
| Normal | transparent | 1px #E5E5E5 | #52525B |
| Hover | #F4F4F5 | 1px #E5E5E5 | #52525B |
| Selected | #18181B | none | #FFFFFF |

---

## 十四、Lucide Icons 使用列表

| 图标名 | 尺寸 | 用途 |
|--------|------|------|
| sparkles | 16x16 | Skills 导航 |
| plug | 16x16 | MCP Servers 导航 |
| layers | 16x16 | Scenes 导航 |
| folder | 16x16 | Projects 导航 |
| plus | 12x12 | Section Add 按钮 |
| settings | 18x18 | Settings 按钮 |

---

## 十五、空状态说明

### Categories 空状态
- 显示文本: "No categories"
- 字体: Inter, 12px, 400, #A1A1AA

### Tags 空状态
- 显示文本: "No tags"
- 字体: Inter, 12px, 400, #A1A1AA
