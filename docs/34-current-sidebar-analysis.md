# 侧边栏组件现状分析报告

## 1. 概述

本文档分析 Ensemble 应用中侧边栏（Sidebar）相关组件的代码实现，重点关注 Categories 和 Tags 区域的渲染逻辑、右键菜单实现以及当前问题定位。

## 2. 相关文件列表

### 核心组件文件
| 文件路径 | 功能描述 |
|---------|---------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/Sidebar.tsx` | 侧边栏主组件 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx` | 主布局组件，包含右键菜单状态管理 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/ContextMenu.tsx` | 通用右键菜单组件 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/Modal.tsx` | 通用模态框组件 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/Input.tsx` | 通用输入框组件 |

### Store 文件
| 文件路径 | 功能描述 |
|---------|---------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/appStore.ts` | 应用全局状态，包含 categories 和 tags 的 CRUD 操作 |

### 类型定义
| 文件路径 | 功能描述 |
|---------|---------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/types/index.ts` | Category 和 Tag 类型定义 |

## 3. 组件结构分析

### 3.1 整体架构

```
MainLayout.tsx (状态管理 + 右键菜单渲染)
  └── Sidebar.tsx (侧边栏 UI)
        ├── Header (Logo + App Name)
        ├── Navigation Section (Skills, MCP Servers, Scenes, Projects)
        ├── Categories Section
        ├── Tags Section
        └── Footer (Settings)
```

### 3.2 Sidebar 组件 Props

```typescript
interface SidebarProps {
  activeNav: 'skills' | 'mcp-servers' | 'scenes' | 'projects' | 'settings';
  activeCategory?: string | null;
  activeTags?: string[];
  categories: Category[];
  tags: Tag[];
  counts: { skills: number; mcpServers: number; scenes: number; projects: number };
  onNavChange: (nav: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onTagToggle: (tagId: string) => void;
  onAddCategory?: () => void;      // 已预留但未实现
  onAddTag?: () => void;           // 已预留但未实现
  onCategoryContextMenu?: (category: Category, position: { x: number; y: number }) => void;
}
```

## 4. Categories 区域详细分析

### 4.1 当前实现

**位置**: `Sidebar.tsx` 第 156-219 行

```tsx
{/* Categories Section */}
<section className="flex flex-col gap-3">
  {/* Section Header */}
  <div className="flex items-center justify-between">
    <h3 className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.8px]">
      Categories
    </h3>
    {onAddCategory && (
      <button
        onClick={onAddCategory}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F4F4F5] transition-colors"
        aria-label="Add category"
      >
        <Plus size={12} className="text-[#A1A1AA]" />
      </button>
    )}
  </div>

  {/* Categories List */}
  {categories.length > 0 ? (
    <div className="flex flex-col gap-0.5">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(isActive ? null : category.id)}
            onContextMenu={(e) => handleCategoryContextMenu(e, category)}
            className={`
              h-8 px-2.5 flex items-center gap-2.5 rounded-[6px] cursor-pointer
              transition-colors duration-150
              ${isActive ? 'bg-[#F4F4F5]' : 'hover:bg-[#F4F4F5]'}
            `}
          >
            {/* Category Dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            {/* Category Name */}
            <span className={`text-[13px] flex-1 text-left truncate ${...}`}>
              {category.name}
            </span>
            {/* Category Count */}
            <span className="text-[11px] font-medium text-[#A1A1AA]">
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  ) : (
    <p className="text-xs text-[#A1A1AA] px-2.5">No categories</p>
  )}
