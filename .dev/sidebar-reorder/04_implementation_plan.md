# Sidebar Reorder — Implementation Plan V3（实施规划 — V3 同步版）

> **Decisional 文档**。任务拆分、执行顺序、依赖关系。
> 视觉/动效规格以 `02_design_spec.md` V3 为准；技术架构以 `03_tech_plan.md` V3 为准。
> V1 已归档至 `_archive/v1/04_implementation_plan.md`。

## V3 同步修订（V2 → V3）

T0 对齐检查发现 04 内容仍是 V2，与 02/03 V3 不一致。本次 patch 同步：
- T8 modifiers 配置按 03 V3 §7 重写（DndContext = `[snapModifier]`，DragOverlay = `[restrictToWindowEdges]`，删除 restrictToVerticalAxis）
- T9 modifiers 配置同步明确（rectSortingStrategy + 上述 modifiers）
- T13b acceptance #2 补吸盘/拉离子条件
- T13b acceptance #4 改 distance-aware settle 公式
- T13b acceptance #8 改 cubic-bezier(0.32, 0.72, 0, 1) 减速回弹（撤销虚假 spring overshoot）

## Revision History

V1 → V2 关键变更（按评审单 P0 编号）：
- **F-P0-1**：每个任务卡顶部增加"必读上下文清单"（防 SubAgent 跳过 spec）
- **F-P0-2**：依赖图修正 T8/T9 显式依赖 T5
- **F-P0-3**：T1 测试隔离（apply_reorder pure function + ENSEMBLE_DATA_DIR override）
- **F-P0-4**：T10/T11 SidebarProps fan-out 完整规划（index.ts 导出 + Refresh visual）
- **F-P0-5**：T13 拆 T13a（自动化）+ T13b（用户介入视觉验证）
- T1 大幅扩展：包含 DATA_MUTEX 加到所有 mutating 命令
- T3 大幅扩展：包含 categoriesVersion 协议 + loadCategories 改造
- T5 新增 snapModifier + screenReaderInstructions
- T6/T7 新增 CategoryRowContent / TagPillContent 抽离 + justDropped 防误触
- 新增 T0：架构演进概览 + 编辑/新增态全局禁用 SortableContext

## 1. 工程总览（V2 依赖图修正）

```
Phase 0: 概念对齐（无代码）
  └── T0: SubAgent 与本人对齐 V2 文档

Phase 1: 后端
  └── T1: Rust apply_reorder + reorder_categories/tags + DATA_MUTEX + 测试 + 注册

Phase 2: 前端基础设施（4 个 SubAgent 并行 — 无相互依赖）
  ├── T2: 安装 dnd-kit 依赖
  ├── T3: appStore 增 reorderCategories/Tags + version + 串行队列 + loadCategories 改造
  ├── T4: CSS 增量到 index.css（含 token + cursor 抑制 + reduced-motion）
  └── T5: dnd 工具文件夹（CustomMouseSensor + animations + announcements + snapModifier）

Phase 3: 前端组件（V2 依赖图修正）
  T6 (← T2, T5)  SortableCategoryRow + DragOverlayCategoryRow + CategoryRowContent
  T7 (← T2, T5)  SortableTagPill + DragOverlayTagPill + TagPillContent
       (T6 + T7 可并行)
  T8 (← T6, T5)  SortableCategoriesList
  T9 (← T7, T5)  SortableTagsList
       (T8 + T9 可并行)
  T10 (← T8, T9) Sidebar.tsx 集成 + index.ts 导出 + Refresh visual
  T11 (← T3, T10) MainLayout.tsx 接 onReorder + isDragging
  T12 (← T11)    单元测试
  T13a (← T12)   自动化验证（tsc + tests + clippy）
  T13b (← T13a)  主 Agent 启动 dev server，向用户报告需手动验证 acceptance §6
```

每个 Phase 之间 **必须** 跑：
```bash
npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings
```

---

## 2. 详细任务卡

### T0 — 概念对齐 SubAgent

**前置**：无
**输出**：`.dev/sidebar-reorder/05_review/06_v2_alignment_check.md`（SubAgent 输出）

**必读上下文**（按顺序）：
1. `00_understanding.md`
2. `02_design_spec.md` V2（全文）
3. `03_tech_plan.md` V2（全文）
4. `04_implementation_plan.md` V2（全文）
5. 5 份 review

