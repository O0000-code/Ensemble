# Sidebar Reorder — Technical Plan V3（技术规划 — 二轮评审后修订版）

> **Decisional 文档**。技术细节冲突时以本文档为准。设计层冲突按 `02_design_spec.md`。
> V1/V2 已归档至 `_archive/v1` `_archive/v2`。
> V3 修订基于 V2 复评（`05_review/v2_02_*.md`），处理 V2 残留的 architecture P0。

## Revision History (V2 → V3)

V2 复评结果：架构 8.6、回归 8.7。V3 处理：
- **NEW-P0-1**：V2 §7 modifiers 仍写在 `<DndContext>` 上 → 改为 `<DndContext modifiers={[]}>` + `<DragOverlay modifiers={[restrictToWindowEdges]}>`；删除 `restrictToVerticalAxis`（让 sortable strategy 自然约束方向）
- **NEW-P0-2**：CSS `--duration-drag-indicator-fade/move` 引用未定义 → 补到 `:root` 段
- **P1**：`snapModifier` 解构 `over.rect` 修正（dnd-kit 6 实际 API 是 `over.rect`，需用 ClientRect）
- **P1**：`reorderCategories` Stage 2 IPC 成功后无条件 set 改为"仅当后端返回与本地不同"
- **P1**：T1 任务说明加"修改 path.rs 加 ENSEMBLE_DATA_DIR env 支持"明确步骤
- **P1**：T3 任务 enumerate 8 个 mutator 都需 bump version

## Revision History

V1 → V2 关键变更（按评审单 P0 编号）：
- **R-P0-3**：**Rust 后端加 `DATA_MUTEX`**（防 reorder 与 add_category 并发 lost update）— 核心修复
- **A-P0-1 / P0-2**：appStore.reorderCategories 改为**两阶段提交**（立即 set + IPC 队列分离），snapshot 在 task 内 get
- **R-P0-1**：**`categoriesVersion` 协议**（防 autoClassify loadCategories 覆盖前端乐观）
- **R-P0-2**：onDragStart 在 isEditing/isAddingAny 时 **直接 return**（不 clear，保护 input 内容）
- **A-P0-3**：CSS 抑制 dnd-kit 默认 `cursor: grab` on hover
- **A-P0-4**：`restrictToVerticalAxis` 仅用于 sortable，**不应用于 DragOverlay**
- **A-P0-5**：`reorder_categories` 返回 `Vec<Category>`（前端校准）
- HashMap 迭代序未定义 → 改用 `original_order: Vec<String>` 追加保留原序
- 新增 `apply_reorder` pure function（便于隔离测试）
- 引入 `--color-accent` token 与全套 drag tokens（与 02_design_spec §4 对应）
- DragOverlayRow 与 SortableRow 重复内容抽出 `<CategoryRowContent>` 共享

## Document Authority Ranking

| Level | Document | Last Modified | Purpose |
|---|---|---|---|
| Decisional | `02_design_spec.md` (V2) | 2026-05-03 | 视觉/动效规格 |
| Decisional | `03_tech_plan.md` (V2，本文档) | 2026-05-03 | 库选择/数据模型/API/架构 |
| Decisional | `04_implementation_plan.md` (V2) | 2026-05-03 | 任务拆分与执行步骤 |
| Referential | `00_understanding.md` | 2026-05-03 | 一手理解，作背景 |
| Referential | `01_research/*.md` | 2026-05-03 | 调研报告，作论据 |
| Referential | `05_review/*.md` | 2026-05-03 | 评审记录 |
| Historical | `_archive/v1/*` | 2026-05-03 | V1 归档 |

冲突解决：**同级冲突向用户提问；跨级以高层为准**。

---

## 1. 库选型（V1 不变）

| 用途 | 选用 | 版本 |
|---|---|---|
| 拖拽核心 | `@dnd-kit/core` | `^6.3.1` |
| Sortable 抽象 | `@dnd-kit/sortable` | `^10.0.0` |
| 工具函数 | `@dnd-kit/utilities` | `^3.2.2` |
| Modifiers | `@dnd-kit/modifiers` | `^9.0.0` |

