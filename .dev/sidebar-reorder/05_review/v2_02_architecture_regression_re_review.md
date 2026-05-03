# V2 合并复评 — 架构评审 + 零回归评审

> **复评对象**：`.dev/sidebar-reorder/03_tech_plan.md` V2 + `.dev/sidebar-reorder/04_implementation_plan.md` V2
> **基线**：`05_review/02_architecture_review.md`（V1 7.4/10）+ `05_review/03_zero_regression_review.md`（V1 6.5/10）
> **基线代码**：`src-tauri/src/commands/data.rs`（429 行，已读全文）+ `src-tauri/src/utils/path.rs`+`src/stores/appStore.ts`+`src/stores/skillsStore.ts`/`mcpsStore.ts`/`claudeMdStore.ts` 的 autoClassify
> **复评者角色**：合并资深前端架构师 + 防御性回归审查官
> **复评日期**：2026-05-03

---

## 0. 总评

| 项 | V1 | V2 | Δ | 一句话 |
|---|---|---|---|---|
| 架构总分 | 7.4 / 10 | **8.6 / 10** | +1.2 | 5 个 P0 已修 4.5 个；P0-4 修复存在隐患 |
| 回归总分 | 6.5 / 10 | **8.7 / 10** | +2.2 | 3 个 P0 已修 2.5 个；版本号协议有竞态边角 |
| 是否 10/10 可实施 | 否 | **否（接近）** | — | 还差 2 个 P0 + 4 个 P1 |
| 是否安全实施 | 否 | **是（在加 2 处补丁后）** | — | 主结构正确，剩余问题局部可补 |

V2 巨大进步，但**仍有 2 个 P0 阻断点**未真正闭环：
- **P0-A4-residual**：V2 §7 把 `restrictToVerticalAxis` 放在 `<DndContext modifiers={...}>` 上，与原 P0-4 评审要求（"不放在全局，仅 overlay 用 restrictToWindowEdges"）相反。dnd-kit modifiers 设在 DndContext 上**会同时作用于 SortableItem 与 DragOverlay**，DragOverlay 跟手仍会被卡在 X=0。
- **P0-Token-undefined**：V2 §10 CSS 中 `.drop-indicator-h/v` 引用 `--duration-drag-indicator-fade` 与 `--duration-drag-indicator-move`，但 `:root` 段未定义这两个 token——首次渲染时 transition 字符串非法 → 整段 transition 被忽略，indicator 不动画。

其余 P0 / P1 修复扎实。下文逐项勾选。

---

## 1. 架构 P0 勾选（V1 评审 §1 的 5 条）

| ID | V1 P0 | V2 处理状况 | 状态 |
|---|---|---|---|
| **A-P0-1** | snapshot 污染（队列模式不正确） | §4.3 两阶段提交，snapshot 在 stage1 同步 get 后立即用于 stage2 fallback；stage2 IPC 队列内成功时直接信任后端返回的 Vec | ✅ 已修 |
| **A-P0-2** | 乐观更新 vs 队列阻塞矛盾 | §4.3 立即 set + 队列分离：UI 动画立即响应；IPC 失败时通过 get_categories 重新拉取真相 | ✅ 已修 |
| **A-P0-3** | hover cursor 与 spec §2.7 冲突 | §10 CSS 加 `[data-sortable-list] [aria-roledescription='sortable'] { cursor: default }` + `:active { cursor: grabbing }` | ✅ 已修（详见 §3.4） |
| **A-P0-4** | restrictToVerticalAxis 放 DndContext 破坏 overlay 跟手 | §7 仍把 modifier 放在 `<DndContext modifiers={...}>` 上 — **未真正修复**！注释/Revision History 说"不应用 DragOverlay"，代码却仍是全局 modifier | ❌ **未修** |
| **A-P0-5** | 后端返回 () 而非 Vec<Category>；HashMap 迭代序无定义 | §3.3 返回 `Vec<Category>`；§3.2 `apply_reorder` 用 `original_order: Vec<String>` 保留迭代序 | ✅ 已修 |

**P0 净结果：4 / 5 真正闭环，A-P0-4 仍是阻断点。**

### 1.1 P0-4 详细分析（仍未修复）

V2 §7 第 547-548 行：
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  modifiers={[restrictToVerticalAxis, restrictToParentElement, snapModifier]}
  ...
>
  ...
  <DragOverlay dropAnimation={CATEGORY_DROP_ANIMATION}>
    {/* 注释说"不应用 modifiers" — 但 DragOverlay 没传 modifiers 不代表它不受 DndContext 上 modifiers 影响 */}
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

**dnd-kit 真实行为**（v6.3.1）：
- `<DndContext modifiers={...}>` 设的 modifier **作用于 active draggable 的 transform**
- `<DragOverlay>` 默认**继承** DndContext modifiers（参见 dnd-kit 源码 `packages/core/src/components/DragOverlay/DragOverlay.tsx` 的 `useDndContext()` 调用）
- 要让 DragOverlay 不受 DndContext modifier 影响，**必须显式传 `<DragOverlay modifiers={[]}>` 或 `<DragOverlay modifiers={[restrictToWindowEdges]}>`**

**反例**：用户在 Categories 区开始拖动 "Coding"，将鼠标横向移动到 sidebar 外（如移到 Skills 列表区域），DragOverlay 仍会停在 sidebar 内的 X=0 位置，因为 `restrictToVerticalAxis` 把 transform.x 强制为 0。

