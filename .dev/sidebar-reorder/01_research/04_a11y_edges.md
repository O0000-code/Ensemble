# 04 — 可访问性、激活手势冲突与边缘案例调研

> 本调研聚焦 macOS 桌面 + Tauri 2 + React 18 场景下，"行可点击 + 行可拖拽 + 多种交互手势共存" 时不可妥协的细节。读者：实施 Sidebar reorder 的工程师与评审者。

---

## 1. 关键结论（一段总结）

针对 Ensemble 当前 Sidebar 多手势共存的现状（单击 navigate / 双击编辑 / 右键菜单 / ColorPicker 圆点 / 窗口拖动 / inline edit input），**dnd-kit (`@dnd-kit/core` + `@dnd-kit/sortable`) 的"自定义 Sensor + `data-no-dnd` 数据属性 + 分离 Mouse/Touch 双 Sensor + Keyboard Sensor"组合是当前业界唯一被验证可同时满足这五类冲突共存与 a11y 合规的方案**。激活手势上：**Mouse 用 `distance: 4-5px`（对齐 macOS HIG "3 points" 与 NSCell 经验值），Touch 用 `delay: 200ms / tolerance: 5px`（业界共识，区分 tap 与 drag）**；不要混用 PointerSensor 一个 sensor，因为 Pointer 事件在 WKWebView 下无法配合 `touchmove preventDefault` 阻止滚动，必须 `touch-action: none` 才能可靠工作，且 distance 与 delay 互斥（不能同时设置）。窗口拖动的 mousedown 与 dnd-kit 的 mousedown 都使用 React SyntheticEvent（不是 native）—两者都在 capture/bubble 同阶段触发，**可靠的隔离方式不是依赖事件顺序，而是给整个 Sidebar 列表区在 dnd-kit 拖拽生效区外加 `data-tauri-drag-region` 排除策略**：要么 sortable item 区域不参与窗口拖拽（推荐），要么自定义 Sensor 在 `shouldHandleEvent` 中通过 `data-no-dnd` 属性双向排除。键盘可访问性上，dnd-kit 自带的 `KeyboardSensor + sortableKeyboardCoordinates` 已实现 Space/Enter pickup + Arrow 移动 + Esc 取消，符合 WAI-ARIA APG Listbox/Sortable 模式，但**默认 `Announcements` 是基于 `id` 的（"Picked up draggable item cat-uuid-xxx"），必须自定义为基于 position + 名字（"Picked up Inbox at position 1 of 5"）才达到生产标准**。VoiceOver 在 macOS 上对 `<span>` wrapper live region 有已知 bug（光标错位），dnd-kit 已在内部修复，无需额外处理。状态隔离：拖拽中右键应取消（不是弹菜单），ContextMenu 应在 `onDragStart` 中关闭，路由切换需在 `onDragStart` 中阻断。数据竞态：用 `useMutation` 的乐观更新模式 + 失败回滚 + 拖拽期间禁用 Refresh 按钮。测试：单元用 vitest + @testing-library/react + dnd-kit 的 `MouseSensor` 模拟（注意 jsdom 没有 PointerEvent，必须用 MouseSensor）；e2e 在 macOS 下没有官方 tauri-driver（仅 Linux/Windows 有），但 frontend 行为可用 Playwright 在 dev server 单独跑（绕开 Tauri runtime）。

---

## 2. 激活手势：推荐配置 + ColorPicker 圆点点击隔离方案

### 2.1 macOS 原生与跨平台基线

| 来源 | 推荐阈值 | 备注 |
|---|---|---|
| Apple HIG (macOS Drag and Drop) | **3 points** | 显示 drag image 之前要求拖动 ≥ 3 points（约 3 物理像素 @1x，6 像素 @2x） |
| Classic Mac Toolbox / NSCell | **7 pixels** | "user must drag or resize a window at least seven pixels" — 但这是 1987 年的 window drag 阈值，不适用于 cell-level |
| Windows | 4 pixels (default `SM_CXDRAG`) | DragHeight/DragWidth 注册表可调 |
| dnd-kit 文档示例 | **`distance: 5`** | 官方 sortable 例子 |
| 多个生产项目（GitHub blog、Linear 风格） | **3-8px**（mouse），**200-250ms / 5px tolerance**（touch） | 经验范围 |

**结论**：Mouse 用 `distance: 4-5px`，Touch 用 `delay: 200, tolerance: 5`。Ensemble 的精确目标值：

```ts
// Mouse: 精准模式，4px 对齐 macOS Apple HIG 3pt @2x
useSensor(MouseSensor, {
  activationConstraint: { distance: 4 },
}),
// Touch: 长按模式，避免与滚动手势冲突
useSensor(TouchSensor, {
  activationConstraint: { delay: 200, tolerance: 5 },
}),
useSensor(KeyboardSensor, {
  coordinateGetter: sortableKeyboardCoordinates,
}),
```

