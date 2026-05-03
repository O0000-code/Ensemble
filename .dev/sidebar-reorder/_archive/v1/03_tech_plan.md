# Sidebar Reorder — Technical Plan（技术规划）

> **Decisional 文档**。与 `02_design_spec.md` 同级。技术细节冲突时以本文档为准。
> 设计层冲突时按 `02_design_spec.md`。

## Document Authority Ranking

| Level | Document | Last Modified | Purpose |
|---|---|---|---|
| Decisional | `02_design_spec.md` | 2026-05-03 | 视觉/动效规格 |
| Decisional | `03_tech_plan.md` (本文档) | 2026-05-03 | 库选择/数据模型/API/架构 |
| Decisional | `04_implementation_plan.md` | 2026-05-03 | 任务拆分与执行步骤 |
| Referential | `00_understanding.md` | 2026-05-03 | 一手理解，作背景 |
| Referential | `01_research/*.md` | 2026-05-03 | 调研报告，作论据 |

冲突解决：**同级冲突向用户提问；跨级以高层为准**。

---

## 1. 库选型（最终决定）

| 用途 | 选用 | 版本（截至 2026-05-03） |
|---|---|---|
| 拖拽核心 | `@dnd-kit/core` | `^6.3.1` |
| Sortable 抽象 | `@dnd-kit/sortable` | `^10.0.0` |
| 工具函数（CSS.Translate.toString 等） | `@dnd-kit/utilities` | `^3.2.2` |
| Modifiers（restrictToParentElement 等） | `@dnd-kit/modifiers` | `^9.0.0` |

**理由（不重复 01 调研，仅总结）**：
- 唯一同时一阶支持 1D + 2D wrap 的 React 拖拽库
- ~20KB min+gzip，bundle 控制良好
- React 18 + StrictMode 兼容（issue #775 仅影响 multi-container 场景，与我们无关）
- MIT 许可
- 提供 `KeyboardSensor` 满足 a11y
- `<DragOverlay>` 自渲染绕过 HTML5 native preview 的 opacity/shadow 限制
- 14M 周下载、Puck/Apache Superset 使用，事实标准

**不引入** `motion` / `framer-motion`：
- `Reorder` 官方文档明确不支持 multi-row（与 Tags 不兼容）
- 单纯为 cascade 让位动画引入 +40KB 不划算
- dnd-kit 内置 `transition` 字符串可用 `cubic-bezier(0.16, 1, 0.3, 1)` 达到一致气质

**不自研**：用户明确要求"优先现成组件"，且自研键盘 a11y 与碰撞检测的工程量极大。

---

## 2. 数据模型

### 2.1 不引入 `sort_order` 字段

**决策**：直接以 `Vec<Category>` / `Vec<Tag>` 的天然顺序作为排序载体。

**理由**：
1. **零 schema 变更** — 无需数据迁移，旧 `data.json` 加载后顺序自然就是当前顺序
2. **零字段污染** — Category 与 Tag 类型保持纯净，前端 `Category` 接口不变
3. **零序列化复杂度** — Rust `Vec` 自然有序，serde 序列化反序列化不变
4. **零 race condition 风险** — 整个 `categories` Vec 一次性替换，原子性
5. **未来可扩展** — 若以后引入"按使用频次自动排序"等模式，可以保留 `Vec<Category>` 顺序作为"用户手动序"，叠加排序模式

**代价**：每次重排需要把整个 Vec 重新发到后端。我们的规模是 9 个 categories + 10 个 tags，序列化成本可忽略（已有的 `add_category` 同样是全量 `write_app_data`）。

### 2.2 类型定义保持不变

**前端**（`src/types/index.ts:84-95`）：
```ts
interface Category { id: string; name: string; color: string; count: number; }
interface Tag      { id: string; name: string; count: number; }
```

**后端**（`src-tauri/src/types.rs:134-149`）：
```rust
pub struct Category { pub id, pub name, pub color, pub count: u32 }
pub struct Tag      { pub id, pub name, pub count: u32 }
```

---

## 3. 后端 API 新增

