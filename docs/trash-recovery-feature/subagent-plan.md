# SubAgent 执行规划文档

## 工作目录
所有工作在 `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/` 中进行。

---

## Phase 1: Rust 后端实现

### SubAgent 1A: 添加 Trash 类型定义

**任务**：在 `src-tauri/src/types.rs` 中添加 trash 相关的类型定义

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/types.rs`

**需要添加的类型**：
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

**验证**：添加后确保文件语法正确

---

### SubAgent 1B: 创建 trash.rs 命令模块

**任务**：创建 `src-tauri/src/commands/trash.rs` 文件，实现 trash 相关命令

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/execution-plan.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/commands/skills.rs` (参考现有命令模式)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/commands/mcps.rs` (参考现有命令模式)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/commands/claude_md.rs` (参考现有命令模式)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/utils/path.rs` (路径工具函数)

**需要实现的命令**：

1. `list_trashed_items(ensemble_dir: String) -> Result<TrashedItems, String>`
   - 扫描 `~/.ensemble/trash/skills/` 目录
   - 扫描 `~/.ensemble/trash/mcps/` 目录
   - 扫描 `~/.ensemble/trash/claude-md/` 目录
   - 解析文件名中的时间戳（格式：`{name}_{YYYYMMDD_HHMMSS}`）
   - 从 SKILL.md 读取 skill 描述
   - 从 JSON 文件读取 MCP 描述
   - 返回 TrashedItems 结构

2. `restore_skill(trash_path: String, ensemble_dir: String) -> Result<(), String>`
   - 验证 trash 路径存在
   - 提取原始名称（去除时间戳后缀）
   - 检查目标路径是否已存在
   - 如果存在同名，返回错误
   - 移动文件到 `~/.ensemble/skills/`

3. `restore_mcp(trash_path: String, ensemble_dir: String) -> Result<(), String>`
   - 验证 trash 路径存在
   - 提取原始名称（去除时间戳后缀，保留 .json 扩展名）
   - 检查目标路径是否已存在
   - 如果存在同名，返回错误
   - 移动文件到 `~/.ensemble/mcps/`

4. `restore_claude_md(trash_path: String) -> Result<(), String>`
   - 验证 trash 路径存在
   - 从 info.json 读取原始信息
   - 移动目录到 `~/.ensemble/claude-md/`
   - 恢复 data.json 中的 claude_md_files 记录

**时间戳解析规则**：
- 文件名格式：`{original_name}_{YYYYMMDD_HHMMSS}` 或 `{original_name}_{YYYYMMDD_HHMMSS}.json`
- 需要使用正则表达式提取原始名称和时间戳
- 如果没有时间戳后缀，使用文件修改时间作为 deleted_at

---

### SubAgent 1C: 注册 trash 命令

**任务**：在命令模块和主入口注册 trash 命令

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/commands/mod.rs`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src-tauri/src/lib.rs`

**需要修改**：

1. `src-tauri/src/commands/mod.rs` - 添加：
```rust
pub mod trash;
```

2. `src-tauri/src/lib.rs` - 在 `tauri::generate_handler![]` 中添加：
```rust
trash::list_trashed_items,
trash::restore_skill,
trash::restore_mcp,
trash::restore_claude_md,
```

---

## Phase 2: TypeScript 类型定义

### SubAgent 2A: 创建 trash 类型并导出

**任务**：创建 TypeScript 类型定义

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/types/index.ts`

**需要创建的文件**：`src/types/trash.ts`

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

**需要修改的文件**：`src/types/index.ts` - 添加导出：
```typescript
export * from './trash';
```

---

## Phase 3: Zustand Store

### SubAgent 3A: 创建 trashStore

**任务**：创建回收站状态管理 store

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/stores/skillsStore.ts` (参考现有 store 模式)
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/stores/index.ts`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/utils/tauri.ts` (safeInvoke 用法)

**需要创建的文件**：`src/stores/trashStore.ts`

**Store 结构**：
```typescript
interface TrashState {
  trashedItems: TrashedItems | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;

