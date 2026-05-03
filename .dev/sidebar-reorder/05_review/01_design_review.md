# Design Review

> 评审对象：`02_design_spec.md`
> 评审基线：`01_research/05_macos_patterns.md` + `01_research/02_animation_physics.md` + `src/index.css`（项目已有 design tokens）+ 用户对"考究、精致、细节、克制、物理级别动效"的极高要求
> 评审时间：2026-05-03
> 评审标准：Linear / Things 3 / Craft 团队的 macOS 设计审查官口径
> 评审强制性规则：只要存在 P0 问题，总评分 ≤ 8。10/10 必须真的 10/10。

---

## 总评分：6.8 / 10

**关键判断**：当前 spec 在"基底气质"层面已正确（macOS 蓝插入线 / DragOverlay 自渲染 / spring 让位 / 不旋转 / 无 overshoot），但在以下三点上**与同源 research 文档发生回归**，且这些点都是用户原文里反复强调的"魔鬼细节"：

1. **Lift 视觉指令"原位 opacity 0.4"与 research 文档 `02_animation_physics.md` §3.1 / §A.2 明确结论"opacity 应当是 0（消失，让位填空间）"**相互矛盾，且向 Atlassian/jQuery UI 老 web 风格倾斜，破坏 macOS 原生气质。
2. **drop indicator 颜色 `#0063E1` 是项目内**input selection 颜色**的硬编码（spec §1 第 17 行自陈），不是设计系统已注册的 token；同时**没有定义 dark mode**或与 macOS system accent 联动方案，写死十六进制色值是设计系统层面的回归。
3. **"磁吸 snap" 这一用户原文重点强调的物理感知**在 spec 中**完全缺席**，而 research 文档 `02_animation_physics.md` §1.3 明确写出了"距离 < 12px 自动吸附"的具体实施路径——spec 阶段把它丢了。

此外，spec 还存在"端点小圆点被取消却没说理由"、"Tags pill scale 1.04 的合理性未论证"、"settle 距离-比例公式缺失"等多项 P1 问题。

详见下表与下文分项展开。

---

## 维度评分

| 维度 | 分数 | 主要扣分点 |
|---|---|---|
| 1. macOS 原生气质契合度 | 6 / 10 | §2.1 原位 opacity 0.4 是 Atlassian/Trello 风格，与 macOS Finder/Notes/Reminders 的"占位完全消失 + 让位填补"行为相反；§2.3 取消端点小圆点降低可识别性 |
| 2. 物理真实感（spring 曲线/cubic-bezier） | 7 / 10 | spec 全文几乎只用 cubic-bezier，未给等价 spring 参数（research 已表格化提供），实施时风险高；settle 用固定 180ms 违反"duration 与距离成正比"的 NN/G 原则；缺失"磁吸 snap" |
| 3. 克制 vs 表达力的平衡 | 8 / 10 | 整体克制得当；但 Tags pill `scale 1.04` 与 Categories `1.02` 不一致且无依据；DragOverlay opacity 0.95 与原位 opacity 0.4 同时存在造成"双重表达"信息冗余 |
| 4. 设计语言一致性 | 5 / 10 | `#0063E1` 是硬编码十六进制而非 token；没有引入 `--ease-drag` / `--duration-drag-*` 等 research 文档明确建议的新 token；阴影也用十六进制 rgba 写死而非 hsl 多层（违反 research §1.6） |
| 5. 细节考究度 | 6 / 10 | wrap 末端处理仅一行（§2.3）未画示意；编辑态 fallback 仅说"disabled"未说视觉态；cursor 切换在"未达 4px"阶段保持 default 是对的，但"hover 时 cursor 是否切 grab"的争议结论与 research 不一致需明确；ColorPicker 圆点点击隔离规则没规定容差 |
| 6. 可访问性 | 7 / 10 | reduced-motion 写了但只一段；键盘只点名"dnd-kit 自带"未明确快捷键映射；VoiceOver 文案用占位"Category Name"未给出具体本地化字符串；缺失 WCAG 2.5.7 dragging movements 的"alternative"声明 |
| 7. acceptance 清单 | 6 / 10 | 16 项中 8 条是行为/功能验收（如"单击仍能 navigate"），属于 03_tech_plan 范畴；真正属于"视觉效果"的只有 5 条（lift 启动/cascade 无 jank/wrap 末端/settle 无 overshoot/Esc 取消顺滑），且都没给"可量化"的判定方法（怎么算"无 jank"？什么叫"顺滑"？） |
| 8. 示意图与时序 | 7 / 10 | §3 和 §4 时序清晰，但缺失关键状态：拖动期间在合法 ↔ 非法区域切换的过渡时序；磁吸 snap 时序；cancel 期间 DragOverlay opacity 由 0.5 恢复到原位的时序 |