### 3.1 `reorder_categories(orderedIds: Vec<String>)`

**位置**：`src-tauri/src/commands/data.rs`，紧随 `delete_category` 之后。

**签名**：
```rust
#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<(), String> {
    let mut data = read_app_data()?;
    
    // 用 HashMap<id, Category> 索引现有
    let mut by_id: std::collections::HashMap<String, Category> =
        data.categories.into_iter().map(|c| (c.id.clone(), c)).collect();
    
    // 按 orderedIds 顺序重建，跳过未知 id（防御性）
    let mut new_order: Vec<Category> = Vec::with_capacity(by_id.len());
    for id in orderedIds {
        if let Some(c) = by_id.remove(&id) {
            new_order.push(c);
        }
    }
    // 追加未在 orderedIds 中的项（如果有，按原序）—— 容错
    for (_id, c) in by_id {
        new_order.push(c);
    }
    
    data.categories = new_order;
    write_app_data(data)?;
    Ok(())
}
```

**关键性质**：
- **幂等**：相同 `orderedIds` 多次调用结果相同
- **容错**：未知 id 静默忽略；缺失 id 自动追加末尾（典型场景：拖动期间另一进程加了新 category — 不丢数据）
- **原子**：单次 `write_app_data` 完成
- **非破坏**：不修改 categories 内容（name/color/id），仅重排 `Vec`

### 3.2 `reorder_tags(orderedIds: Vec<String>)`

完全对称，结构相同。位置紧随 `delete_tag`。

### 3.3 注册到 `lib.rs`

在 `tauri::generate_handler![...]` 列表中添加 `reorder_categories, reorder_tags`。

### 3.4 单元测试（`src-tauri/src/commands/data.rs` 末尾或 types.rs 风格的内嵌 test）

```rust
#[cfg(test)]
mod reorder_tests {
    // 测试场景（必须覆盖）：
    // 1. 正常重排：[A,B,C] -> reorder([C,A,B]) -> [C,A,B]
    // 2. 空输入：reorder([]) -> 所有项追加（保留原序）
    // 3. 部分输入：[A,B,C] -> reorder([B]) -> [B,A,C]
    // 4. 含未知 id：[A,B,C] -> reorder([A,X,B,C]) -> [A,B,C]
    // 5. 重复 id：[A,B,C] -> reorder([A,A,B,C]) -> [A,B,C]（HashMap 自动去重）
    // 6. 写入后再读：持久化正确
}
```

---

## 4. 前端 store 新增

### 4.1 `useAppStore` 新增 actions

```ts
// 加在 AppState interface 中
reorderCategories: (orderedIds: string[]) => Promise<void>;
reorderTags: (orderedIds: string[]) => Promise<void>;

// 实现
reorderCategories: async (orderedIds: string[]) => {
  if (!isTauri()) return;
  
  // Snapshot for rollback
  const snapshot = get().categories;
  
  // Optimistic update — 按 orderedIds 重排
  const byId = new Map(snapshot.map(c => [c.id, c]));
  const reordered = [
    ...orderedIds.flatMap(id => byId.get(id) ? [byId.get(id)!] : []),
    ...snapshot.filter(c => !orderedIds.includes(c.id)),
  ];
  set({ categories: reordered });
  
  try {
    await safeInvoke('reorder_categories', { orderedIds });
  } catch (error) {
    console.error('Failed to reorder categories:', error);
    // Rollback
    set({ categories: snapshot, error: String(error) });
    throw error;
  }
},

reorderTags: async (orderedIds: string[]) => { /* 完全对称 */ },
```

### 4.2 串行队列防竞态

在 store 模块顶部添加：
```ts
// 单例 promise 队列：保证 reorder 调用串行执行
let reorderQueue: Promise<void> = Promise.resolve();

const enqueueReorder = (task: () => Promise<void>): Promise<void> => {
  reorderQueue = reorderQueue.then(task, task); // 即使前一个 reject 也继续
  return reorderQueue;
};
```

`reorderCategories` 和 `reorderTags` 的 `safeInvoke` 调用包在 `enqueueReorder` 内。