**为什么仍选 v6 而非 `@dnd-kit/react@0.4`**（V2 补充论证）：
- v6.3.1 是事实标准（14M weekly DL，Puck/Apache Superset 在用）
- v0.4 是 experimental rewrite，2025-04 发布，0.x 版本号说明 API 未稳定
- 项目对稳定性要求高于尝鲜
- v6 文档完整，迁移到 v0.x 需未来再评估

---

## 2. 数据模型（V1 不变 + V2 概念性补充）

### 2.1 不引入 `sort_order` 字段（V1 决策保留）

详见 V1 §2.1。理由仍成立：零 schema 变更、零序列化复杂度、原子性。

### 2.2 类型保持不变

```ts
// src/types/index.ts:84-95
interface Category { id: string; name: string; color: string; count: number; }
interface Tag      { id: string; name: string; count: number; }
```

```rust
// src-tauri/src/types.rs:134-149
pub struct Category { pub id, pub name, pub color, pub count: u32 }
pub struct Tag      { pub id, pub name, pub count: u32 }
```

### 2.3 新增前端 store 字段（V2）

```ts
// AppState 新增（仅前端，不影响 Rust）
categoriesVersion: number;  // 每次 reorder/add/update/delete 自增
tagsVersion: number;
```

用途：autoClassify 后强制 loadCategories 时，比较 version；若已变更则跳过 set（详见 §4.4）。

---

## 3. 后端 API（V2 重大修订）

### 3.1 全局锁（V2 新增 — 修复 R-P0-3）

> Rust 后端所有 mutating 命令的 read-modify-write 必须串行，否则 reorder 与 add_category 并发会 lost update。

**位置**：`src-tauri/src/commands/data.rs` 顶部

```rust
use std::sync::Mutex;

/// Global mutex protecting all read-modify-write operations on data.json.
/// Tauri commands run on independent tokio tasks; without this lock,
/// concurrent reorder + add_category can lose updates (T1 reads stale data,
/// T2 writes its own version, T1 writes overwriting T2).
static DATA_MUTEX: Mutex<()> = Mutex::new(());
```

**应用范围**（所有 mutating 命令的最外层）：
- `add_category` / `update_category` / `delete_category`
- `reorder_categories`（V2 新增）
- `add_tag` / `update_tag` / `delete_tag`
- `reorder_tags`（V2 新增）
- `add_scene` / `update_scene` / `delete_scene`
- `add_project` / `update_project` / `delete_project`
- 所有走 `read_app_data → modify → write_app_data` 的命令

**示例**：
```rust
#[tauri::command]
pub fn add_category(name: String, color: String) -> Result<Category, String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    // ...
    data.categories.push(category.clone());
    write_app_data(data)?;
    Ok(category)
}
```

**read_app_data 仍可裸读**（不持锁）：
- 读操作（如 `get_categories`）允许并发
- write_app_data 内部不再加锁（由 caller 持有 DATA_MUTEX）

### 3.2 `apply_reorder` pure function（V2 新增 — 修复 P0-3 / R-A-P0）

> 抽出 pure function 便于单测，避免测试时碰真实文件。

```rust
// src-tauri/src/commands/data.rs（在 reorder_categories 之前）

/// Trait for items that have an id (Category, Tag).
pub trait HasId { fn id(&self) -> &str; }

impl HasId for Category { fn id(&self) -> &str { &self.id } }
impl HasId for Tag      { fn id(&self) -> &str { &self.id } }

/// Pure function: reorder a Vec<T> to match given ordered_ids.
/// - IDs in ordered_ids that exist in items are placed first in that order
/// - Items not in ordered_ids are appended in their **original order** (preserved by Vec scan, not HashMap iteration)
/// - Unknown ids in ordered_ids are silently skipped
/// - Duplicate ids in ordered_ids are deduplicated (first occurrence wins)
pub fn apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T> {
    use std::collections::HashSet;

    // 1) Build set of "seen so far" to dedupe ordered_ids
    let mut seen: HashSet<&str> = HashSet::new();
    
    // 2) Map id → item for O(1) extraction
    let mut by_id: std::collections::HashMap<String, T> =
        items.into_iter().map(|i| (i.id().to_string(), i)).collect();
    
    // 3) Track original order for items not mentioned in ordered_ids
    //    This preserves "newly-added items appended at end" semantics.
    //    NOTE: We CANNOT iterate by_id directly — HashMap iteration order is undefined.
    let original_order: Vec<String> = by_id.keys().cloned().collect();
    // BUT this still breaks; we need original Vec order. Refactor:
    
    // Better implementation:
    // (We rebuild using two passes over a Vec to keep original order)
    todo!("see correct impl below")
}
```

