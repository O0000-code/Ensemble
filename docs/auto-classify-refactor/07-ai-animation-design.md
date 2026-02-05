# AI 动效设计方案

## 研究结论

### 配色方案
基于搜索结果，AI 产品最常见的配色是 **紫色** 和 **蓝色**，渐变是核心视觉语言。

推荐配色（紫-蓝-青渐变）：
- **Cosmic Purple**: #8B5CF6 (紫)
- **Electric Blue**: #3B82F6 (蓝)
- **Cyan Glow**: #06B6D4 (青)
- **Soft Pink**: #EC4899 (粉，点缀)

### 动画技术
使用 CSS Houdini `@property` + `conic-gradient` 实现旋转渐变边框：
- 优点：纯 CSS，无 JS，性能好
- 支持圆角
- 可控制速度和方向

### 设计原则（克制高级）
1. **速度适中**：3-4秒一圈，不要太快
2. **边框纤细**：1.5-2px，不要太粗
3. **颜色克制**：紫蓝青单一色系，不要彩虹
4. **透明度**：适当透明度降低存在感
5. **仅在分类时激活**：静态时无动画

## 实现方案

### 状态设计
1. **Idle 状态**：普通边框，无动画
2. **Classifying 状态**：渐变边框旋转动画 + 文字闪烁
3. **Success 状态**：绿色脉冲（保留现有）

### CSS 实现
```css
@property --gradient-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes ai-gradient-spin {
  to {
    --gradient-angle: 360deg;
  }
}

.ai-classifying {
  background:
    linear-gradient(#fff, #fff) padding-box,
    conic-gradient(
      from var(--gradient-angle),
      #8B5CF6,
      #3B82F6,
      #06B6D4,
      #3B82F6,
      #8B5CF6
    ) border-box;
  border: 2px solid transparent;
  animation: ai-gradient-spin 3s linear infinite;
}
```

## 参考来源
- [Animated CSS gradient borders (CodeTV)](https://codetv.dev/blog/animated-css-gradient-border)
- [CSS animated gradient border guide (Bejamas)](https://bejamas.com/hub/guides/css-animated-gradient-border)
- [HueHive AI Color Palettes](https://huehive.co/)
