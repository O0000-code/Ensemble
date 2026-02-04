# CLAUDE.md 独立文件存储 - 实现 SubAgent 执行规划

> 创建时间: 2026-02-04
> 状态: 执行中

---

## 一、执行概述

基于研究报告 `22-storage-implementation-research.md`，本规划指导 SubAgent 完成 Rust 后端重构。

---

## 二、SubAgent I1: Rust 后端重构

### 任务目标
修改 `src-tauri/src/commands/claude_md.rs` 中的所有相关函数，实现独立文件存储。

### 必须阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/22-storage-implementation-research.md` - 研究报告
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src-tauri/src/commands/claude_md.rs` - 当前实现
3. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src-tauri/src/types/mod.rs` - 类型定义

### 需要修改的内容

#### 1. 新增辅助函数（在文件开头添加）
```rust
/// 获取 CLAUDE.md 存储根目录
fn get_claude_md_storage_dir() -> PathBuf {
    get_app_data_dir().join("claude-md")
}

/// 获取特定 CLAUDE.md 文件的目录
fn get_claude_md_file_dir(id: &str) -> PathBuf {
    get_claude_md_storage_dir().join(id)
}

/// 获取特定 CLAUDE.md 文件的路径
fn get_claude_md_file_path(id: &str) -> PathBuf {
    get_claude_md_file_dir(id).join("CLAUDE.md")
}

/// 读取 CLAUDE.md 文件内容
fn read_claude_md_content(id: &str) -> Result<String, String> {
    let path = get_claude_md_file_path(id);
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read CLAUDE.md content: {}", e))
}

/// 写入 CLAUDE.md 文件内容
fn write_claude_md_content(id: &str, content: &str) -> Result<(), String> {
    let dir = get_claude_md_file_dir(id);
    fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    let path = dir.join("CLAUDE.md");
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write content: {}", e))
}
```

#### 2. 修改 `import_claude_md()` 函数
- 生成 UUID 作为 ID（已有）
- 创建目录 `~/.ensemble/claude-md/{id}/`
- 复制源文件内容到独立文件
- 在 ClaudeMdFile 中设置 `managed_path`
- `content` 字段设为空字符串（运行时从文件读取）

#### 3. 修改 `get_claude_md_files()` 函数
- 从 data.json 获取元数据列表
- 对每个文件，从独立文件读取 content
- 组装完整的 ClaudeMdFile 返回

#### 4. 修改 `read_claude_md()` 函数
- 从 data.json 获取元数据
- 从独立文件读取 content
- 返回完整的 ClaudeMdFile

#### 5. 修改 `update_claude_md()` 函数
- 如果更新 content，写入独立文件
- 其他字段保存到 data.json

#### 6. 修改 `delete_claude_md()` 函数
- 从 data.json 删除元数据
- 删除独立文件目录 `~/.ensemble/claude-md/{id}/`

#### 7. 修改 `set_global_claude_md()` 函数
- 从独立文件读取内容
- 写入 `~/.claude/CLAUDE.md`

#### 8. 修改 `distribute_claude_md()` 函数
- 从独立文件读取内容
- 写入目标路径

### 输出要求
完成所有修改后，确保代码可以编译通过。

---

## 三、SubAgent I2: 类型定义和数据迁移

### 任务目标
1. 修改 `ClaudeMdFile` 类型定义
2. 实现数据迁移逻辑

### 必须阅读的文件
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/docs/claude-md-feature/22-storage-implementation-research.md` - 研究报告
2. `/Users/bo/Documents/Development/Ensemble/Ensemble2-claude-md-feature/src-tauri/src/types/mod.rs` - 类型定义

### 需要修改的内容

#### 1. 修改 ClaudeMdFile 结构体
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeMdFile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub source_path: String,
    pub source_type: ClaudeMdType,

    /// 文件内容 - 运行时从独立文件读取，不序列化到 data.json
    #[serde(default)]
    #[serde(skip_serializing)]
    pub content: String,

    /// 托管文件路径 (新增)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub managed_path: Option<String>,

    pub is_global: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category_id: Option<String>,
    #[serde(default)]
    pub tag_ids: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
    pub size: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}
```

#### 2. 在 claude_md.rs 中添加迁移函数
```rust
/// 迁移旧数据到独立文件存储
pub fn migrate_claude_md_storage() -> Result<(), String> {
    let mut app_data = read_app_data()?;
    let mut migrated = false;

    for file in app_data.claude_md_files.iter_mut() {
        // 检查是否需要迁移 (content 非空且 managed_path 为空)
        if !file.content.is_empty() && file.managed_path.is_none() {
            // 写入独立文件
            write_claude_md_content(&file.id, &file.content)?;

            // 更新 managed_path
            file.managed_path = Some(get_claude_md_file_path(&file.id).to_string_lossy().to_string());

            // 清空 content (序列化时会自动跳过)
            file.content = String::new();

            migrated = true;
            println!("[Migration] Migrated CLAUDE.md: {}", file.name);
        }
    }

    if migrated {
        write_app_data(app_data)?;
    }

    Ok(())
}
```

#### 3. 在应用初始化时调用迁移
在 `lib.rs` 的 `run()` 函数中，在 `init_app_data()` 之后调用 `migrate_claude_md_storage()`。

### 输出要求
完成所有修改后，确保代码可以编译通过。

---

## 四、验收标准

1. 编译无错误
2. 导入新文件存储在 `~/.ensemble/claude-md/{id}/CLAUDE.md`
3. data.json 中不再包含 content 字段的内容
4. 现有数据自动迁移
5. 所有功能正常工作：导入、查看、编辑、删除、设为全局、分发

---

## 五、注意事项

1. **保持向后兼容**：使用 `#[serde(default)]` 和 `#[serde(skip_serializing)]` 确保旧数据可以读取
2. **原子操作**：先写入独立文件，成功后再更新 data.json
3. **错误处理**：所有文件操作都需要适当的错误处理
4. **日志输出**：迁移过程添加日志便于调试
5. **不要修改前端代码**：TypeScript 类型已经有 content 字段，无需修改
