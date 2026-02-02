# Category 和 Tag 数据流同步问题分析

## 问题描述

用户在 Skills/MCP 详情页选择 Category 或 Tag 后，左侧栏对应的 Categories 或 Tags 页面里面不会显示这些分类后的项目。

## 根本原因

**数据类型不匹配：Category 使用 `name` 存储，而筛选页面使用 `id` 进行比对。**

---

## 详细分析

### 1. 数据结构定义

#### Category 类型 (`src/types/index.ts`)
```typescript
export interface Category {
  id: string;      // UUID，如 "abc-123-def"
  name: string;    // 显示名称，如 "Development"
  color: string;   // 颜色值
  count: number;   // 计数
}
```

#### Tag 类型 (`src/types/index.ts`)
```typescript
export interface Tag {
  id: string;      // UUID，如 "xyz-789-uvw"
  name: string;    // 显示名称，如 "Frontend"
  count: number;   // 计数
}
```

#### Skill/McpServer 中的存储方式 (`src/types/index.ts`)
```typescript
export interface Skill {
  // ...
  category: string;  // 存储的是 category NAME，不是 ID
  tags: string[];    // 存储的是 tag NAME 数组，不是 ID 数组
}

export interface McpServer {
  // ...
  category: string;  // 存储的是 category NAME，不是 ID
  tags: string[];    // 存储的是 tag NAME 数组，不是 ID 数组
}
```

### 2. 详情页保存 Category 的逻辑

#### SkillsPage.tsx (第 194-202 行)
```typescript
// Category dropdown options - only use categories from appStore
const categoryOptions = useMemo(() => {
  const options = categories.map(cat => ({
    value: cat.name,   // 使用 NAME 作为 value
    label: cat.name,
    color: cat.color || '#71717A',
  }));
  return [{ value: '', label: 'Uncategorized', color: '#71717A' }, ...options];
}, [categories]);
```

#### 保存时 (第 290-294 行)
```typescript
const handleCategoryChange = (category: string | string[]) => {
  if (selectedSkillId && typeof category === 'string') {
    updateSkillCategory(selectedSkillId, category);  // 保存的是 NAME
  }
};
```

**结论：详情页将 category.name 保存到 skill.category**

### 3. 详情页保存 Tag 的逻辑

#### SkillsPage.tsx (第 296-304 行)
```typescript
const handleAddTag = (tagName: string) => {
  if (selectedSkillId && selectedSkill && tagName.trim()) {
    const newTags = [...(selectedSkill.tags || []), tagName.trim()];  // 使用 tag NAME
    updateSkillTags(selectedSkillId, newTags);  // 保存的是 NAME 数组
    // ...
  }
};
```

**结论：详情页将 tag.name 保存到 skill.tags 数组**

### 4. 侧边栏的路由导航

#### Sidebar.tsx (第 264-269 行)
```typescript
onClick={() => {
  if (isActive) {
    navigate('/skills');
  } else {
    navigate(`/category/${category.id}`);  // 使用 category.id 作为 URL 参数
  }
}}
```

```typescript
onClick={() => {
  if (isActive) {
    navigate('/skills');
  } else {
    navigate(`/tag/${tag.id}`);  // 使用 tag.id 作为 URL 参数
  }
}}
```

**结论：侧边栏点击时，路由参数使用的是 id**

### 5. CategoryPage 的筛选逻辑

#### CategoryPage.tsx (第 32-36 行)
```typescript
// Filter skills and mcps by category, then by search
const filteredData = useMemo(() => {
  // First filter by category
  const categorySkills = skills.filter((s) => s.category === categoryId);  // 用 URL 的 categoryId 匹配 skill.category
  const categoryMcps = mcpServers.filter((m) => m.category === categoryId);
  // ...
}, [skills, mcpServers, categoryId, search]);
```

**问题所在：**
- `categoryId` 是从 URL 获取的 **category.id** (如 "abc-123-def")
- `s.category` 存储的是 **category.name** (如 "Development")
- 比较 `"abc-123-def" === "Development"` 永远为 `false`

### 6. TagPage 的筛选逻辑

#### TagPage.tsx (第 33-38 行)
```typescript
// Filter skills and MCPs that have this tag
const filteredSkills = skills.filter((s) =>
  tagId && s.tags.includes(tagId)  // 用 URL 的 tagId 检查 skill.tags 数组
);
const filteredMcps = mcpServers.filter((m) =>
  tagId && m.tags.includes(tagId)
);
```

**问题所在：**
- `tagId` 是从 URL 获取的 **tag.id** (如 "xyz-789-uvw")
- `s.tags` 存储的是 **tag.name 数组** (如 ["Frontend", "React"])
- 检查 `["Frontend", "React"].includes("xyz-789-uvw")` 永远为 `false`

---

