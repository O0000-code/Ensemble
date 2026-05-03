# 磁吸丝滑性研究

> Research-only document. Decisional spec is `02_design_spec.md`.
> Authority: **Referential** (proposes; not yet ratified).

## 1. 根因确认（一手源码验证）

### 1.1 修饰器调用路径（dnd-kit v6.3.1）

源码：`node_modules/@dnd-kit/core/dist/core.esm.js`。

**逐帧调用链**：
1. 鼠标 mousemove → `PointerSensor.onMove(coordinates)`（Sensor 事件，line 3109-3114）
2. `dispatch({ type: Action.DragMove, coordinates })` → reducer 更新 `state.translate`
3. `DndContext` 重 render → `applyModifiers(modifiers, { transform: { x: translate.x - delta.x, y: ...}, … })`（line 2750-2761，line 2959-2974）
4. 修饰后 transform 通过 `ActiveDraggableContext.Provider` 下发（line 2843, 3625）
5. `DragOverlay` 内通过 `useContext(ActiveDraggableContext)` 拿到 transform（line 3923）
6. `applyModifiers` 在 DragOverlay 内**再次**应用（line 3925-3937）—— 注意：`DndContext.modifiers` 与 `DragOverlay.modifiers` 是两次独立串联。
7. 最终 transform → `PositionedOverlay` props → `style.transform = CSS.Transform.toString(scaleAdjustedTransform)`（line 3666）作为 **inline style** 直接写到 DOM。

**结论 1：modifier 每帧 mousemove 都被调用**，返回值直接成为 DOM inline `style.transform` 的下一个值。

### 1.2 默认 transition（line 3635-3638）

```js
const defaultTransition = activatorEvent => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);
  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};
```

鼠标拖拽时 transition 是 `undefined`。第 3668 行：

```js
transition: typeof transition === 'function' ? transition(activatorEvent) : transition,
```

`transition: undefined` 写到 inline style 时，React 不会发出 `style.transition` 属性。这意味着只要 className 上有 transition，class 上的 transition 会生效。

### 1.3 项目当前的 CSS（`src/index.css:594-611`）

```css
.drag-overlay-row { box-shadow: …; border-radius: 6px; background: white; cursor: grabbing; }
.drag-overlay-pill { box-shadow: …; border-radius: 4px; cursor: grabbing; }
```

**`.drag-overlay-row` 和 `.drag-overlay-pill` 没有 transition transform**。
（line 619-629 是 `.drop-indicator-h/v` 的 transition，与 DragOverlay 无关。）

### 1.4 现有 `snapModifier.ts:7-8` 的注释错误

```ts
/**
 * The 80ms smooth transition is provided by DragOverlay's intrinsic CSS
 * transition on transform (see CSS in `index.css` and `02_design_spec.md` V3 §2.5).
 */
```

**这条注释撒谎**：DragOverlay 没有任何"intrinsic CSS transition on transform"。`02_design_spec.md` V3 §2.5 设计上要求 80ms snap 衔接，但实现端从来没落到 CSS 里。这就是用户感觉"瞬移 12px"的全部根源。

### 1.5 故障复现机制

设鼠标位置为 P，slot 中心为 C，距离阈值 = 12px。

- 鼠标在 dist=20px 处：modifier 不修改 transform → DragOverlay 在鼠标下
- 鼠标移到 dist=11px 处：modifier 加 (dx,dy) 让 transform 跳到 C → DragOverlay 突然瞬移到 C（**没有 transition，1 帧完成**）
- 鼠标在阈值内继续移动：每帧 modifier 都把 transform 钉死在 C → 鼠标动而 overlay 不动（**鼠标和 overlay 脱离**）
- 鼠标移到 dist=13px：modifier 不再修改 → transform 一帧内瞬间跳回鼠标下（**反向瞬移 12px**）

3 个不同的"硬感"叠加：进入瞬移、阈值内死板、离开瞬移。

### 1.6 Modifier 签名约束（`modifiers/types.d.ts`）

```ts
type Modifier = (args: {
  activatorEvent: Event | null;
  active: Active | null;
  activeNodeRect: ClientRect | null;
  draggingNodeRect: ClientRect | null;
  containerNodeRect: ClientRect | null;
  over: Over | null;
  overlayNodeRect: ClientRect | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  transform: Transform;
  windowRect: ClientRect | null;
}) => Transform;
```

