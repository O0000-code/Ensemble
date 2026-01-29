# 设计稿分析 - 编辑类别状态

## 1. 概述

本文档分析设计稿文件 `/Users/bo/Downloads/MCP 管理.pen` 中「编辑类别」状态的详细结构。

- **画面名称**: `Ensemble - Edit Category (Inline)`
- **节点 ID**: `JgsTm`
- **画面尺寸**: 260 x 900 px

该画面展示了用户双击类别项进入编辑模式时的侧边栏状态。"Design" 类别处于编辑状态，文字被蓝色全选高亮。

## 2. 节点结构

### 2.1 完整层级关系

```
JgsTm (Ensemble - Edit Category (Inline)) - 根画面
└── 5Mtfe (Sidebar) - 侧边栏容器
    ├── JuJUs (Sidebar Header) - 顶部标题栏
    │   ├── Wdz98 (Logo) - Logo 图标
    │   └── Qkc7W (appName) - "Ensemble" 文字
    │
    └── Qogs7 (Sidebar Content) - 主内容区
        ├── qhL0M (Top Content) - 顶部内容
        │   ├── HJU0L (Nav Section) - 导航区
        │   │   ├── cjHiI (Nav - Skills)
        │   │   ├── JaEZJ (Nav - MCP)
        │   │   ├── AowAQ (Nav - Scenes)
        │   │   └── NfyMY (Nav - Projects)
        │   │
        │   ├── Zgm5Z (Divider) - 分隔线
        │   │
        │   ├── p8AQe (Categories Section) - 类别区 ★ 重点
        │   │   ├── JvntD (Section Header) - 区域标题
        │   │   │   ├── duOt8 (categoriesTitle) - "CATEGORIES"
        │   │   │   └── PkYYw (addCatIcon) - "+" 图标
        │   │   │
        │   │   └── Zur0D (Categories List) - 类别列表
        │   │       ├── YjgMS (Cat - Development) - 普通态
        │   │       ├── kBOoT (Cat - Design (Editing)) - 编辑态 ★★★
        │   │       ├── BkfEm (Cat - Research) - 普通态
        │   │       ├── 1SZPA (Cat - Productivity) - 普通态
        │   │       └── tEduj (Cat - Other) - 普通态
        │   │
        │   ├── Zquwf (Divider) - 分隔线
        │   │
        │   └── tInlY (Tags Section) - 标签区
        │
        └── SxEvc (Sidebar Footer) - 底部设置按钮
```

### 2.2 编辑态类别项结构 (kBOoT)

```
kBOoT (Cat - Design (Editing)) - 编辑态容器
├── MFQbL (catDot2) - 类别圆点
├── GBYuM (Text Selection) - 全选高亮容器 ★★★
│   └── AIvwb (catLabel2) - "Design" 文字
└── inCY9 (catCount2) - "(23)" 计数（已隐藏）
```

## 3. 样式详情

### 3.1 编辑态类别容器 (kBOoT)

| 属性 | 值 | 说明 |
|------|-----|------|
| **type** | `frame` | 容器类型 |
| **name** | `Cat - Design (Editing)` | 节点名称 |
| **width** | `fill_container` | 填满父容器 |
| **height** | `32` | 固定高度 32px |
| **fill** | `#F4F4F5` | 灰色背景（与选中态相同） |
| **cornerRadius** | `6` | 圆角 6px |
| **padding** | `[0, 10]` | 垂直 0，水平 10px |
| **gap** | `10` | 子元素间距 10px |
| **alignItems** | `center` | 垂直居中 |
| **stroke** | 无 | 无边框 |

### 3.2 类别圆点 (MFQbL)

| 属性 | 值 | 说明 |
|------|-----|------|
| **type** | `frame` | 使用 frame 模拟圆点 |
| **width** | `8` | 宽度 8px |
| **height** | `8` | 高度 8px |
| **cornerRadius** | `4` | 圆角 4px（形成圆形） |
| **fill** | `#71717A` | 灰色（保持原有颜色） |

### 3.3 全选高亮容器 (GBYuM) - 核心样式