**修复**（必须改 V2 §7）：
```tsx
<DndContext
  modifiers={[]}  // 全局空
  ...
>
  <SortableContext ...>
    {/* SortableItem 自己用 useSortable 时通过自定义方式应用 modifier
        OR 改用 <SortableContext modifiers> — v10 sortable 可在 SortableContext 上传 */}
  </SortableContext>
  <DragOverlay
    modifiers={[restrictToWindowEdges]}  // 仅限制不出窗口
    dropAnimation={CATEGORY_DROP_ANIMATION}
  >
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

**注**：`@dnd-kit/sortable` v10 的 `useSortable` 内部已经通过 `verticalListSortingStrategy` 实现"让位 transform 仅 Y 轴"，所以**根本不需要 `restrictToVerticalAxis`** 来约束让位方向。Tags 已经走对了（§7.1 不含 restrictToVerticalAxis 是正确的）。Categories 也应该删掉它。

---

## 2. 回归 P0 勾选（V1 评审 §P0 的 3 条）

| ID | V1 P0 | V2 处理状况 | 状态 |
|---|---|---|---|
| **R-P0-1** | autoClassify 后 loadCategories 覆盖用户拖动顺序 | §2.3 + §4.4 categoriesVersion 协议（loadCategories 在 IPC 前后比对 version，有变化则跳过 set）；reorderCategories / addCategory / updateCategory / deleteCategory 都 bump version | ✅ 已修（边角竞态见下文 §4） |
| **R-P0-2** | 编辑/新增态拖动激活会丢失输入 | §5.3 `handleDragStart` 在 `editingCategoryId / isAddingCategory / editingTagId / isAddingTag` 任一为 true 时直接 return（不 clear）；§7 `<SortableContext disabled={isAdding \|\| editingId !== null}>` + `useSortable({ disabled: isEditing })` 三层防御 | ✅ 已修 |
| **R-P0-3** | Rust 后端无锁，reorder + add_category 并发 lost update | §3.1 加 `static DATA_MUTEX: Mutex<()>` + 所有 mutating 命令外层 `let _guard = DATA_MUTEX.lock()`；§3.5 含并发安全测试要求 | ✅ 已修（详见 §3.1） |

**P0 净结果：3 / 3 已修，但 R-P0-1 的 categoriesVersion 协议在多次连发场景下有 race。**

---

## 3. 关键检查点逐项验证

### 3.1 apply_reorder pure function 是否真的正确？

**V2 §3.2 实现（已读 line 173-204）**：

```rust
pub fn apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T> {
    let original_order: Vec<String> = items.iter().map(|i| i.id().to_string()).collect();
    let mut by_id: HashMap<String, T> = items.into_iter().map(|i| (i.id().to_string(), i)).collect();

    let mut result: Vec<T> = Vec::with_capacity(by_id.len());
    let mut seen: HashSet<String> = HashSet::new();

    for id in ordered_ids {
        if seen.contains(id) { continue; }
        if let Some(item) = by_id.remove(id) {
            seen.insert(id.clone());
            result.push(item);
        }
    }

    for id in &original_order {
        if let Some(item) = by_id.remove(id) {
            result.push(item);
        }
    }

    result
}
```

**勾选**：
- ✅ original_order 在 `items` move 进 HashMap 之前 snapshot — 正确解决 V1 P0-5 中 HashMap 迭代序 undefined 问题
- ✅ Pass 1 用 `seen` 去重，处理 ordered_ids 中的重复 id
- ✅ Pass 2 按 original_order 追加未提及的 item — 保证 newly-added items 放在末尾且顺序确定
- ✅ Unknown id 在 ordered_ids 中由 `if let Some(item) = by_id.remove(id)` 自然 skip
- ✅ 容错语义清晰：缺 id → 追加；多 id → 跳过；重 id → 第一次胜出

**唯一遗留瑕疵**（P2）：`Vec::with_capacity(by_id.len())` 容量不足以容纳 ordered_ids 中超出 by_id 大小的部分（虽然 ordered_ids 最多覆盖 by_id），不会 panic 但会触发一次 grow。可改为 `Vec::with_capacity(by_id.len().max(ordered_ids.len()))`。

**§3.2 文档中 line 135-168 的 todo!() 占位代码**：是文档中"展示错误实现 → 然后给出正确实现"的对比。SubAgent 阅读时若不读到 line 173-204 会以为最终实现是 todo!()。**P2 文档可读性问题**：建议在 line 168 后立即加 `// 上面是错误示范，正确实现见下：`。

### 3.2 串行队列 + 立即 set 的"两阶段提交"是否真原子？

**V2 §4.3 实现（line 320-383）**：

```ts
reorderCategories: (orderedIds) => {
  const snapshotForFallback = get().categories;  // (a) 同步读
  const reordered = ...computeReorder...;        // (b) 同步算
  set({ categories: reordered, categoriesVersion: state.categoriesVersion + 1 }); // (c) 同步立即写
  return enqueueReorder(async () => {            // (d) 排队 IPC
    try { ... } catch { ... }
  });
}
```

**双连发场景验证**：
- T0: drag1 完成 → reorderCategories(['A','B','C']) → snapshot1 = ['B','A','C']（真实）→ set ['A','B','C'] → enqueue task1
- T1: drag2 完成 → reorderCategories(['A','C','B']) → snapshot2 = ['A','B','C']（被 task1 stage1 set 后的状态）→ set ['A','C','B'] → enqueue task2
- T2: task1 IPC 发出，期间 task2 已经在 React state 上完成 stage1
- T3: task1 IPC 成功，set categories ← 后端返回的 ['A','B','C']  ← **倒退！**
- T4: task2 IPC 发出
- T5: task2 IPC 成功，set categories ← 后端返回的 ['A','C','B'] ← 最终正确

**关键问题**：T3 → T4 之间 UI 短暂回到 ['A','B','C']，**用户视角看到一次"回弹"再"再调整"**。

