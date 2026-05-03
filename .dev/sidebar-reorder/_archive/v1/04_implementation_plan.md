# Sidebar Reorder — Implementation Plan（实施规划）

> **Decisional 文档**。任务拆分、执行顺序、依赖关系。
> 视觉/动效规格以 `02_design_spec.md` 为准；技术架构以 `03_tech_plan.md` 为准。

## 1. 工程总览

3 个 Phase，13 个 atomic 任务。所有任务可被单个 SubAgent（Opus）独立完成。Phase 之间严格串行；Phase 内部部分任务可并行。

```
Phase 1: 后端
  └── T1: Rust reorder_categories + reorder_tags + tests + register

Phase 2: 前端基础设施（可并行 4 个 SubAgent）
  ├── T2: 安装 dnd-kit 依赖（npm install）
  ├── T3: 添加 store actions (reorderCategories/reorderTags + serial queue)
  ├── T4: CSS 增量到 index.css
  └── T5: 创建 dnd 工具文件夹（CustomMouseSensor / animations / announcements）

Phase 3: 前端组件（串行，因依赖关系）
  ├── T6: 创建 SortableCategoryRow + DragOverlayCategoryRow
  ├── T7: 创建 SortableTagPill + DragOverlayTagPill
  ├── T8: 创建 SortableCategoriesList
  ├── T9: 创建 SortableTagsList
  ├── T10: 改 Sidebar.tsx 集成两个 Sortable list（含 startDrag 排除 + 折叠态自动展开）
  ├── T11: 改 MainLayout.tsx 接 onReorder + isDragging
  ├── T12: 添加单元测试（vitest）
  └── T13: 全套验证 + 手动 acceptance

每个 Phase 之间运行：npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings
```

---

## 2. 详细任务卡

### T1 — Rust 后端 reorder commands

**前置**：无
**预估工作量**：30 行 Rust + 4-6 个 unit test
**输出文件**：
- `src-tauri/src/commands/data.rs`（追加两个函数和 tests mod）
- `src-tauri/src/lib.rs`（注册到 generate_handler）

**实现要求**（细节见 `03_tech_plan.md` §3）：
1. 函数 `reorder_categories(orderedIds: Vec<String>) -> Result<(), String>`
2. 函数 `reorder_tags(orderedIds: Vec<String>) -> Result<(), String>`
3. 注意：使用 `#[allow(non_snake_case)]` 保持与现有命令一致的 camelCase 风格（如 `add_scene` 用 `skillIds`）
4. 容错性：未知 id 静默跳过；缺失 id 追加末尾保留原序
5. 单元测试至少覆盖：basic、empty、partial、unknown-id、duplicate-id 场景
6. `lib.rs` 中 `tauri::generate_handler![...]` 列表添加这两个命令名

**验证**：`cd src-tauri && cargo test && cargo clippy -- -D warnings` 全绿。

---

### T2 — 安装 dnd-kit 依赖

**前置**：无
**输出**：`package.json` + `package-lock.json` 更新

**命令**：
```bash
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2 @dnd-kit/modifiers@^9.0.0
```

**验证**：
- `npm ls @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers` 全部安装
- `node_modules/@dnd-kit/` 存在
- `npx tsc --noEmit` 无新错误

---

### T3 — appStore 新增 reorder actions

**前置**：T1 完成（Rust 命令存在）
**输出**：`src/stores/appStore.ts`（追加 + 修改 interface）

**实现要求**（细节见 `03_tech_plan.md` §4）：
1. AppState interface 添加 `reorderCategories: (orderedIds: string[]) => Promise<void>` 和 `reorderTags`
2. 实现：乐观更新 + 失败回滚
3. 模块顶部添加 `reorderQueue` 串行队列
4. 不修改任何现有 action

**验证**：`npx tsc --noEmit` 全绿。

---

### T4 — CSS 增量

**前置**：无（独立）
**输出**：`src/index.css`（追加段）

**实现要求**（见 `03_tech_plan.md` §10）：
1. 追加 `.sortable-row` / `.sortable-pill` transition
2. 追加 `.drag-overlay-row` / `.drag-overlay-pill` shadow + radius
3. 追加 `.drop-indicator-h` / `.drop-indicator-v`
4. 追加 `prefers-reduced-motion: reduce` 段
5. 不修改任何现有 CSS

**验证**：浏览器中视觉无回归（既有动画依旧）。

---

### T5 — dnd 工具文件夹

**前置**：T2 完成
**输出**：
- `src/components/sidebar/dnd/CustomMouseSensor.ts`
- `src/components/sidebar/dnd/animations.ts`
- `src/components/sidebar/dnd/announcements.ts`
- `src/components/sidebar/dnd/DropIndicator.tsx`（如需独立组件渲染 indicator）

**实现要求**（见 `03_tech_plan.md` §6 / §9 / §11）。

