# macOS 拖拽排序视觉语言 — 调研与设计 Spec

> 调研对象：macOS 系统应用 + 顶级第三方应用 + Web 现代库的拖拽排序视觉。
> 输出对象：Ensemble Sidebar 的 Categories（1D 列表）+ Tags（2D wrap）拖拽排序。
> 调研时间：2026-05-03。
> 视觉基线：260px sidebar、`#F4F4F5` 悬停背景、6px 圆角、字号 13px / 11px、整体克制原生气质。

---

## 1. 核心结论

macOS 原生应用在拖拽排序上呈现**高度收敛的视觉语言**，与现代 web app（Notion / Trello / Linear early days）形成显著差异：

| 维度 | macOS 原生（Finder / Notes / Reminders / Mail / Music） | 现代 Web App（Notion / Trello / Linear） |
|---|---|---|
| Lift 视觉 | 半透明克隆（NSDraggingItem 默认 ~0.5–0.7 opacity）跟随光标，**几乎无 scale**，**轻阴影或无阴影** | Scale up 1.02–1.05，明显 box-shadow elevation 提升 |
| Drag preview | 使用 `NSDraggingItem` 半透明 PDF 快照，**不变形** | 克隆 DOM 节点，可能附加 rotate/scale |
| Drop indicator | **细的蓝色横线**（`AccentColor`，约 2px，水平贯穿），插入位 gap 不变形 | "Gap" 模式（其他项让位让出占位空间） 或线条 |
| Reorder cascade | 同步移动（Outline View `gap` 模式让位），无 stagger，曲线偏 ease-in-out，约 200–250ms | Spring 物理感，让位常带 stagger |
| Settle / drop | 短 ease-out，**无 overshoot**，~150–200ms | Spring，可能微弱 overshoot |
| Cancel 反馈 | 拖出有效区时 drag image **回弹到源位置**（"snap-back" 动画），或 fade out + scale up | 同上 |
| Cursor | macOS 系统：默认 → grab/grabbing 不突出，主要靠 drag preview 表达；Web 应用通常显式切 `grab` → `grabbing` | 显式切 `grab` → `grabbing` |
| Sound | 系统级少量 click 声（视设置） | 通常无声 |

**本应用应该取的气质（结论）**：

> **以 macOS 原生为基底（细线 drop indicator + 半透明克隆 + 收敛动效），适度借鉴 Linear/Things 的 spring 物理感作为"让位"动画的核心**。
>
> 原因：
> 1. 用户对 Sidebar = macOS Finder/Notes 心智模型已极强（260px 宽 + 11px tag pill + 13px category，已是 Finder Tags + Notes Folders 的视觉调性）。Lift 时大幅 scale + 重阴影会**立即破坏原生气质**。
> 2. 但纯原生（NSOutlineView 的 `gap` 风格）让位动画过于机械，Things/Linear 的 spring 让位更"活"。物理真实感正是用户原始需求里强调的。
> 3. Atlassian 在 Pragmatic D&D 工程实践中证明：**原生 HTML5 D&D 无法控制 drag preview 的 opacity/box-shadow**——所以工程上若要"半透明克隆 + 阴影"必须用 dnd-kit `DragOverlay` 自渲染（不用 HTML5 native），这与原生气质并不冲突。
> 4. 用户在 Bear 论坛对 Notes/Pages "drag preview 显示完整文字" 的吐槽（"distractionful"）说明：**preview 应该是简化的、半透明的**，而非完整复制原内容。

---

## 2. 应用观察表

调研法：Apple Support 文档（描述行为）+ AppleVis/MacRumors/Reddit 用户描述（描述视觉）+ AppKit/HIG 文档（描述系统行为）+ App 官方设计博客（Linear / Atlassian / Bear / Things）+ 实测描述（用户视频反馈）。

> 注：标记 "未能确认" 的细节是没有可信文献佐证的物理参数（如 spring stiffness/damping 数值），而非视觉行为本身。

### 2.1 macOS 系统应用