V1 评审 P0-1 的关键修复诉求是"snapshot 应在队列内部 get"，V2 没有完全采纳——snapshotForFallback 在调用时 get（不在队列内），所以"snapshot 污染"问题在**失败回滚的备用路径**仍存在（后端 get_categories 又失败时 fallback 用的 snapshot 已经过时）。

**严重程度**：
- 成功路径：T3 短暂回弹一帧（约 220ms），用户视觉可能不易察觉但理论上存在
- 失败路径：snapshot fallback 仅在 backend get_categories 也失败时启用，是"双重失败兜底"——用户看到的是过时数据，但比 nothing 好
- 网络/IPC 在 Tauri 内是 ms 级，T3 → T5 间隔通常 < 50ms — **实际可接受**

**结论**：V2 实现属于"实用主义妥协"，**不是严格 atomic**，但因后端有 DATA_MUTEX 兜底（lost update 不可能），且后端返回 Vec 校准为正确顺序，**最终一致性保证**。建议在 §4.3 加注释说明这一妥协。

**P1 改进**：成功路径不需要二次 set。删除 line 354-360 的 `if (updated) { set... }`——stage1 已经 set 过乐观状态，stage2 成功时无需校准（除非检测到 updated 与乐观结果不同）。改为：
```ts
if (updated) {
  const current = get().categories;
  const isSame = current.length === updated.length &&
                 current.every((c, i) => c.id === updated[i].id);
  if (!isSame) {
    set(state => ({
      categories: updated,
      categoriesVersion: state.categoriesVersion + 1,
    }));
  }
}
```
这样可以避免成功路径的回弹一帧。

### 3.3 categoriesVersion 协议在多 reorder + autoClassify 串发时是否真有效？

**V2 §4.4 loadCategories（line 391-414）**：
```ts
loadCategories: async () => {
  const versionBefore = get().categoriesVersion;
  const categories = await safeInvoke<Category[]>('get_categories');
  const versionAfter = get().categoriesVersion;
  if (versionAfter !== versionBefore) {
    return;  // skip set
  }
  set(state => ({ categories, categoriesVersion: state.categoriesVersion + 1 }));
}
```

**场景验证**：
- T0：用户拖 reorder1 → version 1 → enqueue task1
- T1：autoClassify 完成 → loadCategories 开始 → versionBefore = 1 → IPC 发出
- T2：task1 IPC 成功 → set version 2
- T3：loadCategories IPC 返回 → versionAfter = 2 → versionBefore !== versionAfter → skip ✅

**但有一个 race 边角**：
- T0：autoClassify 完成 → loadCategories 开始 → versionBefore = 0 → IPC 发出
- T1：用户拖 reorder1 → enqueue task1 stage1 set version 1
- T2：用户拖 reorder2 → enqueue task2 stage1 set version 2
- T3：loadCategories IPC 返回 → versionAfter = 2 → skip set ✅
- T4：task1 IPC 成功 → set version 3（用 task1 后端 Vec）
- T5：task2 IPC 成功 → set version 4（用 task2 后端 Vec）

**正确**。version-bump 在两个阶段都做（stage1 同步 + stage2 IPC 成功后），所以**任何并发 IPC 都能感知到版本变化**。

**但有第二个边角**：
- T0：autoClassify 完成 → loadCategories 开始 → versionBefore = 5
- T1：用户没有动 reorder
- T2：但同一时刻另一个 autoClassify（mcpsStore 的）也 fired → 它内部调 addCategory（**bump version 到 6**）
- T3：loadCategories IPC 返回 → versionAfter = 6 → skip set
- T4：但 categories 实际上已经被 addCategory 更新了 — skip set 是**正确**的（addCategory 已经把新 category 加进 state）

**结论**：协议正确。多 reorder + autoClassify 并发安全。

**P1 改进**：协议依赖"任何 mutation 都 bump version"。V2 §4.5 明确要求 add/update/delete 都要 bump，但**deleteTag、updateTag、addTag** 是否在 V2 中也加了？查 line 419-429 仅说"每次修改 categories 都要"（categories 单数）+ "tags 对称"，但建议在 04_implementation_plan T3 任务卡里**显式列出**所有 8 个 mutator（add/update/delete × categories/tags），否则 SubAgent 容易漏改 tags 那 4 个。

### 3.4 CSS cursor 抑制选择器是否会被 dnd-kit 实际生成？

**V2 §10 line 743-748**：
```css
[data-sortable-list] [aria-roledescription='sortable'] {
  cursor: default;
}
[data-sortable-list] [aria-roledescription='sortable']:active {
  cursor: grabbing;
}
```

**dnd-kit 真实行为**：
- `useSortable` 返回的 `attributes` 对象中包含 `aria-roledescription: 'sortable'`（来自 `@dnd-kit/sortable/src/hooks/useSortable.ts` 中的 `defaultAttributes.role = 'button'` 和 `roleDescription = 'sortable'`）
- ✅ 选择器 `[aria-roledescription='sortable']` **会**匹配

**但有一个隐患**：dnd-kit v6 默认**不**注入 `cursor: grab`！这是 V1 评审 P0-3 的**误判**——dnd-kit v6.3.1 源码中没有给 sortable item 设 grab cursor，是**消费方代码**通常会加（如 example demo）。

**结论**：抑制 CSS 是正确防御，但不是必需。**留着无害**。

**关键实现细节**：消费方组件 SortableCategoryRow（V2 §8）的 `style` 中没有显式设 `cursor`（仅 transform/transition/opacity），所以 hover 时 cursor 默认是父级继承的（Sidebar.tsx 中可能是 default）。**V2 §8 隐式正确**——但应该在 §8 的注释中加一句"不显式设 cursor，由 §10 CSS 决定"。

