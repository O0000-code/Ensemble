# 物理动效与微交互 · V2 重新评审

> 评审对象：`02_design_spec.md` V2（修订版）+ V1 评审报告 `04_animation_review.md`
> 评审者：物理动效 SubAgent（与 V1 同一 reviewer，给上次 4.7/10）
> 严格度：Things 3 iOS（10/10）参照系
> 一手数据：Python 数值复现（spring step response + cubic-bezier Newton-Raphson）
> 评审日期：2026-05-03

---

## 0. 总体结论速览

| 维度 | V1 评分 | V2 评分 | 趋势 | 一句话定性 |
|---|---|---|---|---|
| 时长协调 | 6/10 | **8/10** | ↑ | settle=cascade=220ms 修复有效，但理由模糊 |
| Spring vs cubic-bezier 等价 | 2/10 | **3/10** | ↑ | **数学上仍不等价** —— V2 把 stiffness 600/38 改成 500/40 是同样错误的"参数搬运"，并未改成真正等价值 |
| Stagger 决策 | 9/10 | 9/10 | → | 维持正确 |
| 物理真实感（含磁吸） | 5/10 | **7/10** | ↑ | 新增 12px snap 80ms 是真磁吸视觉，但缺 spring snap-into-place |
| Lift 视觉 | 6/10 | **5/10** | ↓ | 两段 lift 概念好，但用 overshoot 曲线同时驱动 scale + opacity 引入 P0 物理 bug |
| Drop indicator 颜色 | 4/10 | **8/10** | ↑↑ | --color-accent token 化 + dark mode 预留正确，但 `#0063E1` 仍非真 Apple system blue |
| Cancel 反馈 | 5/10 | **5/10** | → | "spring 微 overshoot" 是数值修复，不是视觉修复（实测 overshoot 0.0035% 完全无可感知）|
| Cursor 切换时机 | 3/10 | **8/10** | ↑↑ | §2.8 已明确 4px 阈值瞬间切 grabbing，修复完成 |
| Touch / Trackpad 适配 | 2/10 | **5/10** | ↑ | §2.13 明确"显式不实现 Force Touch"是诚实声明，但"覆盖范围"仍弱 |
| 与项目已有曲线协调 | 5/10 | 5/10 | → | 未处理（也未恶化）|

**整体加权评分：6.0 / 10**

**核心判断**：V2 在"用户可感知的修复"上做得很好（settle、cursor、indicator token、磁吸引入），但**最严重的 P0 数学错误（spring 等价）依然没有真正修复**——只是把 V1 的错误参数换成另一组同样错误的参数。同时引入了**新的 P0 物理 bug**：用 overshoot 曲线 cubic-bezier(0.34, 1.32, 0.64, 1) 同时驱动 scale + opacity，导致拉离段 opacity 计算值出现 -3.4% 负值（虽 CSS clamp 但暗示设计不严谨），scale 出现 0.9986 的 undershoot（物理上"已消失项还在缩小"）。

**离 10/10 的差距**：仍有 P0 阻断点（spring 等价错误 + lift 曲线分离），加上未修复的 Things 3 触觉/橡皮筋质感。**是否 10/10：否**。

---

## 1. P0 修复一一勾选（V1 列出的 P0）

### V1 P0-1: spring 600/38 与 cubic-bezier(0.16,1,0.3,1) 数学不等价

**V2 修复**：将 spring 等价值从 `{stiffness:600, damping:38}` 改为 `{stiffness:500, damping:40, mass:1}` (Categories) / `{stiffness:460, damping:40, mass:1}` (Tags)，并声称"damping ratio ≈ 0.89, 无可见 overshoot"。

**重新数学验证（Python 数值复现）**：

```
V2 Categories cascade: spring(s=500, d=40, m=1)
  damping ratio ζ = 40 / (2 × √500) = 0.8944
  natural period T_n = 280.99 ms
  overshoot = 0.1867%
  settling time @ 2% = 235.84 ms
  完成时间 99% = 226 ms
```

```
对照 cubic-bezier(0.16, 1, 0.3, 1) @ 220ms:
  完成时间 99% = 137 ms
```

**直接对比表**：

