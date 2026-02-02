# Tag 与 Category 计数同步问题分析

## 问题描述

### 问题 1：详情页创建新标签时，左侧栏不显示新标签
当用户在 SkillsPage 的详情面板中创建新 tag 时，该 tag 只被添加到了 skill 上，但没有出现在左侧栏的 tags 列表中。

### 问题 2：Category 筛选工作但计数不更新
虽然 Category 筛选功能正常，但左侧栏的 Category 数字计数没有随着 skill 的 category 变化而更新。

---

## 代码分析

### 1. 标签创建逻辑

#### SkillsPage.tsx - handleAddTag 函数 (第 297-304 行)

```typescript
const handleAddTag = (tagName: string) => {
  if (selectedSkillId && selectedSkill && tagName.trim()) {
    const newTags = [...(selectedSkill.tags || []), tagName.trim()];
    updateSkillTags(selectedSkillId, newTags);
    setTagInputValue('');
    setIsTagInputOpen(false);
  }
};
```

**分析**：
- 该函数只调用了 `updateSkillTags(selectedSkillId, newTags)`
- **没有调用 `appStore.addTag()`**
- 这意味着新标签只被添加到了 skill 的 tags 数组中，但没有被添加到全局 tags 列表

#### skillsStore.ts - updateSkillTags 函数 (第 187-221 行)

```typescript
updateSkillTags: async (id, tags) => {
  // ... 省略非关键代码

  // Optimistic update - 只更新 skill 的 tags 数组
  set((state) => ({
    skills: state.skills.map((s) =>
      s.id === id ? { ...s, tags } : s
    ),
  }));

  try {
    await safeInvoke('update_skill_metadata', {
      skillId: id,
      tags,
    });
  } catch (error) {
    // Rollback on error
  }
}
```

**分析**：
- 该函数只更新了 skill 对象的 tags 属性
- **没有任何逻辑来更新 appStore 的全局 tags 列表**
- **没有任何逻辑来更新 tag 的 count 字段**

---

### 2. 左侧栏显示逻辑

#### Sidebar.tsx

左侧栏显示的 categories 和 tags 来自 props：

```typescript
export interface SidebarProps {
  categories: Category[];
  tags: Tag[];
  // ...
}
```

这些 props 在 MainLayout.tsx 中从 appStore 获取：

```typescript
const {
  categories,
  tags,
  // ...
} = useAppStore();

// 传递给 Sidebar
<Sidebar
  categories={categories}
  tags={tags}
  // ...
/>
```

#### Category 计数显示 (Sidebar.tsx 第 297-299 行)

```typescript
<span className="text-[11px] font-medium text-[#A1A1AA]">
  {category.count}
</span>
```

**分析**：计数直接使用 `category.count` 属性，这是一个静态存储的值。

---

### 3. 类型定义

#### types/index.ts

```typescript
export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;  // 静态存储的计数
}

export interface Tag {
  id: string;
  name: string;
  count: number;  // 静态存储的计数
}
```

**分析**：
- Category 和 Tag 都有 `count` 字段
- 这些是静态存储的值，不是实时计算的

---

### 4. appStore.ts 分析

#### tags 列表的管理

```typescript
// 初始状态
tags: [],

// 加载 tags
loadTags: async () => {
  const tags = await safeInvoke<Tag[]>('get_tags');
  if (tags) {
    set({ tags });
  }
},

// 添加 tag
addTag: async (name: string) => {
  const tag = await safeInvoke<Tag>('add_tag', { name });
  if (tag) {
    set((state) => ({ tags: [...state.tags, tag] }));
    return tag;
  }
  throw new Error('Failed to create tag');
},
```

**分析**：
- appStore 提供了 `addTag()` 方法来创建新标签
- **但是 SkillsPage 的 handleAddTag 没有调用这个方法**

#### Category 计数没有更新机制

appStore 中没有任何方法来更新 category.count：
- 没有 `updateCategoryCount()` 方法
- 没有在 skill category 变化时自动更新 count 的逻辑

---

## 根本原因总结

### 问题 1：详情页创建新标签时，左侧栏不显示

**根本原因**：数据流断裂

```
用户创建新 tag
    ↓
handleAddTag() 调用 updateSkillTags()
    ↓
skillsStore 只更新 skill.tags 数组
    ↓
appStore.tags 列表没有被更新
    ↓
Sidebar 读取 appStore.tags，看不到新 tag
```

**缺失的逻辑**：
1. 当用户在详情页创建新 tag 时，需要检查该 tag 是否已存在于 appStore.tags
2. 如果不存在，需要调用 `appStore.addTag()` 创建新 tag
3. 同时需要更新新 tag 的 count

### 问题 2：Category 筛选工作但计数不更新

**根本原因**：count 是静态值，没有同步机制

```
用户修改 skill 的 category
    ↓
handleCategoryChange() 调用 updateSkillCategory()
    ↓
skillsStore 更新 skill.category
    ↓
appStore.categories[x].count 没有被更新
    ↓
Sidebar 显示旧的 count 值
```