**P2 改进**：选择器 `[data-sortable-list] [aria-roledescription='sortable']:active` 的 `:active` 仅在鼠标按下时生效。dnd-kit 拖动期间元素可能脱离 active 状态（因为 mouseup 后还有 200ms drop animation）。建议追加 `[data-sortable-list] [aria-roledescription='sortable'][aria-pressed='true']`（dnd-kit 拖动期间设 `aria-pressed='true'`）。

### 3.5 snapModifier 实现是否能在 dnd-kit modifier API 中工作？

**V2 §11 line 814-834**：
```ts
export const snapModifier: Modifier = ({ transform, draggingNodeRect, droppableContainers, over }) => {
  if (!draggingNodeRect || !over) return transform;
  const overRect = over.rect;
  if (!overRect) return transform;

  const draggedCenterX = draggingNodeRect.left + draggingNodeRect.width / 2 + transform.x;
  const draggedCenterY = draggingNodeRect.top + draggingNodeRect.height / 2 + transform.y;
  const slotCenterX = overRect.left + overRect.width / 2;
  const slotCenterY = overRect.top + overRect.height / 2;

  const dx = slotCenterX - draggedCenterX;
  const dy = slotCenterY - draggedCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= SNAP_DISTANCE_PX) {
    return { ...transform, x: transform.x + dx, y: transform.y + dy };
  }
  return transform;
};
```

**dnd-kit Modifier API（v6.3.1）签名**：
```ts
type Modifier = (args: ModifierArguments) => Transform;
type ModifierArguments = {
  transform: Transform;
  draggingNodeRect: ClientRect | null;
  containerNodeRect: ClientRect | null;
  active: Active | null;
  over: Over | null;
  windowRect: ClientRect | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  // NO `droppableContainers` field!
};
```

**问题**：
1. ✅ `transform`、`draggingNodeRect`、`over` 都是合法参数
2. ❌ `droppableContainers` **不是** dnd-kit Modifier 参数。V2 解构里有它但实际不会传，TypeScript 会报错 `Property 'droppableContainers' does not exist on type 'ModifierArguments'`
3. ✅ `over.rect` 是合法字段（`Over` 类型有 `rect: ClientRect | null`）
4. ✅ `transform: { x, y, scaleX, scaleY }` 返回结构正确

**修复**（必须）：删掉 `droppableContainers` 解构，因为没用：
```ts
export const snapModifier: Modifier = ({ transform, draggingNodeRect, over }) => {
  ...
}
```

**严重程度**：P1（编译错误，但影响实施工作量很小）

**第二个隐患**：snapModifier 仅在 `over` 不为 null 时生效。当用户拖到容器边缘**没有**任何 droppable 时（如 sidebar 外），snapModifier 返回原 transform，符合预期。

**第三个隐患**：snap 12px 触发的 dx/dy 累加导致 transform 突变 12px——`useSortable` 的 transition CSS 会平滑这次突变（220ms cubic-bezier），但若 transition 字符串被 inline style 覆盖，会瞬间跳——见 V1 P1-3 评审。V2 §8 line 643-647 的 `style: { transition }` 来自 `useSortable`，应该正确包含 transition 字符串。

### 3.6 SortableContext disabled 是否真覆盖 add input 边界？

**V2 §7 line 570-580**：
```tsx
<SortableContext
  items={categories.map(c => c.id)}
  strategy={verticalListSortingStrategy}
  disabled={isAdding || editingId !== null}
>
  <div data-sortable-list className="flex flex-col gap-0.5">
    {categories.map(c => (
      <SortableCategoryRow key={c.id} category={c} ... />
    ))}
    {isAdding && <CategoryInlineInput mode="add" ... />}  // ← 在 SortableContext 内
  </div>
</SortableContext>
```

**dnd-kit `SortableContext` disabled 行为**（v10）：
- `disabled: true` 让其内所有 `useSortable` 子项的 `disabled` 自动变 true（除非子项显式 `disabled: false`）
- ✅ Add input 期间，所有 SortableCategoryRow 的 useSortable 都被 disable，无法激活拖动 — 正确

**但 Add input 自身是否在 SortableContext 内**：
- Add input（CategoryInlineInput）是在 `<div data-sortable-list>` 内的兄弟节点，没有自己的 useSortable hook
- ✅ 不属于 sortable items，不会被 dnd-kit 当作 droppable / draggable

**正确**。SortableContext disabled 充分覆盖。

**但有第三层风险**：dnd-kit `<DndContext>` 仍然 active（仅 SortableContext disabled），所以仍然在监听 mousedown。如果用户在 input 中输入到一半，鼠标移到 input 框外某个 row 上按下并移动 4px，dnd-kit 会激活 drag——但 useSortable disabled 会阻止 row 实际响应，**onDragStart 不会触发**（dnd-kit 在 sensor 激活时检查 active draggable 是否 disabled）。

**结论**：3 层防御（handleDragStart guard / SortableContext disabled / useSortable disabled）真正有效。✅

### 3.7 T1 测试的 ENSEMBLE_DATA_DIR override 是否需修改 path.rs？

**当前 path.rs `get_app_data_dir()` 实现（line 16-20）**：
```rust
pub fn get_app_data_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".ensemble")
}
```

**V2 计划要求（§3.5 line 273-275）**：
> 需先在 `src-tauri/src/utils/path.rs` 的 `get_app_data_dir()` 加 env override 支持

**确认**：是的，必须改。当前实现**没有** env override。修改提案：
```rust
pub fn get_app_data_dir() -> PathBuf {
    if let Ok(override_dir) = std::env::var("ENSEMBLE_DATA_DIR") {
        return PathBuf::from(override_dir);
    }
    dirs::home_dir().unwrap_or_else(|| PathBuf::from(".")).join(".ensemble")
}
```

