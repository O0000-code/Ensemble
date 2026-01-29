# Category & Tag 内联编辑功能 - 实现规划

## 一、问题根因总结

根据调研分析，确定以下问题根因：

| 问题 | 根因 | 文件位置 |
|------|------|---------|
| `+` 按钮不显示 | `MainLayout.tsx` 没有传递 `onAddCategory` 和 `onAddTag` 回调 | `MainLayout.tsx:160-171` |
| 重命名不工作 | `handleRenameCategory` 只有 console.log | `MainLayout.tsx:103-107` |
| Tags 没有右键菜单 | Tags 的 button 没有 onContextMenu | `Sidebar.tsx:248-263` |
| 缺少 updateTag | 后端没有 update_tag 命令 | `data.rs` |
| 无编辑状态管理 | Store 没有 editingId、isAdding 等字段 | `appStore.ts` |

## 二、设计规范

### 2.1 新增状态样式

**类别新增项：**
- 容器：`bg-[#F4F4F5]`，`rounded-[6px]`，`h-8`，`px-2.5`，无边框
- 圆点：`8x8`，`rounded-full`，`bg-[#A1A1AA]`
- 占位文字：`"Category name..."`，`text-[#A1A1AA]`，`text-[13px]`

**标签新增项：**
- 容器：`bg-[#F4F4F5]`，`rounded`，`px-2.5 py-[5px]`，边框 `border border-[#E5E5E5]`
- 占位文字：`"Tag name..."`，`text-[#A1A1AA]`，`text-[11px] font-medium`

### 2.2 编辑状态样式

**类别编辑项：**
- 容器：`bg-[#F4F4F5]`，`rounded-[6px]`，`h-8`，`px-2.5`，无边框
- 圆点：保持原有颜色
- 计数：隐藏
- 文字全选：`bg-[#0063E1]`，`rounded-sm`，`px-0.5 py-px`，文字 `text-white`

**标签编辑项：**
- 容器：`bg-[#F4F4F5]`，`rounded`，`px-2.5 py-[5px]`，边框 `border border-[#E5E5E5]`
- 文字全选：同上

### 2.3 交互规范

1. **新增**：点击 `+` → 末尾出现输入项 → 自动聚焦 → Enter 确认 / Esc 取消
2. **编辑**：双击或右键重命名 → 全选高亮 → Enter 确认 / Esc 取消
3. **互斥**：同一时刻只能有一个编辑/新增状态

## 三、实现任务分解

### Phase 1: 后端支持（Rust）

**任务 1.1**: 添加 `update_tag` 命令
- 文件：`src-tauri/src/commands/data.rs`
- 内容：实现标签重命名功能
- 文件：`src-tauri/src/lib.rs`
- 内容：注册新命令

### Phase 2: Store 状态管理扩展

**任务 2.1**: 扩展 appStore
- 文件：`src/stores/appStore.ts`
- 添加 state：
  - `editingCategoryId: string | null`
  - `isAddingCategory: boolean`
  - `editingTagId: string | null`
  - `isAddingTag: boolean`
- 添加 actions：
  - `startEditingCategory(id: string)`
  - `stopEditingCategory()`
  - `startAddingCategory()`
  - `stopAddingCategory()`
  - `startEditingTag(id: string)`
  - `stopEditingTag()`
  - `startAddingTag()`
  - `stopAddingTag()`
  - `updateTag(id: string, name: string)`
  - `clearAllEditingStates()` - 互斥状态管理

### Phase 3: 内联编辑组件

**任务 3.1**: 创建 CategoryInlineInput 组件
- 文件：`src/components/sidebar/CategoryInlineInput.tsx`
- 支持新增和编辑两种模式
- 实现全选高亮效果
- 支持 Enter/Esc/点击外部

**任务 3.2**: 创建 TagInlineInput 组件
- 文件：`src/components/sidebar/TagInlineInput.tsx`
- 同上

### Phase 4: Sidebar 组件修改

**任务 4.1**: 修改 Sidebar Props
- 文件：`src/components/layout/Sidebar.tsx`
- 添加编辑状态相关 props
- 添加双击进入编辑的处理

