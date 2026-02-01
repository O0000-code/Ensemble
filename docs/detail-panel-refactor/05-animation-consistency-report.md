# 四个模块动效一致性检查报告

> 检查日期: 2026-02-02
> 检查范围: Skills, MCP Servers, Scenes, Projects 四个模块的滑动面板动效

---

## 1. SlidePanel 使用对比

### SlidePanel 组件默认配置（参照）
- **默认 width**: 800px
- **默认 duration**: 250ms
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

### 各模块 SlidePanel 配置

| 模块 | width | duration | 其他属性 |
|------|-------|----------|----------|
| **Skills** | `800` | 未指定（使用默认 250ms） | `header`, `headerRight` |
| **MCP Servers** | `800` | 未指定（使用默认 250ms） | `header`, `headerRight` |
| **Scenes** | `800` | 未指定（使用默认 250ms） | `header`, `headerRight` |
| **Projects** | `780` | 未指定（使用默认 250ms） | `header`, `headerRight` |

### 发现的问题

**Projects 模块的 width 不一致：**
- Skills, MCP Servers, Scenes 都使用 `width={800}`
- Projects 使用 `width={780}`

---

## 2. 主内容区收缩动画对比

### 各模块主内容区动画配置

| 模块 | transition 类 | duration | easing | margin-right 值 |
|------|--------------|----------|--------|-----------------|
| **Skills** | `transition-[margin-right]` | `duration-[250ms]` | `ease-[cubic-bezier(0.4,0,0.2,1)]` | `mr-[800px]` |
| **MCP Servers** | `transition-[margin-right]` | `duration-[250ms]` | `ease-[cubic-bezier(0.4,0,0.2,1)]` | `mr-[800px]` |
| **Scenes** | `transition-[margin-right]` | `duration-[250ms]` | `ease-[cubic-bezier(0.4,0,0.2,1)]` | `mr-[800px]` |
| **Projects** | `transition-[margin-right]` | `duration-[250ms]` | `ease-[cubic-bezier(0.4,0,0.2,1)]` | `mr-[780px]` |

### 代码片段对比

**SkillsPage.tsx (Line 519-524):**
```tsx
<div
  className={`
    flex-1 overflow-y-auto px-7 py-6
    transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
    ${selectedSkillId ? 'mr-[800px]' : ''}
  `}
>
```

**McpServersPage.tsx (Line 380-385):**
```tsx
<div
  className={`
    flex-1 overflow-y-auto p-6 px-7
    transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
    ${selectedMcpId ? 'mr-[800px]' : ''}
  `}
>
```

**ScenesPage.tsx (Line 296-301):**
```tsx
<div
  className={`
    flex-1 overflow-y-auto p-6 px-7
    transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
    ${selectedSceneId ? 'mr-[800px]' : ''}
  `}
>
```

**ProjectsPage.tsx (Line 246-251):**
```tsx
<div
  className={`
    flex-1 overflow-y-auto px-7 py-6
    transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
    ${isDetailOpen ? 'mr-[780px]' : ''}
  `}
>
```

### 发现的问题

1. **margin-right 值不一致：** Projects 使用 `mr-[780px]`，其他三个模块使用 `mr-[800px]`
2. **与 SlidePanel width 匹配情况：**
   - Skills: `mr-[800px]` 与 `width={800}` 匹配 ✅
   - MCP Servers: `mr-[800px]` 与 `width={800}` 匹配 ✅
   - Scenes: `mr-[800px]` 与 `width={800}` 匹配 ✅
   - Projects: `mr-[780px]` 与 `width={780}` 匹配 ✅（虽然与其他模块不同，但自身一致）

---

## 3. 选中态样式对比

### 3.1 列表项背景色（选中状态）

| 模块 | 组件名称 | 选中背景色 | 未选中背景色 | hover 效果 |
|------|---------|-----------|-------------|------------|
| **Skills** | SkillItem (full) | 无选中态 | `bg-white` | `hover:bg-[#FAFAFA]` |
| **Skills** | SkillItem (compact) | `bg-[#FAFAFA]` | 透明 | `hover:bg-[#FAFAFA]` |
| **MCP Servers** | McpItem | `bg-[#FAFAFA]` | `bg-white` | `hover:bg-[#FAFAFA]` |
| **Scenes** | SceneCard | `bg-[#FAFAFA]` + `border-[#18181B]` | `bg-white` | `hover:bg-[#FAFAFA]` |
| **Projects** | ProjectCard | `bg-[#FAFAFA]` | `bg-white` | `hover:bg-[#FAFAFA]` |

### 3.2 图标容器背景色变化

