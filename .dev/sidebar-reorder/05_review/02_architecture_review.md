# Sidebar Reorder — Architecture Review

> **评审对象**：`/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/sidebar-reorder/03_tech_plan.md`
> **评审基线**：Sidebar.tsx / MainLayout.tsx / appStore.ts / data.rs / types.rs / lib.rs / package.json 现状
> **评审者角色**：React 18 + TypeScript + Tauri 资深前端架构师（dnd-kit / Zustand / 性能优化 / 类型安全）
> **评审日期**：2026-05-03
> **评审标准**：1-10 分；阻断性问题（P0）必须有代码层面具体反例；改进建议必须给出"具体改动到哪一行 / 哪个函数"。

---

## 0. 总评

| 项 | 分数 | 一句话 |
|---|---|---|
| **架构总分** | **7.4 / 10** | 主干扎实（库选型与数据模型决策正确），但有 5 处 P0 必须修，否则在生产环境会出现"看不见"的失败模式。 |
| 是否可以"零修订"进入实施 | **否** | P0 至少 5 条；P1 至少 6 条；P2 数条。 |
| 是否需要重写 03_tech_plan.md | **否** | 主结构无需推翻；定向 patch 即可。 |
| 是否安全实施 | 修完 P0 后**安全** | 现状会引入"乐观更新与后端不一致"等隐蔽 bug。 |

---

## 1. P0 阻断性问题清单（必须修，附代码层面具体反例）

### P0-1. 串行队列 `then(task, task)` 模式存在 snapshot 污染（数据正确性）

**规划位置**：`03_tech_plan.md` §4.1（实现）+ §4.2（队列）

**反例**：

`reorderCategories` 体内：
```ts
const snapshot = get().categories;   // (a) 读 snapshot
const reordered = ...;
set({ categories: reordered });      // (b) 乐观写
try {
  await safeInvoke('reorder_categories', { orderedIds });
} catch (e) {
  set({ categories: snapshot, error: ... });  // (c) 回滚
}
```

队列：
```ts
let reorderQueue = Promise.resolve();
const enqueueReorder = (task) => {
  reorderQueue = reorderQueue.then(task, task);
  return reorderQueue;
};
```

**问题**：`enqueueReorder(task)` 把整个 task（含 (a)(b)(c)）排队执行，但 `reorderCategories` 函数体的代码 **并没有被包成 task** —— `03_tech_plan.md` §4.1 的代码片段里完全没出现 `enqueueReorder`，§4.2 仅说"`reorderCategories` 和 `reorderTags` 的 `safeInvoke` 调用包在 `enqueueReorder` 内"。如果只把 `safeInvoke` 包进去（而不是把 (a)(b)(c) 整体包），会得到致命的双连发场景：

```
T0  drag 1 完成 → reorderCategories(["A","B","C"])
       snapshot1 = ["B","A","C"]   // 当前真实
       set({ categories: ["A","B","C"] })   // 乐观
       enqueueReorder(() => safeInvoke(...))   // 等 q 排空后发
T1  drag 2 完成 → reorderCategories(["A","C","B"])
       snapshot2 = ["A","B","C"]   // ← (b1) 乐观留下的污染
       set({ categories: ["A","C","B"] })
       enqueueReorder(() => safeInvoke(...))
T2  IPC1 fail
       set({ categories: snapshot1 })   // 回滚到 ["B","A","C"]
T3  IPC2 succeed
       UI 仍是 ["B","A","C"]，但后端是 ["A","C","B"]   // 撕裂
```

**根因**：snapshot 应当是"队列中**当前 task 即将提交的前一个状态**"，但代码取的是"调用时的 React state"。React state 已被前一个 task 的乐观更新污染。

**修复**：把 (a)(b)(c) 整体包进 task，**且 snapshot 在 task 内部 `get()`**：

```ts
reorderCategories: (orderedIds) => enqueueReorder(async () => {
  const snapshot = get().categories;  // ← 队列内部读，不会被污染
  const reordered = computeReorder(snapshot, orderedIds);
  set({ categories: reordered });
  try {
    await safeInvoke('reorder_categories', { orderedIds });
  } catch (e) {
    set({ categories: snapshot, error: String(e) });
    throw e;
  }
}),
```

但**这又引入新问题**：第二次 drag 在第一次 IPC 完成前发生时，第二次 drag 的视觉响应会被队列阻塞 200ms+。正确做法是：**乐观更新立即发生（非排队），仅 IPC + 回滚走串行队列**。这需要架构调整为"两阶段提交"，参见 P0-2。

---

### P0-2. 乐观更新立即生效与"队列阻塞"矛盾（用户体验）

**规划位置**：`03_tech_plan.md` §4

按 P0-1 修复后会出现：

- 用户连续拖两次（每次 drop 即时生效），第二次 drop 后 UI 等 200-500ms 才动 —— 因为 `set` 在排队的 task 内。

**修复**：拆分为同步 set（立即生效）+ 异步 IPC（队列）+ 回滚阶段（"回到任一中间态"语义）：

```ts
reorderCategories: (orderedIds) => {
  const snapshot = get().categories;
  const reordered = computeReorder(snapshot, orderedIds);
  set({ categories: reordered });   // 立即生效，非排队

  return enqueueReorder(async () => {
    try {
      await safeInvoke('reorder_categories', { orderedIds });
    } catch (e) {
      // 失败回滚需谨慎：不能回到 snapshot（snapshot 可能已过时），
      // 应该读取当前后端真实顺序后重写
      try {
        const real = await safeInvoke<Category[]>('get_categories');
        if (real) set({ categories: real });
      } catch { set({ categories: snapshot, error: String(e) }); }
    }
  });
},
```

或者更彻底：**让后端 `reorder_categories` 返回 `Vec<Category>`**（参见 P0-5），前端用返回值校准，免去 GET 重试。

---

### P0-3. CSS `.drag-overlay-row` 用 `cursor: grabbing` 但与 `02_design_spec.md §2.7` 行内规范冲突

**规划位置**：`03_tech_plan.md` §10 CSS 增量

`.drag-overlay-row { cursor: grabbing; }` 是**元素自身**的 cursor。设计 spec §2.7 明确：

| 状态 | Cursor |
|---|---|
| Hover 在可拖项 | **`default`**（不切 grab，符合 macOS 气质） |

但 dnd-kit 默认 `attributes` 会自动设置 `cursor: grab` 到 sortable 元素的 hover 态（v6 中 `attributes['data-cursor']` / 内部样式）。**这就是规划与设计的隐式冲突**：

- 设计要求 hover 不显示 grab cursor；
- 规划没有显式覆盖 dnd-kit 默认行为；
- 仅 `.drag-overlay-row` 上覆盖 grabbing 不解决"hover 出现 grab"。

**修复**：在 §10 CSS 中追加：

