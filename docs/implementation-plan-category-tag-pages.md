# 实现计划：Category/Tag 独立页面

## 正确理解

Category 和 Tag 是**独立的聚合页面**，不是 Skills/MCP 的筛选视图：

- 点击 "Development" Category → 进入独立页面，展示该 Category 下的**所有 Skills + 所有 MCPs**
- 点击 "React" Tag → 进入独立页面，展示该 Tag 下的**所有 Skills + 所有 MCPs**

## 设计稿参考

- **Category 页面（有内容）**: `xzUxa` - "Ensemble - Skills (Filtered by Category)"
- **Tag 页面（有内容）**: `vjc0x` - "Ensemble - Skills (Filtered by Tag)"
- **Category 页面（空）**: `ytMhv` - "Ensemble - Skills (Filtered by Category, Empty)"
- **Tag 页面（空）**: `ZIFP8` - "Ensemble - Skills (Filtered by Tag, Empty)"

## 页面结构（从设计稿）

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Category/Tag Name]    [Search]    [Auto Classify]  │
├─────────────────────────────────────────────────────────────┤
│ Content Area                                                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Skills (4)                                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [Skill Item 1]                                          │ │
│ │ [Skill Item 2]                                          │ │
│ │ [Skill Item 3]                                          │ │
│ │ [Skill Item 4]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MCP Servers (5)                                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [MCP Item 1]                                            │ │
│ │ [MCP Item 2]                                            │ │
│ │ ...                                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 实现任务

### 任务 1: 创建 CategoryPage 组件

**文件**: `/src/pages/CategoryPage.tsx`

**功能**:
- 从 URL 参数获取 categoryId
- 从 stores 获取该 Category 下的 Skills 和 MCPs
- 展示两个分组的列表
- 空状态时显示 FilteredEmptyState

**Props**: 无（从 URL 获取参数）

### 任务 2: 创建 TagPage 组件

**文件**: `/src/pages/TagPage.tsx`

**功能**: 与 CategoryPage 类似，但按 Tag 筛选

### 任务 3: 添加路由

**文件**: `/src/App.tsx` 或 `/src/routes.tsx`

**添加路由**:
```tsx
<Route path="/category/:categoryId" element={<CategoryPage />} />
<Route path="/tag/:tagId" element={<TagPage />} />
```

### 任务 4: 修改 Sidebar 导航逻辑

**文件**: `/src/components/layout/Sidebar.tsx`

**修改**: Category/Tag 点击应该导航到对应页面，而不是设置筛选状态

```tsx
// Category 点击
onClick={() => navigate(`/category/${category.id}`)}

// Tag 点击
onClick={() => navigate(`/tag/${tag.id}`)}
```

### 任务 5: 修改 MainLayout（可能需要调整）

**文件**: `/src/components/layout/MainLayout.tsx`

**检查**:
- 可能需要移除之前添加的筛选状态同步
- 或者保留用于其他用途

### 任务 6: 创建 SectionHeader 组件（可选）

**文件**: `/src/components/common/SectionHeader.tsx`

用于显示 "Skills (4)" 这样的分组标题

## 组件复用

### 已有组件
- `SkillItem` - 展示单个 Skill
- `McpItem` - 展示单个 MCP
- `PageHeader` - 页面头部
- `FilteredEmptyState` - 空状态组件
- `CategoryEmptyIcon` / `TagEmptyIcon` - 空状态图标

### 新建组件
- `CategoryPage` - Category 聚合页面
- `TagPage` - Tag 聚合页面
- `SectionHeader` - 分组标题（可选，可内联）

## 路由结构

```
/skills                    → SkillsPage
/skills/:skillId           → SkillDetailPage
/mcp-servers               → McpServersPage
/mcp-servers/:mcpId        → McpDetailPage
/scenes                    → ScenesPage
/projects                  → ProjectsPage
/settings                  → SettingsPage
/category/:categoryId      → CategoryPage (新增)
/tag/:tagId                → TagPage (新增)
```

## 注意事项

1. **Sidebar 高亮**: 当在 Category/Tag 页面时，对应的 Category/Tag 应该高亮
2. **导航返回**: 可能需要面包屑或返回按钮
3. **搜索功能**: Category/Tag 页面的搜索应该在该页面内搜索
4. **空状态**: 使用已创建的 FilteredEmptyState 组件