**正确实现**（V2 — 修复 HashMap 迭代序问题）：
```rust
pub fn apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T> {
    use std::collections::HashSet;
    
    // Snapshot original order BEFORE moving items into HashMap
    let original_order: Vec<String> = items.iter().map(|i| i.id().to_string()).collect();
    
    // Move items into HashMap for O(1) extraction by id
    let mut by_id: std::collections::HashMap<String, T> =
        items.into_iter().map(|i| (i.id().to_string(), i)).collect();
    
    let mut result: Vec<T> = Vec::with_capacity(by_id.len());
    let mut seen: HashSet<String> = HashSet::new();
    
    // Pass 1: emit items in ordered_ids order, dedup via `seen`, skip unknowns
    for id in ordered_ids {
        if seen.contains(id) { continue; }
        if let Some(item) = by_id.remove(id) {
            seen.insert(id.clone());
            result.push(item);
        }
    }
    
    // Pass 2: append remaining items in **original_order** (deterministic), not HashMap iteration
    for id in &original_order {
        if let Some(item) = by_id.remove(id) {
            result.push(item);
        }
    }
    
    result
}
```

### 3.3 `reorder_categories` / `reorder_tags`（V2 重写）

```rust
/// Reorder categories. Returns the resulting Vec<Category> for client-side calibration.
#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<Vec<Category>, String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.categories = apply_reorder(data.categories, &orderedIds);
    let result = data.categories.clone();  // clone before write since data is moved
    write_app_data(data)?;
    Ok(result)
}

#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_tags(orderedIds: Vec<String>) -> Result<Vec<Tag>, String> {
    let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;
    let mut data = read_app_data()?;
    data.tags = apply_reorder(data.tags, &orderedIds);
    let result = data.tags.clone();
    write_app_data(data)?;
    Ok(result)
}
```

### 3.4 lib.rs 注册

`tauri::generate_handler![...]` 列表添加 `reorder_categories, reorder_tags`。

### 3.5 单元测试（必须全部覆盖）

```rust
// tests for apply_reorder (pure function — no IO)
#[cfg(test)]
mod apply_reorder_tests {
    use super::*;
    
    fn cat(id: &str) -> Category { Category {
        id: id.to_string(), name: id.to_string(), color: "#000".to_string(), count: 0
    }}
    
    #[test]
    fn basic_reorder() {
        let items = vec![cat("A"), cat("B"), cat("C")];
        let r = apply_reorder(items, &vec!["C".into(), "A".into(), "B".into()]);
        assert_eq!(r.iter().map(|c| c.id.as_str()).collect::<Vec<_>>(), vec!["C","A","B"]);
    }
    
    #[test]
    fn empty_ordered_ids_appends_all_in_original_order() { /* ... */ }
    
    #[test]
    fn partial_ordered_ids_appends_remainder_in_original_order() { /* ... */ }
    
    #[test]
    fn unknown_ids_silently_skipped() { /* ... */ }
    
    #[test]
    fn duplicate_ids_deduplicated_first_wins() { /* ... */ }
    
    #[test]
    fn preserves_original_order_for_unmentioned_items() { /* ... */ }
}
```

**集成测试**（持久化往返）使用 `cargo test` + tempdir + `ENSEMBLE_DATA_DIR` env var override：
- 需先在 `src-tauri/src/utils/path.rs` 的 `get_app_data_dir()` 加 env override 支持（仅 cfg(test) 或所有 build 都加均可）
- 测试设置 `ENSEMBLE_DATA_DIR=<tempdir>`，写入 → reorder → 读出，断言顺序

**并发安全测试**：
```rust
#[test]
fn concurrent_reorder_and_add_no_lost_update() {
    // spawn 10 threads doing reorder + 10 doing add
    // After all join, assert: all added items present + reorder applied to original set
}
```

---

## 4. 前端 Store（V2 重大修订）

### 4.1 AppState 新增字段

