# IconPicker 图标扩展 - SubAgent 执行规划

## 1. 执行概述

本任务相对简单，只需要修改一个文件，因此采用单 SubAgent 执行策略，确保修改的一致性和完整性。

## 2. 执行阶段

### 阶段 1: Git Worktree 创建
- 创建新的 worktree 分支 `feature/expand-icon-picker`
- 工作目录: `/Users/bo/Documents/Development/Ensemble/Ensemble2-icon-picker`

### 阶段 2: 代码修改
- 由一个 SubAgent 执行 IconPicker.tsx 的修改

### 阶段 3: 验证测试
- 运行开发服务器
- 手动验证功能

### 阶段 4: 等待用户验证
- 用户手动确认效果
- 确认后合并分支

## 3. SubAgent 执行规划

### SubAgent 任务: 修改 IconPicker.tsx

**任务描述**: 扩展 IconPicker 组件的图标列表

**前置阅读**（必须在开始修改前阅读）:
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/icon-picker-enhancement/01-task-understanding.md`
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-icon-picker/src/components/common/IconPicker.tsx`

**执行步骤**:

1. **阅读理解文档**
   - 完整阅读 `01-task-understanding.md`
   - 理解任务目标和技术要点

2. **阅读当前代码**
   - 完整阅读 `IconPicker.tsx`
   - 理解当前的 ICON_MAP 结构
   - 理解导入语句格式

3. **修改 ICON_MAP**
   - 保留现有的 24 个图标（保持顺序）
   - 在末尾添加新的图标（约 46 个新图标）
   - 确保使用 kebab-case 作为键名
   - 确保正确导入对应的 Lucide 组件

4. **更新导入语句**
   - 从 lucide-react 导入所有需要的新图标组件
   - 按字母顺序排列导入

5. **验证滚动功能**
   - 确认图标容器已有 `overflow-y-auto` 类
   - 确认已应用 `icon-picker-scroll` 类

**输出要求**:
- 直接修改 worktree 中的文件
- 不创建新文件
- 保持代码格式一致

## 4. 新增图标映射表

以下是需要添加的新图标（不包括已有的 24 个）:

```typescript
// 新增的图标（46 个）
// 通用操作类
'search': Search,
'plus': Plus,
'minus': Minus,
'x': X,
'check': Check,
'edit': Edit,
'pencil': Pencil,
'trash-2': Trash2,
'copy': Copy,
'save': Save,
'download': Download,
'upload': Upload,
'refresh-cw': RefreshCw,
'more-horizontal': MoreHorizontal,
'more-vertical': MoreVertical,

// 导航类
'home': Home,
'arrow-left': ArrowLeft,
'arrow-right': ArrowRight,
'arrow-up': ArrowUp,
'arrow-down': ArrowDown,
'chevron-left': ChevronLeft,
'chevron-right': ChevronRight,
'chevron-up': ChevronUp,
'chevron-down': ChevronDown,
'external-link': ExternalLink,
'menu': Menu,

// 状态/通知类
'check-circle': CheckCircle,
'alert-circle': AlertCircle,
'x-circle': XCircle,
'info': Info,
'alert-triangle': AlertTriangle,
'bell': Bell,
'bell-off': BellOff,
'loader-2': Loader2,
'clock': Clock,
'circle-dot': CircleDot,

// 开发工具类 (部分已有)
'git-commit': GitCommit,
'bug': Bug,
'wrench': Wrench,
'puzzle': Puzzle,

// 文件/文档类 (部分已有)
'file-text': FileText,
'file-code': FileCode,
'folder-open': FolderOpen,
'folder-plus': FolderPlus,
'file-json': FileJson,
'archive': Archive,
'clipboard': Clipboard,

// 界面/布局类 (部分已有)
'layout-list': LayoutList,
'panel-left': PanelLeft,
'panel-right': PanelRight,
'maximize-2': Maximize2,
'minimize-2': Minimize2,
'split-square-horizontal': SplitSquareHorizontal,
'grid-3x3': Grid3X3,
'columns': Columns,

// 用户/账户类
'user': User,
'users': Users,
'user-plus': UserPlus,
'log-in': LogIn,
'log-out': LogOut,
'shield-check': ShieldCheck,

// 其他常用 (部分已有)
'star': Star,
'heart': Heart,
'tag': Tag,
'hash': Hash,
'link': Link,
```

## 5. 验证检查清单

- [ ] 所有新图标正确导入
- [ ] ICON_MAP 包含约 70 个图标
- [ ] 键名使用 kebab-case
- [ ] 图标区域可滚动
- [ ] 滚动条样式正确
- [ ] 搜索功能正常
- [ ] 键盘导航正常
- [ ] 无 TypeScript 错误
- [ ] 无控制台错误
