# SubAgent 执行规划文档 - 第二轮：核心实现

## 任务目标

实现 Category/Tag 空状态功能的核心代码。

## 必须阅读的文档

每个 SubAgent 在执行前**必须**先阅读以下文档：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/task-category-tag-empty-state-understanding.md` - 任务理解
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/implementation-plan-empty-states.md` - 实现计划
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design-analysis-empty-states.md` - 设计规范

## SubAgent 分工

### SubAgent A: 修复筛选状态同步

**任务**: 修改 MainLayout.tsx，添加 appStore 到 skillsStore/mcpsStore 的状态同步

**执行步骤**:
1. 读取当前的 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/layout/MainLayout.tsx`
2. 读取 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/skillsStore.ts` 确认 setFilter 接口
3. 读取 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores/mcpsStore.ts` 确认 setFilter 接口
4. 在 MainLayout.tsx 中:
   - 确保导入 `useSkillsStore` 和 `useMcpsStore`
   - 从这两个 store 获取 `setFilter` 方法（重命名以区分）
   - 添加 useEffect 同步筛选状态

**代码修改要点**:
```tsx
// 导入（如果未导入）
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';

// 在组件内部
const { setFilter: setSkillsFilter } = useSkillsStore();
const { setFilter: setMcpsFilter } = useMcpsStore();

// 添加同步 effect
useEffect(() => {
  setSkillsFilter({ category: activeCategory, tags: activeTags });
  setMcpsFilter({ category: activeCategory, tags: activeTags });
}, [activeCategory, activeTags, setSkillsFilter, setMcpsFilter]);
```

**输出**: 修改后的 MainLayout.tsx 文件

---

### SubAgent B: 创建图标组件目录和 CategoryEmptyIcon

**任务**: 创建 icons 目录，实现 CategoryEmptyIcon 组件

**执行步骤**:
1. 阅读设计规范文档中的 Category 图标详细设计
2. 创建目录 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/icons/`
3. 创建 `CategoryEmptyIcon.tsx` 文件

**组件代码**:
```tsx
import React from 'react';

interface CategoryEmptyIconProps {
  className?: string;
}

export const CategoryEmptyIcon: React.FC<CategoryEmptyIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="44"
      height="32"
      viewBox="0 0 44 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card Back (最后层) */}
      <rect
        x="8.75"
        y="10.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        stroke="#E4E4E7"
        strokeWidth="1.5"
      />
      {/* Card Mid (中间层) */}
      <rect
        x="4.75"
        y="5.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        fill="white"
        stroke="#D4D4D8"
        strokeWidth="1.5"
      />
      {/* Card Front (最前层) */}
      <rect
        x="0.75"
        y="0.75"
        width="34.5"
        height="20.5"
        rx="3.25"
        fill="white"
        stroke="#A1A1AA"
        strokeWidth="1.5"
      />
      {/* Content Line 1 */}
      <line
        x1="6"
        y1="7"
        x2="22"
        y2="7"
        stroke="#D4D4D8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Content Line 2 */}
      <line
        x1="6"
        y1="12"
        x2="16"
        y2="12"
        stroke="#E4E4E7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CategoryEmptyIcon;
```

4. 创建 `index.ts` 导出文件

**输出**:
- `/src/components/common/icons/CategoryEmptyIcon.tsx`
- `/src/components/common/icons/index.ts`

---

### SubAgent C: 创建 TagEmptyIcon 组件

**任务**: 实现 TagEmptyIcon 组件

**执行步骤**:
1. 阅读设计规范文档中的 Tag 图标详细设计
2. 创建 `TagEmptyIcon.tsx` 文件

**设计要点**:
- 三层堆叠标签形状
- 尺寸: 30 x 16 px 每层
- 不对称圆角: [8, 4, 4, 8] (左侧圆角大，右侧圆角小)
- 每层有 4x4 px 圆形小孔
- 颜色: #E4E4E7 → #D4D4D8 → #A1A1AA

**注意**: 不对称圆角需要使用 SVG path 元素实现

**参考 SVG 结构**:
```svg
<!-- 标签形状使用 path 实现不对称圆角 -->
<!-- 左侧圆角 8px，右侧圆角 4px -->
<path d="M8 0.75 H25.25 A3.25 3.25 0 0 1 28.5 4 V12 A3.25 3.25 0 0 1 25.25 15.25 H8 A7.25 7.25 0 0 1 0.75 8 V8 A7.25 7.25 0 0 1 8 0.75 Z" />
```

3. 更新 `icons/index.ts` 添加 TagEmptyIcon 导出

**输出**:
- `/src/components/common/icons/TagEmptyIcon.tsx`
- 更新 `/src/components/common/icons/index.ts`

---

### SubAgent D: 创建 FilteredEmptyState 组件

**任务**: 实现统一的 Category/Tag 空状态组件

**执行步骤**:
1. 阅读设计规范文档
2. 创建 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/FilteredEmptyState.tsx`