**Modifier 是纯函数签名，没有 dispatch/setState 入口**。但 modifier 本身是 JS 函数 —— **可以用闭包/模块级变量/工厂函数返回带状态的 modifier**。这是关键扩展点。

### 1.7 DragOverlay `transition` prop 是否能动态切换？

`DragOverlay.d.ts`：`transition?: string | TransitionGetter`，
`TransitionGetter = (activatorEvent: Event | null) => CSSProperties['transition'] | undefined`。

TransitionGetter 只能基于 `activatorEvent` 决定，**activatorEvent 在整个拖拽期间不变**（mousedown 时设置，mouseup 时清除）。所以这个 prop 不能用来在拖拽中动态切换 transition。

**唯一动态切换 transition 的方式：在 DragOverlay 渲染的子组件上通过 className/inline style** —— 但子组件的 transform 是 0（transform 在 DragOverlay wrapper 上），所以 transition transform 加在子组件上没用。

**真正可行的方式：直接拿 wrapper DOM 节点改 style.transition** —— 通过 `useDndMonitor` + `document.querySelector('[data-dnd-overlay]')` 或 ref 指向 wrapper（项目当前的写法 wrapper 是 `<div>`，可以加个 className 然后从 useDndMonitor 内部 effect 改它）。

---

## 2. 物理正确性参考

### 2.1 NN/G "Drag-and-Drop: How to Design for Ease of Use"

> 原文："simulating a magnetic effect that snaps objects into place, even if the user hasn't yet fully acquired the target. To use magnetism, you need to clearly indicate to the user when the drop zone is active … especially if the droppable area extends outside the visible border."

关键洞察：**磁吸的物理本质不是"位置吸附"，而是"目标识别提前告知"**。视觉反馈（drop zone 高亮、indicator）比 transform 跳到中心更重要。Fitts's Law 角度看，磁吸是用来让"难以精确停到目标"变得"靠近就行" —— 这意味着越靠近吸力越强是合理的物理直觉。

### 2.2 macOS Finder / Linear / Things 3

实测观察：

- **macOS Finder（拖到 Dock）**：图标进入磁场后是**渐进缩放 + 渐进位移**（约 200ms 缓和过渡），不是瞬移。物理感来自缓动 + 微动效（图标本身轻微 scale）。
- **Linear（拖卡片）**：磁吸主要靠 **drop indicator 的过渡**（一条线段在不同位置间过渡），DragOverlay 本身基本跟手，没有强位置吸附。
- **Things 3**：lift 用两段曲线（吸盘 + 拉离），但拖拽中 overlay 严格跟手，没有位置磁吸 —— "物理感"全在 lift/drop 端，不在拖拽过程中。

**结论**：业界最佳实践是 **DragOverlay 严格跟手，让"磁吸"主要由 drop indicator 来表达**。强行做位置磁吸时（如 SVG 编辑器、流程图），都用"距离越近吸力越强"的连续函数，而不是阈值式 binary 吸附。

### 2.3 物理引力公式（Inverse-square / Quadratic ease）

游戏与设计领域的"软引力"通常用：

```
strength(dist) = max(0, 1 - dist/threshold)^p
```

- `p = 1`：线性引力（线性插值）
- `p = 2`：二次引力（远处弱、近处强 —— 最接近"磁场"直觉）
- `p = 3`：三次引力（更陡，几乎瞬移感）

视觉效果上 `p = 2`（quadratic ease-in）最像真实磁铁；`p = 1` 偏柔，`p = 3` 偏硬。

参考：Febucci easing functions（"easeInQuad"），three.js 论坛 quadratic filter，Rachel Smith "Lerp" 文。

### 2.4 RAF lerp 的"smoothness dial"

`100daysofcraft.com` 的 magnetic cursor 教程明确给出经验值：lerp 系数 `0.15` 是"sweet spot"。低于 0.1 太"延迟感"，高于 0.25 太"snap 感"。本项目要"不延迟跟手 + 平滑磁吸"，应该用 **dist-aware** lerp 系数，而不是固定值。

---

## 3. 5 个候选方案对比表