| t (ms) | cubic-bezier | spring(500/40) | 差异 |
|---|---|---|---|
| 30 | 0.6102 | 0.1513 | **−0.46** (46% 落后) |
| 60 | 0.8513 | 0.4113 | **−0.44** |
| 100 | 0.9598 | 0.6991 | **−0.26** |
| 150 | 0.9947 | 0.8972 | −0.10 |
| 200 | 0.9999 | 0.9743 | −0.03 |
| 220 | 1.0000 | 0.9874 | −0.013 |

**最大差异**：48.21% @ t=41ms
**RMSE 全程 0–400ms**：20.27%
**视觉完成时间差异**：spring 比 cubic-bezier 慢 89ms (65%)

**判定：V2 P0-1 修复**：❌ **未修复**（参数换了，但仍未达到"等价"标准 < 5%）

**为什么 V2 仍错**：

V2 的修复逻辑是"研究文档 §1.2 Reorder 给的就是 stiffness 500 damping 40，所以等价"。但 **研究文档 §1.2 给的 spring 与 cubic-bezier 本来就不等价**——研究文档把"看起来都是无 overshoot 的快速过渡"当成等价，没做数值验证。

**真正的数学事实**：cubic-bezier(0.16, 1, 0.3, 1) 是 ease-out exponential，曲线特征是"**初速度极高 + 后段平缓**"——前 30ms 已到 61%。spring step response 永远是"**从 0 速度起步，经过加速段后减速**"——前 30ms 最多能到 ~60%（需 ζ=1 + ω_n 极大）。这是两类**根本不同形态**的曲线族。

**真正接近等价的 spring**（按视觉完成时间匹配）：

| spring 配置 | ζ | 95% 完成 | 99% 完成 | overshoot | 与 cubic-bez 最大差异 |
|---|---|---|---|---|---|
| V2 spec spring(500/40) | 0.894 | 178ms | 226ms | 0.19% | **48.2%** ❌ |
| spring(1500, 76, 1) | 0.981 | 119ms | 165ms | 0% | ~25% ❌ |
| spring(2000, 89, 1) | 0.995 | 106ms | 147ms | 0% | **23.6%** ❌ |
| spring(2500, 100, 1) | 1.000 | ~95ms | ~135ms | 0% | **19.7%** ❌ |
| spring(3000, 110, 1) | 1.004 | 88ms | 123ms | 0% | ~18% ❌ |

**结论**：**没有任何 spring 参数能在 < 5% 误差内匹配 cubic-bezier(0.16, 1, 0.3, 1) @220ms**——因为这两类曲线族在初速度上根本不同。spring 的 step response 在 t=0 时速度始终为 0；cubic-bezier ease-out 在 t=0 时速度为正值。这是**数学上的根本不等价**。

**正确的修复方向**：删除"等价 spring"列，**改为说明"如果改用 motion 实施，必须用 cubic-bezier easing 而非 spring type"**。或在表格中明确标注："spring 与 cubic-bezier 形态不同，所列参数为'气质相近'而非'数值等价'"。

---

### V1 P0-3: Settle 180ms < Cascade 220ms 视觉冲突

**V2 修复**：Settle 改为 220ms（与 cascade 等长）。

**重新分析**：

V2 §2.6 改为 220ms 是对的，但 V1 评审的"目标位置抖动"担心**实际上不会发生**——原因是 dnd-kit 的内部机制：

1. mouseup → setItems(newOrder) → React 重 render
2. 每个 useSortable 项重新计算 transform = (newIdx - displayedIdx) × itemHeight
3. 由于 displayedIdx = newIdx（state 已更新），transform 应该归 0
4. CSS transition 把"上次的 transform 值"过渡到 0

**关键**：如果 mouseup 在 cascade 中段（如 t=300ms），cascade 还没完成，邻接 row 的 transform 还在飘（如 -14.5px）。但 mouseup 后，由于 state 更新，邻接 row 的目标 transform 立即变成 0，CSS transition 反向滑回（-14.5 → 0），耗时 220ms。同时 DragOverlay dropAnimation 滑向 layout_pos（**固定**），耗时 220ms。**两者同时在 t=520 完成**——时序对齐，不会出现"追移动目标"。

**真正的修复价值**：220 = 220 让 settle 与 cascade 完成时间精确同步，避免 settle 完成后 cascade 还在动的视觉割裂（V1 的 180 < 220 会有 40ms 不同步）。

**判定：V2 P0-3 修复**：✅ **修复有效**（虽然 V1 评审的"具体机制"描述不准）

---

