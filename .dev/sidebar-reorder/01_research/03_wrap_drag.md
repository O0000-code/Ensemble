# 03 — Tags 区 (2D flex-wrap) 拖拽算法与库选型

## 0. 阅读基线

本调研以 `00_understanding.md` 为输入，专注解决 Tags 区（`Sidebar.tsx:413-481`，`flex flex-wrap gap-1.5`，pill 宽度由文字决定）的"手动拖拽重排"算法与库选型，与 Categories 区（1D 等高列表）的方案分开评审。

---

## 1. 核心结论（一段）

**首选 `@dnd-kit/sortable` + `rectSortingStrategy` + `closestCenter` 碰撞检测 + `DragOverlay`**。这是当前 React 生态唯一一个为"任意 1D / 2D / wrap 流式布局"做了一阶设计的方案，作者在官方文档中明确把 `rectSortingStrategy` 标注为"默认值，适合大多数用例（包括 grid / wrap）"。Framer Motion / Motion 的 `Reorder.Group` 是 1D 优先（axis='x' / 'y'），官方 Issue #2089 已确认 2D 网格"不工作得很好"——可以拖到边角，但**无法在两个相邻 pill 之间精确插入**，与"丝滑、物理真实感"的目标不符。Pragmatic-DnD（Atlassian / Trello / Jira）虽然底层最快，但是 headless 设计，自带视觉反馈很弱（Puck 2026 评测："grid / flex 场景视觉反馈不足"），需要自己写大量"让位动画"代码——综合 ROI 不如 dnd-kit。Swapy 是 swap 模式（只交换两两位置，不是真正的 reorder/insert），不适用于 pill cloud。最终方案：dnd-kit 为骨架 + DragOverlay 渲染浮层 + 容器固定 `min-height` 防止行数突变跳动 + `MeasuringStrategy.Always` 在 useMemo 重算（因 count 变化）时自动重新测量矩形。

---

## 2. 算法选型

### 2.1 Sorting Strategy（关键）