**加权平均**：(6+7+8+5+6+7+6+7) / 8 = **6.5**

**调整**：考虑到 spec 整体框架正确、文档结构清晰、核心争议有意识地做了取舍（如"不实现触觉反馈"等），加 0.3 主观调整 → **6.8**

**触发 P0 上限规则**：本评审下文将列出 4 个 P0 问题，按规则总评分必须 ≤ 8。当前 6.8 在上限内，无需进一步压低。

---

## 阻断性问题（P0 — 必改才能 10/10）

### P0-1：Lift 时"原位 opacity 0.4"与 research 文档结论及 macOS 原生气质冲突

**出处**：`02_design_spec.md` §2.1 第 5 行 "原位 opacity | 1.0 → 0.4"；§1 第 19 行"新增 极轻 lift（scale 1.02、opacity 原位 0.4）"

**冲突文档**：
- `01_research/02_animation_physics.md` §3.1 误区 4 明确写："**避免**：拖项保持 opacity 1.0，原位置可以选择 opacity 0（消失）或 opacity 0.4 占位（**仅 Atlassian 风格 — 本应用建议完全消失配合 reorder 让位**）"
- 同文档 §A.2 代码示例 `.sortable-item--placeholder { opacity: 0; /* 原位置消失（让位动画填满空间）；不用 opacity 0.4 */ }` —— **代码注释直接否定 0.4 方案**
- `01_research/05_macos_patterns.md` §2.1 描述 macOS Finder/Notes/Reminders 行为："drop 后整体重排"，没有任何"原位半透明保留"的描述

**为什么是 P0**：
1. 0.4 半透明占位是 Atlassian Pragmatic D&D 公开的设计 token（research §2.5），是 Jira/Trello 卡片式 D&D 的标志性视觉。研究文档已把这个 token 单独点出**并明确否定**适配本应用。
2. macOS 原生 NSOutlineView 的让位行为是"原位**消失**让位填空间"，这是用户的肌肉记忆。保留半透明占位会让用户觉得"这一行还在但变灰了"，与"我把它拖走了"的心智模型不符。
3. spec 同时启用"原位 0.4 + DragOverlay 0.95 + cascade 让位"三件套时，会出现**视觉信息冗余甚至矛盾**：一边告诉用户"原位还在那里（半透明）"，另一边告诉用户"它跟着你的指针走（DragOverlay）"，第三边"周围项移动让位"。三种信号相互打架，不是克制。

**修改要求**：
- §2.1 表格"原位 opacity"行：1.0 → **0**（瞬时消失）
- §2.1 表格"原位 scale"行：直接删除（既然消失了，scale 无意义）
- §2.6 cancel 时"原位 opacity 0.4 → 1.0" 改为"原位 opacity 0 → 1.0"
- §2.5 settle "原位 opacity 0.4 → 1.0" 改为"原位 opacity 0 → 1.0"，且应当在 DragOverlay 抵达目标位前完成（不是之后）

---

### P0-2：缺失"磁吸 snap"——用户原文重点要求的物理感知

**出处**：用户原始任务文 `00_understanding.md` §1 任务原文："物理级别动效（**Spring 曲线/磁吸**/自然/流畅）"——"磁吸"与"Spring 曲线"并列，是用户明确点名的两大物理需求之一。

**冲突文档**：
- `01_research/02_animation_physics.md` §1.3 "Settle" **明确给出实施细节**："**关键：磁吸（snap）应当存在但极克制**：当被拖项中心距离最近 slot 中心 < 12px 时，drop overlay 的目标位置直接吸附到 slot 中心（不要等到 mouseup，让位时就要把 slot 中心标记好）。不要做'加速吸附'动画（会让人觉得有 hidden hand 抢过控制权）"
- spec §2.5 settle 完全没提磁吸；§2.4 cascade 只说"等位置变化"，没说"接近时是否提前对齐到 slot 中心"
- spec §2.2 DragOverlay "跟手位置 = pointer.{x,y} - element.origin"——这是**纯跟手**模型，与"磁吸"互斥