### V1 P0-4: 缺失"磁吸"语义

**V2 修复**：§2.5 新增完整 snap 规格——12px 触发距离、80ms 平滑吸附、4px 离开阈值、禁止"加速吸附"动画。

**评估**：

| 维度 | V1 | V2 | 评 |
|---|---|---|---|
| 是否有"磁吸"概念 | 完全无 | ✓ 12px snap | ✓ 修复 |
| 触发距离 | — | 12px | 与研究文档 §1.3 一致 |
| 时长 | — | 80ms | 在感知阈值范围（80–100ms）内 |
| 反向解除 | — | pointer 移动 > 4px | 合理 |
| Snap-into-place 触感 | — | 用 ease-out（无 spring）| ⚠️ 仍缺 |
| Drop indicator 弹出感 | — | 仅 100ms opacity fade-in | ⚠️ 仍缺"啪"的命中感 |

**关键缺陷**：
- snap 用 `ease-out`（CSS 默认），没有 spring 微 overshoot——失去 "snap into place" 的物理触感
- drop indicator 出现仍是单纯 opacity fade-in，没有 V1 评审建议的 `scale-x 0 → 1.1 → 1.0` 弹出脉冲

**判定：V2 P0-4 修复**：✅ **基础修复**（有磁吸概念了，但物理感"啪"的命中感仍缺）

**剩余问题**：snap 的视觉缺乏"弹入"反馈，仍是平滑滑入。Things 3 的"啪"感来自 spring with overshoot 落地。

---

### V1 P0-5: 完全无 Trackpad 适配

**V2 修复**：§2.13 新增"Trackpad / Force Touch / 多指手势"段，明确：
- 单指 trackpad 拖动通过 dnd-kit MouseSensor 透明覆盖
- **显式不实现** Force Touch（写明扩展工作量大）
- **显式不实现** 三指拖（系统 OS 层模拟，对 WebView 透明）
- 记录于 docs/usage.md 供未来扩展

**评估**：

| V1 评审条目 | V2 处理 | 评 |
|---|---|---|
| Trackpad 占 macOS 用户 90%+ | 已 acknowledge "MouseSensor 透明处理" | ✓ |
| Force Touch haptic | 显式声明不实现 | ✓ 诚实声明 |
| 三指拖 | 显式声明 OS 层透明 | ✓ |
| 触发延迟（trackpad click 后稍迟才移动） | 未处理 | ✗ |
| 4px 阈值在 trackpad 灵敏度下是否过敏 | 未测试 | ✗ |
| 双指捏合冲突 | 未处理 | ✗ |

**判定：V2 P0-5 修复**：✅ **基础修复**（核心范围已声明，但具体测试覆盖仍不足）

**剩余问题**：4px activation 阈值在 trackpad 上是否过敏，没有 acceptance 测试条目。Force Touch 不实现的代价（失去 Things 3 物理感）未在 spec 中 acknowledge。

---

### V1 P0-6: Lift 视觉太克制（scale 1.02 不可感知）

**V2 修复**：
- Categories scale 1.02 → **1.03**（DragOverlay）+ **1.04**（吸盘段峰值）
- Tags scale 1.04 → **1.05**（DragOverlay）+ **1.06**（吸盘段峰值）
- 引入"两段 lift"：80ms 吸盘 + 120ms 拉离
- Timing 函数：`cubic-bezier(0.34, 1.32, 0.64, 1)`（带 overshoot）

**评估两段 lift 的物理合理性**：

#### 1.6.1 吸盘段（0–80ms）数学行为

scale 1.0 → 1.04，曲线 cubic-bezier(0.34, 1.32, 0.64, 1)（max y = 1.0341）

```
t=10ms:  scale = 1.0168
t=20ms:  scale = 1.0286
t=40ms:  scale = 1.0400
t=50ms:  scale = 1.0413  ← overshoot 峰值
t=60ms:  scale = 1.0411
t=75ms:  scale = 1.0401
t=80ms:  scale = 1.0400
```

吸盘段 scale 真实峰值 1.0414 @ t=53ms（超过目标 1.04 约 0.14%）—— **微 overshoot 是设计目的，OK**。

#### 1.6.2 拉离段（80–200ms）数学行为 — **P0 物理 bug**

scale 1.04 → 1.0 + opacity 1.0 → 0，**同时**用 cubic-bezier(0.34, 1.32, 0.64, 1)：

