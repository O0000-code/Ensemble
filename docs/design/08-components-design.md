# Ensemble 通用组件设计规范

## 一、组件概览

本文档定义了 Ensemble 项目中可复用的下拉菜单和右键菜单组件的完整设计规范。

### 组件列表

| 组件名称 | Node ID | 用途 | 宽度 |
|----------|---------|------|------|
| Category Dropdown | `weNqA` | 分类选择下拉菜单（单选） | 200px |
| Tags Dropdown | `moMFu` | 标签选择下拉菜单（多选+搜索） | 220px |
| Context Menu | `v4ije` | 分类/标签右键操作菜单 | 140px |

---

## 二、共通基础样式 (Base Dropdown/Menu)

### 2.1 Container 容器样式

所有下拉菜单和右键菜单共享以下容器样式：

```css
/* Base Container */
.dropdown-container,
.context-menu-container {
  background-color: #FFFFFF;
  border: 1px solid #E5E5E5;
  /* stroke: inside, thickness: 1 */
}

/* Dropdown 专用 */
.dropdown-container {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.0625);
  /* effect: shadow, blur: 12, offset: (0, 4), color: #00000010 */
}

/* Context Menu 专用 */
.context-menu-container {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.082);
  /* effect: shadow, blur: 8, offset: (0, 2), color: #00000015 */
}
```

### 2.2 内容区域 Padding

| 组件类型 | 容器 Padding | 列表项 Gap |
|----------|--------------|------------|
| Category Dropdown | 4px | 0 (列表项自带 padding) |
| Tags Dropdown | 0 (搜索区独立) / 4px (列表区) | 0 |
| Context Menu | 4px | 0 |

---

## 三、分类下拉 (Category Dropdown)

### 3.1 组件结构

```
Category Dropdown (weNqA)
├── Category List (j1D0y)
│   ├── Category Item - Selected (wcKTI)
│   │   ├── Left (uXdxZ)
│   │   │   ├── Dot (sXTzL)
│   │   │   └── Category Name (R8wJu)
│   │   └── Check Icon (BspPv)
│   ├── Category Item (mVAgF)
│   ├── Category Item (XrUsO)
│   ├── Category Item (5i8xu)
│   └── Category Item (Yjh3f) - Uncategorized
```

### 3.2 Container 样式

| 属性 | 值 |
|------|-----|
| 宽度 | 200px |
| 高度 | auto (由内容撑开) |
| 背景色 | #FFFFFF |
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| 阴影 | 0 4px 12px rgba(0, 0, 0, 0.0625) |
| 布局 | vertical |

### 3.3 Category List 样式

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| 布局 | vertical |
| Padding | 4px |
| Gap | 0 |

### 3.4 Category Item 样式

#### 基础状态

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| 高度 | auto |
| Padding | 8px 12px (垂直 8px, 水平 12px) |
| 圆角 | 4px |
| 背景色 | transparent |
| 对齐 | alignItems: center |
| Gap | 8px |

#### Hover 状态

| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |

#### Selected 状态

| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |
| 显示 Check Icon | 是 |

### 3.5 Category Dot 样式

| 属性 | 值 |
|------|-----|
| 尺寸 | 8px x 8px |
| 圆角 | 4px (正圆) |
| 默认颜色 | #71717A (灰色，用于普通分类) |
| 特殊颜色 | #18181B (Development)、#DCFCE7 (Productivity)、其他自定义 |

### 3.6 Category Name 样式

| 属性 | 正常分类 | Uncategorized |
|------|---------|---------------|
| 字体 | Inter | Inter |
| 字号 | 13px | 13px |
| 字重 | 500 (medium) | 500 (medium) |
| 颜色 | #18181B | #71717A |

### 3.7 Check Icon 样式

| 属性 | 值 |
|------|-----|
| 图标 | lucide/check |
| 尺寸 | 14px x 14px |
| 颜色 | #18181B |
| 显示条件 | 仅当选中时显示 |

---

## 四、标签下拉 (Tags Dropdown)

### 4.1 组件结构

```
Tags Dropdown (moMFu)
├── Search Box (Vn3vM)
│   ├── Search Icon (t6Jwm)
│   └── Search Placeholder (cMj38)
└── Tag List (6vnwu)
    ├── Tag Item - Selected (G5rgl)
    │   ├── Left (2LRtl)
    │   │   ├── Checkbox - Checked (l5V8N)
    │   │   │   └── Check Icon (KY2Ur)
    │   │   └── Tag Name (xDAUj)
    │   └── Count (gFAjW)
    ├── Tag Item - Selected (TxnJv)
    ├── Tag Item - Unchecked (5V3jx)
    ├── Tag Item - Unchecked (AYNyZ)
    └── Tag Item - Unchecked (nrwOj)
```

### 4.2 Container 样式