### 2.2 PointerSensor vs Mouse + Touch 二选一的取舍

dnd-kit 文档明确指出：**"For Pointer Events, there is no way to prevent the default behaviour of the browser on touch devices when interacting with a draggable element from the pointer event listeners. Using `touch-action: none;` is the only way to reliably prevent scrolling for pointer events."**

也就是说，PointerSensor 一旦在 trackpad/触摸上启动，**用户滚动 sidebar 列表的能力必然被 `touch-action: none` 全局禁用**。Ensemble 的 Categories 默认显示 9 项，超出折叠到 "Show X more"，预期是不会出现 sidebar 内滚动场景；但如果将来 Categories 数量爆炸到几十个（用户 AI auto-classify 过度），需要保留滚动能力——这时 PointerSensor 就是死结。

**推荐使用 Mouse + Touch + Keyboard 三 Sensor 组合**，避免未来锁死。代价是代码多一行，没有功能损失。

### 2.3 distance vs delay 在"行可点击 + 行可拖拽"场景

引用 dnd-kit Discussion #476 中的实际开发者经验：

> "I have actually found that adding the **delay of 10 and tolerance of 0** actually works better than adding the distance constraint. Adding the delay means the onClick on my element is called before the pointer event and stopPropagation are called, without causing issues for the drag and drop. The distance constraint was causing issues for my drag and drop."

但这条意见有两个前提：(a) 触发 onClick 的元素与 draggable 是同一节点；(b) 用户可接受 10ms 的"按住"才生效。

**对 Ensemble 的判断**：
- Categories 行的 onClick 触发 `navigate('/category/:id')`。如果用 `distance: 4`，用户 click 时鼠标几乎不动，drag 不触发，onClick 正常执行——满足。
- 但用户如果在长列表中"用力一点"（鼠标轻微滑动），可能触发拖拽。`distance: 4` 已经是较保守的值。
- 用 `delay: 100` 也可以工作，但会让"拖拽必须先按住 100ms"，对 power user 不流畅。

**最终选 `distance: 4-5`**，更接近 macOS Finder 的体感（Finder 是立刻响应方向 + 阈值距离）。

### 2.4 ColorPicker 圆点（与其他子元素）的精准隔离：`data-no-dnd` + 自定义 Sensor

**这是核心方案**。直接给 `<ColorPicker>` 圆点容器加 `data-no-dnd`，并用自定义 Sensor 在 `shouldHandleEvent` 中检查向上冒泡到拖拽根节点的路径上**是否存在该属性**——存在则拒绝激活。

来自 Stack Overflow 78659136（多人验证可用）的标准实现：

```ts
// src/components/sidebar/customSensors.ts
import type { MouseEvent, KeyboardEvent } from 'react';
import { MouseSensor as LibMouseSensor, KeyboardSensor as LibKeyboardSensor } from '@dnd-kit/core';

function shouldHandleEvent(element: HTMLElement | null): boolean {
  let cur = element;
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }
  return true;
}

export class CustomMouseSensor extends LibMouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({ nativeEvent: event }: MouseEvent) => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

export class CustomKeyboardSensor extends LibKeyboardSensor {
  static activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: ({ nativeEvent: event }: KeyboardEvent) => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}
```

**应用到 Sidebar 的具体节点**：

```tsx
{/* Categories 行 */}
<div ref={setNodeRef} {...attributes} {...listeners}>
  {/* 圆点：拖拽不生效 */}
  <span data-no-dnd>
    <ColorPicker color={category.color} onChange={...} />
  </span>
  {/* 名字：拖拽生效（不加属性） */}
  <span>{category.name}</span>
  <span>{category.count}</span>
</div>

{/* 编辑/新增态时的 input 行 */}
<div data-no-dnd>
  <CategoryInlineInput ... />
</div>
```

**为什么不能只用 `tagName === 'input'` 判定**？因为 ColorPicker 圆点是一个 `<button>` 或 `<div role="button">`，dnd-kit 默认 sensor 不会识别它。`data-no-dnd` 是显式声明意图，避免维护者将来添加新交互元素（例如 hover 出现的 "..." 菜单按钮）时忘记排除。

**为什么 dnd-kit 至今没有内建支持**？参见 GitHub Issue #1657 "[experimental] Prevent drag from specific child elements" — 维护者已认可需求，但未列入 stable API。社区方案就是上面的。

### 2.5 drag handle 不推荐

理论上可以"只让圆点旁边一个 grip icon (`::`) 触发拖拽"，但：
1. macOS 原生 list（Reminders、Notes）都是整行可抓，没有可见 grip
2. Sidebar 宽度 260px 已紧张，加 grip 会挤占名字
3. 整行可抓 + `data-no-dnd` 排除 ColorPicker 已经覆盖所有用例

