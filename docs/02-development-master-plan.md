# Ensemble 开发总规划

## 一、开发概述

基于设计分析阶段收集的完整信息，现在开始进入实际开发阶段。

### 关键参考文档
- `/docs/design/01-page-structure.md` - 页面结构索引
- `/docs/design/02-sidebar-design.md` - Sidebar 设计规范
- `/docs/design/03-skills-design.md` - Skills 模块设计规范
- `/docs/design/04-mcp-design.md` - MCP 模块设计规范
- `/docs/design/05-scenes-design.md` - Scenes 模块设计规范
- `/docs/design/06-projects-design.md` - Projects 模块设计规范
- `/docs/design/07-settings-design.md` - Settings 设计规范
- `/docs/design/08-components-design.md` - 通用组件设计规范
- `/docs/reference/01-claude-code-structure.md` - Claude Code 目录结构分析

---

## 二、开发批次规划

### 批次 1: 项目初始化
**目标**: 创建 Tauri 2.0 项目，配置基础开发环境

**任务**:
1. 初始化 Tauri 2.0 + React + TypeScript 项目
2. 配置 Tailwind CSS 4
3. 安装必要依赖 (Zustand, React Router, Lucide Icons)
4. 创建项目目录结构
5. 配置全局样式变量 (颜色、字体、间距)

### 批次 2: 基础组件库开发
**目标**: 实现所有可复用的基础 UI 组件

**任务**:
1. Toggle 组件 (三种尺寸: large/medium/small)
2. Badge 组件 (状态徽章、计数徽章)
3. Button 组件 (Primary/Secondary/Danger/Icon)
4. Input 组件 (Text/Textarea)
5. SearchInput 组件
6. Dropdown 组件 (Category/Tags)
7. ContextMenu 组件
8. Modal 组件 (基础弹窗框架)
9. EmptyState 组件
10. Checkbox 组件

### 批次 3: 布局组件开发
**目标**: 实现应用的整体布局框架

**任务**:
1. Sidebar 组件 (260px, 导航、分类、标签)
2. MainLayout 组件 (Sidebar + Main Content)
3. ListDetailLayout 组件 (双栏布局: List Panel + Detail Panel)
4. 路由配置 (React Router)

### 批次 4: Skills 模块开发
**目标**: 实现 Skills 完整功能

**任务**:
1. SkillItem 组件 (列表项)
2. SkillsListPage 页面 (列表视图)
3. SkillsEmptyState 页面
4. SkillDetailPage 页面 (详情视图)
5. 筛选状态页面 (按分类/标签)
6. Skills Zustand Store

### 批次 5: MCP 模块开发
**目标**: 实现 MCP Servers 完整功能

**任务**:
1. McpItem 组件 (列表项，含 Tools Count)
2. McpServersListPage 页面
3. McpServersEmptyState 页面
4. McpDetailPage 页面 (含 Provided Tools 列表)
5. MCP Zustand Store

### 批次 6: Scenes 模块开发
**目标**: 实现 Scenes 完整功能，包括复杂的新建模态框

**任务**:
1. SceneCard 组件 (网格卡片)
2. ScenesListPage 页面
3. ScenesEmptyState 页面
4. SceneDetailPage 页面
5. CreateSceneModal 组件 (三栏布局)
6. Scenes Zustand Store

### 批次 7: Projects 模块开发
**目标**: 实现 Projects 完整功能

**任务**:
1. ProjectItem 组件
2. ProjectsListPage 页面
3. ProjectsEmptyState 页面
4. ProjectConfigPanel 组件 (查看/编辑模式)
5. NewProjectPage 页面
6. Projects Zustand Store

### 批次 8: Settings 模块开发
**目标**: 实现 Settings 页面

**任务**:
1. SettingsPage 页面
2. Storage Section 组件
3. AutoClassify Section 组件
4. About Section 组件
5. Settings Zustand Store

### 批次 9: Tauri 后端开发
**目标**: 实现 Rust 后端功能

**任务**:
1. 文件系统操作模块
   - scan_skills: 扫描 Skills 目录
   - scan_mcps: 扫描 MCP 配置
2. Symlink 操作模块
   - create_symlink: 创建符号链接
   - remove_symlink: 删除符号链接
3. 配置生成模块
   - write_mcp_config: 生成 MCP 配置
   - read_app_data / write_app_data: 应用数据读写
4. 对话框模块
   - select_folder: 文件夹选择对话框

### 批次 10: 集成与测试
**目标**: 前后端集成，功能测试，视觉验证

**任务**:
1. 前后端 Tauri 命令集成
2. 完整流程测试
3. 视觉还原验证 (截图对比)
4. 错误处理和边界情况测试
5. 性能优化

---

## 三、技术规范

### 3.1 全局样式变量

```css
/* 颜色 */
--color-primary: #18181B;
--color-secondary: #71717A;
--color-tertiary: #A1A1AA;
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #FAFAFA;
--color-bg-tertiary: #F4F4F5;
--color-border: #E5E5E5;
--color-divider: #E4E4E7;
--color-success: #16A34A;
--color-success-bg: #DCFCE7;
--color-warning: #D97706;
--color-warning-bg: #FEF3C7;
--color-error: #DC2626;
--color-error-bg: #FEE2E2;

/* 字体 */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-size-xs: 10px;
--font-size-sm: 11px;
--font-size-base: 12px;
--font-size-md: 13px;
--font-size-lg: 14px;
--font-size-xl: 16px;
--font-size-2xl: 18px;

/* 圆角 */
--radius-sm: 3px;
--radius-base: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 10px;
--radius-2xl: 11px;
--radius-3xl: 16px;

/* 阴影 */
--shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.06);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.05);
```

### 3.2 目录结构

```
ensemble/
├── src/
│   ├── components/
│   │   ├── common/          # 通用组件
│   │   ├── layout/          # 布局组件
│   │   ├── skills/          # Skills 模块组件
│   │   ├── mcps/            # MCP 模块组件
│   │   ├── scenes/          # Scenes 模块组件
│   │   └── projects/        # Projects 模块组件
│   ├── pages/               # 页面组件
│   ├── stores/              # Zustand stores
│   ├── hooks/               # 自定义 hooks
│   ├── utils/               # 工具函数
│   ├── types/               # TypeScript 类型
│   ├── styles/              # 全局样式
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   └── commands/        # Tauri 命令
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

### 3.3 数据模型

参考 `/docs/00-project-understanding.md` 中的完整数据模型定义。

---

## 四、验收标准

1. **视觉还原**: 与设计稿 1:1 匹配
2. **功能完整**: 所有 19 个页面状态均已实现
3. **核心流程**: 项目配置同步正常工作
4. **数据持久化**: 应用数据正确存储和读取
5. **错误处理**: 文件操作错误有友好提示
6. **代码质量**: 结构清晰，类型完整，无 console 错误

---

## 五、执行顺序

```
批次 1 (项目初始化)
    ↓
批次 2 (基础组件)
    ↓
批次 3 (布局组件)
    ↓
批次 4-8 (各模块开发，可部分并行)
    ↓
批次 9 (Tauri 后端)
    ↓
批次 10 (集成测试)
```

**并行执行说明**:
- 批次 4-8 中的前端开发可以并行进行
- 批次 9 可以与批次 4-8 并行进行
- 批次 10 必须在所有前置批次完成后进行