**为什么是 P0**：
1. 用户在原文里**点名要"磁吸"**，spec 阶段把它丢了，是直接背离需求。
2. research 文档已经把磁吸的物理逻辑详细写出（中心距 12px 内吸附、不做加速动画），spec 阶段不应该重新讨论"是否实现"，应该讨论"如何精确实施"。
3. 没有磁吸的拖拽是"鼠标位置 = overlay 位置"的纯跟手感，缺少"靠近目标时的物理引力"——这正是 Things 3 / Linear 让用户觉得"丝滑"的核心机制。
4. 工程实现成本极低（dnd-kit 的 collision detection 已暴露 closest-corner / closest-center API，加一个 12px snap distance 在 modifier 里实现即可）。

**修改要求**：
- §2.5 settle 表格新增一行："磁吸阈值 | 12px（被拖项中心 vs 目标 slot 中心）"
- 新增 §2.5.1 "磁吸 snap 行为细则"：
  - 阈值：被拖项几何中心距离最近 slot 中心 ≤ 12px 时触发
  - 视觉：DragOverlay 在 last frame（mouseup 前）平滑过渡到 slot 中心，**不**带"加速感"，时长 80ms ease-out
  - 不做：吸附时不发出额外触觉/动效（保持 macOS 克制气质）
  - 退出：用户在 12px 阈值外移动 > 4px 时立即解除吸附，DragOverlay 恢复纯跟手
- §3 时序图新增 t=540 阶段："pointer 进入磁吸阈值，DragOverlay 平滑对齐 slot 中心"
- §5 acceptance 新增第 17 项："☐ 拖动至接近 slot 中心 ≤ 12px 时 DragOverlay 自动微调对齐"

---

### P0-3：Drop indicator 颜色硬编码 `#0063E1`，违反设计系统

**出处**：`02_design_spec.md` §1 第 17 行"新增 macOS 蓝插入线（沿用项目 `#0063E1`，已用于 input selection，是 macOS-blue 亲缘色）"；§2.3 颜色字段直接写"`#0063E1`"

**冲突基线**：
- `src/index.css` 第 30-55 行：项目 `:root` 中**没有** `--color-accent` 或 `--color-blue` token；现有色 token 都是中性灰系（`--color-primary`、`--color-bg-tertiary` 等）
- `01_research/02_animation_physics.md` §1.5 明确建议"颜色：用 `--color-bg-tertiary` 的更深 tint，或者直接用 macOS 系统强调色（`--color-accent`，本项目应该有）"——research 阶段已经预设"应该有 token"
- 同文档附录 B"建议新增一条 token"段：`--ease-drag` / `--ease-drag-lift` / `--duration-drag-lift` 等专用 token

**为什么是 P0**：
1. 把"input selection 颜色"挪用到 drop indicator 是**设计 debt**：两者语义无关（一个是文本焦点，一个是位置插入）。任何一方将来想调色都会牵连另一方。
2. 没有 token 化意味着 dark mode 必须在每个使用点单独 hardcode override——此项目 `index.css` 已经有 `--color-bg-primary` 等亮/暗适配位，drop indicator 不应当例外。
3. macOS Tahoe / Sequoia 的 Liquid Glass 设计语言鼓励 accent color 跟随 system preferences（用户在 System Settings 选了什么 accent，应用自动跟随）。Tauri 可通过 `window.matchMedia('(prefers-color-scheme: dark)')` + macOS API 拿到 `NSColor.controlAccentColor`，spec 应当为这个未来留路。
4. research 文档明确把这个事预警到了，spec 还是写死了——这是规划→实施回归。

**修改要求**：
- 新增 `src/index.css` token 章节（spec 应当声明，不仅仅是引用）：
  ```css
  :root {
    --color-accent: #0063E1;          /* macOS system blue 近似色 */
    --color-accent-soft: #0063E150;   /* 50% alpha，用于 indicator 末端淡出 */
    --ease-drag: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-drag-lift: cubic-bezier(0.34, 1.32, 0.64, 1);
    --duration-drag-lift: 180ms;
    --duration-drag-reorder: 220ms;
    --duration-drag-settle: 200ms;
    --duration-drag-cancel: 280ms;
    --duration-drag-snap: 80ms;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --color-accent: #0A84FF;        /* macOS dark mode system blue */
    }
  }
  ```