**推荐：整行可抓，不引入 drag handle**。

---

## 3. 与窗口拖动的冲突处理

### 3.1 现状分析

`Sidebar.tsx:10-35` 的 `startDrag(e)`：
- 监听 `onMouseDown`
- 通过 `target.tagName.toLowerCase()` + `target.closest('button, input, ...')` 排除交互元素
- 调用 `getCurrentWindow().startDragging()`

dnd-kit MouseSensor 也监听 `onMouseDown`（React SyntheticEvent）。两者**绑定到不同的 DOM 节点**：
- `startDrag` 绑定在 Sidebar **根节点**（260px 整体）
- dnd-kit listeners 绑定在 **每个 SortableItem**（行级）

React SyntheticEvent 的传播顺序：捕获阶段从 Sidebar 根→item，冒泡阶段从 item→Sidebar 根。两者绑定的都是 bubble 阶段（`onMouseDown` 默认 bubble）。

**实际触发顺序**：item 上的 dnd-kit handler **先**触发（因为它在更深节点），然后冒泡到 Sidebar 根触发 `startDrag`。

### 3.2 三种隔离方案对比

| 方案 | 实现 | 优势 | 风险 |
|---|---|---|---|
| **A. dnd-kit handler 调用 `e.stopPropagation()`** | 在 SortableItem 的 listeners 里吃掉事件 | 简单，只改一处 | dnd-kit 默认 listeners 不会 stopPropagation，需要包一层；可能影响其他 React 监听 |
| **B. `startDrag` 增加 list 区域排除** | `if (target.closest('[data-sortable-list]')) return;` | 不依赖时序，最稳 | 需要给 sortable 容器加 marker class |
| **C. dnd-kit `onDragStart` 时调 `getCurrentWindow().setIgnoreCursorEvents(true)`** | 拖拽期间禁止 Tauri 接收鼠标 | 防御性强 | 复杂，且 Tauri 会丢失自己的事件，可能影响动效 |

**推荐方案 B**：在 `startDrag` 里加一行 `target.closest('[data-sortable-list]')` 检查。Categories Section 与 Tags Section 各加一个 `data-sortable-list` marker。

```tsx
// Sidebar.tsx 修改 startDrag
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return;
  const target = e.target as HTMLElement;
  // ... 原有 tagName 检查 ...

  // 新增：sortable list 区域不触发窗口拖动
  if (target.closest('[data-sortable-list]')) return;

  try { await getCurrentWindow().startDragging(); } catch {}
};

// Categories/Tags Section 容器
<div data-sortable-list>
  <SortableContext>...</SortableContext>
</div>
```

为什么不选 A：dnd-kit listeners 是黑盒，dnd-kit 内部要冒泡到 document 监听 mousemove，`stopPropagation` 可能误伤。

### 3.3 Tauri `startDragging` 与 `preventDefault` 的关系

实测来自 Tauri 配置文档：
- `dragDropEnabled` 默认 `true`，**这是 webview 级别的 HTML5 drag and drop**，与 dnd-kit 的 PointerEvent 无关
- `getCurrentWindow().startDragging()` 是 Rust 侧调用 macOS 原生 `NSWindow performWindowDragWithEvent`，**不依赖 webview 事件传播**
- 因此 dnd-kit `preventDefault()` 不会影响 Tauri startDragging 的能力

**可以放心用 `preventDefault` 阻止默认拖拽行为（例如阻止文本选中、图片拖拽）**。dnd-kit 内部已经在 sensor 中做了，无需额外处理。

### 3.4 测试方案

手动回归测试（implementer 必跑）：
1. 拖拽 Category 行 → 不应触发窗口拖动
2. 在 Category 行右侧空白处（同一行的 padding 区）按下 → 应触发窗口拖动
3. 在 Categories Section 和 Tags Section 之间的 divider 区按下 → 应触发窗口拖动
4. 在编辑态行（input 显示中）按下 → 都不应触发任何拖动
5. 拖拽 Tag pill → 不应触发窗口拖动
6. Tags 网格的空隙处（gap）按下 → 行为待决策（推荐：触发窗口拖动，因为不属于 sortable item）

---

## 4. 键盘可访问性与屏幕阅读器方案

### 4.1 dnd-kit 默认键盘行为是否符合 WAI-ARIA APG？

**dnd-kit 默认（带 `sortableKeyboardCoordinates`）**：
- Tab 聚焦到 sortable item（绑定了 `tabIndex`）
- Space / Enter 拾起
- 上下箭头（垂直 list）/ 上下左右（grid）移动
- Space / Enter 放下
- Escape 取消