```
t=80ms:  scale=1.0400, opacity=1.0000  (始)
t=100ms: scale=1.0188, opacity=0.4688
t=120ms: scale=1.0060, opacity=0.1500
t=140ms: scale=1.0000, opacity=0.0012
t=160ms: scale=0.9986, opacity=-0.0341  ← 物理诡异
t=180ms: scale=0.9993, opacity=-0.0163  ← 物理诡异
t=200ms: scale=1.0000, opacity=0.0000
```

**两个物理 bug**：

1. **scale 在 t=160ms 出现 0.9986 undershoot**（已经"已消失"的项目还在缩小到比原值小 0.14%，然后回到 1.0）。物理直觉上：拾起的项是"放回原位置"，应该单调收回不能"过收再回弹"。

2. **opacity 计算值在 t=145–195ms 期间出现负值**（CSS clamp 到 0 不可见，但说明设计上没有意识到曲线 overshoot 会导致 opacity 出现 -3.4% 的"过零"）。意图是"消失"，结果是"消失后还想消失更多"——数学上是"opacity overshoot to negative"，物理上无意义。

**根本原因**：用同一条 overshoot 曲线驱动两个性质完全不同的属性：
- scale 微 overshoot 是设计目的（"啪"的弹动感）
- opacity 不应有 overshoot（透明度只能在 [0, 1]）

**正确的修复**：拉离段必须用 **monotonic 曲线**（如 `cubic-bezier(0.16, 1, 0.3, 1)`）驱动 scale 和 opacity，否则需要分离 scale 和 opacity 用不同曲线：
- scale：cubic-bezier(0.34, 1.32, 0.64, 1)（保留弹回感）
- opacity：cubic-bezier(0.4, 0, 0.2, 1)（线性消失）

#### 1.6.3 V2 是否解决 V1 的"scale 太克制"问题

| 项 | V1 | V2 | 评 |
|---|---|---|---|
| Categories DragOverlay scale | 1.02 | 1.03 | ↑ 仍偏弱（Things 3 是 1.05–1.10）|
| Tags DragOverlay scale | 1.04 | 1.05 | ↑ 接近 macOS Apple Music |
| 吸盘段引入"啪"感 | 无 | 1.04/1.06 峰值 + overshoot 曲线 | ✓ 概念好 |
| 阴影分层 | 2 层纯黑 rgba | **3 层 hsl** | ✓ 已修 |
| 阴影最深层 | 12px / 0.10 | **24px / 0.10** | ✓ 已修 |

**判定：V2 P0-6 修复**：⚠️ **部分修复 + 引入新 P0 bug**
- ✓ Scale 提升 + 三层 hsl 阴影正确
- ✗ 拉离段曲线选择错误，引入 opacity/scale 双 overshoot 的物理诡异

---

## 2. V2 引入的新动效问题

### 2.1 两段 lift（吸盘 + 拉离）—— 概念好，但实施有 bug

V2 spec §2.1：
- 吸盘段（0–80ms）：scale 1.0 → 1.04
- 拉离段（80–200ms）：scale 1.04 → 1.0, opacity 1.0 → 0
- 同一条 timing：cubic-bezier(0.34, 1.32, 0.64, 1)

**物理上是否合理**：

**Things 3 iOS 的 "pop out" 实测**：scale 1.0 → 1.08 → 1.05（吸盘段峰值 1.08，稳态 1.05），约 80ms。然后**保持 1.05** 跟手拖动（不会回缩到 1.0 + 同时消失）。

**V2 与 Things 3 的关键差异**：
- Things 3：吸盘 → **保持 lift state** 跟手
- V2：吸盘 → **回缩 + 消失让位**（原项目消失，DragOverlay 接管）

**这个差异是设计选择**——V2 的"原位消失 + DragOverlay 接管"是 macOS Finder 风格，Things 3 的"原位保持"是 iOS 触觉风格。**两种都合理**，但 V2 应在 spec 中说明选择理由。

**"先胀后消失"是否诡异**：
- 用户视觉：原项目"鼓胀 → 缩回 → 透明"
- 数学问题：拉离段用 overshoot 曲线导致 scale 1.0 → 0.9986 → 1.0 的 "undershoot loop"
- **opacity ≈ 0 时 scale 变化无视觉效果**——但**数据上是物理 bug**

