# SubAgent 执行规划文档 - 第三轮：Category/Tag 独立页面

## 任务目标

创建 Category 和 Tag 的独立聚合页面，展示该 Category/Tag 下的所有 Skills + MCPs。

## 必须阅读的文档

每个 SubAgent 在执行前**必须**先阅读以下文档：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/implementation-plan-category-tag-pages.md`

## 页面设计规范（从设计稿 xzUxa）

### Header
- 布局: justify-between, padding: 0 28px, height: 56px
- 左侧: 页面标题（Category/Tag 名称），16px weight 600, #18181B
- 右侧: 搜索框 + Auto Classify 按钮

### Content Area
- 布局: vertical, gap: 32px, padding: 24px 28px
- 两个 Section: Skills Section + MCP Section

### Section 结构
```
Section Header: icon + "Skills (48)" 或 "MCP Servers (6)"
  - gap: 8px
  - padding-bottom: 8px
  - icon: 14px, #71717A
  - text: Inter 12px weight 600, #71717A

Item List: gap: 12px
  - 复用现有的 SkillItem / McpItem 组件
```

## SubAgent 分工

### SubAgent A: 创建 CategoryPage 组件

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/CategoryPage.tsx`

**执行步骤**:
1. 读取设计分析和现有页面组件作为参考：
   - `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx`
   - `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/skills/SkillItem.tsx`
2. 创建 CategoryPage 组件

**组件结构**:
```tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Plug, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';
import PageHeader from '@/components/layout/PageHeader';
import SkillItem from '@/components/skills/SkillItem';
import McpItem from '@/components/mcps/McpItem';
import { FilteredEmptyState } from '@/components/common/FilteredEmptyState';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // 从 stores 获取数据
  const { categories } = useAppStore();
  const { skills, toggleSkill } = useSkillsStore();
  const { mcps, toggleMcp } = useMcpsStore();

  // 查找当前 category
  const category = categories.find(c => c.id === categoryId);

  // 筛选该 category 下的 skills 和 mcps
  const filteredSkills = skills.filter(s => s.category === categoryId);
  const filteredMcps = mcps.filter(m => m.category === categoryId);

  // 空状态
  if (filteredSkills.length === 0 && filteredMcps.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader
          title={category?.name || 'Unknown Category'}
          searchValue=""
          onSearchChange={() => {}}
          searchPlaceholder="Search..."
        />
        <div className="flex-1">
          <FilteredEmptyState type="category" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader
        title={category?.name || 'Unknown Category'}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        actions={<AutoClassifyButton />}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="flex flex-col gap-8">
          {/* Skills Section */}
          {filteredSkills.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2">
                <Sparkles size={14} className="text-[#71717A]" />
                <span className="text-xs font-semibold text-[#71717A]">
                  Skills ({filteredSkills.length})
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {filteredSkills.map(skill => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    variant="full"
                    onClick={() => navigate(`/skills/${skill.id}`)}
                    onToggle={(enabled) => toggleSkill(skill.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* MCP Section */}
          {filteredMcps.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2">
                <Plug size={14} className="text-[#71717A]" />
                <span className="text-xs font-semibold text-[#71717A]">
                  MCP Servers ({filteredMcps.length})
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {filteredMcps.map(mcp => (
                  <McpItem
                    key={mcp.id}
                    mcp={mcp}
                    onClick={() => navigate(`/mcp-servers/${mcp.id}`)}
                    onToggle={(enabled) => toggleMcp(mcp.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### SubAgent B: 创建 TagPage 组件

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/TagPage.tsx`

**执行步骤**: 与 CategoryPage 类似，但按 Tag 筛选

**关键区别**:
- 使用 `const { tagId } = useParams<{ tagId: string }>()`
- 筛选: `skills.filter(s => s.tags.includes(tagId))`
- 空状态: `<FilteredEmptyState type="tag" />`

---

### SubAgent C: 添加路由和导出

**修改文件**:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/App.tsx` - 添加路由
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/index.ts` (如果存在) - 添加导出

**路由添加**:
```tsx
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';

// 在 Routes 中添加
<Route path="category/:categoryId" element={<CategoryPage />} />
<Route path="tag/:tagId" element={<TagPage />} />
```

---

### SubAgent D: 修改 Sidebar 导航逻辑

**修改文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/Sidebar.tsx`

**修改内容**:

1. Category 点击改为导航:
```tsx
// 原来
onClick={() => onCategoryChange(isActive ? null : category.id)}

// 修改为
onClick={() => {
  if (isActive) {
    navigate('/skills'); // 取消选择时回到 Skills 页面
  } else {
    navigate(`/category/${category.id}`);
  }
}}
```

2. Tag 点击改为导航:
```tsx
// 原来
onClick={() => onTagToggle(tag.id)}

// 修改为
onClick={() => {
  if (isActive) {
    navigate('/skills'); // 取消选择时回到 Skills 页面
  } else {
    navigate(`/tag/${tag.id}`);
  }
}}
```

3. 可能需要修改 `activeCategory` 和 `activeTags` 的判断逻辑，使其基于当前路由

---

### SubAgent E: 修改 MainLayout 适配

**修改文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**修改内容**:
1. 使用 `useLocation` 和 `useParams` 来判断当前是否在 Category/Tag 页面
2. 传递正确的 `activeCategory` 和 `activeTags` 给 Sidebar

```tsx
import { useLocation, useParams } from 'react-router-dom';

// 在组件中
const location = useLocation();

// 判断当前路由
const categoryMatch = location.pathname.match(/^\/category\/(.+)$/);
const tagMatch = location.pathname.match(/^\/tag\/(.+)$/);

const currentCategoryId = categoryMatch ? categoryMatch[1] : null;
const currentTagId = tagMatch ? tagMatch[1] : null;

// 传递给 Sidebar
<Sidebar
  activeCategory={currentCategoryId}
  activeTags={currentTagId ? [currentTagId] : []}
  // ...
/>
```

---

## 执行约束

1. 确保导入路径正确（使用 `@/` 别名或相对路径）
2. 确保 TypeScript 类型正确
3. 复用现有组件（SkillItem, McpItem, PageHeader, FilteredEmptyState）
4. 使用 Edit 工具修改现有文件，Write 工具创建新文件

## 项目路径

- 项目根目录：`/Users/bo/Documents/Development/Ensemble/Ensemble2`
- 源代码目录：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src`