## 数据流图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           详情页保存 Category                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dropdown options:                                                          │
│  ┌──────────────────────────┐                                               │
│  │ value: category.NAME     │ ──→ updateSkillCategory(id, NAME) ──→        │
│  │ label: category.name     │                                               │
│  └──────────────────────────┘                                               │
│                                                                             │
│  skill.category = "Development" (NAME)                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           CategoryPage 筛选                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  URL: /category/abc-123-def                                                 │
│  categoryId = "abc-123-def" (ID)                                            │
│                                                                             │
│  筛选条件:                                                                   │
│  skill.category === categoryId                                              │
│  "Development" === "abc-123-def"  ──→  FALSE (永远不匹配!)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 解决方案

### 方案 A：修改筛选页面逻辑（推荐）

在 CategoryPage 和 TagPage 中，先通过 id 找到对应的 name，再用 name 进行筛选。

#### CategoryPage.tsx 修改
```typescript
const filteredData = useMemo(() => {
  // 先通过 categoryId 找到对应的 category name
  const category = categories.find((c) => c.id === categoryId);
  const categoryName = category?.name;

  // 使用 name 进行筛选
  const categorySkills = skills.filter((s) => s.category === categoryName);
  const categoryMcps = mcpServers.filter((m) => m.category === categoryName);
  // ...
}, [skills, mcpServers, categoryId, categories, search]);
```

#### TagPage.tsx 修改
```typescript
const tag = tags.find((t) => t.id === tagId);
const tagName = tag?.name;

const filteredSkills = skills.filter((s) =>
  tagName && s.tags.includes(tagName)
);
const filteredMcps = mcpServers.filter((m) =>
  tagName && m.tags.includes(tagName)
);
```

### 方案 B：修改详情页保存逻辑

将 skill.category 和 skill.tags 改为存储 id 而非 name。

**缺点：**
- 需要修改后端 Tauri 命令
- 需要修改数据持久化逻辑
- 需要数据迁移

### 方案 C：统一使用 name 作为路由参数

将侧边栏路由改为 `/category/${encodeURIComponent(category.name)}`。

**缺点：**
- URL 可能包含特殊字符
- category name 可能重复（虽然实际上不应该）
- 不符合 REST 风格

---

## 推荐实施方案 A

### 修改文件清单

1. **`src/pages/CategoryPage.tsx`**
   - 导入 `categories` from `useAppStore`
   - 添加 id 到 name 的映射逻辑

2. **`src/pages/TagPage.tsx`**
   - 已经导入了 `tags`
   - 修改筛选逻辑使用 tag.name

### 具体代码修改

#### CategoryPage.tsx

```diff
  // Get data from stores
- const { categories } = useAppStore();
+ const { categories } = useAppStore();
  const { skills, toggleSkill, autoClassify, isClassifying } = useSkillsStore();
  const { mcpServers, toggleMcp } = useMcpsStore();

  // Find current category
  const category = categories.find((c) => c.id === categoryId);
+ const categoryName = category?.name;

  // Filter skills and mcps by category, then by search
  const filteredData = useMemo(() => {
    // First filter by category
-   const categorySkills = skills.filter((s) => s.category === categoryId);
-   const categoryMcps = mcpServers.filter((m) => m.category === categoryId);
+   const categorySkills = skills.filter((s) => s.category === categoryName);
+   const categoryMcps = mcpServers.filter((m) => m.category === categoryName);

    // ...
- }, [skills, mcpServers, categoryId, search]);
+ }, [skills, mcpServers, categoryName, search]);
```

#### TagPage.tsx

```diff
  // Find the current tag
  const tag = tags.find((t) => t.id === tagId);
+ const tagName = tag?.name;

  // Filter skills and MCPs that have this tag
  const filteredSkills = skills.filter((s) =>
-   tagId && s.tags.includes(tagId)
+   tagName && s.tags.includes(tagName)
  );
  const filteredMcps = mcpServers.filter((m) =>
-   tagId && m.tags.includes(tagId)
+   tagName && m.tags.includes(tagName)
  );
```

---

## 总结

| 位置 | 存储/使用的值 | 实际类型 |
|------|--------------|----------|
| Dropdown value | category.name | NAME |
| skill.category | category name | NAME |
| skill.tags | tag name 数组 | NAME[] |
| URL 参数 categoryId | category.id | ID |
| URL 参数 tagId | tag.id | ID |
| CategoryPage 筛选 | 使用 categoryId (ID) 比对 skill.category (NAME) | **不匹配** |
| TagPage 筛选 | 使用 tagId (ID) 比对 skill.tags (NAME[]) | **不匹配** |

**核心问题：ID 和 NAME 的混用导致筛选失败。**

推荐采用**方案 A**，在筛选页面中先将 ID 转换为 NAME，再进行比对。这是最小改动且不影响现有数据存储结构的解决方案。
