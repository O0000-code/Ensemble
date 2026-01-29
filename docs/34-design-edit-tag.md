# 设计稿分析 - 编辑标签状态 (Edit Tag Inline)

## 1. 概述

本文档分析 Ensemble 应用设计稿中「编辑标签」状态的详细结构。该状态展示了用户双击标签或通过右键菜单选择重命名时的界面效果。

- **设计稿文件**：`/Users/bo/Downloads/MCP 管理.pen`
- **画面节点 ID**：`5jJVC`
- **画面名称**：`Ensemble - Edit Tag (Inline)`
- **画面尺寸**：260 x 900 px

## 2. 节点结构

### 2.1 完整层级关系

```
5jJVC (Ensemble - Edit Tag (Inline)) - 根画面
└── QIGNU (Sidebar) - 侧边栏容器
    ├── 3Pubh (Sidebar Header) - 顶部标题栏
    │   ├── 9lamy (Logo) - 应用图标
    │   └── rR5jP (appName) - "Ensemble" 文字
    │
    └── Pbagm (Sidebar Content) - 侧边栏内容
        ├── WEt6r (Top Content) - 上半部分内容
        │   ├── TDn3s (Nav Section) - 导航区域
        │   │   ├── 1Oa3N (Nav - Skills) - 技能导航项 [选中状态]
        │   │   ├── x9MPi (Nav - MCP) - MCP导航项
        │   │   ├── PJScE (Nav - Scenes) - 场景导航项
        │   │   └── pNfTq (Nav - Projects) - 项目导航项
        │   │
        │   ├── Qkjh3 (Divider) - 分隔线
        │   │
        │   ├── 7I0z0 (Categories Section) - 类别区域
        │   │   ├── P25PS (Section Header) - 区域标题
        │   │   └── wA9Y7 (Categories List) - 类别列表
        │   │
        │   ├── IcAQO (Divider) - 分隔线
        │   │
        │   └── myBpP (Tags Section) - 标签区域 [重点关注]
        │       ├── vMwsk (Section Header) - 区域标题 + 添加按钮
        │       ├── vS7vu (Tags Grid) - 标签网格第1行
        │       ├── UFxNp (Tags Grid 2) - 标签网格第2行 [包含编辑态标签]
        │       └── kZgYL (Tags Grid 3) - 标签网格第3行
        │
        └── 2ZRbQ (Sidebar Footer) - 底部设置按钮
```

### 2.2 Tags Section 详细结构 (myBpP)

```
myBpP (Tags Section)
├── vMwsk (Section Header)
│   ├── jqw4X (tagsTitle) - "TAGS" 文字
│   └── PPeh6 (addTagIcon) - "+" 图标
│
├── vS7vu (Tags Grid) - 第1行
│   ├── rVOCN (Tag) - "React"
│   ├── xuDel (Tag) - "Swift"
│   ├── Vc76S (Tag) - "Python"
│   └── E5s40 (Tag) - "AI"
│
├── UFxNp (Tags Grid 2) - 第2行 [包含编辑态]
│   ├── U8bTb (Tag - Frontend (Editing)) - 编辑态标签 [重点]
│   │   └── MWCJV (Text Selection) - 全选高亮框
│   │       └── pTYe2 (tag5Text) - "Frontend" 文字
│   ├── 5TnFj (Tag) - "Backend"
│   └── FTJ56 (Tag) - "Data"
│
└── kZgYL (Tags Grid 3) - 第3行
    ├── CQyJT (Tag) - "Writing"
    ├── sxwGx (Tag) - "Academic"
    └── Z6VVj (moreTag) - "+12"
```

## 3. 样式详情

### 3.1 Tags Section 容器 (myBpP)

| 属性 | 值 |
|------|-----|
| layout | vertical |
| gap | 12px |
| width | fill_container |

### 3.2 Section Header (vMwsk)

| 属性 | 值 |
|------|-----|
| layout | horizontal (默认) |
| alignItems | center |
| justifyContent | space_between |
| width | fill_container |

#### 标题文字 (jqw4X)
| 属性 | 值 |
|------|-----|
| content | "TAGS" |
| fontFamily | Inter |
| fontSize | 10px |
| fontWeight | 600 |
| letterSpacing | 0.8px |
| fill (颜色) | #A1A1AA |

#### 添加图标 (PPeh6)
| 属性 | 值 |
|------|-----|
| iconFontFamily | lucide |
| iconFontName | plus |
| width | 12px |
| height | 12px |
| fill (颜色) | #A1A1AA |