| 属性 | 值 |
|------|-----|
| 宽度 | 220px |
| 高度 | auto (由内容撑开) |
| 背景色 | #FFFFFF |
| 圆角 | 8px |
| 边框 | 1px solid #E5E5E5 |
| 阴影 | 0 4px 12px rgba(0, 0, 0, 0.0625) |
| 布局 | vertical |

### 4.3 Search Box 样式

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| Padding | 8px 12px |
| 对齐 | alignItems: center |
| Gap | 8px |
| 底部边框 | 1px solid #E5E5E5 |
| 背景色 | transparent |

#### Search Icon

| 属性 | 值 |
|------|-----|
| 图标 | lucide/search |
| 尺寸 | 14px x 14px |
| 颜色 | #A1A1AA |

#### Search Placeholder

| 属性 | 值 |
|------|-----|
| 内容 | "Search tags..." |
| 字体 | Inter |
| 字号 | 13px |
| 字重 | normal (400) |
| 颜色 | #A1A1AA |

### 4.4 Tag List 样式

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| 布局 | vertical |
| Padding | 4px |
| Gap | 0 |

### 4.5 Tag Item 样式

#### 基础状态

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| 高度 | auto |
| Padding | 8px 12px |
| 圆角 | 4px |
| 背景色 | transparent |
| 对齐 | alignItems: center |
| 布局 | justifyContent: space_between |

#### Hover / Checked 状态

| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |

### 4.6 Checkbox 样式

#### Unchecked 状态

| 属性 | 值 |
|------|-----|
| 尺寸 | 14px x 14px |
| 圆角 | 3px |
| 背景色 | transparent |
| 边框 | 1px solid #D4D4D8 |

#### Checked 状态

| 属性 | 值 |
|------|-----|
| 尺寸 | 14px x 14px |
| 圆角 | 3px |
| 背景色 | #18181B |
| 边框 | none |
| 内部 Check Icon | 10px x 10px, #FFFFFF |

### 4.7 Tag Name 样式

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 13px |
| 字重 | 500 (medium) |
| 颜色 | #18181B |

### 4.8 Tag Count 样式

| 属性 | 值 |
|------|-----|
| 字体 | Inter |
| 字号 | 11px |
| 字重 | 500 (medium) |
| 颜色 | #A1A1AA |

---

## 五、分类右键菜单 (Context Menu)

### 5.1 组件结构

```
Context Menu (v4ije)
├── Rename Item (gY6bb)
│   ├── Rename Icon (N2ktF)
│   └── Rename Text (48dBG)
└── Delete Item (eRhzA)
    ├── Delete Icon (ZTU1L)
    └── Delete Text (TmxFe)
```

### 5.2 Container 样式

| 属性 | 值 |
|------|-----|
| 宽度 | 140px |
| 高度 | auto |
| 背景色 | #FFFFFF |
| 圆角 | 6px |
| 边框 | 1px solid #E5E5E5 |
| 阴影 | 0 2px 8px rgba(0, 0, 0, 0.082) |
| 布局 | vertical |
| Padding | 4px |

### 5.3 Menu Item 样式

#### 基础样式 (Normal Item)

| 属性 | 值 |
|------|-----|
| 宽度 | fill_container |
| Padding | 6px 10px |
| 圆角 | 4px |
| 对齐 | alignItems: center |
| Gap | 8px |
| 背景色 | transparent |

#### Hover 状态

| 属性 | 值 |
|------|-----|
| 背景色 | #F4F4F5 |

#### 图标样式

| 属性 | Normal | Danger |
|------|--------|--------|
| 尺寸 | 14px x 14px | 14px x 14px |
| 颜色 | #52525B | #DC2626 |
| 图标 | lucide/pencil | lucide/trash-2 |

#### 文字样式

| 属性 | Normal | Danger |
|------|--------|--------|
| 字体 | Inter | Inter |
| 字号 | 13px | 13px |
| 字重 | normal (400) | normal (400) |
| 颜色 | #18181B | #DC2626 |

---

## 六、颜色变量总结

### 6.1 背景色

| 变量名建议 | 色值 | 用途 |
|------------|------|------|
| --bg-white | #FFFFFF | 容器背景 |
| --bg-hover | #F4F4F5 | Hover/Selected 背景 |

### 6.2 边框色

| 变量名建议 | 色值 | 用途 |
|------------|------|------|
| --border-light | #E5E5E5 | 容器边框、分隔线 |
| --border-checkbox | #D4D4D8 | 未选中 Checkbox 边框 |

### 6.3 文字色

| 变量名建议 | 色值 | 用途 |
|------------|------|------|
| --text-primary | #18181B | 主要文字、选中 Checkbox |
| --text-secondary | #71717A | 次要文字 (Uncategorized) |
| --text-muted | #A1A1AA | 占位符、计数 |
| --text-danger | #DC2626 | 危险操作文字/图标 |

### 6.4 图标色

