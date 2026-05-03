# 05 — 实施规划可行性评审

> 评审对象：`04_implementation_plan.md`
> 评审者：工程项目落地专家（基于 03/02/00 + 实际代码全量验证）
> 评审日期：2026-05-03
> 评审基线：每个 P0 必须明示"如果不修，落地时会在哪一步失败"。
>
> 总分：**7.4 / 10**（可执行，但有 5 项 P0 必须先补；P1/P2 见 §11–12）

---

## 0. 执行摘要

`04_implementation_plan.md` 的 13 任务拆分整体合理、依赖图基本正确、退场条件清晰。但**作为"1:1 可被 SubAgent 落地"的契约**，存在 5 项必须先补的 P0 漏洞——任何一项不补都会在指定 Phase 直接失败：

1. **T6/T7 在 Phase 3 起步时缺少"必读文档清单"** → SubAgent 不会主动读 02/03，会按 dnd-kit 默认风格做出错的视觉
2. **T8 显式依赖 T5 的 `makeAnnouncements` / `CustomMouseSensor`，依赖图却只标 `T6`** → 串行投递时若按图执行，T8 与 T5 的产出可能被错看为 unrelated
3. **T1 的 `data.rs` test mod 缺少"测试结构"基线**：现有 `data.rs` 没有 `#[cfg(test)]` mod；测试代码会因缺少 `read_app_data` mock / fixture path 而无法运行
4. **T10/T11 没有处理 SidebarProps 类型扩展的 fan-out**：新增 3 个 prop 后，所有 Sidebar 调用方（目前只 1 个 = MainLayout）+ Sidebar 单元测试 + 类型导出都要同步，否则 `tsc --noEmit` 会红
5. **T13 假设主 Agent 能跑 `npm run tauri dev`**，但实际 dev server 启动后无法在无 GUI Bash 环境验证 acceptance；需要明确"主 Agent 启动 dev server 后向用户反映视觉验证需求"的契约

其余维度评分：

| 维度 | 分 | 关键缺陷 |
|---|---|---|
| 1. 任务粒度 | 8 | T10 偏大；T6+T7 可拆但不必拆 |
| 2. 依赖关系 | 6 | T8 ↔ T5、T9 ↔ T5、T11 ↔ Sidebar props 三处依赖未在依赖图标注 |
| 3. 可验证性 | 7 | T13 16 项 acceptance 充分；但前 12 个任务的"验证"过于单一（只有 tsc + cargo） |
| 4. 关键漏项 | 5 | git branch/commit 策略缺失；docs/ 与 CHANGELOG 未提；index.ts 导出未更新；Sidebar 单元测试与 snapshot 未提 |
| 5. 风险登记 | 8 | 11 项覆盖较全；遗漏 2 项（见 §6） |
| 6. 退场条件 | 9 | 7 项明确客观，几乎完美 |
| 7. 投递可行性 | 7 | T2-T5 并行有 1 项隐藏依赖；每个任务的"必读上下文清单"完全缺失 |
| 8. 灰盒/dev server | 5 | 主 Agent 自验环节未规划工具与回路 |
| 9. 异常路径 | 5 | T6→T7→...→T11 失败时回退路径未定义 |
| 10. 时间估算 | — | 未要求量化 |

---

## 1. P0 — 不修就落地失败的问题

### P0-1. T6/T7 缺少"必读文档清单"，SubAgent 不会主动读 02/03

**位置**：`04_implementation_plan.md` §2 T6 / T7 "实现要求" 段

**问题**：T6 / T7 的"实现要求"只引用 `03_tech_plan.md §8`，但**没有明示 SubAgent 必须先完整阅读 `02_design_spec.md` 以理解视觉规格**。SubAgent 默认只看 §8 的代码片段（即 `useSortable` 配置示例），就会写出符合 dnd-kit 默认行为但不符合规格的实现：

- DragOverlay 的 `box-shadow` 会用 dnd-kit 默认（无 shadow）而非规格 `0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)`
- Lift 的 opacity 0.4 / scale 1.02 这两个数值在 §8 完全没体现，只在 02 §2.1
- `cubic-bezier(0.16, 1, 0.3, 1)` 与 220ms / 240ms 两个时长，在 §8 仅暗示，权威值在 02 §2.4

