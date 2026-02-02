# SubAgent 执行规范 - 设计稿同步修改

## 工作目录
```
/Users/bo/Documents/Development/Ensemble/Ensemble2-detail-panel-refactor
```

## 修改任务清单

### 任务 1: Skills Detail 页面修改
**文件**: `src/pages/SkillsPage.tsx`

#### 1.1 Header 修改
- **移除**: Edit 按钮、Toggle 开关
- **保留**: 关闭按钮（由 SlidePanel 组件提供）
- **detailHeaderRight** 应该返回 `null` 或只包含关闭按钮

#### 1.2 Category & Tags 布局修改
- **当前**: 水平排布（使用 `flex items-center gap-3`）
- **目标**: 垂直排布（使用 `flex flex-col gap-2`）
- **Label 与控件间距**: 8px

#### 1.3 Detail Content Padding 修改
- **当前**: px-7 py-6 (28px 四边)
- **目标**: pt-3 px-7 pb-7 (top: 12px, right: 28px, bottom: 28px, left: 28px)

### 任务 2: MCP Detail 页面修改
**文件**: `src/pages/McpServersPage.tsx`

#### 2.1 Header 修改
- **移除**: Edit 按钮、Toggle 开关
- **保留**: 关闭按钮

#### 2.2 如有 Category & Tags，同样改为垂直布局

#### 2.3 Detail Content Padding 修改
- 同 Skills 页面

### 任务 3: Scene Detail 页面修改
**文件**: `src/pages/ScenesPage.tsx`

#### 3.1 Header 修改
- **保留**: Edit 按钮、Delete 按钮
- **新增**: 关闭按钮（在最右侧）

### 任务 4: Projects Detail 页面修改
**文件**: `src/pages/ProjectsPage.tsx`

#### 4.1 Header 修改
- **保留**: Open Folder 按钮
- **新增**: 关闭按钮（在最右侧）

## 关闭按钮样式规范

```jsx
// 关闭按钮组件
<button
  onClick={onClose}
  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors"
>
  <X className="h-[18px] w-[18px] text-[#71717A]" />
</button>
```

样式详情：
- 尺寸: 32x32px (h-8 w-8)
- 圆角: 6px (rounded-md)
- 边框: 1px solid #E5E5E5
- 图标: lucide X, 18x18px
- 图标颜色: #71717A

## Category & Tags 布局规范

### Category 区域
```jsx
<div className="flex flex-col gap-2">
  <span className="text-[11px] font-medium text-[#71717A]">Category</span>
  {/* Category Selector */}
</div>
```

### Tags 区域
```jsx
<div className="flex flex-col gap-2">
  <span className="text-[11px] font-medium text-[#71717A]">Tags</span>
  <div className="flex flex-wrap items-center gap-2">
    {/* Tags */}
  </div>
</div>
```

## SlidePanel Content Padding 规范

SlidePanel 组件的内容区域 padding:
- top: 12px (pt-3)
- right: 28px (pr-7)
- bottom: 28px (pb-7)
- left: 28px (pl-7)

需要修改 `src/components/layout/SlidePanel.tsx` 中的 content 区域样式。

## 验证清单

1. [ ] Skills Detail: Header 只有关闭按钮
2. [ ] Skills Detail: Category 垂直布局，gap 8px
3. [ ] Skills Detail: Tags 垂直布局，gap 8px
4. [ ] Skills Detail: Content padding 12px 28px 28px 28px
5. [ ] MCP Detail: Header 只有关闭按钮
6. [ ] MCP Detail: Content padding 正确
7. [ ] Scene Detail: Header 有 Edit + Delete + 关闭按钮
8. [ ] Projects Detail: Header 有 Open Folder + 关闭按钮
9. [ ] 所有关闭按钮样式一致