**组件代码**:
```tsx
import React from 'react';
import { CategoryEmptyIcon } from './icons/CategoryEmptyIcon';
import { TagEmptyIcon } from './icons/TagEmptyIcon';

interface FilteredEmptyStateProps {
  type: 'category' | 'tag';
}

/**
 * FilteredEmptyState Component
 *
 * 用于显示 Category 或 Tag 筛选结果为空时的空状态。
 *
 * Design specs:
 * - Icon to text group gap: 20px
 * - Title: Inter 14px/500, #A1A1AA, letter-spacing -0.2px
 * - Description: Inter 13px/normal, #D4D4D8, text-center
 * - Title to description gap: 6px
 */
export const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ type }) => {
  const Icon = type === 'category' ? CategoryEmptyIcon : TagEmptyIcon;

  const content = {
    category: {
      title: 'No items in this category',
      description: 'Try selecting a different category or add items to this one',
    },
    tag: {
      title: 'No items with this tag',
      description: 'Try selecting a different tag or add this tag to some items',
    },
  };

  const { title, description } = content[type];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Icon />
      <h3 className="mt-5 text-sm font-medium tracking-[-0.2px] text-[#A1A1AA]">
        {title}
      </h3>
      <p className="mt-1.5 text-center text-[13px] font-normal text-[#D4D4D8]">
        {description}
      </p>
    </div>
  );
};

export default FilteredEmptyState;
```

3. 更新 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/common/index.ts` 添加导出

**输出**:
- `/src/components/common/FilteredEmptyState.tsx`
- 更新 `/src/components/common/index.ts`

---

### SubAgent E: 修改 SkillsPage 集成空状态

**任务**: 修改 SkillsPage 使用新的空状态组件

**执行步骤**:
1. 读取当前的 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/SkillsPage.tsx`
2. 导入 FilteredEmptyState 和 useAppStore
3. 修改空状态渲染逻辑
4. 修改 badge 显示逻辑（空状态时隐藏）

**关键修改**:
```tsx
// 导入
import { FilteredEmptyState } from '../components/common';
import { useAppStore } from '../stores/appStore';

// 在组件内
const { categories, tags } = useAppStore();

// 计算状态
const showEmptyState = filteredSkills.length === 0;
const isFilteredByCategory = !!filter.category;
const isFilteredByTag = filter.tags.length > 0;
const shouldHideBadge = showEmptyState && (isFilteredByCategory || isFilteredByTag);

// badge 条件渲染
badge={
  !shouldHideBadge && enabledCount > 0 && (
    <Badge variant="status">
      {enabledCount} enabled
    </Badge>
  )
}

// 空状态条件渲染
{showEmptyState ? (
  isFilteredByCategory ? (
    <FilteredEmptyState type="category" />
  ) : isFilteredByTag ? (
    <FilteredEmptyState type="tag" />
  ) : filter.search ? (
    <EmptyState icon={<Sparkles className="h-12 w-12" />} title="No skills" description="No skills match your search. Try a different query." />
  ) : (
    <EmptyState icon={<Sparkles className="h-12 w-12" />} title="No skills" description="Add your first skill to get started" />
  )
) : (
  // 列表渲染
)}
```

**输出**: 修改后的 SkillsPage.tsx

---

### SubAgent F: 修改 McpServersPage 集成空状态

**任务**: 修改 McpServersPage 使用新的空状态组件

**执行步骤**:
1. 读取当前的 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/pages/McpServersPage.tsx`
2. 参照 SkillsPage 的修改方式进行相同的修改

**输出**: 修改后的 McpServersPage.tsx

---

## 执行约束

1. 所有文件修改必须使用 Edit 工具
2. 所有新建文件必须使用 Write 工具
3. 修改前必须先 Read 目标文件
4. 确保代码格式正确，无语法错误
5. 确保 TypeScript 类型正确
6. 所有样式必须与设计规范 1:1 匹配

## 项目路径

- 项目根目录：`/Users/bo/Documents/Development/Ensemble/Ensemble2`
- 源代码目录：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src`
