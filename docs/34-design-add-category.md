# 设计稿分析：新增类别状态 (Add Category Inline)

## 1. 概述

本文档分析 Ensemble 应用设计稿中「新增类别」状态的详细结构。该状态展示了用户点击 `+` 按钮后，在类别列表底部出现的新增输入项。

- **设计稿文件**：`/Users/bo/Downloads/MCP 管理.pen`
- **画面节点 ID**：`LxRtJ`
- **画面名称**：`Ensemble - Add Category (Inline)`
- **新增输入项节点 ID**：`btEsy`

## 2. 节点结构

### 2.1 完整层级关系

```
LxRtJ (Ensemble - Add Category (Inline))
└── D5K9f (Sidebar)
    └── Fzifq (Sidebar Content)
        ├── NFWv7 (Sidebar Header)
        │   ├── RXb6O (Logo)
        │   └── Ck5Y7 (appName: "Ensemble")
        │
        ├── Wh3XN (Top Content)
        │   ├── 5NaDF (Nav Section)
        │   │   ├── tBCmc (Nav - Skills)
        │   │   ├── ghLAy (Nav - MCP)
        │   │   ├── AqhjH (Nav - Scenes)
        │   │   └── fJR6W (Nav - Projects)
        │   │
        │   ├── e1PU6 (Divider)
        │   │
        │   ├── 9B3XY (Categories Section) ⬅️ 重点区域
        │   │   ├── u51nC (Section Header)
        │   │   │   ├── WnKnZ (categoriesTitle: "CATEGORIES")
        │   │   │   └── YReuK (addCatIcon: plus) ⬅️ 新增按钮
        │   │   │
        │   │   └── EdfOl (Categories List)
        │   │       ├── RPawC (Cat - Development)
        │   │       ├── WrcZh (Cat - Design)
        │   │       ├── q8Pkn (Cat - Research)
        │   │       ├── ynZoD (Cat - Productivity)
        │   │       ├── HKGpS (Cat - Other/Uncategorized)
        │   │       └── btEsy (Cat - New Input) ⬅️ 新增输入项
        │   │
        │   ├── Ds9P2 (Divider)
        │   │
        │   └── 7T5ae (Tags Section)
        │
        └── 502qA (Sidebar Footer)
            └── iz7jY (Settings Button)
```

### 2.2 新增输入项详细结构 (btEsy)

```
btEsy (Cat - New Input)
├── AT8GR (catDotNew) - 灰色圆点
└── P1c0u (catInputPlaceholder) - 占位文字
```

## 3. 样式详情

### 3.1 画面容器 (LxRtJ)

| 属性 | 值 |
|------|-----|
| 类型 | frame |
| 宽度 | 260px |
| 高度 | 900px |
| 背景色 | #FFFFFF |
| 裁剪 | clip: true |
| 位置 | x: -90, y: 3885 |

### 3.2 Categories Section Header (u51nC)

| 属性 | 值 |
|------|-----|
| 布局 | 水平，两端对齐 (justifyContent: space_between) |
| 宽度 | fill_container |

#### 标题文字 (WnKnZ)

| 属性 | 值 |
|------|-----|
| 内容 | "CATEGORIES" |
| 颜色 | #A1A1AA |
| 字体 | Inter |
| 字号 | 10px |
| 字重 | 600 |
| 字间距 | 0.8px |

#### 新增按钮图标 (YReuK)

| 属性 | 值 |
|------|-----|
| 图标 | lucide/plus |
| 颜色 | #A1A1AA |
| 尺寸 | 12 x 12 px |

### 3.3 Categories List (EdfOl)

| 属性 | 值 |
|------|-----|
| 布局 | vertical |
| 间距 | gap: 2px |
| 宽度 | fill_container |

### 3.4 普通类别项样式（参考）

以 `RPawC (Cat - Development)` 为例：

| 属性 | 值 |
|------|-----|
| 布局 | 水平，垂直居中 (alignItems: center) |
| 圆角 | 6px |
| 高度 | 32px |
| 内边距 | padding: [0, 10] (上下0，左右10) |
| 间距 | gap: 10px |
| 宽度 | fill_container |
| 背景色 | 透明（无 fill 属性）|

#### 圆点样式

| 属性 | 值 |
|------|-----|
| 尺寸 | 8 x 8 px |
| 圆角 | 4px (完全圆形) |
| 填充色 | 各类别不同，如 #18181B（黑）、#71717A（灰）、#DCFCE7（浅绿）|

#### 标签文字样式

| 属性 | 值 |
|------|-----|
| 颜色 | #52525B |
| 字体 | Inter |
| 字号 | 13px |
| 字重 | normal |

#### 计数文字样式

| 属性 | 值 |
|------|-----|
| 颜色 | #A1A1AA |
| 字体 | Inter |
| 字号 | 11px |
| 字重 | 500 |

### 3.5 新增输入项样式 (btEsy) ⭐ 核心

| 属性 | 值 | 说明 |
|------|-----|------|
| 类型 | frame | |
| 名称 | Cat - New Input | |
| 布局 | 水平 | alignItems: center |
| **背景色** | **#F4F4F5** | 灰色背景，与选中态一致 |
| **圆角** | **6px** | cornerRadius: 6 |
| **高度** | **32px** | 固定高度 |
| **内边距** | **[0, 10]** | 上下0，左右10px |
| 间距 | 10px | gap: 10 |
| 宽度 | fill_container | 撑满容器 |
| 边框 | 无 | 没有 stroke 属性 |