**WAI-ARIA APG 现状**：APG 没有专门的 "Sortable List" 模式，最接近的是 Listbox 模式 + 自定义 grab 操作。GitHub Engineering Blog 和 Salesforce UX 都用了类似 dnd-kit 的"Space pickup + Arrow move + Space drop + Esc cancel"模式。

**结论**：dnd-kit 默认行为**已对齐业界主流可访问性模式**，无需重新发明。Ensemble 直接采用即可。

### 4.2 ARIA 属性最佳实践

dnd-kit 默认给每个 sortable item 加：
- `role="button"` — 默认（可改为 `role="option"` 配合 listbox 父级，但不推荐增加复杂度）
- `aria-roledescription="draggable"` — 默认
- `aria-describedby="DndContext-[uniqueId]"` — 默认，指向隐藏的指令文本

**Ensemble 需要补充**：
- `aria-roledescription="sortable"` — 比 "draggable" 更精确（支持重排）
- 父容器 `aria-label="Categories list, sortable"` 或 `aria-labelledby` 指向 Section 标题

```tsx
<div data-sortable-list aria-label="Categories list, sortable">
  <SortableContext items={categoryIds}>
    {categories.map((cat) => (
      <SortableCategoryRow
        key={cat.id}
        attributes={{ 'aria-roledescription': 'sortable' }}
        ...
      />
    ))}
  </SortableContext>
</div>
```

### 4.3 Categories（垂直 1D）vs Tags（2D wrap）的方向键语义

**Categories（垂直）**：
- `verticalListSortingStrategy` + `sortableKeyboardCoordinates` 自动只响应上/下
- 用户按左/右无效（默认行为）
- 符合预期

**Tags（2D wrap flex）**：
- 必须用 `rectSortingStrategy` 或 `rectSwappingStrategy`
- `sortableKeyboardCoordinates` 默认会响应上/下/左/右，根据当前位置最近的 item 找方向
- 但 Tags 是 wrap 布局，"向下" 在最后一行可能没有 item—dnd-kit 的默认 coordinate getter 会落空
- **可选自定义 coordinate getter**：不动，让 default 行为兜底；按 Tab 也可以辅助

**实操建议**：
- Categories 用 `verticalListSortingStrategy`
- Tags 用 `rectSortingStrategy`，键盘上由 dnd-kit 默认逻辑兜底，**不强求"完美"键盘 2D 体验**——不少 production 应用（Trello、GitHub Projects）的 grid sortable 键盘体验也只能"凑合"

### 4.4 Screen reader 公告（VoiceOver）

**dnd-kit 默认 Announcements**（来自官方文档）：
```ts
{
  onDragStart: ({active}) => `Picked up draggable item ${active.id}.`,
  onDragOver: ({active, over}) => over
    ? `Draggable item ${active.id} was moved over droppable area ${over.id}.`
    : `Draggable item ${active.id} is no longer over a droppable area.`,
  onDragEnd: ({active, over}) => over
    ? `Draggable item ${active.id} was dropped over droppable area ${over.id}`
    : `Draggable item ${active.id} was dropped.`,
  onDragCancel: ({active}) => `Dragging was cancelled. Draggable item ${active.id} was dropped.`,
}
```

**问题**：`active.id` 是 UUID（如 `cat_3f8a...`），VoiceOver 念出来不可懂。dnd-kit 文档明确指出**生产应用必须自定义为 position-based + 用户可读名称**。

**Ensemble 推荐自定义**：

```ts
// src/components/sidebar/announcements.ts
export const buildAnnouncements = (
  items: Array<{ id: string; name: string }>,
  listLabel: string // "category" | "tag"
) => {
  const getNameById = (id: string | number) =>
    items.find((i) => i.id === String(id))?.name ?? String(id);
  const getPosition = (id: string | number) =>
    items.findIndex((i) => i.id === String(id)) + 1;
  const total = items.length;

  return {
    onDragStart({ active }) {
      return `Picked up ${listLabel} ${getNameById(active.id)} at position ${getPosition(active.id)} of ${total}.`;
    },
    onDragOver({ active, over }) {
      if (over) {
        return `${listLabel} ${getNameById(active.id)} moved over position ${getPosition(over.id)} of ${total}.`;
      }
      return `${listLabel} ${getNameById(active.id)} is no longer over a sortable position.`;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `${listLabel} ${getNameById(active.id)} dropped at position ${getPosition(over.id)} of ${total}.`;
      }
      return `${listLabel} ${getNameById(active.id)} dropped at original position.`;
    },
    onDragCancel({ active }) {
      return `Sorting cancelled. ${listLabel} ${getNameById(active.id)} returned to original position.`;
    },
  };
};
```

**英文规范**（i18n 准备）：当前 Ensemble 是英文应用，但留出 `listLabel` 可注入参数。未来加 i18n 框架时只改这一处。

### 4.5 自定义 screenReaderInstructions