**任务 4.2**: 修改 Categories 区域渲染
- 条件渲染编辑态 / 新增态
- 处理双击事件

**任务 4.3**: 修改 Tags 区域渲染
- 同上
- 添加右键菜单支持

### Phase 5: MainLayout 连接

**任务 5.1**: 连接 Store 和 Sidebar
- 文件：`src/components/layout/MainLayout.tsx`
- 传递编辑状态 props
- 传递 onAddCategory / onAddTag 回调
- 实现 handleRenameCategory 触发内联编辑
- 添加 Tags 右键菜单

### Phase 6: 测试验证

**任务 6.1**: 功能测试
- 测试新增类别
- 测试编辑类别
- 测试新增标签
- 测试编辑标签
- 测试互斥状态
- 测试取消操作

**任务 6.2**: 视觉验证
- 与设计稿对比验证样式

## 四、文件修改清单

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `src-tauri/src/commands/data.rs` | 修改 | 添加 update_tag 命令 |
| `src-tauri/src/lib.rs` | 修改 | 注册 update_tag 命令 |
| `src/stores/appStore.ts` | 修改 | 添加编辑状态和 actions |
| `src/components/sidebar/CategoryInlineInput.tsx` | 新建 | 类别内联输入组件 |
| `src/components/sidebar/TagInlineInput.tsx` | 新建 | 标签内联输入组件 |
| `src/components/layout/Sidebar.tsx` | 修改 | 集成内联编辑功能 |
| `src/components/layout/MainLayout.tsx` | 修改 | 连接 Store 和传递 props |

## 五、关键代码片段

### 5.1 Store 状态结构

```typescript
interface AppState {
  // ... 现有 state

  // 编辑状态
  editingCategoryId: string | null;
  isAddingCategory: boolean;
  editingTagId: string | null;
  isAddingTag: boolean;

  // Actions
  startEditingCategory: (id: string) => void;
  stopEditingCategory: () => void;
  startAddingCategory: () => void;
  stopAddingCategory: () => void;
  startEditingTag: (id: string) => void;
  stopEditingTag: () => void;
  startAddingTag: () => void;
  stopAddingTag: () => void;
  updateTag: (id: string, name: string) => Promise<void>;
  clearAllEditingStates: () => void;
}
```

### 5.2 互斥状态实现

```typescript
clearAllEditingStates: () => set({
  editingCategoryId: null,
  isAddingCategory: false,
  editingTagId: null,
  isAddingTag: false,
}),

startEditingCategory: (id: string) => {
  get().clearAllEditingStates();
  set({ editingCategoryId: id });
},
```

### 5.3 全选高亮 CSS

```css
input::selection {
  background-color: #0063E1;
  color: #FFFFFF;
}
```

### 5.4 组件结构示例

```tsx
// CategoryInlineInput.tsx
interface Props {
  mode: 'add' | 'edit';
  category?: Category;  // 编辑模式需要
  onSave: (name: string) => void;
  onCancel: () => void;
}

const CategoryInlineInput: React.FC<Props> = ({ mode, category, onSave, onCancel }) => {
  const [value, setValue] = useState(mode === 'edit' ? category?.name || '' : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (mode === 'edit') {
        inputRef.current.select();
      }
    }
  }, [mode]);

  // ... 键盘和点击外部处理
};
```

## 六、执行顺序

1. **Phase 1** (后端) → **Phase 2** (Store) → **Phase 3** (组件) → **Phase 4** (Sidebar) → **Phase 5** (MainLayout) → **Phase 6** (测试)

每个 Phase 完成后进行局部验证，确保不引入回归问题。

## 七、注意事项

1. **不影响现有功能**：所有修改采用增量方式，不删除现有代码逻辑
2. **样式精确**：颜色、尺寸、圆角等必须与设计稿一致
3. **状态互斥**：确保同一时刻只有一个编辑/新增状态
4. **错误处理**：API 调用需要适当的错误处理
5. **类型安全**：所有新增代码需要完整的 TypeScript 类型
