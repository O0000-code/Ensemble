# UI 不一致性分析报告

## 文档信息
- **创建日期**: 2026-02-02
- **目的**: 识别本次核心功能实现中新增 UI 与项目设计规范的差异

---

## 一、本次新增的 UI 组件/页面

| 组件/页面 | 文件位置 | 用途 |
|----------|---------|------|
| ImportDialog | `src/components/common/ImportDialog.tsx` | 首次启动导入对话框 |
| ScopeSelector | `src/components/common/ScopeSelector.tsx` | Scope 切换下拉选择器 |
| LauncherModal | `src/components/launcher/LauncherModal.tsx` | 从 Finder 启动时的 Scene 选择弹窗 |
| Settings Launch Section | `src/pages/SettingsPage.tsx` | 设置页面的终端配置部分 |

---

## 二、发现的 UI 不一致问题

### 2.1 ImportDialog 问题

#### 问题 1: Modal 宽度不一致
- **当前**: `max-width: 560px`
- **设计规范**: Modal 宽度通常使用固定值如 480px, 640px, 800px
- **建议**: 检查设计稿中对应的导入对话框宽度

#### 问题 2: Warning Banner 样式
- **当前**: 使用 amber/yellow 系列颜色 (`#FFFBEB`, `#FEF3C7`, `#D97706`, `#92400E`, `#B45309`)
- **设计规范**: 项目使用的警告色是 `#FEF3C7` (背景), `#D97706` (文本)
- **建议**: 确认是否有统一的 Warning 组件样式

#### 问题 3: 列表项样式
- **当前**: 使用 `hover:bg-[#FAFAFA]`
- **设计规范**: 列表项选中/hover 应使用 `bg-[#F4F4F5]`
- **建议**: 统一使用 `#F4F4F5`

#### 问题 4: Checkbox 样式
- **当前**: 使用原生 `<input type="checkbox">` 样式
- **设计规范**: 自定义 Checkbox 组件 - 14x14, 圆角 3px, 边框 2px `#D4D4D4`
- **建议**: 使用项目的 Checkbox 组件

#### 问题 5: 缺少设计稿对应
- **当前**: ImportDialog 是新增功能，设计稿中可能没有对应页面
- **建议**: 需要设计师补充设计稿

---

### 2.2 ScopeSelector 问题

#### 问题 1: 颜色方案不一致
- **当前 Global**: `bg-purple-100 text-purple-700` (Tailwind 默认紫色)
- **当前 Project**: `bg-gray-100 text-gray-700` (Tailwind 默认灰色)
- **设计规范**: 应使用项目定义的颜色如 `#8B5CF6` (紫色), `#F4F4F5` (灰色背景)
- **建议**: 使用项目颜色 token

#### 问题 2: Dropdown 样式
- **当前**: 自定义下拉样式，`shadow-lg`, `rounded-lg`
- **设计规范**: Dropdown 使用 `shadow: 0 4px 12px rgba(0,0,0,0.0625)`, `rounded-lg` (8px)
- **建议**: 确认阴影是否符合规范

#### 问题 3: 选项项样式
- **当前**: `hover:bg-gray-50`, `bg-gray-50` (selected)
- **设计规范**: 应使用 `#F4F4F5` 作为 hover/selected 背景
- **建议**: 统一为 `bg-[#F4F4F5]`

#### 问题 4: Info Footer 设计
- **当前**: 底部有灰色信息提示区域
- **设计规范**: 设计稿中的 Dropdown 没有类似的 footer
- **建议**: 确认是否需要此元素，或调整样式

#### 问题 5: 缺少设计稿对应
- **当前**: 设计稿中 MCP 详情页有 "Install Scope: User" Badge，但没有下拉选择器
- **建议**: 需要设计师补充 ScopeSelector 的设计稿

---

### 2.3 LauncherModal 问题

#### 问题 1: 完全缺少设计稿
- **当前**: LauncherModal 是新增功能，设计稿中没有对应页面
- **建议**: 需要设计师创建完整的设计稿

#### 问题 2: Folder Info Box 样式
- **当前**: `bg-[#F5F5F5]`, `rounded-lg`, `p-4`
- **设计规范**: 类似元素应使用 `bg-[#F4F4F5]`
- **建议**: 使用 `#F4F4F5`

#### 问题 3: Radio Button 样式
- **当前**: 使用原生 `<input type="radio">` + Tailwind accent color
- **设计规范**: 项目没有定义 Radio Button 组件
- **建议**: 需要设计师定义 Radio Button 样式，或改用其他选择方式

#### 问题 4: 选中项背景色
- **当前**: `bg-[#F0F9FF]` (淡蓝色)
- **设计规范**: 选中项应使用 `#F4F4F5` 或特定的选中色
- **建议**: 确认选中色是否应该是蓝色系还是灰色系