dnd-kit 默认指令："To pick up a draggable item, press space or enter. While dragging, use the arrow keys to move the item in any given direction. Press space or enter again to drop the item in its new position, or press escape to cancel."

**Ensemble 修改**（更具体，体感更好）：

```ts
const screenReaderInstructions = {
  draggable: `
    To reorder this ${listLabel}, press space or enter to grab it.
    Then use the arrow keys to change its position.
    Press space or enter to confirm the new position, or escape to cancel.
  `,
};

<DndContext
  accessibility={{ announcements: buildAnnouncements(...), screenReaderInstructions }}
  ...
>
```

### 4.6 VoiceOver on macOS 实测注意

WebSearch 结果显示 dnd-kit 历史版本曾有问题：**"Having wrapper span elements causes VoiceOver on macOS to try to move the VoiceOver cursor to the live region, which interferes with scrolling."** 此问题在 `@dnd-kit/accessibility` 3.x 已修复（plain text 渲染）。Ensemble 用最新版 `@dnd-kit/core@6.x` 即不会受影响。

**额外建议**：
- 设置 Sidebar 启用 VoiceOver 时（CMD+F5）做一次手动验收
- 测试场景：Tab 到 category 行 → Space → 上箭头 → 听到 position 变化 announcement → Space 放下

---

## 5. 状态隔离与数据竞态防御

### 5.1 拖拽期间的其他手势隔离

**右键（contextmenu）拖拽中**：
- macOS 系统行为：右键不会取消进行中的左键 drag
- 期望：右键应**取消拖拽**，不弹出 ContextMenu
- 实现：在 `DndContext` 包裹处监听 `onContextMenu`，如果当前 `isDragging`，则 `e.preventDefault()` + 调 `manager.actions.cancel()` 或简单 `Escape` 模拟

```tsx
// 简单实现：监听 contextmenu，拖拽中阻断
const [isDragging, setIsDragging] = useState(false);
useEffect(() => {
  if (!isDragging) return;
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    // 模拟 Escape 取消
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };
  document.addEventListener('contextmenu', handler);
  return () => document.removeEventListener('contextmenu', handler);
}, [isDragging]);
```

**ContextMenu 已显示时拖拽**：
- 当前 ContextMenu 是 portal-rendered，覆盖在 sidebar 上
- 用户从已弹出的 ContextMenu 上不会触发 sortable item 拖拽（事件被 menu overlay 截获）
- 防御：`onDragStart` 中关闭 ContextMenu（dispatch `closeContextMenu` 给 store）

```ts
const handleDragStart = (event) => {
  setIsDragging(true);
  closeContextMenu(); // 来自 useAppStore
  clearAllEditingStates(); // 退出 inline edit
};
```

**路由切换**：
- click → navigate 在拖拽中**不会**发生（distance: 4 阈值已经把 click 排除掉，dnd-kit 在 drag 触发后会 `preventDefault` onClick）
- 但 ContextMenu 上的 "Open" 按钮可能触发 navigate—关 ContextMenu 后自然解决
- 防御：`react-router-dom` 的 `useBlocker` 在 `isDragging` 时阻断 navigation（保险网，正常不会触发）

### 5.2 数据竞态：乐观更新 + 失败回滚

**当前后端架构** (来自 00_understanding.md §3.2)：每次写入是 **整个 AppData** 的全量序列化。这意味着：
1. 不需要担心 partial update
2. 但两次连续写入若 await 不当，第二次可能读到第一次写入前的内存状态——必须串行

**推荐数据流**：

```ts
// src/stores/appStore.ts 新增
async reorderCategories(newOrder: string[]) {
  const prevOrder = get().categories.map((c) => c.id);
  const reordered = newOrder
    .map((id) => get().categories.find((c) => c.id === id))
    .filter(Boolean);

  // 1. 乐观更新本地（立刻反映）
  set({ categories: reordered });

  try {
    // 2. 异步落盘
    await invoke('reorder_categories', { ids: newOrder });
  } catch (err) {
    // 3. 失败回滚
    const rollback = prevOrder
      .map((id) => get().categories.find((c) => c.id === id))
      .filter(Boolean);
    set({ categories: rollback });
    showErrorToast('Failed to save reorder. Reverted.');
  }
}
```

### 5.3 落盘期间用户再次拖拽（队列 / 锁）

**场景**：用户拖拽 A → 落盘中（200ms IO）→ 用户拖拽 B。如果 B 的乐观更新覆盖了 A 的本地状态，但 A 的 invoke 还没回，可能出现：
- A 成功，B 后到 → 最终是 B 的顺序，正确
- A 失败 → 触发 rollback 到 A 之前，但 B 的本地状态被 rollback 覆盖 → **用户的 B 操作丢失**

**两种应对**：

**方案 X — 串行队列**：用单 promise 链锁住 reorder 操作

