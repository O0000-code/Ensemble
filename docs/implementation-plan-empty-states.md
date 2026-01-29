# 实现计划：Category/Tag 空状态

## 概述

根据信息收集阶段的分析，需要完成以下工作来修复 Bug 并实现 Category/Tag 空状态功能。

## Bug 根本原因

存在**两套独立的筛选状态，但它们没有同步**：

| 状态位置 | 变量名 | 用途 | 更新时机 |
|---------|-------|------|---------|
| appStore | `activeCategory`, `activeTags` | Sidebar UI 显示激活状态 | 用户点击时更新 |
| skillsStore | `filter.category`, `filter.tags` | 实际的列表筛选 | **从未被更新！** |

这导致点击 Category/Tag 后，Sidebar 的高亮状态正确更新，但列表内容没有任何变化。

---

## 实现任务清单

### 任务 1: 修复筛选状态同步（Bug 修复）

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`

**修改内容**:
1. 导入 `useSkillsStore` 和 `useMcpsStore`
2. 添加 `useEffect` 同步 `activeCategory` 和 `activeTags` 到各个 store

**代码修改**:
```tsx
// 在现有 import 后添加（如果未导入）
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';

// 在组件内部添加
const { setFilter: setSkillsFilter } = useSkillsStore();
const { setFilter: setMcpsFilter } = useMcpsStore();

// 在 useEffect 后添加同步逻辑
useEffect(() => {
  setSkillsFilter({ category: activeCategory, tags: activeTags });
  setMcpsFilter({ category: activeCategory, tags: activeTags });
}, [activeCategory, activeTags, setSkillsFilter, setMcpsFilter]);
```

---

### 任务 2: 创建 CategoryEmptyIcon 组件

**新文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/icons/CategoryEmptyIcon.tsx`

**设计规范**:
- 容器尺寸: 44 x 32 px
- 三层堆叠卡片 (36 x 22 px, 圆角 4px)
- 颜色层次: #E4E4E7 (最后层) → #D4D4D8 (中间层) → #A1A1AA (最前层)
- 两条内容暗示线: 16px 和 10px

**SVG 代码**:
```svg
<svg width="44" height="32" viewBox="0 0 44 32" fill="none">
  <!-- Card Back (最后层) -->
  <rect x="8.75" y="10.75" width="34.5" height="20.5" rx="3.25" stroke="#E4E4E7" stroke-width="1.5"/>
  <!-- Card Mid (中间层) -->
  <rect x="4.75" y="5.75" width="34.5" height="20.5" rx="3.25" fill="white" stroke="#D4D4D8" stroke-width="1.5"/>
  <!-- Card Front (最前层) -->
  <rect x="0.75" y="0.75" width="34.5" height="20.5" rx="3.25" fill="white" stroke="#A1A1AA" stroke-width="1.5"/>
  <!-- Content Line 1 -->
  <line x1="6" y1="7" x2="22" y2="7" stroke="#D4D4D8" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Content Line 2 -->
  <line x1="6" y1="12" x2="16" y2="12" stroke="#E4E4E7" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

---

### 任务 3: 创建 TagEmptyIcon 组件

**新文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/icons/TagEmptyIcon.tsx`

**设计规范**:
- 容器尺寸: 44 x 32 px
- 三层堆叠标签 (30 x 16 px, 不对称圆角 [8, 4, 4, 8])
- 每层有 4x4 px 小孔
- 颜色层次: #E4E4E7 → #D4D4D8 → #A1A1AA

**注意**: 不对称圆角需要使用 SVG path 元素

---

### 任务 4: 创建 FilteredEmptyState 组件

**新文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/FilteredEmptyState.tsx`

**组件接口**:
```tsx
interface FilteredEmptyStateProps {
  type: 'category' | 'tag';
}
```

**设计规范**:
- 布局: flex column, items-center, justify-center
- 图标与文字组间距: 20px (mt-5)
- 标题与描述间距: 6px (mt-1.5)
- 标题: Inter 14px/500, #A1A1AA, letter-spacing -0.2px
- 描述: Inter 13px/normal, #D4D4D8, text-center

**文案**:
- Category: "No items in this category" / "Try selecting a different category or add items to this one"
- Tag: "No items with this tag" / "Try selecting a different tag or add this tag to some items"

---

### 任务 5: 更新 common/index.ts 导出

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/index.ts`

**添加导出**:
```tsx
export { FilteredEmptyState } from './FilteredEmptyState';
export { CategoryEmptyIcon } from './icons/CategoryEmptyIcon';
export { TagEmptyIcon } from './icons/TagEmptyIcon';
```

---

### 任务 6: 修改 SkillsPage 使用空状态组件

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx`

**修改内容**:
1. 导入 `FilteredEmptyState` 和 `useAppStore`
2. 修改空状态渲染逻辑，根据筛选类型显示不同的空状态
3. 当显示 Category/Tag 空状态时，隐藏 Status Badge

**关键逻辑**:
```tsx
const { categories, tags } = useAppStore();

const showEmptyState = filteredSkills.length === 0;
const isFilteredByCategory = !!filter.category;
const isFilteredByTag = filter.tags.length > 0;
const shouldHideBadge = showEmptyState && (isFilteredByCategory || isFilteredByTag);

// 渲染逻辑
{showEmptyState ? (
  isFilteredByCategory ? (
    <FilteredEmptyState type="category" />
  ) : isFilteredByTag ? (
    <FilteredEmptyState type="tag" />
  ) : filter.search ? (
    <EmptyState ... /> // 搜索无结果
  ) : (
    <EmptyState ... /> // 无数据
  )
) : (
  // 列表内容
)}
```

---

### 任务 7: 修改 McpServersPage 使用空状态组件

**文件**: `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx`

与 SkillsPage 相同的修改逻辑。

---

## 实现顺序

1. **任务 1**: 修复筛选状态同步（最关键，修复 Bug）
2. **任务 2-3**: 创建图标组件（可并行）
3. **任务 4**: 创建 FilteredEmptyState 组件
4. **任务 5**: 更新导出
5. **任务 6-7**: 修改页面组件（可并行）

---

## 测试验证点

1. ✅ 点击有内容的 Category，列表应只显示该 Category 下的 Skills
2. ✅ 点击没有内容的 Category，应显示 Category 空状态页面
3. ✅ 点击有内容的 Tag，列表应只显示有该 Tag 的 Skills
4. ✅ 点击没有内容的 Tag，应显示 Tag 空状态页面
5. ✅ Sidebar 中的 Category/Tag 高亮状态应正确反映当前选择
6. ✅ 空状态页面的 Header 不应显示 "X enabled" badge
7. ✅ 空状态图标与设计稿 1:1 匹配
8. ✅ 文字样式与设计稿 1:1 匹配
9. ✅ 不影响现有功能（搜索、普通空状态等）

---

## 文件清单

### 新建文件
- `/src/components/common/icons/CategoryEmptyIcon.tsx`
- `/src/components/common/icons/TagEmptyIcon.tsx`
- `/src/components/common/icons/index.ts`
- `/src/components/common/FilteredEmptyState.tsx`

### 修改文件
- `/src/components/layout/MainLayout.tsx` - 添加筛选状态同步
- `/src/components/common/index.ts` - 添加新组件导出
- `/src/pages/SkillsPage.tsx` - 使用新的空状态组件
- `/src/pages/McpServersPage.tsx` - 使用新的空状态组件