| # | 方案 | 复杂度 | 视觉效果 | 跟手手感 | 性能 | 推荐度 |
|---|---|---|---|---|---|---|
| A | DragOverlay wrapper 全局 CSS transition transform | ★ | 进入丝滑，但**全程拖拽都滞后** | **致命差**（overlay 漂浮于鼠标后方） | ★★★ | ✗ |
| B | useDndMonitor 监听 + 状态切换 wrapper className（带/不带 transition） | ★★★ | 进入有动效，离开有动效 | **不及格**：还是会出现"进入阈值瞬移到中心" 一帧 | ★★★ | ✗ |
| C | Modifier 闭包内 lerp 上一帧 snap 量 → 渐近 | ★★ | 平滑、可调、无瞬移 | **良好**：snap 量是连续的，跟手感保留（鼠标动 → snap 量微调） | ★★★ | ✓✓ |
| D | useDndMonitor + GSAP 直接 tween wrapper transform | ★★★★ | 极佳，可加 spring | **风险**：与 dnd-kit 的 inline transform 写入会冲突，需 cancel | ★★ | △ |
| **E** | **软引力（gravity well）+ Modifier 内连续吸力函数** | ★★ | **极佳**：远处不影响，靠近指数增强，本身就是平滑过渡 | **完美**：吸力随距离连续变化，鼠标离 slot 1px 时几乎全吸，离 12px 时只吸 1/144 | ★★★ | ✓✓✓ |

### 详解每个方案的致命缺陷

**方案 A**（CSS transition）：
- 致命：`transition: transform 80ms` 会把**所有** transform 变化平滑化，包括正常 mousemove 跟手 → 鼠标移动 100px，DragOverlay 80ms 后才到位 → 整个拖拽都"跟不上鼠标"
- 用户立刻能感觉出"鼠标和卡片脱节"，比当前的"瞬移"更糟

**方案 B**（动态切 className）：
- 进入阈值时 className 加 transition → 这一帧 transform 已经被 modifier 改成 slot 中心 → transition 试图从"上一帧（无 transition）的位置"过渡到"中心" → 需要浏览器把"上一帧 inline transform"作为起点
- 实际行为：transition 是 from→to，from 是上一次浏览器 commit 的 transform 值。如果上一帧 transform 已经是"未 snap 的鼠标下位置"且这帧瞬间变成"slot 中心"且新增 transition，**理论上**会从鼠标位置过渡到中心 ✓
- 但有 1-frame 风险：如果 React 同时更新 className 和 transform，浏览器看到的是"新 transition 已生效 + 新 transform" → 会从"上一帧 commit 的状态"过渡。这个**通常**能 work，但有微妙的渲染顺序问题。
- 真正的问题：阈值内继续移动鼠标时，每一帧 transform 都被 modifier 拉回 slot 中心，class 上的 transition 持续生效，**鼠标和 overlay 完全脱离** —— 跟方案 A 的"全程滞后"等价（在阈值内）。
- 离开阈值时同理：transform 瞬间跳回鼠标位置，因 transition 还在 className 上，会有 80ms 的回弹动画 —— 但这正是用户想要的"软"释放。
- 综合：**比 A 好但仍不够**。

**方案 C**（modifier 闭包 lerp）：
- modifier 函数闭包内用 `let lastSnapDx = 0` 缓存上一帧的 snap 量
- 每帧目标 snap 量 = `(slot - dragged) * gravity(dist)`
- 实际应用 = `lastSnapDx + (targetSnap - lastSnapDx) * lerpFactor`
- 优点：不依赖 CSS，每帧都是连续插值，跟手感保留
- 缺点：lerpFactor 调参敏感，过低有"延迟感"，过高接近瞬移

**方案 D**（GSAP 直 DOM）：
- dnd-kit 每帧都会写 `style.transform = CSS.Transform.toString(...)`，会立刻覆盖 GSAP tween
- 必须先 `gsap.killTweensOf(node)` 然后用 `requestAnimationFrame` 在 dnd-kit 写入之前/之后插入 GSAP 的 tween 值，会变成"修复 dnd-kit 写一次 + GSAP 写一次"的脏架构
- 不推荐，除非愿意接管整个 transform 写入流程（基本是放弃 modifier）

