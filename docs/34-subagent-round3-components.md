# SubAgent 第三轮执行规划 - Phase 3 内联编辑组件

## 本轮目标

创建 CategoryInlineInput 和 TagInlineInput 两个内联编辑组件。

## 前置阅读要求

所有 SubAgent 在执行前必须阅读以下文档：
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-category-tag-inline-edit-understanding.md` - 需求理解
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-implementation-plan.md` - 实现规划
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-add-category.md` - 新增类别设计规范
4. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-edit-category.md` - 编辑类别设计规范
5. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-add-tag.md` - 新增标签设计规范
6. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-edit-tag.md` - 编辑标签设计规范

## SubAgent 任务分配

### SubAgent 1: CategoryInlineInput 组件

**任务**：创建类别内联输入组件

**文件路径**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/sidebar/CategoryInlineInput.tsx`

**组件规格**：

```typescript
interface CategoryInlineInputProps {
  mode: 'add' | 'edit';
  category?: Category;  // 编辑模式必需
  onSave: (name: string) => void;
  onCancel: () => void;
}
```

**样式规范**：

新增模式：
- 容器：`bg-[#F4F4F5] rounded-[6px] h-8 px-2.5 gap-2.5 flex items-center`
- 圆点：`w-2 h-2 rounded-full bg-[#A1A1AA]`
- 输入框：透明背景，`text-[13px] text-[#A1A1AA] placeholder:text-[#A1A1AA]`
- 占位符：`"Category name..."`

编辑模式：
- 容器：同上
- 圆点：保持 `category.color`
- 输入框：透明背景，`text-[13px]`
- 全选高亮：通过 CSS `::selection` 实现 `bg-[#0063E1] text-white`
- 进入时自动全选文字

**交互行为**：
1. 组件挂载时自动聚焦输入框
2. 编辑模式下自动全选文字
3. Enter 键触发 onSave（非空时）
4. Escape 键触发 onCancel
5. 点击组件外部触发 onCancel

**完整代码模板**：

```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Category } from '@/types';

interface CategoryInlineInputProps {
  mode: 'add' | 'edit';
  category?: Category;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const CategoryInlineInput: React.FC<CategoryInlineInputProps> = ({
  mode,
  category,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(mode === 'edit' ? category?.name || '' : '');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动聚焦和全选
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (mode === 'edit') {
        inputRef.current.select();
      }
    }
  }, [mode]);

  // 点击外部取消
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSave(value.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const dotColor = mode === 'edit' ? category?.color : '#A1A1AA';

  return (
    <div
      ref={containerRef}
      className="flex items-center h-8 px-2.5 gap-2.5 rounded-[6px] bg-[#F4F4F5]"
    >
      {/* 圆点 */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      {/* 输入框 */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Category name..."
        className="flex-1 bg-transparent text-[13px] outline-none border-none
                   text-[#18181B] placeholder:text-[#A1A1AA]
                   selection:bg-[#0063E1] selection:text-white"
      />
    </div>
  );
};

export default CategoryInlineInput;
```

---

### SubAgent 2: TagInlineInput 组件

**任务**：创建标签内联输入组件

**文件路径**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/sidebar/TagInlineInput.tsx`

**组件规格**：

```typescript
interface TagInlineInputProps {
  mode: 'add' | 'edit';
  tag?: Tag;  // 编辑模式必需
  onSave: (name: string) => void;
  onCancel: () => void;
}
```

**样式规范**：

新增模式：
- 容器：`bg-[#F4F4F5] rounded px-2.5 py-[5px] border border-[#E5E5E5]`
- 输入框：透明背景，`text-[11px] font-medium text-[#A1A1AA] placeholder:text-[#A1A1AA]`
- 占位符：`"Tag name..."`

编辑模式：
- 容器：同上
- 输入框：透明背景，`text-[11px] font-medium text-[#52525B]`
- 全选高亮：通过 CSS `::selection` 实现 `bg-[#0063E1] text-white`

**交互行为**：同 CategoryInlineInput

**完整代码模板**：

```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Tag } from '@/types';

interface TagInlineInputProps {
  mode: 'add' | 'edit';
  tag?: Tag;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const TagInlineInput: React.FC<TagInlineInputProps> = ({
  mode,
  tag,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(mode === 'edit' ? tag?.name || '' : '');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动聚焦和全选
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (mode === 'edit') {
        inputRef.current.select();
      }
    }
  }, [mode]);

  // 点击外部取消
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSave(value.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      className="inline-flex items-center px-2.5 py-[5px] rounded border border-[#E5E5E5] bg-[#F4F4F5]"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tag name..."
        className="bg-transparent text-[11px] font-medium outline-none border-none
                   w-16 min-w-0
                   text-[#52525B] placeholder:text-[#A1A1AA]
                   selection:bg-[#0063E1] selection:text-white"
      />
    </div>
  );
};

export default TagInlineInput;
```

---

### SubAgent 3: 创建 sidebar 组件目录索引

**任务**：确保 sidebar 组件目录存在并创建索引文件

**文件路径**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/src/components/sidebar/index.ts`

**内容**：
```typescript
export { CategoryInlineInput } from './CategoryInlineInput';
export { TagInlineInput } from './TagInlineInput';
```

---

## 验证要求

1. 组件 TypeScript 类型正确
2. 样式与设计稿一致
3. 交互行为符合规范（聚焦、全选、键盘、点击外部）
4. 导出正确