dnd-kit 提供四种策略（[官方文档](https://dndkit.com/legacy/presets/sortable/overview)）：

| 策略 | 适用场景 | Tags 区是否合适 |
|---|---|---|
| `rectSortingStrategy` | **默认值，适合大多数（含 grid / wrap）** | **✓ 首选** |
| `verticalListSortingStrategy` | 纯垂直列表，支持虚拟化 | ✗（Tags 是 wrap，多行多列） |
| `horizontalListSortingStrategy` | 纯水平列表 | ✗ |
| `rectSwappingStrategy` | 两两交换语义（不是 reorder） | ✗（语义不符；GitHub Issue #336 还报有 grid 双动画 bug） |

**为什么 `rectSortingStrategy` 是 wrap 唯一正确解**：它逐项计算每个 sortable 元素的 `getBoundingClientRect`，根据当前 over 索引把"非自身"的元素 transform 到新坐标——不假设 1D 邻接，因此换行（item 从一行末尾跳到下一行开头）也能正确演出"让位"。`vertical/horizontal` 策略假设单轴邻居，wrap 场景下会出现 "x 不更新" 的 bug（Issue #115）。

### 2.2 Collision Detection

dnd-kit 提供四种碰撞检测：

| 算法 | 行为 | wrap pill cloud 评估 |
|---|---|---|
| `rectIntersection` | 默认；要求两矩形真正相交 | ✗ 太"严苛"，pill 间隙小（gap-1.5 = 6px），拖拽不流畅，文档明确不推荐 |
| `closestCenter` | 距离最近矩形中心 | **✓ 首选**——文档"推荐用于 sortable lists，比 rectIntersection 更宽容"；pill 中心点足够稳定 |
| `closestCorners` | 比较四角距离 | ◎ 备选——pill 高低差不大时优势不明显；尺寸差大的卡片网格更受益 |
| `pointerWithin` | 指针必须在 droppable 内 | ✗ 仅限指针传感器，键盘 a11y 失效；pill 之间空白时无 over，体验断裂 |

**结论**：`collisionDetection={closestCenter}`。

### 2.3 Reorder vs Swap 取舍

- **Reorder（插入式，dnd-kit 默认）**：拖拽中其他 pill 实时让位 → arrayMove 把元素从 oldIndex 插入到 newIndex。视觉是连续的"流动"。这是 wrap 场景的正确范式。
- **Swap（交换式，rectSwappingStrategy / swapy.js）**：仅交换两两位置。在 wrap 中导致"突变"——拖到第 5 项时第 5 项瞬间跳到第 1 项；视觉跳动严重。**不采用。**

### 2.4 Measuring Strategy

[官方 DndContext](https://dndkit.com/legacy/api-documentation/context-provider/dnd-context) 提供：
- `WhileDragging`（默认）：仅在 dragstart 后测量一次。
- `BeforeDragging`：dragstart 前后测量。
- **`Always`：拖拽前、拖拽中、拖拽后**——在 React 重渲染（如 `categoriesWithCounts` / `tagsWithCounts` 因 count 变化触发 useMemo 重算）时**自动重新测量**矩形。

**Tags 区必须用 `MeasuringStrategy.Always`**。原因：`MainLayout.tsx:86-103` 的 `tagsWithCounts` 实时统计；用户拖拽时另一个进程刷新数据（Refresh 按钮 / autoClassify）会让 tag 数组重渲染，但 ID 不变 → 矩形需要重新量。

---

## 3. 库选型

### 3.1 首选：`@dnd-kit/sortable`

**Pros**
- 唯一对 grid / wrap 一阶支持（`rectSortingStrategy`）
- 官方 collision detection 工具齐全（4 种 + composition）
- 内置键盘 a11y（`sortableKeyboardCoordinates`）+ 屏幕阅读器宣告（`accessibility.announcements`）
- `DragOverlay` 渲染浮层 → 解耦原元素的 transform，drop animation 流畅（无需手动写 FLIP）
- 4 个传感器（Pointer/Mouse/Touch/Keyboard），`activationConstraint.distance: 5` 一行解决"click 与 drag 冲突"（官方推荐做法）
- 17k★ + 12.1M 周下载，Sentry/Doist/Puck/Mintlify 在用，成熟稳定
- TypeScript 一等公民
- Bundle：core 24KB + sortable 9KB（gzip）≈ 33KB；可接受

**Cons**
- `useSortable` 内部 hook 在拖拽中导致每个 item 重渲染（GitHub Issue #994/#1379）— 50+ items 才感知，Tags 区 ≤ 30 个无感
- 多容器场景代码量大（Issue #1188）— **Tags 是单容器，不踩这坑**

### 3.2 备选 1：Motion (framer-motion) `LayoutGroup` + `motion.div layout`

**纯 FLIP 动画方案**——不用 `Reorder.Group`，自己用 `useDrag` / 鼠标事件处理拖拽，让位动画完全靠 `<motion.div layout>` 自动 FLIP。

**Pros**
- 物理真实感最强（`type:'spring'` + `stiffness/damping` 可调）
- 与项目已有动效语言（`cubic-bezier(0.34, 1.56, 0.64, 1)`）契合
- bundle 小（lazy `m` 组件 + `domAnimation` ≈ 6KB）

**Cons（致命）**
- **没有现成 sortable 抽象**——需要自己写 pointermove + 命中检测 + arrayMove + 取消逻辑
- 键盘 a11y 完全自己写
- `Reorder.Group` 不能用：[Issue #2089](https://github.com/motiondivision/motion/issues/2089) 官方确认 axis='y' 默认 1D，传 `drag` 后能 2D 拖但**无法精确插入两 pill 之间**

**结论**：仅作为"让位动画的物理曲线"灵感来源，不作为主算法。或者：**dnd-kit 控制 reorder + 把 sortable transform 替换为 motion `<motion.div layout>` 拿 spring 曲线**——可行但复杂度高于收益。

### 3.3 备选 2：Pragmatic-drag-and-drop (Atlassian)

**Pros**
- Trello / Jira / Confluence 在用，性能与可靠性顶级
- 基于浏览器原生 drag-and-drop API，bundle 极小
- 模块化（element/adapter + reorder + hitbox + react-drop-indicator）

**Cons**
- Headless 设计，自带视觉反馈非常弱（Puck 2026 评测："grid / flex 场景视觉反馈不足"）
- [Atlassian 自家的 Grid 例子](https://github.com/atlassian/pragmatic-drag-and-drop/issues/166) 由社区演示，**flicker / 闪动**问题需要自己解决
- 需要自己写"让位动画"——pragmatic 不会自动 transform 其他元素，drop indicator 是分隔条而非"流动"
- 与 Tauri 桌面 + macOS 风格不冲突，但工作量明显大于 dnd-kit

**结论**：除非 bundle 体积是硬约束（不是），否则不选。

### 3.4 不选

- **swapy.js**：swap 模式，语义不对
- **react-beautiful-dnd**：已停止维护（Atlassian 官方推 pragmatic 接替）
- **react-dnd**：HTML5 backend，无 sortable 现成抽象
- **react-grid-layout**：网格快照式，不适合 pill 流式
- **gridstack.js**：jQuery 遗产，React 集成笨重

---

## 4. 可运行代码骨架

> 仅针对 Tags wrap 区域；约 80 行；可直接替换 `Sidebar.tsx:413-481` 的 `flex flex-wrap` 块。
> 依赖：`pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

```tsx
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor,
  closestCenter, MeasuringStrategy, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, arrayMove,
  rectSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

function TagPill({ tag, isActive }: { tag: Tag; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tag.id });
  const style = {
    transform: CSS.Translate.toString(transform), // Translate, not Transform — 不挤压
    transition,
    opacity: isDragging ? 0 : 1,                  // 原元素隐身，DragOverlay 替代
  };
  return (
    <button
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      data-no-window-drag                          // 阻断 Sidebar.tsx:10 的窗口拖动
      className={`px-2.5 py-[5px] rounded text-[11px] font-medium transition-colors duration-150
        ${isActive ? 'bg-[#18181B] text-white' : 'bg-transparent text-[#52525B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'}`}
    >{tag.name}</button>
  );
}

export function TagsCloud({ tags, setTags, activeTags }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px 以下当 click
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setTags((items) => {
      const oldIdx = items.findIndex((t) => t.id === active.id);
      const newIdx = items.findIndex((t) => t.id === over.id);
      return arrayMove(items, oldIdx, newIdx); // 乐观更新；后端持久化在外层 onReorder
    });
  };
  const activeTag = activeId ? tags.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // count 变化重测
      onDragStart={handleStart}
      onDragEnd={handleEnd}
    >
      <SortableContext items={tags.map((t) => t.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-1.5" style={{ minHeight: 32 }}>
          {tags.map((tag) => (
            <TagPill key={tag.id} tag={tag} isActive={activeTags.includes(tag.id)} />
          ))}
          {/* "+N" 与 InlineInput 不放在 SortableContext.items 数组内 → 自动不参与拖拽 */}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {activeTag && (
          <div className="px-2.5 py-[5px] rounded text-[11px] font-medium bg-white text-[#52525B]
            border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-grabbing">
            {activeTag.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

**关键技术决策（写在代码注释里）**
1. `CSS.Translate.toString` 而非 `CSS.Transform.toString`——后者带 scale/rotate，会导致 pill"挤压"（[Tanstack Table 官方示例](https://tanstack.com/table/alpha/docs/framework/react/examples/column-dnd)注明）
2. `opacity: isDragging ? 0 : 1` + `<DragOverlay>` 替身渲染——drop 动画流畅、避免 z-index 与 transform 嵌套冲突（参见 Issue #1411）
3. `activationConstraint.distance: 5`——经典做法（[GitHub Discussion #476](https://github.com/clauderic/dnd-kit/discussions/476)），<5px 当 click 触发导航
4. `SortableContext.items` 只放参与拖拽的 ID——"+N" 按钮、InlineInput、Add 按钮**不放进去** → 自动不参与拖拽、不会成为 drop target，无需特殊判断
5. `data-no-window-drag` 配合 `Sidebar.tsx:10` 的 `startDrag` 判定，阻断窗口拖动手势抢占
6. 容器 `minHeight: 32`——单行 pill 高度 ≈ 22px + padding，预留 32px 防止 wrap 行数变化时容器塌缩

---

## 5. 跳动 / 边界 / 性能问题清单与缓解

| # | 风险 | 触发场景 | 缓解 |
|---|---|---|---|
| 5.1 | wrap 换行抖动 | 拖出短行 → 长行变短，剩余 pill 重排导致下一行整体上移 | 容器 `minHeight`；`rectSortingStrategy` 已经按 rect 计算，让位是连续 transform，不会 jump |
| 5.2 | flexbox "x 位置不更新" 旧 bug | flex-wrap + horizontalListSortingStrategy 时（[Issue #115](https://github.com/clauderic/dnd-kit/issues/115)） | **不要用** `horizontalListSortingStrategy`，用 `rectSortingStrategy`；本方案已规避 |
| 5.3 | "+N" / "Add" 按钮被当成 drop target | 拖到末尾按钮上"插入" | `SortableContext.items` 只含 tag.id，按钮自动不参与；本方案已规避 |
| 5.4 | InlineInput 编辑/新增态时拖动 | 拖拽节点 ID 切换破坏 dnd state | InlineInput 替换整行时 ID 仍是 tag.id，dnd-kit 通过 ID 跟踪稳定；编辑态可在 `useSortable({ id, disabled: isEditing })` 显式禁用 |
| 5.5 | count 变化触发 useMemo 重算，dnd state 撕裂 | 拖拽中 Refresh / autoClassify 改变 count | `MeasuringStrategy.Always` 自动重测；`tags` 数组**只在 onDragEnd 后** setTags（不要每次 onDragOver 改）→ 拖拽中数组稳定 |
| 5.6 | sidebar 滚动容器拖拽时跳 | sidebar 容器 overflow 滚动，拖到边界自动滚动 | dnd-kit 自带 autoScroll，可保持默认；如有问题加 `<DndContext autoScroll={false}>` |
| 5.7 | 单击 → 导航；双击 → 编辑；右键 → 菜单 | dnd 的 listeners 抢占点击 | `activationConstraint.distance: 5` 让 <5px 的位移触发 click 而非 drag（关键值，验证后可调到 4 或 6） |
| 5.8 | window drag (`Sidebar.tsx:10` 的 `startDrag`) 与 pill drag 冲突 | mousedown 同时触发两者 | 在 `startDrag` 内用 `closest('[data-no-window-drag]')` 排除；或 stopPropagation |
| 5.9 | "Show X more" 折叠态 drop target | 折叠态只显示前 10，被折叠的 tag 不在 DOM 中 | **决策（建议）**：拖拽中**不自动展开**，drop 仅在 visible 范围内重排——简单且符合直觉；用户要排末尾的话，先点 "+N" 展开 |
| 5.10 | 性能：每拖一帧所有 SortableItem 重渲染 | 50+ items 卡顿（[Issue #994](https://github.com/clauderic/dnd-kit/issues/994)/[#1379](https://github.com/clauderic/dnd-kit/issues/1379)） | Tags 通常 ≤ 30，无感；如需优化把 `<TagPill>` 内层用 `React.memo` 包裹（仅 useSortable 那一层不能 memo） |
| 5.11 | DragOverlay z-index 与传统 ContextMenu / Modal 撞车 | DragOverlay 默认 z-index 999 | `<DragOverlay zIndex={50}>` 调低；项目已有 modal 用更高层级即可 |
| 5.12 | macOS 触控板惯性手势 | 拖拽中触控板二指滚动 | dnd-kit 已处理；保持 `touch-action: none` 在 pill 上（[官方推荐](https://dndkit.com/legacy/api-documentation/sensors/pointer)） |

---

## 6. 引用源

**官方文档**
- dnd-kit Sortable preset: https://dndkit.com/legacy/presets/sortable/overview
- dnd-kit Collision Detection: https://dndkit.com/api-documentation/context-provider/collision-detection-algorithms
- dnd-kit DndContext / Layout Measuring: https://dndkit.com/legacy/api-documentation/context-provider/dnd-context
- dnd-kit DragOverlay: https://dndkit.com/legacy/api-documentation/draggable/drag-overlay
- dnd-kit Pointer Sensor: https://dndkit.com/legacy/api-documentation/sensors/pointer
- dnd-kit Accessibility: https://dndkit.com/legacy/guides/accessibility
- Motion Reorder: https://motion.dev/docs/react-reorder
- Motion LayoutGroup: https://motion.dev/docs/react-layout-group
- Motion Layout Animations: https://motion.dev/docs/react-layout-animations

**关键 GitHub Issues / Discussions**
- [dnd-kit #115] Sortable items jump in flexbox container（确认 horizontal/vertical 策略对 wrap 不友好）: https://github.com/clauderic/dnd-kit/issues/115
- [dnd-kit #336] rectSwappingStrategy grid 双动画 bug（不选 swap）: https://github.com/clauderic/dnd-kit/issues/336
- [dnd-kit #994] / [#1379] 拖拽时 sortable item 重渲染（性能讨论）
- [dnd-kit #476] 区分 click vs drag 的 activationConstraint 推荐
- [Motion #2089] Reorder.Group 2D 不可用（首选 dnd-kit 的关键证据）: https://github.com/motiondivision/motion/issues/2089

**评测与对比**
- Puck 2026 "Top 5 Drag-and-Drop Libraries for React": https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react
- Atlassian Design — Pragmatic DnD core: https://atlassian.design/components/pragmatic-drag-and-drop/core-package/
- Atlassian — The journey of pragmatic drag and drop: https://www.atlassian.com/blog/design/designed-for-delight-built-for-performance
- LogRocket — Implement pragmatic-drag-and-drop: https://blog.logrocket.com/implement-pragmatic-drag-drop-library-guide/
- DEV.to — Curious case of Drag and Drop（dnd-kit vs react-beautiful-dnd 比较）: https://dev.to/epilot/curious-case-of-drag-and-drop-16ng
- Maxime Heckel — Everything about Framer Motion layout animations: https://blog.maximeheckel.com/posts/framer-motion-layout-animations/

**项目代码定位**
- Tags 区: `src/components/layout/Sidebar.tsx:413-481`
- 数据派生: `src/components/layout/MainLayout.tsx:86-103`
- 类型: `src/types/index.ts:84-95`，`src-tauri/src/types.rs:134-149`
- 后端 IPC: `src-tauri/src/commands/data.rs`
- Window drag 起点: `src/components/layout/Sidebar.tsx:10`
