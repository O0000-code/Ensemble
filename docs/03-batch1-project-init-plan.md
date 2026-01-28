# 批次 1: 项目初始化 - SubAgent 执行规划

## 批次目标
创建 Tauri 2.0 + React + TypeScript 项目，配置完整的开发环境。

---

## SubAgent 任务分配

### SubAgent 1: Tauri 项目创建
**任务**: 初始化 Tauri 2.0 项目

**操作步骤**:
1. 在 `/Users/bo/Documents/Development/Ensemble/Ensemble2` 目录下执行 Tauri 初始化
2. 使用 React + TypeScript 模板
3. 配置项目名称为 "Ensemble"
4. 配置窗口大小为 1440x900

**命令**:
```bash
cd /Users/bo/Documents/Development/Ensemble/Ensemble2
npm create tauri-app@latest . -- --template react-ts
```

如果上述命令失败（因为目录非空），使用手动方式：
```bash
# 1. 创建 React + TypeScript + Vite 项目
npm create vite@latest ensemble-temp -- --template react-ts
mv ensemble-temp/* .
mv ensemble-temp/.* . 2>/dev/null || true
rm -rf ensemble-temp

# 2. 添加 Tauri
npm install
npm install --save-dev @tauri-apps/cli@^2.0.0
npm exec tauri init
```

**验证**:
- package.json 存在且包含 tauri 相关脚本
- src-tauri 目录存在
- 能够成功运行 `npm run tauri dev`

---

### SubAgent 2: 依赖安装和配置
**任务**: 安装项目所需的所有前端依赖

**依赖列表**:
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.500.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

**操作步骤**:
```bash
cd /Users/bo/Documents/Development/Ensemble/Ensemble2

# 安装 React 生态
npm install react-router-dom zustand lucide-react

# 安装 Tailwind CSS 4
npm install -D tailwindcss @tailwindcss/vite
```

---

### SubAgent 3: Tailwind CSS 配置
**任务**: 配置 Tailwind CSS 4

**操作步骤**:

1. **修改 vite.config.ts**:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
```

2. **修改 src/index.css**:
```css
@import "tailwindcss";

/* 全局样式变量 */
:root {
  /* 颜色系统 */
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
}

/* 全局字体设置 */
body {
  font-family: var(--font-family);
  background-color: var(--color-bg-primary);
  color: var(--color-primary);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-tertiary);
}
```

---

### SubAgent 4: 目录结构创建
**任务**: 创建完整的前端目录结构

**操作步骤**:
```bash
cd /Users/bo/Documents/Development/Ensemble/Ensemble2/src

# 创建组件目录
mkdir -p components/common
mkdir -p components/layout
mkdir -p components/skills
mkdir -p components/mcps
mkdir -p components/scenes
mkdir -p components/projects

# 创建其他目录
mkdir -p pages
mkdir -p stores
mkdir -p hooks
mkdir -p utils
mkdir -p types
mkdir -p styles
```

---

### SubAgent 5: TypeScript 类型定义
**任务**: 创建核心数据类型定义

**创建文件**: `src/types/index.ts`

```typescript
// Skill 类型
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'user' | 'project';
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

// MCP Server 类型
export interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

export interface Tool {
  name: string;
  description: string;
}

// Scene 类型
export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}

// Project 类型
export interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
}

// Category 类型
export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Tag 类型
export interface Tag {
  id: string;
  name: string;
  count: number;
}

// App Settings 类型
export interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;
  autoClassifyNewItems: boolean;
}

// Config Status 类型
export interface ConfigStatus {
  projectExists: boolean;
  sceneSelected: boolean;
  skillsConfigured: boolean;
  mcpsConfigured: boolean;
}
```

---

### SubAgent 6: Tauri 配置
**任务**: 配置 Tauri 窗口和应用信息

**修改文件**: `src-tauri/tauri.conf.json`

关键配置项:
```json
{
  "productName": "Ensemble",
  "identifier": "com.ensemble.app",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Ensemble",
        "width": 1440,
        "height": 900,
        "minWidth": 1280,
        "minHeight": 720,
        "resizable": true,
        "center": true,
        "decorations": true,
        "titleBarStyle": "Overlay"
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

---

### SubAgent 7: 基础 App 组件
**任务**: 创建基础的 App 组件和路由配置

**修改文件**: `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// 临时页面占位
const SkillsPage = () => <div>Skills Page</div>;
const McpServersPage = () => <div>MCP Servers Page</div>;
const ScenesPage = () => <div>Scenes Page</div>;
const ProjectsPage = () => <div>Projects Page</div>;
const SettingsPage = () => <div>Settings Page</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/skills" replace />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="skills/:id" element={<SkillsPage />} />
          <Route path="mcp-servers" element={<McpServersPage />} />
          <Route path="mcp-servers/:id" element={<McpServersPage />} />
          <Route path="scenes" element={<ScenesPage />} />
          <Route path="scenes/:id" element={<ScenesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**修改文件**: `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### SubAgent 8: 基础布局占位
**任务**: 创建基础的 MainLayout 占位组件

**创建文件**: `src/components/layout/MainLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar 占位 */}
      <aside className="w-[260px] border-r border-[#E5E5E5] flex-shrink-0">
        <div className="h-14 border-b border-[#E5E5E5] flex items-center px-4">
          <div className="w-6 h-6 bg-[#18181B] rounded-md mr-2.5"></div>
          <span className="text-sm font-semibold tracking-tight">Ensemble</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400">Sidebar content...</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 执行顺序

**顺序执行**:
1. SubAgent 1: Tauri 项目创建
2. SubAgent 2: 依赖安装
3. SubAgent 3-8 可并行执行（配置和文件创建）

**验证点**:
- 完成后运行 `npm run tauri dev` 确认项目能正常启动
- 确认窗口大小为 1440x900
- 确认基础布局显示正确

---

## 输出清单

完成后应存在以下文件:
- `package.json` (包含所有依赖)
- `vite.config.ts` (包含 Tailwind 配置)
- `src/index.css` (全局样式变量)
- `src/types/index.ts` (类型定义)
- `src/App.tsx` (路由配置)
- `src/main.tsx` (入口文件)
- `src/components/layout/MainLayout.tsx` (基础布局)
- `src-tauri/tauri.conf.json` (Tauri 配置)
- `src/components/` (完整目录结构)