| App | Lift（拾起） | Drag preview | Drop indicator | Reorder cascade | Settle / drop | Cancel | Cursor |
|---|---|---|---|---|---|---|---|
| **Finder sidebar (Favorites/Locations/Tags)** | 半透明克隆（PDF 快照），无 scale，无明显阴影；激活无 lift 高度 | 整行克隆，跟随光标偏移由 `mouseDownAt` 决定，**保持原宽**，opacity ~0.5–0.7 | **细蓝色 insertion line**（约 1–2px，accentColor），水平贯穿 sidebar 宽 | 其他行**不立即让位**：仅显示蓝线表示插入位，drop 后整体重排 | 系统短 ease-out，回到无动画状态；无 overshoot | "拖出 sidebar" 时 drag image 出现 **X 标记**（删除）；拖回到合法位置则消失 | 默认箭头，无 grab 切换 |
| **Notes folder list** | 同 Finder（NSOutlineView），半透明克隆 | 同 Finder | **蓝色 insertion line**（用户在 Apple 论坛评：必须拖到正确缩进区域才能命中"between folders" 而非"into folder"，提示线条精确度高） | 同 Finder | 同 Finder | 同 Finder | 默认箭头 |
| **Reminders 列表与组** | 同 NSOutlineView 默认 | 同 Finder（半透明 row 克隆） | 蓝色 insertion line（行间），拖到列表上则整列高亮表示"进入分组" | drop 后整体重排，无 cascade 动画 | 短 ease-out | 拖到非法位置（如跨账户）：drop 失败，drag image 回弹 | 默认 |
| **Mail mailboxes** | 同上（NSOutlineView） | 同上 | 蓝色 insertion line | 同上 | 同上 | 同上 | 默认 |
| **Music sidebar (Playlists)** | 同 NSOutlineView 默认；可拖 song → playlist | 半透明 row 克隆 | 蓝色 insertion line（playlist 之间）；拖 song 到 playlist 整 playlist 高亮 | 同上 | 同上 | 同上 | 默认 |
| **Music playlist 内 songs** | 同 NSTableView | 同上 | 蓝色 insertion line | 同上 | 同上 | 同上 | 默认 |
| **Photos 相册** | 同 NSCollectionView 默认 | 半透明克隆 | 蓝色 insertion line（在 grid 中是垂直 / 水平） | 同上 | 同上 | 同上 | 默认 |
| **Safari bookmarks bar / tabs** | tab 拖动有轻微 scale up（~1.02–1.05，未确认精确值），半透明 | 跟随光标，可"撕出"成新窗口 | bookmarks bar 用蓝线；tab 拖动由系统 handle | 其他 tab 让位（让位带短 ease-in-out） | 短 ease-out 或可能微弱 overshoot（未严格确认） | 拖出窗口 → 成为新窗口；拖回 → 回弹 | tab handle 可能切 grab |
| **Calendar list** | 同 NSOutlineView 默认 | 半透明 | 蓝色 insertion line | 同上 | 同上 | 同上 | 默认 |
| **System Settings 13+ sidebar** | 系统 sidebar 不允许重排（fixed 顺序），不适用 | — | — | — | — | — | — |

**总结**：macOS 原生应用 95% 用 NSOutlineView/NSTableView 的默认行为：**半透明 row 克隆 + 蓝色 insertion line + 无 cascade 让位动画 + drop 后 reload + 拖出区域 X 标记或回弹**。这是用户对 macOS sidebar 的肌肉记忆。

### 2.2 macOS 顶级第三方应用

| App | Lift（拾起） | Drag preview | Drop indicator | Reorder cascade | Settle / drop | Cancel | Cursor |
|---|---|---|---|---|---|---|---|
| **Things 3** | iOS：long-press → 项目 "**pop out**" 浮起到手指下，集中"gather"（多选时多个 task 堆叠） | 整 item lift；Mac 桌面端较保守，半透明克隆但有轻微 scale + shadow | 细线（颜色未明确确认，疑似 accent color） | **Spring 让位**（"falls into place. Beautiful." — Cultured Code 官方语） | Spring 弹性下落，"falls into place" | 拖出 → 弹回原位 | iOS 触觉反馈 + 视觉浮起 |
| **Craft** | 块状半透明克隆（明显 elevation） | 多块 drag 时所有块一起跟随 | 蓝色横线（typical web 实现），block 之间 gap | 让位有短动画（未确认参数） | 短 ease-out | 拖出 → 删除区域反馈 | grab/grabbing |
| **Notion (macOS native shell)** | 块拖动时整块 scale + shadow，**有较明显高度感**（"现代 web app" 风格） | 整块克隆，可能带轻微 rotate | 蓝色横线（block 间）/ 蓝色框（嵌套时） | Cascade 让位带 stagger（属于"dramatic" 端） | 短 ease-out 或 spring | 拖出 → 删除区域 / 回弹 | grab/grabbing |
| **Linear** | "Improved Drag & Drop"（2023-04-27 Changelog）：可在 group 间拖 issue，自动更新 status；视觉以"calmer, more consistent"（2024 UI refresh 用语）为追求 | 简化的 issue row 克隆，opacity 略降 | **蓝色或主题色横线**（line indicator），group 之间拖动时整 group 高亮 | Spring 让位（用户描述："soft and timely, flow like water"） | Spring settle | 拖出 → 回弹 | grab/grabbing 切换 |
| **Arc Browser (Spaces / Tabs)** | tab 拖动有明显 scale + shadow（更"现代 web app" 风格） | 整 tab pill 克隆 | 高亮目标位置（line + 让位 gap） | Spring 让位 | Spring | 拖出 sidebar → 关闭 / 回弹 | grab/grabbing |
| **Raycast extensions list** | 主要靠键盘 + 命令；列表本身 D&D 不是核心交互 | — | — | — | — | — | — |
| **Cron / Notion Calendar** | 日历 event 拖动：保持原大小克隆，半透明 | 跟手 | 时间槽高亮 | 其他 event 不让位（日历是固定网格） | 短 ease-out | 拖出 → 删除 / 回弹 | grab |
| **Bear (notes)** | macOS 原生 NSTableView 默认（社区论坛显示 Bear 团队明确说："we don't want to go against how drag and drop of text works across the macOS platform" — 即坚持 Apple 原生） | macOS 半透明 row 克隆 | 系统蓝色 insertion line | macOS 默认（无 cascade） | 默认 | 默认 | 默认 |
| **Obsidian sidebar file tree** | 默认无原生重排；需 Manual Sorting / File Order plugin。社区强烈要求"native drag-and-drop sorting"。已有插件用蓝线 insertion 模式 | 半透明 row | 蓝线（webview 风格） | 让位有动画 | 短 ease-out | — | grab |

