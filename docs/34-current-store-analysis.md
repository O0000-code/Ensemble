# Categories & Tags Store 状态管理分析

## 1. 概述

本文档分析 Ensemble 应用中与 Categories（类别）和 Tags（标签）相关的 store 状态管理实现。通过分析，我们可以了解当前的实现情况，以及为实现内联编辑功能需要添加哪些状态和 actions。

## 2. 相关文件列表

### 前端文件

| 文件路径 | 说明 |
|---------|------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/index.ts` | Store 导出入口 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/appStore.ts` | **主要文件** - Categories 和 Tags 的状态管理 |
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/types/index.ts` | Category 和 Tag 的类型定义 |

### 后端文件（Tauri/Rust）

| 文件路径 | 说明 |
|---------|------|
| `/Users/bo/Documents/Development/Ensemble/Ensemble2/src-tauri/src/commands/data.rs` | Categories 和 Tags 的 CRUD 命令 |

## 3. Categories 相关 State 和 Actions 详细分析

### 3.1 State 定义

在 `appStore.ts` 中：

```typescript
interface AppState {
  // Navigation state (frontend-only)
  activeCategory: string | null;  // 当前选中的类别 ID

  // Data
  categories: Category[];  // 所有类别列表

  // ... 其他 state
}
```

### 3.2 现有 Actions

| Action | 签名 | 说明 |
|--------|------|------|
| `setActiveCategory` | `(categoryId: string \| null) => void` | 设置当前选中的类别 |
| `setCategories` | `(categories: Category[]) => void` | 批量设置类别数据 |
| `loadCategories` | `() => Promise<void>` | 从后端加载类别列表 |
| `addCategory` | `(name: string, color: string) => Promise<Category>` | **新增类别** |
| `updateCategory` | `(id: string, name?: string, color?: string) => Promise<void>` | **更新（重命名）类别** |
| `deleteCategory` | `(id: string) => Promise<void>` | 删除类别 |

### 3.3 关键代码片段

#### 新增类别

```typescript
addCategory: async (name: string, color: string) => {
  if (!isTauri()) {
    throw new Error('Not available in browser mode');
  }

  try {
    const category = await safeInvoke<Category>('add_category', { name, color });
    if (category) {
      set((state) => ({ categories: [...state.categories, category] }));
      return category;
    }
    throw new Error('Failed to create category');
  } catch (error) {
    // 错误处理...
  }
},
```

#### 更新类别

```typescript
updateCategory: async (id: string, name?: string, color?: string) => {
  if (!isTauri()) {
    throw new Error('Not available in browser mode');
  }

  try {
    await safeInvoke('update_category', { id, name, color });
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id
          ? { ...c, ...(name !== undefined && { name }), ...(color !== undefined && { color }) }
          : c
      ),
    }));
  } catch (error) {
    // 错误处理...
  }
},
```

## 4. Tags 相关 State 和 Actions 详细分析

### 4.1 State 定义

在 `appStore.ts` 中：

```typescript
interface AppState {
  // Navigation state (frontend-only)
  activeTags: string[];  // 当前选中的标签 ID 列表

  // Data
  tags: Tag[];  // 所有标签列表

  // ... 其他 state
}
```

### 4.2 现有 Actions

| Action | 签名 | 说明 |
|--------|------|------|
| `toggleActiveTag` | `(tagId: string) => void` | 切换标签的选中状态 |
| `clearActiveTags` | `() => void` | 清除所有选中的标签 |
| `setTags` | `(tags: Tag[]) => void` | 批量设置标签数据 |
| `loadTags` | `() => Promise<void>` | 从后端加载标签列表 |
| `addTag` | `(name: string) => Promise<Tag>` | **新增标签** |
| `deleteTag` | `(id: string) => Promise<void>` | 删除标签 |

### 4.3 关键代码片段

#### 新增标签

```typescript
addTag: async (name: string) => {
  if (!isTauri()) {
    throw new Error('Not available in browser mode');
  }

  try {
    const tag = await safeInvoke<Tag>('add_tag', { name });
    if (tag) {
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    }
    throw new Error('Failed to create tag');
  } catch (error) {
    // 错误处理...
  }
},
```

## 5. 类型定义分析

在 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/types/index.ts` 中：

### Category 类型

```typescript
export interface Category {
  id: string;      // 唯一标识符
  name: string;    // 类别名称
  color: string;   // 颜色值（如 "#3B82F6"）
  count: number;   // 关联项目数量
}
```

### Tag 类型

```typescript
export interface Tag {
  id: string;      // 唯一标识符
  name: string;    // 标签名称
  count: number;   // 关联项目数量
}
```

## 6. 编辑状态管理现状

### 6.1 当前状态

**目前 appStore 中没有任何与编辑状态相关的字段。**

经过搜索，整个项目中没有发现：
- `editingId`
- `isAdding`
- `isEditing`
- `renaming` 等相关字段

这意味着侧边栏的内联编辑功能完全缺失前端状态支持。

### 6.2 后端支持情况

后端已经实现了必要的 CRUD 操作：