- §2.3 所有"`#0063E1`" 替换为 "`var(--color-accent)`"
- §1 第 17 行删除"沿用项目 `#0063E1`，已用于 input selection"，改为"新增 `--color-accent` token，独立于 input selection 焦点色"
- §2.3 注明 indicator 末端淡出方案（如果保留端点圆点 P1 修复后）使用 `--color-accent-soft`

---

### P0-4：Acceptance 清单 8 项是行为验收，"视觉效果"硬条件不足且无量化判定

**出处**：`02_design_spec.md` §5 共 16 项

**问题分解**：
- 第 7-13 项（共 7 条）属于"现有手势不被打断"的行为验收，应该归到 `03_tech_plan.md` 的回归测试，不该占用设计 acceptance 名额
- 第 15-16 项是 a11y 和文案，属于另一维度
- **真正描述"视觉/动效效果"的只有第 1-6、第 14 项 = 7 条**，且都用主观词："肉眼不应感到"、"无 jank"、"顺滑无跳帧"——**没有可量化的判定方法**
- 缺失关键视觉条件：
  - 磁吸 snap 行为（见 P0-2，本身缺失）
  - DragOverlay 阴影是否符合 multi-layer 规范（见 P1-3）
  - drop indicator 末端处理（直角？圆角？）
  - cancel 过渡到非法区域时 cursor 切换的延迟（不应有 flicker）
  - dark mode 下 indicator 颜色是否正确切换

**为什么是 P0**：
- 没有可量化 acceptance，10/10 永远无法被"客观确认"。
- spec 本意是"实施前对齐 / 实施后验收"，acceptance 模糊就等于把"是否达到 10/10"的判断权转嫁给评审者主观感受，违反"评审标准应当先于评审"的工程原则。

**修改要求**：
- §5 拆为两节：
  - §5.1 视觉效果硬条件（必须可量化）
  - §5.2 行为/功能回归（移到 03_tech_plan）
- §5.1 至少包含以下可量化条件（举例）：
  1. ☐ Lift 启动到 DragOverlay 出现：单帧延迟，DevTools Performance 测量首帧 ≤ 16.7ms
  2. ☐ Cascade 让位：DevTools Performance Long Tasks 0 个，FPS 全程 ≥ 58
  3. ☐ DragOverlay 阴影：截图比对，三层 hsl 阴影各层都可识别（参考 `02_animation_physics.md` §1.6 的精确值）
  4. ☐ Drop indicator 颜色：截图取色 = `var(--color-accent)` 解析后的 hex
  5. ☐ Drop indicator 在 wrap 末端：截图比对短水平线 24×2px，端点对齐 pill 容器右边缘
  6. ☐ Settle 无 overshoot：录制 200ms drop 全过程，逐帧检查 transform.scale 单调递减到 1.0，无 > 1.0 的中间帧
  7. ☐ 磁吸 snap：模拟 pointer 进入 slot 中心 12px 内，DragOverlay translateX/Y 在 80ms 内达到 slot 中心 ±0.5px 内
  8. ☐ Esc 取消：录制取消全过程，DragOverlay 路径单调向源位置回退，无中途反向
  9. ☐ Reduced motion：DevTools 启用 prefers-reduced-motion，DragOverlay 切换 0 transition duration（除位置跟手外）
  10. ☐ Dark mode：切换 system color scheme，drop indicator 颜色由 `#0063E1` → `#0A84FF` 立即生效
- §5.2 列出原 7-13 项 + 第 16 项

---

## 重要问题（P1 — 强烈建议改）

### P1-1：Tags pill `scale 1.04` 与 Categories `1.02` 不一致且无依据

**出处**：§2.1 与 §2.2 表格