```css
/* 抑制 dnd-kit 默认 attributes 注入的 grab cursor，对齐 macOS 风格 */
[data-sortable-list] [aria-roledescription='sortable'] {
  cursor: default;
}
[data-sortable-list] [aria-roledescription='sortable']:active {
  cursor: grabbing;
}
```

或在 `useSortable` 调用处 destructure `{ ...attributesNoCursor }` 并人工设置——但 dnd-kit 的 attributes 是 readonly 数组，无法 spread 后 omit。CSS 覆盖更可靠。

---

### P0-4. `restrictToVerticalAxis` 与 `<DragOverlay>` 同时使用会破坏 overlay 跟手（行为正确性）

**规划位置**：`03_tech_plan.md` §7（Categories DndContext 配置）

```tsx
modifiers={[restrictToVerticalAxis, restrictToParentElement]}
```

dnd-kit `modifiers` 是**全局**应用到 transform 的 —— 既影响 sortable item 的让位 transform，也**影响 DragOverlay 的位置**。`restrictToVerticalAxis` 把 transform.x 强制为 0，导致 **DragOverlay 在水平方向不跟手**：用户鼠标横向移到 `Skills` 列表区域，overlay 仍卡在 sidebar 内的原始 X。

**反例**：dnd-kit Issue #1287 / #797 都报告了这个问题。`restrictToVerticalAxis` 常见用法是**只**应用到 sortable items，不应用到 overlay；正确分离方法见 dnd-kit 文档"Modifiers > Customize per overlay"——使用 `<DragOverlay modifiers={[]}>` 显式覆盖：

**修复**：