---

### T6 — SortableCategoryRow + DragOverlayCategoryRow

**前置**：T2 + T5
**输出**：
- `src/components/sidebar/SortableCategoryRow.tsx`
- `src/components/sidebar/DragOverlayCategoryRow.tsx`

**实现要求**（见 `03_tech_plan.md` §8）：
1. SortableCategoryRow 完整复用 Sidebar.tsx:294-348 现有 row JSX 结构与 className
2. 加 `useSortable` hook，参数见规划文档
3. 用 `CSS.Translate.toString`（避免挤压）
4. ColorPicker 包 `<span data-no-dnd="true" onClick={(e) => e.stopPropagation()}>`
5. `disabled: isEditing` 防止编辑态被拖
6. DragOverlay 版本：simplified 内容（圆点 + 名字，省略 count）+ `.drag-overlay-row` 样式
7. 保留所有现有 onClick / onDoubleClick / onContextMenu 行为

---

### T7 — SortableTagPill + DragOverlayTagPill

**前置**：T2 + T5
**输出**：
- `src/components/sidebar/SortableTagPill.tsx`
- `src/components/sidebar/DragOverlayTagPill.tsx`

**实现要求**：
1. 完整复用 Sidebar.tsx:434-459 现有 button JSX 结构
2. 用 `rectSortingStrategy` 上下文中的 `useSortable`
3. transition 用 `TAG_REORDER_TRANSITION`（240ms）
4. DragOverlay：仅文字 + pill 形态 + `.drag-overlay-pill` 样式

---

### T8 — SortableCategoriesList

**前置**：T6
**输出**：`src/components/sidebar/SortableCategoriesList.tsx`

**实现要求**（见 `03_tech_plan.md` §7）：
1. DndContext + SortableContext 配置
2. modifiers: `[restrictToVerticalAxis, restrictToParentElement]`
3. measuring: `MeasuringStrategy.Always`（必须）
4. accessibility.announcements 用 `makeAnnouncements(categories, 'category')`
5. onDragStart 调用 props.onDragStart() + setActiveId
6. onDragEnd 计算 newOrder + 调用 props.onReorder(orderedIds)
7. onDragCancel 清 activeId
8. **管理 "Show X more" 折叠态**：在 onDragStart 时如果折叠则自动展开（接收 sidebar 传入的 setShowAllCategories prop 或自管 state）
9. 渲染：data-sortable-list 容器 + map(SortableCategoryRow) + 末尾 InlineInput（add 模式时） + Show more button
10. DragOverlay 渲染 active row

**关键防御**：
- 编辑/新增态的 row 应用 `disabled: true`（在 SortableCategoryRow 内已处理）
- 折叠态："Show X more" 按钮**不**参与 SortableContext（不在 items array 中）
- InlineInput 不参与 SortableContext

---

### T9 — SortableTagsList

**前置**：T7
**输出**：`src/components/sidebar/SortableTagsList.tsx`

**实现要求**：
1. 与 T8 类似，但 strategy 用 `rectSortingStrategy`
2. **不**用 `restrictToVerticalAxis`（Tags 是 2D wrap）
3. 容器需 `min-height` 防 wrap 行数突变跳动 — 用 inline style 计算或固定 min-height
4. 渲染：data-sortable-list 容器 + map(SortableTagPill) + 末尾 +N button + InlineInput
5. +N button 不参与 SortableContext
6. DragOverlay 渲染 active pill

---

### T10 — Sidebar.tsx 集成

**前置**：T8 + T9
**输出**：修改 `src/components/layout/Sidebar.tsx`

**实现要求**：
1. 修改 `startDrag`：增加 `target.closest('[data-sortable-list]')` 排除（顶部）
2. 把 Categories 列表渲染替换为 `<SortableCategoriesList>`，传入：
   - `categories={visibleCategories}`（注意：仍走折叠逻辑，但拖动时由 List 内部要求 setShowAllCategories）
   - 实际更优雅：把 `categories={categories}` 全部传入，然后在 List 内部根据 `showAll` 决定渲染前 9 个或全部 — **要求拖动时自动展开**
   - 把 `setShowAllCategories` 通过 prop 传入（让 List 在 onDragStart 自调用）
3. 同理改 Tags 区
4. 新增 props: `onReorderCategories`, `onReorderTags`, `onDragStart`
5. Refresh 按钮：根据新 prop `isDragging` disable
6. 不改任何 navigation / context menu / 编辑相关代码

**回归检验点**：
- ColorPicker 圆点点击仍能打开
- 单击行仍 navigate
- 双击仍进入编辑
- 右键仍出 ContextMenu
- 编辑/新增 input 仍工作
- 空 categories / 空 tags 状态仍渲染正确
- "Show X more" / "+N" 按钮文本与计数正确

---

### T11 — MainLayout.tsx 接 onReorder