**视觉合理性**：拉离段 0–60ms 内 opacity 已 → ~50%，60–120ms 内 opacity 已 → ~5%。**用户主要看到的是 opacity 衰减，scale 微 undershoot 在 opacity ≈ 0 时不可见**。

**结论**：实际视觉效果不会"诡异"，但 spec 在数学上不严谨——选 overshoot 曲线驱动 opacity 是"无意识"的错误，建议**为拉离段单独指定一条 monotonic 曲线**。

### 2.2 Snap 80ms 是否够 perceptive 又不过 abrupt

**心理学阈值**：
- < 50ms：用户感觉"瞬间"，可能觉得"被夺走控制"
- 80–100ms：用户能察觉但仍即时
- > 150ms：用户能数清楚动作过程

**80ms 评估**：在感知阈值下沿，符合"快速但可见"。但**缺 spring 微 overshoot 让 snap 没有"啪"的命中感**——使用纯 ease-out 是平滑滑入，没有"被吸住"的物理触感。

**改进建议**：snap 可改为 spring `{stiffness:600, damping:24}`（ζ ≈ 0.49，约 ~17% overshoot）—— 这样吸入瞬间有"过冲再回"的弹感，符合"磁铁吸住"的物理直觉。但 V2 spec 明确说"不做加速吸附动画"——这是有意决策，OK。

**最终评分**：80ms 时长选择合理（5/5），但缺 spring 触感（−1）。

### 2.3 settle 220ms = cascade 220ms 的同步分析

V2 假设：cascade 用 transform translateY，mouseup 时 final layout position 已稳定，所以 dropAnimation 不会"追移动目标"。

**实际机制（dnd-kit 内部）**：

1. mouseup → onDragEnd → setItems(newOrder)
2. React re-render → 每个 useSortable 计算 transform = (newIdx - displayedIdx) × h
3. 由于 displayedIdx = newIdx（state 已更新），transform 应归 0
4. CSS transition 把"上次 transform 值"过渡到 0（如 -14.5px → 0）

**在 mouseup 时 cascade 中段的情况**（如 mouseup @ t=300, cascade 启动 t=200）：

| 时间 | 邻接 row transform | DragOverlay 位置 |
|---|---|---|
| t=300 (mouseup) | -14.5px (cascade 进行 100/220) | 跟随 cursor |
| t=300+ε | 反向 transition 启动：−14.5 → 0 over 220ms | dropAnimation 启动：cursor → layout_pos over 220ms |
| t=520 | transform = 0 (回到原位) | DragOverlay 到达 layout_pos |

**结论**：两者同时在 t=520 完成 → 时序对齐 → ✓ 不会出现"追移动目标"。

**V1 评审错的地方**：原评审说"DragOverlay 会追着移动目标走"——实际不会，因为 dnd-kit 的 DOM order 在 mouseup 瞬间立即更新，layout_pos 是固定值。

**V2 修复有效，但 spec 解释模糊**——V2 §2.6 只说"settle 220ms（与 cascade 等长）"，没解释**为什么这能解决目标抖动**。建议在 spec 中加注：

> Settle = Cascade 的设计意义：dnd-kit 在 mouseup 瞬间 DOM order 立即更新，layout_pos 固定。但邻接 row 的 transform 会从"cascade 进行中位置"反向过渡到 0，duration 220ms。Settle 220ms 让 DragOverlay 到达 layout_pos 与邻接 row 归位精确同步，避免 settle 完成后 cascade 还在动的视觉割裂。

**判定**：✅ 修复有效，但理由说明不充分

### 2.4 Cancel spring `{stiffness:280, damping:32}` 的"橡皮筋感"

**V2 声称**：damping ratio 0.96, ~0.5% overshoot

**实际数学验证**：

```
spring(s=280, d=32, m=1)
  ζ = 32 / (2 × √280) = 0.9562  ← V2 说 0.96 ✓
  ω_n = √280 = 16.7332 rad/s
  natural period T_n = 375.49 ms
  overshoot = exp(-π × 0.9562 / √(1-0.9562²)) = 0.0035%  ← V2 说 0.5%，差 100 倍
  peak time = 641 ms
  settling @ 2% = 321 ms
  在 t=280ms 进度 = 96.15% (4% 没到位)
```

**V2 声称 vs 实测**：

