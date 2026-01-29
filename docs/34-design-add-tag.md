# 设计稿分析 - 新增标签状态 (Add Tag Inline)

## 1. 概述

本文档分析 Ensemble 应用设计稿中「新增标签」状态的详细结构。该状态对应用户点击 Tags 区域的 `+` 按钮后，在标签网格末尾出现的输入项。

- **设计稿文件**：`/Users/bo/Downloads/MCP 管理.pen`
- **画面节点 ID**：`r3UEu`
- **画面名称**：`Ensemble - Add Tag (Inline)`
- **画面尺寸**：260 x 900 px

## 2. 节点结构

### 2.1 完整层级关系

```
r3UEu (Ensemble - Add Tag (Inline)) - 画面根节点
└── s2pdQ (Sidebar) - 侧边栏容器
    ├── 6AICr (Sidebar Header) - 头部区域
    └── FMc73 (Sidebar Content) - 内容区域
        ├── yIMlX (Top Content)
        │   ├── lEL84 (Nav Section) - 导航区域
        │   ├── zfxEZ (Divider)
        │   ├── KJZ50 (Categories Section) - 类别区域
        │   ├── Jzlrf (Divider)
        │   └── LMNm4 (Tags Section) - 标签区域 ★
        │       ├── g1H6s (Section Header) - 区域头部
        │       │   ├── 8qY6A (tagsTitle) - "TAGS" 文字
        │       │   └── rLKwf (addTagIcon) - + 图标
        │       ├── QMuHH (Tags Grid) - 第1行标签
        │       ├── yC7PK (Tags Grid 2) - 第2行标签
        │       ├── FkLnK (Tags Grid 3) - 第3行标签
        │       └── gaoqw (Tags Grid - New Input) - 新增输入行 ★
        │           └── lvMrx (Tag - New Input) - 新增标签输入项 ★
        │               └── 5ZmmP (tagInputPlaceholder) - 占位文字
        └── 4DN1p (Sidebar Footer) - 底部区域
```

### 2.2 关键节点详情

#### Tags Section Header (g1H6s)
```json
{
  "id": "g1H6s",
  "name": "Section Header",
  "type": "frame",
  "alignItems": "center",
  "justifyContent": "space_between",
  "width": "fill_container",
  "children": [
    {
      "id": "8qY6A",
      "name": "tagsTitle",
      "type": "text",
      "content": "TAGS",
      "fill": "#A1A1AA",
      "fontFamily": "Inter",
      "fontSize": 10,
      "fontWeight": "600",
      "letterSpacing": 0.8
    },
    {
      "id": "rLKwf",
      "name": "addTagIcon",
      "type": "icon_font",
      "iconFontFamily": "lucide",
      "iconFontName": "plus",
      "fill": "#A1A1AA",
      "width": 12,
      "height": 12
    }
  ]
}
```

#### Tags Grid - New Input 容器 (gaoqw)
```json
{
  "id": "gaoqw",
  "name": "Tags Grid - New Input",
  "type": "frame",
  "gap": 6,
  "width": "fill_container"
}
```

#### 新增标签输入项 (lvMrx) - 核心组件
```json
{
  "id": "lvMrx",
  "name": "Tag - New Input",
  "type": "frame",
  "alignItems": "center",
  "cornerRadius": 4,
  "fill": "#F4F4F5",
  "padding": [5, 10],
  "stroke": {
    "align": "inside",
    "fill": "#E5E5E5",
    "thickness": 1
  },
  "children": [
    {
      "id": "5ZmmP",
      "name": "tagInputPlaceholder",
      "type": "text",
      "content": "Tag name...",
      "fill": "#A1A1AA",
      "fontFamily": "Inter",
      "fontSize": 11,
      "fontWeight": "500"
    }
  ]
}
```

## 3. 样式详情

### 3.1 新增标签输入项样式 (lvMrx)

| 属性 | 值 | 说明 |
|------|-----|------|
| **背景色** | `#F4F4F5` | 浅灰色背景，表示输入态 |
| **圆角** | `4px` | 四角统一圆角 |
| **内边距** | `5px 10px` | 上下5px，左右10px |
| **边框颜色** | `#E5E5E5` | 浅灰色边框 |
| **边框宽度** | `1px` | 细边框 |
| **边框对齐** | `inside` | 内边框 |
| **垂直对齐** | `center` | 内容垂直居中 |

### 3.2 占位文字样式 (5ZmmP)

| 属性 | 值 | 说明 |
|------|-----|------|
| **内容** | `"Tag name..."` | 占位提示文字 |
| **颜色** | `#A1A1AA` | 灰色（zinc-400） |
| **字体** | `Inter` | 系统字体 |
| **字号** | `11px` | 小号字体 |
| **字重** | `500` | medium |

### 3.3 普通标签样式对比

为了实现一致性，以下是普通标签的样式（以 `RJfBo` React 标签为例）：

| 属性 | 普通标签 | 新增输入项 | 差异 |
|------|---------|-----------|------|
| 背景色 | 无 (透明) | `#F4F4F5` | **有差异** |
| 圆角 | `4px` | `4px` | 相同 |
| 内边距 | `5px 10px` | `5px 10px` | 相同 |
| 边框颜色 | `#E5E5E5` | `#E5E5E5` | 相同 |
| 边框宽度 | `1px` | `1px` | 相同 |
| 文字颜色 | `#52525B` | `#A1A1AA` | **有差异** |
| 字体 | `Inter` | `Inter` | 相同 |
| 字号 | `11px` | `11px` | 相同 |
| 字重 | `500` | `500` | 相同 |

