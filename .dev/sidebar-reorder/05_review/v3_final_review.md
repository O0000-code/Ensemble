# V3 终审报告 — 合并五维度（design / animation / architecture / regression / feasibility）

> **评审对象**：V3 修订版 `02_design_spec.md` + `03_tech_plan.md` + `04_implementation_plan.md`
> **评审基线**：V2 三份评审 `v2_01_design_re_review.md`(8.7)、`v2_02_architecture_regression_re_review.md`(架构 8.6 / 回归 8.7)、`v2_03_animation_re_review.md`(6.0)
> **评审者**：合并 V3 终审官
> **评审时间**：2026-05-03
> **一手验证**：dnd-kit v6.3.1 / sortable v10 / modifiers v9 类型与源码（npm registry）+ Python cubic-bezier 数值复现

---

## 0. 总评

| 维度 | V2 评分 | V3 评分 | Δ | 是否 10/10 |
|---|---|---|---|---|
| **Design** | 8.7 | **9.7** | +1.0 | 否（仍有 1 项 P1 残留） |
| **Animation** | 6.0 | **9.0** | +3.0 | 否（cubic-bezier 路径已对，spring 路径仅"形态相近"措辞需轻微 acknowledge）|
| **Architecture** | 8.6 | **9.7** | +1.1 | 否（§3.2 残留 todo!() 文档 P2，§11 transition 注入 P1）|
| **Regression** | 8.7 | **9.5** | +0.8 | 否（NEW-P1-2 isSame check 未采纳；NEW-P1-3/4 task card 仍未补全）|
| **Feasibility** | — | **9.5** | — | 否（§11 transition 注入待 T8 SubAgent 验证）|
| **加权综合** | 8.0 | **9.5** | +1.5 | **否** |

**核心判断**：V3 在三个 P0 维度（design/animation/architecture）上做出实质性修复，**全部 V2 P0 已闭环**。但仍有 V2 P1 未采纳（NEW-P1-2/3/4）+ V3 自身 acknowledge 的待验证细节（§11 transition 注入）。

**这些残留问题均非 P0 阻断点**，但严格按照本次评审强制规则"只要存在 P0 才能 ≤ 8；10/10 必须真的 10/10"，9.5 是诚实评分。

---

## 1. 评审重点逐项验证

### 1.1 Animation P0 — spring 等价"声明撤销"

**V3 §2.4 实际措辞**（line 117-118）：
> 本项目**实施层用 cubic-bezier**（dnd-kit + CSS transition）。spring 数值仅作"**形态相近的备选**"参考，**不强求精确等价**。如未来切换到 motion 库实施，需重新设计动画曲线。

**§2.4 表格下方注**（line 132）：
> motion `{stiffness: 500, damping: 40}` ... settle ~226ms 但**前段比 cubic-bezier 慢**

**§2.7 cancel**（line 205）：
> spring 数值（如未来切 motion）：`{ stiffness: 280, damping: 32, mass: 1 }`（ζ≈0.96，settle ~280ms，**形态相近，非数值等价**）

**评审判断**：
- ✅ V3 撤销了"等价"声称，明确两种曲线族**不可数值等价**
- ✅ 主路径绑定到 cubic-bezier，避免团队认知污染
- ✅ 诚实承认"前段比 cubic-bezier 慢" — V2 评审者最担心的"伪等价掩盖物理事实"风险消除

**轻微残留**："形态相近的备选"还是给读者保留了"可以替换实施"的暗示。最严格的写法是"如未来切换到 motion 库，**必须重新设计曲线**——以下数值仅作历史参考"。但这是表述偏好问题，**不是 P0**。

**结论**：✅ **P0 修复**

---

### 1.2 Animation P0 — Lift 拉离段曲线分离

**V3 §2.1 实际措辞**（line 62-64）：
| 吸盘段 timing | `cubic-bezier(0, 0, 0.2, 1)`（ease-out 标准，**无 overshoot**）|
| 拉离段 scale timing | `cubic-bezier(0, 0, 0.2, 1)`（ease-out 标准，**无 undershoot**）|
| 拉离段 opacity timing | `linear`（连续淡出，避免曲线引起负值）|

**Python 数值验证**（一手）：
```
cubic-bezier(0, 0, 0.2, 1) 在 [0,1]:
  Min y diff: 0.000003 (monotonic non-decreasing)
  Max y: 1.000000
  Min y: 0.000000
  全程在 [0,1] 内
```