**前置**：T3 + T10
**输出**：修改 `src/components/layout/MainLayout.tsx`

**实现要求**：
1. useAppStore 解构添加 `reorderCategories, reorderTags`
2. 新增 `handleReorderCategories`、`handleReorderTags`、`handleDragStart` callback
3. 新增 isDragging state（onDragStart -> true，onDragEnd -> false） — 通过 props 暴露给 Sidebar 用于禁用 Refresh
4. 把这些传给 `<Sidebar>` 

---

### T12 — 单元测试

**前置**：T11
**输出**：
- `src/stores/__tests__/appStore.reorder.test.ts`
- `src/components/sidebar/__tests__/SortableCategoriesList.test.tsx`
- `src/components/sidebar/__tests__/SortableTagsList.test.tsx`

**测试范围**（见 `03_tech_plan.md` §12.2）：
- store action 乐观更新 + 失败回滚
- 串行队列：两次 reorder 顺序保证
- 渲染快照（项目数量正确）
- data-no-dnd 包裹 ColorPicker
- isAddingCategory / editingCategoryId 状态下 sortable disabled

---

### T13 — 全套验证 + 手动 acceptance

**前置**：T12
**操作**：
1. `npx tsc --noEmit` 全绿
2. `npm run test` 全绿
3. `cd src-tauri && cargo test` 全绿
4. `cd src-tauri && cargo clippy -- -D warnings` 全绿
5. `npm run tauri dev` 启动 dev 模式
6. 按 `02_design_spec.md` §5 的 16 项 acceptance 逐项手动验证
7. **特别压测**：
   - 连续快速拖动 10 次（防竞态）
   - 拖动期间按 Esc（cancel）
   - 拖动期间按右键（应取消）
   - 拖动到 sidebar 边界外释放（snap-back）
   - 在编辑态尝试拖（应被阻止）
   - 在 ColorPicker 圆点上 mousedown（应不激活拖动）
   - sidebar 空白区 mousedown（应能拖窗口）
   - "Show X more" 折叠时拖（应自动展开）
   - VoiceOver 开启下用键盘 Tab + Space + 上下 + Space
   - System Settings -> Accessibility -> Display -> Reduce motion 开启

---

## 3. 风险登记 + 缓解

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| dnd-kit StrictMode 双 init 导致 listener 重复 | 中 | 低 | dnd-kit 已 React 18 兼容，issue #775 不在我们场景；测试 dev mode 验证 |
| Tags wrap 行数变化引起容器高度跳动 | 高 | 中 | min-height 固定 + dnd-kit 默认让位算法 |
| 拖动期间外部刷新数据 | 低 | 高 | Refresh 按钮在 isDragging 时 disabled；Drop 后乐观更新 |
| 串行队列遗漏 reject 导致后续永远不发 | 低 | 高 | `then(task, task)` 模式而非 `.then().catch()` |
| ColorPicker 子元素事件冒泡到 row 触发 drag | 中 | 高 | data-no-dnd + onClick stopPropagation 双保险 |
| 折叠态自动展开导致用户感觉突然 | 低 | 低 | 加 transition（已有 cascade transition 即生效） |
| Tauri WKWebView PointerEvent 行为不一致 | 低 | 中 | 用 MouseSensor 而非 PointerSensor（04 调研推荐） |
| 后端 reorder 静默成功但实际未持久化 | 低 | 高 | Rust unit test 包含写后读断言 |
| `categoriesWithCounts` useMemo 因 reorder 引发重算导致拖动卡顿 | 低 | 中 | 9 项规模可忽略；MeasuringStrategy.Always 让 dnd-kit 重新测量；性能预算见 §13 |
| Drop 在原位（无变化）调用 reorder 浪费 IPC | 中 | 低 | onDragEnd 比较 `active.id !== over.id` 才调用 |

---

## 4. 退场条件（如何判断"完成"）

1. ☐ 所有 Phase 1-3 任务都通过验证
2. ☐ 所有 16 项 acceptance 全部 ☑
3. ☐ TypeScript 编译无错误
4. ☐ 所有 vitest + cargo test 全绿
5. ☐ cargo clippy 无 warning
6. ☐ Code reviewer SubAgent 审核通过（无 P0/P1）
7. ☐ Animation reviewer SubAgent 审核通过（视觉气质达标）

未达成任一条件 → 回到对应 Phase 修复，重新跑 §13 全套验证。

---

## 5. SubAgent 投递策略

- 后端 T1 — 单 SubAgent（Opus），blocking
- 前端 T2-T5 — **同一条消息 4 个 SubAgent 并行**，blocking
- 前端 T6-T11 — 串行 SubAgent（每个依赖前面），blocking
  - 优化：T6+T7 可并行（独立组件）
- 测试 T12 — 单 SubAgent
- 验证 T13 — 主 Agent 自己跑（涉及 dev server 与人眼判断）