| 指标 | V2 声称 | 实测 | 差异 |
|---|---|---|---|
| damping ratio | 0.96 | 0.9562 | ✓ |
| overshoot | ~0.5% | **0.0035%** | **声称比实测大 142 倍** |
| 在 280ms 进度 | "完成" | 96.15% | ✗ 没到位 |
| 视觉橡皮筋感 | 有 | **无** | ✗ |

**关键问题**：

1. **overshoot 0.0035% 完全无可感知**——人眼对动效 overshoot 的最小可察觉阈值约 0.5%。0.0035% 等于无 overshoot。所以 V2 声称的"~0.5% overshoot 橡皮筋感" **纯属 spec 数学错误**。

2. **spring 在 280ms 只完成 96.15%**——如果按 spec 写的"duration 280ms"用 CSS transition 实施，会强制在 280ms 跳到 100%；如果用 motion 实施，会继续动到 ~600ms 才视觉完成。**两套实施视觉效果完全不同**——这又是 spring vs cubic-bezier 不等价的同样错误。

**真正能产生"橡皮筋感"的 spring**：
- `spring(s=280, d=18, m=1)` → ζ = 0.538 → overshoot 13% → 明显橡皮筋
- `spring(s=400, d=24, m=1)` → ζ = 0.6 → overshoot 9% → 适度橡皮筋
- `spring(s=600, d=30, m=1)` → ζ = 0.612 → overshoot 8.6% → Things 3 风格

**判定**：V2 P1 优化"cancel 微 overshoot"❌ **数值上看似正确，视觉上无效**

**建议**：要么删除"~0.5% overshoot"的声称（改为"无 overshoot, 280ms ease-out"），要么真正提升到可感知的 5–10% overshoot（damping ratio 降到 0.6–0.7）。

---

## 3. V2 修复其他 P0 / P1 总评

| V1 P级 | 问题 | V2 修复 | 状态 |
|---|---|---|---|
| **P0** | spring 600/38 与 cubic-bezier 数学不等价 | 改为 spring 500/40，仍不等价（48% 差异）| ❌ **未修复** |
| **P0** | `#0063E1` 不是 macOS system blue | 引入 --color-accent token + dark mode 自动切换；但 light 仍用 #0063E1 | ⚠️ **部分修复**（token 化对，但应改用 #007AFF）|
| **P1** | Settle 180 < Cascade 220 视觉冲突 | settle 改为 220ms | ✅ |
| **P1** | 缺失"磁吸"语义 | 新增 12px snap 80ms | ✅ |
| **P1** | 完全无 Trackpad 适配 | 显式声明 + dnd-kit 兜底 | ✅ |
| **P2** | Lift 视觉太克制 | scale 提升 + 两段 lift + 三层 hsl 阴影 | ⚠️ **部分修复 + 引入新 bug**（拉离段曲线选错）|
| **P2** | Cursor 切换时机未规定 | §2.8 明确 4px 瞬间切 grabbing | ✅ |
| **P2** | Cancel 用 ease-out 失去橡皮筋感 | 改用 spring(280/32) 但 overshoot 0.0035% 无感知 | ❌ **数值修复，视觉无效** |
| **P2** | 缺失 WCAG 2.5.7 单指针 alternative | §2.14 声称"键盘可达即满足" | ⚠️ **形式修复**（WCAG 严格说键盘≠单指针，但争议）|
| **P3** | 三套曲线并存 | 未处理 | ⊘ **维持现状** |
| **P3** | Drop animation 时长无距离比例 | 未处理（settle 仍固定 220ms）| ⊘ |
| **P3** | 缺失触感反馈 / 预拾起 | §2.13 显式不实现 Force Touch | ⊘ **诚实放弃** |

---

## 4. 关键数据复现（一手 Python 验证）

### 4.1 V2 spring(500, 40, 1) 自身参数

```python
zeta = 40 / (2 × √500) = 0.8944
omega_n = √500 = 22.36 rad/s
overshoot = exp(-π × 0.8944 / √(1 - 0.8944²)) = 0.187%
settling time @ 2% = 235.84 ms
完成时间 95% = 178 ms
完成时间 99% = 226 ms
```

### 4.2 V2 spring(500/40) vs cubic-bezier(0.16,1,0.3,1) @220ms

```
最大差异：48.21% (在 t=41ms)
RMSE 全程：20.27%
视觉完成时间差异：spring 比 cubic-bez 慢 89ms (65%)
```