### 3.3 Tags Grid 容器 (vS7vu, UFxNp, kZgYL)

| 属性 | 值 |
|------|-----|
| layout | horizontal (默认) |
| gap | 6px |
| width | fill_container |

### 3.4 普通标签样式 (如 rVOCN)

| 属性 | 值 |
|------|-----|
| type | frame |
| cornerRadius | 4px |
| padding | [5, 10] (上下5px, 左右10px) |
| stroke.fill | #E5E5E5 |
| stroke.thickness | 1px |
| stroke.align | inside |
| fill (背景) | 透明 (未设置) |

#### 普通标签文字
| 属性 | 值 |
|------|-----|
| fontFamily | Inter |
| fontSize | 11px |
| fontWeight | 500 |
| fill (颜色) | #52525B |

### 3.5 编辑态标签容器 (U8bTb) - 重点

| 属性 | 值 |
|------|-----|
| name | Tag - Frontend (Editing) |
| type | frame |
| cornerRadius | 4px |
| padding | [5, 10] (上下5px, 左右10px) |
| fill (背景) | #F4F4F5 (灰色背景) |
| stroke.fill | #E5E5E5 |
| stroke.thickness | 1px |
| stroke.align | inside |

### 3.6 全选高亮效果 (MWCJV) - 重点

| 属性 | 值 |
|------|-----|
| name | Text Selection |
| type | frame |
| cornerRadius | 2px |
| padding | [1, 2] (上下1px, 左右2px) |
| fill (背景) | #0063E1 (蓝色) |

#### 高亮文字 (pTYe2)
| 属性 | 值 |
|------|-----|
| content | "Frontend" |
| fontFamily | Inter |
| fontSize | 11px |
| fontWeight | 500 |
| fill (颜色) | #FFFFFF (白色) |

## 4. 全选高亮效果详细样式

全选高亮是编辑态的核心视觉特征，用于模拟 macOS 原生的文字选中效果。

### 4.1 结构层次

```
编辑态标签 (U8bTb)
└── 全选高亮框 (MWCJV)
    └── 高亮文字 (pTYe2)
```

### 4.2 样式对比

| 属性 | 普通标签 | 编辑态标签 | 全选高亮框 |
|------|----------|------------|------------|
| 背景色 | 透明 | #F4F4F5 | #0063E1 |
| 圆角 | 4px | 4px | 2px |
| 内边距 | [5, 10] | [5, 10] | [1, 2] |
| 边框 | #E5E5E5 1px | #E5E5E5 1px | 无 |
| 文字颜色 | #52525B | - | #FFFFFF |

### 4.3 颜色值汇总

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 全选高亮背景 | #0063E1 | macOS 风格的选中蓝色 |
| 高亮文字颜色 | #FFFFFF | 白色，与蓝底形成对比 |
| 编辑态容器背景 | #F4F4F5 | 浅灰色，表示选中/激活状态 |
| 普通文字颜色 | #52525B | 深灰色 |
| 边框颜色 | #E5E5E5 | 浅灰色边框 |
| 占位/次要文字 | #A1A1AA | 灰色 |

## 5. 截图分析

### 5.1 完整画面截图 (5jJVC)

截图显示了完整的侧边栏界面，包含：
- 顶部 Logo 和应用名称 "Ensemble"
- 导航区域：Skills（选中状态，带边框）、MCP Servers、Scenes、Projects
- Categories 区域：显示 Development、Design、Research 等类别
- Tags 区域：显示多行标签，其中 "Frontend" 标签处于编辑状态

### 5.2 编辑态标签截图 (U8bTb)