**如果不修**：T6 完成、T8 集成后，进入 T13 acceptance 第 5/6/9/10 项时全部不达标（"Settle 无 overshoot""Esc 取消顺滑""单击仍 navigate""双击仍编辑"），需要返工 T6+T7+T8+T9 四个任务的视觉细节。

**修复**：在每个任务卡顶部增加「必读上下文」段：

```
**必读上下文**（按顺序读完再开工）：
1. 04_implementation_plan.md §1（本任务在依赖图中的位置）
2. 02_design_spec.md §1, §2.1-§2.5, §2.7-§2.9（本组件的视觉/手势规格）
3. 03_tech_plan.md §8（实现示例代码）
4. 03_tech_plan.md §9-§10（动画常量 + CSS 类名）
5. src/components/layout/Sidebar.tsx:294-348（要复用的现有 row JSX）
6. src/components/sidebar/dnd/animations.ts（已经被 T5 创建，本任务直接 import）
```

T2-T5 / T8-T12 同样需要补必读清单，参见 §10 的全套补丁建议。

---

### P0-2. T8 / T9 隐藏依赖 T5，依赖图未标注

**位置**：`04_implementation_plan.md` §1 ASCII 依赖图

**问题**：依赖图标注：
- T8: prerequisite = T6
- T9: prerequisite = T7

但 T8 / T9 的实现要求中显式调用：
- `accessibility.announcements: makeAnnouncements(...)` — 来自 T5 的 `dnd/announcements.ts`
- `useSensor(CustomMouseSensor, ...)` — 来自 T5 的 `dnd/CustomMouseSensor.ts`

而 §1 依赖图只画了 T8 ← T6 / T9 ← T7。如果按图严格调度，可能误以为「T5 不必先于 T8 完成」，但 T8 SubAgent 启动时 T5 产出文件可能不存在 → import 报错。

**如果不修**：T8 SubAgent 写出代码后，`tsc --noEmit` 第一时间报 `Cannot find module './dnd/CustomMouseSensor'` / `'./dnd/announcements'`。可被快速发现、但会产生一次完整的 SubAgent 返工（重新读 5 个文件 + 重写）。

**修复**：依赖图修正为：

```
Phase 3:
  T6 (← T2, T5)
  T7 (← T2, T5)
  T8 (← T6, T5)        ← 显式标 T5
  T9 (← T7, T5)        ← 显式标 T5
  T10 (← T8, T9)
  T11 (← T3, T10)
  T12 (← T11)
  T13 (← T12)
```

同时在 §5 投递策略中说明：「T6 + T7 并行投递时，必须确认 T5 已完成」。

---

### P0-3. T1 缺少"测试结构基线"，单元测试无法运行

**位置**：`04_implementation_plan.md` §2 T1 "实现要求" 第 5 条

**问题**：T1 要求"单元测试至少覆盖：basic、empty、partial、unknown-id、duplicate-id 场景"，但：

1. 现有 `src-tauri/src/commands/data.rs` **完全没有 `#[cfg(test)] mod tests` 段**；唯一的 Rust 测试在 `types.rs` 末尾（验证过 `data.scenes.is_empty()` 等）
2. `reorder_categories` 内部要走 `read_app_data() → mutate → write_app_data()` 路径，而 `read_app_data` 直接读 `~/.ensemble/data.json`（`get_data_file_path()` 返回 home 目录的真实路径，**不是 tempdir**）
3. 在 `cargo test` 环境下直接调用会污染用户真实数据；且 CI 容器无 `~/.ensemble/`

SubAgent 看到"加测试"的指令后，最可能的产出是：
- 直接在函数末尾 `cargo test` 调用，污染用户数据；或
- 写出无法运行的 mock，因为现有 `data.rs` 没有抽象 `read/write` 接口

**如果不修**：T1 验证步骤「`cd src-tauri && cargo test`」会失败；或者更糟——通过测试时静默修改了用户的 `~/.ensemble/data.json`。

**修复**：T1 实现要求要补充：