```ts
let reorderQueue: Promise<void> = Promise.resolve();
async reorderCategories(newOrder: string[]) {
  reorderQueue = reorderQueue.then(() => doReorder(newOrder));
  await reorderQueue;
}
```

优势：简单，永不丢操作
劣势：第二次拖拽必须等第一次落盘完成才能开始动效——略卡

**方案 Y — 最新操作覆盖**：每次 reorder 取消上一次未完成的 invoke

```ts
let inflightAbort: AbortController | null = null;
async reorderCategories(newOrder: string[]) {
  inflightAbort?.abort();
  inflightAbort = new AbortController();
  // ...
}
```

劣势：Tauri invoke 不支持 AbortSignal。需要后端支持，复杂。

**推荐方案 X**，在 9-10 个项目的小规模下，落盘 < 50ms，串行队列对用户体感无感知。

### 5.4 Refresh 期间用户拖拽

**当前 `onRefresh` 行为**：从后端重新读全量数据，设置到 store。

**冲突**：
- Refresh 期间用户拖拽 → 拖拽完成时调用 reorder → invoke 中 → Refresh 数据回到 → store 被 Refresh 数据覆盖 → 用户的拖拽白做

**防御**：
- Refresh 按钮在 `isDragging || isReorderInflight` 时 `disabled`
- 或者反过来：拖拽中按 Refresh 弹个 toast "Cannot refresh while reordering"

**推荐 disabled 按钮**（更克制，符合 Ensemble 风格）。

### 5.5 拖拽中 / 完成后立刻删除该 item 的边缘

低概率：用户右键删除（被禁），或后台 AI 修改了数据。
- 防御：dnd-kit 的 SortableContext items 数组用 stable id 即可，删除会自然 unmount，dnd-kit 内部会处理 active 节点丢失的情况
- 边界：不需要额外代码

---

## 6. 测试策略

### 6.1 单元测试（vitest + @testing-library/react）

**关键事实**：jsdom **没有 PointerEvent 支持**。dnd-kit 默认用 PointerSensor 在 jsdom 下完全不能工作。

**解决方案**（来自 GitHub Issue #261、Stack Overflow 77449346）：

测试时**强制用 MouseSensor**（jsdom 模拟 mouse events 工作）。Ensemble 已选 Mouse + Touch + Keyboard 三 sensor 组合，单元测试可用：

```ts
// tests/Sidebar.dnd.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';

it('reorders categories on drag', async () => {
  const { getByText } = render(<Sidebar ... />);
  const item1 = getByText('Inbox').closest('[role="button"]')!;
  const item2 = getByText('Work').closest('[role="button"]')!;

  // 模拟拖拽：mousedown + mousemove(超过 distance: 4) + mouseup over target
  fireEvent.mouseDown(item1, { clientX: 0, clientY: 0 });
  fireEvent.mouseMove(item1, { clientX: 5, clientY: 5 }); // 触发 activation
  fireEvent.mouseMove(item2, { clientX: 5, clientY: 50 }); // 移过 target
  fireEvent.mouseUp(item2);

  // 断言 store 状态或 announcement 文本
  expect(...).toBe(...);
});
```

**rect mock 必需**：jsdom 不计算 layout，必须 mock `getBoundingClientRect`：

```ts
beforeAll(() => {
  HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 240, height: 32, top: 0, left: 0, right: 240, bottom: 32, x: 0, y: 0, toJSON: () => ({}),
  }));
});
```

**测试覆盖最小集**：
1. distance:4 的活化测试（mousemove < 4 不触发，>= 4 触发）
2. data-no-dnd 排除测试（圆点 mousedown 不触发拖拽）
3. 键盘测试（Tab → Space → ArrowDown → Space）
4. 取消测试（Tab → Space → ArrowDown → Escape，应回原位）
5. 乐观更新与回滚测试（mock invoke 失败，断言 store 回滚）

### 6.2 端到端测试（Tauri 在 macOS 的现实）

**关键事实**（来自 Tauri 官方文档 + Daniel Raffel 2026-02 博客）：
- **Tauri 在 macOS 没有官方 WebDriver / tauri-driver**——Apple 不为 WKWebView 提供 WebDriver
- Linux 有 `WebKitWebDriver`，Windows 有 `Edge WebDriver`，二者通过 `tauri-driver` 桥接
- 第三方 `Tauri-WebDriver`（开源项目）在 macOS 上有早期实现，但不稳定
- Playwright 不能直接驱动 Tauri 应用（Playwright 是 Chromium，Tauri macOS 是 WebKit）

**Ensemble 的现实选择**：

**Tier 1 — 单元测试（推荐主投入）**：vitest + dnd-kit MouseSensor 模拟覆盖 90% 行为

