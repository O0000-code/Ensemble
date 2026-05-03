# Zero Regression Review

> 审查范围：02_design_spec.md / 03_tech_plan.md / 04_implementation_plan.md 是否做到"不影响任何现有功能、不导致任何新问题"。
> 审查依据：实读 Sidebar.tsx (520 行)、MainLayout.tsx (601 行)、appStore.ts (336 行)、CategoryInlineInput.tsx、TagInlineInput.tsx、ColorPicker.tsx (283 行)、Dropdown.tsx (372 行)、data.rs (429 行)、skillsStore.autoClassify (110 行) 等。

---

## 总评分：6.5/10

规则：每发现一个未在规划中明确处理的回归风险点 −1 分（P0 整 −1，P1 −0.5，P2 −0.25）。
共发现 P0 × 3、P1 × 5、P2 × 2 = −3 − 2.5 − 0.5 = **−6**。但其中 4 个属于"半处理"（规划中提到防御方向但缺关键细节），按 0.5 倍计入，最终扣 3.5 分 → 10 − 3.5 = **6.5**。

---

## 已识别的潜在回归点

### P0（严重 — 可能让"零回归"承诺失败）

#### P0-1：autoClassify 期间 reorder 完成后调用 loadCategories 会**覆盖**用户刚拖动的顺序

**场景**：用户在 SkillsPage 点击 "Auto-classify"，分类期间（耗时数秒至数十秒）切换到 Sidebar 拖动 Categories。autoClassify 完成时执行 `await Promise.all([loadCategories(), loadTags(), get().loadSkills()])`（skillsStore.ts:405），强制从后端拉取 categories — **此时如果 reorder 的 IPC 还没落盘，前端的乐观顺序会被后端旧顺序覆盖，用户看到的是"自己刚拖的位置突然回弹"**。

**步骤**：
1. T0：用户点 Auto-classify，开始 LLM 分类
2. T1：用户拖动"Coding"到第 1 位（前端立即 setState：reorder 乐观更新）
3. T2：reorder_categories IPC 发出，并发地 autoClassify 完成
4. T3：autoClassify 调用 loadCategories（HTTP race）
5. 若 T3 < T2 完成 → **用户的拖动顺序丢失**

**规划中是否处理**：❌ 完全未提。02_design_spec.md §2.10 仅声明"Refresh 按钮 disabled 即不可能"，但 autoClassify 是另一个独立路径，不经过 Refresh 按钮。

**最小补丁**：
- 方案 A（推荐）：appStore.reorderCategories 完成后立即标记 `lastReorderTimestamp`，loadCategories 时若距上次 reorder < 2s 跳过 set。
- 方案 B：将 `isDragging` 状态全局化（移到 appStore），autoClassify 在 `isDragging || lastReorderPending` 时 await reorder 队列再 loadCategories。
- **必须改 04_implementation_plan.md T3：明确 reorderCategories 完成后必须更新一个 `categoriesVersion` 计数器，loadCategories 在 set 前比较 version**。

#### P0-2：编辑/新增态拖动激活会丢失用户输入

**场景**：用户开始 inline edit category 名字 → 输入 "Cod" → 视觉一切正常 → 用户鼠标移开稍微 4px → onDragStart 触发 `clearAllEditingStates()` → CategoryInlineInput 卸载 → **"Cod" 丢失**。

**步骤**：
1. 用户双击 "Coding" → CategoryInlineInput 显示，input.value=""
2. 用户输入 "Cod" → input.value="Cod"
3. 用户鼠标光标在 input 框附近移动 4px+ — 但**事件可能落在 SortableCategoryRow 的别名节点**（编辑态时 SortableCategoryRow 渲染的是 InlineInput；规划中 SortableCategoryRow 内部对 isEditing 已禁用 useSortable，理论上 OK）

**实际隐患**：03_tech_plan.md §5.3 写 `handleDragStart = useCallback(() => { useAppStore.getState().clearAllEditingStates(); ... }, [])`，但 onDragStart 必须由用户**真的拖动**才能触发（distance: 4 激活）。问题在于：**"Add new category" 输入框是在列表末尾追加的，不属于任何 category 的 SortableCategoryRow**。如果其外部容器仍在 SortableContext 内，dnd-kit 可能尝试把它当作未注册的 sortable item。这个边界情况规划没说清楚。