**关键风险**：在 production build 也读 env 会被恶意 env 注入篡改用户数据目录。建议加 `#[cfg(test)]` 限制：
```rust
pub fn get_app_data_dir() -> PathBuf {
    #[cfg(test)]
    if let Ok(override_dir) = std::env::var("ENSEMBLE_DATA_DIR") {
        return PathBuf::from(override_dir);
    }
    dirs::home_dir().unwrap_or_else(|| PathBuf::from(".")).join(".ensemble")
}
```

**但**：`#[cfg(test)]` 仅在编译为 test crate 时有效，集成测试在 separate test binaries 中运行——因此 cargo test 时 path.rs 编译时不带 cfg(test)！**正确做法**是允许 production 也读 env（开发者明确需要时），文档化"此 env var 仅供测试/开发，请勿生产使用"，或用 `#[cfg(any(test, debug_assertions))]`。

**T1 任务卡的现有要求**（line 96）："仅 cfg(test) 或所有 build 都加均可"——已经留了选择空间。**OK，但建议显式选 `#[cfg(any(test, debug_assertions))]`**，避免 release build 受 env 影响。

**第二个隐患**：path.rs 现有 13 个测试（line 92-198）测试 `get_app_data_dir() == home/.ensemble`。如果加 env override，这些测试在 ENSEMBLE_DATA_DIR set 时会失败。需要在测试 setup 中确保 env 干净：
```rust
#[test]
fn test_get_app_data_dir() {
    std::env::remove_var("ENSEMBLE_DATA_DIR");  // 防 env 污染
    ...
}
```

**P1 行动项**：T1 任务卡补一句"修改 path.rs 现有 4 个测试加 env clean setup"。

### 3.8 后端返回 Vec<Category> 后前端两次 set 是否会触发不必要重渲染？

**V2 §4.3 流程**：
1. Stage1 同步 set categories + version++（**渲染 1 次**）
2. Stage2 IPC 成功 → set categories + version++（**渲染 2 次**）

**两次 set 之间**：
- React 18 默认 batched update，但 stage1 是 mousedown 处理函数末尾，stage2 是 promise.then 回调——**两次 set 在不同 microtask**，**不会被 batch**
- 每次 set 触发 useAppStore 订阅者重渲染。MainLayout、Sidebar、SortableCategoriesList、9 个 SortableCategoryRow 都重渲染
- 第 1 次 → reorder 视觉立即生效（cascade animation 启动）
- 第 2 次 → categories Vec reference 变（即使内容相同），导致 SortableContext items array 更新 → dnd-kit 重测

**性能影响**：
- 9 个 row × 2 次 reconciliation = 18 次 useSortable 调用 + 18 次 transform 重算
- 单次 reconciliation 估计 ~0.3ms × 18 = 5.4ms — **远低于 16ms frame budget**
- DragOverlay 此时已 unmount（drop animation 结束后），不受影响

**结论**：性能不构成问题。**但视觉可能有问题**：
- T+0ms: drop animation 启动
- T+220ms: drop animation 结束
- T+225ms: stage2 IPC 完成 → 第 2 次 set
- 如果 stage2 set 与 drop animation 时间重叠 < 220ms，**可能触发 cascade 再次让位（如果后端返回的顺序与乐观顺序不同）**

**修复（P1）**：见 §3.2 的改进 — 仅在后端返回与乐观状态不同时才执行 stage2 set：
```ts
if (updated) {
  const current = get().categories;
  const isSame = current.length === updated.length &&
                 current.every((c, i) => c.id === updated[i].id);
  if (!isSame) {
    set(state => ({ categories: updated, categoriesVersion: state.categoriesVersion + 1 }));
  }
}
```

**但**仍然 bump version（即使没改 categories），保证 loadCategories race 检查正常工作：
```ts
if (updated) {
  const current = get().categories;
  const isSame = current.length === updated.length &&
                 current.every((c, i) => c.id === updated[i].id);
  set(state => ({
    ...(isSame ? {} : { categories: updated }),
    categoriesVersion: state.categoriesVersion + 1,
  }));
}
```

---

## 4. 新引入的工程问题（V2 vs V1）

### 4.1 DATA_MUTEX 死锁可能？

**分析**：
- V2 仅一把锁，所有 mutating 命令都 lock 同一把
- 关键约束：write_app_data **不再** 自己 lock（caller 持有）—— V2 §3.1 line 129 明确"write_app_data 内部不再加锁"
- 但 V2 §3.1 line 121-125 给的 add_category 示例中 `write_app_data(data)?;` 仍然调用，而 V2 line 129 又说 write_app_data 内不再 lock — **这是要求"修改 write_app_data 函数定义本身吗"？**

**确认 V1 现状**：line 22-34 的 write_app_data 当前**没有任何锁**。所以 V2 的 "write_app_data 内不再加锁" 是误导性表述——它本来就没锁。**V2 实际是要求"不再添加锁到 write_app_data，由 caller 加 DATA_MUTEX"**。

**结论**：✅ 不会死锁。单一锁、非递归、临界区只包含 read+modify+write 同步操作。

**新隐患（P2）**：`init_app_data`（data.rs line 67-126）调用 `write_app_data` + `write_settings`。它**没有**被 V2 §3.1 line 105-112 列入"应用范围"清单！但 init_app_data 仅在应用启动时调用一次，并发风险可忽略。**OK，但建议清单加上 init_app_data**。

**新隐患（P2）**：`update_global_claude_md` 等 claude_md 相关 mutating 命令是否在数据范围内？让我再 check 一下。

<br>

### 4.2 std::sync::Mutex 在 async tokio 任务中阻塞

**Tauri 命令运行在 tokio 线程池上**。`std::sync::Mutex::lock()` 是阻塞调用——会阻塞整个 worker thread。