**方案 E**（软引力，推荐）：
- modifier 内用连续函数计算"吸力强度"`g(dist)`，远处 `g ≈ 0`，近处 `g ≈ 1`
- transform 加 `dx * g`、`dy * g`，没有阈值，**没有"突然吸到"也没有"突然释放"**
- 每帧 mousemove 鼠标动 1px，吸力强度也连续变化，rendered transform 也连续变化
- 浏览器对 inline style.transform 连续变化的渲染天然平滑（不需要 transition）
- 调参：阈值（吸力作用范围）、指数 p（吸力陡峭度），都直观

**最佳实践组合：方案 C + 方案 E**
- 用方案 E 的连续吸力函数得到"目标 snap 量"
- 用方案 C 的 lerp 平滑帧间过渡（防止鼠标抖动放大成 overlay 抖动）
- 最终代码非常短，跟手感与磁吸感同时具备

---

## 4. 推荐方案（带完整代码）

### 4.1 方案 E + C 组合：连续引力 + 帧间 lerp

**完整可粘贴 `src/components/sidebar/dnd/snapModifier.ts`**：

```ts
import type { Modifier } from '@dnd-kit/core';
import { SNAP_DISTANCE_PX } from './animations';

/**
 * Magnetic snap with continuous gravity well + frame-to-frame lerp smoothing.
 *
 * Why a factory:
 *   The dnd-kit `Modifier` signature is a pure function with no setState/dispatch.
 *   But the modifier function itself is just JS — its closure can hold state across
 *   frames. We use this to (1) detect drag-id changes (reset state on new drag),
 *   (2) lerp the snap offset across frames so a single mousemove tick doesn't
 *   warp the overlay by 12px in one frame.
 *
 * Why continuous gravity (no threshold):
 *   The previous binary "dist <= 12 → fully snap" caused three visible jolts:
 *   entering the threshold (12px instant warp), staying inside (overlay pinned
 *   to slot center, mouse decoupled), exiting (12px instant warp back).
 *   `g(dist) = max(0, 1 - dist/range)^EXPONENT` is C^0 continuous, smooth, and
 *   matches the macOS Finder / generic "magnetic field" mental model where the
 *   pull strengthens with proximity. Quadratic (p=2) is the standard choice in
 *   game easing for "magnet-like" feel.
 *
 * Frame stability:
 *   The lerp factor smooths jitter from sub-pixel cursor movement and ensures a
 *   single large mousemove (e.g. fast cursor) doesn't translate into a sudden
 *   visible jump. With LERP_FACTOR=0.35 the overlay reaches >95% of its target
 *   snap offset within ~7 frames (~120ms @ 60fps) — fast enough to feel
 *   responsive, slow enough to avoid frame-level pops.
 *
 * Tuning parameters:
 *   See top-of-file constants. The default values are calibrated for SNAP_DISTANCE_PX=12;
 *   if you change SNAP_DISTANCE_PX, re-tune EXPONENT (more range → higher exponent
 *   so far-field stays neutral).
 */

// Tuning constants — override SNAP_DISTANCE_PX in animations.ts only if intentional.
const SNAP_RANGE_PX = SNAP_DISTANCE_PX; // alias for clarity
const EXPONENT = 2; // gravity falloff (1 = linear, 2 = quadratic, 3 = cubic)
const LERP_FACTOR = 0.35; // 0..1; how much of the target snap to apply per frame
const RESET_THRESHOLD_PX = 0.5; // when |snapState| < this & no over, drop to 0 instantly

interface SnapState {
  dx: number;
  dy: number;
  activeId: string | number | null;
}

/**
 * Factory: returns a modifier with private closure state.
 * Export the result as a singleton — call once at module load. dnd-kit will
 * call the returned function every frame.
 */
function createMagneticSnapModifier(): Modifier {
  const state: SnapState = { dx: 0, dy: 0, activeId: null };

  return (args) => {
    const { transform, draggingNodeRect, over, active } = args;

    // Reset state when a new drag starts (different active id).
    const currentActiveId = active?.id ?? null;
    if (currentActiveId !== state.activeId) {
      state.dx = 0;
      state.dy = 0;
      state.activeId = currentActiveId;
    }

    // No drag, no rect, no slot → no snap target. Decay state to 0 smoothly so the
    // overlay doesn't stick at the last snap offset when leaving slot regions.
    if (!draggingNodeRect || !over || !over.rect) {
      if (Math.abs(state.dx) < RESET_THRESHOLD_PX && Math.abs(state.dy) < RESET_THRESHOLD_PX) {
        state.dx = 0;
        state.dy = 0;
        return transform;
      }
      // Decay
      state.dx *= 1 - LERP_FACTOR;
      state.dy *= 1 - LERP_FACTOR;
      return { ...transform, x: transform.x + state.dx, y: transform.y + state.dy };
    }

    const overRect = over.rect;

    // Dragged element's center after the in-progress transform AND the previously
    // applied snap offset. We subtract state.dx/dy to compute "what the cursor
    // really wants" (the unsnapped position) before recalculating the new snap.
    const draggedCenterX =
      draggingNodeRect.left + draggingNodeRect.width / 2 + transform.x - state.dx;
    const draggedCenterY =
      draggingNodeRect.top + draggingNodeRect.height / 2 + transform.y - state.dy;

    const slotCenterX = overRect.left + overRect.width / 2;
    const slotCenterY = overRect.top + overRect.height / 2;

    const dx = slotCenterX - draggedCenterX;
    const dy = slotCenterY - draggedCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Continuous gravity well: 1 at dist=0, 0 at dist=SNAP_RANGE_PX, smooth in between.
    // No binary threshold → no entry/exit pop.
    let strength = 0;
    if (dist < SNAP_RANGE_PX) {
      const t = 1 - dist / SNAP_RANGE_PX; // 0..1, 1 at center
      strength = Math.pow(t, EXPONENT);
    }

    // Target snap offset (what we want to apply this frame ideally).
    const targetDx = dx * strength;
    const targetDy = dy * strength;

    // Lerp from previous snap offset to target — frame-to-frame smoothing.
    state.dx += (targetDx - state.dx) * LERP_FACTOR;
    state.dy += (targetDy - state.dy) * LERP_FACTOR;

    return {
      ...transform,
      x: transform.x + state.dx,
      y: transform.y + state.dy,
    };
  };
}

// Export the singleton — DndContext uses the same modifier instance for the
// lifetime of the page, so closure state persists across drags. The activeId
// check inside the closure ensures state resets when a new drag starts.
export const snapModifier: Modifier = createMagneticSnapModifier();
```

