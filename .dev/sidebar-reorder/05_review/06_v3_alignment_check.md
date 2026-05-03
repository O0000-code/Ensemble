# V3 对齐检查报告

> 评审目的：检查 V3 三份规划文档（02 design spec、03 tech plan、04 implementation plan）相互之间是否存在残留矛盾。  
> 评审范围：文档对齐性，不再重复 V3 final review 已覆盖的物理/数学/可行性维度。  
> 评审时间：2026-05-03。

---

## 我理解到的工作（约 420 字）

本次工作的目标，是给 Ensemble（Tauri 2 + React/TS + Rust 桌面应用）的左侧 Sidebar 中两类列表 —— 全局 Categories（1D 垂直）与全局 Tags（2D wrap）—— 增加"鼠标拖动 + 键盘可访问"的手动排序能力，要求物理感、克制、丝滑、零回归。

整套方案的脊骨是这样落下来的：**库选 dnd-kit v6.3.1**（事实标准、稳定、bundle ~20KB）；**数据模型不引入 sort_order 字段**，顺序就是 Rust `Vec<Category/Tag>` 的天然顺序，零 schema 变更；后端新增 `reorder_categories` / `reorder_tags` 两个 IPC，所有 mutating 命令通过 `static DATA_MUTEX: Mutex<()>` 串行化避免 lost update；apply_reorder 抽成 pure function 便于隔离单测，重排算法 dedupe + 未提及项按"原始 Vec 顺序"追加（不能用 HashMap 迭代，迭代序未定义）。

前端 store 用**两阶段提交**：Stage 1 同步乐观更新 + bump `categoriesVersion/tagsVersion`，Stage 2 排队 IPC，失败时按"后端 canonical → 调用时 snapshot"两级回滚；`loadCategories` 比对 version-before / version-after，version 变了则跳过 set，防 autoClassify race。

视觉规格沿用 macOS 原生气质：**两段 lift**（80ms 行内 DOM 吸盘 → t=80 切换瞬间 → 120ms DragOverlay 接管拉离），cascade 同步无 stagger 220ms，**12px 磁吸 + 80ms 平滑吸附**，settle 用 distance-aware 公式（< 4px 跳过 dropAnimation；≥ 4px = `min(280, 120 + delta × 0.5)`），cancel 280ms `cubic-bezier(0.32, 0.72, 0, 1)` 减速回弹；曲线/时长全部 token 化在 `:root`。

V3 修订的核心智慧是**诚实撤销**：撤销 spring 与 cubic-bezier 的"等价"声称（曲线族不可数值等价）、撤销虚假的 spring overshoot 数值、修复 lift 拉离段曲线引起的 -3.4% opacity 负值与 0.9986 scale undershoot；并修复 V2 把 `restrictToVerticalAxis` 放在 DndContext 上导致 DragOverlay 跟手被 X=0 卡住的 bug —— V3 改为 DndContext modifiers 仅放 snapModifier，DragOverlay 显式 `[restrictToWindowEdges]`，垂直方向约束交给 `verticalListSortingStrategy` 自然实现。实施按 13 个任务（T0 对齐 → T1 后端 → T2-T5 并行基础 → T6+T7 / T8+T9 双轮并行组件 → T10/T11 集成 → T12 测试 → T13a 自动化 → T13b 用户视觉验证 28 项）推进。

---

## 对齐检查结果