**还有一个隐患**：CategoryInlineInput.tsx:36-44 的 click-outside handler 会在 `mousedown` 时触发 `onCancel` — 用户在 input 中输入到一半，鼠标按下 input 区域外的某行（即使在拖动激活前 4px 内）→ inline input 立即被 cancel → 用户输入丢失。这与新增的 dnd 无直接关系，但**新加 dnd 后用户可能更频繁在 sidebar 内按下鼠标**（试图拖动 row 时不小心按到 input 外侧），**回归概率上升**。

**规划中是否处理**：⚠️ 部分处理（提到 disabled: isEditing），但**未处理 inline input 与 click-outside cancel 的交互边界**。

**最小补丁**：
- T10 实施时，在 SortableCategoriesList 的 `onDragStart` 增加判断：若 `isAddingCategory || editingCategoryId` 则**直接 ignore 这次拖动**（不调用 clearAllEditingStates，让 InlineInput 保留）。
- 更稳：在 `<SortableCategoriesList>` 的容器节点上加 `pointerEvents: isEditing/isAdding ? 'none' : 'auto'` 让整个 sortable 区域在编辑态时不响应。

#### P0-3：Rust 后端 read-modify-write 无锁，reorder 与 add_category 并发时存在数据丢失 race

**场景**：用户拖动 Category 期间，autoClassify 在另一个 promise 链中调用 add_category — Rust 后端 `read_app_data` → `write_app_data` 模式无锁。Tauri 的命令调度对**不同命令**是并发的（每个命令在独立 tokio task 执行）。

**步骤**：
1. reorder_categories(orderedIds=[B,A,C]) 开始：read_app_data → in-memory categories=[A,B,C]
2. 同一时刻 add_category(name="X") 开始：read_app_data → in-memory categories=[A,B,C]
3. reorder 完成 write：磁盘上 categories=[B,A,C]
4. add_category 完成 write：磁盘上 categories=[A,B,C,X] — **X 加上了，但 B,A,C 顺序丢失**

**规划中是否处理**：❌ 完全未提。03_tech_plan.md §3.1 的容错只处理"未知 id 追加"，但 race 场景下后端根本就没机会看到 reorder 的写入。

**最小补丁**：
- 方案 A：Rust 端在 `data.rs` 顶部加 `static DATA_LOCK: std::sync::Mutex<()> = ...`，read_app_data + write_app_data 之间持锁。所有 mutating 命令（add_category / update_category / reorder_categories / add_tag / ...）的 `read → write` 都用同一把锁包起来。这是真正的修复。
- 方案 B：仅前端串行队列（已规划 §4.2）— 但只能保证单进程内串行，无法防御 autoClassify 并发跨 store 的场景。
- **必须改 03_tech_plan.md：T1 不能只是"加 reorder 函数"，必须把 data.rs 的所有 read+write 包在一个 Mutex 内**。

---

### P1（中等 — 可能产生体感 bug）

#### P1-1：data-no-dnd 对 ColorPicker portal 弹层无效

**场景**：用户单击 ColorPicker 圆点 → `setIsOpen(true)` → 颜色面板通过 `createPortal` 渲染到 `document.body`（ColorPicker.tsx:206）。**面板节点不在 sidebar DOM 树中**，因此即使其触发器 button 父级有 `data-no-dnd="true"`，CustomMouseSensor 在面板内的 mousedown 也**无法通过 parentElement 链找到 data-no-dnd**。

**步骤**：
1. 用户在 sidebar 单击圆点（已被 `data-no-dnd` 包，OK）
2. 颜色面板弹出（在 document.body 下，不在 sidebar 内）
3. 用户在面板内点击预设色 → mousedown 在 panel 内 → CustomMouseSensor 检测 — **panel 不在 SortableContext 内，所以也不会激活 drag，OK，没有破坏**
4. 但若用户从面板内拖出（鼠标按住，移动到 sidebar 上），dnd-kit 不会激活，因为 mousedown 不发生在 sortable item 上。**实测应无回归。**

**规划中是否处理**：⚠️ 未明示。规划提到 data-no-dnd 但没验证 portal 边界。

**最小补丁**：
- 在 03_tech_plan.md §6 显式说明：`createPortal` 弹层不在 sortable context 内，所以**不会**误激活拖动；**但若用户按下圆点后立刻拖动（mousedown→move），CustomMouseSensor 可能仍激活 row 的 drag**。需要测试：`<button onClick stopPropagation>` 是否阻止 dnd-kit 的 mousedown 监听？答案是**不**。stopPropagation 在 React onClick 阶段，dnd-kit 监听的是原生 mousedown — 早于 onClick。
- 修复：ColorPicker 触发器 button 自身需要 `onMouseDown={(e) => e.stopPropagation()}` 或父级 wrapper 上加 `data-no-dnd="true"`（已规划，但需在 SortableCategoryRow.tsx 的 ColorPicker 包裹元素上**实际加上**，T6 任务卡里写得不够具体）。