编辑态的 "Frontend" 标签清晰显示：
- 外层容器有浅灰色 (#F4F4F5) 背景
- 内部文字被蓝色 (#0063E1) 高亮框包裹
- 文字为白色 (#FFFFFF)
- 视觉上模拟了 macOS 原生的全选效果

### 5.3 普通标签截图 (rVOCN)

普通的 "React" 标签显示：
- 透明背景
- 灰色边框 (#E5E5E5)
- 深灰色文字 (#52525B)

### 5.4 Tags Section 截图 (myBpP)

整个 Tags 区域截图显示：
- 标签以网格形式排列，每行多个
- 行间距 12px，标签间距 6px
- "Frontend" 标签明显区别于其他普通标签
- "+12" 表示还有更多标签未显示

## 6. 关键发现

### 6.1 编辑态与普通态的区别

1. **容器背景**：编辑态有 `#F4F4F5` 背景，普通态透明
2. **文字呈现**：编辑态文字被全选高亮框包裹，普通态直接显示文字
3. **其他样式不变**：圆角、内边距、边框保持一致

### 6.2 全选高亮效果的实现要点

1. **嵌套结构**：需要在编辑态容器内嵌套一个高亮框
2. **高亮框样式**：
   - 背景色：`#0063E1`
   - 圆角：`2px`（比容器圆角小）
   - 内边距：`[1, 2]`（很小的边距）
3. **文字样式**：白色 `#FFFFFF`

### 6.3 与编辑类别状态的一致性

对比编辑类别状态（节点 `JgsTm`）：
- 全选高亮效果完全相同（`#0063E1` 蓝底 + `#FFFFFF` 白字）
- 圆角和内边距相同（`cornerRadius: 2`, `padding: [1, 2]`）

## 7. 实现建议

### 7.1 组件状态设计

```typescript
interface TagItemProps {
  tag: Tag;
  isEditing: boolean;
  onStartEdit: () => void;
  onFinishEdit: (newName: string) => void;
  onCancelEdit: () => void;
}
```

### 7.2 样式实现 (Tailwind CSS)

```tsx
// 普通标签容器
const normalTagClass = "rounded px-2.5 py-1.5 border border-[#E5E5E5]";

// 编辑态标签容器
const editingTagClass = "rounded px-2.5 py-1.5 border border-[#E5E5E5] bg-[#F4F4F5]";

// 全选高亮框（仅在编辑态使用）
const selectionHighlightClass = "rounded-sm px-0.5 py-px bg-[#0063E1]";

// 普通文字
const normalTextClass = "text-[11px] font-medium text-[#52525B] font-inter";

// 高亮文字
const highlightTextClass = "text-[11px] font-medium text-white font-inter";
```

### 7.3 HTML 结构示例

```tsx
// 编辑态标签
<div className="rounded px-2.5 py-1.5 border border-[#E5E5E5] bg-[#F4F4F5]">
  <div className="rounded-sm px-0.5 py-px bg-[#0063E1]">
    <input
      type="text"
      value={tagName}
      className="text-[11px] font-medium text-white bg-transparent outline-none"
      autoFocus
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  </div>
</div>
```

### 7.4 交互实现要点

1. **进入编辑态**：
   - 双击标签
   - 右键菜单选择"重命名"

2. **全选效果**：
   - 进入编辑态时自动选中全部文字
   - 使用 `inputRef.current?.select()` 实现

3. **退出编辑态**：
   - 按 Enter 确认修改
   - 按 Esc 取消修改
   - 点击外部区域确认修改

4. **样式切换**：
   - 编辑态：显示高亮框 + 输入框
   - 普通态：直接显示文字

### 7.5 注意事项

1. **输入框透明**：输入框本身需要透明背景，让蓝色高亮框作为背景
2. **光标颜色**：输入光标应为白色，与文字颜色一致
3. **尺寸一致**：编辑态和普通态的整体尺寸应保持一致，避免布局跳动
4. **字体一致**：Inter 字体，11px，font-weight 500

## 8. 附录：完整样式值速查表

| 元素 | 属性 | 值 |
|------|------|-----|
| Tags Section | gap | 12px |
| Tags Grid | gap | 6px |
| 普通标签 | cornerRadius | 4px |
| 普通标签 | padding | 5px 10px |
| 普通标签 | border | 1px solid #E5E5E5 |
| 普通标签 | background | transparent |
| 普通标签文字 | font | Inter 11px 500 |
| 普通标签文字 | color | #52525B |
| 编辑态标签 | cornerRadius | 4px |
| 编辑态标签 | padding | 5px 10px |
| 编辑态标签 | border | 1px solid #E5E5E5 |
| 编辑态标签 | background | #F4F4F5 |
| 全选高亮框 | cornerRadius | 2px |
| 全选高亮框 | padding | 1px 2px |
| 全选高亮框 | background | #0063E1 |
| 高亮文字 | font | Inter 11px 500 |
| 高亮文字 | color | #FFFFFF |
| Section 标题 | font | Inter 10px 600 |
| Section 标题 | letterSpacing | 0.8px |
| Section 标题 | color | #A1A1AA |
| 添加按钮 | size | 12px x 12px |
| 添加按钮 | color | #A1A1AA |