| # | 检查项 | 状态 | 备注 |
|---|---|---|---|
| 1 | 02 §6.1 acceptance ↔ 03 §10 CSS token 一一对应 | ✅ 一致 | 12px / 80ms / 220ms / 280ms / `cubic-bezier(0.32, 0.72, 0, 1)` / `--color-accent` 等指标全部在 03 §10 token 段定义 |
| 2 | 02 "两段 lift" 主视觉切换 ↔ 03 §8 SortableCategoryRow / DragOverlayCategoryRow 实现描述 | ⚠️ 轻微不一致 | 03 §8 仅有 `opacity: isDragging ? 0 : 1`（行内消失让位），无 stage 切换的精细 CSS 实施代码（吸盘段 scale 1.0→1.04、拉离段 ≤16ms fade、DragOverlay scale 1.05→1.03 等）；这些动画依赖 dnd-kit 内置 + dropAnimation 行为，spec 主导，03 缺乏配套实施细节（非阻断）|
| 3 | 02 §2.6 distance-aware dropAnimation ↔ 03 §7 onDragEnd dropAnimationConfig state | ✅ 一致 | 公式完全一致：`dist < 4 ? null : { duration: Math.min(280, 120 + dist * 0.5), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }` |
| 4 | 02 §2.5 磁吸 + 03 §11 snapModifier + 03 §10 transition CSS 闭环 | ⚠️ 轻微不一致 | snapModifier 12px 阈值、80ms 与 02 §2.5 一致；但 03 §11 line 891-896 给的 CSS 选择器 `[data-dnd-kit-overlay]` spec 自己 acknowledge 是"假设性"，需 T8 SubAgent 改为 `<DragOverlay style={{ transition: ... }}>` 注入 — V3 final review §2.3 已记录为 P1（不阻断）|
| 5 | 03 §3 Rust DATA_MUTEX + apply_reorder + reorder_categories/tags ↔ 04 T1 任务说明 | ✅ 一致 | 04 T1 的 9 项实现要求覆盖 03 §3.1-§3.5 全部内容（DATA_MUTEX、apply_reorder pure function、6 项单元测试、集成测试、并发测试、ENSEMBLE_DATA_DIR override、lib.rs 注册、返回 Vec 类型）|
| 6 | 03 §4 categoriesVersion 协议 ↔ 04 T3 任务说明 | ⚠️ 轻微不一致 | 04 T3 的 6 项实现要求与 03 §4.1-§4.5 一致；唯 04 T3 line 145 仍仅写"对称"（V3 final review NEW-P1-4 标注未显式列出 8 个 mutator 名）— 对齐性不矛盾，仅表述不充分（不阻断）|
| 7 | 04 §1 依赖图 vs 各任务"必读上下文清单" vs §5 投递策略 | ✅ 一致 | 依赖图 T6/T7 (← T2,T5)、T8 (← T6,T5)、T9 (← T7,T5)、T10 (← T8,T9) 与 §5 投递策略 T6+T7 并行、T8+T9 并行完全一致；T8 必读包含 T5 + T6 产出，T9 必读包含 T5 + T7 产出 |
| 8 | 04 T13b 28 项 acceptance ↔ 02 §6 | ❌ **阻断性矛盾** | 详见下文阻断矛盾段：T13b #4 / T13b #8 仍承袭 V2 表述，与 02 V3 §6.1 #4 / #8 直接冲突 |

**额外发现**（不在原 8 项检查范围内但不可忽略）：

| # | 额外项 | 状态 | 备注 |
|---|---|---|---|
| E1 | 04 T8 实施要求 #3-#4 modifiers 配置 ↔ 03 V3 §7 NEW-P0-1 | ❌ **阻断性矛盾** | 04 T8 line 241-242 仍写 V2 旧规："`<DragOverlay>` 不应用 modifiers" + "modifiers 数组 `[restrictToVerticalAxis, restrictToParentElement, snapModifier]`"，与 03 V3 §7 重写后的 "DndContext modifiers `[snapModifier]`、删除 restrictToVerticalAxis、DragOverlay 显式 `[restrictToWindowEdges]`" 直接相反 |
| E2 | 04 T9 实施要求 #2 modifiers 描述 ↔ 03 V3 §7.1 | ⚠️ 轻微不一致 | 04 T9 仅说"modifiers 不含 restrictToVerticalAxis"，未传达 V3 "Tags DndContext modifiers = `[snapModifier]` + DragOverlay = `[restrictToWindowEdges]`" 的完整规则 |
| E3 | 04 文档头标识 | ⚠️ 轻微不一致 | 04 整文标 "V2 评审后修订版"，但 02/03 已是 V3，且 04 内容引用 "V2 §x" 处仍多 — 标识应升级为 V3（不影响实施代码，仅文档版本一致性） |
| E4 | 03 V3 Document Authority Ranking 表（line 33-42）| ⚠️ 轻微不一致 | 表格内部仍写 "(V2)"，与文档头 V3 标识不一致 |

---

## 阻断性矛盾（共 3 项 P0）

### P0-1：04 T8 modifiers 配置直接违反 03 V3 §7 修复

**位置**：`04_implementation_plan.md` T8 任务卡 line 241-242

```text
3. <DragOverlay> 不应用 modifiers
4. modifiers 数组 [restrictToVerticalAxis, restrictToParentElement, snapModifier]
```

**冲突对象**：`03_tech_plan.md` V3 §7（line 552-622）NEW-P0-1 修复

```text
1. DndContext modifiers 设为 [snapModifier]（不再含 restrictToVerticalAxis）
2. 删除 restrictToVerticalAxis（让 verticalListSortingStrategy 自然约束方向）
3. DragOverlay 显式 modifiers = [restrictToWindowEdges]
```

**实施层后果**：T8 SubAgent 如果只读 04 T8 实施要求或将其置于 03 §7 模板之上，会在 DndContext 上加回 `restrictToVerticalAxis` —— 直接重现 V2 P0 bug：DragOverlay 跟手被卡 X=0，向右拖时贴左边。这正是 V3 修复的核心问题。

**严重性**：T8 是 Categories 1D List 配置的源头，bug 出现后会让 V3 设计的"自由跟手 + magic snap" 物理感失效。属于"按 04 写就违反 03"。

---

### P0-2：04 T13b #4 settle 描述过时

**位置**：`04_implementation_plan.md` T13b acceptance line 374

```text
4. ☐ Settle 完成 ≈ 220ms 无可见 overshoot
```

**冲突对象**：`02_design_spec.md` V3 §6.1 #4（line 404-406）