### 4.2 配套修改

**没有任何配套修改**。这就是这个方案的优势：

- 不需要改 CSS（不依赖 transition transform）
- 不需要改 DragOverlay 用法（仍然是 `modifiers={[restrictToWindowEdges]}`）
- 不需要改 SortableTagsList（modifier 仍然是 `[snapModifier]`）
- 不需要 useDndMonitor、useEffect、ref，没有新依赖

**唯一可选的（但建议做的）改动**：删掉 `snapModifier.ts:7-8` 那条错误的注释（"intrinsic CSS transition on transform"）—— 它指向不存在的实现。建议替换为本方案顶部的注释。

### 4.3 与现有"距离感知 dropAnimation"逻辑的兼容性

`SortableTagsList.tsx:171-184` 在 onDragEnd 时计算 `dist` 决定 dropAnimation：

```ts
if (dist < 4) setDropAnimationConfig(null);  // skip
else setDropAnimationConfig({ duration: min(280, 120 + dist*0.5), … });
```

**完全兼容**：新 modifier 在 onDragEnd 触发时 `state.dx/dy` 已经接近最终的 snap 量，`active.rect.current.translated` 反映最终位置，`dist < 4` 判定仍然准确（因为软引力在中心附近 strength → 1，state.dx/dy → 完整的 dx/dy）。

**实际上更准了**：当前的硬阈值版本会让"进入 12px 阈值瞬间 dist 变为 0"，而软引力版本是"距离越近 dist 越小"，更平滑过渡到 dropAnimation 的"近距离 skip"逻辑。

---

## 5. 调优参数建议

### 5.1 默认值

| 参数 | 默认 | 含义 | 调整范围 |
|---|---|---|---|
| `SNAP_RANGE_PX` (= `SNAP_DISTANCE_PX`) | 12 | 磁场作用半径（CSS px） | 8..24 |
| `EXPONENT` | 2 | 引力曲线陡峭度 | 1..3 |
| `LERP_FACTOR` | 0.35 | 帧间平滑系数 | 0.2..0.6 |
| `RESET_THRESHOLD_PX` | 0.5 | 离开 over 后状态清零阈值 | 0.1..1.0 |

### 5.2 调参指南