#### 问题 5: Play 图标在按钮中
- **当前**: Button 内有 Play 图标
- **设计规范**: 需确认按钮图标规范

---

### 2.4 Settings Launch Configuration Section 问题

#### 问题 1: Select 下拉框样式
- **当前**: 使用原生 `<select>` 元素 + 自定义边框样式
- **设计规范**: 应使用项目的 Dropdown 组件
- **建议**: 改用 Dropdown 组件

#### 问题 2: 文本输入框样式
- **当前**: `w-48`, `rounded-md`, `border border-[#E5E5E5]`
- **设计规范**: Input 高度应为 40px, 圆角 6px
- **建议**: 使用项目的 Input 组件

#### 问题 3: Row 组件内边距
- **当前**: `px-5 py-4`
- **设计规范**: Settings 页面的 Row 应使用 `px-5 py-4`（一致）
- **状态**: ✅ 符合规范

#### 问题 4: 成功/错误消息样式
- **当前**: `text-green-600`, `text-red-600` (Tailwind 默认)
- **设计规范**: 应使用 `#16A34A` (success), `#DC2626` (error)
- **建议**: 使用项目颜色 token

#### 问题 5: Warp Open Mode 条件显示
- **当前**: 当选择 Warp 时显示额外的 Open Mode 选项
- **设计规范**: 设计稿中没有此功能
- **建议**: 需要设计师补充设计稿

---

## 三、需要设计师补充的设计稿

### 3.1 ImportDialog (首次启动导入对话框)
需要设计的状态：
1. 检测到配置时的选择界面
2. 导入中的加载状态
3. 导入完成的结果界面（成功/部分成功/全部跳过/失败）
4. 空状态（没有检测到配置）

### 3.2 ScopeSelector (Scope 切换选择器)
需要设计的内容：
1. 触发按钮样式（Global/Project 两种状态）
2. 下拉菜单样式
3. 选项项样式（包含图标、标题、描述）
4. 加载中状态

### 3.3 LauncherModal (Finder 启动弹窗)
需要设计的内容：
1. 完整的弹窗布局
2. 文件夹信息展示区域
3. Scene 列表选择区域
4. 空状态（没有 Scene）
5. 按钮区域

### 3.4 Settings - Launch Configuration Section
需要设计的内容：
1. Terminal Application 选择下拉
2. Warp Open Mode 选择下拉（条件显示）
3. Launch Command 输入框
4. Finder Integration 安装按钮和状态

---

## 四、通用样式问题汇总

### 颜色不一致
| 当前使用 | 应该使用 | 位置 |
|---------|---------|------|
| `gray-50`, `gray-100` | `#FAFAFA`, `#F4F4F5` | 多处 hover/背景 |
| `purple-100`, `purple-700` | 项目紫色 token | ScopeSelector |
| `green-500`, `green-600` | `#16A34A` | 成功状态 |
| `blue-600` | `#2563EB` | 选中/链接 |
| `#F5F5F5` | `#F4F4F5` | 背景色 |
| `#F0F9FF` | 需确认 | 选中项背景 |

### 组件不一致
| 当前使用 | 应该使用 | 位置 |
|---------|---------|------|
| 原生 `<select>` | Dropdown 组件 | SettingsPage |
| 原生 `<input type="checkbox">` | Checkbox 组件 | ImportDialog |
| 原生 `<input type="radio">` | 需定义 Radio 组件 | LauncherModal |
| 自定义 Input 样式 | Input 组件 | SettingsPage |

### 间距/尺寸不一致
| 问题 | 位置 | 建议 |
|------|------|------|
| Modal 宽度 560px | ImportDialog | 确认设计稿 |
| 图标尺寸 w-5 h-5 | ImportDialog Warning | 应为 14x14 或 18x18 |
| 图标尺寸 w-8 h-8 | LauncherModal Folder | 应为固定规范尺寸 |

---

## 五、修复优先级

### P0 - 必须修复（影响整体一致性）
1. 原生 `<select>` 改为 Dropdown 组件
2. 原生 checkbox/radio 改为自定义组件
3. 颜色 token 统一

### P1 - 建议修复（提升设计质量）
1. Modal 宽度规范化
2. hover/selected 背景色统一
3. 图标尺寸规范化

### P2 - 可选修复（需要设计师确认）
1. 新增组件的完整设计稿
2. 特殊状态的设计（如 Warp Open Mode）
3. Warning/Info/Error banner 的统一设计

---

## 六、下一步行动

1. **设计师任务**：为 ImportDialog、ScopeSelector、LauncherModal、Settings Launch Section 创建/补充设计稿
2. **开发任务**：根据新设计稿更新代码，确保与项目设计规范一致
3. **Review**：完成后进行视觉对比验收