</section>
```

### 4.2 关键样式

| 元素 | 样式 |
|-----|------|
| 容器（选中态） | `bg-[#F4F4F5]` 灰底，`rounded-[6px]`，`h-8`，`px-2.5` |
| 圆点 | `w-2 h-2 rounded-full`，颜色使用 `category.color` |
| 文字（选中态） | `text-[13px] font-medium text-[#18181B]` |
| 文字（普通态） | `text-[13px] font-normal text-[#52525B]` |
| 计数 | `text-[11px] font-medium text-[#A1A1AA]` |

### 4.3 `+` 按钮现状

- **已有 `+` 按钮的 UI**：第 163-171 行
- **条件渲染**：`{onAddCategory && ...}`
- **问题**：`MainLayout.tsx` 中**没有传递 `onAddCategory` 回调**，所以按钮不显示

```tsx
// MainLayout.tsx 第 160-171 行
<Sidebar
  activeNav={getActiveNav()}
  activeCategory={activeCategory}
  activeTags={activeTags}
  categories={categories}
  tags={tags}
  counts={counts}
  onNavChange={handleNavChange}
  onCategoryChange={setActiveCategory}
  onTagToggle={toggleActiveTag}
  onCategoryContextMenu={handleCategoryContextMenu}
  // 注意：没有传递 onAddCategory 和 onAddTag
/>
```

## 5. Tags 区域详细分析

### 5.1 当前实现

**位置**: `Sidebar.tsx` 第 224-279 行

```tsx
{/* Tags Section */}
<section className="flex flex-col gap-3">
  {/* Section Header */}
  <div className="flex items-center justify-between">
    <h3 className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.8px]">
      Tags
    </h3>
    {onAddTag && (
      <button
        onClick={onAddTag}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F4F4F5] transition-colors"
        aria-label="Add tag"
      >
        <Plus size={12} className="text-[#A1A1AA]" />
      </button>
    )}
  </div>

  {/* Tags Grid */}
  {tags.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {visibleTags.map((tag) => {
        const isActive = activeTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`
              px-2.5 py-[5px] rounded text-[11px] font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-[#18181B] text-white border-transparent'
                : 'bg-transparent text-[#52525B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'
              }
            `}
          >
            {tag.name}
          </button>
        );
      })}
      {/* "+N" button for more tags */}
    </div>
  ) : (
    <p className="text-xs text-[#A1A1AA] px-2.5">No tags</p>
  )}
</section>
```

### 5.2 关键样式

| 元素 | 样式 |
|-----|------|
| 胶囊（普通态） | `bg-transparent text-[#52525B] border border-[#E5E5E5]`，`px-2.5 py-[5px]`，`rounded` |
| 胶囊（选中态） | `bg-[#18181B] text-white border-transparent` |
| 文字 | `text-[11px] font-medium` |

### 5.3 特殊逻辑

- **最大显示数量**：`MAX_VISIBLE_TAGS = 6`
- **超出时显示**：`+{remainingTagsCount}` 按钮
- **无右键菜单**：Tags 目前没有 `onContextMenu` 事件处理

## 6. 右键菜单分析

### 6.1 ContextMenu 组件

**位置**: `/src/components/common/ContextMenu.tsx`

```typescript
interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}
```

**功能特性**：
- 使用 `createPortal` 渲染到 `document.body`
- 自动调整位置避免超出视口
- 点击外部或按 Escape 关闭
- 支持危险操作（红色样式）和禁用状态

### 6.2 MainLayout 中的右键菜单实现

**位置**: `MainLayout.tsx` 第 78-113 行

```tsx
// Context menu state
const [contextMenu, setContextMenu] = useState<{
  category: Category;
  position: { x: number; y: number };
} | null>(null);

const handleCategoryContextMenu = (category: Category, position: { x: number; y: number }) => {
  setContextMenu({ category, position });
};

const handleRenameCategory = () => {
  // TODO: Implement rename modal
  console.log('Rename category:', contextMenu?.category);
  setContextMenu(null);
};

const handleDeleteCategory = () => {
  // TODO: Implement delete confirmation
  console.log('Delete category:', contextMenu?.category);
  setContextMenu(null);
};
```

**渲染部分** (第 182-200 行):

```tsx
{contextMenu && (
  <ContextMenu
    items={[
      {
        label: 'Rename',
        icon: <Pencil size={14} />,
        onClick: handleRenameCategory,
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        onClick: handleDeleteCategory,
        danger: true,
      },
    ]}
    position={contextMenu.position}
    onClose={() => setContextMenu(null)}
  />
)}
```

## 7. 关键代码片段

### 7.1 Store 中的 CRUD 操作

**appStore.ts** 已实现的方法：

```typescript
// 已实现
addCategory: async (name: string, color: string) => Promise<Category>;
updateCategory: async (id: string, name?: string, color?: string) => Promise<void>;
deleteCategory: async (id: string) => Promise<void>;
addTag: async (name: string) => Promise<Tag>;
deleteTag: async (id: string) => Promise<void>;

// 注意：没有 updateTag/renameTag 方法
```

### 7.2 类型定义

```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}
```

## 8. 当前问题定位

### 8.1 问题 1：缺少 `+` 按钮

**根本原因**：`MainLayout.tsx` 没有传递 `onAddCategory` 和 `onAddTag` 回调给 `Sidebar` 组件。

**代码位置**：`MainLayout.tsx` 第 160-171 行

**解决方案**：
1. 在 `MainLayout.tsx` 中实现 `handleAddCategory` 和 `handleAddTag` 函数
2. 将这两个函数作为 props 传递给 `Sidebar` 组件

### 8.2 问题 2：重命名功能失效

**根本原因**：`handleRenameCategory` 函数只有 `console.log` 和 `TODO` 注释，没有实际实现。

**代码位置**：`MainLayout.tsx` 第 103-107 行

```tsx
const handleRenameCategory = () => {
  // TODO: Implement rename modal
  console.log('Rename category:', contextMenu?.category);
  setContextMenu(null);
};
```

**解决方案**：需要实现内联编辑功能，而不是弹出模态框。

### 8.3 问题 3：Tags 没有右键菜单

**根本原因**：`Sidebar.tsx` 中 Tags 的 button 元素没有 `onContextMenu` 事件处理。

**代码位置**：`Sidebar.tsx` 第 248-263 行

### 8.4 问题 4：缺少 Tag 的 rename 方法

**根本原因**：`appStore.ts` 中没有 `updateTag` 或 `renameTag` 方法。

**代码位置**：`appStore.ts`

## 9. 实现建议

### 9.1 状态管理扩展

在 `appStore.ts` 中添加编辑状态相关字段：

```typescript
interface AppState {
  // ... 现有字段

  // 编辑状态
  editingCategoryId: string | null;
  addingCategory: boolean;
  editingTagId: string | null;
  addingTag: boolean;

  // Actions
  setEditingCategory: (id: string | null) => void;
  setAddingCategory: (adding: boolean) => void;
  setEditingTag: (id: string | null) => void;
  setAddingTag: (adding: boolean) => void;
  updateTag: (id: string, name: string) => Promise<void>;  // 新增
}
```

### 9.2 Sidebar 组件修改

1. **接收编辑状态 props**：
```typescript
interface SidebarProps {
  // ... 现有 props
  editingCategoryId?: string | null;
  addingCategory?: boolean;
  editingTagId?: string | null;
  addingTag?: boolean;
  onEditCategoryStart?: (id: string) => void;
  onEditCategoryEnd?: () => void;
  onAddCategoryEnd?: () => void;
  // ... 类似的 Tag 相关
}
```

2. **条件渲染编辑态**：
```tsx
{categories.map((category) => {
  const isEditing = editingCategoryId === category.id;

  if (isEditing) {
    return <CategoryEditItem key={category.id} category={category} ... />;
  }

  return <CategoryItem key={category.id} category={category} ... />;
})}

{addingCategory && (
  <CategoryAddItem ... />
)}
```

### 9.3 新建内联编辑组件

创建两个新组件：
- `CategoryInlineEdit.tsx` - 类别内联编辑/新增
- `TagInlineEdit.tsx` - 标签内联编辑/新增

**核心功能**：
- 自动聚焦输入框
- Enter 确认 / Escape 取消
- 点击外部取消
- 文字全选高亮效果

### 9.4 MainLayout 修改

1. 传递 `onAddCategory` 和 `onAddTag` 回调
2. 修改 `handleRenameCategory` 触发内联编辑
3. 添加 Tags 的右键菜单支持

### 9.5 样式参考

根据设计稿要求：

**新增状态样式**：
- 容器：`bg-[#F4F4F5]`，与选中态相同
- 占位文字：`text-[#A1A1AA]`

**编辑状态样式**：
- 容器：`bg-[#F4F4F5]`
- 全选高亮：`bg-[#0063E1]` 蓝底 + `text-white` 白字
- 隐藏计数文字

## 10. 建议的实现顺序

1. **Phase 1 - Store 扩展**
   - 添加编辑状态字段和 actions
   - 添加 `updateTag` 方法

2. **Phase 2 - 内联编辑组件**
   - 创建 `CategoryInlineEdit` 组件
   - 创建 `TagInlineEdit` 组件

3. **Phase 3 - Sidebar 集成**
   - 修改 Sidebar 支持编辑态渲染
   - 添加双击进入编辑模式

4. **Phase 4 - MainLayout 连接**
   - 传递所有必要的 props
   - 修改右键菜单处理函数
   - 添加 Tags 右键菜单

5. **Phase 5 - 测试和样式调优**
   - 确保样式与设计稿一致
   - 测试所有交互流程