**缺失的逻辑**：
1. 当 skill.category 改变时，需要：
   - 减少旧 category 的 count
   - 增加新 category 的 count
2. 或者改用实时计算 count 的方式

---

## 修复建议

### 方案 A：修改事件处理逻辑（推荐）

#### 修复问题 1

在 `SkillsPage.tsx` 的 `handleAddTag` 中添加逻辑：

```typescript
const handleAddTag = async (tagName: string) => {
  if (selectedSkillId && selectedSkill && tagName.trim()) {
    const trimmedName = tagName.trim();

    // 检查 tag 是否已存在于全局列表
    const existingTag = appTags.find(t => t.name.toLowerCase() === trimmedName.toLowerCase());

    if (!existingTag) {
      // 创建新的全局 tag
      await appStore.addTag(trimmedName);
    }

    // 更新 skill 的 tags
    const newTags = [...(selectedSkill.tags || []), trimmedName];
    updateSkillTags(selectedSkillId, newTags);

    setTagInputValue('');
    setIsTagInputOpen(false);
  }
};
```

#### 修复问题 2

在 `skillsStore.ts` 的 `updateSkillCategory` 中添加 count 更新逻辑：

```typescript
updateSkillCategory: async (id, category) => {
  const skill = get().skills.find((s) => s.id === id);
  if (!skill) return;

  const oldCategory = skill.category;

  // 更新 skill
  set((state) => ({
    skills: state.skills.map((s) =>
      s.id === id ? { ...s, category } : s
    ),
  }));

  // 更新 appStore 中的 category counts
  const appStore = useAppStore.getState();
  if (oldCategory !== category) {
    appStore.updateCategoryCount(oldCategory, -1);
    appStore.updateCategoryCount(category, 1);
  }

  // ... 后续 Tauri 调用
}
```

需要在 `appStore.ts` 中添加 `updateCategoryCount` 方法。

### 方案 B：实时计算 count

不再存储静态 count，而是在需要时实时计算：

```typescript
// 在 Sidebar 或 MainLayout 中
const categoriesWithCount = useMemo(() => {
  return categories.map(cat => ({
    ...cat,
    count: skills.filter(s => s.category === cat.name).length
  }));
}, [categories, skills]);

const tagsWithCount = useMemo(() => {
  return tags.map(tag => ({
    ...tag,
    count: skills.filter(s => s.tags.includes(tag.name)).length
  }));
}, [tags, skills]);
```

这种方案需要将 skills 数据传递给 Sidebar 或在更高层级计算。

---

## 数据流图

### 当前数据流（有问题）

```
┌─────────────────────────────────────────────────────────────────┐
│                        SkillsPage                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ handleAddTag(tagName)                                   │    │
│  │   └─> updateSkillTags(skillId, newTags)                │    │
│  │         └─> skill.tags = [..., tagName]  ✓            │    │
│  │                                                         │    │
│  │   ✗ 没有调用 appStore.addTag()                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        appStore                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ tags: Tag[]  ← 没有被更新，仍然是旧列表                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Sidebar                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 显示 appStore.tags → 看不到新 tag                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 期望数据流（修复后）

```
┌─────────────────────────────────────────────────────────────────┐
│                        SkillsPage                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ handleAddTag(tagName)                                   │    │
│  │   ├─> 检查 appStore.tags 是否已有此 tag                │    │
│  │   ├─> 如果没有，调用 appStore.addTag()  ← 新增          │    │
│  │   └─> updateSkillTags(skillId, newTags)                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        appStore                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ tags: Tag[]  ← 新 tag 被添加，count 被更新              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Sidebar                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 显示 appStore.tags → 能看到新 tag 和正确的 count        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 相关文件清单

| 文件路径 | 相关功能 |
|---------|---------|
| `/src/pages/SkillsPage.tsx` | handleAddTag, handleCategoryChange |
| `/src/stores/skillsStore.ts` | updateSkillTags, updateSkillCategory |
| `/src/stores/appStore.ts` | tags, categories, addTag |
| `/src/components/layout/Sidebar.tsx` | 显示 categories 和 tags 列表 |
| `/src/components/layout/MainLayout.tsx` | 连接 appStore 和 Sidebar |
| `/src/types/index.ts` | Category, Tag 类型定义 |

---

## 后续行动项

1. [ ] 修改 `SkillsPage.tsx` 的 `handleAddTag` 函数，在创建新 tag 时同步更新 appStore
2. [ ] 在 `appStore.ts` 中添加 `updateCategoryCount` 和 `updateTagCount` 方法
3. [ ] 修改 `skillsStore.ts` 的 `updateSkillCategory` 和 `updateSkillTags` 函数，同步更新 count
4. [ ] 考虑是否改用实时计算 count 的方案以简化逻辑
5. [ ] 添加单元测试验证同步逻辑