  // Actions
  loadTrashedItems: () => Promise<void>;
  restoreSkill: (path: string) => Promise<boolean>;
  restoreMcp: (path: string) => Promise<boolean>;
  restoreClaudeMd: (path: string) => Promise<boolean>;
  clearError: () => void;
}
```

**需要修改的文件**：`src/stores/index.ts` - 添加导出：
```typescript
export { useTrashStore } from './trashStore';
```

---

## Phase 4: TrashRecoveryModal 组件

### SubAgent 4A: 创建 TrashRecoveryModal

**任务**：创建恢复弹框组件

**必读文件（必须全部阅读）**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md` - **必读**，包含所有设计规范
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/components/modals/ImportSkillsModal.tsx` - **必读**，作为样式模板
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/components/modals/index.ts`

**设计规范（必须严格遵循）**：

1. **整体尺寸**：宽度 520px，高度 580px，圆角 16px
2. **遮罩层**：`fixed inset-0 z-50 bg-black/40`
3. **阴影**：`shadow-[0_25px_50px_rgba(0,0,0,0.1)]`

4. **Header (h-20)**：
   - 标题：`text-[18px] font-semibold text-[#18181B]`
   - 副标题：`text-[13px] font-normal text-[#71717A]`
   - 关闭按钮：`w-8 h-8 rounded-[6px]`，X 图标 `w-[18px] h-[18px] text-[#A1A1AA]`

5. **Tab 栏**：
   - 三个 Tab：Skills (Wand2)、MCPs (Server)、CLAUDE.md (FileText)
   - 激活态：`font-semibold text-[#18181B] border-b-2 border-[#18181B]`
   - 非激活态：`font-normal text-[#71717A] border-b-2 border-transparent`
   - Badge：`rounded-[10px] px-2 py-0.5 text-[11px] font-medium bg-[#F4F4F5]`
   - 右侧：选中计数 + All 复选框

6. **列表项**：
   - `py-2.5 px-3 rounded-[6px] hover:bg-[#FAFAFA]`
   - 复选框：16x16，圆角 4px
   - 名称：`text-[13px] font-medium text-[#18181B]`
   - 删除时间/路径：`text-[11px] font-normal text-[#A1A1AA]`

7. **Footer**：
   - `py-4 px-6 border-t border-[#E5E5E5]`
   - Info 按钮：`w-7 h-7 rounded-[6px]`
   - Cancel 按钮：`h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A]`
   - 主按钮：`h-[36px] px-5 rounded-[6px] bg-[#18181B] text-[13px] font-medium text-white`

**Props 接口**：
```typescript
interface TrashRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete?: () => void;
}
```

**空状态设计**：
- 显示对应类型的图标（灰色）
- 文字："No deleted {type}"
- 副文字："Items you delete will appear here"

**需要修改的文件**：`src/components/modals/index.ts` - 添加导出：
```typescript
export { TrashRecoveryModal } from './TrashRecoveryModal';
```

---

## Phase 5: SettingsPage 集成

### SubAgent 5A: 修改 SettingsPage

**任务**：在设置页面添加 Trash 入口

**必读文件**：
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/docs/trash-recovery-feature/understanding.md`
- `/Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery/src/pages/SettingsPage.tsx`

**需要修改**：

1. 导入 TrashRecoveryModal：
```typescript
import { TrashRecoveryModal } from '@/components/modals';
```

2. 添加状态：
```typescript
const [showTrashModal, setShowTrashModal] = useState(false);
```

3. 在 Storage section 中，修改 "Sync Configurations" Row 的 `noBorder` 为 `false`

4. 在 "Sync Configurations" Row 之后添加 Trash Row：
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
```

5. 在组件末尾（`</div>` 之前）添加 Modal：
```tsx
{/* Trash Recovery Modal */}
<TrashRecoveryModal
  isOpen={showTrashModal}
  onClose={() => setShowTrashModal(false)}
/>
```

---

## 验证步骤

完成所有修改后：

1. **编译验证**：
```bash
cd /Users/bo/Documents/Development/Ensemble/Ensemble2-trash-recovery
npm run tauri build --debug
```

2. **运行测试**：
```bash
npm run tauri dev
```

3. **功能测试**：
   - 打开设置页面
   - 验证 Trash Row 显示正确
   - 点击 Manage 按钮，弹框应该打开
   - 测试 Tab 切换
   - 测试选择/取消选择
   - 测试恢复功能