spec 把 Tags pill 的 lift scale 设为 1.04，理由"pill 较小，需略大一些视觉感受"。但：
- research 文档 `02_animation_physics.md` §1.1 明确说"整个被拖项 scale 1 → 1.02（极克制；Cultured Code Things 的 Magic Plus 是 1.05，但本应用是 sidebar 行更小，1.02 更合适）"——research 已经针对"小元素"给出 1.02 结论，没有给"更小的 pill 用更大 scale"的二次结论。
- "更小元素需要更大 scale"这个直觉并不正确：scale 是相对值，1.02 在 13px 行上和 1.02 在 11px pill 上**视觉感知相同**（因为视觉系统对 scale 比例敏感而非绝对像素差）。
- 不一致导致 Categories 与 Tags 拖动时"手感不同"，破坏一致性。

**修改要求**：
- §2.1 Tags pill 原位 scale: 1.04 → **1.02**
- §2.2 Tags DragOverlay scale: 1.04 → **1.02**

### P1-2：取消 drop indicator 端点小圆点的决定无依据，且降低可识别性

**出处**：§2.3 Categories indicator 表"装饰 | 不加端点小圆点（保持极简）"

- research 文档 `02_animation_physics.md` §1.5 与 `05_macos_patterns.md` §3.3 都建议"端点：8px 圆点（参考 Atlassian Pragmatic D&D 的 terminal diameter 8px），让线条不刺眼"——两份 research 都把端点作为**正向设计要素**。
- macOS Finder sidebar 的 insertion line 实测两端是有圆角端点（NSAttributedString.LineCapStyle.round）的，纯直角线条反而是 web app 的"裸线"风格。
- "保持极简"不是充分理由——端点 4-8px 圆点本身就是 macOS 极简语言的组成。

**修改要求**：
- §2.3 Categories indicator 装饰行改为"端点：左右各一个 4×4px 圆点（与 line 同色，圆角填充），与 line 中线对齐"
- §2.3 Tags 同理在垂直 line 顶/底端各一个 4×4px 圆点
- 注：8px 在 sidebar 260px 宽度下偏粗，4px 是更克制的选择

### P1-3：阴影写死 rgba 单层，未采用 research 推荐的多层 hsl 方案

**出处**：§2.2 DragOverlay box-shadow

spec 写："`0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)`"

虽然是双层，但与 research 文档 `02_animation_physics.md` §1.6 推荐的**三层 hsl(220 30% 0% / α)** 相比：
1. 用 `rgba(0,0,0,...)` 是纯黑，research 明确指出"macOS 风格阴影偏冷：可用 `hsl(220 30% 0% / α)` 而非纯黑"
2. 缺少最外层柔光（`0 12px 24px ...`）——研究指出三层叠加才有"漂浮感"
3. 没有给 reduced-motion 下的简化阴影

**修改要求**：
- §2.2 DragOverlay box-shadow 改为：
  ```css
  0 1px 2px hsl(220 30% 0% / 0.08),
  0 4px 8px hsl(220 30% 0% / 0.10),
  0 12px 24px hsl(220 30% 0% / 0.08)
  ```
- Tags 同理（可按比例减小最外层 spread）：
  ```css
  0 1px 2px hsl(220 30% 0% / 0.06),
  0 3px 6px hsl(220 30% 0% / 0.08),
  0 8px 16px hsl(220 30% 0% / 0.06)
  ```
- §2.11 reduced-motion 新增"box-shadow 改为 0 0 0 1px var(--color-accent)（仅描边，无浮起）"

### P1-4：Settle 时长固定 180ms 违反"duration ∝ distance"原则

**出处**：§2.5 "DragOverlay 消失 | 用 dnd-kit `dropAnimation`：`{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }`"

research 文档 `02_animation_physics.md` §1.3 明确："**duration = `Math.min(280, 120 + distance * 0.5)`**，与距离成正比但封顶"，并引用 NN/G "drag end animation must be roughly proportional to distance, but never longer than feels snappy"。

固定 180ms 的问题：
- 拖了 5px 也是 180ms → 拖泥带水
- 拖了 200px 也是 180ms → 瞬移感
- 用户对"距离 vs 时长"有强物理直觉，违反会感到"假"

**修改要求**：
- §2.5 表格"DragOverlay 消失"行：duration 改为公式 `Math.min(280, 120 + distance * 0.5)`，最小 120ms 最大 280ms
- 实施层注：dnd-kit `dropAnimation` 接受 function `({ active, dragOverlay }) => ({ duration, easing })`，可在此计算 distance