```
5b. 测试隔离方案（必须，否则会污染用户数据）：
    - 测试不能直接调用 reorder_categories（它内部走真实文件 IO）
    - 抽出纯函数 `apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T>`，
      reorder_categories 调用 apply_reorder 后再 write_app_data
    - 单元测试只测 apply_reorder（pure function），不碰文件
    - 持久化往返测试可放 #[cfg(test)] 用 tempdir + 临时设置 `ENSEMBLE_DATA_DIR` 环境变量
      （需先在 utils::get_app_data_dir 加 env override 支持）

5c. 测试场景必须断言：
    - 输出 Vec 长度 == 输入 categories 长度（确保不丢数据）
    - 输出 ids 集合 == 输入 ids 集合
    - 输出顺序匹配 orderedIds（在 orderedIds 出现的部分）
```

或者更轻量的备选：直接将 `reorder_categories` 内部解构出 `pub(crate) fn reorder_in_place(items: &mut Vec<Category>, ordered_ids: &[String])`，仅测这个内部函数。

---

### P0-4. T10/T11 改 SidebarProps 后的 fan-out 未规划

**位置**：`04_implementation_plan.md` §2 T10 / T11

**问题**：T10 要给 `SidebarProps` 新增 3 个 prop（`onReorderCategories` / `onReorderTags` / `onDragStart`），T11 要再加 1 个（`isDragging`）。但：

1. `SidebarProps` 现在是 **export 的接口**（`Sidebar.tsx:37`），任何 import 这个接口的代码都会一起改
2. 检查项目无第二处 `import.*SidebarProps`，但**未来如果有 Sidebar 单元测试**（T12 没要求 Sidebar test，但代码 review 时可能要求补），所有 prop 都得 mock
3. T10 没要求"更新 `src/components/sidebar/index.ts` 导出新增的 Sortable 组件"（现有只导出 InlineInput 两个）—— 严格来说不导出也能工作，但与项目惯例不符
4. T11 给 MainLayout 注入 `isDragging` state 后，需要把状态变化触发 Sidebar 内 Refresh 按钮 disabled 的连线写完整：
   - Sidebar 收到 `isDragging` 后 → Refresh button `disabled={isDragging}` + 视觉灰
   - 但 04 没说"如何在 Refresh button 上加 disabled 视觉"——SubAgent 默认会写 `opacity-50 cursor-not-allowed`，而项目设计 token 中无对应规格

**如果不修**：T10/T11 完成后 `tsc --noEmit` 通过，但 acceptance 13 项「Refresh 按钮在拖动期间 disabled」的视觉无明确定义，可能与项目 token 不一致；且如果用户后续再加 Sidebar 测试，会发现 prop 列表已经扩张但 fixture 未同步。

**修复**：T10 任务卡补充：