**评审判断**：
- ✅ 拉离段 scale 1.04 → 1.0 用 monotonic 曲线，**无 0.9986 undershoot**
- ✅ opacity 1.0 → 0 用 linear，**无 -3.4% 负值**
- ✅ 吸盘段 0–80ms scale 1.0 → 1.04 也用 monotonic 曲线，**无虚假 overshoot 声称**
- ✅ V3 §2.1 line 69-70 说明保留 overshoot 曲线在 cancel 中（理由：cancel 是大幅位移能体现）— 一致而非随意

**结论**：✅ **P0 修复**

---

### 1.3 Animation P0 — 拉离段主视觉切换

**V3 §2.1 实际措辞**（line 56-60）：
| Stage 1: 吸盘 0–80ms | **行内 DOM 元素**（DragOverlay 还**未挂载**） | scale 1.0 → 1.04（ease-out），opacity 保持 1.0 |
| 过渡瞬间 t=80ms | DragOverlay 挂载 + 行内 DOM 准备消失 | DragOverlay 在指针位置以 scale 1.05 + opacity 0 出现 |
| Stage 2: 拉离 80–200ms | **DragOverlay 接管**（行内 DOM 在 ≤ 16ms 内 fade 到 0）| 行内：scale 1.04 → 1.0，opacity 1.0 → 0；DragOverlay：scale 1.05 → 1.03，opacity 0 → 0.95 |

**§2.1 line 70 关键修复说明**：
> 主视觉元素切换：行内 DOM 与 DragOverlay 不会同时存在 visible 状态。t=80 是切换瞬间，行内瞬时（≤16ms 即 1 frame）淡出，DragOverlay 接力。这避免了 V2 表头"原位 1.0→1.04→1.0"看起来与"原位 opacity → 0"自相矛盾。

**评审判断**：
- ✅ 第 1 列从"原位"改为"主视觉元素" — 语义清晰
- ✅ 拆分明确：吸盘段 = 行内 DOM 单独主视觉；拉离段 = DragOverlay 接管 + 行内 16ms 内 fade 0
- ✅ V3 自己在 line 70 明确解释"为什么这样写不再矛盾" — 作为 Decisional 文档对工程师的指导明确

**结论**：✅ **P0 修复（D-NEW-P0-A 闭环）**

---

### 1.4 Design P0 — 磁吸-settle 衔接

**V3 §2.6 实际措辞**（line 160-178）：
```
const delta = |finalRect.center - DragOverlayRect.center|  // px
let settleDuration: number;
if (delta < 4) {
  settleDuration = 0;  // 跳过
} else {
  settleDuration = Math.min(280, 120 + delta * 0.5);
}
```

| 属性 | 值 |
|---|---|
| DragOverlay 滑向最终位置 | `{ duration: settleDuration, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }`；当 `settleDuration === 0` 时 dropAnimation 设为 `null` |
| 总 settle 时长 | **0ms（已磁吸） / 120-280ms（按距离）** |

**评审判断**：
- ✅ 距离 < 4px 跳过 dropAnimation，避免"磁吸完成→settle 空跑"双段机械感
- ✅ 距离 ≥ 4px 用 distance-aware 公式，避免"5px 距离也跑 220ms"拖泥带水
- ✅ 公式封顶 280ms，不会无限增长
- ✅ §6.1 第 4 项 acceptance 与 §2.6 完全对齐（验证：见下文 1.5）

**结论**：✅ **P0 修复（D-NEW-P0-B 闭环）**

---

### 1.5 Design P1 — Settle distance-aware 公式一致性

**V3 §2.6 line 165-172 公式** 与 **§6.1 第 4 项 acceptance line 404-406**：

§2.6:
```
if (delta < 4) settleDuration = 0;
else settleDuration = Math.min(280, 120 + delta * 0.5);
```

§6.1 第 4 项:
- distance < 4px → settle 瞬时（0ms，磁吸已对齐）
- distance ≥ 4px → settle = `min(280, 120 + delta × 0.5)`，无可见 overshoot

**完全一致** ✅。这是 V2 评审 D-P0-4 残留问题的最后闭环。

**结论**：✅ **P1 修复**

---

