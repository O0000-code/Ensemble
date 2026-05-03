# Sidebar Reorder — Design Spec（设计规格）

> **Decisional 文档**。本文档与 `03_tech_plan.md` 同级。视觉/动效细节冲突时，以本文档为准。
> 文档来源：综合 `01_research/05_macos_patterns.md` + `01_research/02_animation_physics.md` + 项目已有 design tokens（`src/index.css`、`Sidebar.tsx`）。

## 1. 设计哲学一句话

> **macOS 原生气质为基底，借 Linear/Things 的 spring 让位作为生气，所有动效全程 ≤ 280ms 不喧宾夺主。**

具体取舍：
- **不做** Notion / Trello 风格的"夸张 lift + 大阴影 + rotate"
- **不做** 任何 settle overshoot bounce（工具型 sidebar 不需要"晃动"）
- **不做** stagger（同步让位更"crisp"）
- **保留** 项目已有 `cubic-bezier(0.16, 1, 0.3, 1)` 的克制气质
- **新增** 极轻 lift（scale 1.02、opacity 原位 0.4）
- **新增** macOS 蓝插入线（沿用项目 `#0063E1`，已用于 input selection，是 macOS-blue 亲缘色）

---

## 2. 视觉规格表（Lift / Preview / Indicator / Cascade / Settle / Cancel）

### 2.1 Lift（拾起）—— 拖拽激活的瞬间

| 属性 | Categories（行） | Tags（pill） |
|---|---|---|
| 激活手势 | 鼠标按下后移动 ≥ **4px** | 同 |
| 激活延迟 | 0ms（无延迟，符合 macOS HIG "about three points"） | 同 |
| 原位 opacity | 1.0 → **0.4** | 同 |
| 原位 scale | 1.0 → **1.02** | 1.0 → **1.04**（pill 较小，需略大一些视觉感受） |
| 原位 transform-origin | center | center |
| 原位 timing | `120ms cubic-bezier(0.4, 0, 0.2, 1)` | 同 |
| 背景色 | 保持当前态（hover 或 active 背景不变） | 同 |
| 触感反馈 | 不实现（macOS 系统级 click 已足够） | 同 |

### 2.2 DragOverlay（跟手克隆）

> 用 dnd-kit `<DragOverlay>` 自渲染，**不**用 HTML5 native preview。

| 属性 | Categories | Tags |
|---|---|---|
| 内容 | ColorPicker dot + 名字（**省略 count**） | 仅文字（**保留 pill 形态**） |
| opacity | **0.95** | **0.95** |
| scale（绝对值） | **1.02**（与原位 lift 一致） | **1.04** |
| rotation | **0**（macOS 不旋转） | 0 |
| box-shadow | `0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)` | `0 4px 8px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)`（pill 较小） |
| 背景 | white | 与 pill 当前态一致（active=#18181B/transparent） |
| 圆角 | 6px（同 row） | 4px（同 pill） |
| z-index | dnd-kit auto-managed（document body teleport） | 同 |
| 跟手位置 | `pointer.{x,y} - element.origin`（指针落在原点击位） | 同 |
| 出现 timing | 0ms（lift 与 overlay 出现同步） | 同 |

### 2.3 Drop indicator（插入线）

#### Categories（1D 垂直列表）

| 属性 | 值 |
|---|---|
| 形状 | **水平线** |
| 粗细 | **2px** |
| 颜色 | **`#0063E1`**（沿用项目已有蓝，与 macOS system blue 同色系） |
| 长度 | `calc(100% - 4px)`，左右各留 2px 内缩，对齐 row hover 边距 |
| 位置 | 行间正中（行间隙 `gap-0.5` = 2px，line 上下各 1px 填充） |
| 出现 timing | `100ms ease-out` opacity 0 → 1 |
| 移动 timing | `150ms cubic-bezier(0.16, 1, 0.3, 1)` translateY |
| 装饰 | 不加端点小圆点（保持极简） |

#### Tags（2D wrap）

| 属性 | 值 |
|---|---|
| 形状 | **垂直线**（pill 之间） |
| 粗细 | `2px` 宽 × `20px` 高 |
| wrap 行尾特例 | 行末插入位用**短水平线** `24px × 2px` |
| 颜色 | `#0063E1` |
| 位置 | pill 之间正中（gap `gap-1.5` = 6px，line 居中，左右各 2px 留白） |
| timing | 同 Categories（100ms 出，150ms 移） |