```
回归检验补充：
- SidebarProps interface 新增 3 个 prop 都要标可选（`?`），保持向后兼容
- src/components/sidebar/index.ts 导出新增组件（SortableCategoriesList 等），与现有导出风格一致
- Refresh button disabled 视觉规格（来自 02_design_spec.md §2.10 / §2.8）：
  使用现有 token —— `text-[#D4D4D8]` 已经是禁用色；额外加 `pointer-events-none` 即可
- 不要新增 opacity-50 等 ad-hoc 样式
```

T11 任务卡补充：

```
- isDragging state 由 onDragStart=true / onDragEnd=onDragCancel=false 三事件同步驱动
- 需要在 Sidebar 内通过新增 prop `isDragging?: boolean` 接收，默认 false
```

---

### P0-5. T13 主 Agent 自验回路定义缺失

**位置**：`04_implementation_plan.md` §2 T13 + §5 投递策略最后一行

**问题**：T13 第 5 步：「`npm run tauri dev` 启动 dev 模式」，第 6 步：「按 §5 16 项 acceptance 逐项手动验证」。但：

1. 主 Agent 在 SubAgent 上下文中跑 `npm run tauri dev` 是 **long-running 阻塞命令**，会启动 GUI 窗口；主 Agent 的 Bash 工具不能在 GUI 内做视觉判断
2. SubAgent 完全无法验证视觉（无 GUI、无键盘、无 VoiceOver）
3. 04 §5 写「主 Agent 自己跑（涉及 dev server 与人眼判断）」——但**没说人眼是用户的眼睛**还是主 Agent 假装有眼睛
4. 16 项 acceptance 中至少 11 项需要真人视觉判断（lift / cascade / settle / VoiceOver / reduced motion 等）

**如果不修**：T13 进入"逐项验证"环节后，主 Agent 会面临两难：要么报告"已验证"（事实上没法验证），要么停下来要求用户介入但不知道介入的具体节奏。

**修复**：T13 重构为两阶段：

```
T13a — 主 Agent 自验（自动化）
  1. npx tsc --noEmit
  2. npm run test
  3. cd src-tauri && cargo test
  4. cd src-tauri && cargo clippy -- -D warnings
  5. npm run build（确保 production bundle 成立）
  → 全绿则进入 T13b，红则回退到对应 Phase

T13b — 用户视觉 acceptance（必须用户介入）
  主 Agent 操作：
  1. 用 run_in_background=true 启动 `npm run tauri dev`
  2. 监听 dev server 输出，确认 ready
  3. 向用户呈现 02 §5 的 16 项 acceptance + 04 §2 T13 的 9 项压测
  4. 引导用户按列表逐项验证；每项验证完用户回报结果（pass/fail）
  5. 任一 fail → 主 Agent 启动定位 SubAgent，输出修复 plan
  6. 全 pass → 关闭 dev server，进入退场条件检查

  注意：主 Agent 不能假装自己看到了 GUI 行为；必须把每项验证的"判断动作"显式交给用户。
```

---

## 2. 任务粒度（评 8/10）

整体合理。13 任务都满足"单 SubAgent 可独立完成"的标准。两点细节：

**T10 偏大**：要同时改 `startDrag` + Categories 替换 + Tags 替换 + 3 个新 props + Refresh disabled 状态。建议**保持单任务但在任务卡内列出"5 步子任务清单"**让 SubAgent 按顺序做，而不是平铺所有要求。

**T6 / T7 不必合并**：虽然两者结构对称，但分别处理 1D vs 2D wrap 的细节差异是合理的。保持现状即可。

**T2 偏小**：仅仅 `npm install` 一行命令。可以考虑合并到 T3 或 T5（节省一次 SubAgent 投递成本），但保持独立也无伤大雅，规划中作为"phase 1 起手"标识反而清晰。

---

## 3. 依赖关系（评 6/10）

P0-2 已指出 T8 / T9 ↔ T5 的隐藏依赖。另外两点：

**T11 ↔ T3 的依赖时机**：04 标 T11 prerequisite = T3 + T10，正确。但 T11 调用 `useAppStore.getState().clearAllEditingStates()`，这个 method 是**已存在**的（`appStore.ts:299`），不是 T3 新增的——这一点要在 T11 任务卡明示，避免 SubAgent 误以为要新写。

**T13 ↔ T12 是 hard dependency 还是 soft dependency**？04 标 T13 ← T12，但 T12 写测试不影响 production code 的可运行性，T13 即使 T12 不完成也能进入手动验证。建议改为**软依赖**：T12 与 T13a 可并行，T12 失败时 T13a 继续，T13b 在两者都完成后启动。

无循环依赖。

---

## 4. 可验证性（评 7/10）

T13 的 16 + 9 项清单**充分**——已覆盖所有视觉、手势、a11y、edge case。但前 12 个任务的"验证"段过于单一：

- T2 验证：仅 `npm ls` + `tsc --noEmit`。**漏了**：`vite dev` 启动是否仍正常（依赖冲突）
- T3 验证：仅 `tsc --noEmit`。**漏了**：测试 store 在 isTauri()=false 时是否安全 fallback
- T4 验证：仅"浏览器中视觉无回归"。**漏了**：CSS 类名是否真的被任何组件使用（dead code 检测）
- T5 验证：完全没写。**漏**：4 个新文件应有 `tsc --noEmit` + 至少一个 import 验证
- T6/T7 验证：完全没写。**漏**：组件应能被独立 import + 至少 render 一次
- T8/T9 验证：完全没写
- T10 验证：仅 6 项"回归检验点"。**漏**：每项需要主 Agent / 用户验证的具体动作（如何打开 ColorPicker）

建议每个任务卡都加「验证」段，列出 ≥ 3 项可执行的检查（编译类 + 单元测试类 + 静态结构类）。

---

## 5. 关键漏项（评 5/10）— 规划层面遗漏

### 5.1 git branch + commit 策略未提

`AGENTS.md` 明确要求：
- 「For team or PR-based work, prefer **independent branches**; use Linear Issue's `gitBranchName` when available」
- 「PR Naming: `Fixes PER-{N}: {short description}`」

但 04 全文**没说**：
- 在哪个 branch 上工作（main 直接 commit？还是新建 `feature/sidebar-reorder` / `agent/feat/PER-N-sidebar-reorder` ？）
- commit 拆分粒度（每个任务一个 commit？每个 phase 一个？最后一次性？）
- 是否需要创建 Linear Issue（如果走 PR 流程是必要的）

**风险**：如果默认在 main 直接 commit，违反 AGENTS.md；如果一次性 commit，code review 体验极差（13 任务的 diff 全混一起）

**建议**：在 04 §1 工程总览之前加一段「Git 策略」：

```
Git 策略：
- Branch: agent/feat/sidebar-reorder（或 Linear `gitBranchName`）
- Commit 粒度：按任务分，每个 T# 一个 commit
  - 标题格式：`feat(sidebar): T1 add reorder_categories/reorder_tags Rust commands`
- T13a 通过后才允许 push；T13b 通过后才创建 PR
- PR title: `Fixes PER-{N}: Sidebar drag-to-reorder for Categories and Tags`
- PR body 链接 04 + 02 + 03 三份文档
```

### 5.2 docs/ 与 CHANGELOG.md 未更新

项目有：
- `docs/usage.md`（用户向）
- `CHANGELOG.md`（用 Keep a Changelog 格式，[Unreleased] 段是空的，等待新增条目）

04 完全没提"在 changelog 里加一条"或"在 usage.md 加一段"。新功能上线如果不写入 changelog，下个 release 的 release notes 会缺失。

**建议**：T13a 之前增加 T12.5（或 T13.0）：

```
T12.5 — 文档更新
前置：T11
输出：
  - CHANGELOG.md 在 [Unreleased] 段下新增 ### Added 子段
  - docs/usage.md 新增「Reorder categories and tags」段
内容：用一段中英对照说明"Now supports drag-and-drop reorder"
```

### 5.3 `src/components/sidebar/index.ts` 导出未提

现状（`src/components/sidebar/index.ts`）：

```ts
export { CategoryInlineInput } from './CategoryInlineInput';
export { TagInlineInput } from './TagInlineInput';
```

T6/T7/T8/T9 创建的新组件如果不在 index 导出，外部不能通过 `@/components/sidebar` 引入，必须用 deep path。**项目惯例是统一从 index 导**——T10 的 import 路径会受影响。

**修复**：T10 任务卡显式要求"同步更新 `src/components/sidebar/index.ts`"，或在 T8/T9 任务卡的输出文件里加上 `index.ts (modify)`。

### 5.4 `prefers-reduced-motion` 测试缺失

T12 测试范围未包含 reduced-motion 媒体查询的 jsdom mock。02 §2.11 把 reduced-motion 列为 acceptance 第 14 项。如果不在单元测试覆盖，只能依赖 T13b 用户手动开 reduced motion 验证——成本高且易漏。

**修复**：T12 测试范围增加 reduced-motion mock 用例。

### 5.5 SortableContext 中 Show More 按钮的 a11y 顺序

04 §2 T8 第 9 条要求「'Show X more' 按钮**不**参与 SortableContext」——逻辑正确，但**键盘 Tab 顺序**会变成：sortable_item_1 → sortable_item_9 → "Show more" → tags…。当用户用键盘移动 sortable item 到第 10 位（折叠态触发自动展开）时，焦点行为未定义。03 / 02 都没规定。

**风险等级**：低（键盘场景较少，VoiceOver 用户也少），但落地后 acceptance 第 15 项可能 fail。

**建议**：在 T8 / T9 任务卡的"关键防御"段加一条：「键盘 Pickup 后若需展开折叠态，autoExpand 后 dnd-kit 内部会重新计算 keyboard coordinates」并提供测试场景。

---

## 6. 风险登记完整性（评 8/10）

§3 风险表 11 项已覆盖大部分，但有 2 项遗漏：

**遗漏 1**：**`MainLayout` 的 `categoriesWithCounts` 与 `tagsWithCounts` 引发的 list identity 问题**

- 现状：MainLayout `useMemo` 把 `categories` 加上 `count` 字段，传 *派生数组* 给 Sidebar
- Sidebar 把它再传给 `<SortableCategoriesList categories={visibleCategories}>`
- dnd-kit 用 `categories.map(c => c.id)` 作为 SortableContext items
- **每次 skill/mcp/claudeMd 变化（如 enable / scan）都会触发 categoriesWithCounts 重算 → 新数组 reference → SortableContext items 浅比较失败 → dnd-kit 重新测量布局**
- 严重时拖动期间外部数据变化会导致 dragOverlay 跳帧

**风险等级**：中。但拖动期间 isDragging=true，按 04 已规划「Refresh disabled」可缓解大部分；自动外部更新（plugin scan / scene save）目前是用户主动触发的，拖动期间不会发生。

**建议**：在风险表追加一条，缓解为「items array 用 `useMemo([categoryIds.join(',')])` 做 stable identity」。

**遗漏 2**：**Tauri 应用关闭/最小化时拖动状态卡死**

- 用户拖动期间通过 Cmd+H 隐藏窗口 / 点 traffic light 红灯（项目已 hijack 为 hide）
- DragOverlay 仍存在但 mouse 已 release —— state 不一致
- 重新打开窗口时 isDragging 仍 true → Refresh 永久 disabled

**修复**：MainLayout 监听 `tauri://focus-out` 或 window blur 事件，强制 onDragCancel；或更轻量地，在 onMouseUp/onPointerUp 全局兜底。

---

## 7. 退场条件（评 9/10）

§4 退场条件 7 项几乎完美：

- 全是客观可判断的（unit test 全绿、clippy 无 warning、acceptance 全 ☑）
- 包含 reviewer SubAgent 审核（虽然 04 没说"哪个 SubAgent"，但意图清晰）

**唯一缺**：第 7 条「Animation reviewer SubAgent 审核通过」是主观判断，"视觉气质达标"的标准仍依赖人眼。建议改为「Animation reviewer SubAgent 用 02 §5 16 项 acceptance 中的视觉相关 11 项做 explicit checklist 审核」，给出可量化输出。

---

## 8. SubAgent 投递可行性（评 7/10）

### 8.1 T2-T5 4 个并行的真实独立性

| 任务 | 修改文件 | 独立性 |
|---|---|---|
| T2 | `package.json`, `package-lock.json` | 可独立 |
| T3 | `src/stores/appStore.ts` | 真独立（不依赖 T2 的 dnd-kit；store 不 import dnd-kit） |
| T4 | `src/index.css` | 可独立 |
| T5 | 4 新文件，**import dnd-kit** | **依赖 T2 的 npm install** |

**结论**：T5 不能与 T2 真正并行。修复方案二选一：
- (A) T2 拆为「先 npm install」串行执行，然后并行 T3+T4+T5
- (B) 把 T5 移到 Phase 3 起手位置（T6/T7 之前），与现有依赖图一致

**推荐 (A)**——更符合 04 「Phase 2 = 4 任务并行」的意图，只需把 T2 从 4 任务并行中拉出来作为 Phase 2 入口。

### 8.2 每个 SubAgent 任务说明的"必读上下文清单"完全缺失

详见 P0-1。**这是规划→落地最关键的工程性补丁**，没有它整个 13 个 SubAgent 都会按各自的"训练直觉"产出，而不是按规格产出。

### 8.3 SubAgent 模型选择

04 §5 没明示用哪个模型。Constitution 要求"除非显示指定，所有 SubAgent 使用 Opus 4.7"。建议在 §5 顶部明示：

```
所有任务均使用 Claude Opus 4.7 SubAgent（除非任务卡显式标注其他）。
```

---

## 9. 灰盒测试与 dev server（评 5/10）

详见 P0-5。补充几点：

- 主 Agent 在 macOS 本机环境可以 `run_in_background=true` 启 dev server，但**无法看屏幕**
- 用户能看；用户的反馈即是判定
- Acceptance 16 项中可半自动验证的（比如 `tsc / cargo`）已经在 T13a；剩下 11 项必须用户判定
- VoiceOver、reduced motion 系统设置切换，主 Agent 无法触发，必须用户操作

**建议补充**：T13b 任务卡里给出"验证脚本模板"，让用户复制粘贴：

```markdown
请按以下顺序逐项验证（开 dev mode 后）：

[ ] 1. 在 Categories 列表任意一行按下鼠标，移动 ≥ 4px → 出现 lift（半透明 + 轻微放大）
[ ] 2. 拖动经过其他行 → 让位 cascade 流畅，无 jank
... (16 项)

完成后回答：哪些 ☐ 未达标？
```

---

## 10. 异常路径（评 5/10）

04 几乎完全没规划异常恢复。常见场景：

| 异常 | 04 是否定义恢复路径 |
|---|---|
| T1 cargo test 失败 | 无 |
| T6 完成但 T7 失败 | 无 |
| T10 集成后 acceptance 第 5 项不达标 | 无 |
| T13 dev server 启动失败 | 无 |
| 用户中途打断 | 无 |
| 后端 reorder IPC 错误（write_app_data 失败） | **已有**：02 §2.10 + 03 §4.1 都规划了 rollback |
| dnd-kit StrictMode bug 触发 | 风险表已提，但无具体应对 |

**建议**：04 新增 §6「异常处理与回退」章节：

```
6.1 任务级失败回退矩阵
- T# 失败 → 回退到该 T 完成前的 git commit；分析失败原因；调整任务说明后重新投递
- Phase 失败 → 整个 phase 推倒，不向下传递
- T13b 用户拒绝 acceptance 项 X → 主 Agent 启动定位 SubAgent
  - 视觉问题 → 回到 T6 / T7 / T4 调整
  - 行为问题 → 回到 T8 / T9 调整
  - 集成问题 → 回到 T10 / T11 调整
- 整个项目放弃 → git reset 到 main HEAD，删除 branch

6.2 紧急 kill switch
- 任何阶段发现破坏现有功能（CRUD 不可用 / Refresh 不可用 / startDrag 失效）→ 立即停止所有 SubAgent
- 主 Agent 自检：使用 git diff 对比 main，定位破坏点
```

---

## 11. P1 — 应该修但不会致命

| ID | 问题 | 位置 | 建议 |
|---|---|---|---|
| P1-1 | T2-T5 并行投递时 T5 隐藏依赖 T2 | §1 依赖图 | T5 改为 Phase 2.5（T2 后串行） |
| P1-2 | T12 测试覆盖未包含 SortableContext disabled 状态 | T12 测试范围 | 加一条："editing/adding 模式下 useSortable disabled" |
| P1-3 | T1 测试场景描述用注释，不是实际代码 | T1 §3 | SubAgent 看到注释可能"补一下"也可能"略过"——改为 `// TODO 必须实现以下 6 个测试函数` 或直接给函数签名 |
| P1-4 | 未定义 SubAgent 失败的"重试上限" | §5 | 单任务最多重试 2 次，第 3 次升级到主 Agent 介入 |
| P1-5 | T11 的 isDragging 没规定 onDragCancel 是否清空 | T11 实现要求 | 显式："isDragging 在 onDragStart=true，onDragEnd / onDragCancel 都=false" |
| P1-6 | 04 没说在哪个 commit 测「无回归」（旧功能基线） | 整体 | 在 T0（建议增加）或 T1 起手前 fork 一个 git tag `pre-reorder`，便于回归对比 |
| P1-7 | T6 / T7 任务卡未提及 React.memo 优化 | T6 / T7 | 9 个 row 的 reorder 重渲染可能感知，建议加 React.memo + props equality |
| P1-8 | a11y 测试未包含 VoiceOver script 自动化 | T12 / T13b | macOS 有 `osascript` 可控 VoiceOver，但成本高；可降级为人工 + 4 项关键场景列表 |
| P1-9 | T2 安装命令没指定 npm vs pnpm | T2 | 项目用 npm（package-lock.json 存在），明示 `npm install`；若误用 pnpm 会破坏 lock |

---

## 12. P2 — 优化建议（不影响落地）

- **T1 的 `apply_reorder` 可设计为 generic**（同时服务 reorder_categories 和 reorder_tags），减少代码重复
- **T5 可以拆出 `DropIndicator.tsx` 作为独立组件**——但 02 §2.3 已经规定了 CSS 实现（drop-indicator-h / -v），可能不需要单独组件
- 增加一份 **「视觉气质 reference」截图清单**：Linear / Things / Notion / Apple Notes 的 reorder 视频截图，给 T13b 用户对照
- **T12 加 snapshot 测试**：`SortableCategoriesList` 渲染 9 项时的 DOM 快照，便于回归
- 04 可以加 **"任务投递模板"** 章节，给主 Agent 用：

```
SubAgent 投递模板：

  Title: T<N> — <task name>
  Model: Claude Opus 4.7
  Mode: blocking
  
  必读上下文（按顺序）：
    - 04_implementation_plan.md §<本任务卡>
    - 02_design_spec.md §<相关章节>
    - 03_tech_plan.md §<相关章节>
    - <现有代码引用 line range>
    - <T# 已完成的产出文件>
  
  实现要求：
    <从任务卡复制>
  
  验证：
    <从任务卡复制>
  
  完成后输出：
    1. 修改/新增的文件清单
    2. 验证步骤的实际执行结果
    3. 任何偏离规格的决策与理由
```

---

## 13. 最终判定

**整体可执行性**：**有条件执行**。

修完 5 项 P0 后即可投递 SubAgent；不修任何一项就投递，预计在 T1（Rust 测试污染数据）、T6/T7（视觉规格不一致）、T8（依赖未就绪）、T13（自验回路缺失）四个节点会陆续踩坑，至少需要 2 轮返工。

**修补优先级**：

1. **必做（投递前）**：P0-1 / P0-2 / P0-3 / P0-4 / P0-5 + P1-1 + 5.1 git 策略
2. **应做（Phase 2 之前）**：5.2 docs/CHANGELOG + 5.3 index.ts 导出 + P1-3 / P1-5 / P1-6 / P1-9
3. **可选（Phase 3 之前）**：P1-2 / P1-4 / P1-7 / P1-8 + 6.1/6.2 异常恢复

**修补成本**：约一次主 Agent 回合（30-60 分钟阅读 + 改 04），不需要新调研。

**改完后预期评分**：**8.8 / 10**（剩余的 1.2 分扣在 T13b 用户介入环节本质上不可完全自动化，与规划质量无关）。

---

## 14. Document Authority

本评审报告为 **Referential** 级别，作为对 04 Decisional 文档的反馈意见。最终修补需用户认可后由主 Agent 落到 04，更新后的 04 仍为 Decisional。

| Level | Document | Last Modified | Purpose |
|---|---|---|---|
| Decisional | `02_design_spec.md` | 2026-05-03 | 视觉/动效规格 |
| Decisional | `03_tech_plan.md` | 2026-05-03 | 技术架构 |
| Decisional | `04_implementation_plan.md` | 2026-05-03 | 任务拆分（**待修补 5 项 P0**） |
| Referential | `00_understanding.md` | 2026-05-03 | 任务理解 |
| Referential | `01_research/*.md` | 2026-05-03 | 调研报告 |
| Referential | `05_review/05_feasibility_review.md`（本文档） | 2026-05-03 | 落地评审反馈 |

冲突解决：本文档的所有 P0/P1/P2 建议在被采纳前**不约束** SubAgent；采纳后由主 Agent 更新 04，新 04 即生效。