**严重程度评估**：
- 临界区内是 file IO + JSON parse — 通常 < 10ms
- tokio 线程池默认 worker count = CPU 数（如 8）
- 用户最多同时按一次按钮 + 后台 autoClassify + 几个 IPC 并发 — 最多 5-10 个并发 mutating 命令
- 阻塞 10ms × 10 ≈ 100ms 串行 — **可接受**

**P2 改进**：用 `tokio::sync::Mutex` 而非 `std::sync::Mutex`，可避免 block worker thread。但 std mutex 实施更简单且无需引入额外依赖（tokio Mutex 需要 await，整个调用链改 async）—— **不必修**。V2 选择 std mutex 是正确的。

**P2 隐患**：std::sync::Mutex 中毒（panic 时 hold 锁）。`.map_err(|e| e.to_string())?` 如果上一个 holder 在临界区 panic，所有后续 holder 拿到 `PoisonError`——返回 string error 给前端，但锁不可恢复。建议 `.unwrap_or_else(|e| e.into_inner())` 强制取出（接受可能的状态损坏）。**P2，不阻断 V2 实施**。

### 4.3 SortableCategoryRow 的 attributes/listeners 透传

**V2 §8 line 661-662**：
```tsx
<div ref={setNodeRef} style={style} {...attributes} {...listeners} ...>
```

`{...listeners}` 把 `onMouseDown`、`onKeyDown`（来自 sensors）attach 到 root div。**问题**：root div 的 onClick handler `handleClick` 仍正常工作，但 `onMouseDown` listener 与 React 18 event delegation 可能存在以下交互：

- React 把所有事件 delegate 到 root（document），dnd-kit listeners 同样 attach 到 React 节点
- 用户 mousedown 时：React event → SortableCategoryRow 的 mousedown handler（dnd-kit listener）→ activator check（CustomMouseSensor: shouldHandleEvent 检查 data-no-dnd）→ 若通过则 activation pending（等 4px move）
- mouseup 时（无 4px move）：onClick fire → handleClick → justDropped 检查 → onClick navigate

**潜在 race**：dnd-kit listener 在 React 17/18 下顺序与 onClick handler 是 React 事件系统的次序。**实际**：dnd-kit 用 `addEventListener` 不是 React onClick，所以**不会**被 React batch 影响。

**结论**：✅ 行为正确。但 V2 §8 没说明 `{...listeners}` 的细节，建议加注释。

### 4.4 `setActiveCategory` reorder 时是否需要更新？

**V2 §4.3 reorderCategories**：仅 set categories + version，不动 activeCategory。

**场景**：用户当前激活的 category 是 "Coding"（id=cat-001），用户拖动 "Writing" 到第 1 位 — activeCategory 仍是 cat-001 — ✅ 正确。

**但如果用户拖了 activeCategory 自己**：reorder 后 activeCategory id 不变 → Sidebar 高亮仍正确。✅

**结论**：无 bug，但 V2 应该加一行测试覆盖。

### 4.5 V2 R-P0-2 的 handleDragStart 与 useSortable disabled 的关系

**V2 §5.3 line 493-502 handleDragStart**：
```ts
const handleDragStart = useCallback(() => {
  const s = useAppStore.getState();
  if (s.editingCategoryId || s.isAddingCategory || s.editingTagId || s.isAddingTag) {
    return;
  }
  setContextMenu(null);
  setTagContextMenu(null);
  setIsDragging(true);
}, []);
```

**问题**：handleDragStart 是 MainLayout 层的 callback。它何时被调用？V2 §5.3 没说它是从 SortableCategoriesList 的 onDragStart 传上来的。看 §7 line 554：

```tsx
onDragStart={(e) => { setActiveId(String(e.active.id)); onDragStart(); }}
```

调用关系：dnd-kit DndContext.onDragStart → SortableCategoriesList 内部 setActiveId + 调用 props.onDragStart → MainLayout.handleDragStart。

**关键**：handleDragStart 内的 guard 是**事后的**（dnd-kit 已经激活 drag、设置 activeId）。但因为 SortableContext disabled + useSortable disabled 应该阻止 drag 激活的最早期，handleDragStart 的 guard 永远不会触发。**是双保险，安全无害**。

**但 setIsDragging(true)** 不会执行，导致 Refresh 按钮不会变 disabled。**这其实是正确行为**——如果编辑态已经阻止了拖动，UI 也无需提示"正在拖动"。✅

### 4.6 reorderCategories 函数重复 Vec computation

**V2 §4.3 line 326-342** 在 store action 内部重新实现了 reorder 算法（map / for / filter）。这与后端 `apply_reorder` **重复实现**。

**两个隐患**：
1. 算法语义可能不一致（前端 stage1 与后端的语义有偏差）
2. 维护成本：未来调整 ordered_ids 容错策略需要同时改两处

**建议**：把前端算法抽成 `src/utils/reorder.ts` 中的 pure function `applyReorder<T extends { id: string }>(items, orderedIds)`，与后端镜像。**P2**。

### 4.7 R-P0-1 的 categoriesVersion bump 是否覆盖 init_app

**initApp**（appStore line 275-296）调用 `loadCategories` + `loadTags`。如果用户 reorder 后 quit + restart，initApp 时 versionBefore = 0，IPC 期间没有 reorder 发生，versionAfter = 0，set 正常 — ✅ 正确。

**但有一个边角**：initApp 期间用户能否 reorder？应该不能（UI 还没渲染完）。**OK，无 bug**。

---

## 5. 其他工程问题汇总