| 变量名建议 | 色值 | 用途 |
|------------|------|------|
| --icon-default | #52525B | 普通图标 |
| --icon-muted | #A1A1AA | 搜索图标 |
| --icon-check | #18181B | 选中勾选 |
| --icon-check-bg | #FFFFFF | Checkbox 内勾选 |
| --icon-danger | #DC2626 | 删除图标 |

---

## 七、阴影效果对比

| 组件类型 | 阴影规格 | CSS 表示 |
|----------|----------|----------|
| Dropdown | blur: 12, y: 4, color: #00000010 | `0 4px 12px rgba(0,0,0,0.0625)` |
| Context Menu | blur: 8, y: 2, color: #00000015 | `0 2px 8px rgba(0,0,0,0.082)` |

> 注：Context Menu 使用更小的阴影，让菜单看起来更"轻"，更贴近内容。

---

## 八、交互行为规范

### 8.1 Category Dropdown

1. **触发方式**：点击 Category 筛选按钮
2. **定位**：出现在触发元素下方
3. **单选行为**：点击任意项立即选中并关闭
4. **选中指示**：显示 checkmark 图标 + 背景高亮
5. **关闭方式**：
   - 点击任意选项
   - 点击下拉外部区域
   - 按 Escape 键

### 8.2 Tags Dropdown

1. **触发方式**：点击 Tags 筛选按钮
2. **定位**：出现在触发元素下方
3. **多选行为**：点击切换选中状态，不自动关闭
4. **搜索功能**：顶部搜索框实时过滤标签列表
5. **选中指示**：Checkbox 变为填充状态 + 背景高亮
6. **关闭方式**：
   - 点击下拉外部区域
   - 按 Escape 键

### 8.3 Context Menu

1. **触发方式**：右键点击 Category/Tag 项
2. **定位**：出现在鼠标点击位置
3. **操作行为**：点击任意选项执行操作并关闭
4. **关闭方式**：
   - 点击任意选项
   - 点击菜单外部区域
   - 按 Escape 键

---

## 九、React 组件接口建议

### 9.1 BaseDropdown

```typescript
interface BaseDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  position?: 'bottom-start' | 'bottom-end';
  width?: number;
  children: React.ReactNode;
}
```

### 9.2 CategoryDropdown

```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface CategoryDropdownProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}
```

### 9.3 TagsDropdown

```typescript
interface Tag {
  id: string;
  name: string;
  count: number;
}

interface TagsDropdownProps {
  tags: Tag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  searchPlaceholder?: string;
}
```

### 9.4 ContextMenu

```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: string;  // Lucide icon name
  danger?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}
```

---

## 十、Tailwind CSS 类名参考

### 10.1 Container 基础类

```html
<!-- Dropdown Container -->
<div class="bg-white rounded-lg border border-zinc-200 shadow-md">

<!-- Context Menu Container -->
<div class="bg-white rounded-md border border-zinc-200 shadow">
```

### 10.2 Item 基础类

```html
<!-- Dropdown/Menu Item -->
<div class="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-100 cursor-pointer">

<!-- Selected State -->
<div class="flex items-center gap-2 px-3 py-2 rounded bg-zinc-100">
```

### 10.3 Checkbox

```html
<!-- Unchecked -->
<div class="w-3.5 h-3.5 rounded-sm border border-zinc-300"></div>

<!-- Checked -->
<div class="w-3.5 h-3.5 rounded-sm bg-zinc-900 flex items-center justify-center">
  <Check className="w-2.5 h-2.5 text-white" />
</div>
```

### 10.4 文字样式

```html
<!-- Primary Text -->
<span class="text-[13px] font-medium text-zinc-900">

<!-- Secondary Text -->
<span class="text-[13px] font-medium text-zinc-500">

<!-- Muted Text (Count) -->
<span class="text-[11px] font-medium text-zinc-400">

<!-- Danger Text -->
<span class="text-[13px] text-red-600">
```

---

## 十一、设计稿 Node ID 快速参考

| 组件 | Node ID | 关键子元素 |
|------|---------|------------|
| Category Dropdown | `weNqA` | List: `j1D0y` |
| Tags Dropdown | `moMFu` | Search: `Vn3vM`, List: `6vnwu` |
| Context Menu | `v4ije` | Rename: `gY6bb`, Delete: `eRhzA` |

---

## 十二、注意事项

1. **阴影一致性**：Dropdown 使用 blur:12 的大阴影，Context Menu 使用 blur:8 的小阴影
2. **圆角差异**：Dropdown 使用 8px，Context Menu 使用 6px
3. **字重统一**：列表项名称统一使用 font-weight: 500
4. **颜色系统**：严格使用 Zinc 色板，危险操作使用 Red-600
5. **间距规范**：列表项 padding 统一为 8px 12px（Dropdown）或 6px 10px（Context Menu）
