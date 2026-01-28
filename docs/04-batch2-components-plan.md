# 批次 2: 基础组件库开发 - SubAgent 执行规划

## 批次目标
实现所有可复用的基础 UI 组件，严格按照设计稿规范。

---

## 设计规范参考文档
- `/docs/design/02-sidebar-design.md` - Toggle、Tag 等组件样式
- `/docs/design/03-skills-design.md` - Badge、Button、Input 等组件样式
- `/docs/design/08-components-design.md` - Dropdown、ContextMenu 组件样式

---

## SubAgent 任务分配

### SubAgent A: Toggle 组件
**文件**: `src/components/common/Toggle.tsx`

**规范** (来自设计文档):
```
大号(Header): width: 44px, height: 24px, radius: 12px, padding: 2px
              Knob: 20x20, radius: 10px

小号(列表):   width: 40px, height: 22px, radius: 11px, padding: 2px
              Knob: 18x18, radius: 9px

极小号:       width: 36px, height: 20px, radius: 10px, padding: 2px
              Knob: 16x16, radius: 8px

ON:  bg: #18181B, knob 在右侧
OFF: bg: #E4E4E7, knob 在左侧
```

**组件接口**:
```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
}
```

---

### SubAgent B: Badge 组件
**文件**: `src/components/common/Badge.tsx`

**规范**:
```
状态徽章 (Enabled):
  bg: #DCFCE7, text: #16A34A
  padding: 4px 8px, radius: 4px
  dot: 6x6 圆形, #16A34A
  text: 11px/500

计数徽章:
  bg: #F4F4F5, text: #71717A
  padding: 2px 8px, radius: 10px
  text: 11px/500

分类徽章:
  bg: #F4F4F5, text: #52525B
  padding: 3px 8px, radius: 3px
  text: 11px/500
```

**组件接口**:
```typescript
interface BadgeProps {
  variant: 'status' | 'count' | 'category' | 'tag';
  children: React.ReactNode;
  color?: string; // 用于分类徽章的点颜色
  showDot?: boolean;
}
```

---

### SubAgent C: Button 组件
**文件**: `src/components/common/Button.tsx`

**规范**:
```
Primary:
  bg: #18181B, text: #FFFFFF
  height: 32px (small) / 40px (medium) / 44px (large)
  padding: 0 12px/14px, radius: 6px/8px
  text: 12px/500, font-family: Inter

Secondary:
  bg: transparent, border: 1px #E5E5E5
  text: 12px/500, #71717A
  hover: bg #FAFAFA

Danger:
  border: 1px #FEE2E2, text: #DC2626
  hover: bg #FEF2F2

Icon Only:
  32x32 或 36x36, radius: 6px/8px
  bg: transparent, hover: bg #FAFAFA
```

**组件接口**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconOnly?: boolean;
}
```

---

### SubAgent D: Input 组件
**文件**: `src/components/common/Input.tsx`

**规范**:
```
Text Input:
  height: 40px, radius: 6px, border: 1px #E5E5E5
  padding: 0 12px
  text: 13px/normal, #18181B
  placeholder: 12px/normal, #A1A1AA
  focus: border-color: #18181B

Textarea:
  同上，但 height: auto, min-height: 80px
  padding: 12px
```

**组件接口**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
```

---

### SubAgent E: SearchInput 组件
**文件**: `src/components/common/SearchInput.tsx`

**规范**:
```
width: 220px (可变), height: 32px, radius: 6px
border: 1px #E5E5E5, padding: 0 10px, gap: 8px
Icon: search, 14x14, #A1A1AA
Placeholder: 12px/normal, #A1A1AA "Search..."
focus: border-color: #18181B
```

**组件接口**:
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

---

### SubAgent F: Dropdown 组件
**文件**: `src/components/common/Dropdown.tsx`

**规范** (来自 08-components-design.md):
```
Trigger: 类似输入框样式，末尾有 chevron-down 图标 (14x14)

Dropdown Container:
  radius: 8px, border: 1px #E5E5E5
  shadow: 0 4px 12px rgba(0,0,0,0.06)
  padding: 4px
  bg: #FFFFFF

Item:
  padding: 6px 10px, radius: 4px
  hover: bg #FAFAFA
  selected: 有 checkmark 图标
  text: 13px/500, #18181B
```

**组件接口**:
```typescript
interface DropdownOption {
  value: string;
  label: string;
  color?: string; // 用于分类的点颜色
  count?: number;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
}
```

---

### SubAgent G: ContextMenu 组件
**文件**: `src/components/common/ContextMenu.tsx`

**规范** (来自 08-components-design.md):
```
Container:
  width: 140px, radius: 6px, border: 1px #E5E5E5
  shadow: 0 2px 8px rgba(0,0,0,0.08)
  padding: 4px
  bg: #FFFFFF

Item:
  padding: 6px 10px, radius: 4px, gap: 8px
  Icon: 14x14
  Text: 12px/normal

Danger Item:
  Icon: #DC2626, Text: #DC2626
```

**组件接口**:
```typescript
interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}
```

---

### SubAgent H: Modal 组件
**文件**: `src/components/common/Modal.tsx`

**规范**:
```
Overlay:
  bg: rgba(0,0,0,0.4)
  position: fixed, inset: 0
  display: flex, align-items: center, justify-content: center

Dialog:
  bg: #FFFFFF, radius: 16px
  max-width: 根据内容

Header:
  height: 64px, padding: 0 28px, border-bottom: 1px #E5E5E5
  Title: 18px/600, #18181B
  Subtitle: 13px/normal, #71717A
  Close: 36x36, radius: 8px, icon 20x20 #71717A
```

**组件接口**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}
```

---

### SubAgent I: EmptyState 组件
**文件**: `src/components/common/EmptyState.tsx`

**规范**:
```
居中显示
Icon: 48x48, #D4D4D8
Title: 14px/500, #71717A
Description: 12px/normal, #A1A1AA
```

**组件接口**:
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}
```

---

### SubAgent J: Checkbox 组件
**文件**: `src/components/common/Checkbox.tsx`

**规范**:
```
Unchecked:
  14x14, border: 2px #D4D4D4, radius: 3px
  bg: transparent

Checked:
  14x14, bg: #18181B, radius: 3px
  checkmark: white, lucide/check icon
```

**组件接口**:
```typescript
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```

---

## 执行方式

所有 SubAgent 可以**并行执行**，因为组件之间没有依赖关系。

每个 SubAgent 需要：
1. 先阅读对应的设计文档获取详细规范
2. 创建组件文件
3. 实现所有变体和状态
4. 确保样式与设计稿完全一致

## 输出要求

每个组件文件应包含：
1. TypeScript 类型定义
2. 组件实现（使用 Tailwind CSS）
3. 所有变体支持
4. 导出语句

完成后在 `src/components/common/index.ts` 创建统一导出文件。