| 命令 | 状态 | 说明 |
|------|------|------|
| `add_category` | 已实现 | 添加类别 |
| `update_category` | 已实现 | 更新类别（支持 name 和 color） |
| `delete_category` | 已实现 | 删除类别 |
| `add_tag` | 已实现 | 添加标签 |
| `delete_tag` | 已实现 | 删除标签 |
| `update_tag` | **未实现** | 更新（重命名）标签 |

## 7. 缺失的功能

### 7.1 前端 Store 缺失

需要在 `appStore.ts` 中添加以下状态和 actions：

#### 新增 State

```typescript
interface AppState {
  // ... 现有 state

  // 编辑状态 - Categories
  editingCategoryId: string | null;  // 正在编辑的类别 ID
  isAddingCategory: boolean;          // 是否正在添加新类别

  // 编辑状态 - Tags
  editingTagId: string | null;        // 正在编辑的标签 ID
  isAddingTag: boolean;               // 是否正在添加新标签
}
```

#### 新增 Actions

```typescript
interface AppState {
  // ... 现有 actions

  // 编辑状态 Actions - Categories
  startEditingCategory: (id: string) => void;
  stopEditingCategory: () => void;
  startAddingCategory: () => void;
  stopAddingCategory: () => void;

  // 编辑状态 Actions - Tags
  startEditingTag: (id: string) => void;
  stopEditingTag: () => void;
  startAddingTag: () => void;
  stopAddingTag: () => void;

  // Tag 重命名
  updateTag: (id: string, name: string) => Promise<void>;
}
```

### 7.2 后端缺失

需要在 `src-tauri/src/commands/data.rs` 中添加：

```rust
/// Update a tag (rename)
#[tauri::command]
pub fn update_tag(id: String, name: String) -> Result<(), String> {
    let mut data = read_app_data()?;

    if let Some(tag) = data.tags.iter_mut().find(|t| t.id == id) {
        tag.name = name;
        write_app_data(data)?;
        Ok(())
    } else {
        Err("Tag not found".to_string())
    }
}
```

同时需要在 `src-tauri/src/lib.rs` 中注册该命令。

## 8. 实现建议

### 8.1 状态管理策略

建议使用**互斥状态设计**，确保同一时刻只能有一个编辑/添加状态：

```typescript
// 在设置新编辑状态前，清除所有其他编辑状态
const clearAllEditingStates = () => set({
  editingCategoryId: null,
  isAddingCategory: false,
  editingTagId: null,
  isAddingTag: false,
});

// 开始编辑类别时
startEditingCategory: (id: string) => {
  clearAllEditingStates();
  set({ editingCategoryId: id });
},
```

### 8.2 状态流转

```
┌─────────────────────────────────────────────────────────────┐
│                       空闲状态                               │
│  editingCategoryId: null                                    │
│  isAddingCategory: false                                    │
│  editingTagId: null                                         │
│  isAddingTag: false                                         │
└─────────────────────────────────────────────────────────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ 编辑类别  │   │ 新增类别  │   │ 编辑标签  │   │ 新增标签  │
   │ (互斥)   │   │ (互斥)   │   │ (互斥)   │   │ (互斥)   │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### 8.3 实现优先级

1. **第一步**：在后端添加 `update_tag` 命令
2. **第二步**：在前端 store 添加编辑状态字段和 actions
3. **第三步**：在组件中使用这些状态实现 UI

### 8.4 组件使用示例

```typescript
// 在侧边栏组件中
const {
  categories,
  editingCategoryId,
  isAddingCategory,
  startEditingCategory,
  stopEditingCategory,
  startAddingCategory,
  addCategory,
  updateCategory,
} = useAppStore();

// 处理双击进入编辑模式
const handleCategoryDoubleClick = (id: string) => {
  startEditingCategory(id);
};

// 处理点击 + 按钮
const handleAddCategoryClick = () => {
  startAddingCategory();
};

// 处理保存
const handleSave = async (id: string, name: string) => {
  if (isAddingCategory) {
    await addCategory(name, '#A1A1AA'); // 使用默认颜色
  } else {
    await updateCategory(id, name);
  }
  stopEditingCategory();
};
```

## 9. 总结

| 功能 | 后端状态 | 前端状态 | 需要添加 |
|------|---------|---------|---------|
| 新增类别 | 已实现 | 已实现（缺少 UI 状态） | 前端：`isAddingCategory` |
| 编辑类别 | 已实现 | 已实现（缺少 UI 状态） | 前端：`editingCategoryId` |
| 删除类别 | 已实现 | 已实现 | 无 |
| 新增标签 | 已实现 | 已实现（缺少 UI 状态） | 前端：`isAddingTag` |
| 编辑标签 | **未实现** | **未实现** | 后端：`update_tag`，前端：`updateTag` + `editingTagId` |
| 删除标签 | 已实现 | 已实现 | 无 |

核心发现：
1. 后端 CRUD 基本完整，仅缺少 `update_tag`
2. 前端数据操作 actions 已完整
3. **前端完全缺少编辑状态管理**（无 `editingId`、`isAdding` 等字段）
4. 需要添加互斥的编辑状态管理机制