**Tier 2 — Frontend dev server e2e**：Playwright 在 `npm run dev` 启动的纯 Vite dev server 上跑，不通过 Tauri。优势：
- Playwright 自带 `page.dragTo()` API
- 可在 CI 跑
- 局限：测试不到 Tauri IPC（reorder 实际落盘逻辑）

```ts
// tests/e2e/sidebar-reorder.spec.ts
test('reorder categories via drag', async ({ page }) => {
  await page.goto('http://localhost:1420');
  const inbox = page.getByRole('button', { name: /Inbox/i });
  const work = page.getByRole('button', { name: /Work/i });
  await inbox.dragTo(work);
  // 断言新顺序
});
```

**Tier 3 — 手动回归 checklist（必须）**：详见本节末 §6.3

**不推荐**：Tauri-WebDriver（macOS 上不成熟，引入维护负担）

### 6.3 手动回归 checklist（强制）

实施完成后必须由人手工跑过这一遍：

- [ ] 单击 Category 行 → 正确 navigate
- [ ] 双击 Category 行 → 进入 inline edit
- [ ] 右键 Category → 弹 ContextMenu
- [ ] 单击 ColorPicker 圆点 → 弹颜色选择器（拖拽不触发）
- [ ] 拖拽 Category 行 5px → 拖拽激活，跟随光标
- [ ] 拖拽 Category 行 < 4px 释放 → 不触发拖拽，触发 click（navigate）
- [ ] 拖拽 Category 行 → 释放到新位置 → 顺序更新且持久化
- [ ] Refresh 后顺序保持
- [ ] 拖拽中右键 → 取消拖拽，不弹菜单
- [ ] 拖拽中按 Esc → 取消，恢复原位
- [ ] Tab 聚焦 Category 行 → Space → ArrowDown → Space → 顺序更新
- [ ] Tab 聚焦 → Space → ArrowDown → Esc → 恢复原位
- [ ] 启用 VoiceOver (CMD+F5)，Tab 到行 → 听到 "sortable, Inbox, position 1 of 5"
- [ ] VoiceOver 启用，键盘移动 → 听到 position 变化
- [ ] Sidebar 空白处按下 + 拖动 → 移动窗口（startDrag 仍工作）
- [ ] 编辑态行 input focused → 拖拽不激活
- [ ] Tags 拖拽（同样所有用例）
- [ ] 模拟落盘失败（断网或 mock invoke 报错）→ 顺序回滚 + toast
- [ ] 长列表（>20 categories）滚动正常（Mouse + Touch sensor 不影响 trackpad 滚动）
- [ ] 触控板单指 vs 三指 drag：三指 drag 是 macOS 系统级，不会被 webview 拦截，应触发拖拽

---

## 7. 引用源

