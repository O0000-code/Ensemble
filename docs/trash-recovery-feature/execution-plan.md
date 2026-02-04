# Trash Recovery Feature - 执行规划

## 一、执行前准备

### 1.1 创建 Git Worktree
```bash
git worktree add ../Ensemble2-trash-recovery feature/trash-recovery
```

在独立的 worktree 中进行开发，完成后合并回 main 分支。

### 1.2 验证环境
- 确保当前代码可以正常编译和运行
- 确保所有现有功能正常工作

---

## 二、任务分解

### Phase 1: 后端实现 (Rust)

#### Task 1.1: 创建 trash 类型定义
**文件**: `src-tauri/src/types.rs`

添加以下类型：
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedSkill {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedMcp {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedClaudeMd {
    pub id: String,
    pub name: String,
    pub path: String,
    pub deleted_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashedItems {
    pub skills: Vec<TrashedSkill>,
    pub mcps: Vec<TrashedMcp>,
    pub claude_md_files: Vec<TrashedClaudeMd>,
}
```

#### Task 1.2: 创建 trash.rs 命令模块
**文件**: `src-tauri/src/commands/trash.rs`

实现以下命令：

**list_trashed_items**
- 扫描 `~/.ensemble/trash/skills/` 目录
- 扫描 `~/.ensemble/trash/mcps/` 目录
- 扫描 `~/.ensemble/trash/claude-md/` 目录
- 解析每个项目的信息（名称、删除时间、描述）
- 返回 `TrashedItems` 结构

**restore_skill**
- 验证 trash 路径存在
- 提取原始名称（去除时间戳后缀）
- 检查目标路径是否已存在同名 skill
- 移动文件到 `~/.ensemble/skills/`

**restore_mcp**
- 验证 trash 路径存在
- 提取原始名称（去除时间戳后缀，保留 .json 扩展名）
- 检查目标路径是否已存在同名 MCP
- 移动文件到 `~/.ensemble/mcps/`

**restore_claude_md**
- 验证 trash 路径存在
- 读取 trash 目录中的 info.json 获取原始 ID 和名称
- 移动目录到 `~/.ensemble/claude-md/`
- 恢复 `data.json` 中的 `claude_md_files` 记录

#### Task 1.3: 注册 trash 命令
**文件**: `src-tauri/src/commands/mod.rs`
```rust
pub mod trash;
```

**文件**: `src-tauri/src/lib.rs`
在 `tauri::generate_handler![]` 中添加：
```rust
trash::list_trashed_items,
trash::restore_skill,
trash::restore_mcp,
trash::restore_claude_md,
```

---

### Phase 2: 前端类型定义 (TypeScript)

#### Task 2.1: 创建 trash 类型
**文件**: `src/types/trash.ts`

```typescript
export interface TrashedSkill {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
  description: string;
}

export interface TrashedMcp {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
  description: string;
}

export interface TrashedClaudeMd {
  id: string;
  name: string;
  path: string;
  deletedAt: string;
}

export interface TrashedItems {
  skills: TrashedSkill[];
  mcps: TrashedMcp[];
  claudeMdFiles: TrashedClaudeMd[];
}
```

#### Task 2.2: 导出类型
**文件**: `src/types/index.ts`

添加导出：
```typescript
export * from './trash';
```

---

### Phase 3: 前端状态管理 (Zustand Store)

#### Task 3.1: 创建 trashStore
**文件**: `src/stores/trashStore.ts`

```typescript
interface TrashState {
  trashedItems: TrashedItems | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;

  // Actions
  loadTrashedItems: () => Promise<void>;
  restoreSkill: (path: string) => Promise<void>;
  restoreMcp: (path: string) => Promise<void>;
  restoreClaudeMd: (path: string) => Promise<void>;
  clearError: () => void;
}
```

#### Task 3.2: 导出 store
**文件**: `src/stores/index.ts`

添加导出：
```typescript
export { useTrashStore } from './trashStore';
```

---

### Phase 4: 弹框组件实现

#### Task 4.1: 创建 TrashRecoveryModal 组件
**文件**: `src/components/modals/TrashRecoveryModal.tsx`

**组件结构**：
```
TrashRecoveryModal
├── Props: { isOpen, onClose, onRestoreComplete? }
├── State:
│   ├── activeTab: 'skills' | 'mcps' | 'claudeMd'
│   └── selectedItems: Set<string>
├── Effects:
│   ├── 弹框打开时加载 trash 数据
│   ├── ESC 键关闭
│   └── 管理 body overflow
└── Render:
    ├── Overlay (createPortal)
    ├── Modal Container (520x580)
    ├── Header (标题 + 关闭按钮)
    ├── Tab Row (Skills/MCPs/CLAUDE.md)
    ├── Body (可选列表)
    └── Footer (Cancel + Recover Selected)
```

**关键实现点**：
1. 使用 `createPortal` 渲染到 `document.body`
2. 遵循与 `ImportSkillsModal` 完全相同的样式规范
3. Tab 切换时保持选中状态独立
4. 恢复操作后刷新列表

#### Task 4.2: 导出组件
**文件**: `src/components/modals/index.ts`

添加导出：
```typescript
export { TrashRecoveryModal } from './TrashRecoveryModal';
```

---

### Phase 5: 设置页面集成

#### Task 5.1: 修改 SettingsPage
**文件**: `src/pages/SettingsPage.tsx`

**修改内容**：
1. 导入 `TrashRecoveryModal`
2. 添加 `showTrashModal` 状态
3. 在 Storage section 的最后一个 Row 之后添加 Trash Row：

```tsx
{/* Trash */}
<Row noBorder>
  <div className="flex flex-col gap-0.5">
    <span className="text-[13px] font-medium text-[#18181B]">
      Trash
    </span>
    <span className="text-xs text-[#71717A]">
      Recover deleted Skills, MCPs, and CLAUDE.md files
    </span>
  </div>
  <ActionButton onClick={() => setShowTrashModal(true)}>
    Manage
  </ActionButton>
</Row>

{/* Trash Recovery Modal */}
<TrashRecoveryModal
  isOpen={showTrashModal}
  onClose={() => setShowTrashModal(false)}
/>
```

**注意**：需要调整原 "Sync Configurations" Row 的 `noBorder` 属性。

---

## 三、任务依赖图

```
Phase 1 (Rust Backend)
├── Task 1.1: 类型定义
├── Task 1.2: trash.rs 命令 (依赖 1.1)
└── Task 1.3: 命令注册 (依赖 1.2)

Phase 2 (TypeScript Types)
├── Task 2.1: trash 类型
└── Task 2.2: 类型导出 (依赖 2.1)

Phase 3 (Zustand Store)
├── Task 3.1: trashStore (依赖 Phase 1, Phase 2)
└── Task 3.2: store 导出 (依赖 3.1)

Phase 4 (Modal Component)
├── Task 4.1: TrashRecoveryModal (依赖 Phase 3)
└── Task 4.2: 组件导出 (依赖 4.1)

Phase 5 (Settings Integration)
└── Task 5.1: SettingsPage 修改 (依赖 Phase 4)
```

---

## 四、验证清单

### 4.1 编译验证
- [ ] Rust 后端编译成功
- [ ] TypeScript 前端编译成功
- [ ] 无 lint 错误

### 4.2 功能验证
- [ ] 设置页面显示 Trash Row
- [ ] 点击 Manage 按钮打开弹框
- [ ] 弹框正确显示已删除的 Skills
- [ ] 弹框正确显示已删除的 MCPs
- [ ] 弹框正确显示已删除的 CLAUDE.md
- [ ] 可以选择单个/多个项目
- [ ] 可以恢复选中的项目
- [ ] 恢复后列表正确更新
- [ ] ESC 键可以关闭弹框
- [ ] 点击遮罩可以关闭弹框

### 4.3 样式验证
- [ ] 弹框尺寸正确 (520x580)
- [ ] 圆角正确 (16px)
- [ ] 颜色与现有导入弹框一致
- [ ] 字体大小与现有导入弹框一致
- [ ] 间距与现有导入弹框一致
- [ ] 动画效果一致

### 4.4 回归验证
- [ ] 现有 Skills 页面功能正常
- [ ] 现有 MCPs 页面功能正常
- [ ] 现有 CLAUDE.md 页面功能正常
- [ ] 现有 Settings 页面其他功能正常
- [ ] 删除功能仍然正常工作

---

## 五、风险点和注意事项

### 5.1 删除时间推断
- trash 中的文件可能带有时间戳后缀（如 `skill-name_20250205_120000`）
- 需要正确解析时间戳或使用文件系统的修改时间

### 5.2 名称冲突处理
- 恢复时如果目标位置已存在同名项目，应该：
  1. 返回友好的错误信息
  2. 不自动覆盖，让用户手动处理

### 5.3 CLAUDE.md 恢复特殊处理
- CLAUDE.md 除了文件恢复，还需要恢复 `data.json` 中的记录
- 需要从 trash 目录中的 info.json 读取原始信息

### 5.4 样式一致性
- 必须严格遵循 ImportSkillsModal 的样式规范
- 不要引入任何新的设计元素或颜色

---

## 六、测试场景

### 场景 1: 空 trash
1. 确保 trash 目录为空
2. 打开弹框
3. 应显示"No deleted items"空状态

### 场景 2: 恢复单个 Skill
1. 删除一个 Skill
2. 打开恢复弹框
3. 选中该 Skill
4. 点击 Recover Selected
5. 验证 Skill 已恢复到原位置
6. 验证 Skills 页面显示该 Skill

### 场景 3: 批量恢复
1. 删除多个不同类型的项目
2. 打开恢复弹框
3. 在不同 Tab 中选中项目
4. 恢复并验证所有项目

### 场景 4: 名称冲突
1. 删除一个 Skill
2. 创建同名 Skill
3. 尝试恢复已删除的 Skill
4. 应显示错误提示