### P1-5：原文档自评"§1 设计哲学"与多项规格细则有内部不一致

**出处**：§1 第 12 行"全程 ≤ 280ms 不喧宾夺主"

但具体规格中：
- §3 时序图 t=420 cascade settled，t=600 mouseup，t=780 完成 —— 单个交互全程 780ms，远超 280ms
- §2.4 Tags cascade duration 240ms + §2.5 settle 180ms = 420ms 串行 —— 也超 280ms
- §1 这个"≤ 280ms"是**研究文档对"单一动效片段"的要求**，spec 错把它表述为"全程"

**修改要求**：
- §1 第 12 行改为"**所有单一动效片段 ≤ 280ms 不喧宾夺主**"
- 或改为"**lift / settle / cancel 单段 ≤ 280ms；cascade 多项联动可适当延长但不超 320ms**"

### P1-6：spec 全文没有 spring 等价参数，只用 cubic-bezier

**出处**：§2.4 等价 spring（如 motion）单独列出 `{ stiffness: 600, damping: 38 }`，但 §2.1 lift / §2.5 settle / §2.6 cancel 都只给 cubic-bezier

research 文档 `02_animation_physics.md` 已经用整张附录 C 把 react-spring / motion / SwiftUI / Apple bounce 四套参数对照写好，spec 只挑了一种。问题：
- 实施时如果选择 motion / react-spring 而非纯 CSS，没有 spec 对照值
- spring 的物理感与 cubic-bezier 不完全等价（spring 有 mass，会随 viewport 速度自适应，cubic-bezier 不会）
- 用户原文要求"Spring 曲线/磁吸"——Spring 是用户指名的物理模型，spec 阶段不应当只给 cubic-bezier

**修改要求**：
- §2.1 lift、§2.5 settle、§2.6 cancel、§2.3 indicator 移动 各表格新增"等价 spring (motion)"行，数值从 research 附录 C 抄入：
  - Lift: `{ stiffness: 400, damping: 30, mass: 1 }`
  - Settle: `{ stiffness: 350, damping: 35, mass: 1 }` + `clamp: true` 等价
  - Cancel: `{ stiffness: 280, damping: 32, mass: 1 }`
  - Indicator 移动: `{ stiffness: 600, damping: 38, mass: 1 }`

### P1-7：cursor 在 hover 时维持 default 的决定与多数 web 用户预期不符

**出处**：§2.7 表"Hover 在可拖项 | default（不切 grab，符合 macOS 气质）"

- macOS 原生 NSOutlineView **从不切 cursor 表示可拖**——这点 spec 是对的
- 但本应用是**Tauri = WebView**，用户认知模型混合"macOS 应用 + 网页"，对"hover 出现 grab cursor 表示可拖"的提示有期待
- research 文档 `01_research/05_macos_patterns.md` §3.7 实际写的是"Hover 在可拖项 | `default`...仅在拖动激活后切换，是平衡点"——research 也确实倾向 default，但留了"用户对 grab 已有强心智模型"的注脚
- 取消 hover 切 grab 后，用户**无视觉提示告知"这个项可拖"**，可发现性下降

**修改要求**（二选一）：
- 方案 A（保守，与 spec 一致）：保留 default，但**新增**"按下未达 4px"阶段切 grab 作为"用户可能要拖"的反馈（spec 现在是 default → 不变 → grabbing 三态突变，缺少中间态）
- 方案 B（折中）：hover **不**切 grab，但在拖动激活前对 hover 行整体加一个 0.5s 后才出现的"⠿ drag handle hint icon"（透明度 0.3，仅当 hover ≥ 500ms），符合"克制但留余地"

**推荐方案 A**——成本低，与 macOS 渐进披露逻辑契合。

### P1-8：Reduced motion 段落过简，不符合 WCAG 2.5.7

**出处**：§2.11 仅 3 条规则

WCAG 2.5.7 Dragging Movements (Level AA) 要求"涉及拖动手势的功能必须有非拖动替代"——spec 仅在 §5 第 15 条提到"键盘可达"，但没明确：
- 拖动**完全失败**的回退（如键盘也无法操作的极端 a11y 场景，是否提供 ContextMenu "Move Up / Move Down" 选项？）
- reduced motion 下 cursor 是否仍切 grabbing
- VoiceOver 下 DragOverlay 是否朗读为"Dragging [Name]"

