# SubAgent 第四轮执行规划 - Phase 4 & 5 组件集成

## 本轮目标

修改 Sidebar 和 MainLayout 组件，集成内联编辑功能。

## 前置阅读要求

所有 SubAgent 在执行前必须阅读以下文档：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-implementation-plan.md` - 实现规划
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-current-sidebar-analysis.md` - Sidebar 现状分析

## SubAgent 任务分配

### SubAgent 1: 修改 Sidebar 组件

**任务**：修改 Sidebar.tsx 集成内联编辑功能

**文件路径**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/Sidebar.tsx`

**修改内容**：

#### 1. 扩展 SidebarProps 接口

在现有 props 后添加：
```typescript
// 编辑状态 props
editingCategoryId?: string | null;
isAddingCategory?: boolean;
editingTagId?: string | null;
isAddingTag?: boolean;

// 编辑状态回调
onCategoryDoubleClick?: (categoryId: string) => void;
onCategorySave?: (id: string | null, name: string) => void;
onCategoryEditCancel?: () => void;
onTagDoubleClick?: (tagId: string) => void;
onTagContextMenu?: (tag: Tag, position: { x: number; y: number }) => void;
onTagSave?: (id: string | null, name: string) => void;
onTagEditCancel?: () => void;
```

#### 2. 修改 Categories 区域渲染

```typescript
import { CategoryInlineInput } from '@/components/sidebar';

// 在 Categories List 中：
{categories.map((category) => {
  const isActive = activeCategory === category.id;
  const isEditing = editingCategoryId === category.id;

  // 编辑模式
  if (isEditing) {
    return (
      <CategoryInlineInput
        key={category.id}
        mode="edit"
        category={category}
        onSave={(name) => onCategorySave?.(category.id, name)}
        onCancel={() => onCategoryEditCancel?.()}
      />
    );
  }

  // 普通模式（添加 onDoubleClick）
  return (
    <button
      key={category.id}
      onClick={() => onCategoryChange(isActive ? null : category.id)}
      onDoubleClick={() => onCategoryDoubleClick?.(category.id)}
      onContextMenu={(e) => handleCategoryContextMenu(e, category)}
      // ... 现有样式
    >
      {/* 现有内容 */}
    </button>
  );
})}

{/* 新增模式 - 在列表末尾 */}
{isAddingCategory && (
  <CategoryInlineInput
    mode="add"
    onSave={(name) => onCategorySave?.(null, name)}
    onCancel={() => onCategoryEditCancel?.()}
  />
)}
```

#### 3. 修改 Tags 区域渲染

```typescript
import { TagInlineInput } from '@/components/sidebar';

// 在 Tags Grid 中：
{visibleTags.map((tag) => {
  const isActive = activeTags.includes(tag.id);
  const isEditing = editingTagId === tag.id;

  // 编辑模式
  if (isEditing) {
    return (
      <TagInlineInput
        key={tag.id}
        mode="edit"
        tag={tag}
        onSave={(name) => onTagSave?.(tag.id, name)}
        onCancel={() => onTagEditCancel?.()}
      />
    );
  }

  // 普通模式（添加 onDoubleClick 和 onContextMenu）
  return (
    <button
      key={tag.id}
      onClick={() => onTagToggle(tag.id)}
      onDoubleClick={() => onTagDoubleClick?.(tag.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onTagContextMenu?.(tag, { x: e.clientX, y: e.clientY });
      }}
      // ... 现有样式
    >
      {tag.name}
    </button>
  );
})}