| 模块 | 组件名称 | 选中时图标容器 | 未选中时图标容器 |
|------|---------|---------------|-----------------|
| **Skills** | SkillItem (full) | 无变化 `bg-[#FAFAFA]` | `bg-[#FAFAFA]` |
| **Skills** | SkillItem (compact) | `bg-[#F4F4F5]` | `bg-[#FAFAFA]` |
| **MCP Servers** | McpItem | `bg-[#F4F4F5]` | `bg-[#FAFAFA]` |
| **Scenes** | SceneCard | 无变化 `bg-[#FAFAFA]` | `bg-[#FAFAFA]` |
| **Projects** | ProjectCard | `bg-[#F4F4F5]` | `bg-[#FAFAFA]` |

### 3.3 文字加粗变化

| 模块 | 组件名称 | 选中时字重 | 未选中时字重 |
|------|---------|-----------|-------------|
| **Skills** | SkillItem (full) | 无变化 `font-medium` | `font-medium` |
| **Skills** | SkillItem (compact) | `font-semibold` | `font-medium` |
| **MCP Servers** | McpItem | `font-semibold` | `font-medium` |
| **Scenes** | SceneCard | 无变化 `font-medium` | `font-medium` |
| **Projects** | ProjectCard | `font-semibold` | `font-medium` |

### 3.4 图标颜色变化

| 模块 | 组件名称 | 选中时图标颜色 | 未选中时图标颜色 |
|------|---------|---------------|-----------------|
| **Skills** | SkillItem (full) | 无变化 `text-[#52525B]` | `text-[#52525B]` |
| **Skills** | SkillItem (compact) | `text-[#18181B]` | `text-[#52525B]` |
| **MCP Servers** | McpItem | `text-[#18181B]` | `text-[#52525B]` |
| **Scenes** | SceneCard | 无变化 `text-[#52525B]` | `text-[#52525B]` |
| **Projects** | ProjectCard | `text-[#18181B]` | `text-[#52525B]` |

---

## 4. 不一致之处汇总

### 4.1 严重不一致（需要修复）

| 问题 | 模块 | 当前值 | 期望值 |
|------|------|--------|--------|
| SlidePanel 宽度不一致 | Projects | `width={780}` | `width={800}` |
| margin-right 值不一致 | Projects | `mr-[780px]` | `mr-[800px]` |

### 4.2 选中态样式差异（轻微不一致）

| 问题 | 受影响模块 | 说明 |
|------|-----------|------|
| SkillItem (full) 无选中态视觉变化 | Skills | full variant 在主列表中使用，但当前未实现选中态的背景色/图标/字重变化 |
| SceneCard 缺少图标/字重变化 | Scenes | 有背景色和边框变化，但无图标容器背景和字重变化 |
| SceneCard 有额外边框变化 | Scenes | 选中时添加 `border-[#18181B]`，其他模块没有此效果 |

---

## 5. 建议修复

### 5.1 高优先级（确保动画同步）

**修复 ProjectsPage.tsx 的面板宽度：**

```tsx
// 修改 SlidePanel 宽度（Line 291-294）
<SlidePanel
  isOpen={isDetailOpen}
  onClose={handleCloseDetail}
  width={800}  // 从 780 改为 800
  ...
>

// 修改主内容区 margin-right（Line 246-251）
<div
  className={`
    flex-1 overflow-y-auto px-7 py-6
    transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
    ${isDetailOpen ? 'mr-[800px]' : ''}  // 从 780px 改为 800px
  `}
>
```

### 5.2 中优先级（统一选中态样式）

如果需要完全统一选中态样式，建议：

1. **SkillItem (full variant)**：添加选中态的背景色、图标容器颜色、字重变化
2. **SceneCard**：添加图标容器背景和字重变化，或移除边框变化以保持一致

### 5.3 低优先级（代码规范化）

统一主内容区的 padding 类写法：
- Skills, Projects: `px-7 py-6`
- MCP Servers, Scenes: `p-6 px-7`

建议统一为 `px-7 py-6` 或 `p-6 px-7`（两者效果相同）。

---

## 6. 总结

### 动画一致性评估

| 维度 | 一致性评分 | 说明 |
|------|-----------|------|
| SlidePanel 滑入动画 | 90% | Projects 宽度不同（780px vs 800px） |
| 主内容区收缩动画 | 90% | Projects margin-right 不同（780px vs 800px） |
| 动画时长 | 100% | 所有模块都使用 250ms |
| 缓动函数 | 100% | 所有模块都使用 `cubic-bezier(0.4,0,0.2,1)` |
| 选中态样式 | 70% | 存在多处细节差异 |

### 核心结论

1. **动画参数基本一致**：duration 和 easing 完全一致，仅 Projects 模块的宽度参数不同
2. **需要修复的关键问题**：Projects 模块的 `width={780}` 和 `mr-[780px]` 应改为 800
3. **选中态样式有差异**：各模块的选中态实现细节不完全一致，但不影响核心动效体验