```ts
interface AppState {
  // ... 原有字段
  categoriesVersion: number;
  tagsVersion: number;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  reorderTags: (orderedIds: string[]) => Promise<void>;
  setCategoriesFromExternal: (categories: Category[]) => void;  // 用 version-aware set
  setTagsFromExternal: (tags: Tag[]) => void;
}
```

### 4.2 串行队列（V2 修订 — 修复 A-P0-1/A-P0-2）

```ts
// src/stores/appStore.ts top-level
let reorderQueue: Promise<unknown> = Promise.resolve();

const enqueueReorder = <T>(task: () => Promise<T>): Promise<T> => {
  const result = reorderQueue.then(task, task);  // 即使前一个 reject 也继续
  reorderQueue = result.catch(() => {});  // 内部静默；外部仍能 .catch
  return result;
};
```

### 4.3 reorderCategories 实现（V2 — 两阶段提交）

```ts
reorderCategories: (orderedIds: string[]) => {
  if (!isTauri()) return Promise.resolve();
  
  // ============ Stage 1: Optimistic (synchronous, immediate) ============
  const snapshotForFallback = get().categories;  // 仅作 fallback 兜底
  
  // Compute new order (pure)
  const byId = new Map(snapshotForFallback.map(c => [c.id, c]));
  const seen = new Set<string>();
  const reordered: Category[] = [];
  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    const item = byId.get(id);
    if (item) {
      seen.add(id);
      reordered.push(item);
      byId.delete(id);
    }
  }
  // Append remaining in original order
  for (const c of snapshotForFallback) {
    if (byId.has(c.id)) reordered.push(c);
  }
  
  set(state => ({
    categories: reordered,
    categoriesVersion: state.categoriesVersion + 1,  // 重要：标记 version
  }));
  
  // ============ Stage 2: Persist (queued, async) ============
  return enqueueReorder(async () => {
    try {
      const updated = await safeInvoke<Category[]>('reorder_categories', { orderedIds });
      // Backend returns canonical Vec; sync only if version 仍是我们这次提交的
      // 简化：直接信任后端返回（已经持有 DATA_MUTEX，原子）
      if (updated) {
        set(state => ({
          categories: updated,
          categoriesVersion: state.categoriesVersion + 1,
        }));
      }
    } catch (error) {
      console.error('reorder_categories failed:', error);
      // Rollback: pull current canonical state from backend
      try {
        const real = await safeInvoke<Category[]>('get_categories');
        if (real) {
          set(state => ({
            categories: real,
            categoriesVersion: state.categoriesVersion + 1,
            error: String(error),
          }));
        }
      } catch {
        // Last resort: fall back to snapshot taken at call time
        set(state => ({
          categories: snapshotForFallback,
          categoriesVersion: state.categoriesVersion + 1,
          error: String(error),
        }));
      }
    }
  });
},
```

`reorderTags` 完全对称。

### 4.4 loadCategories 改造（V2 — 修复 R-P0-1 autoClassify race）

```ts
loadCategories: async () => {
  if (!isTauri()) return;
  
  // Snapshot version BEFORE async IPC
  const versionBefore = get().categoriesVersion;
  
  try {
    const categories = await safeInvoke<Category[]>('get_categories');
    if (!categories) return;
    
    // If version changed during IPC (due to reorder), skip set to avoid overwriting
    const versionAfter = get().categoriesVersion;
    if (versionAfter !== versionBefore) {
      console.log('[appStore] loadCategories skipped (version changed during IPC)');
      return;
    }
    set(state => ({
      categories,
      categoriesVersion: state.categoriesVersion + 1,
    }));
  } catch (error) {
    set({ error: String(error) });
  }
},
```

`loadTags` 对称。

### 4.5 addCategory / updateCategory / deleteCategory 也要 bump version

每次修改 categories 都要：
```ts
set(state => ({
  categories: [...state.categories, newCategory],
  categoriesVersion: state.categoriesVersion + 1,
}));
```

避免 reorder 后立即 add 时 version 同步丢失。

---

## 5. 组件层架构（V2 修订）

### 5.1 文件结构