### 1.6 Animation P1 — Cancel 撤销虚假 spring overshoot

**V3 §2.7 实际措辞**（line 196-205）：
> V2 声称 spring `{280, 32}` 有 ~0.5% overshoot 实测仅 0.0035%（不可感知）。V3 改为诚实表述：cancel 用 cubic-bezier `(0.32, 0.72, 0, 1)` 做"减速回弹"视觉印象（项目 `--ease-drag-cancel` token），形态接近物理弹性而无 overshoot 数值依赖。

**Python 验证**（一手）：
```
cubic-bezier(0.32, 0.72, 0, 1):
  Min y diff: 0.000001 (monotonic non-decreasing)
  Max y: 1.000000  Min y: 0.000000
  样本: u=0.1 → 0.20, u=0.3 → 0.53, u=0.5 → 0.77, u=0.9 → 0.99
  形态：开局加速 → 中段最快 → 后段减速（"减速回弹"视觉印象）
```

**评审判断**：
- ✅ V3 撤销了 V2 的"~0.5% overshoot 橡皮筋感"虚假声称
- ✅ 改用 cubic-bezier，不依赖 overshoot 数值
- ✅ 曲线 monotonic 无 negative；前快后慢符合"减速回弹"语义

**结论**：✅ **A-P1 修复**

---

### 1.7 Architecture P0 — Modifiers 重新组织

**V3 §7 实际措辞**（line 565-622）：
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  modifiers={[snapModifier]}  // V3 — 仅 snap，不再用 axis lock
  ...