**总结**：第三方应用分两派：
- **保守派（Bear / 想做 macOS 好公民的 app）**：完全跟随 NSOutlineView 默认。
- **现代派（Things 3 / Linear / Notion / Craft / Arc）**：在 macOS 基底上**借入 spring 物理 + 适度 lift 高度**，但 Things 和 Linear 明确克制（"soft and timely" / "calmer, more consistent"），Notion 和 Arc 较张扬。

**最受好评的拖拽手感**（来自论坛/博客评价频率）：
- Things 3（iOS 端 "pop out & gather" 被反复称颂；Mac 端较保守但仍 polished）
- Linear（"flow like water"，2023 改进后被列入 changelog 重点）
- Craft（drag-and-drop 是其核心 selling point，MacStories 称 "the first notes app I've used that was clearly built from the ground up with drag and drop in mind"）

**被吐槽的拖拽手感**：
- Notion mobile（"Drag & Drop pretty much doesn't work" — Reddit r/Notion）
- Bear preview "distractionful"（Bear 论坛用户对 macOS 原生完整文字 preview 的吐槽，说明 **preview 应该简化**）
- Apple Notes folder reorder "not intuitive"（Apple Discussions：用户难以判断是 reorder 还是 nest）

### 2.3 系统级技术参考（NSTableView / NSOutlineView）

来源：WWDC 2011 Session 120 "View Based NSTableView Basic to Advanced"、Stack Overflow、Michael Tsai blog、Nate Thompson tutorial。

- **gap 风格**（`NSTableViewDropOperation.gap`）：drop 时其他行**让出空隙**（小 gap 打开，dragged item 滑入）。WWDC 演示原话："the little gap opens up and the rows just slide on into place"。
- **insertion line**（`NSTableViewDropOperation.above`）：默认 **蓝色 1-2px line** 在行间显示。
- **animates to destination**（`NSDraggingInfo.animatesToDestination = true`）：drag image 从源位置沿动画路径滑到 final destination。
- **NSAnimationContext duration**：默认 0.25s（250ms），可调。
- **dataWithPDF(inside:)**：从 NSView 生成 PDF 快照作 drag image（保留矢量），再传给 `NSDraggingItem.setDraggingFrame(_:contents:)`。

### 2.4 Apple HIG 关键原文

来源：[Apple HIG - Drag and drop](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop)。

> **"Display a drag image as soon as people drag a selection about three points."**
> — 拖动 ~3 点（约 3px）即应显示 drag image，**不需要长按**。
>
> **"It works well to create a translucent representation of the content people are dragging. Translucency helps distinguish the representation from the original content and lets people see destinations as they pass over them."**
> — 半透明 drag image 是**官方推荐**，让用户能看穿到底下的 drop targets。
>
> **"When people drop an item on an invalid destination, or when dropping fails, provide visual feedback. For example, the item can move back from its current location to its source (if the source is still visible) or it can scale up and fade out to give the impression of the item evaporating instead of landing successfully."**
> — Cancel 反馈两种官方推荐：**回弹到源位置** 或 **scale up + fade out（蒸发感）**。

来源：[Apple HIG - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)。

> **"Aim for brevity and precision in feedback animations."**
> — 反馈动画**简短精准**，不喧宾夺主。
>
> **"Strive for realistic feedback motion that follows people's gestures and expectations."**
> — 真实物理感的反馈动画。
>
> **"Make motion optional"** — 必须支持 `prefers-reduced-motion`。

