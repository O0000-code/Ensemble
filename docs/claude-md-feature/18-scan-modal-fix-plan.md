# Scan CLAUDE.md 弹框实现与崩溃修复规划

> 创建时间: 2026-02-04
> 状态: 执行中

---

## 一、问题描述

1. **崩溃问题**: 点击 "Scan System" 按钮后应用崩溃退出
2. **缺失功能**: 扫描结果应显示在弹框中供用户选择性导入

---

## 二、设计稿规范

### 2.1 弹框整体结构

```
Ensemble - Scan CLAUDE.md (节点 ECpzb)
├── 遮罩: #00000066
└── Modal Dialog (节点 iCzVD): 520x580, 圆角 16px, 白色背景
    ├── Modal Header: 80px 高度
    │   ├── 左侧
    │   │   ├── 标题: "Scan Results" (18px, 600, #18181B)
    │   │   └── 副标题: "Found CLAUDE.md files on your system" (13px, normal, #71717A)
    │   └── 右侧: 关闭按钮 32x32, x 图标 18x18 #A1A1AA
    │
    ├── Tab Row: padding 0 24px, 底部边框
    │   ├── Tabs 左侧
    │   │   ├── User Tab (选中): globe 图标, 文字 #18181B, 底部 2px 黑色边框
    │   │   ├── Project Tab: folder 图标, 文字 #71717A
    │   │   └── Local Tab: user 图标, 文字 #71717A
    │   │   └── 每个 Tab 有计数 Badge (圆角 10px, 背景 #F4F4F5)
    │   └── 右侧
    │       ├── 分隔线 1px #E5E5E5
    │       ├── 选中计数: "5/7" (12px, #A1A1AA)
    │       ├── 分隔线
    │       └── Select All: 复选框 + "All" 文字
    │
    ├── Modal Body: padding 16px 24px, gap 2px
    │   └── 文件列表项 (每项)
    │       ├── 复选框: 16x16, 选中时黑色背景+白色勾
    │       └── Info
    │           ├── 名称: 13px, 500, #18181B
    │           └── 路径: 11px, normal, #A1A1AA
    │
    └── Modal Footer: padding 16px 24px, 顶部边框
        ├── 左侧: Info 按钮 28x28, info 图标 16x16 #A1A1AA
        └── 右侧
            ├── Cancel 按钮: 高度 36px, 边框 #E5E5E5, 文字 #71717A
            └── Import Selected 按钮: 高度 36px, 背景 #18181B, 文字白色
```

### 2.2 Tab 分类逻辑

| Tab | 图标 | 筛选条件 |
|-----|------|----------|
| User | globe | ~/.claude/CLAUDE.md (全局用户级) |
| Project | folder | 项目级 CLAUDE.md 或 .claude/CLAUDE.md |
| Local | user | CLAUDE.local.md 文件 |

### 2.3 关键尺寸

- Modal: 520x580
- Header 高度: 80px
- Tab padding: 12px 16px
- 列表项 padding: 10px 12px
- 复选框: 16x16, 圆角 4px
- 按钮高度: 36px

---

## 三、SubAgent 任务分配

### SubAgent E1: 崩溃调查与修复

**任务**: 调查 Scan System 崩溃原因并修复

**工作内容**:
1. 检查 Rust 后端 `scan_claude_md_files` 命令
2. 检查前端调用方式
3. 修复崩溃问题

### SubAgent E2: ScanClaudeMdModal 实现

**任务**: 实现扫描结果弹框

**工作内容**:
1. 创建 `src/components/modals/ScanClaudeMdModal.tsx`
2. 实现三个 Tab 筛选 (User/Project/Local)
3. 实现全选/取消全选
4. 实现 Import Selected 功能
5. 修改 ClaudeMdPage.tsx 使用新弹框

---

## 四、设计规范详情

### 4.1 颜色

| 元素 | 颜色 |
|------|------|
| 标题文字 | #18181B |
| 副标题/非选中Tab | #71717A |
| 路径文字 | #A1A1AA |
| 边框 | #E5E5E5 |
| 复选框未选中边框 | #D4D4D8 |
| Tab 计数背景 | #F4F4F5 |
| 选中复选框背景 | #18181B |

### 4.2 字体

| 元素 | 字号 | 字重 |
|------|------|------|
| 标题 | 18px | 600 |
| 副标题 | 13px | normal |
| Tab 选中 | 13px | 600 |
| Tab 未选中 | 13px | normal |
| Tab 计数 | 11px | 500 |
| 文件名 | 13px | 500 |
| 文件路径 | 11px | normal |
| 选中计数 | 12px | normal |
| 按钮文字 | 13px | 500 |

### 4.3 图标

| 位置 | 图标 | 尺寸 |
|------|------|------|
| User Tab | globe | 14x14 |
| Project Tab | folder | 14x14 |
| Local Tab | user | 14x14 |
| 关闭按钮 | x | 18x18 |
| Info 按钮 | info | 16x16 |
| 复选框勾选 | check | 10x10 |

---

*文档版本: 1.0*
*创建时间: 2026-02-04*