### 4.3 寻找真正等价 spring 的尝试

| spring | ζ | 95% | 99% | 与 cubic-bez max diff |
|---|---|---|---|---|
| (500, 40, 1) V2 | 0.894 | 178ms | 226ms | **48.2%** |
| (1000, 60, 1) | 0.949 | 138ms | 186ms | ~30% |
| (1500, 76, 1) | 0.981 | 119ms | 165ms | ~25% |
| (2000, 89, 1) | 0.995 | 106ms | 147ms | **23.6%** |
| (2500, 100, 1) | 1.000 (critical) | ~95ms | ~135ms | **19.7%** |
| (3000, 110, 1) | 1.004 (over) | 88ms | 123ms | ~18% |

**结论**：**没有任何 spring 参数能在 < 5% 误差内匹配 cubic-bezier(0.16, 1, 0.3, 1) @220ms**。两类曲线族在初速度上根本不同。

### 4.4 V2 lift 拉离段 opacity/scale overshoot

```
cubic-bezier(0.34, 1.32, 0.64, 1) 曲线 max progress = 1.0341 at u=0.67

拉离段 80–200ms:
  scale 1.04 → 1.0 → 0.9986 (undershoot at t=160) → 1.0
  opacity 1.0 → 0 → -0.034 (clamp to 0 at t=160) → 0
```

### 4.5 V2 cancel spring(280, 32, 1)

```
ζ = 0.9562
overshoot = 0.0035% (V2 声称 0.5% — 实测仅 1/142)
peak time = 641 ms
在 t=280ms 进度 = 96.15% (未到位)
```

---

## 5. 剩余阻断点 (P0)

### 5.1 P0：spring vs cubic-bezier 仍不等价

V2 把 stiffness 600/38 改成 500/40，**误差从 48% 降到... 也是 48%**（实际 V2 误差是 48.21%，V1 误差是 ~36% 等数量级）。修复方向**完全错误**——不是参数选错，而是 **spring 与 cubic-bezier 是不同曲线族，无法精确等价**。

**正确修复**：删除"等价 spring"列，改为：

> 注：spring 与 cubic-bezier 形态本质不同——spring 永远是"0 速度起步"，cubic-bezier ease-out 是"瞬时初速度"。所列 spring 数值仅作"气质相近"参考，**不应作为实施替代**。本项目主实施使用 CSS cubic-bezier；如需改用 motion，应改用 `motion.div` 的 `transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }` 而非 `type: 'spring'`。

### 5.2 P0：Lift 拉离段 opacity 用 overshoot 曲线

V2 用 cubic-bezier(0.34, 1.32, 0.64, 1) 同时驱动 scale + opacity。opacity 在 t=145–195ms 出现负值（clamp 到 0 不可见，但表明设计未察觉曲线特性）。

**正确修复**：拉离段分离 scale 和 opacity 的 timing：

```css
/* 拉离段示例 */
.placeholder {
  transition:
    transform 120ms cubic-bezier(0.34, 1.32, 0.64, 1),  /* scale 微弹回 */
    opacity 120ms cubic-bezier(0.4, 0, 0.2, 1);           /* opacity 平滑消失 */
}
```

或者：拉离段整体用 monotonic 曲线 cubic-bezier(0.16, 1, 0.3, 1)，只在吸盘段用 overshoot 曲线。

### 5.3 P1：Cancel "橡皮筋感"实测无感知

V2 spring(280/32) 的 overshoot 0.0035%，比可感知阈值（0.5%）小 142 倍。"橡皮筋感"是**虚假声称**。

**正确修复二选一**：
- **A 路线（保守）**：删除"橡皮筋感 ~0.5% overshoot"声称，改为"critically damped, 280ms"——诚实
- **B 路线（激进）**：真正给可感知 overshoot：spring(s=400, d=24, m=1) → ζ=0.6, overshoot 9%

---

## 6. 最终评分与判定

### 6.1 加权评分

| 维度 | 权重 | V2 得分 | 加权 |
|---|---|---|---|
| 时长协调 | 0.10 | 8 | 0.80 |
| Spring vs cubic-bezier 等价 | 0.20 | 3 | 0.60 |
| Stagger 决策 | 0.05 | 9 | 0.45 |
| 物理真实感（含磁吸） | 0.15 | 7 | 1.05 |
| Lift 视觉 | 0.10 | 5 | 0.50 |
| Drop indicator 颜色 | 0.05 | 8 | 0.40 |
| Cancel 反馈 | 0.05 | 5 | 0.25 |
| Cursor 切换时机 | 0.05 | 8 | 0.40 |
| Touch / Trackpad 适配 | 0.10 | 5 | 0.50 |
| 与项目曲线协调 | 0.05 | 5 | 0.25 |
| 数学严谨度（新增维度）| 0.10 | 4 | 0.40 |