**任务**：作为新 SubAgent 完整阅读上述文档，写出一段"我理解到的工作"摘要 + 找出文档间任何残留矛盾，输出对齐检查报告。如发现 P0 矛盾，主 Agent 停下修文档；否则进入 Phase 1。

---

### T1 — Rust 后端 reorder + DATA_MUTEX + apply_reorder + 测试

**前置**：无
**预估工作量**：~150 行 Rust（含测试）
**输出文件**：
- `src-tauri/src/commands/data.rs`（重大修改：加 DATA_MUTEX、apply_reorder、reorder_categories、reorder_tags、给所有 mutating 命令包锁、加 #[cfg(test)] mod）
- `src-tauri/src/lib.rs`（注册 reorder_categories、reorder_tags）
- `src-tauri/src/utils/path.rs`（如需，加 ENSEMBLE_DATA_DIR env override）

**必读上下文**：
1. `03_tech_plan.md` V2 §3 全文（apply_reorder 正确实现 + DATA_MUTEX 用法 + 测试要求）
2. `src-tauri/src/commands/data.rs` 当前文件（理解所有现有 mutating 命令需包锁）
3. `src-tauri/src/types.rs`（Category, Tag 已有 id 字段；HasId trait 添加位置）
4. `src-tauri/src/utils/path.rs`（get_app_data_dir 当前实现）

**实现要求**：
1. **加 `DATA_MUTEX: Mutex<()>` 静态变量** 到 data.rs 顶部
2. **所有 mutating 命令**（add/update/delete/reorder × categories/tags/scenes/projects）的最外层加 `let _guard = DATA_MUTEX.lock().map_err(|e| e.to_string())?;`
3. 实现 `HasId` trait + `apply_reorder<T: HasId>` pure function（按 03_tech_plan §3.2 正确版本）
4. 实现 `reorder_categories(orderedIds: Vec<String>) -> Result<Vec<Category>, String>`（**返回 Vec！**）和 `reorder_tags`
5. 在 `lib.rs` 的 `tauri::generate_handler![...]` 列表添加这两个命令
6. **测试隔离**：在 `path.rs` 的 `get_app_data_dir()` 加 `std::env::var("ENSEMBLE_DATA_DIR").map(PathBuf::from).unwrap_or_else(|_| <原逻辑>)`
7. **单元测试**（apply_reorder pure function）：
   - basic_reorder
   - empty_ordered_ids_appends_all
   - partial_ordered_ids_appends_remainder
   - unknown_ids_silently_skipped
   - duplicate_ids_deduplicated_first_wins
   - preserves_original_order_for_unmentioned_items
8. **集成测试**（reorder_categories 端到端）：用 tempdir + ENSEMBLE_DATA_DIR；写入 → reorder → 读取，断言顺序持久化
9. **并发安全测试**：spawn 10 reorder + 10 add 线程并发，all join 后断言数据集完整 + 顺序合理

**验证**：`cd src-tauri && cargo test && cargo clippy -- -D warnings` 全绿。**必须 zero warnings**。

---

### T2 — 安装 dnd-kit 依赖

**前置**：无
**输出**：`package.json` + `package-lock.json` 更新

**必读上下文**：`03_tech_plan.md` V2 §1（库版本）

**命令**：
```bash
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2 @dnd-kit/modifiers@^9.0.0
```

**验证**：
- `npm ls @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers` 全部安装
- `node_modules/@dnd-kit/` 存在
- `npx tsc --noEmit` 无新错误

---

### T3 — appStore 重大扩展

**前置**：T1 完成
**输出**：`src/stores/appStore.ts`（重大改）

**必读上下文**：
1. `03_tech_plan.md` V2 §2.3 + §4 全文（categoriesVersion 协议 + 两阶段提交 + 串行队列）
2. `src/stores/appStore.ts` 当前文件
3. `src/stores/skillsStore.ts`（autoClassify 调 loadCategories 的位置）

**实现要求**（按 V2 §4）：
1. AppState interface 添加 `categoriesVersion`、`tagsVersion`、`reorderCategories`、`reorderTags`
2. 模块顶部添加 `reorderQueue` + `enqueueReorder<T>(task)` helper
3. 实现 `reorderCategories(orderedIds)` 与 `reorderTags(orderedIds)`：**两阶段提交**（立即 set + 排队 IPC + 失败 fallback 到后端 canonical）
4. 改造 `loadCategories`、`loadTags`：版本快照 + IPC 后比较，version 变化时跳过 set
5. 改造 `addCategory/updateCategory/deleteCategory/addTag/updateTag/deleteTag`：每次 set 都 bump version
6. 不修改任何路由 / 编辑相关 action

