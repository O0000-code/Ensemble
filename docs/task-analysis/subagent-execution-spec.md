# SubAgent 执行规范文档

## 文档版本
- **创建日期**: 2026-02-03
- **工作目录**: `/Users/bo/Documents/Development/Ensemble/Ensemble2-import-modals`
- **Git 分支**: `feature/import-modals`

---

## 一、项目背景

Ensemble 是一个 macOS 应用，用于管理 Claude Code 的 Skill 和 MCP 配置。当前需要在 Skills 和 MCP 页面添加独立的"Import"按钮和对应的导入弹窗。

---

## 二、设计规范（所有 SubAgent 必须遵循）

### 2.1 弹窗尺寸与布局
```
遮罩层: 全屏, 背景色 #00000066 (40% 透明度)
弹窗: 500 x 540px, 圆角 16px, 背景色 #FFFFFF
布局: vertical (flex-col)
```

### 2.2 各区域内边距
```
Modal Header: padding 20px 24px, 底部边框 1px #E5E5E5
List Header: padding 12px 24px, 底部边框 1px #E5E5E5
Modal Body: padding 16px 24px, flex-1, overflow-y-auto
Modal Footer: padding 16px 24px, 顶部边框 1px #E5E5E5
```

### 2.3 颜色规范
```
主文本: #18181B
次要文本: #71717A
辅助文本/图标: #A1A1AA
边框/分割线: #E5E5E5
未选中复选框边框: #D4D4D8
User scope 标签 (MCP): #8B5CF6
主按钮背景: #18181B
主按钮文本: #FFFFFF
```

### 2.4 字体规范
```
标题: Inter, 18px, font-weight 600, color #18181B
副标题: Inter, 13px, font-weight 400, color #71717A
列表项名称: Inter, 13px, font-weight 500, color #18181B
列表项路径/scope: Inter, 11px
按钮文字: Inter, 13px, font-weight 500
选中计数: Inter, 12px, font-weight 400, color #A1A1AA
```

### 2.5 复选框样式
```css
/* 选中状态 */
.checkbox-checked {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: #18181B;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-checked svg {
  width: 10px;
  height: 10px;
  color: #FFFFFF;
}

/* 未选中状态 */
.checkbox-unchecked {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: transparent;
  border: 1.5px solid #D4D4D8;
}
```

### 2.6 按钮样式
```css
/* Cancel 按钮 */
.btn-cancel {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid #E5E5E5;
  color: #71717A;
  font-size: 13px;
  font-weight: 500;
}

/* Import Selected 按钮 */
.btn-import {
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
  background: #18181B;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
}
```

### 2.7 列表项样式
```css
.list-item {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.list-item:hover {
  background-color: #FAFAFA;
}
```

---

## 三、文件路径约定

所有 SubAgent 必须在以下工作目录操作：
```
/Users/bo/Documents/Development/Ensemble/Ensemble2-import-modals
```

### 关键文件路径
```
前端源码: src/
后端源码: src-tauri/src/
页面组件: src/pages/
通用组件: src/components/common/
弹窗组件: src/components/modals/  (需要创建)
Store: src/stores/
类型定义: src/types/index.ts
Rust 类型: src-tauri/src/types.rs
Import 命令: src-tauri/src/commands/import.rs
```

---

## 四、Tailwind CSS 类名映射

### 颜色类
```
#18181B → text-[#18181B], bg-[#18181B]
#71717A → text-[#71717A]
#A1A1AA → text-[#A1A1AA]
#E5E5E5 → border-[#E5E5E5]
#D4D4D8 → border-[#D4D4D8]
#8B5CF6 → text-[#8B5CF6]
#FFFFFF → text-white, bg-white
#00000066 → bg-black/40
#FAFAFA → hover:bg-[#FAFAFA]
```

### 尺寸类
```
500px 宽度 → w-[500px]
540px 高度 → h-[540px]
16px 圆角 → rounded-[16px]
6px 圆角 → rounded-[6px]
4px 圆角 → rounded-[4px]
36px 高度 → h-[36px]
16px 尺寸 → w-4 h-4
10px 尺寸 → w-2.5 h-2.5
18px 尺寸 → w-[18px] h-[18px]
```

### 间距类
```
padding 20px 24px → py-5 px-6
padding 12px 24px → py-3 px-6
padding 16px 24px → py-4 px-6
padding 10px 12px → py-2.5 px-3
gap 2px → gap-0.5
gap 4px → gap-1
gap 10px → gap-2.5
gap 12px → gap-3
```

### 字体类
```
18px 600 → text-[18px] font-semibold
13px 500 → text-[13px] font-medium
13px 400 → text-[13px] font-normal
12px 400 → text-[12px] font-normal
11px 500 → text-[11px] font-medium
11px 400 → text-[11px] font-normal
```

---

## 五、组件结构规范