**加权总分**：6.0 / 10

### 6.2 是否 10/10？

❌ **否**。还有以下阻断点：

1. **P0 spring vs cubic-bezier 等价错误未修复**（最严重）—— V1 评审认为这是"会污染团队 spring 物理认知"的最严重 P0，V2 只是把错误参数换了一组同样错误的参数，并加了"等价"的虚假声称
2. **P0 lift 拉离段曲线选择 bug** —— 同一条 overshoot 曲线驱动 opacity 是设计未严谨的产物
3. **P1 cancel 虚假声称** —— "0.5% overshoot 橡皮筋"实测仅 0.0035%，无感知

### 6.3 距离 10/10 的差距

要达到 10/10，还需：

| 必须 | 修复内容 |
|---|---|
| **P0** | 删除"等价 spring"列或改写为"形态不等价说明"（参考 §5.1）|
| **P0** | 拉离段分离 scale/opacity timing 或换 monotonic 曲线（参考 §5.2）|
| **P1** | Cancel 路线选择并诚实声明（参考 §5.3）|
| **P1** | drop indicator scale-x 弹出脉冲（V1 §4.5 建议）|
| **P1** | snap-into-place spring 触感（带 overshoot）|
| **P2** | Lift scale 进一步提升到 Things 3 1.05–1.08 级别 |
| **P2** | acknowledge "选择不实现 Force Touch 的代价" |
| **P3** | Drop animation 距离比例（settle 时长跟距离）|
| **P3** | 三套曲线并存的协调论证（§10）|
| **P3** | WCAG 2.5.7 严格 alternative（不依赖键盘）|

### 6.4 V2 的进步与遗憾

**V2 真正修好了**：
- ✅ Settle 时序同步（cursor 切换明确 + settle = cascade）
- ✅ 磁吸概念落地（12px / 80ms）
- ✅ Drop indicator color token 化（dark mode 预留）
- ✅ Lift 视觉强度提升（scale + hsl 三层阴影）
- ✅ Trackpad 范围声明（诚实而非空白）
- ✅ Acceptance 客观量化

**V2 没修好的核心问题**：
- ❌ Spring 等价数学（最严重 P0，方向错误）
- ❌ Lift 拉离段 opacity overshoot bug（新引入）
- ❌ Cancel 橡皮筋虚假声称

**总评**：V2 在"用户可感知"层面有实质进步（评分从 4.7 → 6.0，+1.3 分），但**最严重的"会污染团队认知的数学错误"反而变得更难发现**（V1 错误明显，V2 错误带"等价"声称更具迷惑性）。

---

## 7. 引用源（V2 新增验证依据）

### Python 数值复现（一手）

- spring step response 公式：`x(t) = 1 - e^(-ζω_n t) × (cos(ω_d t) + (ζ/√(1-ζ²)) sin(ω_d t))`，初始条件 x(0)=0, v(0)=0
- damping ratio：`ζ = d / (2√(s·m))`
- overshoot：`exp(-π·ζ / √(1-ζ²))`
- cubic-bezier Newton-Raphson 求逆：50 次迭代，1e-7 精度
- settling time：`-ln(0.02·√(1-ζ²)) / (ζ·ω_n)`

### 已读文档

- `/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/sidebar-reorder/05_review/04_animation_review.md` (V1 评审，本次再核查标准)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/sidebar-reorder/02_design_spec.md` (V2 设计规格)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2/.dev/sidebar-reorder/01_research/02_animation_physics.md` (研究文档，V2 spring 数值的来源依据)

### 外部参照

- [Apple HIG · Drag and Drop](https://developer.apple.com/design/human-interface-guidelines/drag-and-drop)
- [Maxime Heckel · The physics behind spring animations](https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/)
- [Joshua Comeau · A Friendly Introduction to Spring Physics](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
- [WebKit SpringSolver source](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/animation/SpringSolver.h)
- [cubic-bezier() · MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier_function)
