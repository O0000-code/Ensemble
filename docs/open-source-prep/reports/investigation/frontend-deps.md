# 前端依赖分析报告

## Dependencies (7 个)

| 依赖名 | 版本 | 使用状态 | 使用位置 |
|-------|-----|---------|---------|
| @tauri-apps/api | ^2.9.1 | used | src/components/modals/ImportClaudeMdModal.tsx, src/components/layout/Sidebar.tsx, src/components/layout/PageHeader.tsx, src/components/layout/ListDetailLayout.tsx, src/components/layout/MainLayout.tsx, src/components/layout/SlidePanel.tsx |
| @tauri-apps/plugin-dialog | ^2.6.0 | **unused** | 无直接使用 - Rust 后端使用，前端无 import |
| lucide-react | ^0.500.0 | used | 38 个文件中使用（页面、组件、布局等） |
| react | ^18.3.1 | used | 60+ 个文件中使用 |
| react-dom | ^18.3.1 | used | src/main.tsx, 以及 17 个使用 createPortal 的组件文件 |
| react-router-dom | ^7.13.0 | used | src/App.tsx, 以及 9 个页面和布局组件 |
| zustand | ^5.0.10 | used | 11 个 store 文件 (src/stores/*.ts) |

## DevDependencies (9 个)

| 依赖名 | 版本 | 使用状态 | 使用位置 |
|-------|-----|---------|---------|
| @tailwindcss/vite | ^4.1.18 | config-only | vite.config.ts |
| @tauri-apps/cli | ^2.9.6 | config-only | package.json scripts ("tauri": "tauri") |
| @types/react | ^18.3.27 | config-only | TypeScript 编译时自动使用 |
| @types/react-dom | ^18.3.7 | config-only | TypeScript 编译时自动使用 |
| @vitejs/plugin-react | ^4.7.0 | config-only | vite.config.ts |
| png-to-ico | ^3.0.1 | config-only | generate-ico.cjs, generate-ico.js (图标生成脚本) |
| tailwindcss | ^4.1.18 | config-only | src/index.css (@import "tailwindcss") |
| typescript | ^5.9.3 | config-only | 项目构建脚本 ("build": "tsc && vite build") |
| vite | ^6.4.1 | config-only | vite.config.ts, package.json scripts |

## 可能未使用的依赖

### 1. @tauri-apps/plugin-dialog (^2.6.0)

**状态**: 可能未使用（前端 npm 包）

**分析**:
- 在前端 `src/` 目录中没有任何 `from '@tauri-apps/plugin-dialog'` 的 import 语句
- 项目通过 Rust 后端的 `tauri-plugin-dialog` crate（在 `src-tauri/Cargo.toml` 中定义）来实现对话框功能
- 前端使用 `safeInvoke('select_file', ...)` 调用 Rust 命令，而不是直接调用 `@tauri-apps/plugin-dialog` API

**调用链**:
```
前端: safeInvoke('select_file', ...)
  → Rust: dialog::select_file (src-tauri/src/commands/dialog.rs)
    → tauri_plugin_dialog::DialogExt
```

**建议**:
- **需要进一步验证**: 检查 Tauri 2.0 的文档，确认是否某些功能需要同时安装前端和后端包
- **潜在可移除**: 如果确认仅 Rust 后端包即可满足需求，前端的 `@tauri-apps/plugin-dialog` 可以移除

### 注意事项

所有 devDependencies 都在正常使用中：
- `@tailwindcss/vite`, `tailwindcss`: Tailwind CSS v4 的 Vite 插件和核心包
- `@vitejs/plugin-react`, `vite`: Vite 构建工具和 React 插件
- `@tauri-apps/cli`: Tauri CLI 工具，用于 `npm run tauri` 命令
- `@types/react`, `@types/react-dom`: TypeScript 类型定义
- `typescript`: TypeScript 编译器
- `png-to-ico`: 图标生成工具脚本使用

## 使用详情

### lucide-react 使用位置 (38 个文件)

<details>
<summary>点击展开完整列表</summary>

1. src/pages/TagPage.tsx
2. src/pages/SceneDetailPage.tsx
3. src/pages/CategoryPage.tsx
4. src/pages/McpDetailPage.tsx
5. src/pages/McpServersPage.tsx
6. src/pages/SkillDetailPage.tsx
7. src/pages/SkillsPage.tsx
8. src/pages/ClaudeMdPage.tsx
9. src/pages/ScenesPage.tsx
10. src/pages/SettingsPage.tsx
11. src/pages/ProjectsPage.tsx
12. src/components/skills/SkillItem.tsx
13. src/components/skills/SkillListItem.tsx
14. src/components/skills/SkillDetailPanel.tsx
15. src/components/claude-md/ClaudeMdBadge.tsx
16. src/components/claude-md/ClaudeMdCard.tsx
17. src/components/claude-md/ClaudeMdDetailPanel.tsx
18. src/components/common/SearchInput.tsx
19. src/components/common/Checkbox.tsx
20. src/components/common/Modal.tsx
21. src/components/common/Button.tsx
22. src/components/common/ScopeSelector.tsx
23. src/components/common/Dropdown.tsx
24. src/components/common/IconPicker.tsx
25. src/components/common/ImportDialog.tsx
26. src/components/mcps/McpDetailPanel.tsx
27. src/components/launcher/LauncherModal.tsx
28. src/components/layout/SlidePanel.tsx
29. src/components/mcps/McpListItem.tsx
30. src/components/projects/ProjectConfigPanel.tsx
31. src/components/projects/ProjectItem.tsx
32. src/components/layout/Sidebar.tsx
33. src/components/projects/ProjectCard.tsx
34. src/components/layout/MainLayout.tsx
35. src/components/mcps/McpItem.tsx
36. src/components/modals/ScanClaudeMdModal.tsx
37. src/components/modals/ImportMcpModal.tsx
38. src/components/scenes/SceneCard.tsx
39. src/components/modals/ImportClaudeMdModal.tsx
40. src/components/scenes/SceneItem.tsx
41. src/components/modals/TrashRecoveryModal.tsx
42. src/components/scenes/SceneListItem.tsx
43. src/components/modals/ImportSkillsModal.tsx
44. src/components/scenes/CreateSceneModal.tsx

</details>

### zustand store 使用位置 (11 个文件)

1. src/stores/appStore.ts
2. src/stores/importStore.ts
3. src/stores/settingsStore.ts
4. src/stores/pluginsStore.ts
5. src/stores/claudeMdStore.ts
6. src/stores/projectsStore.ts
7. src/stores/launcherStore.ts
8. src/stores/skillsStore.ts
9. src/stores/scenesStore.ts
10. src/stores/mcpsStore.ts
11. src/stores/trashStore.ts

## 总结

| 类别 | 数量 | 已使用 | 可能未使用 | 仅配置使用 |
|-----|------|-------|-----------|-----------|
| dependencies | 7 | 6 | 1 | 0 |
| devDependencies | 9 | 0 | 0 | 9 |
| **合计** | **16** | **6** | **1** | **9** |

**建议后续操作**:
1. 验证 `@tauri-apps/plugin-dialog` 是否可以从 package.json 移除
2. 所有其他依赖均在正常使用中，无需处理