**修改要求**：
- §2.11 扩展为：
  - 所有 transition duration → 0ms
  - DragOverlay 仍渲染（功能不阉割），仅取消所有 transform/opacity 动画
  - cursor 仍切 grabbing（cursor 切换不属于"motion"）
  - box-shadow 简化为 1px solid outline（见 P1-3）
- 新增 §2.11.1 "完全无动作可达性回退"：在 Category/Tag 右键 ContextMenu 增加"Move Up / Move Down / Move to Top / Move to Bottom"四个选项（满足 WCAG 2.5.7 Single Pointer alternative）

---

## 可优化（P2 — 时间允许时改）

### P2-1：DragOverlay 跟手 offset 计算未考虑 retina 高 DPI

§2.2 "跟手位置 = pointer.{x,y} - element.origin" 在 retina 显示器上需要确认 pointer 坐标是 device pixel 还是 CSS pixel，spec 应当写明"使用 CSS pixel 坐标，由浏览器自动 DPI 适配"。

### P2-2：§2.10 错误指示"红色 5px 圆点"未规定显示位置精确值

"在 sidebar 顶部（refresh 按钮旁）"过于模糊——左 4px? 上 2px? 应当给精确 absolute position。

### P2-3：§2.9 "Show X more" 折叠态 drop 后保持展开的视觉过渡缺失

折叠 → 展开的过渡是已有 UX 还是新增？如果是新增，应当复用项目已有动效（modal-dialog-zoom-in 类似的 200ms ease-out？）。spec 没说。

### P2-4：spec 没有"双 list 联动"的禁止说明

Categories 与 Tags 是独立 list，但 spec 没明确禁止"从 Categories 拖到 Tags"或反之。dnd-kit 默认允许跨 SortableContext 拖动，spec 应当明确写"两个 list 互不交叉"。

### P2-5：§3 时序示意图的 ASCII art 在阅读上不直观

考虑用 Mermaid sequenceDiagram 重写，或在 spec 配套渲染一份 SVG 时序图（用 Pencil / Figma）。

### P2-6：缺少"长按是否替代 4px 距离"的明确说明

`02_animation_physics.md` §1.1 提到 dnd-kit 默认是"5px 或长按 200ms 二选一"——spec 只提了 4px 距离，没说长按是否启用。建议明确"不启用长按（仅距离激活），保持 macOS 桌面端气质"。

### P2-7：DragOverlay 内容删除 count 的决策合理但缺少示意

§2.2 "Categories 内容 | ColorPicker dot + 名字（**省略 count**）"——决策好，但应当配一张"原行 vs DragOverlay 行"对比示意图，避免实施时误以为要保留 count。

### P2-8：Tags wrap 末端短水平线 `24px × 2px` 的对齐基准未定义

§2.3 写 wrap 行尾用短水平线，但没说线在容器右边缘的偏移（贴边？留 4px？居中于行末空白？）。

---

## 改进建议（具体可执行 · 按优先级排）

### A. CSS Token 扩充（10 分钟可完成）

在 `src/index.css` `:root` 块新增：

```css
/* Drag & Drop tokens */
--color-accent: #0063E1;
--color-accent-hover: #0052B8;
--color-accent-soft: rgba(0, 99, 225, 0.32);
--ease-drag: cubic-bezier(0.16, 1, 0.3, 1);
--ease-drag-lift: cubic-bezier(0.34, 1.32, 0.64, 1);
--duration-drag-lift: 180ms;
--duration-drag-reorder: 220ms;
--duration-drag-reorder-wrap: 240ms;
--duration-drag-settle-base: 120ms;     /* + distance * 0.5, max 280 */
--duration-drag-cancel: 280ms;
--duration-drag-snap: 80ms;
--shadow-drag-lift:
  0 1px 2px hsl(220 30% 0% / 0.08),
  0 4px 8px hsl(220 30% 0% / 0.10),
  0 12px 24px hsl(220 30% 0% / 0.08);
--shadow-drag-lift-pill:
  0 1px 2px hsl(220 30% 0% / 0.06),
  0 3px 6px hsl(220 30% 0% / 0.08),
  0 8px 16px hsl(220 30% 0% / 0.06);

@media (prefers-color-scheme: dark) {
  :root {
    --color-accent: #0A84FF;
    --color-accent-hover: #0974E6;
  }
}
```