### 2.4 Cascade（让位动画）—— 其他项响应

| 属性 | Categories（1D） | Tags（2D wrap） |
|---|---|---|
| timing 函数 | `cubic-bezier(0.16, 1, 0.3, 1)` | 同 |
| duration | **220ms** | **240ms**（wrap 同时移动多项，略长） |
| stagger | **0**（同步让位） | **0** |
| 等价 spring（如 motion） | `{ stiffness: 600, damping: 38 }` | `{ stiffness: 700, damping: 42 }` |
| GPU 加速 | 仅用 `transform: translate*`，禁 layout thrash | 同 |

> 实现层面：dnd-kit `useSortable` 暴露 `transform` 与 `transition` 字符串，由我们指定为上述 `220ms cubic-bezier(0.16, 1, 0.3, 1)`。

### 2.5 Settle（落定）—— drop 完成

| 属性 | 值 |
|---|---|
| DragOverlay 消失 | 用 dnd-kit `dropAnimation`：`{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }`，平滑滑到目标位 |
| 原位 opacity 恢复 | 1.0 → 1.0，**与 dropAnimation 同步** |
| 原位 scale 恢复 | 1.02 → 1.0 |
| 总 settle 时长 | ≤ **200ms** |
| overshoot | **无**（关键：不晃动） |

### 2.6 Cancel（取消）—— Esc / 拖出 sidebar / 拖到非法区

| 触发 | 反馈 |
|---|---|
| 按 Esc 键 | DragOverlay snap-back 到原位（`200ms cubic-bezier(0.16, 1, 0.3, 1)`），opacity 0.95 → 0；原位 opacity 0.4 → 1.0 |
| 拖出 sidebar 边界 + 释放 | 同 snap-back（HIG 推荐"回弹"路径，避免"蒸发"被误读为"删除"） |
| 拖动期间持续在非法区域 | DragOverlay opacity 0.95 → **0.5**（暗示无效），cursor 切换 `not-allowed` |

### 2.7 Cursor

| 状态 | Cursor |
|---|---|
| Hover 在可拖项 | `default`（不切 grab，符合 macOS 气质） |
| 按下未达 4px | `default` |
| 拖动激活后 | `grabbing` |
| 拖到合法 drop target | `grabbing` |
| 拖到非法区域 | `not-allowed` |
| 拖动结束 / 取消 | 立即恢复 `default` |

### 2.8 已有手势的隔离规则

| 手势 | 隔离方式 |
|---|---|
| ColorPicker 圆点单击 | 圆点元素加 `data-no-dnd="true"`，自定义 sensor 检测到此属性时不激活 |
| Inline edit / add 输入框 | 编辑/新增态的行调用 `useSortable({ disabled: true })` |
| Right-click ContextMenu | 右键事件不触发拖动激活；激活中按右键则取消拖动 |
| Sidebar 窗口拖动（startDrag） | sortable 容器加 `data-sortable-list`，`startDrag` 用 `target.closest('[data-sortable-list]')` 排除 |
| Refresh 按钮 | 拖动激活期间 disable Refresh 按钮 |
| 单击导航 | 由 `activationConstraint.distance: 4` 自动区分：未达阈值 → 触发 click；达阈值 → 触发 drag，此时 click 不发射 |
| 双击编辑 | 双击不会移动 4px，故不被 drag 拦截 |

### 2.9 "Show X more" 折叠态

| 场景 | 行为 |
|---|---|
| 用户在折叠态开始拖动 | **自动展开**（在 `onDragStart` 中调用 `setShowAllCategories(true)`） |
| 拖动期间 | 保持展开 |
| Drop 完成 | 保持展开（不自动折回——避免视觉跳变；用户可手动折回） |
| 折叠中的项被作为 drop target | dnd-kit 只识别已渲染节点，自动展开后所有项参与 |

### 2.10 数据一致性反馈

| 场景 | 视觉 |
|---|---|
| Drop 后乐观更新 UI | 立即生效（无 loading） |
| 后端落盘成功 | 无额外反馈 |
| 后端落盘失败 | 1. 顺序回滚到 drop 前；2. 在 sidebar 顶部（refresh 按钮旁）短暂显示一个 5px 圆点的红色错误指示器 1.5s（不打断用户） |
| 拖动期间数据被外部刷新 | Refresh 按钮在 `isDragging` 时 disabled，不可能发生 |