#### 新增圆点样式 (AT8GR - catDotNew)

| 属性 | 值 | 说明 |
|------|-----|------|
| 类型 | frame | |
| **尺寸** | **8 x 8 px** | width: 8, height: 8 |
| **圆角** | **4px** | 完全圆形 |
| **填充色** | **#A1A1AA** | 灰色，表示占位状态 |

#### 占位文字样式 (P1c0u - catInputPlaceholder)

| 属性 | 值 | 说明 |
|------|-----|------|
| 类型 | text | |
| **内容** | **"Category name..."** | 占位提示文字 |
| **颜色** | **#A1A1AA** | 灰色 |
| **字体** | **Inter** | |
| **字号** | **13px** | fontSize: 13 |
| **字重** | **normal** | fontWeight: normal |

## 4. 截图分析

### 4.1 完整画面截图

整体侧边栏展示了「新增类别」状态：
- 顶部 Logo 和应用名称
- 导航区域（Skills、MCP Servers、Scenes、Projects）
- **Categories 区域**：标题右侧有 `+` 按钮，列表底部显示新增输入项
- Tags 区域

### 4.2 新增输入项截图

新增输入项视觉特征：
- 灰色背景（#F4F4F5）明显区分于普通项（透明背景）
- 左侧灰色圆点（#A1A1AA）
- 灰色占位文字 "Category name..."
- 整体外观与「已选中项」风格一致
- **无边框**，简洁干净

### 4.3 Categories Section 截图

完整的 Categories 区域展示：
- 标题 "CATEGORIES" 与 `+` 按钮
- 5 个已有类别项（透明背景）
- 1 个新增输入项（灰色背景）位于列表底部

## 5. 关键发现

### 5.1 设计原则

1. **视觉一致性**：新增输入项的外观与「已选中项」完全一致，使用相同的灰色背景 `#F4F4F5`
2. **极简设计**：无边框、无额外装饰，仅通过背景色区分状态
3. **占位符策略**：圆点和文字都使用统一的灰色 `#A1A1AA` 表示占位状态

### 5.2 与普通项的差异

| 特征 | 普通类别项 | 新增输入项 |
|------|-----------|-----------|
| 背景色 | 透明 | #F4F4F5 |
| 圆点颜色 | 各类别专属色 | #A1A1AA（灰色）|
| 文字颜色 | #52525B（深灰）| #A1A1AA（浅灰）|
| 计数 | 显示 (23) 等 | 无 |
| 文字内容 | 类别名称 | "Category name..." |

### 5.3 新增按钮位置

- `+` 按钮位于 Section Header 右侧
- 图标使用 lucide 图标库的 `plus` 图标
- 尺寸 12x12px，颜色 #A1A1AA

## 6. 实现建议

### 6.1 组件结构

```tsx
// 新增输入项组件
<div className="flex items-center h-8 px-2.5 gap-2.5 rounded-md bg-zinc-100">
  {/* 灰色圆点 */}
  <div className="w-2 h-2 rounded-full bg-zinc-400" />

  {/* 输入框（样式化为透明） */}
  <input
    type="text"
    placeholder="Category name..."
    className="flex-1 bg-transparent text-[13px] text-zinc-400
               placeholder:text-zinc-400 outline-none border-none"
    autoFocus
  />
</div>
```

### 6.2 Tailwind CSS 样式映射

| 设计值 | Tailwind 类 |
|--------|-------------|
| #F4F4F5 | bg-zinc-100 |
| #A1A1AA | text-zinc-400 |
| #52525B | text-zinc-600 |
| height: 32px | h-8 |
| padding: [0, 10] | px-2.5 |
| gap: 10px | gap-2.5 |
| cornerRadius: 6 | rounded-md |
| 8x8 圆点 | w-2 h-2 |
| cornerRadius: 4 (圆点) | rounded-full |
| fontSize: 13 | text-[13px] |

### 6.3 状态管理建议

```typescript
interface CategoryEditState {
  isAdding: boolean;           // 是否处于新增状态
  editingId: string | null;    // 正在编辑的类别 ID（null 表示非编辑状态）
  inputValue: string;          // 输入框当前值
}
```

### 6.4 交互行为

1. 点击 `+` 按钮 → 设置 `isAdding: true`
2. 输入框自动获得焦点
3. 按 Enter → 创建类别，重置状态
4. 按 Esc 或点击外部 → 取消，重置状态
5. 新增和编辑互斥，同时只能有一个激活

## 7. 颜色规范汇总

| 用途 | 颜色代码 | 描述 |
|------|---------|------|
| 新增项背景 | #F4F4F5 | zinc-100 |
| 占位圆点 | #A1A1AA | zinc-400 |
| 占位文字 | #A1A1AA | zinc-400 |
| 普通文字 | #52525B | zinc-600 |
| 计数文字 | #A1A1AA | zinc-400 |
| Section 标题 | #A1A1AA | zinc-400 |
| 分割线 | #E4E4E7 | zinc-200 |