### B. spec §2.1 整改（5 分钟）

把"原位 opacity | 1.0 → 0.4"改为"原位 opacity | 1.0 → 0（瞬时消失）"，删除"原位 scale"行（消失后无意义），并删除"原位 timing"行（瞬时无 timing）。同步整改 §2.5 / §2.6 中所有"opacity 0.4 → 1.0"。

### C. spec §2.3 颜色字段（5 分钟）

所有"`#0063E1`" 替换为 "`var(--color-accent)`"；所有"装饰 | 不加端点小圆点（保持极简）"替换为"端点 | 4×4px 圆点（同色填充，与 line 中线对齐）"。

### D. spec 新增 §2.5.1 磁吸 snap 行为细则（10 分钟）

按 P0-2 的"修改要求"段落填入完整规则。

### E. spec §2.5 settle duration 改公式（2 分钟）

"180ms" 改 "`Math.min(280, 120 + distance * 0.5)`"。dnd-kit `dropAnimation` 接 function 实现。

### F. spec §5 Acceptance 拆分（20 分钟）

§5.1 视觉效果硬条件 10 条（按 P0-4 给的清单）；§5.2 行为/功能回归 8 条（移到 03_tech_plan）。

### G. spec §2.2 阴影改 hsl 多层（5 分钟）

按 P1-3 的"修改要求"替换 box-shadow 字符串。

### H. spec §2.4 / §2.1 / §2.5 / §2.6 新增 spring 等价参数（10 分钟）

按 P1-6 各表格新增"等价 spring (motion)"行。

### I. spec §2.11 Reduced motion 与 WCAG 2.5.7 alternative（10 分钟）

按 P1-8 扩展两段。

### J. spec §1 措辞修正（2 分钟）

"全程 ≤ 280ms" → "单段 ≤ 280ms"（按 P1-5）。

### K. spec §2.7 cursor 三态过渡补充（3 分钟）

按 P1-7 方案 A 补充"按下未达 4px → grab"中间态。

---

## 结论

- **是否达到 10/10：no**
- **存在 4 个 P0 问题**，必须全部解决才能进入"接近 10/10"区间。
- **P0 全部改完后预计可达分数**：8.5–9.0
  - 解决 4 个 P0 后，主要扣分点（macOS 气质 / token 化 / 磁吸 / 可量化 acceptance）全部修复，估算各维度评分提升至 8-9 区间。
  - 仍剩 P1 问题（pill scale 一致、端点圆点、hsl 阴影、settle 距离公式、spring 等价参数、cursor 中间态、a11y 完整性）总计扣 1-1.5 分。
- **达到 10/10 所需**：P0 全部修复 + 至少 5 项 P1（建议 P1-1/P1-2/P1-3/P1-4/P1-6 共 5 项）+ P2-4（双 list 联动禁止说明，影响实施清晰度）。
- **预估总修订工作量**：A-K 共 11 项，约 1.5 小时（不含图表绘制）。

---

## 附录：评审"魔鬼细节"对照表

| 用户原文要求 | spec 是否体现 | 评审结论 |
|---|---|---|
| 考究 | 部分（结构清晰但 token 写死） | 需改 |
| 精致 | 部分（cascade/settle 调好了，但 lift opacity 错） | 需改 |
| 细节 | 不足（端点圆点删了；磁吸丢了） | 需改 |
| 克制 | OK（无 stagger、无 overshoot、无 rotate） | 通过 |
| Spring 曲线 | 部分（只在 §2.4 cascade 给了 spring 等价） | 需改 |
| 磁吸 | **完全缺失** | **P0** |
| 自然 | 部分（settle 时长固定违反 NN/G） | 需改 |
| 流畅 | OK（cubic-bezier(0.16, 1, 0.3, 1) 是正解） | 通过 |
| 不影响现有功能 | OK（§2.8 隔离规则完整） | 通过 |
| 不导致新问题 | 部分（dark mode 写死色值是隐藏新问题） | 需改 |
| 多 Agent 评审、10/10 通过 | 当前 6.8/10 | 不通过，必须重做 |