**验证**：`npx tsc --noEmit` 全绿。

---

### T4 — CSS 增量

**前置**：无（独立）
**输出**：`src/index.css`（追加段）

**必读上下文**：`03_tech_plan.md` V2 §10 全文

**实现要求**：
1. 追加 `:root` 段：`--color-accent`、`--color-accent-soft`、`--ease-drag-*`、`--duration-drag-*`
2. 追加 `@media (prefers-color-scheme: dark)` 内的 token 覆盖（即使本期 light 主导）
3. 追加 `[data-sortable-list] [aria-roledescription='sortable']` 抑制 cursor: grab
4. 追加 `.drag-overlay-row` / `.drag-overlay-pill`（多层 hsl shadow）
5. 追加 `.drop-indicator-h` / `.drop-indicator-v`（用 var(--color-accent)）
6. 追加 `prefers-reduced-motion: reduce` 段
7. 不修改任何现有 CSS

**验证**：浏览器中既有动画无回归。

---

### T5 — dnd 工具文件夹（V2 含 snapModifier）

**前置**：T2 完成
**输出**：
- `src/components/sidebar/dnd/CustomMouseSensor.ts`
- `src/components/sidebar/dnd/animations.ts`（含 SNAP_DISTANCE_PX）
- `src/components/sidebar/dnd/announcements.ts`（含 screenReaderInstructions）
- `src/components/sidebar/dnd/snapModifier.ts`（V2 新增）

**必读上下文**：
1. `03_tech_plan.md` V2 §6 / §9 / §11 / §12
2. `02_design_spec.md` V2 §2.5（snap 行为）

---

### T6 — SortableCategoryRow + DragOverlayCategoryRow + CategoryRowContent

**前置**：T2 + T5
**输出**：
- `src/components/sidebar/SortableCategoryRow.tsx`
- `src/components/sidebar/DragOverlayCategoryRow.tsx`
- `src/components/sidebar/CategoryRowContent.tsx`（V2 新增 — 共享内容）

**必读上下文**（**按顺序读完再开工**）：
1. `04_implementation_plan.md` V2 §1（本任务在依赖图位置）
2. `02_design_spec.md` V2 §2.1-§2.5、§2.7-§2.9（视觉/手势规格）
3. `03_tech_plan.md` V2 §8（实现示例代码）
4. `03_tech_plan.md` V2 §9-§10（动画常量 + CSS 类名）
5. `src/components/layout/Sidebar.tsx:294-348`（要复用的现有 row JSX）
6. `src/components/sidebar/dnd/animations.ts`（已被 T5 创建）
7. `src/components/common/index.ts`（找 ColorPicker import）

**实现要求**（按 V2 §8）：
1. 抽 `CategoryRowContent`：渲染 ColorPicker dot + name + count（count 可选 prop showCount）。ColorPicker 包 `<span data-no-dnd="true" onMouseDown={(e) => e.stopPropagation()}>` 双保险。
2. SortableCategoryRow：复用 V1 §8 的 useSortable 模式，**opacity isDragging ? 0 : 1**（V2 改 0），加 `justDropped` prop + onClick guard
3. DragOverlayCategoryRow：thin wrapper 套 `.drag-overlay-row`，渲染 `<CategoryRowContent showCount={false} />`

---

### T7 — SortableTagPill + DragOverlayTagPill + TagPillContent

**前置**：T2 + T5
**输出**：3 个文件（对称 T6）

**必读上下文**：同 T6（替换 §2 章节为 Tags 相关）

**实现要求**：
1. 抽 `TagPillContent`
2. SortableTagPill：transition 用 220ms（V2 改）
3. DragOverlayTagPill 套 `.drag-overlay-pill`

---

### T8 — SortableCategoriesList

**前置**：T6 + T5（依赖图修正）
**输出**：`src/components/sidebar/SortableCategoriesList.tsx`

**必读上下文**（**按顺序读完再开工**）：
1. `04_implementation_plan.md` V2 §1
2. `02_design_spec.md` V2 §2.4 / §2.5 / §2.10 / §2.11
3. `03_tech_plan.md` V2 §7（DndContext 配置）
4. `03_tech_plan.md` V2 §11（snapModifier）
5. `src/components/sidebar/dnd/*` 全部（T5 产出）
6. `src/components/sidebar/SortableCategoryRow.tsx`（T6 产出）