```text
4. ☐ Settle distance-aware：
    - distance < 4px → settle 瞬时（0ms，磁吸已对齐）
    - distance ≥ 4px → settle = min(280, 120 + delta × 0.5)，无可见 overshoot
```

**实施层后果**：用户在 T13b 视觉验证时按 04 清单"Settle ≈ 220ms"判定，但实际实现按 02 V3 与 03 V3 §7 onDragEnd 是 0-280ms 距离感知 —— 用户会判定"不达标"实际是 acceptance 表述过时。这会触发主 Agent 误回滚正确实现，或者主 Agent 修 acceptance 表述（应做后者）。属于"按 04 验证就违反 02"。

---

### P0-3：04 T13b #8 cancel spring overshoot 描述过时

**位置**：`04_implementation_plan.md` T13b acceptance line 378

```text
8. ☐ Cancel snap-back ≈ 280ms，spring 微 overshoot
```

**冲突对象**：`02_design_spec.md` V3 §2.7（line 196-205）+ §6.1 #8（line 410）

```text
§2.7：cancel 用 cubic-bezier (0.32, 0.72, 0, 1) 做"减速回弹"视觉印象，
       形态接近物理弹性而无 overshoot 数值依赖。
§6.1 #8：Cancel snap-back duration = 280ms ±5ms，
         曲线为 cubic-bezier(0.32, 0.72, 0, 1)（开局减速感）
```

**实施层后果**：02 V3 已经诚实撤销了 "spring 微 overshoot" 这个虚假数值（实测 0.0035% 不可感知）。用户在 T13b 验证 "spring 微 overshoot" 时会找不到这个视觉特征 —— 同上 P0-2，会触发误判。属于"按 04 验证就违反 02"。

---

## 建议（按修复优先级）

### 必须修复（解除阻断）

1. **修 04 T8 实施要求 #3-#4**（解除 P0-1）：替换为
   ```text
   3. DndContext modifiers = [snapModifier]（仅磁吸，不再用 axis lock）
   4. <DragOverlay modifiers={[restrictToWindowEdges]} dropAnimation={dropAnimationConfig}>
   5. 不使用 restrictToVerticalAxis（verticalListSortingStrategy 自然约束让位方向）
   ```

2. **修 04 T13b #4**（解除 P0-2）：替换为
   ```text
   4. ☐ Settle distance-aware：
       - distance < 4px → 瞬时（磁吸已对齐时跳过 dropAnimation）
       - distance ≥ 4px → ≈ min(280, 120 + delta × 0.5)，无可见 overshoot
   ```

3. **修 04 T13b #8**（解除 P0-3）：替换为
   ```text
   8. ☐ Cancel snap-back ≈ 280ms，曲线 cubic-bezier(0.32, 0.72, 0, 1) 开局减速感（无 overshoot）
   ```

### 强烈建议（同步修复）

4. **修 04 T9 实施要求 #2**（E2）：明确写出 "DndContext modifiers = `[snapModifier]`，DragOverlay modifiers = `[restrictToWindowEdges]`，strategy = rectSortingStrategy"

5. **修 04 T13b #2**（与 02 V3 §6.1 #2 子条件对齐）：补充 "吸盘段 ease-out scale up；拉离段 scale 无 undershoot；拉离段 opacity 单调下降无负值" 三条子验证

### 建议（文档版本一致性 — 不阻断实施）

6. **04 文档头标识升级 V3** + Revision History 加 V2→V3 段：
    - F-V3-1：T8/T9 实施要求按 03 V3 §7 重写 modifiers
    - F-V3-2：T13b acceptance #4/#8 按 02 V3 §6.1 同步 distance-aware + 撤销 spring overshoot
    - F-V3-3：补 V3 final review 中 NEW-P1-2/3/4 + A-P1-1/5 的 task-card 强化

7. **修 03 V3 §的 Document Authority Ranking 表**（E4）：把 (V2) 改为 (V3)

---

## 是否可进入 T1 实施

**NO** —— 需先修复 3 项 P0 阻断性矛盾（建议第 1-3 条）后再进入 T1。

理由：
- T1 本身不受这 3 项 P0 影响（T1 是 Rust 后端，与 modifiers / settle / cancel 无关），但 V3 final review 已通过 9.5 分判定可进入实施 —— 当时未发现 04 与 02/03 的版本错配。
- 现在发现 04 是过时 V2 内容，主 Agent 在 T8 / T13b 阶段必会撞到这 3 项矛盾。如果 T8 SubAgent 按 04 实施，V2 P0 bug 会重现，等到 T13b 用户验证才发现，需要回滚到 T8 重做 —— 远比现在 30 分钟修文档更贵。
- **强烈建议**：在主 Agent 发布 T1 SubAgent 之前，先用 30 分钟同步 patch 上述 3 项 P0 + 强烈建议 4-5 条到 04 implementation plan，然后再启动 T1。或者：T1 可与 patch 并行（T1 不读 T8 内容）。

修复完成后即可立即进入 T1。