```
src/components/sidebar/
├── index.ts                          # V2 改：导出新增组件
├── CategoryInlineInput.tsx           # 不改
├── TagInlineInput.tsx                # 不改
├── SortableCategoriesList.tsx        # 新增
├── SortableTagsList.tsx              # 新增
├── SortableCategoryRow.tsx           # 新增
├── SortableTagPill.tsx               # 新增
├── DragOverlayCategoryRow.tsx        # 新增（thin wrapper）
├── DragOverlayTagPill.tsx            # 新增（thin wrapper）
├── CategoryRowContent.tsx            # 新增（V2 — 共享 row 内容，避免 DragOverlay 与 Sortable 60% 重复）
├── TagPillContent.tsx                # 新增（V2 — 同上）
└── dnd/
    ├── CustomMouseSensor.ts
    ├── animations.ts
    ├── announcements.ts
    └── snapModifier.ts               # V2 — 12px 磁吸 modifier
```

### 5.2 Sidebar.tsx 变更（V2 含 SortableContext disabled 整体）

**保留**：导航 nav、Header、Section title bar、Footer Settings、`startDrag` 函数（仅追加 sortable-list 排除）

**改动**：
1. `startDrag`：
   ```ts
   const startDrag = async (e: React.MouseEvent) => {
     if (e.button !== 0) return;
     const target = e.target as HTMLElement;
     if (target.closest('[data-sortable-list]')) return;  // V2 新增
     // ... 原逻辑
   };
   ```
2. Categories 列表用 `<SortableCategoriesList>` 包，传入 `categories`、`isAdding`、`editingId`、`isDragging`、`onReorder`、`onDragStart`、`onDragEnd`
3. Tags 区同理用 `<SortableTagsList>`
4. SidebarProps 新增 4 个 prop：`onReorderCategories`、`onReorderTags`、`onDragStart`、`onDragEnd`、`isDragging`
5. Refresh 按钮：`disabled={isRefreshing || isClickAnimating || isDragging}` + visual `opacity-40` when dragging
6. 折叠 state 由 SortableCategoriesList 接收 `setShowAll` prop 在 onDragStart 时调用

### 5.3 MainLayout.tsx 变更

```ts
const { reorderCategories, reorderTags } = useAppStore();
const [isDragging, setIsDragging] = useState(false);

const handleReorderCategories = useCallback(async (orderedIds: string[]) => {
  try { await reorderCategories(orderedIds); }
  catch (e) { console.error(e); }
}, [reorderCategories]);

const handleReorderTags = useCallback(async (orderedIds: string[]) => {
  try { await reorderTags(orderedIds); }
  catch (e) { console.error(e); }
}, [reorderTags]);

const handleDragStart = useCallback(() => {
  // **V2 重要修复 R-P0-2**：编辑/新增态时直接 return（不 clear，保护 input）
  const s = useAppStore.getState();
  if (s.editingCategoryId || s.isAddingCategory || s.editingTagId || s.isAddingTag) {
    return;  // SortableContext disabled 在 List 内已阻止 drag，此为防御
  }
  setContextMenu(null);
  setTagContextMenu(null);
  setIsDragging(true);
}, []);

const handleDragEnd = useCallback(() => {
  setIsDragging(false);
}, []);
```

传给 Sidebar：所有上述 + `isDragging`。

---