### 2.11 Reduced Motion

`@media (prefers-reduced-motion: reduce)`：
- 所有 transition duration → `0ms`（瞬时切换）
- DragOverlay 仍渲染（位置跟手），但 cascade/settle/cancel 都是瞬时
- Drop indicator opacity 直接 0/1 无淡入

---

## 3. 时序示意（Categories 1D）

```
t=0       mousedown on "Coding" row (pointer at row top + 8px)
          │
          │ (movement < 4px → 仍在等待)
t=~16     pointer 移到 row top + 12px (4px movement)
          │
          ↓
t=16      [Drag activates]
          │ Lift 动画启动 120ms：
          │   原位 opacity 1.0 → 0.4
          │   原位 scale 1.0 → 1.02
          │   DragOverlay 渲染于 document body：
          │     opacity 0 → 0.95
          │     box-shadow ramp up
          │     translate = pointer offset
          │ Cursor → grabbing
          │ Refresh button disabled
          │ ContextMenu / inline edit 全部清除
t=136     Lift 完成
          │
t=200     pointer 越过 "Design" row 中心
          │ Drop indicator fade in 100ms
          │ Cascade let-pass 220ms：
          │   "Design" 及其下方所有 row 同步上移一行高
t=420     Cascade settled
          │
t=600     mouseup
          │ Settle 180ms：
          │   DragOverlay 滑向目标位置
          │   Drop indicator 1 → 0 fade out
          │ 原位 opacity 0.4 → 1.0, scale 1.02 → 1.0
t=780     完成
          │
          │ 后台异步：
          │   appStore.reorderCategories([...newOrder])
          │   → invoke('reorder_categories', {orderedIds})
          │   失败 → 顺序回滚 + 错误指示器
```

## 4. 时序示意（Tags 2D wrap）

```
Before:
  [CSS] [TS] [Rust] [Vim] [Tmux]
  [Docker] [K8s] [Linux]

User picks up [Vim] (drag activates after 4px):
  原位 [Vim] opacity 0.4
  DragOverlay [Vim] 跟手 (opacity 0.95)

User drags pointer left between [TS] and [Rust]:
  Drop indicator: 垂直 line 2×20px @ #0063E1，渲染于 [TS] 右侧
  Cascade: [Rust], [Vim 原位], [Tmux] 同步右移 240ms
  
User drags down between [Docker] 和 [K8s]:
  Drop indicator 跳到第二行：垂直 line 在 [Docker] 右侧
  Cascade: [K8s], [Linux] 同步右移；上一行 [Rust], [Tmux] 回填左移
  ↑ 所有让位动画 240ms cubic-bezier(0.16, 1, 0.3, 1) 同步

User releases:
  Settle 180ms：DragOverlay 平滑到 final 位置
  原位淡化恢复
  
After:
  [CSS] [TS] [Rust] [Tmux]
  [Docker] [Vim] [K8s] [Linux]
```

## 5. 评估通过的硬性视觉条件（Acceptance）

实施后必须满足以下全部条件，否则不算"达到目标效果"：

1. ☐ 拖拽 lift 启动 ≤ 16ms（首帧）
2. ☐ Cascade 让位动画无 jank（DevTools FPS 全程 ≥ 55）
3. ☐ Drop 后 UI 立即更新（乐观），后端 IPC 不影响视觉
4. ☐ Drop indicator 在 wrap 末端正确显示短水平线
5. ☐ Settle 无 overshoot，肉眼不应感到"弹回"
6. ☐ Esc 取消时回弹动画顺滑无跳帧
7. ☐ ColorPicker 圆点单击仍能打开颜色面板（不被 drag 拦截）
8. ☐ Sidebar 空白区域 mousedown 仍能拖动 macOS 窗口
9. ☐ 单击 Category / Tag 仍能 navigate（拖动距离 < 4px 时）
10. ☐ 双击进入编辑态、右键打开菜单仍正常工作
11. ☐ "Show X more" 折叠态拖拽时自动展开
12. ☐ 编辑/新增 inline input 状态下，该行不可拖
13. ☐ Refresh 按钮在拖动期间 disabled
14. ☐ `prefers-reduced-motion` 下所有动画瞬时
15. ☐ 键盘可达：Tab + Space + Arrow + Esc 完成全流程重排
16. ☐ VoiceOver 公告内容是 Category/Tag **名字**而非 UUID
