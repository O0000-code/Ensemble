# IconPicker 图标扩展任务理解文档

## 1. 任务目标

扩展 IconPicker 组件中可选的图标数量，从当前的 24 个增加到约 70 个常用图标，同时保持弹框的尺寸不变，通过添加可滚动功能来容纳更多图标。

## 2. 任务范围

### 必须做的
1. **增加图标数量**: 从 24 个扩展到约 70 个常用 Lucide 图标
2. **保持弹框尺寸不变**: 宽度 260px，图标区域最大高度 240px
3. **确保可滚动**: 图标区域需要可滚动以容纳更多图标
4. **滚动条设计**: 添加符合当前 APP 设计感的高一致性滚动条

### 不做的
- 不改变弹框的整体尺寸
- 不改变图标网格的列数（保持 6 列）
- 不改变单个图标按钮的尺寸（保持 36x36px）
- 不改变搜索功能
- 不改变键盘导航逻辑
- 不改变任何其他现有功能

## 3. 当前状态分析

### 3.1 文件路径
- **主组件**: `/src/components/common/IconPicker.tsx`
- **样式文件**: `/src/index.css`（包含滚动条样式）
- **导出**: `/src/components/common/index.ts`

### 3.2 当前图标列表（24 个）
```
globe, code, database, server, folder, file, smartphone, monitor,
terminal, palette, book-open, pen-tool, bar-chart, sparkles, zap,
plug, cpu, cloud, git-branch, settings, layers, box, layout-grid, compass
```

### 3.3 当前样式规格
| 属性 | 值 |
|------|-----|
| 弹框宽度 | 260px |
| 图标区域最大高度 | 240px |
| 图标网格列数 | 6 列 |
| 图标按钮尺寸 | 36x36px (w-9 h-9) |
| 图标尺寸 | 18x18px |
| 网格间距 | 4px (gap-1) |
| 内边距 | 8px (p-2) |

### 3.4 已有滚动条样式
项目已定义 `.icon-picker-scroll` 类：
```css
.icon-picker-scroll::-webkit-scrollbar {
  width: 6px;
}
.icon-picker-scroll::-webkit-scrollbar-track {
  background: #F4F4F5;
  border-radius: 2px;
  margin: 4px 0;
}
.icon-picker-scroll::-webkit-scrollbar-thumb {
  background: #D4D4D8;
  border-radius: 2px;
}
.icon-picker-scroll::-webkit-scrollbar-thumb:hover {
  background: #A1A1AA;
}
```

## 4. 目标图标列表（70 个）

### 4.1 按类别分组

**通用操作类 (16 个)**
settings, search, plus, minus, x, check, edit, pencil, trash-2, copy, save, download, upload, refresh-cw, more-horizontal, more-vertical

**导航类 (12 个)**
home, arrow-left, arrow-right, arrow-up, arrow-down, chevron-left, chevron-right, chevron-up, chevron-down, external-link, menu, compass

**状态/通知类 (10 个)**
check-circle, alert-circle, x-circle, info, alert-triangle, bell, bell-off, loader-2, clock, circle-dot

**开发工具类 (12 个)**
code, terminal, database, server, cpu, git-branch, git-commit, bug, wrench, puzzle, plug, zap

**文件/文档类 (10 个)**
file, file-text, file-code, folder, folder-open, folder-plus, book-open, file-json, archive, clipboard

**界面/布局类 (10 个)**
layers, layout-grid, layout-list, panel-left, panel-right, maximize-2, minimize-2, split-square-horizontal, grid-3x3, columns

**用户/账户类 (6 个)**
user, users, user-plus, log-in, log-out, shield-check

**其他常用 (10 个)**
sparkles, star, heart, tag, hash, link, globe, cloud, box, palette

### 4.2 完整图标名称列表（kebab-case）
```
settings, search, plus, minus, x, check, edit, pencil, trash-2, copy,
save, download, upload, refresh-cw, more-horizontal, more-vertical,
home, arrow-left, arrow-right, arrow-up, arrow-down, chevron-left,
chevron-right, chevron-up, chevron-down, external-link, menu, compass,
check-circle, alert-circle, x-circle, info, alert-triangle, bell,
bell-off, loader-2, clock, circle-dot, code, terminal, database,
server, cpu, git-branch, git-commit, bug, wrench, puzzle, plug, zap,
file, file-text, file-code, folder, folder-open, folder-plus, book-open,
file-json, archive, clipboard, layers, layout-grid, layout-list,
panel-left, panel-right, maximize-2, minimize-2, split-square-horizontal,
grid-3x3, columns, user, users, user-plus, log-in, log-out, shield-check,
sparkles, star, heart, tag, hash, link, globe, cloud, box, palette
```

## 5. 技术实现要点

### 5.1 修改 IconPicker.tsx
1. 更新 `ICON_MAP` 对象，添加新的图标映射
2. 更新 lucide-react 的导入语句
3. 确保图标容器已有 `overflow-y-auto` 和 `icon-picker-scroll` 类

### 5.2 滚动条样式验证
- 确认 `.icon-picker-scroll` 类已正确应用
- 滚动条样式已在 `index.css` 中定义，无需修改

### 5.3 需要验证的点
- 滚动时键盘导航是否正常工作
- 搜索筛选后滚动位置是否正确重置
- 选中状态是否正确滚动到视图中

## 6. 风险评估

### 低风险
- 仅修改一个文件（IconPicker.tsx）
- 不涉及布局变化
- 不涉及新增样式（滚动条样式已存在）

### 需要注意
- 确保所有新增的 Lucide 图标名称正确
- 确保 ICON_MAP 的键（kebab-case）与值（PascalCase组件）对应正确
- 不改变现有图标的顺序（新图标添加到已有图标之后）

## 7. 验收标准

1. 图标数量从 24 个增加到约 70 个
2. 弹框尺寸保持不变（宽度 260px，高度约 300px 含搜索框）
3. 图标区域可滚动
4. 滚动条样式与应用整体设计一致
5. 搜索功能正常工作
6. 键盘导航正常工作
7. 现有功能无回归