### 4.3 注意事项

- **counts 字段**：reorder 不影响 count，但因 `MainLayout` 的 `categoriesWithCounts` useMemo 依赖 `categories` array reference，新顺序会触发 useMemo 重算 — 可接受，因为派生计算仅 O(n)，n=9
- **navigation state**：reorder 不影响 `activeCategory` / `activeTags`
- **editing state**：reorder 前由 `Sidebar` 组件主动调用 `clearAllEditingStates()` （不在 store 内做）

---

## 5. 组件层架构

### 5.1 文件结构

```
src/components/sidebar/
├── index.ts                          # 已存在
├── CategoryInlineInput.tsx           # 已存在，**不改**
├── TagInlineInput.tsx                # 已存在，**不改**
├── SortableCategoriesList.tsx        # 新增
├── SortableTagsList.tsx              # 新增
├── SortableCategoryRow.tsx           # 新增（包装现有 row 的 useSortable）
├── SortableTagPill.tsx               # 新增
├── DragOverlayCategoryRow.tsx        # 新增（DragOverlay 渲染内容）
├── DragOverlayTagPill.tsx            # 新增
└── dnd/
    ├── CustomMouseSensor.ts          # 新增（实现 data-no-dnd）
    ├── DropIndicator.tsx             # 新增（macOS 蓝线）
    └── animations.ts                 # 新增（dropAnimation 配置常量）
```

### 5.2 Sidebar.tsx 变更范围

**保留不动**：
- 导航 nav 部分（Skills/MCP/...，不允许重排）
- Header（traffic lights + Refresh 按钮）
- Section title bar（"CATEGORIES" + 加号）
- Footer Settings 按钮
- `startDrag` 函数（仅在 `target.closest('[data-sortable-list]')` 命中时跳过）
- 所有 props 接口

**改动**：
- Categories 列表渲染部分用 `<SortableCategoriesList>` 替换
- Tags 网格渲染部分用 `<SortableTagsList>` 替换
- 新增一个 prop：`onReorderCategories(orderedIds: string[]) => void`
- 新增一个 prop：`onReorderTags(orderedIds: string[]) => void`
- 新增一个 prop：`onDragStart(): void`（用于 MainLayout 关闭 ContextMenu / 退出 edit）
- "Show X more" 折叠 state 提升或保留在 Sidebar，由 SortableCategoriesList 通过 prop 调用 setShowAllCategories

**Sidebar.tsx:10 `startDrag` 调整**：
```ts
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement;
  // 排除 sortable list 区域 — 让拖动手势归 dnd-kit 处理
  if (target.closest('[data-sortable-list]')) return;
  // ... 原逻辑保持不变
};
```

### 5.3 MainLayout.tsx 变更范围

**新增 store action 解构**：
```ts
const { reorderCategories, reorderTags } = useAppStore();
```

**新增 handler**：
```ts
const handleReorderCategories = useCallback(async (orderedIds: string[]) => {
  try { await reorderCategories(orderedIds); }
  catch (e) { console.error(e); }
}, [reorderCategories]);

const handleReorderTags = useCallback(...);

const handleDragStart = useCallback(() => {
  // 关闭 ContextMenu / 退出 edit / 退出 add，避免视觉冲突
  setContextMenu(null);
  setTagContextMenu(null);
  useAppStore.getState().clearAllEditingStates();
}, []);
```

**传给 Sidebar**：
```tsx
<Sidebar
  ...existing props
  onReorderCategories={handleReorderCategories}
  onReorderTags={handleReorderTags}
  onDragStart={handleDragStart}
/>
```

**Refresh 按钮 disabled**：通过新增 `isDragging` state（由 onDragStart/End 触发）注入 Sidebar，再传给 Refresh 按钮。

---

## 6. 自定义 MouseSensor 实现

> 目的：让 ColorPicker 圆点等"局部不可拖区域"清晰隔离。

