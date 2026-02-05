# Ensemble 生产版本构建与安装 - 任务理解文档

## 一、任务目标

将 Ensemble 应用构建为生产版本，并安装到 macOS 的 `/Applications` 目录，覆盖已有版本。

## 二、项目当前状态

### 2.1 技术栈
- **后端**: Rust + Tauri 2.9.5
- **前端**: React 18 + Vite 6 + TypeScript 5 + Tailwind CSS 4
- **状态管理**: Zustand 5
- **路由**: React Router DOM 7
- **图标**: Lucide React

### 2.2 应用配置
| 配置项 | 值 |
|--------|-----|
| 产品名称 | `Ensemble` |
| 版本 | `0.0.1` |
| Bundle Identifier | `com.ensemble.app` |
| 最低系统要求 | macOS 10.13 (High Sierra) |
| 窗口尺寸 | 1440 x 900 (最小 1280 x 720) |

### 2.3 已有构建产物
- **构建时间**: 2025年2月4日 03:15
- **二进制文件**: `target/release/ensemble` (15 MB)
- **App Bundle**: `target/release/bundle/macos/Ensemble.app`
- **DMG 安装包**: `target/release/bundle/dmg/Ensemble_0.0.1_aarch64.dmg` (5.6 MB)
- **架构**: `aarch64` (Apple Silicon)

## 三、构建流程

### 3.1 构建命令
```bash
npm run tauri build
```

此命令会：
1. 执行 `npm run build` (前端构建: `tsc && vite build`)
2. 编译 Rust 后端
3. 打包为 `.app` 和 `.dmg`

### 3.2 产出位置
| 类型 | 路径 |
|------|------|
| .app 应用程序 | `src-tauri/target/release/bundle/macos/Ensemble.app` |
| .dmg 安装包 | `src-tauri/target/release/bundle/dmg/Ensemble_*.dmg` |

### 3.3 签名状态
**当前未配置代码签名**，适合本地开发使用。

## 四、安装流程

### 4.1 目标路径
```
/Applications/Ensemble.app
```

### 4.2 安装方式
1. **方式一**: 直接复制 `.app` 到 `/Applications/`
   ```bash
   cp -r src-tauri/target/release/bundle/macos/Ensemble.app /Applications/
   ```

2. **方式二**: 通过 DMG 安装
   - 打开 DMG 文件
   - 拖拽 Ensemble.app 到 Applications 文件夹

### 4.3 覆盖安装注意事项
- 需要先关闭正在运行的 Ensemble 应用
- 可能需要删除旧版本后再复制新版本
- 如果有权限问题，可能需要 `sudo`

## 五、执行步骤摘要

1. **检查环境**: 确保 Node.js、npm、Rust、Cargo 已安装且版本正确
2. **安装依赖**: 运行 `npm install` 确保前端依赖完整
3. **执行构建**: 运行 `npm run tauri build`
4. **验证构建**: 检查产出文件是否存在且完整
5. **关闭旧应用**: 如果 Ensemble 正在运行，关闭它
6. **删除旧版本**: 删除 `/Applications/Ensemble.app`（如存在）
7. **安装新版本**: 复制新构建的 `.app` 到 `/Applications/`
8. **验证安装**: 启动应用确认安装成功

## 六、潜在风险与应对

| 风险 | 应对措施 |
|------|----------|
| 构建失败 | 检查依赖是否完整，查看错误日志 |
| 权限不足 | 使用 `sudo` 或通过 Finder 手动复制 |
| 应用正在运行 | 使用 `pkill Ensemble` 关闭 |
| 空间不足 | 清理 target 目录后重试 |

## 七、验收标准

1. ✅ 构建成功，产出 `.app` 文件
2. ✅ `.app` 文件能正常启动
3. ✅ 已安装到 `/Applications/Ensemble.app`
4. ✅ 从 Launchpad 或 Spotlight 能找到并启动应用
5. ✅ 应用功能正常运行