### 2.5 工程参考：Atlassian Pragmatic D&D 设计哲学

来源：[Atlassian "The journey of pragmatic drag and drop"](https://www.atlassian.com/blog/design/designed-for-delight-built-for-performance)。

关键洞察（**对本任务有直接影响**）：

> **"You cannot control the opacity or box shadow on the drag preview"** ——浏览器原生 HTML5 D&D 的 drag preview 不可控 opacity/shadow。
>
> **"Lines, borders and background colors lets us have extreme amounts of flexibility in how we communicate what is being achieved"** ——他们最终用 **lines + borders + background-colors** 三件套作为视觉语言。
>
> **"We decided to simplify drag previews, so they only contained crucial information"** ——简化 preview，只保留关键信息（与 Bear 用户吐槽的"完整文字"问题正好印证）。

**对 Ensemble 的工程含义**：用 dnd-kit 的 `DragOverlay`（自渲染，**不依赖** HTML5 native），可以完全控制 opacity + shadow + transform，因此能同时拥有 macOS 原生气质 + spring 物理感。

### 2.6 Spring 物理参考：Joshua Comeau

来源：[Joshua Comeau - A Friendly Introduction to Spring Physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/) + [Animations and Interactions interview](https://www.epicreact.dev/modules/epic-react-expert-interviews/animations-and-interactions-with-josh-comeau)。

关键引言：

> **"Animations should be twice as fast as you think they should be. If it feels good to you with 800 milliseconds, make it 400 milliseconds."**
>
> **"A 250-millisecond animation is fast. A 350-millisecond is average. 500-millisecond is pretty slow. That's not long, right? Half a second is not a long time. It winds up being pretty sluggish when it comes to animations."**

**对本任务的指导**：
- Lift / Drop indicator 出现：**~120–180ms**（属"fast"档位，让操作即时感强）。
- Cascade 让位：**~200–250ms**（属"fast" 档位，与 NSAnimationContext 默认对齐）。
- Settle / drop：**~180–250ms** spring（既保证回弹自然又不拖沓）。
- Cancel snap-back：**~200–280ms** spring。

---

## 3. 设计规格 Spec（可直接交给实现）

> 此规格已综合：
> 1. macOS 原生 NSOutlineView 默认行为（视觉语言基底）。
> 2. Apple HIG translucent + brief + precise 原则。
> 3. Linear/Things 的 spring 物理感（cascade 部分）。
> 4. Atlassian Pragmatic D&D 的"简化 preview"教训。
> 5. Joshua Comeau "twice as fast" 原则。
> 6. 项目已有 design tokens：`#F4F4F5` hover、6px radius、13px/11px、cubic-bezier 弹簧曲线（`(0.34, 1.56, 0.64, 1)`）已存在于 `index.css`。

### 3.1 Lift（拾起）— 当用户开始拖动

**视觉变化**：

| 属性 | 值 | 说明 |
|---|---|---|
| **激活手势** | 按下后移动 ≥4px（pointer 距离）即激活 | 与 HIG "about three points" 对齐；**不要用 long-press**，违反 macOS 桌面（long-press 是 iOS 习惯） |
| **scale** | `1.0 → 1.02`（极轻微） | macOS 原生几乎不 scale；这里取 1.02 增加少许"浮起"感但不破坏比例 |
| **opacity（被拖项原位）** | `1.0 → 0.4`（淡化原位置） | 半透明留底——告诉用户"这是它原本的位置"，与 macOS 行为一致 |
| **opacity（DragOverlay 克隆）** | `0.95`（接近不透明） | macOS 原生 drag image 半透明（~0.5–0.7），但因为"原位淡化 + overlay 克隆"双重表达已经很清楚，overlay 可以稍实，便于看清内容 |
| **box-shadow** | `0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)` | 双层阴影，模拟 macOS Tahoe Liquid Glass 调性下的"浮起" — 比纯 macOS 原生（无阴影）多一点高度，但远比 Notion 的 `0 8px 24px` 克制 |
| **背景** | 保持原 `#F4F4F5`（Hover 态） | 不变色，避免视觉跳跃 |
| **timing** | 全部用 `120ms cubic-bezier(0.4, 0.0, 0.2, 1)` | 复用项目已有"轻巧过渡"曲线；120ms 属"fast" |

**Tags pill 特例**：
- pill 是 11px 文字 + `px-2.5 py-[5px]`，宽度由内容决定。lift 时**保持原宽**，不撑开。

### 3.2 Drag preview（DragOverlay）— 跟随光标的克隆

**核心决策**：用 dnd-kit `DragOverlay`（**不**用 HTML5 native drag preview），原因见 §2.5。

**视觉**：

| 属性 | 值 |
|---|---|
| **内容** | 简化版：只保留 ColorPicker 圆点 + 名字（不显示 count）；Tags 只显示文字（pill 形态保留） — **遵循 Atlassian "simplify drag previews" 教训** |
| **位置** | 跟手，offset 由 `pointer.{x,y} - element.origin` 计算（指针落在原点击位） |
| **opacity** | `0.95`（见 §3.1） |
| **rotation** | `0`（**不旋转**，原生 macOS 不旋转，Notion 旋转是 web app 风格） |
| **z-index** | 系统最高层（dnd-kit 自动） |
| **避免** | 不要 follow-with-lag、不要 elastic deformation、不要 trail effect — 这些都是"夸张 web" 风格 |

### 3.3 Drop indicator — 显示插入位置

**核心决策**：用**蓝色 insertion line**（macOS 原生标准），**不**用 gap-opening（gap 风格在 wrap 布局会引起 reflow 抖动）。

**Categories（1D 列表）的 line indicator**：

| 属性 | 值 | 说明 |
|---|---|---|
| **形状** | 水平 line | 行间插入位 |
| **粗细** | `2px` | macOS Finder 蓝线大约 1–2px；2px 在 retina 下更显眼但不刺眼 |
| **颜色** | `var(--color-accent)` 或 macOS system blue `#007AFF`（Light）/ `#0A84FF`（Dark） | 与系统 accent color 对齐；如果项目已有 accent token 则用 token |
| **长度** | 横贯 sidebar 内边距区域（左右各 12px 留白），约 `(260 - 24)px = 236px` | 确保比 dragged item 宽，从两侧都可见（Darin Senneff 的设计建议） |
| **垂直位置** | 行间正中心，`top: -1px`（覆盖在 1px 行间隙正中） | |
| **动画** | `opacity 0 → 1` over `100ms ease-out`；位置变化时用 `transform: translateY()` 平滑过渡 `150ms ease-out` | 出现快、移动平滑 |
| **末端装饰**（可选） | 左右两端各一个 `4px` 圆点（macOS Finder 风格） | 增强"插入位"语义；可省略简化 |

**Tags（2D wrap）的 indicator**：

> **关键决策点**：Tags 是 wrap 布局，不能用纯水平 line（line 在 wrap 末端到下一行起始的"折角"位置无法表达）。

**两种方案选择**：

- **方案 A（推荐）**：**短的垂直 line**（pill 之间 4px 宽 + 14px 高）—— 因为 Tags 是 horizontal flow，垂直 line 表达 "插入到这两个 pill 之间"。
- **方案 B**：**目标 pill 周围 outline ring**（2px solid accent，距离 pill 边缘 1px）+ 让位 gap —— 用 swap 算法时清晰，但 wrap 重排时会闪烁。

**采用方案 A**：

| 属性 | 值 |
|---|---|
| **形状** | 垂直 line | pill 之间插入位 |
| **粗细** | `2px` 宽 |
| **高度** | `20px`（覆盖 pill 高 18px + 上下各 1px） |
| **颜色** | 同 Categories line |
| **wrap 末端特例** | 若插入位是行末（下一个 pill 在新行），则在末尾显示**短水平 line**（24px 宽，2px 高） |
| **动画** | 同 Categories：`100ms ease-out` opacity，`150ms ease-out` translate |

### 3.4 Cascade（让位动画）— 其他项响应 dragged item 移动

**核心决策**：用 **layout animation + spring**，所有响应项**同步**让位（无 stagger），符合 macOS"crisp" 调性。

**spring 参数**（Framer Motion / Motion 风格）：

```ts
// Categories（1D）
{ type: "spring", stiffness: 600, damping: 38, mass: 1 }
// 等效近似时长 ~200ms，无明显 overshoot

// Tags（2D wrap）
{ type: "spring", stiffness: 700, damping: 42, mass: 1 }
// 略硬一些，因 wrap 重排时同时移动多个项，需要更稳定（无回弹）
```

或用 **cubic-bezier 等价近似**（如使用 dnd-kit 的 transition 配置）：

```ts
{ duration: 220, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
// 与 dnd-kit 文档默认一致；无 overshoot 的 ease-out
```

**Stagger**：**0**（所有让位项同步移动）。stagger 适合"诗意"场景，重排不需要。

**性能**：复用项目已有 `transform: translate()` 的 GPU 加速属性，避免 layout thrash。

### 3.5 Settle / drop — drop 完成时

**视觉变化**：

1. DragOverlay 消失（drop 后立即 unmount，无 fade）。
2. 原位置 item 恢复 `opacity 1.0` + `scale 1.0`。
3. 如果 dnd-kit `DragOverlay.dropAnimation` 启用：用 `{ duration: 180, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }`，让 overlay 平滑过渡到 final position。

**timing**：总 settle ≤ `200ms`。

**无 overshoot** —— 这是关键。Things 3 用 spring with overshoot 是因为它强调"falls into place" 的物理感；但本应用是工具型 sidebar，overshoot 会让人感觉"晃动"。

**触觉反馈**：macOS Force Touch trackpad 可触发 `NSHapticFeedbackPerformer.perform(.alignment, performanceTime: .now)` 在 drop 时——**可选实现**，需 Tauri 端调 macOS API。

### 3.6 Cancel — 拖到非法位置或 Esc

**两种触发**：

1. **拖出 sidebar 边界 + 释放**：HIG 推荐两种之一——
   - **回弹（snap-back）**：DragOverlay 用 `200ms cubic-bezier(0.25, 1, 0.5, 1)` 滑回原位，然后原位 opacity 恢复 1.0。
   - **蒸发（scale up + fade out）**：scale 1.0 → 1.1，opacity 0.95 → 0，over `180ms ease-out`。
   
   **采用回弹**（更符合"恢复"语义，避免用户以为项目被删除）。

2. **按 Esc 键**：同上回弹。

**反馈强度**：拖出有效区时，DragOverlay 的 opacity 可降到 `0.5` 提示"无效"（可选实现）。

### 3.7 Cursor 变化

| 状态 | Cursor |
|---|---|
| Hover 在可拖项 | `default`（保持 macOS 原生默认箭头）—— **不**用 `grab`，因为 macOS sidebar 的 hover 已经有背景色变化作为提示，加 grab cursor 反而显得 web-y |
| 按下未移动 | `default` |
| 拖动激活后 | `grabbing`（CSS `cursor: grabbing`）—— 仅在拖动时切换，不在 hover 时切换 |
| 拖到合法 drop target | `grabbing` |
| 拖到非法区域（如 sidebar 外） | `not-allowed` |
| Esc 取消 | 立即恢复 `default` |

**理由**：纯 macOS 原生不切 cursor；但用户对 grab/grabbing 已有强心智模型（Notion/Linear/Web 都这样），仅在**拖动激活后**切，是平衡点。

### 3.8 声音反馈

**不实现**。macOS 系统级 click sound 由 OS 处理，应用不应自己播放（会破坏静音环境）。

### 3.9 可访问性（Accessibility）

- **`prefers-reduced-motion: reduce`**：禁用所有 spring/easing，cascade 让位变 instant，DragOverlay 仅 opacity 切换无 transform 动画。HIG 强制要求。
- **键盘**：dnd-kit 的 `KeyboardSensor` 自带 Tab + 上下箭头 + Space 拾取/Esc 取消，开箱可用，**必须启用**。
- **VoiceOver**：dnd-kit 自带 ARIA live region announcement，但需提供本地化文案：
  - "Picked up [Category Name]. Current position 3 of 9."
  - "Moved [Category Name] to position 5 of 9."
  - "[Category Name] dropped at position 5."

---

## 4. 示意图（时序）

### 4.1 Categories 1D 列表 — 完整 lift → drag → drop 时序

```
t = 0ms          [User mousedown on "Coding" row]
                 │
                 │  (4px movement threshold)
                 ↓
t = ~16ms        [Drag activates]
                 │
                 │  Lift animation begins (120ms ease-out):
                 │  ┌──────────────────────────────┐
                 │  │ Original row:                │
                 │  │   opacity 1.0 → 0.4          │
                 │  │   scale  1.0 → 1.02          │
                 │  │ DragOverlay clone appears:   │
                 │  │   opacity 0 → 0.95           │
                 │  │   shadow 0 → spec'd          │
                 │  │   position = pointer offset  │
                 │  └──────────────────────────────┘
t = 136ms        [Lift complete, DragOverlay floating]

                 │  (User drags pointer down)
                 │
t = 200ms        [Pointer crosses midpoint of "Design" row]
                 │  ┌──────────────────────────────┐
                 │  │ Drop indicator appears:      │
                 │  │   line opacity 0 → 1, 100ms  │
                 │  │   line position = below      │
                 │  │     "Design" row             │
                 │  └──────────────────────────────┘
                 │
                 │  Cascade let-pass (220ms ease-out):
                 │  ┌──────────────────────────────┐
                 │  │ All rows below new position  │
                 │  │ shift down by row height     │
                 │  │ (synchronously, no stagger)  │
                 │  └──────────────────────────────┘
t = 420ms        [Cascade settled]

                 │  (User releases mouse)
                 │
t = 600ms        [mouseup]
                 │
                 │  Settle animation (180ms ease-out):
                 │  ┌──────────────────────────────┐
                 │  │ DragOverlay slides to        │
                 │  │   final destination          │
                 │  │ Drop indicator fades 1 → 0   │
                 │  │ Original row at new          │
                 │  │   position: opacity → 1.0,   │
                 │  │   scale → 1.0                │
                 │  └──────────────────────────────┘
t = 780ms        [Drop complete, normal state restored]

                 │  (Behind the scenes:
                 │   - Optimistic state update
                 │   - Async IPC call to Rust backend
                 │   - On error: silent revert + toast)
```

### 4.2 Tags 2D wrap — drop indicator 切换示意

```
Before drag:
  [CSS]  [TS]  [Rust]  [Vim]  [Tmux]
  [Docker]  [Kubernetes]  [Linux]

User picks up [Vim] and drags it left toward [TS]:

  [CSS]  [TS]  │  [Rust]  [···]  [Tmux]
              ↑
        (vertical line indicator, 2px wide × 20px tall)

Original [Vim] in dim state (opacity 0.4)
DragOverlay clone of [Vim] follows cursor

User drags further to between [Docker] and [Kubernetes]:

  [CSS]  [TS]  [Rust]  [···]  [Tmux]
  [Docker]  │  [Kubernetes]  [Linux]
            ↑
       (line jumps; cascade re-flows other tags)

User drops:

  [CSS]  [TS]  [Rust]  [···]  [Tmux]
  [Docker]  [Vim]  [Kubernetes]  [Linux]
```

### 4.3 Cancel snap-back

```
t = 0ms          [User dragged DragOverlay outside sidebar bounds]
                 │
                 │  cursor changes to not-allowed
                 │  DragOverlay opacity → 0.5 (warning)
                 │
t = 800ms        [User releases (mouseup)]
                 │
                 │  Snap-back animation (200ms ease-out):
                 │  ┌──────────────────────────────┐
                 │  │ DragOverlay slides back to   │
                 │  │   source position            │
                 │  │ opacity 0.5 → 0 over last    │
                 │  │   80ms                       │
                 │  └──────────────────────────────┘
t = 1000ms       [Original row restored to opacity 1.0]
                 │
                 │  No state change, no IPC
```

---

## 5. 引用源

### Apple 官方
- [Apple HIG — Drag and drop](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop) — translucent representation 推荐、3-point activation、cancel feedback 两种模式（accessed 2026-05-03）
- [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion) — brevity & precision、reduce motion、follow gestures
- [Customize the Finder sidebar on Mac — Apple Support](https://support.apple.com/guide/mac-help/customize-the-finder-sidebar-on-mac-mchl83c9e8b8/mac) — Finder sidebar reorder 行为
- [Move reminders on Mac](https://support.apple.com/guide/reminders/move-reminders-remnda262a43/mac) — Reminders 拖拽行为
- [Organize reminder lists on Mac](https://support.apple.com/guide/reminders/organize-reminder-lists-remnee767c58/mac) — Reminders sidebar 拖拽
- [Add and remove folders in Notes on Mac](https://support.apple.com/guide/notes/add-and-remove-folders-apd558a85438/mac) — Notes folder 拖拽
- [Customize the Music window on Mac](https://support.apple.com/guide/music/customize-the-music-window-mus0cec331d6/mac) — Music sidebar reorder
- [WWDC 2011 Session 120 — View Based NSTableView Basic to Advanced](https://nonstrict.eu/wwdcindex/wwdc2011/120/) — NSTableView 的 gap 风格、animatesToDestination、drop animation API

### macOS 系统行为引用
- [Drag and Drop to Reorder NSTableView — samwize](https://samwize.com/2018/11/27/drag-and-drop-to-reorder-nstableview/) — moveRow + beginUpdates/endUpdates 使用模式
- [Michael Tsai — Using Drag and Drop with NSTableView](https://mjtsai.com/blog/2019/04/02/using-drag-and-drop-with-nstableview/) — gap style 实现注意（heightOfRow bug）、insertion line vs gap 比较
- [Implementing Drag And Drop Operations Using NSPasteboard — AppCoda](https://www.appcoda.com/nspasteboard-macos/) — dataWithPDF 生成 drag image 模式
- [NSOutlineView — Apple Developer](https://developer.apple.com/documentation/appkit/nsoutlineview) — Outline view rearrange 默认行为
- [How to customize Sidebar in macOS — AppleInsider](https://appleinsider.com/inside/macos/tips/how-to-customize-sidebar-in-the-macos-finder) — "drop it when you see the small blue line between folders" 描述

### 第三方应用
- [Cultured Code — Things 3 Features](https://culturedcode.com/things/features/) — "Beautiful Animations… custom built animation toolkit"
- [Cultured Code — Moving Items in Things support](https://culturedcode.com/things/support/articles/9651894/) — drag and drop 行为描述
- [Things 3: Beauty and Delight in a Task Manager — MacStories](https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/) — "long-press a task to make it pop out of the list"、"meaningful tactile engagement"
- [Linear Changelog — Improved Drag & Drop (2023-04-27)](https://linear.app/changelog/2023-04-27-improved-drag-and-drop) — drag between groups, auto status update
- [Linear Changelog — Personalized sidebar (2024-12-18)](https://linear.app/changelog/2024-12-18-personalized-sidebar) — "drag & drop to reorder items"
- [Linear Now — How we redesigned the Linear UI (part Ⅱ)](https://linear.app/now/how-we-redesigned-the-linear-ui) — "calmer, more consistent" 设计语言
- [The Elegant Design of Linear.app — Tela Blog](https://telablog.com/the-elegant-design-of-linear-app/) — "soft and timely, flow like water" 用户感受
- [Craft Review — MacStories](https://www.macstories.net/reviews/craft-review-a-powerful-native-notes-and-collaboration-app/) — "the first notes app I've used that was clearly built from the ground up with drag and drop in mind"
- [Bear Community — Distractionful reordering by drag&drop](https://community.bear.app/t/distractionful-reordering-of-text-by-drag-drop/2841) — "we don't want to go against how drag and drop of text works across the macOS platform"、用户对完整文字 preview 的吐槽
- [Notion Help — Navigate with the sidebar](https://www.notion.com/help/navigate-with-the-sidebar) — "drag and drop! Nest pages by dragging one into another. You'll see the selected page highlight blue."
- [r/Notion — Product Feedback](https://www.reddit.com/r/Notion/comments/1gk8qjl/product_feedback_for_notion/) — Notion 移动端"Drag & Drop pretty much doesn't work"
- [Apple Discussions — Moving Folders in Apple Notes on a mac](https://discussions.apple.com/thread/255726330) — Notes 拖拽 "not intuitive" 用户反馈
- [Designing a reorderable list component — Darin Senneff](https://www.darins.page/articles/designing-a-reorderable-list-component) — drop indicator line 长度建议（覆盖整列宽以避免被 dragged item 遮挡）

### 工程库与设计哲学
- [Atlassian Design — Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/core-package/)
- [Atlassian Blog — The journey of pragmatic drag and drop](https://www.atlassian.com/blog/design/designed-for-delight-built-for-performance) — "you cannot control the opacity or box shadow on the drag preview" 关键工程教训、"lines, borders and background colors" 设计语言
- [dnd-kit — DragOverlay (React)](https://dndkit.com/react/components/drag-overlay) — DragOverlay API 与 dropAnimation 配置
- [dnd-kit Sortable — Animations](https://dndkit.com/concepts/sortable) — `cubic-bezier(0.25, 1, 0.5, 1)` 默认 transition
- [Motion (Framer Motion) — Reorder](https://motion.dev/docs/react-reorder) — Reorder.Group/Item 用于简单场景；复杂场景推荐 dnd-kit
- [Top 5 Drag-and-Drop Libraries for React in 2026 — Puck](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) — "feels extremely smooth and satisfying" 对 dnd-kit 的评价

### 动画物理
- [Joshua Comeau — A Friendly Introduction to Spring Physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/) — spring 心智模型与 stiffness/damping 直觉
- [Joshua Comeau — Boop! A hover animation](https://www.joshwcomeau.com/react/boop/) — react-spring 用法
- [Animations and Interactions with Josh Comeau — Epic React](https://www.epicreact.dev/modules/epic-react-expert-interviews/animations-and-interactions-with-josh-comeau) — "twice as fast as you think" / "250ms is fast, 350ms average, 500ms slow"

### 未能确认的细节（不能 trace 到具体来源）
- Things 3 Mac 版具体的 spring stiffness/damping 数值（仅有"falls into place" / "Beautiful Animations" 定性描述）—— **未能确认精确物理参数**。
- Linear 的 drop indicator 精确粗细与颜色 token —— 仅有 "soft and timely" 定性描述，未在公开 design doc 中找到精确像素值。
- Safari tab drag 时的 scale 数值（约 1.02–1.05 是经验估计，**未能确认精确值**）。
- Apple Music sidebar reorder 是否有让位 cascade —— Apple Support 仅说 "drag" 不描述视觉过程，**仅描述行为，未确认细节动画**。
- macOS 系统是否在 drop 时有 click sound 反馈 —— 取决于用户系统设置，**无统一答案**。