```ts
// src/components/sidebar/dnd/CustomMouseSensor.ts
import { MouseSensor as LibMouseSensor } from '@dnd-kit/core';
import type { MouseEvent as ReactMouseEvent } from 'react';

const shouldHandleEvent = (element: HTMLElement | null): boolean => {
  let cur: HTMLElement | null = element;
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd === 'true') return false;
    cur = cur.parentElement;
  }
  return true;
};

export class CustomMouseSensor extends LibMouseSensor {
  static activators = [{
    eventName: 'onMouseDown' as const,
    handler: ({ nativeEvent: e }: ReactMouseEvent) => {
      return shouldHandleEvent(e.target as HTMLElement);
    },
  }];
}
```

ColorPicker 包裹元素加 `data-no-dnd="true"` 即可避免被拖动激活。

> 同模式可加 `CustomTouchSensor`，目前 macOS 桌面只用鼠标，TouchSensor 可保持库默认（如未来需要触控板支持再扩展）。

---

## 7. dnd-kit DndContext 配置（Categories 区为例）

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CustomMouseSensor } from './dnd/CustomMouseSensor';

export function SortableCategoriesList({ categories, onReorder, onDragStart, ... }) {
  const sensors = useSensors(
    useSensor(CustomMouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor,  { coordinateGetter: sortableKeyboardCoordinates }),
  );
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCategory = categories.find(c => c.id === activeId);
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      accessibility={{ announcements: makeAnnouncementsForCategories(categories) }}
      onDragStart={(e) => { setActiveId(String(e.active.id)); onDragStart(); }}
      onDragEnd={(e) => {
        setActiveId(null);
        if (e.over && e.active.id !== e.over.id) {
          const oldIdx = categories.findIndex(c => c.id === e.active.id);
          const newIdx = categories.findIndex(c => c.id === e.over!.id);
          const newOrder = arrayMove(categories, oldIdx, newIdx);
          onReorder(newOrder.map(c => c.id));
        }
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div data-sortable-list className="flex flex-col gap-0.5">
          {categories.map(c => (
            <SortableCategoryRow key={c.id} category={c} ... />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={CATEGORY_DROP_ANIMATION}>
        {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
      </DragOverlay>
    </DndContext>
  );
}
```

Tags 区配置基本相同，关键差别：
- 替换 `verticalListSortingStrategy` → `rectSortingStrategy`
- 移除 `restrictToVerticalAxis` modifier
- 容器加 `min-height` 防 wrap 行数突变

---

## 8. SortableCategoryRow 实现要点

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableCategoryRow({ category, isActive, isEditing, ... }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: category.id,
    disabled: isEditing,  // 编辑/新增态时不可拖
    transition: {
      duration: 220,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  });
  
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),  // ⚠️ Translate 不是 Transform，避免挤压
    transition,
    opacity: isDragging ? 0.4 : 1,
    // 注意：scale 不在这里加；DragOverlay 上有 1.02 scale
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={...原 row 样式}
      onClick={...原 navigate 逻辑}
      onDoubleClick={...}
      onContextMenu={...}
    >
      <span data-no-dnd="true" onClick={(e) => e.stopPropagation()}>
        <ColorPicker value={category.color} ... />
      </span>
      <span>{category.name}</span>
      <span>{category.count}</span>
    </div>
  );
}
```

**关键**：
- 用 `CSS.Translate.toString` 不是 `CSS.Transform.toString`（后者会含 scale 引起挤压）
- `data-no-dnd` 包 ColorPicker — 防止点击圆点触发 drag
- `disabled: true` 当 isEditing — 编辑态行不可拖
- `transition` 用规格里的 220ms + cubic-bezier(0.16, 1, 0.3, 1)

---

## 9. 动画/主题常量（中心化）

```ts
// src/components/sidebar/dnd/animations.ts
import type { DropAnimation } from '@dnd-kit/core';
import { defaultDropAnimation } from '@dnd-kit/core';

export const SIDEBAR_ACCENT = '#0063E1';

export const CATEGORY_DROP_ANIMATION: DropAnimation = {
  ...defaultDropAnimation,
  duration: 180,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const TAG_DROP_ANIMATION: DropAnimation = CATEGORY_DROP_ANIMATION;

export const REORDER_TRANSITION = {
  duration: 220,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const TAG_REORDER_TRANSITION = {
  duration: 240,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const LIFT_TIMING = '120ms cubic-bezier(0.4, 0, 0.2, 1)';
```

---

## 10. CSS 增量（追加到 `src/index.css`）

```css
/* Sortable lift transition for non-active state */
.sortable-row,
.sortable-pill {
  transition:
    opacity 120ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* DragOverlay shadow for Categories */
.drag-overlay-row {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.10),
    0 2px 4px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  background: white;
  cursor: grabbing;
}

/* DragOverlay shadow for Tags */
.drag-overlay-pill {
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.10),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  cursor: grabbing;
}

/* Drop indicator (Categories: horizontal line) */
.drop-indicator-h {
  height: 2px;
  background: #0063E1;
  border-radius: 1px;
  margin: 0 2px;
}

/* Drop indicator (Tags: vertical line) */
.drop-indicator-v {
  width: 2px;
  height: 20px;
  background: #0063E1;
  border-radius: 1px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sortable-row,
  .sortable-pill {
    transition: none !important;
  }
}
```

---

## 11. A11y / Announcements

```ts
// src/components/sidebar/dnd/announcements.ts
import type { Announcements } from '@dnd-kit/core';

export function makeAnnouncements(items: { id: string; name: string }[], label: 'category' | 'tag'): Announcements {
  const findName = (id: string | number) =>
    items.find(i => i.id === id)?.name ?? String(id);
  const indexOf = (id: string | number) =>
    items.findIndex(i => i.id === id) + 1;
  
  return {
    onDragStart({ active }) {
      return `Picked up ${label} ${findName(active.id)}. Position ${indexOf(active.id)} of ${items.length}.`;
    },
    onDragOver({ active, over }) {
      if (!over) return undefined;
      return `${findName(active.id)} is over position ${indexOf(over.id)} of ${items.length}.`;
    },
    onDragEnd({ active, over }) {
      if (!over) return `${findName(active.id)} dropped. No change.`;
      return `${findName(active.id)} dropped at position ${indexOf(over.id)} of ${items.length}.`;
    },
    onDragCancel({ active }) {
      return `Reorder of ${findName(active.id)} cancelled.`;
    },
  };
}
```

---

## 12. 测试策略

### 12.1 Rust 后端（cargo test）
- `reorder_categories_basic`：[A,B,C] -> [C,A,B] 持久化正确
- `reorder_categories_with_unknown_id`：未知 id 静默跳过
- `reorder_categories_partial`：仅部分 id 在输入中
- `reorder_categories_empty`：空输入不丢数据
- `reorder_tags_*`：对称
- 持久化往返测试（write_app_data → read_app_data 顺序保持）

### 12.2 前端（vitest + RTL）
- `appStore.reorderCategories` 乐观更新 + 失败回滚
- `appStore.reorderCategories` 串行队列：连发两次保证顺序
- `<SortableCategoriesList>` 渲染所有 categories（rendered count 测试，不测拖动手势 — jsdom 不支持 PointerEvent）
- `data-no-dnd` 属性存在（snapshot 或 query）
- Reduced motion 媒体查询变体（jsdom 模拟 matchMedia）

### 12.3 手动 acceptance
按 `02_design_spec.md` §5 的 16 项清单逐项验证。

### 12.4 Type/Lint
`npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings` 必须全绿。

---

## 13. 性能与 bundle 影响

| 项 | 预算 | 实际预估 |
|---|---|---|
| dnd-kit 总 bundle 增量 | ≤ 25 KB min+gzip | ~20 KB |
| Categories 9 项 reorder onMove 时 React 渲染 | ≤ 16ms/frame | 远低于（O(n) on 9 items） |
| Tags 10 项 reorder | 同 | 同 |
| `categoriesWithCounts` useMemo 因 reorder 重算 | ≤ 1ms | 远低于 |
| 额外 IPC 调用 | 1 次 / drop | OK |

---

## 14. 与 ImplementationPlan 的衔接

参见 `04_implementation_plan.md`。
