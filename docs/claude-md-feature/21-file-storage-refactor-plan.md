# CLAUDE.md 独立文件存储重构 - SubAgent 执行规划

> 创建时间: 2026-02-04
> 状态: 执行中

---

## 一、目标

将 CLAUDE.md 的存储方式从 **内容嵌入 data.json** 改为 **独立文件存储**，与 Skill/MCP 的管理方式保持一致。

### 当前存储方式
```
~/.ensemble/
├── data.json          # 包含 claude_md_files 数组，内容直接嵌入
├── skills/            # Skill 独立文件
└── mcps/              # MCP 独立文件
```

### 目标存储方式
```
~/.ensemble/
├── data.json          # 只存储元数据（不含 content）
├── skills/
├── mcps/
└── claude-md/         # 新增：CLAUDE.md 独立文件存储
    ├── {id}/          # 以 ID 为目录名
    │   └── CLAUDE.md  # 实际内容文件
    └── backups/       # 全局备份目录（已存在逻辑）
```

---

## 二、需要修改的文件

### Rust 后端
1. **src-tauri/src/commands/claude_md.rs**
   - `import_claude_md`: 改为复制文件到 `~/.ensemble/claude-md/{id}/`
   - `get_claude_md_files`: 从独立文件读取 content
   - `update_claude_md`: 更新独立文件内容
   - `delete_claude_md`: 删除独立文件目录
   - `set_global_claude_md`: 从独立文件读取内容复制到全局
   - 新增辅助函数: `get_claude_md_dir()`, `get_file_content()`

2. **src-tauri/src/types/mod.rs** (如有)
   - `ClaudeMdFile` 结构体可能需要调整

### 前端 (可能无需修改)
- TypeScript 类型和 Store 逻辑应该不需要改动
- UI 组件不需要改动（因为数据结构不变）

---

## 三、数据结构变化

### data.json 中的 claude_md_files 变化

**修改前**:
```json
{
  "claude_md_files": [
    {
      "id": "xxx",
      "name": "my-config",
      "content": "# 完整内容...",  // 内容嵌入
      "source_path": "/original/path/CLAUDE.md",
      ...
    }
  ]
}
```

**修改后**:
```json
{
  "claude_md_files": [
    {
      "id": "xxx",
      "name": "my-config",
      "content": "",  // 保留字段但不存储内容（或移除）
      "source_path": "/original/path/CLAUDE.md",
      "managed_path": "~/.ensemble/claude-md/xxx/CLAUDE.md",  // 新增：托管路径
      ...
    }
  ]
}
```

---

## 四、SubAgent 任务分配

### SubAgent R1: 研究分析 (先行)
**任务**: 深入分析 Skill/MCP 的文件存储实现，总结最佳实践
**输出**: 研究报告，包含具体实现模式

### SubAgent I1: Rust 后端重构 (依赖 R1)
**任务**: 修改 Rust 后端所有相关命令
**输出**: 修改后的 claude_md.rs

### SubAgent I2: 数据迁移逻辑 (依赖 R1)
**任务**: 实现现有数据的自动迁移逻辑
**输出**: 迁移函数，确保现有数据无缝迁移

### SubAgent V1: 验证测试 (依赖 I1, I2)
**任务**: 验证所有功能正常工作
**输出**: 测试报告

---

## 五、关键约束

1. **不能影响现有功能**: 所有交互逻辑必须保持不变
2. **数据迁移**: 现有的 data.json 中的内容需要自动迁移到独立文件
3. **向后兼容**: 旧版本 data.json 需要能够被正确处理
4. **路径一致性**: 使用与 Skill/MCP 类似的目录结构

---

## 六、执行顺序

1. [R1] 研究 Skill/MCP 实现
2. [I1 + I2] 并行实现后端重构和迁移逻辑
3. [V1] 验证测试
4. 提交代码

---

## 七、验收标准

1. CLAUDE.md 文件存储在 `~/.ensemble/claude-md/{id}/CLAUDE.md`
2. data.json 不再包含文件内容
3. 所有现有功能正常工作（导入、扫描、设为全局、分发）
4. 现有数据自动迁移
5. 编译无错误，运行无崩溃
