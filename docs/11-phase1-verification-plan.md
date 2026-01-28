# Phase 1: Tauri 后端状态验证 - SubAgent 执行规划

## 执行目标
验证上次 5 个 SubAgent 完成的 Tauri 后端代码是否完整存在，并确认编译状态。

---

## SubAgent A: 文件存在性验证

### 任务描述
检查所有 Tauri 后端相关文件是否存在。

### 需要检查的文件列表
```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── capabilities/default.json
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── types.rs
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── skills.rs
│   │   ├── mcps.rs
│   │   ├── symlink.rs
│   │   ├── config.rs
│   │   ├── data.rs
│   │   └── dialog.rs
│   └── utils/
│       ├── mod.rs
│       ├── path.rs
│       └── parser.rs
```

### 执行步骤
1. 使用 Glob 工具检查 `src-tauri/**/*.rs` 文件
2. 使用 Glob 工具检查 `src-tauri/**/*.toml` 文件
3. 使用 Glob 工具检查 `src-tauri/**/*.json` 文件
4. 列出所有找到的文件
5. 与预期文件列表对比，标记缺失文件

### 输出要求
- 列出所有存在的文件
- 标记任何缺失的文件
- 提供文件数量统计

---

## SubAgent B: 编译状态验证

### 任务描述
运行 Cargo 命令验证 Rust 代码编译状态。

### 执行步骤
1. 进入 `src-tauri` 目录
2. 运行 `cargo check` 命令
3. 捕获输出结果
4. 分析是否有错误（errors）
5. 记录警告（warnings）数量

### 输出要求
- 编译状态：成功/失败
- 错误列表（如有）
- 警告数量和类型
- 关键问题标记

---

## SubAgent C: 关键文件内容验证

### 任务描述
检查关键文件的内容完整性。

### 需要检查的文件
1. `src-tauri/src/lib.rs` - 验证 38 个命令是否都已注册
2. `src-tauri/src/commands/mod.rs` - 验证所有命令模块是否导出
3. `src-tauri/Cargo.toml` - 验证依赖配置

### 验证标准

**lib.rs 应包含的命令（38个）**：
- Skills: scan_skills, get_skill, update_skill_metadata
- MCPs: scan_mcps, get_mcp, update_mcp_metadata
- Symlink: create_symlink, remove_symlink, is_symlink, get_symlink_target, create_symlinks, remove_symlinks
- Config: write_mcp_config, sync_project_config, clear_project_config, get_project_config_status
- Data: read_app_data, write_app_data, read_settings, write_settings, init_app_data
- Categories: get_categories, add_category, update_category, delete_category
- Tags: get_tags, add_tag, delete_tag
- Scenes: get_scenes, add_scene, update_scene, delete_scene
- Projects: get_projects, add_project, update_project, delete_project
- Dialog: select_folder, select_file

**commands/mod.rs 应导出的模块**：
- pub mod skills
- pub mod mcps
- pub mod symlink
- pub mod config
- pub mod data
- pub mod dialog

**Cargo.toml 应包含的依赖**：
- tauri (version 2.x)
- serde + serde_json
- uuid
- chrono
- dirs
- walkdir
- yaml-rust2

### 输出要求
- 每个文件的验证结果
- 缺失的命令/模块/依赖列表
- 总体完整性评估

---

## 验证结果汇总格式

```markdown
## 验证结果摘要

### 文件存在性
- 预期文件数: X
- 实际存在数: Y
- 缺失文件: [列表]

### 编译状态
- 状态: 成功/失败
- 错误数: X
- 警告数: Y

### 内容完整性
- lib.rs 命令注册: X/38
- mod.rs 模块导出: X/6
- Cargo.toml 依赖: X/Y

### 总体结论
[PASS/FAIL] + 说明
```