## 6. 自定义 Sensor

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
    handler: ({ nativeEvent: e }: ReactMouseEvent) => shouldHandleEvent(e.target as HTMLElement),
  }];
}
```

KeyboardSensor 用 dnd-kit 默认（已支持 a11y），无需自定义。

---

## 7. DndContext 配置（V3 — modifiers 全部移到 DragOverlay；删除 restrictToVerticalAxis）

> **V3 关键修复 NEW-P0-1**：dnd-kit DndContext 上的 `modifiers` 同时作用于 SortableItem 和 DragOverlay。  
> V2 把 `restrictToVerticalAxis` 放在 DndContext 上 → DragOverlay 跟手时被卡在 X=0（向右拖时贴左边）。  
> V3 修复策略：
> 1. **DndContext modifiers 设为 `[]`**（空）
> 2. 删除 `restrictToVerticalAxis` —— `verticalListSortingStrategy` 已自然约束让位方向到 Y 轴；不需要再约束 DragOverlay 跟手的 X 轴
> 3. **DragOverlay 显式 modifiers = `[restrictToWindowEdges]`**（只防出窗口）
> 4. snapModifier 留在 DndContext（需作用于 SortableItem 的 transform，不是 DragOverlay 跟手）

```tsx
// SortableCategoriesList.tsx (excerpt)
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  modifiers={[snapModifier]}  // V3 — 仅 snap，不再用 axis lock；strategy 自然约束方向
  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
  accessibility={{
    announcements: makeAnnouncements(categories, 'category'),
    screenReaderInstructions: { draggable: 'To pick up a category, press space or enter. While dragging, use arrow keys to move. Press space or enter to drop, escape to cancel.' },
  }}
  onDragStart={(e) => { setActiveId(String(e.active.id)); onDragStart(); }}
  onDragEnd={(e) => {
    const wasReorder = e.over && e.active.id !== e.over.id;
    
    // V3 - distance-aware dropAnimation: 已磁吸时跳过 220ms 动画
    if (e.active.rect.current.translated && e.over) {
      const a = e.active.rect.current.translated;
      const o = e.over.rect;
      const dx = (o.left + o.width / 2) - (a.left + a.width / 2);
      const dy = (o.top + o.height / 2) - (a.top + a.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      setDropAnimationConfig(dist < 4
        ? null  // 跳过
        : { duration: Math.min(280, 120 + dist * 0.5), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
    
    setActiveId(null);
    onDragEnd();
    if (wasReorder) {
      const oldIdx = categories.findIndex(c => c.id === e.active.id);
      const newIdx = categories.findIndex(c => c.id === e.over!.id);
      onReorder(arrayMove(categories, oldIdx, newIdx).map(c => c.id));
    }
    setJustDroppedId(String(e.active.id));
    setTimeout(() => setJustDroppedId(null), 50);
  }}
  onDragCancel={() => { setActiveId(null); onDragEnd(); }}
>
  <SortableContext
    items={categories.map(c => c.id)}
    strategy={verticalListSortingStrategy}
    disabled={isAdding || editingId !== null}
  >
    <div data-sortable-list className="flex flex-col gap-0.5">
      {categories.map(c => (
        <SortableCategoryRow key={c.id} category={c} justDropped={justDroppedId === c.id} ... />
      ))}
      {isAdding && <CategoryInlineInput mode="add" ... />}
    </div>
  </SortableContext>
  
  {/* V3 - DragOverlay 显式 modifiers，仅防出窗口 */}
  <DragOverlay
    modifiers={[restrictToWindowEdges]}
    dropAnimation={dropAnimationConfig}
  >
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

### 7.1 Tags 配置差异

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  modifiers={[snapModifier]}  // V3 — 同 Categories
  ...
>
  <SortableContext items={tags.map(t => t.id)} strategy={rectSortingStrategy} disabled={...}>
    <div data-sortable-list className="flex flex-wrap gap-1.5" style={{ minHeight: ... }}>
      {tags.map(t => <SortableTagPill key={t.id} tag={t} ... />)}
    </div>
  </SortableContext>
  <DragOverlay modifiers={[restrictToWindowEdges]} dropAnimation={dropAnimationConfig}>
    {activeTag && <DragOverlayTagPill tag={activeTag} />}
  </DragOverlay>
</DndContext>
```

### 7.2 distance-aware dropAnimation 实现细节

`dropAnimationConfig` 是 React state（`useState<DropAnimation | null>`），onDragEnd 中根据 distance 设置；DragOverlay 在 unmount 时按此配置播放 drop 动画。设为 `null` → 不播放（瞬时消失）。

---

## 8. SortableCategoryRow（V2 含 justDropped）

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryRowContent } from './CategoryRowContent';

interface Props {
  category: Category;
  isActive: boolean;
  isEditing: boolean;
  justDropped: boolean;  // V2 — 防止 drop 同位置后误触 click navigate
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onColorChange: (color: string) => void;
}

export function SortableCategoryRow({ category, isActive, isEditing, justDropped, ... }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: category.id,
    disabled: isEditing,  // 编辑态不可拖（与 SortableContext disabled 双保险）
    transition: {
      duration: 220,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  });
  
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),  // ⚠️ Translate 不是 Transform
    transition,
    opacity: isDragging ? 0 : 1,                   // V2 — 改为 0（消失让位）
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (justDropped) {
      e.preventDefault();
      return;  // V2 — drop 后下一帧不响应 click
    }
    onClick();
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="..."  // 沿用 V1 className
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
    >
      <CategoryRowContent
        category={category}
        showCount
        isActive={isActive}
        onColorChange={onColorChange}
      />
    </div>
  );
}
```

`CategoryRowContent`：共享渲染逻辑（ColorPicker + name + count），ColorPicker 包 `<span data-no-dnd="true" onMouseDown={(e) => e.stopPropagation()}>` 双保险。

`DragOverlayCategoryRow`：
```tsx
export function DragOverlayCategoryRow({ category }: { category: Category }) {
  return (
    <div className="drag-overlay-row h-8 px-2.5 flex items-center gap-2.5">
      <CategoryRowContent category={category} showCount={false} />  {/* V2 — 不显示 count */}
    </div>
  );
}
```

---

## 9. 动画/主题常量

```ts
// src/components/sidebar/dnd/animations.ts
import type { DropAnimation } from '@dnd-kit/core';
import { defaultDropAnimation } from '@dnd-kit/core';

export const CATEGORY_DROP_ANIMATION: DropAnimation = {
  ...defaultDropAnimation,
  duration: 220,                                   // V2 — 改 220（与 cascade 等长）
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

export const TAG_DROP_ANIMATION: DropAnimation = CATEGORY_DROP_ANIMATION;

export const SNAP_DISTANCE_PX = 12;  // V2 新增
```

---

## 10. CSS 增量（V2 — 含 token + cursor 抑制）

追加到 `src/index.css`：

```css
/* V2 — Drag-specific CSS tokens */
:root {
  --color-accent: #0063E1;
  --color-accent-soft: rgba(0, 99, 225, 0.5);
  --ease-drag: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-drag-lift: cubic-bezier(0.34, 1.32, 0.64, 1);
  --ease-drag-cancel: cubic-bezier(0.32, 0.72, 0, 1);
  --duration-drag-lift-grip: 80ms;
  --duration-drag-lift-pull: 120ms;
  --duration-drag-reorder: 220ms;
  --duration-drag-settle: 220ms;
  --duration-drag-cancel: 280ms;
  --duration-drag-snap: 80ms;
  --duration-drag-indicator-fade: 100ms;
  --duration-drag-indicator-move: 150ms;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-accent: #0A84FF;
    --color-accent-soft: rgba(10, 132, 255, 0.5);
  }
}

/* V2 — Suppress dnd-kit default cursor: grab on hover (macOS gestalt) */
[data-sortable-list] [aria-roledescription='sortable'] {
  cursor: default;
}
[data-sortable-list] [aria-roledescription='sortable']:active {
  cursor: grabbing;
}

/* DragOverlay — multi-layer hsl shadow per V2 spec */
.drag-overlay-row {
  box-shadow:
    0 1px 2px hsl(0 0% 0% / 0.06),
    0 4px 8px hsl(0 0% 0% / 0.08),
    0 12px 24px hsl(0 0% 0% / 0.10);
  border-radius: 6px;
  background: white;
  cursor: grabbing;
}

.drag-overlay-pill {
  box-shadow:
    0 1px 2px hsl(0 0% 0% / 0.05),
    0 3px 6px hsl(0 0% 0% / 0.07),
    0 8px 16px hsl(0 0% 0% / 0.08);
  border-radius: 4px;
  cursor: grabbing;
}

/* Drop indicators (V2 — token color) */
.drop-indicator-h {
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
  margin: 0 2px;
  transition: opacity var(--duration-drag-indicator-fade) ease-out,
              transform var(--duration-drag-indicator-move) var(--ease-drag);
}

.drop-indicator-v {
  width: 2px;
  height: 20px;
  background: var(--color-accent);
  border-radius: 1px;
  transition: opacity var(--duration-drag-indicator-fade) ease-out,
              transform var(--duration-drag-indicator-move) var(--ease-drag);
}

@media (prefers-reduced-motion: reduce) {
  [data-sortable-list] *,
  .drag-overlay-row,
  .drag-overlay-pill,
  .drop-indicator-h,
  .drop-indicator-v {
    transition: none !important;
    animation: none !important;
  }
}
```

---

## 11. Snap Modifier（V3 — 修正 dnd-kit API + smooth transition）

```ts
// src/components/sidebar/dnd/snapModifier.ts
import type { Modifier } from '@dnd-kit/core';
import { SNAP_DISTANCE_PX } from './animations';

/**
 * Snap dragged item's center to nearest droppable's center when within
 * SNAP_DISTANCE_PX pixels. The 80ms smooth transition is provided by
 * DragOverlay's intrinsic CSS transition on transform.
 *
 * V3 NOTE: dnd-kit Modifier signature `({ transform, ... })` exposes
 * `over` only inside DndContext (not directly in modifier args). Use
 * `active.rect.current.translated` to get current dragged position and
 * `over.rect` (passed via ModifierArguments in v6.3+) for target.
 */
export const snapModifier: Modifier = (args) => {
  const { transform, draggingNodeRect, over } = args;
  if (!draggingNodeRect || !over) return transform;
  
  // over.rect in dnd-kit v6.3+ is a ClientRect (left/top/width/height)
  const overRect = over.rect;
  if (!overRect) return transform;
  
  // dragged element's current center (after applying current transform)
  const draggedCenterX = draggingNodeRect.left + draggingNodeRect.width / 2 + transform.x;
  const draggedCenterY = draggingNodeRect.top + draggingNodeRect.height / 2 + transform.y;
  
  // target slot's center
  const slotCenterX = overRect.left + overRect.width / 2;
  const slotCenterY = overRect.top + overRect.height / 2;
  
  const dx = slotCenterX - draggedCenterX;
  const dy = slotCenterY - draggedCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist <= SNAP_DISTANCE_PX) {
    // Snap to slot center (transform delta gets smoothed by DragOverlay's
    // CSS transition: 80ms cubic-bezier(0.16,1,0.3,1) — set in animations.ts)
    return { ...transform, x: transform.x + dx, y: transform.y + dy };
  }
  return transform;
};
```

**配套 CSS**（添加到 §10）：
```css
/* DragOverlay smooth snap transition */
[data-dnd-kit-overlay] {
  transition: transform var(--duration-drag-snap) var(--ease-drag);
}
```

> 注意：`[data-dnd-kit-overlay]` 是假设性选择器；实际需用 dnd-kit DragOverlay 渲染元素的 className 或 `<DragOverlay style={{ transition: ... }}>` 内联样式注入。具体实现 T8 SubAgent 验证。

---

## 12. A11y / Announcements

V1 实现保留，新增 `screenReaderInstructions`（见 §7）。

---

## 13. 测试策略（V2 修订）

### 13.1 Rust 后端
- **Pure unit tests**（apply_reorder）：basic / empty / partial / unknown / duplicate / preserve-original
- **Integration test**（持久化往返）：tempdir + ENSEMBLE_DATA_DIR override
- **Concurrency test**：10 reorder + 10 add 并发，断言数据完整 + lock 生效

### 13.2 前端
- `appStore.reorder.test.ts`:
  - 乐观更新立即生效
  - IPC 失败时 fallback 到后端 canonical
  - 串行队列：连发两次顺序保证
  - categoriesVersion 自增
  - loadCategories 在 version 变化时跳过 set
- `SortableCategoriesList.test.tsx`:
  - 渲染所有 categories
  - data-no-dnd 包裹 ColorPicker
  - SortableContext disabled when isAdding
- jsdom 不支持 PointerEvent 实测拖动手势 → 改用主 Agent 在 dev mode 验证

### 13.3 Type / Lint
`npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings` 全绿。

---

## 14. 性能与 bundle

| 项 | 预算 | 实际预估 |
|---|---|---|
| dnd-kit 总 bundle 增量 | ≤ 25 KB min+gzip | ~20 KB |
| 9 项 reorder onMove | ≤ 16ms/frame | 远低于 |
| Tags 10 项 reorder | 同 | 同 |
| `categoriesWithCounts` useMemo 重算 | ≤ 1ms | 远低于 |
| 额外 IPC 调用 | 1 次 / drop | OK |
| Rust DATA_MUTEX 持锁时间 | ≤ 5ms（单次 read+modify+write） | OK（IO 是主要成本） |

---

## 15. 与 ImplementationPlan 的衔接

参见 `04_implementation_plan.md` V2。