| 属性 | 值 | 说明 |
|------|-----|------|
| **type** | `frame` | 容器类型 |
| **name** | `Text Selection` | 节点名称 |
| **fill** | `#0063E1` | 蓝色背景 ★ |
| **cornerRadius** | `2` | 圆角 2px |
| **padding** | `[1, 2]` | 垂直 1px，水平 2px |

### 3.4 高亮文字 (AIvwb)

| 属性 | 值 | 说明 |
|------|-----|------|
| **type** | `text` | 文字类型 |
| **content** | `Design` | 文字内容 |
| **fill** | `#FFFFFF` | 白色文字 ★ |
| **fontFamily** | `Inter` | 字体 |
| **fontSize** | `13` | 字号 13px |
| **fontWeight** | `normal` | 字重 400 |

### 3.5 计数文字 (inCY9) - 已隐藏

| 属性 | 值 | 说明 |
|------|-----|------|
| **type** | `text` | 文字类型 |
| **content** | `(23)` | 计数内容 |
| **enabled** | `false` | 已禁用/隐藏 ★ |
| **fill** | `#A1A1AA` | 灰色文字 |
| **fontFamily** | `Inter` | 字体 |
| **fontSize** | `11` | 字号 11px |
| **fontWeight** | `500` | 字重 500 |

### 3.6 普通态类别项对比 (YjgMS)

| 属性 | 编辑态 (kBOoT) | 普通态 (YjgMS) |
|------|----------------|----------------|
| **fill** | `#F4F4F5` | 无（透明） |
| **文字颜色** | `#FFFFFF`（白色） | `#52525B`（深灰） |
| **文字容器** | 有蓝色背景包裹 | 无包裹 |
| **计数显示** | `enabled: false`（隐藏） | 正常显示 |

## 4. 全选高亮效果详细样式

### 4.1 高亮效果结构

全选高亮效果通过一个独立的容器 `GBYuM (Text Selection)` 实现：

```
GBYuM (Text Selection)
├── 背景色: #0063E1 (macOS 风格的蓝色)
├── 圆角: 2px
├── 内边距: 1px (垂直) / 2px (水平)
└── AIvwb (catLabel2)
    ├── 文字内容: "Design"
    ├── 文字颜色: #FFFFFF (白色)
    ├── 字体: Inter
    ├── 字号: 13px
    └── 字重: normal (400)
```

### 4.2 关键样式数值

```css
/* 全选高亮容器 */
.text-selection {
  background-color: #0063E1;
  border-radius: 2px;
  padding: 1px 2px;
}

/* 高亮文字 */
.text-selection-text {
  color: #FFFFFF;
  font-family: Inter;
  font-size: 13px;
  font-weight: 400;
}
```

### 4.3 Tailwind CSS 等效类

```jsx
// 全选高亮容器
<span className="bg-[#0063E1] rounded-sm px-0.5 py-px">
  {/* 高亮文字 */}
  <span className="text-white text-[13px] font-normal">
    Design
  </span>
</span>
```

## 5. 截图分析

从截图中可以观察到：

1. **整体布局**：侧边栏宽度 260px，白色背景
2. **编辑状态位置**："Design" 类别（第二项）处于编辑状态
3. **视觉效果**：
   - 编辑态行有淡灰色背景 `#F4F4F5`
   - 文字 "Design" 被蓝色高亮框包裹
   - 高亮框内文字为白色
   - 计数 "(23)" 不可见
4. **对比效果**：
   - 其他类别项无背景色
   - 其他类别项的文字为深灰色 `#52525B`
   - 其他类别项的计数正常显示

## 6. 关键发现

### 6.1 编辑态与选中态的区别

| 特征 | 编辑态 | 选中态 |
|------|--------|--------|
| 容器背景 | `#F4F4F5` | `#F4F4F5` |
| 文字样式 | 蓝色背景 + 白色文字 | 普通深灰色文字 |
| 计数显示 | 隐藏 | 显示 |
| 圆点颜色 | 保持原色 | 保持原色 |

### 6.2 全选高亮的实现方式

