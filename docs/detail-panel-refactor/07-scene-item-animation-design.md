# Scene List Item 过渡动效设计

## 1. 技术方案选择

### 选择方案 A：统一组件 + CSS 过渡

**理由**：
1. **项目一致性**：项目未使用 framer-motion，保持依赖轻量
2. **性能优势**：纯 CSS transition 由浏览器 GPU 加速，性能最佳
3. **代码简洁**：无需引入新的动画库，学习成本低
4. **维护便利**：与现有 SlidePanel 动画方案保持一致（250ms, cubic-bezier）

## 2. 动画参数设计

### 2.1 时序参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 持续时间 | 250ms | 与 SlidePanel 保持一致 |
| 缓动函数 | cubic-bezier(0.4, 0, 0.2, 1) | Material Design 标准缓动，自然流畅 |
| 延迟 | 0ms | 立即响应，无延迟 |

### 2.2 需要动画的属性

| 元素 | 属性变化 | 动画类型 |
|------|----------|----------|
| 容器高度 | 68px (full) -> 68px (compact) | 无变化（保持一致） |
| 容器布局 | space-between -> flex-start | 通过 gap 变化模拟 |
| 描述文本 | 显示 -> 隐藏 | opacity + max-height |
| Skills/MCPs 文本 | 右侧独立 -> 名称下方 | 位置过渡（通过布局变化） |
| Active 标签 | 显示 -> 隐藏 | opacity |
| More 按钮 | 显示 -> 隐藏 | opacity |
| 右侧区域 | 显示 -> 隐藏 | opacity + width |

### 2.3 关键动画策略

**挑战**：从 `SceneCard`（space-between 布局）到 `SceneItem`（flex-start 布局）的切换

**解决方案**：使用统一组件 `SceneListItem`，通过 `compact` prop 控制两种模式

1. **布局过渡**：
   - 不改变整体 flex 布局方向
   - 左侧信息区使用 `flex-col` 布局
   - compact 模式下，描述行变为 stats 行

2. **元素淡入淡出**：
   - 描述文本：opacity 0 -> 1 / 1 -> 0
   - 右侧元素（stats/active/more）：opacity 1 -> 0
   - Stats 下移副本：opacity 0 -> 1

3. **尺寸过渡**：
   - 右侧区域宽度收缩到 0
   - 使用 `overflow-hidden` 防止内容溢出

## 3. 组件设计

### 3.1 新组件：SceneListItem

```tsx
interface SceneListItemProps {
  scene: Scene;
  compact?: boolean;        // true = SceneItem 模式, false = SceneCard 模式
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
  onMoreClick?: (e: React.MouseEvent) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}
```

### 3.2 CSS 过渡关键样式

```css
/* 容器基础样式 */
.scene-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 左侧信息区 */
.scene-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: gap 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 描述文本 - Full 模式 */
.scene-description {
  opacity: 1;
  max-height: 20px;
  transition: opacity 250ms, max-height 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* 描述文本 - Compact 模式隐藏 */
.scene-description.hidden {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* Stats 在名称下方 - Compact 模式 */
.scene-stats-inline {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 250ms, max-height 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.scene-stats-inline.visible {
  opacity: 1;
  max-height: 20px;
}

/* 右侧区域过渡 */
.scene-right {
  display: flex;
  align-items: center;
  gap: 24px;
  opacity: 1;
  width: auto;
  transition: opacity 250ms, width 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.scene-right.hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
  gap: 0;
}
```

## 4. 实现细节

### 4.1 组件结构

```
SceneListItem
├── 左侧容器 (flex items-center gap-3.5)
│   ├── Icon 容器 (40x40)
│   └── 信息容器 (flex-col)
│       ├── 名称
│       ├── 描述 (full 模式显示)
│       └── Stats 行 (compact 模式显示)
└── 右侧容器 (full 模式显示)
    ├── Stats (Skills/MCPs)
    ├── Active 标签
    └── More 按钮
```

### 4.2 过渡效果时序

```
点击 SceneCard (Full -> Compact):
  0ms   : 开始过渡
  0-125ms: 右侧元素淡出 (先完成)
  0-250ms: 描述淡出，Stats 行淡入
  250ms : 过渡完成

点击其他 SceneItem (Compact -> Full):
  0ms   : 开始过渡
  0-250ms: Stats 行淡出，描述淡入
  125-250ms: 右侧元素淡入 (延迟开始)
  250ms : 过渡完成
```

### 4.3 注意事项

1. **避免 layout shift**：使用 `opacity` 和 `max-height` 而非 `display: none`
2. **GPU 加速**：可添加 `will-change: opacity, max-height` 提示浏览器优化
3. **交互响应性**：确保点击事件在动画期间仍可触发
4. **保持选中状态**：动画过程中维持正确的 selected 样式

## 5. 与现有系统的一致性

| 组件 | 动画时长 | 缓动函数 |
|------|----------|----------|
| SlidePanel | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 列表容器 margin | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| **SceneListItem** | **250ms** | **cubic-bezier(0.4, 0, 0.2, 1)** |

## 6. 文件变更清单

1. **新建**：`/src/components/scenes/SceneListItem.tsx`
   - 统一的列表项组件，支持 full/compact 两种模式

2. **修改**：`/src/pages/ScenesPage.tsx`
   - 移除 SceneCard 和 SceneItem 的条件渲染
   - 统一使用 SceneListItem，通过 `compact` prop 控制模式

3. **保留**：`/src/components/scenes/SceneCard.tsx` 和 `SceneItem.tsx`
   - 暂时保留原组件以便回滚，后续可删除