**实现要求**（V3 — 严格按 03 V3 §7 模板）：
1. DndContext 完整配置（按 03 V3 §7 模板）
2. `SortableContext.disabled = isAdding || editingId !== null`（**整体 disable，覆盖 add input 边界**）
3. **DndContext modifiers = `[snapModifier]`**（仅磁吸；不再用 axis lock，让 verticalListSortingStrategy 自然约束让位方向）
4. **`<DragOverlay modifiers={[restrictToWindowEdges]} dropAnimation={dropAnimationConfig}>`**（显式 modifier 仅防出窗口）
5. **不使用** `restrictToVerticalAxis`、`restrictToParentElement`（V2 已被 V3 移除，避免 P0 跟手 X=0 卡边 bug）
6. accessibility 含 `screenReaderInstructions`
7. 折叠 state：拖动开始时如未展开则调用 `setShowAll(true)`（接收 prop）
8. justDroppedId state + setTimeout 50ms 清
9. 渲染时把 `justDropped` prop 传给对应 row
10. `dropAnimationConfig: useState<DropAnimation | null>` — 在 onDragEnd 按 distance 计算（< 4px → null；否则 `{ duration: Math.min(280, 120 + dist * 0.5), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }`）

---

### T9 — SortableTagsList

**前置**：T7 + T5
**输出**：`src/components/sidebar/SortableTagsList.tsx`

**必读上下文**：同 T8（替换为 Tags）

**实现要求**（V3 — 严格按 03 V3 §7.1 模板）：
1. 与 T8 类似，但 strategy = `rectSortingStrategy`
2. **DndContext modifiers = `[snapModifier]`**（同 T8）
3. **`<DragOverlay modifiers={[restrictToWindowEdges]} dropAnimation={dropAnimationConfig}>`**（同 T8）
4. **不使用** restrictToVerticalAxis（Tags 是 2D wrap）
5. 容器 `style={{ minHeight: ... }}` 防 wrap 行数突变
6. +N button、Add input 不参与 SortableContext
7. 同 T8 #10：dropAnimationConfig 距离感知

---

### T10 — Sidebar.tsx 集成（V2 含 fan-out）

**前置**：T8 + T9
**输出**：
- 修改 `src/components/layout/Sidebar.tsx`
- 修改 `src/components/sidebar/index.ts`（V2 — 导出新增组件）

**必读上下文**：
1. `04_implementation_plan.md` V2 §1
2. `02_design_spec.md` V2 §2.9 / §2.10 / §2.11
3. `03_tech_plan.md` V2 §5.2（变更范围）
4. `src/components/layout/Sidebar.tsx` 当前全文

**实现要求**（按 V2 §5.2）：
1. `startDrag` 加 `target.closest('[data-sortable-list]')` 排除（顶部）
2. Categories 列表改用 `<SortableCategoriesList>`，传完整 props
3. Tags 区改用 `<SortableTagsList>`
4. SidebarProps 接口新增 4 prop：`onReorderCategories: (ids: string[]) => void`、`onReorderTags`、`onDragStart: () => void`、`onDragEnd: () => void`、`isDragging: boolean`
5. Refresh 按钮：`disabled={isRefreshing || isClickAnimating || isDragging}` + `className` 加 `${isDragging ? 'opacity-40' : ''}`
6. **更新 `src/components/sidebar/index.ts`**：导出 SortableCategoriesList / SortableTagsList / SortableCategoryRow / SortableTagPill / DragOverlayCategoryRow / DragOverlayTagPill 等
7. 不改任何 navigation / context menu / 编辑相关代码

**回归检验点**（必须验证）：
- ColorPicker 圆点点击仍能打开
- 单击行仍 navigate
- 双击仍进入编辑
- 右键仍出 ContextMenu
- 编辑/新增 input 仍工作
- 空 categories / 空 tags 仍渲染正确
- "Show X more" / "+N" 仍正确
- Sidebar 空白区 mousedown 仍能拖窗口

---

### T11 — MainLayout.tsx 接 onReorder + isDragging

**前置**：T3 + T10
**输出**：修改 `src/components/layout/MainLayout.tsx`

**必读上下文**：
1. `03_tech_plan.md` V2 §5.3
2. `src/components/layout/MainLayout.tsx` 当前全文

**实现要求**：
1. useAppStore 解构添加 `reorderCategories, reorderTags`
2. `useState<boolean>` 持有 `isDragging`
3. 实现 `handleReorderCategories`、`handleReorderTags`、`handleDragStart`（含 R-P0-2 guard）、`handleDragEnd`
4. 把这些传给 `<Sidebar>`
5. 不改任何其他逻辑

