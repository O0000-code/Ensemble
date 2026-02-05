# MCP 配置和 CLAUDE.md 同步问题理解文档

## 问题背景

用户通过 Ensemble 应用的 "Open with Ensemble" 功能启动项目后：
1. Skills 可以正确加载（通过 symlink 方式）
2. MCP 配置写入了 `settings.local.json`，但 Claude Code 无法加载
3. CLAUDE.md 文件没有按预设复制过去

## 问题诊断

### 问题 1: MCP 配置文件位置错误（核心问题）

#### Claude Code MCP 配置加载机制

| 作用域 | 文件位置 | 文件名 | 用途 |
|--------|----------|--------|------|
| **User (用户级)** | `~/.claude.json` | `~/.claude.json` | 跨所有项目可用的个人 MCP 服务器 |
| **Project (项目级)** | 项目根目录 | `.mcp.json` | 团队共享的 MCP 配置 |
| **Local (本地级)** | `~/.claude.json` 内按项目路径存储 | `~/.claude.json` | 仅你可见的项目特定配置 |

**关键发现**: `settings.local.json` 不是 MCP 配置的正确位置！

#### 当前错误实现

```
当前实现:
write_mcp_config() → {project}/.claude/settings.local.json  ❌

正确实现:
write_mcp_config() → {project}/.mcp.json  ✅
```

**代码位置**: `/src-tauri/src/commands/config.rs` 第 8-48 行

```rust
// 当前代码（错误）
let settings_path = claude_dir.join("settings.local.json");

// 应该改为
let mcp_path = project_dir.join(".mcp.json");
```

#### MCP 配置正确格式

项目级 `.mcp.json` 格式：
```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",
      "command": "/path/to/server",
      "args": ["--arg1", "value1"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

注意：需要添加 `"type": "stdio"` 字段！

### 问题 2: CLAUDE.md 复制功能未实现

#### 数据流分析

1. **Scene 创建时**: 可以选择 CLAUDE.md，数据保存在 `scene.claudeMdIds`
2. **Project 同步时**: `syncProject` 函数没有处理 `claudeMdIds`
3. **后端**: `sync_project_config` 命令没有 CLAUDE.md 复制逻辑

#### 已有但未调用的功能

后端已实现完整的 CLAUDE.md 分发功能（`/src-tauri/src/commands/claude_md.rs`）：
- `distribute_claude_md`: 分发单个 CLAUDE.md 到项目
- `distribute_scene_claude_md`: 批量分发 Scene 中的所有 CLAUDE.md

这些功能已经实现但**没有被同步流程调用**。

#### 前端 syncProject 函数分析

位置: `/src/stores/projectsStore.ts` 第 194-247 行

```typescript
syncProject: async (id) => {
  // ...
  await safeInvoke('sync_project_config', {
    projectPath: project.path,
    skillPaths: skillPaths,
    mcpServers: mcpServers,
    // ⚠️ 没有处理 claudeMdIds！
  });
};
```

## 修复方案

### 方案 1: MCP 配置文件位置修复

**需要修改的文件**:
1. `/src-tauri/src/commands/config.rs` - `write_mcp_config` 函数
2. `/src-tauri/src/commands/config.rs` - `sync_project_config` 函数
3. `/src-tauri/src/commands/config.rs` - `get_project_config_status` 函数
4. `/src-tauri/src/commands/config.rs` - `clear_project_config` 函数

**修改内容**:
1. 将 MCP 配置写入 `{project}/.mcp.json` 而不是 `{project}/.claude/settings.local.json`
2. 添加 `"type": "stdio"` 字段到每个 MCP server 配置
3. 更新配置状态检查逻辑

### 方案 2: CLAUDE.md 复制功能修复

**需要修改的文件**:
1. `/src/stores/projectsStore.ts` - `syncProject` 函数

**修改内容**:
在 `syncProject` 函数中，同步完成后调用 `distribute_scene_claude_md` 命令：

```typescript
// 在现有 sync_project_config 调用之后添加
if (scene.claudeMdIds && scene.claudeMdIds.length > 0) {
  await safeInvoke('distribute_scene_claude_md', {
    projectPath: project.path,
    sceneId: scene.id,
  });
}
```

## 影响范围

### 修改的文件清单

| 文件 | 修改类型 | 修改内容 |
|------|----------|----------|
| `src-tauri/src/commands/config.rs` | Rust 后端 | MCP 配置写入路径和格式 |
| `src/stores/projectsStore.ts` | 前端 Store | 添加 CLAUDE.md 分发调用 |

### 不受影响的功能

- Skills symlink 创建逻辑
- Scene 创建/编辑 UI
- MCP 扫描/导入功能
- 其他所有现有功能和样式

## 验证方法

1. **MCP 配置验证**:
   - 同步项目后检查 `{project}/.mcp.json` 文件是否存在
   - 在 Claude Code 中运行 `/mcp` 查看 MCP 服务器列表
   - 运行 `/doctor` 检查配置错误

2. **CLAUDE.md 验证**:
   - 同步项目后检查 `{project}/CLAUDE.md` 文件是否存在
   - 内容是否与 Scene 中选择的 CLAUDE.md 一致

## 需要注意的事项

1. **向后兼容**: 需要处理已存在的 `settings.local.json` 中的 MCP 配置，可能需要迁移
2. **清理配置**: `clear_project_config` 也需要同步更新，删除 `.mcp.json`
3. **配置状态**: `get_project_config_status` 需要检查 `.mcp.json` 而不是 `settings.local.json`