#### P1-2：MeasuringStrategy.Always 与 Sidebar 内部 overflow 滚动可能产生测量错位

**场景**：Sidebar.tsx:272 的 `<div className="flex-1 overflow-y-auto sidebar-scroll">` 是滚动容器。用户在 Categories 较多时（>9 项 + Show all 后再多）滚动到底部拖动 — dnd-kit 的 collision detection 默认基于 `getBoundingClientRect`，但 `MeasuringStrategy.Always` 会在每帧重测，性能上略有开销。**不严重，但 Sidebar 容器与内部 SortableContext 的滚动 offset 同步问题在 dnd-kit issue tracker 是已知坑**。

**规划中是否处理**：⚠️ 03_tech_plan.md §13 提到性能预算，但未提滚动场景。

**最小补丁**：T13 acceptance 增加一项："Show 全部 categories 后滚动到底部，拖动最后一项到中间，验证 indicator 位置正确"。

#### P1-3：onDragOver 与 setActiveCategory 的语义冲突

**场景**：dnd-kit 在 `onDragOver` 时不会改路由，但 SortableCategoryRow 上的 onClick handler **依然存在**。dnd-kit 的活动激活条件 distance:4 之后会**取消** onClick fire（这是 dnd-kit 的 PointerSensor 行为），但**自定义的 MouseSensor 是否同样会阻止后续 click？需要看库实现**。

**实读 dnd-kit**：MouseSensor 在 activated 后 attach `mousemove` listener，drop 时调用 `onDragEnd` — 它不会主动 preventDefault click，但因为 mousedown→move 已切换为 drag mode，**浏览器原生**会基于"mousedown 处与 mouseup 处不同"决定是否 fire click。如果 mouseup 在不同的 row 上（拖动到了别处），click 不 fire；如果 mouseup 在同一 row（短距离移动后回弹）— 可能 fire click。

**步骤**：
1. 用户 mousedown "Coding"，移动 5px（达到激活距离），又移回原位 mouseup
2. dnd-kit 触发 onDragEnd（active.id === over.id），不调用 onReorder（规划已 §S 处理）
3. 浏览器 fire click 在 "Coding" 上 → onClick navigate → **用户原本"取消拖动"的意图变成了 navigate**

**规划中是否处理**：❌ 未提。

**最小补丁**：在 SortableCategoryRow 的 onClick 处理函数前置判断：`if (isDragging || justDropped) return;` — 用一个 ref 或 useState 在 onDragEnd 时设置 `justDropped=true`，下个 tick 清除。

#### P1-4：双击编辑被拖动错激活的边界

**场景**：用户双击 250ms 内连续两次 mousedown。第二次 mousedown 后用户手不稳，移动了 5px → **dnd-kit 激活了拖动而不是双击**。

**实读 React**：onDoubleClick 由浏览器原生 dblclick 事件触发，要求两次 click 在同一元素、间隔 < 500ms、且第二次未发生 drag。**dnd-kit 拦截 mousedown 后**，第二次 mousedown 可能同时被作为"开始拖动"和"双击候选"消费——结果取决于 mousemove 距离。

**风险等级**：低概率（4px 阈值已是 macOS HIG 推荐值）但无法消除。

**规划中是否处理**：⚠️ 02_design_spec.md §2.8 表格只说"双击不会移动 4px，故不被 drag 拦截"——这是**乐观假设**，并未保证。

**最小补丁**：T13 acceptance 增加："鼠标手抖测试：刻意双击+轻微移动，验证 80% 以上仍触发编辑而非拖动"。可接受偶发漏判。

#### P1-5：Rust reorder_categories 的"缺失 id 追加末尾"在并发场景下可能引入死循环式追加

**场景**：前端连续两次 reorder（A→[B,A,C]，B→[C,B,A]），第一次 IPC 在执行 A 的 read 时拿到的 in-memory 是初始 [A,B,C]；第二次 IPC 拿到的也可能是 [A,B,C]（因为第一次还没 write）。两次都成功，最终磁盘是后写入者的状态。**但如果中间有 add_category 并发**：第一次 reorder 已 write [B,A,C]，add_category 又拿到 [A,B,C]（旧 read），追加 X，写 [A,B,C,X]——**B,A,C 全部覆盖回 A,B,C 顺序，且 X 加在末尾。**