>
  <SortableContext items={...} strategy={verticalListSortingStrategy}>
    ...
  </SortableContext>
  
  <DragOverlay
    modifiers={[restrictToWindowEdges]}  // V3 — 显式
    dropAnimation={dropAnimationConfig}
  >
    {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
  </DragOverlay>
</DndContext>
```

**dnd-kit v6.3.1 类型与源码验证**（一手 — `/tmp/dnd-kit-check/package/dist/`）：

1. **DndContext modifiers 通过 ActiveDraggableContext 传给 SortableItem 与 DragOverlay**（`core.esm.js:2959 applyModifiers(modifiers, ...)`）
2. **DragOverlay 在 `core.esm.js:3925` 又应用一次自己的 modifiers**：
   ```js
   const modifiedTransform = applyModifiers(modifiers, {
     activatorEvent, active, activeNodeRect, containerNodeRect,
     draggingNodeRect: dragOverlay.rect, over, overlayNodeRect: dragOverlay.rect,
     scrollableAncestors, scrollableAncestorRects, transform, windowRect
   });
   ```
3. **`restrictToWindowEdges` 实现**（`modifiers.esm.js`）：用 `windowRect`，不依赖 parent，**保证不出窗口**
4. **删除 `restrictToVerticalAxis` 后，cascade 让位仍只 Y 轴** —— 由 `verticalListSortingStrategy` 内置约束（不依赖 modifier）

**评审判断**：
- ✅ 真正解决 V2 P0-A4 残留：DragOverlay 跟手不再被 X=0 卡住
- ✅ snapModifier 仍在 DndContext 上 → 同时影响 SortableItem 让位 transform 与 DragOverlay 跟手 — **设计意图：磁吸时 cascade 也对齐**
- ✅ `restrictToWindowEdges` 在 DragOverlay 上独立约束 — 防止用户拖出窗口外丢失视觉

**Categories 横向跟手能力验证**：
- 删除 `restrictToVerticalAxis` 后，DragOverlay 可横向移出 sidebar（如拖到主区域）
- §2.7 已规定"持续在非法区 → cursor not-allowed + opacity 0.5"，行为有定义
- ✅ 这是设计意图（macOS Finder 风格自由跟手）

**结论**：✅ **NEW-P0-1 修复**

---

### 1.8 Architecture P0 — CSS token 补齐

**V3 §10 实际措辞**（line 768-775）：
```css
:root {
  ...
  --duration-drag-indicator-fade: 100ms;
  --duration-drag-indicator-move: 150ms;
}
```

**§10 line 818-819 引用**：
```css
.drop-indicator-h {
  ...
  transition: opacity var(--duration-drag-indicator-fade) ease-out,
              transform var(--duration-drag-indicator-move) var(--ease-drag);
}
```

**评审判断**：
- ✅ token 已在 :root 段定义
- ✅ .drop-indicator-h/v 引用一致
- ✅ V2 NEW-P0-2 闭环

**结论**：✅ **NEW-P0-2 修复**

---

## 2. V3 引入的新风险与残留问题

### 2.1 dropAnimationConfig React state timing — ✅ 验证安全

**V3 §7.2** 用 React state 在 onDragEnd 里 `setDropAnimationConfig(...)` 后，DragOverlay 在 unmount 时读到最新值。

**dnd-kit v6.3.1 源码验证**（`core.esm.js`）：
1. `useDropAnimation` 用 `useEvent`（latest ref）读 config（line 3762, 3939-3943）
2. `AnimationManager` 通过 `usePrevious + useState(clonedChildren)` 在 children 变 null 时保留旧元素一帧
3. `useIsomorphicLayoutEffect` 在 commit 后下一次 paint 之前触发 animation
4. React 18 batched updates: setActiveId(null) + setDropAnimationConfig(...) 在同一 batch → render 时两者都已 commit → useEvent 拿到最新 config

**结论**：✅ **timing 安全，无 race condition**

---

### 2.2 snapModifier 接收 over 参数 — ✅ 验证安全

**V3 §11 解构**：`{ transform, draggingNodeRect, over }`

**dnd-kit v6.3.1 类型验证**（`modifiers/types.d.ts`）：
```ts
export declare type Modifier = (args: {
  ...
  over: Over | null;
  ...
}) => Transform;
```

**`Over.rect` 类型**（`store/types.d.ts`）：
```ts
export interface Over {
  id: UniqueIdentifier;
  rect: ClientRect;  // 注意：非 nullable
  disabled: boolean;
  data: DataRef;
}
```

**评审判断**：
- ✅ over 参数确实在 ModifierArguments 中
- ✅ V2 NEW-P1-1 旧版的 `droppableContainers` 解构错误已删除
- ⚠️ V3 §11 line 868 `if (!overRect) return transform;` 是冗余防御（`over.rect` 不 nullable）— 不引发错误，仅多一行无害代码 — **P3 微小改进**

**结论**：✅ **类型与运行时均正确**

---

### 2.3 §11 snapModifier 12px 突变的 transition 注入 — ⚠️ P1 残留

**V3 §11 line 891-896 给的 CSS**：
```css
[data-dnd-kit-overlay] {
  transition: transform var(--duration-drag-snap) var(--ease-drag);
}
```

**dnd-kit v6.3.1 源码验证**（`core.esm.js:3640-3676` PositionedOverlay）：
- DragOverlay 默认 `transition: undefined`（mouse 时无 transition；keyboard 时 `transform 250ms ease`）
- **dnd-kit 不自动添加 `data-dnd-kit-overlay` attribute** — V3 给的选择器不会匹配
- 正确做法：`<DragOverlay transition="transform 80ms ...">` 或 `<DragOverlay style={{ transition: '...' }}>`

**V3 §11 line 899 已自行 acknowledge**：
> 注意：`[data-dnd-kit-overlay]` 是假设性选择器；实际需用 dnd-kit DragOverlay 渲染元素的 className 或 `<DragOverlay style={{ transition: ... }}>` 内联样式注入。**具体实现 T8 SubAgent 验证**。

**评审判断**：
- spec 已明确"待 T8 验证" — 不是 P0 阻断
- 但**如果 T8 SubAgent 没正确注入 transition**，snapModifier 12px 突变会瞬间跳，体验差
- 影响：磁吸视觉感受降级（从"平滑吸附"变"瞬间对齐"）

**严重程度**：P1 — 不阻断实施，但 T8 必须正确执行

**修复建议**（最小修订）：在 §11 末尾或 T8 任务卡显式给出 `<DragOverlay transition="transform 80ms cubic-bezier(0.16,1,0.3,1)">` 的实施代码，避免 SubAgent 自行摸索。

---

### 2.4 §3.2 line 135-178 残留 todo!() 错误示范代码 — ⚠️ P2 文档可读性

**V3 §3.2 仍包含**：
```rust
// line 135-178 — todo!() 占位的"错误实现"作为对比
pub fn apply_reorder<T: HasId>(items: Vec<T>, ordered_ids: &[String]) -> Vec<T> {
    ...
    let original_order: Vec<String> = by_id.keys().cloned().collect();
    // BUT this still breaks; we need original Vec order. Refactor:
    todo!("see correct impl below")
}

// line 181-214 — 正确实现
```

**评审判断**：
- V2 评审 NEW-P2-1 已指出此问题
- V3 未处理
- SubAgent 阅读时若不读到 line 181-214 会以为最终实现是 todo!()
- 严重程度：P2 文档可读性，不阻断（T1 任务卡 line 91-95 明确指向"按 03_tech_plan §3.2 正确版本"）

**修复建议**（极简）：在 line 178 后加 `// 上面是错误示范，正确实现见下：`

---

### 2.5 V2 P1 残留未在 V3 修复 — 4 项 P1

按 V2 评审清单：

| ID | V2 P1 问题 | V3 状态 |
|---|---|---|
| **A-P1-1** | 缺 CustomKeyboardSensor，键盘 Space 在 ColorPicker 上仍触发 drag | ❌ 未补；§6 line 547 仍写"KeyboardSensor 用 dnd-kit 默认（已支持 a11y），无需自定义"|
| **A-P1-5** | onDragOver 在 !over 时无 announce | ❌ 未处理 |
| **NEW-P1-2** | stage2 IPC 成功后无条件 set 致重渲染 | ❌ 未采纳 isSame check（§4.3 line 365-370 仍直接 set）|
| **NEW-P1-3** | T1 漏要求修改 path.rs 现有 4 个 home dir 测试 | ⚠️ 部分采纳（T1 line 96 提到"需先在 path.rs 加 env override"，但未明确说"修改现有测试加 remove_var setup"）|
| **NEW-P1-4** | T3 漏列 add/update/delete × tags 4 个 mutator 都要 bump | ⚠️ 部分采纳（V3 §4.5 line 432-434 仍是简略说"每次修改 categories 都要"，T3 任务卡 line 145 仅说"对称"）|

**评审判断**：
- 这些都是 P1，不阻断 10/10 之外的"是否可实施"判断
- 但严格按"10/10 必须真的 10/10"的标准，**P1 残留意味着不能 10/10**
- NEW-P1-2 影响：成功路径 stage2 set 触发第 2 次重渲染（额外 ~5ms），实际可感知很弱 — 接近 P2
- NEW-P1-3/4 影响：SubAgent 实施时易漏 — 需要主 Agent 在 T1/T3 任务发布前手动补 prompt

**严重程度**：P1，但**不阻断实施**（可在 T1/T3 SubAgent prompt 中由主 Agent 显式补强）

---

## 3. V3 加分点（值得肯定）

1. **诚实面对 spring vs cubic-bezier 不可数值等价的物理事实** — 撤销"等价"声称是这次修订最大的智慧动作，比"再换一组 spring 参数"成熟得多
2. **Lift 拉离段曲线分离正确** — 用 monotonic 曲线 + linear 完全消除 V2 的 -3.4% opacity 负值与 0.9986 scale undershoot 物理 bug
3. **Settle distance-aware 公式是真正二次设计** — 不是简单"封顶 220ms"，而是融合了"已磁吸跳过 + 距离正比 + 280ms 封顶"三条规则，对短距离/已磁吸/长距离三种场景都有定义
4. **Modifiers 重新组织得当** — 删除 restrictToVerticalAxis（让 strategy 自然约束）+ DragOverlay 显式 modifiers，符合 dnd-kit 6 实际行为
5. **§3.1 时序图与 §2.1 主视觉元素列对齐** — V2 的"原位"语义混乱被彻底清除
6. **Revision History V2→V3 段** 列出每条 P0 的修复路径，便于追溯

---

## 4. 是否可进入实施？

### 4.1 P0 阻断点（必须修复才能实施）

**无 P0 阻断点。** V3 已闭环全部 V2 P0：
- D-NEW-P0-A（lift 表头语义）✅
- D-NEW-P0-B（磁吸-settle 衔接）✅
- A-P0-1（spring 等价）✅
- A-P0-2（拉离段 overshoot）✅
- NEW-P0-1（restrictToVerticalAxis）✅
- NEW-P0-2（CSS token）✅

### 4.2 P1 残留（建议修复，不阻断）

| 编号 | 问题 | 最小修订建议 |
|---|---|---|
| §11 transition 注入 | snapModifier 12px 突变需要 DragOverlay 显式 transition prop | T8 任务卡显式补一句"`<DragOverlay transition='transform 80ms cubic-bezier(0.16,1,0.3,1)'>`" |
| NEW-P1-2 isSame check | reorderCategories stage2 无条件 set 触发额外重渲染 | §4.3 line 365-370 加 isSame 检查（V2 评审已给完整代码） |
| NEW-P1-3 path.rs 测试 setup | T1 漏要求修改现有 4 个测试加 remove_var | T1 任务卡补 "在 path.rs 现有 4 个 get_app_data_dir 测试开头加 std::env::remove_var('ENSEMBLE_DATA_DIR')" |
| NEW-P1-4 T3 mutator 列表 | T3 漏列 8 个 mutator | T3 任务卡 line 145 替换为"显式列出：addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, reorderCategories, reorderTags 共 8 个 mutator 都需 bump 对应 version" |
| A-P1-1 KeyboardSensor | ColorPicker 上 Space 键触发 drag | T5 任务卡补"自定义 KeyboardSensor，shouldHandleEvent 同 CustomMouseSensor 检查 data-no-dnd" |
| A-P1-5 onDragOver SR | !over 时无 announce | T5 announcements.ts 补 onDragOver case |

### 4.3 P2 残留（可后修，不影响实施）

- §3.2 line 135-178 todo!() 错误示范代码可读性问题
- §11 line 868 `if (!overRect) return transform;` 冗余防御
- 其他 V2 评审 P2（init_app_data 不在 DATA_MUTEX 清单、algorithm 重复实现、tokio worker 阻塞 etc.）

### 4.4 推荐路径

1. **主 Agent 直接 patch**（约 30 分钟）：
   - 03_tech_plan §11 line 899 后加 transition 注入实施代码示例
   - 03_tech_plan §4.3 line 365-370 加 isSame check
   - 03_tech_plan §3.2 line 178 加 "// 上面是错误示范，正确实现见下："（或直接删除 line 135-178 错误示范）
   - 04_implementation_plan T1/T3/T5 任务卡补 P1 修复要求（NEW-P1-3/4 + A-P1-1/5）
2. **可跳过第四轮全量评审**，直接进入 T0 → T13b 实施
3. T13a/T13b 仍是最终质量门

---

## 5. 5 维度评分构成

### 5.1 Design：9.7 / 10

| Q | V2 | V3 | Δ |
|---|---|---|---|
| macOS 气质 | 8.5 | 9.5 | +1.0（拉离段语义清晰）|
| 物理真实感（含磁吸+settle）| 8.5 | 9.5 | +1.0（settle distance-aware 公式）|
| 克制 vs 表达力 | 9 | 9.5 | +0.5（lift 曲线分离）|
| 设计语言一致性 | 9 | 9.7 | +0.7 |
| 细节考究度 | 8 | 9.7 | +1.7（V2 新-P0-A/B 闭环）|
| 可访问性 | 8.5 | 8.5 | 0（A-P1-1/5 残留）|
| acceptance 清单 | 9 | 10 | +1（§6.1 第 4 项与 §2.6 完全一致）|
| 示意图与时序 | 8 | 9 | +1 |
| **平均** | **8.7** | **9.7** | **+1.0** |

**扣 0.3 分理由**：transition 注入细节待 T8 验证；A-P1-1/5 残留。

### 5.2 Animation：9.0 / 10

V2 6.0 → V3 9.0，**+3.0** 是本轮最大跃升。

| 维度 | V2 | V3 | 关键变化 |
|---|---|---|---|
| Spring vs cubic-bezier 等价 | 3 | **9** | 撤销"等价"声称 → 主路径绑定 cubic-bezier |
| Lift 视觉 | 5 | **9** | 拉离段曲线分离消除 -3.4% opacity 负值 |
| Cancel 反馈 | 5 | **9** | 撤销虚假 spring overshoot，改诚实 cubic-bezier |
| 时长协调 | 8 | **9.5** | settle distance-aware + 磁吸短路 |
| 物理真实感 | 7 | **9** | 磁吸 + 拉离段 |
| 数学严谨度（V2 新增维度）| 4 | **9** | Python 验证全 monotonic |
| Stagger 决策 | 9 | 9 | → |
| Drop indicator 颜色 | 8 | 8 | → |
| Cursor 切换时机 | 8 | 8 | → |
| Touch / Trackpad | 5 | 5 | → |
| 与项目曲线协调 | 5 | 5 | → |

**加权 ~9.0**。扣 1 分理由：保留"形态相近的备选" spring 数值仍可能让读者误以为可替换实施；snap-into-place 的"啪"感（V1 评审 P1）未补 spring 触感；indicator scale-x 弹出脉冲未加。

### 5.3 Architecture：9.7 / 10

V2 8.6 → V3 9.7，**+1.1**。

主要修复：
- NEW-P0-1（restrictToVerticalAxis）✅
- NEW-P0-2（CSS token）✅

残留：
- §11 transition 注入 P1
- §3.2 todo!() 文档 P2
- A-P1-1 KeyboardSensor 未补
- A-P1-5 onDragOver SR 未补

**扣 0.3 分理由**：transition 注入是 V3 spec 自己 acknowledge 待验证 — 严格说不是 spec 完整状态；A-P1-1/5 P1 未修。

### 5.4 Regression：9.5 / 10

V2 8.7 → V3 9.5，**+0.8**。

V2 R-P0-1/2/3 全部已修，V3 没引入新的回归风险。

残留：
- NEW-P1-2（stage2 重渲染）— 未采纳 isSame check
- NEW-P1-3（path.rs 测试 setup）— 部分采纳
- NEW-P1-4（T3 mutator 列表）— 部分采纳

**扣 0.5 分理由**：3 个 P1 未完全采纳，理论上可能导致 SubAgent 实施时漏 bump version 或写出过时测试。

### 5.5 Feasibility：9.5 / 10

技术可行性已通过本评审一手验证：
- ✅ dnd-kit v6.3.1 Modifier API 与 V3 §11 解构匹配
- ✅ DragOverlay dropAnimation React state 与 useEvent latest ref 兼容
- ✅ restrictToWindowEdges 在 DragOverlay 上有效
- ✅ apply_reorder pure function 实现正确（HashMap 迭代序问题已通过 original_order Vec 解决）
- ✅ DATA_MUTEX 全局锁不会死锁（单一锁、非递归）

**扣 0.5 分理由**：transition 注入细节待 T8 验证。

### 5.6 加权综合

(Design 9.7 + Animation 9.0 + Architecture 9.7 + Regression 9.5 + Feasibility 9.5) / 5 = **9.48 ≈ 9.5**

---

## 6. 最终结论

### 6.1 是否通过 10/10？

**否（9.5/10）**。

### 6.2 是否可进入实施？

**是。** 全部 V2 P0 已闭环，V3 没引入新 P0 阻断点。残留的 P1 均可：
- 由主 Agent 在 30 分钟内 patch spec/plan 完成
- 或在 SubAgent 投递时由主 Agent 在 prompt 中显式补强

### 6.3 核心判断

V3 是一次**真正的"打到底"修订**：
- 不再用"再换一组参数"绕开物理事实，而是诚实撤销错误声称
- 不再用模糊措辞掩盖语义混乱，而是清晰拆分主视觉元素
- 不再让磁吸与 settle 各跑各的，而是用 distance-aware 公式融合

V2→V3 加权评分 **+1.5**（8.0 → 9.5），是连续两轮评审中最大的单次跃升。剩余 0.5 分差距属于"P1 残留可由主 Agent 30 分钟手动补强"，**不构成实施阻断**。

**推荐**：主 Agent 完成 §6.4.4 推荐 patch 后，直接进入 T0 → T13b 实施。

---

## 7. 附录：V1/V2/V3 评分对照

| 维度 | V1 | V2 | V3 | V2→V3 Δ |
|---|---|---|---|---|
| Design | 6.8 | 8.7 | 9.7 | +1.0 |
| Animation | 4.7 | 6.0 | 9.0 | +3.0 |
| Architecture | 7.4 | 8.6 | 9.7 | +1.1 |
| Regression | 6.5 | 8.7 | 9.5 | +0.8 |
| Feasibility | — | — | 9.5 | — |
| **加权综合** | **6.4** | **8.0** | **9.5** | **+1.5** |

最大跃升：**Animation +3.0** —— "诚实撤销虚假等价 + 数学验证拉离段 monotonic" 是本次最有质量的修复。