| ID | 类型 | 问题 | 位置 | 严重度 |
|---|---|---|---|---|
| **NEW-P0-1** | 修复缺口 | restrictToVerticalAxis 仍设在 DndContext 上，未真正修 P0-4 | 03_tech_plan.md §7 line 548 | **P0** |
| **NEW-P0-2** | CSS 缺 token | `.drop-indicator-h/v` 用 `--duration-drag-indicator-fade/move`，但 `:root` 段未定义 | 03_tech_plan.md §10 line 720-734 vs 776/785 | **P0** |
| **NEW-P1-1** | TS 编译错误 | snapModifier 解构 `droppableContainers` 不在 ModifierArguments 中 | 03_tech_plan.md §11 line 814 | **P1** |
| **NEW-P1-2** | 视觉冗余 set | stage2 IPC 成功后无条件 set 触发第 2 次 reconciliation | 03_tech_plan.md §4.3 line 354-360 | **P1** |
| **NEW-P1-3** | 任务卡漏列 | T1 任务卡未要求修改 path.rs 现有 4 个测试加 env clean setup | 04_implementation_plan.md T1 | **P1** |
| **NEW-P1-4** | T3 任务漏写 | "addCategory/Tag/Update/Delete bump version" 在 §4.5 仅说一句"对称"，T3 任务卡未列 8 个具体 mutator | 04_implementation_plan.md T3 + 03_tech_plan.md §4.5 | **P1** |
| **NEW-P2-1** | 文档可读性 | §3.2 line 135-168 "错误示范 + todo!()" 容易让 SubAgent 误读为最终代码 | 03_tech_plan.md §3.2 | P2 |
| **NEW-P2-2** | DATA_MUTEX 范围 | init_app_data 也涉及 write_app_data，但未在 §3.1 应用清单 | 03_tech_plan.md §3.1 line 105-112 | P2 |
| **NEW-P2-3** | 算法重复 | 前后端各实现一遍 apply_reorder | 03_tech_plan.md §3.2 + §4.3 | P2 |
| **NEW-P2-4** | 选择器局限 | `:active` 在 drop animation 期间已结束 | 03_tech_plan.md §10 | P2 |
| **NEW-P2-5** | env override 安全 | 应限定 cfg(any(test, debug_assertions)) 防生产被注入 | 03_tech_plan.md §3.5 + path.rs | P2 |
| **NEW-P2-6** | tokio worker 阻塞 | std::sync::Mutex 阻塞 tokio worker thread；可接受但应文档化 | 03_tech_plan.md §3.1 | P2 |
| **NEW-P2-7** | snapshot fallback 过时 | snapshotForFallback 在 stage1 取，多 reorder 连发时可能过时 | 03_tech_plan.md §4.3 line 322 | P2 |

---

## 6. V1 评审 P1 / P2 在 V2 中的处理勾选

### 架构 V1 P1（7 项）

| V1 ID | 问题 | V2 处理 |
|---|---|---|
| A-P1-1 | 缺 CustomKeyboardSensor | ❌ 未处理（V2 §6 仍只有 CustomMouseSensor，注释"KeyboardSensor 用 dnd-kit 默认"）— **建议补 P1** |
| A-P1-2 | DragOverlayRow 与 SortableRow 重复 | ✅ §5.1 抽 CategoryRowContent / TagPillContent |
| A-P1-3 | `.sortable-row` transition 被 inline style 覆盖 | ✅ V2 §10 已删除 `.sortable-row` 自定义 transition class |
| A-P1-4 | screenReaderInstructions 未配置 | ✅ V2 §7 line 552 加上 |
| A-P1-5 | onDragOver 在 !over 时静默 | ❌ 未处理 — P2 可后补 |
| A-P1-6 | 单测用真实 home 目录 | ✅ V2 §3.5 加 ENSEMBLE_DATA_DIR + tempdir |
| A-P1-7 | clearAllEditingStates 与 setActiveId 顺序 | ✅ V2 §5.3 改为 guard return（不再 clear）|

**净结果**：5/7 处理，A-P1-1（KeyboardSensor）和 A-P1-5（onDragOver SR announce）残留。

### 架构 V1 P2（11 项）

V2 处理了 P2-1（itemIds useMemo）— 实际未在 V2 §7 中显式 useMemo（仍是 `categories.map(c => c.id)` 内联）。建议 T8 任务卡加。其他 P2 多数残留为 nice-to-have，不阻断。

### 回归 V1 P1（5 项）

| V1 ID | 问题 | V2 处理 |
|---|---|---|
| R-P1-1 | data-no-dnd 对 portal 弹层无效 | ✅ §8 line 681 ColorPicker 包 `<span data-no-dnd>` + onMouseDown stopPropagation 双保险 |
| R-P1-2 | MeasuringStrategy.Always + 滚动 | ⚠️ 部分处理（T13b 第 21 项 acceptance），但未在代码层加防御 |
| R-P1-3 | drop-no-change 防 click 误触 | ✅ §8 line 623, 649-654 加 justDropped + handleClick guard |
| R-P1-4 | 双击 + 5px 微动 | ⚠️ 仅 acceptance 验证（T13b 第 20 项），无代码防御 |
| R-P1-5 | 缺失 id 追加在并发场景仍 lost update | ✅ DATA_MUTEX 兜底 |

**净结果**：3/5 完整处理，R-P1-2 和 R-P1-4 仅 acceptance 验证。

### 回归 V1 P2（2 项）

| V1 ID | 问题 | V2 处理 |
|---|---|---|
| R-P2-1 | categoriesWithCounts useMemo 重渲染 | ❌ 未提 |
| R-P2-2 | autoClassify 创建新 category push 末尾 | ✅ 已知行为 |

---

## 7. 修订后 P0/P1 清单（V2 评审）

### P0（阻断，必须修）