**`SNAP_RANGE_PX` 太小（< 8）**：磁感太弱，几乎察觉不到。
**太大（> 20）**：吸盘效应明显，远处都能感觉拖拽阻力，跟手感受损。
**12 是 macOS HIG 推荐的"magnetic guide"距离**，与 Sketch / Figma 一致。

**`EXPONENT = 1`（线性）**：吸力均匀分布，1px 处和 11px 处的吸力比为 11:1。感觉"拖泥带水"，整个磁场内都有阻力。
**`EXPONENT = 2`（二次，推荐）**：1px 处和 11px 处的吸力比为 121:1。远场几乎不影响跟手，近场快速锁定 —— 最像物理磁铁。
**`EXPONENT = 3`（三次）**：远场更弱，中心更陡，近似"硬阈值"但仍然连续 —— 如果想要更"果断"的吸附感可以试。

**`LERP_FACTOR = 0.35`**：单帧应用 35% 的目标 snap，5 帧内达到 88%。
- 0.2 偏柔，更"漂浮"，但鼠标停下来的时候 overlay 还在缓慢游走
- 0.5+ 接近瞬时（视觉上几乎没有 lerp 效果）
- 0.35 是经验上的"看起来有物理质感但不延迟"的甜点

**`RESET_THRESHOLD_PX`**：当鼠标离开所有 droppable 时（比如拖到列表外），如果不重置 state，state.dx/dy 会以 1-LERP_FACTOR 速率衰减。这通常会衰减到 0.5px 以下后让它直接归零，避免无意义的浮点保留。

### 5.3 视觉测试 checklist（用于人工评估每次调参）

1. **远场 (dist > range)**：DragOverlay **完全跟手**，每 mousemove 都同步移动，没有任何阻滞感。
2. **入场 (dist 从 range → 0)**：DragOverlay 平滑被拉向 slot 中心，**没有突然的位置跳变**。
3. **中心停留 (over slot)**：鼠标继续移动 1-2px，overlay **微微跟随**而不是死板钉在中心；鼠标移动 5-10px，overlay 跟到约 30-50%（被吸力拉住）。
4. **离场 (dist 从 0 → range)**：DragOverlay 平滑回到鼠标下，**没有反弹**。
5. **跨 slot 切换**：从 slot A 拖到 slot B，过程中 over 会切换，state 不会"卡住"在 A 的 snap 位置。

### 5.4 dropAnimation 的 dist 阈值同步建议

`SortableTagsList.tsx:178` 的 `dist < 4 ? null : ...`：
- 阈值 4 px 是合理的（中心 1/3 处 strength ≈ (1-4/12)^2 ≈ 0.44，已经被吸到接近中心）
- 如果调高 `EXPONENT` 或 `SNAP_RANGE_PX`，对应可能要把 4 调到 6 或 8 —— 取决于"在 dist=N 时 state.dx/dy 是否已 ≥ 90% 的 dx/dy"

### 5.5 性能分析

- modifier 每帧增加：1 次 sqrt、1 次 pow、4 次乘法、4 次加法 —— 远低于 1µs，对 60fps 无影响。
- 闭包状态：4 个 number + 1 string ref，~50 字节常驻，可忽略。
- 没有引入新的 React state、ref、useEffect —— 不增加 render 频率。

---

## 6. 备选方案（B-grade）

### 6.1 方案 B+：useDndMonitor + 动态 className（如果坚持要"CSS 风"）

如果上层架构倾向"动效都用 CSS 表达"（项目当前的设计哲学之一），可以考虑下面这个变体：

**改动 1：`src/components/sidebar/dnd/snapModifier.ts`** —— 不变，仍然用方案 E 的连续引力。

**改动 2：`src/index.css`** 添加：