### 5.1 ImportSkillsModal 结构
```tsx
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div className="w-[500px] h-[540px] bg-white rounded-[16px] flex flex-col overflow-hidden">
    {/* Modal Header */}
    <div className="flex items-center justify-between py-5 px-6 border-b border-[#E5E5E5]">
      <div className="flex flex-col gap-1">
        <h2 className="text-[18px] font-semibold text-[#18181B]">Import Skills</h2>
        <p className="text-[13px] font-normal text-[#71717A]">Found {total} Skills on your system</p>
      </div>
      <button className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA]">
        <X className="w-[18px] h-[18px] text-[#A1A1AA]" />
      </button>
    </div>

    {/* List Header */}
    <div className="flex items-center justify-between py-3 px-6 border-b border-[#E5E5E5]">
      <div className="flex items-center gap-2.5">
        {/* Checkbox */}
        <span className="text-[13px] font-medium text-[#18181B]">Select All</span>
      </div>
      <span className="text-[12px] font-normal text-[#A1A1AA]">{selected} of {total} selected</span>
    </div>

    {/* Modal Body */}
    <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
      {items.map(item => (
        <div key={item.name} className="flex items-center gap-3 py-2.5 px-3 rounded-[6px] hover:bg-[#FAFAFA] cursor-pointer">
          {/* Checkbox */}
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[#18181B]">{item.name}</span>
            <span className="text-[11px] font-normal text-[#A1A1AA]">{item.path}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Modal Footer */}
    <div className="flex items-center justify-between py-4 px-6 border-t border-[#E5E5E5]">
      <button className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA]">
        <Info className="w-4 h-4 text-[#A1A1AA]" />
      </button>
      <div className="flex items-center gap-2.5">
        <button className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A]">
          Cancel
        </button>
        <button className="h-[36px] px-5 rounded-[6px] bg-[#18181B] text-[13px] font-medium text-white">
          Import Selected
        </button>
      </div>
    </div>
  </div>
</div>
```

### 5.2 ImportMcpModal 特殊之处
- scope 标签样式区分：
  - User scope: `text-[11px] font-medium text-[#8B5CF6]`
  - Local path: `text-[11px] font-normal text-[#71717A]`

---

## 六、TypeScript 类型定义

### 6.1 检测结果类型（已存在于 src/types/index.ts）
```typescript
export interface DetectedSkill {
  name: string;
  path: string;
  description?: string;
}

export interface DetectedMcp {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  scope?: 'user' | 'local';  // 新增字段，需要在后端添加
  projectPath?: string;       // Local scope 时的项目路径
}
```

### 6.2 弹窗 Props 类型
```typescript
interface ImportSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface ImportMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}
```

---

## 七、后端命令规范

### 7.1 现有命令
```rust
#[tauri::command]
pub fn detect_existing_config(claude_config_dir: String) -> Result<ExistingConfig, String>

#[tauri::command]
pub fn backup_before_import(ensemble_dir: String, claude_config_dir: String) -> Result<BackupInfo, String>

#[tauri::command]
pub fn import_existing_config(claude_config_dir: String, ensemble_dir: String, items: Vec<ImportItem>) -> Result<ImportResult, String>
```

### 7.2 前端调用方式
```typescript
import { safeInvoke } from '@/utils/tauri';

// 检测配置
const config = await safeInvoke<ExistingConfig>('detect_existing_config', {
  claudeConfigDir: '~/.claude',
});

// 执行导入
const result = await safeInvoke<ImportResult>('import_existing_config', {
  claudeConfigDir: '~/.claude',
  ensembleDir: '~/.ensemble',
  items: selectedItems,
});
```

---

## 八、Store 规范

### 8.1 importStore 现有方法
```typescript
// src/stores/importStore.ts
interface ImportStore {
  // 状态
  isDetecting: boolean;
  isImporting: boolean;
  existingConfig: ExistingConfig | null;

  // 方法
  detectExistingConfig: () => Promise<void>;
  importConfig: (items: ImportItem[]) => Promise<ImportResult | null>;
  openImportDialog: () => void;
  closeImportDialog: () => void;
}
```

### 8.2 需要添加的方法
```typescript
// 独立的检测方法
detectSkillsOnly: () => Promise<DetectedSkill[]>;
detectMcpsOnly: () => Promise<DetectedMcp[]>;

// 独立的弹窗状态
isSkillsModalOpen: boolean;
isMcpsModalOpen: boolean;
openSkillsModal: () => void;
closeSkillsModal: () => void;
openMcpsModal: () => void;
closeMcpsModal: () => void;
```

---

## 九、执行检查清单

每个 SubAgent 完成后必须验证：

- [ ] 文件创建在正确的工作目录
- [ ] 代码无 TypeScript 编译错误
- [ ] 样式严格遵循设计规范
- [ ] 导入语句正确
- [ ] 组件正确导出