{/* "+N" 按钮后面，新增模式 */}
{isAddingTag && (
  <TagInlineInput
    mode="add"
    onSave={(name) => onTagSave?.(null, name)}
    onCancel={() => onTagEditCancel?.()}
  />
)}
```

#### 4. 更新组件解构

```typescript
export function Sidebar({
  // ... 现有 props
  editingCategoryId,
  isAddingCategory,
  editingTagId,
  isAddingTag,
  onCategoryDoubleClick,
  onCategorySave,
  onCategoryEditCancel,
  onTagDoubleClick,
  onTagContextMenu,
  onTagSave,
  onTagEditCancel,
}: SidebarProps) {
```

---

### SubAgent 2: 修改 MainLayout 组件

**任务**：修改 MainLayout.tsx 连接 Store 和传递 props

**文件路径**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**修改内容**：

#### 1. 从 appStore 获取编辑状态

```typescript
const {
  // ... 现有解构
  editingCategoryId,
  isAddingCategory,
  editingTagId,
  isAddingTag,
  startEditingCategory,
  stopEditingCategory,
  startAddingCategory,
  stopAddingCategory,
  startEditingTag,
  stopEditingTag,
  startAddingTag,
  stopAddingTag,
  addCategory,
  updateCategory,
  addTag,
  updateTag,
  deleteCategory,
  deleteTag,
} = useAppStore();
```

#### 2. 添加 Tag 右键菜单状态

```typescript
const [tagContextMenu, setTagContextMenu] = useState<{
  tag: Tag;
  position: { x: number; y: number };
} | null>(null);
```

#### 3. 添加处理函数

```typescript
// Category 处理函数
const handleAddCategory = () => {
  startAddingCategory();
};

const handleCategoryDoubleClick = (categoryId: string) => {
  startEditingCategory(categoryId);
};

const handleCategorySave = async (id: string | null, name: string) => {
  try {
    if (id) {
      // 编辑模式
      await updateCategory(id, name);
    } else {
      // 新增模式 - 使用默认颜色
      await addCategory(name, '#A1A1AA');
    }
    stopEditingCategory();
    stopAddingCategory();
  } catch (error) {
    console.error('Failed to save category:', error);
  }
};

const handleCategoryEditCancel = () => {
  stopEditingCategory();
  stopAddingCategory();
};

// 修改现有的 handleRenameCategory
const handleRenameCategory = () => {
  if (contextMenu?.category) {
    startEditingCategory(contextMenu.category.id);
  }
  setContextMenu(null);
};

// Tag 处理函数
const handleAddTag = () => {
  startAddingTag();
};

const handleTagDoubleClick = (tagId: string) => {
  startEditingTag(tagId);
};

const handleTagContextMenu = (tag: Tag, position: { x: number; y: number }) => {
  setTagContextMenu({ tag, position });
};

const handleRenameTag = () => {
  if (tagContextMenu?.tag) {
    startEditingTag(tagContextMenu.tag.id);
  }
  setTagContextMenu(null);
};

const handleDeleteTag = async () => {
  if (tagContextMenu?.tag) {
    try {
      await deleteTag(tagContextMenu.tag.id);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  }
  setTagContextMenu(null);
};

const handleTagSave = async (id: string | null, name: string) => {
  try {
    if (id) {
      // 编辑模式
      await updateTag(id, name);
    } else {
      // 新增模式
      await addTag(name);
    }
    stopEditingTag();
    stopAddingTag();
  } catch (error) {
    console.error('Failed to save tag:', error);
  }
};

const handleTagEditCancel = () => {
  stopEditingTag();
  stopAddingTag();
};
```

#### 4. 更新 Sidebar 组件调用

```typescript
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
  // 新增 props
  onAddCategory={handleAddCategory}
  onAddTag={handleAddTag}
  editingCategoryId={editingCategoryId}
  isAddingCategory={isAddingCategory}
  editingTagId={editingTagId}
  isAddingTag={isAddingTag}
  onCategoryDoubleClick={handleCategoryDoubleClick}
  onCategorySave={handleCategorySave}
  onCategoryEditCancel={handleCategoryEditCancel}
  onTagDoubleClick={handleTagDoubleClick}
  onTagContextMenu={handleTagContextMenu}
  onTagSave={handleTagSave}
  onTagEditCancel={handleTagEditCancel}
/>
```

#### 5. 添加 Tag 右键菜单渲染

```typescript
{/* Tag Context Menu */}
{tagContextMenu && (
  <ContextMenu
    items={[
      {
        label: 'Rename',
        icon: <Pencil size={14} />,
        onClick: handleRenameTag,
      },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        onClick: handleDeleteTag,
        danger: true,
      },
    ]}
    position={tagContextMenu.position}
    onClose={() => setTagContextMenu(null)}
  />
)}
```

#### 6. 添加 Tag 类型导入

```typescript
import type { Category, Tag } from '@/types';
```

---

## 验证要求

1. TypeScript 类型正确
2. 所有 props 正确传递
3. 编辑状态正确同步
4. 右键菜单正常工作
5. 不影响现有功能