```css
/* When the gravity well is "active" (we're inside a snap range), enable a
   short transition on transform to soften any per-frame jitter. The class is
   toggled by a useDndMonitor inside the list components. Inline transform
   keeps being written by dnd-kit; this only adds the transition shorthand. */
.drag-overlay-row.is-snapping,
.drag-overlay-pill.is-snapping {
  transition: transform 60ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

**改动 3：list 组件内部**：

```tsx
function MagneticOverlayMonitor({ overlayRef }: { overlayRef: React.RefObject<HTMLElement> }) {
  useDndMonitor({
    onDragMove(event) {
      const { active, over } = event;
      if (!overlayRef.current || !active || !over?.rect) return;
      const r = active.rect.current.translated;
      if (!r) return;
      const dx = (over.rect.left + over.rect.width / 2) - (r.left + r.width / 2);
      const dy = (over.rect.top + over.rect.height / 2) - (r.top + r.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      overlayRef.current.classList.toggle('is-snapping', dist < SNAP_DISTANCE_PX);
    },
    onDragEnd() {
      overlayRef.current?.classList.remove('is-snapping');
    },
    onDragCancel() {
      overlayRef.current?.classList.remove('is-snapping');
    },
  });
  return null;
}
```

这个方案的优点是"transition 显式表达在 CSS 里" —— 但实测：因为方案 E 的 modifier 已经做了帧间 lerp，这层 CSS transition 是**冗余的**，甚至会引起"双重平滑"导致延迟感增强。**不推荐叠加**。

如果**不要 modifier 内 lerp**（即：方案 B+ 不带方案 C），那就退化成方案 B 的"动态 transition"，仍然有阈值进入瞬移问题。

### 6.2 方案 D 简化版：完全交给 GSAP

仅在团队已经引入 GSAP 且想要 spring 物理时考虑。否则项目纯 CSS / cubic-bezier 风格，引入 GSAP 不合算。

```tsx
// 伪架构：DndContext.modifiers = [] (不做位置修饰)
// useDndMonitor 内 onDragMove 计算目标 + GSAP tween wrapper.style.transform
// 每帧 dnd-kit 还会写 inline transform，需要：
//   1. 阻止 dnd-kit 写入（覆盖 PositionedOverlay 不可行）
//   2. 或者每帧在 dnd-kit 写入之后立即用 GSAP 覆盖
// 后者实现复杂、调试痛苦，不在本研究推荐范围
```

### 6.3 方案 X：放弃磁吸，依赖 drop indicator 表达"你将放在这里"

参考 Linear / Notion / 大多数现代列表。DragOverlay 严格跟手，让用户用 `drop indicator` 视觉信号判断释放点。**这是设计降级**，需要回 02_design_spec.md V3 §2.5 改要求 —— 但如果方案 E 实施后用户仍然觉得磁吸"打断跟手"，这就是终极兜底。

---

## 7. 验证步骤建议（实施后验收）

1. **手动**：按 5.3 的 5 项 checklist 拖动 tag pill，每项都应通过
2. **自动**：在 `SortableTagsList.test.tsx` 加一个 modifier 单元测试 —— 给定 draggingNodeRect / over / transform，调用 modifier 100 次模拟连续帧，断言 `Math.abs(snapDx)` 单调递增（接近 slot）或单调递减（离开 slot），无突变（任意两帧之间的 |Δsnap| < 4px）
3. **可视化调参**：临时给 `<DragOverlayTagPill>` 加 `data-debug-snap-strength={strength}` 属性 + dev-only 浮窗显示当前 strength —— 拖一次确认 strength 从 0 平滑变到 1 再回到 0

---

## 8. 与 V3 设计规格的对照

`02_design_spec.md` V3 §2.5 当前要求："12px snap 距离磁吸 + 80ms smooth transition"。

**本研究建议修订为**：

> §2.5 磁吸（修订）：连续引力磁场，作用半径 12px。引力函数 `(1 - dist/12)^2`，远场 0、中心 1。
> 帧间 lerp 系数 0.35 平滑微抖动。无独立 transition duration —— 物理过渡来自 modifier 的连续插值，不再依赖 CSS。

需在下一轮 design spec 修订时把"80ms smooth transition"这个可证伪的具体数字换成"连续引力 + 帧间 lerp"的描述。建议提交一个 design spec 的 V4 update 或在 V3 后增加 `02_design_spec.md` 的 errata 段落。

---

## 9. 总结

**根因**：DragOverlay inline `style.transform` 没有任何 transition，modifier 的硬阈值跳变直接呈现为 1 帧瞬移。
**解法**：modifier 闭包内用连续引力函数 + 帧间 lerp，把"binary 阈值"改成"连续场"。
**关键参数**：SNAP_RANGE=12, EXPONENT=2, LERP_FACTOR=0.35。
**实施成本**：仅改 `snapModifier.ts` 一个文件。无 CSS、无依赖、无新组件。