### 3.4 Section Header 样式

| 属性 | 值 |
|------|-----|
| **标题文字** | "TAGS" |
| **标题颜色** | `#A1A1AA` |
| **标题字号** | `10px` |
| **标题字重** | `600` |
| **字母间距** | `0.8px` |
| **+ 图标颜色** | `#A1A1AA` |
| **+ 图标尺寸** | `12 x 12 px` |
| **+ 图标字体** | lucide / plus |

### 3.5 Tags Grid 布局

| 属性 | 值 |
|------|-----|
| **标签间距** | `6px` (gap) |
| **行间距** | `12px` (Tags Section gap) |
| **布局方向** | 水平排列 (flex-row) |
| **换行** | 自动换行到新的 Grid 行 |

## 4. 截图分析

### 4.1 整体画面 (r3UEu)

画面展示了侧边栏的完整结构，包括：
- 顶部 Logo 和应用名称
- 导航菜单（Skills 选中状态、MCP Servers、Scenes、Projects）
- Categories 区域（带 + 按钮）
- Tags 区域（带 + 按钮）- 重点关注区域
- 底部设置按钮

### 4.2 Tags Section (LMNm4)

Tags 区域展示了：
- 标题栏："TAGS" + "+" 按钮
- 3行现有标签：React, Swift, Python, AI, Frontend, Backend, Data, Writing, Academic, +12
- 第4行为新增输入项，显示占位文字 "Tag name..."

### 4.3 新增标签输入项 (lvMrx)

输入项的视觉特征：
- 灰色背景 (`#F4F4F5`) 明显区别于普通标签的透明背景
- 灰色占位文字 "Tag name..." 提示用户输入
- 整体外观类似一个"选中"状态的标签胶囊
- 边框颜色与普通标签一致

## 5. 关键发现

### 5.1 设计原则

1. **视觉一致性**：新增输入项的尺寸、边框、圆角与普通标签完全一致
2. **状态区分**：通过灰色背景 (`#F4F4F5`) 区分输入态和普通态
3. **占位提示**：使用 `#A1A1AA` 灰色文字提示用户输入内容

### 5.2 与类别新增项的差异

| 特性 | 新增类别 | 新增标签 |
|------|---------|---------|
| 容器类型 | 列表行 | 胶囊 |
| 高度 | 固定 32px | 自适应 (padding) |
| 圆角 | 6px | 4px |
| 边框 | 无 | 1px #E5E5E5 |
| 占位文字 | "Category name..." | "Tag name..." |
| 左侧装饰 | 8x8 灰色圆点 | 无 |

### 5.3 重要细节

1. **边框存在**：新增标签输入项**有边框**（`#E5E5E5 1px inside`），与普通标签一致
2. **背景色**：`#F4F4F5` 是 Tailwind 的 `zinc-100`，表示输入/选中状态
3. **占位文字颜色**：`#A1A1AA` 是 Tailwind 的 `zinc-400`
4. **+ 按钮位置**：在 Section Header 右侧，与标题 "TAGS" 水平对齐

## 6. 实现建议

### 6.1 组件结构

```tsx
// 新增标签输入项组件
const TagNewInput: React.FC<{
  onSubmit: (name: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="inline-flex items-center px-2.5 py-1.5 rounded bg-zinc-100 border border-zinc-200">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onSubmit(value.trim());
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        onBlur={onCancel}
        placeholder="Tag name..."
        className="bg-transparent border-none outline-none text-[11px] font-medium text-zinc-600 placeholder:text-zinc-400 w-auto min-w-[60px]"
      />
    </div>
  );
};
```

### 6.2 关键 CSS 类

```css
/* 新增标签输入项容器 */
.tag-new-input {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #F4F4F5; /* zinc-100 */
  border: 1px solid #E5E5E5; /* zinc-200 */
}

/* 输入框样式 */
.tag-new-input input {
  background: transparent;
  border: none;
  outline: none;
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #52525B; /* zinc-600 - 输入文字颜色 */
}

.tag-new-input input::placeholder {
  color: #A1A1AA; /* zinc-400 */
}
```

### 6.3 Tailwind CSS 实现

```tsx
// 容器样式
className="inline-flex items-center px-2.5 py-[5px] rounded bg-zinc-100 border border-zinc-200"

// 输入框样式
className="bg-transparent border-none outline-none text-[11px] font-medium text-zinc-600 placeholder:text-zinc-400"
```

### 6.4 交互建议

1. 点击 `+` 按钮后，在 Tags Grid 末尾添加输入项
2. 输入框自动获取焦点
3. 按 Enter 确认创建新标签
4. 按 Escape 或点击外部取消创建
5. 创建成功后输入项消失，新标签显示在列表中

### 6.5 注意事项

1. 输入框宽度应自适应内容，但设置最小宽度确保可点击
2. 输入框不应有可见的边框和背景（由外层容器提供）
3. 确保占位文字颜色与设计稿一致 (`#A1A1AA`)
4. Tags 区域采用 flex-wrap 布局，新增输入项跟随现有标签排列