---

### T12 — 单元测试

**前置**：T11
**输出**：
- `src/stores/__tests__/appStore.reorder.test.ts`
- `src/components/sidebar/__tests__/SortableCategoriesList.test.tsx`
- `src/components/sidebar/__tests__/SortableTagsList.test.tsx`

**必读上下文**：
1. `03_tech_plan.md` V2 §13.2
2. `src/test/helpers/tauriMock.ts`（IPC mock 模式）

**测试场景**：
- store action 乐观更新立即生效
- IPC 失败时通过 get_categories 校准（mock 返回不同 Vec）
- 串行队列：`reorderCategories(['B','A'])` + `reorderCategories(['A','B'])` 顺序保证
- categoriesVersion 自增
- loadCategories 在 version 变化时跳过 set
- 渲染快照（项目数量正确）
- data-no-dnd 包裹 ColorPicker
- SortableContext disabled 当 isAdding

---

### T13a — 自动化验证

**前置**：T12
**输出**：CI-style 验证报告

**操作**：
```bash
npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings
```

全绿才进入 T13b。

---

### T13b — 主 Agent 启动 dev server + 用户视觉验证

**前置**：T13a
**输出**：dev server URL + 给用户的验证清单

**操作**：
1. 主 Agent 在后台启动 `npm run tauri dev`
2. 主 Agent 给用户发送 acceptance 清单（来自 `02_design_spec.md` V2 §6）
3. 用户在 dev mode 中逐项验证
4. 用户反馈结果：
   - 全过 → 进入 commit
   - 不达标 → 主 Agent 根据反馈定位是 spec 问题（回 Plan）还是实现问题（修 T6/T7/...）

**T13b 完整 acceptance 清单**（给用户看的）：

> 视觉效果（必须客观达标）：
> 1. ☐ Lift 启动延迟 ≤ 16ms
> 2. ☐ Lift 两段总时长 ≈ 200ms（吸盘 80 + 拉离 120）；吸盘段 ease-out scale up；拉离段 scale 无 undershoot；拉离段 opacity 单调下降无负值
> 3. ☐ Cascade 让位 220ms 全程 ≥ 55fps
> 4. ☐ Settle distance-aware：距离 < 4px → 瞬时（磁吸已对齐时跳过 dropAnimation）；距离 ≥ 4px → ≈ min(280, 120 + delta × 0.5)，无可见 overshoot
> 5. ☐ 磁吸触发 ≈ 12px 距离，吸附 ≈ 80ms
> 6. ☐ Drop indicator 颜色 #0063E1（light）/ #0A84FF（dark）
> 7. ☐ Drop indicator 在 Tags wrap 末端正确显示短水平线
> 8. ☐ Cancel snap-back ≈ 280ms，曲线 cubic-bezier(0.32, 0.72, 0, 1) 开局减速感（无 overshoot）
> 9. ☐ DragOverlay 阴影是多层叠加感
>
> 行为零回归（必须全过）：
> 10. ☐ 单击 Category/Tag 仍 navigate（拖动距离 < 4px）
> 11. ☐ 双击仍进入编辑
> 12. ☐ 右键仍出 ContextMenu
> 13. ☐ ColorPicker 圆点单击能打开颜色面板
> 14. ☐ Sidebar 空白区 mousedown 仍能拖窗口
> 15. ☐ 编辑/新增 input 显示时无法触发拖动
> 16. ☐ 编辑 input 中输入到一半，鼠标在 sidebar 内移动 — 输入不丢失
> 17. ☐ Refresh 按钮在拖动期间 disabled + 灰
> 18. ☐ "Show X more" 折叠时拖拽自动展开
> 19. ☐ 拖动后 IPC 完成数据持久化（重启应用顺序保留）
> 20. ☐ 双击 + 5px 微动测试 — 80%+ 仍触发编辑而非拖动
> 21. ☐ 折叠 9+ categories 后滚动到底部，拖最后一项到中间，indicator 位置正确
> 22. ☐ 拖动激活后 cursor 切 grabbing，hover 时保持 default
>
> 可访问性：
> 23. ☐ macOS Settings → Accessibility → Display → Reduce motion 开启后所有动画瞬时
> 24. ☐ 键盘可达：Tab + Space + 上下/左右方向键 + Esc 完成全流程重排
> 25. ☐ VoiceOver 公告内容是 Category/Tag 名字而非 UUID
>
> 用户主观感受：
> 26. ☐ 拖动起始有"先吸住后拉离"的物理感
> 27. ☐ 让位动画"crisp"不拖泥带水
> 28. ☐ 磁吸时不会感到"hidden hand 抢控制权"