这就是 P0-3 的另一个表现，但 P1 这里强调的是：**"缺失 id 追加末尾"防御逻辑只能挽救"读到旧状态后只缺一个新 id"的场景，无法挽救"旧状态完全覆盖新状态"的场景**。

**规划中是否处理**：❌ 03_tech_plan.md §3.1 的容错描述误导性地暗示了"自动追加=并发安全"，但实际上无锁 read-modify-write **不是** concurrency-safe，无论如何容错都防不住 lost update。

**最小补丁**：同 P0-3 — Rust 端必须加 Mutex。

---

### P2（轻微 — 体感小问题）

#### P2-1：MainLayout.tsx categoriesWithCounts useMemo 依赖 categories array reference

**场景**：reorder 后 `categories` array 引用变化，触发 `categoriesWithCounts` 重算（O(n) on n=9，可忽略）。但更严重的是：useMemo 重新生成对象，传给 `<Sidebar categories={categoriesWithCounts}>` → Sidebar 重渲染 → 所有 SortableCategoryRow 重渲染 → `useSortable` 内部 hook 重新计算 transform — **可能导致 cascade 动画的"瞬时跳一帧"**。

**规划中是否处理**：⚠️ 03_tech_plan.md §13 性能预算说"≤ 1ms 远低于"，但未说视觉影响。

**最小补丁**：T13 acceptance 增加 frame profiling，确保 cascade 中无掉帧。可选优化：useSortable 加 React.memo 包装 row 组件。

#### P2-2：autoClassify 创建新 category push 到末尾的语义在新顺序下变得"奇怪"

**场景**：用户精心排好顺序（"Coding" 在第 1 位），autoClassify 创建了新 category "AI/ML"，**push 到末尾**（数据自然排序）。如果用户期望"新创建的 category 应当出现在某个相关位置"，这种 push-to-end 行为会显得"AI/ML 跑到了最后"。

**评估**：这其实是**当前已有的行为**（autoClassify 一直 push 末尾），不是回归。但用户期望可能因新增"我能手动排序"功能而提升——希望系统也"智能地放到合理位置"。

**规划中是否处理**：✅ 00_understanding.md §6.9 说"行为不变，符合直觉"——这是合理的设计选择，但应在 release notes 显式说明"自动分类创建的新 category 会出现在末尾"。

**最小补丁**：无需改代码，仅在 acceptance 中确认行为符合预期。

---

## 规划中已正确处理的关键防御点（值得肯定）

为了平衡，列出规划做对的部分（不影响评分，但说明哪些不需要补丁）：

1. ✅ Sidebar.tsx:10 startDrag 的 `target.closest('[data-sortable-list]')` 排除（03_tech_plan.md §5.2）— 防 macOS 窗口拖动与 sortable 抢手势。但 startDrag 仅挂在 Header 而非整个 sidebar，规划假设有点过谨慎，但无害。
2. ✅ activationConstraint distance:4 解决了"单击导航 vs 拖动"基本冲突
3. ✅ disabled: isEditing 在 useSortable 层面阻断编辑态拖动
4. ✅ 折叠态自动展开避免 dnd-kit 看不到隐藏 item 的问题
5. ✅ DragOverlay 通过 portal 到 body，避免 sidebar overflow 裁剪
6. ✅ MeasuringStrategy.Always 处理动态尺寸
7. ✅ Drop animation 用 cubic-bezier(0.16, 1, 0.3, 1) 与项目原有动效气质一致
8. ✅ KeyboardSensor + sortableKeyboardCoordinates 提供 a11y 通路
9. ✅ accessibility.announcements 使用 name 而非 UUID — 已在 03_tech_plan.md §11
10. ✅ 不引入 sort_order 字段保持数据模型纯净
11. ✅ 串行队列 enqueueReorder（§4.2）防前端连发竞态

---

## 改进建议

### 必须做（缺一项即不达"零回归"标准）

1. **Rust 加 Mutex 锁所有 read+write**（修 P0-3 / P1-5）
   - 改动文件：`src-tauri/src/commands/data.rs`
   - 实施：在 module 顶部加 `static DATA_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());`，所有 mutating 命令在最外层 `let _guard = DATA_MUTEX.lock().unwrap();`
   - 影响：极小（Tauri 命令本来就是异步的，加阻塞 Mutex 不影响 UI；read_app_data 本身是 ms 级 IO）
   - 验证：写一个 Rust 集成测试，并发 spawn 100 个 reorder + 100 个 add_category，检查最终数据一致性