设计稿使用了一个独立的 frame 容器来实现全选高亮效果：
- 不是通过 CSS `::selection` 伪元素
- 而是通过一个带背景色的容器包裹文字
- 这样可以在 HTML 中精确控制高亮样式

### 6.3 计数隐藏机制

计数文字使用 `enabled: false` 属性隐藏，而不是删除节点。这意味着：
- 在实现时应使用 CSS `visibility: hidden` 或 `display: none`
- 保持 DOM 结构不变，只是视觉上隐藏

### 6.4 圆点颜色规则

编辑态下圆点保持原有颜色不变（`#71717A`），说明：
- 编辑操作不应改变类别的标识色
- 圆点颜色由类别自身属性决定

## 7. 实现建议

### 7.1 组件状态

```typescript
interface CategoryItemState {
  isEditing: boolean;  // 是否处于编辑状态
  editValue: string;   // 编辑中的文字值
}
```

### 7.2 样式实现

```tsx
// 类别项组件
const CategoryItem: React.FC<Props> = ({ category, isEditing, onEdit }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 h-8 px-2.5 rounded-md",
        isEditing && "bg-[#F4F4F5]"
      )}
    >
      {/* 圆点 - 保持原色 */}
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: category.color }}
      />

      {/* 文字 - 编辑态有高亮 */}
      {isEditing ? (
        <span className="bg-[#0063E1] rounded-sm px-0.5 py-px">
          <input
            className="bg-transparent text-white text-[13px] font-normal outline-none"
            value={editValue}
            autoFocus
            // 使用 selection 样式模拟全选效果
          />
        </span>
      ) : (
        <span className="text-[#52525B] text-[13px] font-normal">
          {category.name}
        </span>
      )}

      {/* 计数 - 编辑态隐藏 */}
      {!isEditing && (
        <span className="text-[#A1A1AA] text-[11px] font-medium">
          ({category.count})
        </span>
      )}
    </div>
  );
};
```

### 7.3 全选效果实现方案

由于设计稿使用蓝色背景包裹文字来表示全选，在实际实现中有两种方案：

**方案 A：使用原生 input 的 selection 样式**
```css
input::selection {
  background-color: #0063E1;
  color: #FFFFFF;
}
```

**方案 B：使用 contenteditable + 自定义选区样式**
```css
[contenteditable]::selection {
  background-color: #0063E1;
  color: #FFFFFF;
}
```

**方案 C：使用 input 并在初始化时调用 select()**
```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isEditing && inputRef.current) {
    inputRef.current.select();  // 全选文字
  }
}, [isEditing]);
```

### 7.4 推荐实现方案

建议使用 **方案 C + CSS ::selection 样式**：
1. 使用原生 `<input>` 元素
2. 进入编辑模式时自动调用 `select()` 全选文字
3. 通过 CSS `::selection` 设置选中样式为蓝底白字
4. 这样既符合设计稿视觉效果，又保持了原生输入体验

## 8. 颜色汇总

| 用途 | 颜色值 | 示例 |
|------|--------|------|
| 编辑态容器背景 | `#F4F4F5` | ![#F4F4F5](https://via.placeholder.com/20/F4F4F5/F4F4F5) |
| 全选高亮背景 | `#0063E1` | ![#0063E1](https://via.placeholder.com/20/0063E1/0063E1) |
| 高亮文字颜色 | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| 普通文字颜色 | `#52525B` | ![#52525B](https://via.placeholder.com/20/52525B/52525B) |
| 计数文字颜色 | `#A1A1AA` | ![#A1A1AA](https://via.placeholder.com/20/A1A1AA/A1A1AA) |
| 默认圆点颜色 | `#71717A` | ![#71717A](https://via.placeholder.com/20/71717A/71717A) |

## 9. 尺寸汇总

| 元素 | 尺寸 |
|------|------|
| 类别行高度 | 32px |
| 类别行圆角 | 6px |
| 类别行内边距 | 0px 10px |
| 类别行元素间距 | 10px |
| 圆点尺寸 | 8 x 8 px |
| 圆点圆角 | 4px |
| 高亮框圆角 | 2px |
| 高亮框内边距 | 1px 2px |
| 类别名字号 | 13px |
| 计数字号 | 11px |