```tsx
<DndContext
  // 不在 DndContext 上设 modifiers
  ...
>
  <SortableContext ...>...</SortableContext>
  <DragOverlay
    modifiers={[restrictToWindowEdges]}   // overlay 仅限窗口内
    dropAnimation={CATEGORY_DROP_ANIMATION}
  >
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

而 sortable items 自己用 `transform: translateY(...)` （dnd-kit 内部已经按 vertical strategy 限制了让位的方向，无需 `restrictToVerticalAxis` modifier）。

或者：保留 modifier，但通过 `useDraggable`/`useSortable` 传入特定的 modifier，而不是放到 DndContext。后者的 cleaner 方案是上述方法。

---

### P0-5. 后端 `reorder_categories` 返回 `()` 而不是 `Vec<Category>`（前后端一致性）

**规划位置**：`03_tech_plan.md` §3.1 + §3.2

```rust
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<(), String>
```

**问题**：

1. 容错语义（"未知 id 跳过；缺失 id 追加"）让后端实际写入的顺序**可能与前端发送的 `orderedIds` 不同**。前端只能"祈祷"自己的乐观状态等于后端真相。
2. 失败回滚（P0-2）后，前端必须再调一次 `get_categories` 才能拿到真相 —— 多一次 IPC、多一个 race window。
3. 单元测试断言"persist 后的顺序"也需要二次 read。

**修复**：返回新 `Vec<Category>`，前端用之校准。零 IPC 增加，零额外 race。

```rust
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<Vec<Category>, String> {
    let mut data = read_app_data()?;
    let mut by_id: HashMap<String, Category> =
        std::mem::take(&mut data.categories).into_iter().map(|c| (c.id.clone(), c)).collect();
    let mut new_order: Vec<Category> = Vec::with_capacity(by_id.len() + orderedIds.len());
    let mut seen = std::collections::HashSet::new();
    for id in orderedIds {
        if seen.insert(id.clone()) {
            if let Some(c) = by_id.remove(&id) { new_order.push(c); }
        }
    }
    let leftover: Vec<_> = by_id.into_values().collect();
    new_order.extend(leftover);
    data.categories = new_order.clone();
    write_app_data(data)?;
    Ok(new_order)
}
```

注意上文同时修复了规划 §3.1 中的另一个**语义 bug**：原代码用 `for (_id, c) in by_id { new_order.push(c); }` —— `HashMap` **迭代顺序无定义**，"按原序追加"不成立；必须先在 take 之前留 `original_order: Vec<String>` 或用 `IndexMap`。

---

## 2. 维度评分（每项 1-10）

### Q1. 库选型论证（dnd-kit v6 vs `@dnd-kit/react` v0.4）

**分数：8 / 10**

**优点**：
- 选 v6 是正确的（v0.4 仍在 0.x、生态薄、文档不全、稳定性未经大规模生产验证）。
- `01_library_comparison.md` 中已对 8 个库进行扎实对比，结论充分。

**扣分点**：
- `03_tech_plan.md §1` **完全没提**到"v0.4 实验性 rewrite 存在"这个事实。维护者团队 2025-04 的发布说明里把 `@dnd-kit/react` 标为"Stable release"，未来读者可能误判应该选 v0.4。
- 应在 §1 加一段：

  > **不选 `@dnd-kit/react@0.4.x`**：尽管它是同一作者的下一代 rewrite（API 完全不同，hook-based + headless），截至 2026-05-03 仍处 0.x、bundle 与 SSR 行为未稳定、文档缺少 sortable 的完整示例、第三方生产案例稀少。v6 是当前 14M+ 周下载的事实标准（Sentry/Doist/Mintlify/Puck 在用），未来 v7 GA 后再迁移成本可控（`useSortable`/`<DragOverlay>` API 重写工作量约 1 天）。

**结论**：选 v6 决策正确，但论证需要把"为什么不选 v0.4"明示出来，否则未来 6 个月内会被人重提。

---

### Q2. 数据模型设计（不引入 sort_order，用 Vec 顺序）

**分数：9 / 10**

**优点**：
- 决策正确。Vec 顺序 = 自然排序载体，零 schema 变更，零迁移，原子性好。
- `Vec` 序列化即数组顺序，serde JSON 输出与输入一致。
- 与现有 `add_category`（push 末尾）、`delete_category`（retain）行为一致。

**轻微疑虑**：
- "多 device sync 场景下是否会破坏" —— 项目目前**没有云同步**（`00_understanding.md §7` 明确"跨设备 sync 不在范围"），不构成 P0/P1。但应在规划中**明示**：
  > 未来若引入云同步：每次 reorder 是整 Vec 替换，可使用 LWW（Last-Write-Wins）策略；如需 CRDT 级别合并，再升级为带显式 `sort_order: f64` 的 fractional indexing（如 LexoRank）。当前不做。

**修复建议**：在 §2 加一句"未来云同步路径"的脚注，避免半年后被人推翻。

---

### Q3. 后端 API 设计（reorder_categories 容错策略）

**分数：6 / 10**

**问题**：

1. **§3.1 容错策略与 strict 模式无切换**——"未知 id 跳过、缺失 id 追加"听起来"善良"，但对前端意味着"我永远不知道后端做了什么"。结合 P0-5（不返回新 Vec），整个流程的 observability 是 0。
2. **§3.1 用 `for (_id, c) in by_id { ... }` 把剩余项追加**——HashMap 迭代顺序在 Rust 中无保证（`std::collections::HashMap` 用 SipHash + 随机 seed，输出顺序在每次进程启动时随机）。"按原序追加"承诺不成立。已在 P0-5 给出修复方案。
3. **没有"strict 模式"**——单元测试发现"orderedIds 缺少 id"时，测试是"silently 通过"还是"应当失败"？建议：

   ```rust
   pub fn reorder_categories(
       orderedIds: Vec<String>,
       strict: Option<bool>   // strict=true 时缺失/未知 id 都报错
   ) -> Result<Vec<Category>, String>
   ```

   前端默认 `strict: false`（拖拽场景容错），单元测试调用 `strict: true` 时验证语义严格。

4. **HashMap 的 `clone` 开销** —— 9-10 个 Category 完全可忽略，不算扣分项。

**修复**：

- §3.1 改为返回 `Result<Vec<Category>, String>`（P0-5）。
- 算法用 `IndexMap` 或先取 `original_order: Vec<String>` 维持稳定性。
- 加 `strict` 可选参数（不破坏向后兼容）。
- 单元测试覆盖随机 HashMap 迭代序的稳定性（用 5 次 randomized 测试 verify "leftover order = original Vec order"）。

---

### Q4. 前端 Store 设计（乐观更新 + 失败回滚 + 串行队列）

**分数：4 / 10**

P0-1 与 P0-2 都在这一项，故评分较低。

**问题**：

1. **snapshot 污染**（P0-1）—— 致命。
2. **乐观更新与队列阻塞矛盾**（P0-2）—— 致命。
3. **`then(task, task)` 模式正确**（fail-then-continue），但**模式注释缺失**——下一个 maintainer 看到 `.then(task, task)` 不一定理解为什么用相同的 onResolve / onReject。需注释：

   ```ts
   // .then(task, task) 而非 .then(task).catch(task) 的原因：
   // 即使前一个 reorder 失败（reject），队列必须继续执行下一个，
   // 否则一次 IPC 失败会让所有后续 reorder 永远不发。
   ```

4. **`Promise.allSettled` 不适用** —— 不是同时发，是顺序发。所以原方案选 `then(task, task)` 是对的。
5. **`isAddingCategory` / `editingCategoryId` 没有"在 reorder 完成前禁止编辑/新增"的隔离**——边角场景：drag end → 乐观更新 → 后台 IPC 还没返回 → 用户立刻按"+"新增 category。新 category 由 `add_category` push 到 Vec 末尾（按当前后端真相），而前端乐观状态可能不一致。`enqueueReorder` 同时也应序列化 `addCategory` / `deleteCategory` —— 至少在 P1 范围内考虑。

**修复**：

- 按 P0-1 + P0-2 重构。
- 加注释。
- P1：把 add/delete/update 也走同一个队列（"data write serialization queue"），名字改为 `dataMutationQueue`。

---

### Q5. DndContext 配置（collisionDetection / measuring / modifiers）

**分数：7 / 10**

**优点**：
- `collisionDetection={closestCenter}` —— Categories（1D）与 Tags（wrap）都正确，且与 `01_research/03_wrap_drag.md §2.2` 论证一致。
- `MeasuringStrategy.Always` —— 正确。`MainLayout.tsx:86-103` 的 useMemo 在 reorder 时会重算（`categories` array reference 变），item rect 必须重新测。
- `verticalListSortingStrategy` for Categories、`rectSortingStrategy` for Tags —— 与 `01_research/03_wrap_drag.md §2.1` 一致。

**扣分点**：

1. **P0-4**：`restrictToVerticalAxis` 同时绑到 sortable + overlay 会破坏 overlay 跟手。
2. **Tags 的 modifier 选择缺论证** —— §7 末尾说"移除 `restrictToVerticalAxis` modifier"；规划没说 Tags **要不要** `restrictToParentElement`。问题里也明确质疑了"为什么 Tags 不用 restrictToParentElement"。**正确答案**：Tags 容器宽 ~232px（260-28padding），高度变化大；`restrictToParentElement` 会在 Tags 拖到容器边缘外（如拖到 Categories 区上方）时**阻断 overlay 跟随**——但用户期望此时是 cancel + snap-back 而不是"被卡住"。所以**Tags 不用 `restrictToParentElement` 是正确的**，但理由没写。建议：

   > Tags 容器尺寸小且 wrap 行数会变；用户拖到容器外释放应触发"取消 + snap-back"语义而非"被卡边缘"。改用 `<DragOverlay modifiers={[restrictToWindowEdges]}>` 仅限制 overlay 不出窗口。

3. **`autoScroll` 默认为 true** —— Sidebar `overflow-y-auto sidebar-scroll min-h-0`（Sidebar.tsx:272）会触发 dnd-kit 的 auto-scroll；但 Categories 9 项 + Tags 10 项默认情况都不会触发滚动（容器高度足够）。展开 "Show more" 后才有滚动可能。规划没明确 autoScroll 行为；建议：

   ```tsx
   <DndContext
     autoScroll={{
       enabled: true,
       acceleration: 5,
       interval: 5,
       threshold: { x: 0, y: 0.15 },  // 仅 y 方向，15% 边缘触发
     }}
   ```

   或者直接禁掉（项目 sidebar 数据量小）：`autoScroll={false}`。

---

### Q6. CustomMouseSensor 实现

**分数：8 / 10**

**优点**：
- §6 的实现与 `01_research/04_a11y_edges.md §2.4` 验证过的 Stack Overflow 78659136 标准实现一致。
- `dataset.noDnd === 'true'` 严格字符串比较（dataset 取出的总是 string）。
- `closest`-style while-loop 遍历向上至 root，无 early-return 漏洞。

**扣分点**：

1. **没有 CustomKeyboardSensor** —— `01_research/04_a11y_edges.md §2` 给出的标准方案是 **MouseSensor + KeyboardSensor 都自定义**。键盘 Space/Enter 在 `data-no-dnd` 元素上不该激活 drag，否则用户 Tab 到 ColorPicker 圆点按 Space 打开颜色面板时会被拖动激活拦截。规划只 wrap 了 MouseSensor。**修复**：

   ```ts
   export class CustomKeyboardSensor extends LibKeyboardSensor {
     static activators = [{
       eventName: 'onKeyDown' as const,
       handler: ({ nativeEvent: e }: ReactKeyboardEvent<Element>, { keyboardCodes }) => {
         if (!keyboardCodes.start.includes(e.code)) return false;
         return shouldHandleEvent(e.target as HTMLElement);
       },
     }];
   }
   ```

2. **不存在"dnd-kit 内部 sensor 冒泡"问题** —— 因为 sensors 是激活式（activator），而不是事件监听栈。同一 PointerEvent 会问每个 activator "你要不要接管"，"取消"等价于 `return false`。多个 sensor 不会形成"冒泡链"。规划无 bug，问题里担心的"内部 sensor 冒泡"不存在。

3. **没有 TouchSensor** —— macOS 桌面虽然不需要，但 `01_research/04_a11y_edges.md §2.1` 也提到"未来扩展"。可在 §6 末尾加一句"目前不实现 CustomTouchSensor，未来 iPad 或多触控板手势支持时再添加"。

---

### Q7. 组件分层（SortableCategoriesList / SortableCategoryRow / DragOverlayCategoryRow）

**分数：7 / 10**

**优点**：
- 三层拆分合理：List 管 DndContext + SortableContext + 状态、Row 管 useSortable + 业务行为、DragOverlayRow 管纯展示。
- 单一职责，可测试性高。

**扣分点**：

1. **DragOverlayCategoryRow 与 SortableCategoryRow 重复 60% JSX** —— ColorDot + name + count 一致，仅最外层 className 不同。规划应**显式**抽出基础展示组件（`CategoryRowVisual`）以避免设计 spec 调整时两处不同步。建议：

   ```tsx
   // CategoryRowVisual.tsx — pure presentational
   export function CategoryRowVisual({ category, variant: 'normal' | 'overlay', ...rest }) { ... }

   // SortableCategoryRow.tsx
   <CategoryRowVisual category={category} variant="normal" {...sortableProps} />

   // DragOverlayCategoryRow.tsx
   <CategoryRowVisual category={category} variant="overlay" />
   ```

2. **List 组件接收 `setShowAllCategories` prop 实现"自动展开"是泄露细节** —— 折叠 state 应该被提升为"sidebar-state context"（或 useSidebarStore），让 List 调 setter 时不暴露给上层。但 Sidebar 当前没有内部 context，只能 props drilling。可接受，但加 TODO：

   > 如未来 Sidebar 内部状态进一步增多，考虑提取 `useSidebarSection` hook 集中管理 collapse / dragging / editing 互斥。

3. **未提"List 组件是否应接收 `categories: Category[]` 还是 `visibleCategories + showAll`"** —— `04_implementation_plan.md T10` 提到两种方案，让 SubAgent 自选。这是**规划应在 03_tech_plan.md 里就锁定的**：建议传完整 `categories: Category[]`，由 List 内部维护 `showAll: boolean`（initial 由 props 给）—— 单一数据源，避免拖拽时父子状态撕裂。

---

### Q8. 文件结构（sidebar/dnd/ 子目录 + 命名）

**分数：8 / 10**

**优点**：
- `sidebar/dnd/` 子目录隔离 dnd 专用底层 utility 合理。
- `CustomMouseSensor.ts` / `animations.ts` / `announcements.ts` / `DropIndicator.tsx` 命名清晰。
- `SortableCategoriesList` / `SortableCategoryRow` 等组件名遵守 PascalCase，与项目惯例（CategoryInlineInput / TagInlineInput / Sidebar）一致。

**扣分点**：

1. **§5.1 末尾 `dnd/` 子目录的 4 个文件**（`CustomMouseSensor.ts` / `animations.ts` / `announcements.ts` / `DropIndicator.tsx`）—— 其中 `DropIndicator.tsx` 是 React 组件、其余是纯模块。建议混用更清晰：把 sensor 放 `sidebar/dnd/sensors/`，animation 常量留 `sidebar/dnd/`。**或者更简单**：直接放 `src/components/sidebar/` 下，子目录 `dnd/` 没有规模需要（4 个文件而已）。

2. **`CustomMouseSensor.ts`/`animations.ts`/`announcements.ts` 是 **camelCase** 文件名，违反"项目 PascalCase 文件名"惯例**——但**仅对 component 文件，util 文件项目内本就 camelCase**（参见 `src/utils/tauri.ts`、`src/stores/appStore.ts`）。所以规划没违规。

3. **`index.ts` 桶导出未提及** —— `src/components/sidebar/index.ts` 已存在；新增组件应该被加到桶中，规划没说，会让消费方（Sidebar.tsx）写一堆 `import { X } from '@/components/sidebar/X'`。建议补一行：
   > 新增组件追加到 `src/components/sidebar/index.ts` 桶导出。

---

### Q9. 类型安全

**分数：6 / 10**

**问题**：

1. **`makeAnnouncements(items)` 的 `items` 类型** —— §11 用 `{ id: string; name: string }[]`，是松散结构。Categories 与 Tags 都满足这个 shape，但失去了类型语义。建议：

   ```ts
   export function makeAnnouncements<T extends { id: string; name: string }>(
     items: T[],
     label: 'category' | 'tag'
   ): Announcements
   ```

2. **`reorderCategories(orderedIds: string[])` 缺乏 branded type** —— 与 `addCategory(name: string, color: string)` 同样，前端调用时容易把 categoryId 与 categoryName 弄反。可加：

   ```ts
   type CategoryId = string & { readonly __brand: 'CategoryId' };
   type TagId = string & { readonly __brand: 'TagId' };
   ```

   不强制，P2。

3. **§4.1 实现：`activeId: string | null` + `activeCategory = categories.find(c => c.id === activeId)`**——`active.id` 在 dnd-kit 类型上是 `UniqueIdentifier`（`string | number`）。`String(e.active.id)` 强转会丢失数字 id 场景，但本项目 id 都是 UUID（string），不构成 bug。建议在 `useState` 直接用：

   ```ts
   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
   ```

   导入：`import type { UniqueIdentifier } from '@dnd-kit/core';`

4. **§7 `e.over!.id`** —— 用了 non-null assertion `!`。在 `e.over && e.active.id !== e.over.id` 已 narrow，但 TS 在 `findIndex` callback 内可能丢失 narrowing（取决于 TS 版本）。建议：

   ```ts
   const overId = e.over.id;   // 读出，let TS narrow once
   const newIdx = categories.findIndex(c => c.id === overId);
   ```

5. **`safeInvoke<Category[]>('get_categories')`** 返回 `Category[] | null`（utils/tauri.ts:23）。规划 §4.1 没处理 `null` —— `safeInvoke` 在非 Tauri 环境返回 null（已被 `if (!isTauri()) return;` 提前 return），所以分支安全。但代码 reviewer 看到 `await safeInvoke<...>(...)` 后直接 `set(...)` 会触发 TS strict null check。需要：

   ```ts
   const updated = await safeInvoke<Category[]>('reorder_categories', { orderedIds });
   if (updated) set({ categories: updated });
   ```

   建议规划 §4.1 把 null 分支显式标出。

---

### Q10. 性能预算

**分数：8 / 10**

**优点**：
- `categoriesWithCounts` useMemo 重算开销 O(n)，n=9，可忽略。
- `MeasuringStrategy.Always` 测量开销 O(n)，9-19 项均可控。
- 9 个 categories + 10 个 tags 完全够用 `verticalListSortingStrategy` / `rectSortingStrategy`，无需虚拟化。

**扣分点**：

1. **§13 表格未提"onMove pointermove 频率"** —— dnd-kit 的 `onDragMove` 是每帧 RAF 调用，不是 pointermove 直接 throttle。9 个 sortable items 的每帧 transform 计算约 0.1ms，远低于 16ms budget。但应在表格中加一行：

   | onDragMove RAF 频率 | 60fps（每 16ms 调一次）| dnd-kit 内部 RAF，无需手动 throttle |

2. **未提 `categoriesWithCounts` 的 referential stability** —— `MainLayout.tsx:86-103`：

   ```ts
   const categoriesWithCounts = useMemo(() => {
     return categories.map(cat => ({ ...cat, count: ... }));
   }, [categories, skills, mcpServers, claudeMdFiles]);
   ```

   每次 `skills` / `mcpServers` / `claudeMdFiles` 变化都会**重新生成数组（新 reference）**，导致 Sidebar 重渲染、`<SortableCategoriesList categories={...}>` 接到新 reference、SortableContext items array 变 → dnd-kit 可能误以为列表变了重测。规划应加：

   > Sidebar 接收 `categoriesWithCounts` 后，仅把 `id` 提取为 `useMemo(() => categories.map(c => c.id), [categories])` 传给 SortableContext.items（dnd-kit 内部对 items array 做 shallow compare，但 referential equality 更稳）。

3. **bundle 实际数字** —— "~20 KB" 是 §1 与 §13 的引用，但来源是 `01_library_comparison.md`（min+gzip from bundlephobia for `core/sortable/utilities/modifiers`），未单独验证当前版本组合的实际数字。可接受。

---

### Q11. 测试策略

**分数：6 / 10**

**问题**：

1. **§12.2 jsdom 限制下能测什么 ≠ 应该测什么** —— 规划承认"jsdom 不支持 PointerEvent"，但未明确"应该用 MouseSensor 在测试中替换 PointerSensor"。`01_research/04_a11y_edges.md §10`（猜测）应有覆盖。规划应加：

   > 单元测试中：用 `MouseEvent` 触发 `mousedown` + `mousemove(deltaY=10)` + `mouseup` 模拟 drag。无法测 keyboard sensor 的 `sortableKeyboardCoordinates`（依赖 layout measurement，jsdom 无 layout）—— 这是设计选择：键盘 a11y 只在 `npm run tauri dev` 手动验证。

2. **回滚测试缺失场景**：
   - "drag1 success → drag2 fail" 时 drag1 数据被回滚到错误 snapshot（P0-1 反例）的测试。
   - 串行队列连发 3 次的顺序保证测试。
   - reduced motion 下 transition 字符串生成正确（不是 `0ms`）的测试 —— 这个 dnd-kit 自动处理。

3. **未提 `@testing-library/jest-dom` 的 `toHaveAttribute('data-no-dnd', 'true')` 断言** —— 规划只说"data-no-dnd 属性存在"，没给具体 RTL matcher。

4. **`jsdom` 模拟 `matchMedia`** —— 规划提到了，但 vitest 项目里通常需要在 `setupTests.ts` 里 mock。规划应链接到具体 setup 文件：

   ```ts
   // src/test-setup.ts
   Object.defineProperty(window, 'matchMedia', {
     writable: true,
     value: vi.fn().mockImplementation(query => ({
       matches: false,
       media: query,
       onchange: null,
       addListener: vi.fn(),
       removeListener: vi.fn(),
       addEventListener: vi.fn(),
       removeEventListener: vi.fn(),
       dispatchEvent: vi.fn(),
     })),
   });
   ```

---

### Q12. 回归风险（5 类已有手势冲突）

**分数：7 / 10**

**优点**：
- §5.2 修改 startDrag 加入 `target.closest('[data-sortable-list]')` —— 正确。
- ColorPicker 用 `data-no-dnd` —— 正确。
- 编辑/新增 input 用 `useSortable({ disabled: isEditing })` —— 正确。

**扣分点**：

1. **`data-no-dnd` 不是唯一防线** —— 还有：

   - **`distance: 4`**（4-5px 阈值）—— ColorPicker 圆点单击通常零位移，不会激活 drag，data-no-dnd 实际是双保险。
   - **`disabled`** —— 编辑态行级。
   - **`startDrag` 排除** —— 窗口拖动隔离。
   - **`stopPropagation`** —— ColorPicker 圆点 onClick。

2. **未覆盖 `<CategoryInlineInput>` "点击外部取消"与 dnd 拖拽的交互**：

   `CategoryInlineInput.tsx:36-44`：
   ```ts
   const handleClickOutside = (e: MouseEvent) => {
     if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
       onCancel();
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   ```

   用户在 Categories 区"新增态"时按住其他 row 拖动，会同时触发：
   - dnd-kit 的 mousedown sensor 启动 drag activation；
   - `handleClickOutside` 调用 `onCancel()` 关闭新增 input；
   - 但 input 关闭后 row 被 remove，dnd-kit 的 SortableContext items 被改 → 拖动 active 项不一致。

   修复：`MainLayout.handleDragStart` 已规划"clearAllEditingStates"，但顺序很关键：必须在 dnd-kit 初始化 active item 之前。建议：

   ```ts
   onDragStart={(e) => {
     // 1. 先清编辑态（同步 React state set）
     useAppStore.getState().clearAllEditingStates();
     // 2. 再设 activeId
     setActiveId(String(e.active.id));
     onDragStart();
   }}
   ```

3. **`onDragStart` 在 React 18 Concurrent 下** —— `useState` 的 setter 是 batched，可能在 dnd-kit 内部计算 active 矩形后才 commit。这通常没问题，但极端 case 下 `activeCategory = categories.find(...)` 可能短暂为 undefined 时 DragOverlay 渲染 null。建议 `<DragOverlay>` 内的 conditional rendering 已用 `activeCategory && <...>`，安全。

---

### Q13. CSS 集成（与 index.css 命名冲突 + Tailwind utility 优先）

**分数：5 / 10**

**问题**：

1. **`.sortable-row` / `.sortable-pill` / `.drag-overlay-row` / `.drag-overlay-pill` / `.drop-indicator-h` / `.drop-indicator-v` 都是新 BEM-ish 类名** —— 项目主要用 Tailwind utility（参见 Sidebar.tsx 几乎所有 className）。规划新增 6 个语义类违反"utility-first"惯例。

2. **`.sortable-row` 的 transition 与 dnd-kit 的 `useSortable.transition`（CSS string，by hook）重叠** —— `useSortable` 自动注入 inline `transition` style；CSS class 上的 transition 会被 inline style 覆盖（specificity）。规划 §10 的 `.sortable-row { transition: opacity ...; transform ...; }` 实际上**只对 opacity 生效**（transform 被 inline 覆盖）。

3. **`prefers-reduced-motion` 媒体查询** —— `.sortable-row { transition: none !important; }` 试图覆盖 inline style，但 `useSortable` 的 inline `transition` 也是 string；`!important` + class selector 优先级高于 inline 无 important。**但**：dnd-kit 内部已检测 `prefers-reduced-motion` 并返回 `transition: undefined`（v6.3 起），所以这段 CSS 是冗余的。规划应：

   - **删除**`.sortable-row` / `.sortable-pill` 自定义 transition class，依赖 `useSortable` 提供的 `transition` 字符串（参数化为 `220ms cubic-bezier(0.16, 1, 0.3, 1)` 通过 `useSortable({ transition: { duration: 220, easing: '...' } })`）。
   - 仅保留：`.drag-overlay-row`、`.drag-overlay-pill`（DragOverlay 用，无 dnd inline 冲突）、`.drop-indicator-h`、`.drop-indicator-v`、`@media (prefers-reduced-motion)` 块。
   - 全部改为 Tailwind utility（`tailwind.config` 里加自定义 `boxShadow.dragOverlayRow` 等）。

4. **冲突排查** —— `index.css` 现有 `.sidebar-scroll` / `.refresh-spinning` / `.refresh-click` / `.classify-success-bloom` 等。新增的 `.sortable-row` / `.drag-overlay-row` 等无字面冲突。但 `.drop-indicator-h` / `.drop-indicator-v` 太通用，未来可能被复用为其他场景的 indicator —— 加前缀 `.sidebar-drop-indicator-h` 更安全。

---

### Q14. a11y announcements

**分数：8 / 10**

**优点**：
- `makeAnnouncements` 输出"Picked up *name*. Position *N* of *M*"，符合 WAI-ARIA APG sortable 模式（"position *N* of *M*"是标准措辞）。
- `onDragStart` / `onDragOver` / `onDragEnd` / `onDragCancel` 四个生命周期都覆盖。

**扣分点**：

1. **`undefined` return for `onDragOver` when `!over`** —— dnd-kit 文档说 returning `undefined` means "no announcement"。这会导致鼠标拖到非 droppable 区域时 SR 静默 —— 用户感知不到"移到了无效区"。建议返回：

   ```ts
   onDragOver({ active, over }) {
     if (!over) return `${findName(active.id)} is over an invalid drop area.`;
     ...
   }
   ```

2. **`screenReaderInstructions` 未配置** —— dnd-kit 提供 `accessibility.screenReaderInstructions: { draggable: '...' }` 在 SR 用户首次 focus 到 sortable 时朗读"To pick up... press space..."。规划没提，加：

   ```ts
   accessibility={{
     announcements: makeAnnouncements(...),
     screenReaderInstructions: {
       draggable: 'To pick up a category, press space or enter. While dragging, use arrow keys to move. Press space again to drop. Press escape to cancel.',
     },
   }}
   ```

3. **`liveRegion`** —— dnd-kit v6 默认创建一个 `aria-live="assertive"` 的 portal `<div>`。规划没提，但默认行为正确，无需配置。

---

### Q15. bundle 影响（~20KB dnd-kit + ~0KB CSS）

**分数：9 / 10**

**优点**：
- 4 个包总和约 20KB（min+gzip）—— `01_library_comparison.md` 表格已验证。
- 项目已有 React 18 + Tailwind 4 + Zustand，dnd-kit 无重复 peer。
- CSS 增量 < 100 行 → gzip 后 < 1KB。

**扣分点**：

1. **`@dnd-kit/modifiers` 实际只用 `restrictToVerticalAxis` + `restrictToParentElement` + `restrictToWindowEdges`** —— modifiers 包是 ~1KB，整包导入无 tree-shaking 损失。OK。
2. **未提"bundle splitting"** —— Tauri 桌面应用不需要 lazy loading（启动时已下载）。OK。

---

## 3. 额外审视（规划是否漏掉了重要工程问题）

### 3.1 React StrictMode 双 mount

**项目 `src/main.tsx:7-9` 已启用 StrictMode**：

```tsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

dnd-kit Issue #775 报"multi-container scenarios in StrictMode dev"flicker。本项目是**单 DndContext**（Categories 和 Tags 两个独立 context，但每个都是单容器），不踩 #775。但**应在规划 §13.1（Risks）显式说明**。

### 3.2 Zustand selector 重渲染

**问题**：`MainLayout.tsx:36-65` 用 `const { categories, ... } = useAppStore()` 解构整个 store，**每次任何字段变化都会重渲染整个 MainLayout**。reorder 触发 `categories` 变化 → MainLayout 重渲染 → Sidebar 接到新 props → 整个 Sidebar 重渲染 → SortableCategoriesList 重渲染 → 9 个 SortableCategoryRow useSortable 全部重算 → 至少 27 个 React reconciliation。

虽然 9 个 row 可承受，但应在规划 §13 加：

> **未来扩展**：若 categories 数量超过 50，将 useAppStore 解构改为细粒度 selector：
> ```ts
> const categories = useAppStore(s => s.categories);
> const reorderCategories = useAppStore(s => s.reorderCategories);
> ```

### 3.3 useMemo 依赖 / key 稳定性

`SortableContext items={categories.map(c => c.id)}` —— 每次渲染都 `map` 出新数组。dnd-kit 内部对 items 做 shallow reference equality 检查，每次都判定"items 变了"重新订阅。对 9 项无感，但应该 useMemo：

```tsx
const itemIds = useMemo(() => categories.map(c => c.id), [categories]);
<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
```

规划没提，加为 P2。

### 3.4 ref forwarding

`SortableCategoryRow` 的 `setNodeRef` 直接绑到 `<div ref={setNodeRef}>`。但 ColorPicker 使用 `createPortal`（src/components/common/ColorPicker.tsx:1-2），portal 渲染到 body —— **DragOverlay 的"克隆"中如果包含 ColorPicker，ColorPicker portal 会渲染到 body 但脱离 DragOverlay z-index 上下文**。规划 §2.2（design spec）明确 DragOverlay 内**不**渲染 ColorPicker（只显示 ColorDot + 名字），所以无 bug。但应在规划 §8 实现要点里加一句：

> DragOverlayCategoryRow **不**复用 SortableCategoryRow 的完整 JSX（避免 ColorPicker portal 跨 DragOverlay 渲染问题）。仅渲染 ColorDot + 名字。

### 3.5 `useSortable({ disabled: isEditing })` 编辑态切换 hook 顺序

`useSortable` 是 hook，参数 `disabled` 变化是**props 变化，不影响 hook 执行顺序**。React 规则只禁止"条件性调用 hook"，不禁止"hook 参数变化"。规划无 bug，问题里"编辑态切换时是否会引发 hook 顺序变化"的担心**不成立**。但 `disabled: true → false` 切换时，dnd-kit 会重新订阅 droppable 节点，需要"isEditing 变化时 ref 仍稳定"——`useSortable` 的 `setNodeRef` callback 引用稳定（dnd-kit 内部 useCallback），无问题。

### 3.6 DragOverlay 在 React 18 Concurrent 下行为

DragOverlay 内部使用 `createPortal`（document.body）+ `useState`（active item position）。Concurrent rendering 下的 `useTransition` / `useDeferredValue` 不会被 dnd-kit 用，DragOverlay 总是在 `urgent` 优先级渲染。位置更新通过 `requestAnimationFrame`，不被 React schedule 影响。**安全**。

### 3.7 "Show X more" 折叠态自动展开后状态污染

规划 §2.9（design spec）："拖动期间保持展开 → Drop 完成后保持展开"。但用户**取消**拖动（Esc）后呢？设计 spec 没说。建议：

- 取消时**不自动折回**（保持"用户已展开"状态）—— 与 Drop 完成行为一致。
- 用户可手动折回。

规划 §13.3（折叠态自动展开）行为应在 04_implementation_plan.md T8 / T10 显式实现。

### 3.8 后端 `reorder_categories` 的 Tauri Command 参数名 case

`#[tauri::command]` 默认参数序列化为 snake_case；规划用 `#[allow(non_snake_case)] orderedIds` 保留 camelCase 与 `add_scene` 风格一致。但 `add_scene` 的参数（`skillIds`/`mcpIds`/`claudeMdIds`）是因为前端调用方传 camelCase；新增的 `reorder_categories` 也应传 camelCase（前端 store 用 `safeInvoke('reorder_categories', { orderedIds })`）。**一致**，OK。

### 3.9 单元测试 Rust 端：`init_app_data` 副作用

`reorder_categories` 内部调用 `read_app_data() / write_app_data(...)`，这两个函数读写 `~/.ensemble/data.json`（用户家目录）。单元测试 `cargo test` 在 CI 中可能污染开发者家目录，且并行测试有 race。规划 §3.4 单元测试应使用 **临时目录**：

```rust
#[cfg(test)]
mod reorder_tests {
    use super::*;
    use tempfile::TempDir;

    fn setup_temp_data_dir() -> TempDir {
        let temp = TempDir::new().unwrap();
        std::env::set_var("HOME", temp.path());  // 重定向 home
        temp
    }
    ...
}
```

但 `data::get_data_file_path()` 怎么解析 home —— 需检查 `utils.rs`。规划没提，加为 P1。

### 3.10 `@dnd-kit/modifiers` 版本

规划 §1 写 `@dnd-kit/modifiers ^9.0.0`，但 npm `@dnd-kit/modifiers@9.0.0` 是否存在需 verify（可能是 7.x 或 9.x）。`01_library_comparison.md` 表格只列了 core@6.3.1、sortable@10.0.0、utilities@3.2.2，**未列 modifiers 版本**。规划应在 §1 表格里补一行：

| `@dnd-kit/modifiers` | `^9.0.0`（或最新 stable，需 `npm view @dnd-kit/modifiers version` verify） |

否则 `npm install` 可能报版本不存在。

---

## 4. P 级问题汇总

### P0（阻断，必须修）

| ID | 问题 | 位置 | 影响 |
|---|---|---|---|
| P0-1 | snapshot 污染（队列模式不正确） | §4.1 + §4.2 | 数据撕裂，UI 与后端不一致 |
| P0-2 | 乐观更新与队列阻塞矛盾 | §4 | 用户体感卡顿 |
| P0-3 | hover cursor 与设计 spec §2.7 冲突 | §10 + 设计 spec §2.7 | 设计落地偏差 |
| P0-4 | restrictToVerticalAxis 同时作用于 sortable + overlay 破坏 overlay 跟手 | §7 | 视觉异常（overlay 卡在 sidebar 内） |
| P0-5 | 后端 `reorder_categories` 应返回 `Vec<Category>` 便于前端校准；HashMap 迭代序无定义 | §3.1 + §3.2 | 容错语义不可观察 + leftover 顺序不稳 |

### P1（应修）

| ID | 问题 | 位置 |
|---|---|---|
| P1-1 | 缺 CustomKeyboardSensor，键盘 Space 在 ColorPicker 上仍激活 drag | §6 |
| P1-2 | DragOverlayCategoryRow 与 SortableCategoryRow JSX 重复 60% | §5.1 / §8 |
| P1-3 | `.sortable-row` 自定义 transition 被 useSortable inline style 覆盖 | §10 |
| P1-4 | screenReaderInstructions 未配置 | §11 / §7 |
| P1-5 | onDragOver 在 `!over` 时静默无 announcement | §11 |
| P1-6 | 单元测试用真实 home 目录，CI 污染 + race | §3.4 / §12.1 |
| P1-7 | onDragStart 的 clearAllEditingStates 与 setActiveId 顺序未规范 | §7 / §11 |

### P2（建议）

| ID | 问题 | 位置 |
|---|---|---|
| P2-1 | 缺 `useMemo` itemIds（`categories.map(c => c.id)`） | §7 |
| P2-2 | Zustand 全量解构未用 selector | MainLayout.tsx 现状 + 规划缺指引 |
| P2-3 | `@dnd-kit/modifiers` 版本未 verify | §1 |
| P2-4 | branded type for CategoryId/TagId | §4 |
| P2-5 | Tailwind utility 优先 vs 自定义 BEM class | §10 |
| P2-6 | autoScroll 行为未明确 | §7 |
| P2-7 | 文档应补 v0.4 不选的理由 | §1 |
| P2-8 | 文档应补未来云同步策略 | §2 |
| P2-9 | 取消拖动后折叠态行为未明 | 设计 spec §2.6 |
| P2-10 | DragOverlay 不复用 SortableCategoryRow（避免 portal 问题） | §8 |
| P2-11 | strict 模式参数 | §3.1 |

---

## 5. 改进优先级建议

1. **本周必修**：P0-1, P0-2, P0-4, P0-5（数据正确性 + 视觉正确性）—— **暂缓 04_implementation_plan.md 启动**，先 patch 03_tech_plan.md。
2. **本周可推延**：P0-3（仅设计落地偏差，实施时手动覆盖也可 catch）—— 实施时由 design reviewer 把关。
3. **进入实施前补**：P1-1, P1-3, P1-6（影响 a11y + 测试可靠性）。
4. **实施中追加**：P2 全部（文档完善 + 性能优化）。

---

## 6. 修订后的关键代码片段（供 patch 用）

### 6.1 §3.1 Rust 后端（修复 P0-5 + 容错语义）

```rust
#[tauri::command]
#[allow(non_snake_case)]
pub fn reorder_categories(orderedIds: Vec<String>) -> Result<Vec<Category>, String> {
    let mut data = read_app_data()?;
    let original_order: Vec<String> = data.categories.iter().map(|c| c.id.clone()).collect();
    let mut by_id: std::collections::HashMap<String, Category> =
        std::mem::take(&mut data.categories).into_iter().map(|c| (c.id.clone(), c)).collect();

    let mut new_order: Vec<Category> = Vec::with_capacity(by_id.len() + orderedIds.len());
    let mut seen = std::collections::HashSet::new();
    for id in orderedIds {
        if !seen.insert(id.clone()) { continue; }
        if let Some(c) = by_id.remove(&id) { new_order.push(c); }
    }
    // 按原序追加 leftover（保证迭代序确定性）
    for id in original_order {
        if let Some(c) = by_id.remove(&id) { new_order.push(c); }
    }

    data.categories = new_order.clone();
    write_app_data(data)?;
    Ok(new_order)
}
```

`reorder_tags` 完全对称。

### 6.2 §4 Store action（修复 P0-1 + P0-2）

```ts
// 模块顶部
let reorderQueue: Promise<void> = Promise.resolve();
const enqueueReorder = (task: () => Promise<void>): Promise<void> => {
  // 即使前一个 reject，下一个也继续
  reorderQueue = reorderQueue.then(task, task);
  return reorderQueue;
};

reorderCategories: (orderedIds) => {
  if (!isTauri()) return Promise.resolve();

  // 1. 立即乐观更新（同步，不进队列，UI 即时响应）
  const snapshotBeforeOptimistic = get().categories;
  const byId = new Map(snapshotBeforeOptimistic.map(c => [c.id, c]));
  const reordered = [
    ...orderedIds.flatMap(id => byId.get(id) ? [byId.get(id)!] : []),
    ...snapshotBeforeOptimistic.filter(c => !orderedIds.includes(c.id)),
  ];
  set({ categories: reordered });

  // 2. IPC + 校准/回滚走串行队列
  return enqueueReorder(async () => {
    try {
      const updated = await safeInvoke<Category[]>('reorder_categories', { orderedIds });
      if (updated) set({ categories: updated });   // 用后端返回值校准
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      // 失败：再读后端真相（snapshot 可能已被后续 reorder 污染）
      try {
        const real = await safeInvoke<Category[]>('get_categories');
        if (real) set({ categories: real, error: String(error) });
      } catch {
        set({ categories: snapshotBeforeOptimistic, error: String(error) });
      }
    }
  });
},
```

### 6.3 §7 DndContext（修复 P0-4）

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
  accessibility={{
    announcements: makeAnnouncements(categories, 'category'),
    screenReaderInstructions: {
      draggable: 'To pick up a category, press space or enter. While dragging, use arrow keys to move. Press space again to drop. Press escape to cancel.',
    },
  }}
  onDragStart={(e) => {
    // 顺序：先清编辑态，再设 activeId
    useAppStore.getState().clearAllEditingStates();
    setActiveId(String(e.active.id));
    onDragStart();
  }}
  onDragEnd={(e) => { ... }}
  onDragCancel={() => setActiveId(null)}
>
  <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
    <div data-sortable-list className="flex flex-col gap-0.5">
      {categories.map(c => <SortableCategoryRow ... />)}
    </div>
  </SortableContext>
  {/* DragOverlay 不在 DndContext 上设 modifiers；改在 overlay 自身上 */}
  <DragOverlay
    modifiers={[restrictToWindowEdges]}
    dropAnimation={CATEGORY_DROP_ANIMATION}
  >
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

把 `restrictToVerticalAxis` 完全移除 —— `verticalListSortingStrategy` 已经在让位 transform 中只动 Y 轴；overlay 跟手用户期望是自由移动到取消区域。

### 6.4 §10 CSS（修复 P0-3 + P1-3）

```css
/* 抑制 dnd-kit 默认 attributes 注入的 grab cursor，对齐 macOS 风格 */
[data-sortable-list] [aria-roledescription='sortable'] {
  cursor: default;
}

/* DragOverlay shadow */
.drag-overlay-row {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  background: white;
  cursor: grabbing;
}
.drag-overlay-pill {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  cursor: grabbing;
}

/* Drop indicator (前缀 sidebar- 避免污染) */
.sidebar-drop-indicator-h {
  height: 2px;
  background: #0063E1;
  border-radius: 1px;
  margin: 0 2px;
}
.sidebar-drop-indicator-v {
  width: 2px;
  height: 20px;
  background: #0063E1;
  border-radius: 1px;
}

/* 删除原 .sortable-row / .sortable-pill — useSortable inline style 已包含 transition */

/* Reduced motion — dnd-kit v6.3 已自动处理；保留 overlay 类名以防 */
@media (prefers-reduced-motion: reduce) {
  .drag-overlay-row,
  .drag-overlay-pill {
    transition: none !important;
  }
}
```

---

## 7. 评审结论

### 7.1 总评

`03_tech_plan.md` 是**主结构正确、细节有 5 处致命漏洞**的中等偏上规划。库选型、组件分层、Sensor 模式、动画语言对齐 — 这些"骨架"对的；但**数据正确性（snapshot 污染）、视觉正确性（restrictToVerticalAxis 副作用 + cursor）、容错可观察性（不返回 Vec）**这三块的细节失误会在生产环境形成"看不见的 bug"。

### 7.2 是否 10/10 可实施

**否**。需要先 patch 5 个 P0、3 个 P1（P1-1/P1-3/P1-6）然后才可以放手 SubAgent 进入 04_implementation_plan.md。

### 7.3 推荐路径

1. 主 Agent 直接 patch 03_tech_plan.md（按本评审 §6 的代码片段）—— 半小时内完成。
2. patch 后**重新跑本架构评审**（可由另一个 Opus 4.7 SubAgent 验证 P0 是否全部消除）。
3. 评审通过后进入 04_implementation_plan.md 的 T1-T13。

### 7.4 附：本评审 missed 的可能问题

- 未深入测试 dnd-kit 在 macOS WKWebView 下的 native event delegation 行为。
- 未实测 `cubic-bezier(0.16, 1, 0.3, 1)` 220ms transition 在 9 项同时让位时的合成图层数。
- 未验证 `@dnd-kit/modifiers@9.0.0` 是否实际存在（应在 04 实施前 `npm view` verify）。

这些建议在 T2（npm install）+ T13（手动 acceptance）阶段补做。