**dnd-kit 官方文档**
1. [Pointer Sensor (legacy)](https://dndkit.com/legacy/api-documentation/sensors/pointer) — distance / delay constraint 定义
2. [Mouse Sensor (legacy)](https://dndkit.com/legacy/api-documentation/sensors/mouse) — onMouseDown 活化器
3. [Sensors (latest)](https://dndkit.com/extend/sensors) — 自定义 sensor 与 PointerActivationConstraints API
4. [Sortable (legacy)](https://dndkit.com/presets/sortable) — sortableKeyboardCoordinates 集成
5. [Sortable (latest)](https://dndkit.com/concepts/sortable) — 多组与位置追踪
6. [DndContext (legacy)](https://dndkit.com/legacy/api-documentation/context-provider/dnd-context) — Announcements / onDragCancel
7. [Accessibility Guide](https://dndkit.com/legacy/guides/accessibility) — 默认公告、键盘快捷、screen reader instructions
8. [Migration Guide (React)](https://dndkit.com/react/guides/migration) — accessibility prop 重组（6.0+）
9. [Modifiers](https://dndkit.com/legacy/api-documentation/modifiers) — restrictToVerticalAxis 等
10. [@dnd-kit/accessibility npm](https://www.npmjs.com/package/@dnd-kit/accessibility) — 内部 a11y 包

**dnd-kit GitHub Issues / Discussions**
11. [Issue #477: How do I prevent draggable on input and btns](https://github.com/clauderic/dnd-kit/issues/477) — 自定义 sensor 起源
12. [Issue #863: Proposal SensorOptions to disable drag on interactive elements](https://github.com/clauderic/dnd-kit/issues/863) — 维护者认可的需求，未实现
13. [Issue #1657: Prevent drag from specific child elements (experimental)](https://github.com/clauderic/dnd-kit/issues/1657) — 仍在 experimental
14. [Discussion #476: How to distinguish click and drag](https://github.com/clauderic/dnd-kit/discussions/476) — distance vs delay 经验
15. [Discussion #1493: Custom Keyboard Sensor for prevent drag from button](https://github.com/clauderic/dnd-kit/discussions/1493) — 自定义 KeyboardSensor + data-no-dnd 完整代码
16. [Issue #261: Testing dndkit using React Testing Library](https://github.com/clauderic/dnd-kit/issues/261) — 测试方案讨论
17. [Issue #983: dnd-kit not allowing to prevent dragging items](https://github.com/clauderic/dnd-kit/issues/983) — disabled prop 用法
18. [Issue #1702: onDragCancel does not fire on simple mouse release](https://github.com/clauderic/dnd-kit/issues/1702) — onDragCancel 行为细节

**Stack Overflow & 实战**
19. [SO 78659136: Prevent drag when user drags a child component using dnd-kit sortable](https://stackoverflow.com/questions/78659136/prevent-drag-when-user-drags-a-child-component-of-a-draggable-component-using-dn) — `data-no-dnd` 完整代码（标准方案）
20. [SO 77449346: Testing dnd-kit/sortable using jest](https://stackoverflow.com/questions/77449346/testing-dnd-kit-sortable-using-jest-failing-to-eventually-sort) — 测试模板
21. [SO 77415442: dnd-kit listeners interfering with checkbox onChange](https://stackoverflow.com/questions/77415442/listeners-from-dnd-kit-are-interfering-with-the-inputcheckboxs-onchange-event) — Mouse + Touch 分离的实战

**WAI-ARIA / 可访问性**
22. [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — 模式总览
23. [APG: Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) — 最接近 sortable 的模式
24. [APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) — 键盘原则
25. [Web Accessibility for Developers: Sortable Lists](https://pressbooks.library.torontomu.ca/wafd/chapter/sortable-lists/) — sortable list a11y 教程
26. [GitHub Engineering Blog: Exploring the challenges in creating an accessible sortable list](https://github.blog/engineering/user-experience/exploring-the-challenges-in-creating-an-accessible-sortable-list-drag-and-drop/) — 真实工程经验，包括 announcement debounce
27. [Salesforce UX Medium: 4 Major Patterns for Accessible Drag and Drop](https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09) — 模式总结

**macOS / Apple HIG / Tauri**
28. [Apple HIG: Drag and Drop](https://developers.apple.com/design/human-interface-guidelines/macos/user-interaction/drag-and-drop/) — 3-point 拖拽阈值
29. [Apple HIG (1987 PDF)](https://andymatuschak.org/files/papers/Apple%20Human%20Interface%20Guidelines%201987.pdf) — 7-pixel window resize 阈值（历史值）
30. [Tauri 2 Configuration Reference](https://v2.tauri.app/reference/config/) — `dragDropEnabled`、`acceptFirstMouse`、`hiddenTitle`
31. [Tauri 2 WebDriver Testing](https://v2.tauri.app/develop/tests/webdriver/) — 仅 Linux/Windows
32. [Daniel Raffel: I Built a WebDriver for WKWebView Tauri Apps on macOS (2026-02)](https://danielraffel.me/2026/02/14/i-built-a-webdriver-for-wkwebview-tauri-apps-on-macos/) — 第三方方案现状

**测试**
33. [Reflect: How to test drag-and-drop in Playwright](https://reflect.run/articles/how-to-test-drag-and-drop-interactions-in-playwright/) — page.mouse.down/move/up 模式
34. [DEV.to: Developing and testing sortable Drag and Drop components, Part 2](https://dev.to/wolfriend/developing-and-testing-sortable-drag-and-drop-components-part-2-testing-13lj) — data-testid 模式

**Optimistic UI / 数据竞态**
35. [TanStack Query Discussion #1268: How best to handle errors with optimistic updates](https://github.com/TanStack/query/discussions/1268) — 落盘失败 UX
36. [Medium: Implementing Optimistic UI Updates with useOptimistic](https://medium.com/@vdsnini/implementing-optimistic-ui-updates-with-the-useoptimistic-hook-in-react-51173b86c202) — React 18 useOptimistic
37. [react-beautiful-dnd Issue #873: Delay in state updating causes flicker](https://github.com/atlassian/react-beautiful-dnd/issues/873) — 同步状态延迟问题

**WKWebView**
38. [WKWebView Docs](https://developer.apple.com/documentation/webkit/wkwebview)
39. [SO 63538771: Disable link drag on WKWebView](https://stackoverflow.com/questions/63538771/disable-link-drag-on-wkwebview) — `-webkit-touch-callout: none` + `draggable="false"`
40. [MDN: -webkit-touch-callout](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-touch-callout)

**框架对比**
41. [Motion (Framer Motion) Reorder docs](https://motion.dev/docs/react-reorder) — Reorder 限制：no multirow / no scrollable container / no cross-column
42. [dnd-kit issue #605: Framer Motion for layout animation](https://github.com/clauderic/dnd-kit/issues/605) — 集成模式