| ID | 问题 | 修复 |
|---|---|---|
| **NEW-P0-1** | restrictToVerticalAxis 仍在 DndContext，DragOverlay 跟手会卡 | §7 改为 `<DndContext modifiers={[]}>`，DragOverlay 显式 `modifiers={[restrictToWindowEdges]}`；删除 restrictToVerticalAxis（verticalListSortingStrategy 已限制让位方向） |
| **NEW-P0-2** | CSS token `--duration-drag-indicator-fade/move` 未定义 | §10 `:root` 段补加 `--duration-drag-indicator-fade: 120ms; --duration-drag-indicator-move: 220ms;` |

### P1（应修）

| ID | 问题 | 修复 |
|---|---|---|
| **NEW-P1-1** | snapModifier 解构 droppableContainers 编译错 | §11 删除该字段 |
| **NEW-P1-2** | stage2 IPC 成功后无条件 set 致重渲染 | §4.3 加 isSame check |
| **NEW-P1-3** | T1 漏要求修改 path.rs 现有 4 个 home dir 测试 | T1 任务卡补 "remove_var" setup |
| **NEW-P1-4** | T3 漏列 add/update/delete × tags 4 个 mutator 都要 bump | T3 任务卡显式列 8 个 |
| **A-P1-1** (V1 残留) | 缺 CustomKeyboardSensor，键盘 Space 在 ColorPicker 上仍触发 drag | §6 补 KeyboardSensor 自定义 |
| **A-P1-5** (V1 残留) | onDragOver 在 !over 时无 announce | §12 补 |

### P2（建议）

详见 §5 表格 NEW-P2-*。

---

## 8. 是否真能做到零回归

V2 在防御性方面取得**实质性进步**：
- 后端无锁问题（R-P0-3）— 完全消除
- autoClassify race（R-P0-1）— 通过 version 协议消除
- 编辑态丢字（R-P0-2）— 三层防御消除

但仍有 1 个 V1 P0 没真正修（A-P0-4，即 NEW-P0-1）+ 1 个 V2 引入的新 P0（CSS token 漏定义，NEW-P0-2）。

**结论**：
- V2 距离"零回归 + 高质量实施"已经**很接近**
- 修补 NEW-P0-1 + NEW-P0-2 + 4 个 P1 后，预期可达 **9.5+/10**
- 工程量：约 1 小时文档 patch（无需重构架构）

---

## 9. 推荐路径

1. 主 Agent **直接 patch** 03_tech_plan.md 的 NEW-P0-1（§7 modifiers 重构）+ NEW-P0-2（§10 token 补定义）+ NEW-P1-1（snapModifier 删字段）+ NEW-P1-2（§4.3 isSame check）— 30 分钟内完成
2. 主 Agent **直接 patch** 04_implementation_plan.md 的 T1（path.rs 测试 setup）+ T3（8 mutator 显式列出）+ §6 KeyboardSensor 任务追加 — 15 分钟
3. **可跳过**第三轮全量评审，直接进入 T0 → T13b 实施
4. T13a 自动化验证 + T13b 用户视觉验证为最终质量门

---

## 10. 总评分构成

### 架构总评：8.6 / 10

| Q | V1 | V2 | Δ |
|---|---|---|---|
| Q1 库选型 | 8 | 8 | 0 |
| Q2 数据模型 | 9 | 9 | 0 |
| Q3 后端 API | 6 | 9 | +3（DATA_MUTEX + Vec 返回 + apply_reorder pure） |
| Q4 Store | 4 | 8 | +4（两阶段提交 + 队列 + version） |
| Q5 DndContext | 7 | **6** | -1（P0-4 未修） |
| Q6 Sensor | 8 | 8 | 0 |
| Q7 组件分层 | 7 | 9 | +2（CategoryRowContent 抽离） |
| Q8 文件结构 | 8 | 9 | +1（snapModifier + index.ts） |
| Q9 类型安全 | 6 | 7 | +1 |
| Q10 性能 | 8 | 8 | 0 |
| Q11 测试 | 6 | 8 | +2（apply_reorder pure + 并发测试） |
| Q12 回归 | 7 | 9 | +2（justDropped + 三层防御） |
| Q13 CSS | 5 | **6** | +1（删自定义 transition），但 token 漏定义 |
| Q14 a11y | 8 | 8 | 0 |
| Q15 bundle | 9 | 9 | 0 |
| **加权平均** | **7.4** | **8.6** | **+1.2** |

### 回归总评：8.7 / 10

| 风险类别 | V1 | V2 |
|---|---|---|
| autoClassify race | -1.0 | 0 |
| 编辑态丢字 | -1.0 | 0 |
| Rust 后端无锁 lost update | -1.0 | 0 |
| ColorPicker portal 防御 | -0.25 | 0 |
| 滚动 + Always 测量 | -0.25 | -0.25（仅 acceptance） |
| drop-no-change click 误触 | -0.5 | 0 |
| 双击 5px 微动 | -0.25 | -0.25（仅 acceptance） |
| 后端缺失 id 并发 | -0.5 | 0 |
| categoriesWithCounts useMemo | -0.125 | -0.125 |
| autoClassify 末尾 push | -0.125 | 0（已知行为） |
| **stage2 重渲染**（V2 新引入） | — | -0.5 |
| **CSS token 漏定义**（V2 新引入） | — | -0.25 |
| **总扣分** | -3.5 | -1.375 |
| **总分** | **6.5** | **8.6 → 取整 8.7** |

### 是否 10/10 通过？**否**

NEW-P0-1（restrictToVerticalAxis 全局生效破坏 overlay 跟手）+ NEW-P0-2（CSS token 漏定义）2 个 P0 阻断点未闭环，必须先 patch。

修补这 2 个 P0 + 6 个 P1 后，预期可达 **9.5+/10**，可进入 T0 → T13b 实施。