2. **autoClassify / loadCategories 与 reorder 的版本协调**（修 P0-1）
   - 改动文件：`src/stores/appStore.ts`
   - 实施：增加 `categoriesVersion: number`，每次 reorder/add/update/delete 自增；loadCategories 先读取本地 version 快照，await IPC 后若 version 已变化则 set 时跳过 categories 字段（仅更新 tags 等其他字段）
   - 或更简单：autoClassify 改成 reorder 完成后再 loadCategories（添加 await reorderQueue 在 loadCategories 前）

3. **编辑态点击外部 cancel 与拖动激活的边界**（修 P0-2）
   - 改动文件：`src/components/sidebar/SortableCategoriesList.tsx`（T8）
   - 实施：onDragStart 增加 guard `if (isEditingCategory || isAddingCategory) { event.preventDefault?(); return; }` — 实际 dnd-kit 在 listeners 层无法 preventDefault，需要在 row 上 `useSortable({ disabled: isEditing || isAddingAny })`
   - **更稳的方案**：`<SortableCategoriesList>` 容器若有任何 edit/add 状态，给整个 SortableContext 设 `disabled={true}`（dnd-kit 6.0+ 支持）

4. **drop-no-change 防 click 误触**（修 P1-3）
   - 改动文件：`src/components/sidebar/SortableCategoryRow.tsx`（T6）
   - 实施：内部 `useRef<boolean>(false)` 名为 `justDroppedRef`，在 useSortable 的 isDragging 由 true→false 转换时设为 true，next tick 清。onClick 前置 `if (justDroppedRef.current) return;`

### 强烈建议（提升健壮性）

5. **测试覆盖补充**（影响 G1 / G2 / H1）
   - `src/stores/__tests__/appStore.reorder.test.ts` 新增：
     * "reorder 后立即 loadCategories — 顺序应保留"
     * "reorder 期间 autoClassify 模拟（mock loadCategories race）— 顺序应保留"
   - Rust 端新增 `src-tauri/src/commands/data.rs` 集成测试：
     * "并发 reorder + add_category — 最终数据集大小正确，顺序最后写入者赢"
     * "reorder + write_app_data 往返 — 顺序持久化"

6. **acceptance 清单（02_design_spec.md §5）补两项**（影响 G3 / B4）
   - 17. ☐ 编辑 input 中输入到一半，鼠标在 sidebar 内移动，验证输入不丢失
   - 18. ☐ 双击 + 5px 微动测试 — 验证编辑态优先于拖动

7. **dev mode 与 production mode 视觉差异**（G3）
   - 在 T13 中增加："`npm run dev` 模式下打开浏览器（非 Tauri），sidebar 应能 fallback 渲染（categories 为空），不应崩溃"

### 可选（细化）

8. ColorPicker 触发器 button 上 `onMouseDown={(e) => e.stopPropagation()}` 双保险（修 P1-1）
9. categoriesWithCounts 的 useMemo 比对 — 如果只有顺序变化没有 count 变化，复用旧对象（修 P2-1）— 优化但非必须

### 规划文档需要明确的事项

10. 03_tech_plan.md §3.1 应增加章节"Concurrency Safety"，明确告知 reorder 不是 concurrency-safe（直到 Mutex 加上为止）
11. 04_implementation_plan.md T1 任务描述应增加"加 DATA_MUTEX，所有 mutating 命令包锁"
12. 04_implementation_plan.md T3 任务描述应增加"reorderCategories 完成后增加 categoriesVersion，loadCategories 在 set 前比较"
13. 04_implementation_plan.md T8 任务描述应增加"SortableContext 在 edit/add 态下 disabled"
14. 04_implementation_plan.md T13 acceptance 增加 17 / 18 项（如上）

---

## 结论：是否真能做到零回归

**当前规划状态：不能完全做到零回归。** 6.5/10。

主要风险：
- **后端无锁**（P0-3）一旦命中数据丢失，是不可逆的用户损失，必须修
- **autoClassify race**（P0-1）会让用户怀疑"我刚拖的位置被吃了"，体感很差
- **编辑态丢字**（P0-2）会让用户**首次试错**就立刻看到 bug

**修复后的预期得分：9.0+/10**。上述 P0 三项加 P1-3 都有清晰的最小补丁，工程量加起来约 2-3 小时（Rust Mutex < 1h，autoClassify version 协议 < 1h，编辑态 guard < 30min，justDropped ref < 30min）。建议**回到 plan 模式补充必要约束后再实施**，而不是按当前规划直接交给 SubAgent。

> **建议：先修订 03_tech_plan.md §3 / §4，添加上述 P0 修复要求，再执行 04_implementation_plan.md 的 T1~T13。修订工作约 30 分钟，可避免实施完毕后再返工的更大成本。**