---

## 3. 风险登记 + 缓解（V2 扩展）

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| Rust DATA_MUTEX 出现死锁 | 极低 | 高 | 单一锁、非递归；测试包含并发场景 |
| categoriesVersion 在多次快速 reorder 下 race | 低 | 中 | version 是 monotonic，IPC 内部读时可能比 set 时旧 — 接受 "skip 后下次 loadCategories 会同步" |
| autoClassify 完成时 reorder 已过 2s — version 不再保护 | 中 | 低 | 用户视角："你刚拖的位置在过了几秒后被刷新覆盖" — 边缘场景，记录为已知行为 |
| dnd-kit StrictMode 双 init | 低 | 低 | 测试 dev mode 验证；issue #775 不在我们场景 |
| Tags wrap 行数变化引起容器抖动 | 高 | 中 | min-height + closestCenter |
| 编辑态 + autoClassify 触发 add_category | 低 | 低 | DATA_MUTEX 兜底 |
| 串行队列遗漏 reject 后续永远不发 | 极低 | 高 | `then(task, task)` + catch(() => {}) reset |
| ColorPicker 子元素事件冒泡到 row | 中 | 高 | data-no-dnd + onMouseDown stopPropagation 双保险 |
| Trackpad 三指拖未 cover | 低 | 低 | macOS OS 层模拟 mouse drag，dnd-kit 透明处理 |
| Force Touch 反馈缺失 | 高（明确不实现） | 低 | 文档化为 future enhancement |
| Drop 在原位无变化时调用 reorder | 中 | 极低 | onDragEnd 比较 active.id !== over.id 才调用 |
| 后端返回 Vec 与前端乐观状态短暂不一致 | 中 | 极低 | 后端是 source of truth，覆盖即可 |
| 删除一个 category 期间正在 reorder | 低 | 中 | DATA_MUTEX 串行 |
| `--color-accent` token 在某些子组件 CSS 中没生效 | 低 | 低 | T13b 视觉验证 #6 |

---

## 4. 退场条件（V2 完善）

1. ☐ T0 通过，无文档残留矛盾
2. ☐ T1-T13a 自动化验证全绿（tsc + tests + clippy zero warnings）
3. ☐ T13b 用户验证 28 项 acceptance 全过
4. ☐ Code reviewer SubAgent 审核通过（无 P0/P1）
5. ☐ Animation reviewer SubAgent 审核通过

未达成任一条件 → 回到对应 Phase 修复，重跑全套验证。

---

## 5. SubAgent 投递策略（V2 修正）

- **T0** — 单 SubAgent（Opus），blocking — 对齐检查
- **T1** — 单 SubAgent（Opus），blocking — Rust 后端
- **T2-T5** — **同一条消息 4 个 SubAgent 并行**，blocking
- **T6 + T7** — **同一条消息 2 个 SubAgent 并行**（独立组件）
- **T8 + T9** — **同一条消息 2 个 SubAgent 并行**（独立 List 组件）
- **T10** — 单 SubAgent — Sidebar 集成
- **T11** — 单 SubAgent — MainLayout 集成
- **T12** — 单 SubAgent — 测试
- **T13a** — 主 Agent 自跑（无需 SubAgent）
- **T13b** — 主 Agent 启动 dev server，向用户求证

---

## 6. Git / Commit 策略（V2 新增）

- 不创建 PR（用户在 MEMORY 中记录"Ensemble 是单人项目，直奔 main"）
- 按 Phase 提交（T1 一个 commit、T2-T5 一个、Phase 3 整体一个、T12 + T13a 一个）
- Commit message 用 Conventional Commits："feat(sidebar): add drag-and-drop reordering for categories and tags"
- 每个 commit 前跑 `npx tsc --noEmit && npm run test && cd src-tauri && cargo test`

## 7. 文档更新（V2 新增）

- `CHANGELOG.md` 加一行："- Added drag-and-drop reordering for sidebar Categories and Tags (#sidebar-reorder)"
- `docs/usage.md` 如有用户文档，新增"Reordering Categories and Tags"段
- `AGENTS.md` 不动（无新工程约束）
