# Sidebar Reorder — 理解文档

> 该文档作为后续所有 SubAgent 的"必读基线"。只有认知一致，产出才能正确对齐。

## 1. 任务原文

> 给 APP 左侧的 Categories 和 TAGS 都加一个拖动移动位置和手动排序的功能。
>
> 要求：
> - 使用最成熟稳定的方式
> - 动效最佳、最物理真实感、最丝滑
> - 优先使用现成的组件
> - 设计要求极高：考究、精致、细节、克制、物理级别动效（Spring 曲线/磁吸/自然/流畅）
> - **不影响任何现有功能、不导致任何新问题**
> - 充分调研，分析在前，执行在后；多 Agent 评审，10/10 通过才实施；实施后再次专家审核

## 2. 项目背景（Tech Stack）

- **桌面应用**：Tauri 2.9 + Rust（后端）+ React 18 + TS 5.9（前端）
- **目标平台**：macOS only（min macOS 12.0）— 设计基线就是 macOS 原生气质
- **样式**：Tailwind CSS 4（utility-first，无 CSS modules）
- **状态**：Zustand 5
- **图标**：lucide-react
- **数据**：`~/.ensemble/data.json`（Rust 后端读写）
- **质量门槛**：`npx tsc --noEmit && npm run test && cd src-tauri && cargo test && cargo clippy -- -D warnings`

## 3. 当前实现的关键事实（来自 Read，非推断）

### 3.1 数据模型

**TS 类型** (`src/types/index.ts:84-95`)
```ts
interface Category { id: string; name: string; color: string; count: number; }
interface Tag      { id: string; name: string; count: number; }
```

**Rust 类型** (`src-tauri/src/types.rs:134-149`)
```rust
pub struct Category { pub id, pub name, pub color, pub count: u32 }
pub struct Tag      { pub id, pub name, pub count: u32 }

pub struct AppData {
  pub categories: Vec<Category>,
  pub tags: Vec<Tag>,
  ...
}
```

**关键事实**：
- 当前**没有** `sort_order` 字段。顺序由 `Vec` 在 JSON 中的天然顺序决定。
- `categories` 是**全局**的（不是 per-page），所有 Skills/MCPs/CLAUDE.md 共享。
- 同样地 `tags` 也是全局的。
- `count` 是**派生字段**：在 `MainLayout.tsx:86-103` 通过 `useMemo` 从 `skills/mcpServers/claudeMdFiles` 实时统计后注入。**count 变化不应该触发 reorder。**

### 3.2 后端 IPC（`src-tauri/src/commands/data.rs`）

| Command | 行为 |
|---|---|
| `get_categories` | 返回 `data.categories`（按 Vec 顺序） |
| `add_category(name, color)` | `push` 到末尾 |
| `update_category(id, name?, color?)` | 原地修改 |
| `delete_category(id)` | `retain` 过滤 |
| `get_tags` / `add_tag` / `update_tag` / `delete_tag` | 同上模式 |

**关键事实**：每次写入是 **整个 AppData** 的全量序列化（`write_app_data`）。不需要担心增量同步。

### 3.3 前端 Store（`src/stores/appStore.ts`）

`useAppStore` 持有：
- `categories: Category[]`、`tags: Tag[]`
- 编辑态：`editingCategoryId | isAddingCategory | editingTagId | isAddingTag`
- `clearAllEditingStates()` — 互斥保证（同时只能有一个编辑/新增态）
- 异步 CRUD：`addCategory / updateCategory / deleteCategory / addTag / updateTag / deleteTag`

### 3.4 UI 现状（`src/components/layout/Sidebar.tsx`）

侧边栏宽 **260px**，结构：
1. Header（traffic lights 占位 + Refresh 按钮）— H 56px，固定
2. Nav 导航区（Skills/MCP/CLAUDE.md/Scenes/Projects）— H 9 × 5 行，固定**不参与拖拽**
3. Divider
4. Categories Section
   - 标题行（"CATEGORIES" + "+" 按钮）— 固定
   - 列表：每行 `h-8 px-2.5` 含 ColorPicker 圆点 + 名字 + count
   - 默认显示前 9 个，超出折叠到 "Show X more"
   - 编辑态显示 `<CategoryInlineInput>` 替换该行
   - 新增态在列表末尾追加 `<CategoryInlineInput mode="add">`
5. Tags Section
   - 标题行（"TAGS" + "+" 按钮）— 固定
   - 网格：`flex flex-wrap gap-1.5`，每个 tag 是 `px-2.5 py-[5px]` 的 11px 文字 pill
   - 默认显示前 10 个，超出折叠到 "+N"
   - 编辑/新增态显示 `<TagInlineInput>`
6. Footer Settings 按钮 — 固定

**布局拓扑差异（极重要）**
- **Categories = 1D 垂直列表**：每行高度一致，是经典的 vertical reorderable list
- **Tags = 2D wrap 流式布局**：宽度不一（取决于文字长度），多行 wrap，是更复杂的 grid-like reorderable

这意味着两个清单对**拖拽库的能力要求不同**：Tags 需要支持 "rect intersection" 或 "swap" 算法，不能只用纯 vertical strategy。

### 3.5 交互现状

| 操作 | 行为 | 与新拖拽功能的潜在冲突 |
|---|---|---|
| 单击 Category 行 | navigate 到 `/category/:id` | **冲突**：拖拽不能触发导航 |
| 双击 Category | 进入编辑模式 | 无冲突（双击与拖拽不会重叠） |
| 右键 Category | 弹出 ContextMenu（Rename/Delete） | 无直接冲突，但需保证激活手势不抢占 |
| 单击 ColorPicker 圆点 | 打开颜色选择器 | **冲突**：圆点的命中区域不能被拖把手吞掉 |
| 单击 Tag pill | navigate 到 `/tag/:id` | **冲突**：拖拽不能触发导航 |
| 双击 Tag pill | 进入编辑模式 | 无冲突 |
| 右键 Tag pill | 弹出 ContextMenu | 同上 |
| 编辑模式行 | 显示 input | **不应允许拖拽**（input 为活跃焦点） |
| 新增模式行 | 显示 input | 同上 |
| "Show X more" 折叠态 | 仅显示前 9/10 | **需决策**：拖拽时折叠的项目能否成为 drop target？ |
| Refresh 按钮 | 重新拉取数据 | 必须保留新顺序（顺序需从后端持久化） |
| **Window drag**（`startDrag` in Sidebar.tsx:10-35） | 鼠标按下 sidebar 空白区可拖动整个窗口 | **冲突**：sidebar 拖窗口手势不能抢占 item 拖拽 |

### 3.6 已有动效语言

`src/index.css` 中已有的设计语言：
- 弹簧曲线：`cubic-bezier(0.34, 1.56, 0.64, 1)`（refresh-click，scale + rotate）
- 出场曲线：`cubic-bezier(0.16, 1, 0.3, 1)`（classify bloom）
- 轻巧过渡：`cubic-bezier(0.4, 0, 0.2, 1)`（refresh spinning）
- 200ms / 400ms / 1000ms 是常见时长
- 颜色变量 `--color-bg-tertiary: #F4F4F5` 是悬停背景，需在拖拽态复用

## 4. 隐含的前提与边界（推演）

用户说"拖动移动位置和手动排序"。表面上是"加一个 dnd 库就行"，但深挖：

1. **顺序的语义对齐**：当前 categories 顺序是隐式的（数据库插入序）。改为"用户手动排序"后，`get_categories` 返回的顺序应该等于用户最近一次拖拽后的顺序。所有消费方（Sidebar、Skills 页面下拉、CLAUDE.md 分类下拉等）应自动获益，无需各自再排序。
2. **持久化保证**：拖拽必须立刻乐观更新 UI，同时异步落盘；落盘失败需要回滚 + 用户感知（toast/silent）。
3. **count 与 sort_order 解耦**：count 实时计算，sort_order 持久化在后端 Vec 顺序里。两者互不干扰。
4. **拖拽期间禁止其他变更**：进入拖拽时，关闭 ContextMenu / 退出编辑/新增态 / 阻断导航 click。
5. **导出/导入兼容**：如果以后引入 import/export，序列化格式不变（仍然是 Vec 顺序）。
6. **数据迁移零成本**：因为顺序就是 Vec 顺序，旧 data.json 加载后顺序自然就是当前顺序。无需 migration。
7. **可访问性**：不能只有鼠标手势。键盘（Tab + 上下箭头 + Space/Enter）应能完成同样的重排。
8. **macOS 原生气质**：目标平台是 macOS，整体风格已极克制（macOS Finder / Notes / Linear 风格）。动效不能像 Notion drag-and-drop 那样夸张，要更精微。

## 5. 关键决策需要在调研后回答

| 问题 | 候选 | 关键评判维度 |
|---|---|---|
| 选用什么 DnD 库？ | dnd-kit / framer-motion Reorder / motion / pragmatic-drag-and-drop / react-aria / 自研 | 成熟度、维护活跃度、Spring 物理感、对 1D + 2D wrap 的支持、可访问性、bundle 体积、与 React 18 兼容 |
| 数据存储方案？ | (a) 完全靠 Vec 顺序，添加 `reorder_categories(ids)` IPC；(b) 显式 `sort_order: u32` 字段 | 简洁性 vs 并发安全 vs 未来扩展（如多 device sync） |
| 激活手势？ | 长按 200ms / 移动 5px 距离 / 显式 drag handle / 整行可抓 | 与 click → navigate 的冲突，与窗口拖动冲突 |
| 拖拽过程中的视觉？ | lift + shadow / 半透明克隆 / 占位空槽 / Spring 让位动画 | 物理真实感、与 macOS 风格契合度 |
| Tags（2D wrap）算法？ | rect intersection / closest center / swap | 视觉流畅度，无跳动 |
| "Show X more" 行为？ | 拖拽不影响 / 折叠态自动展开 / 折叠态不可拖 | 用户认知一致性 |
| 键盘可访问性？ | 库自带 / 自己加 | 优先用库自带 |

## 6. 风险登记（必须在评审清单中验证零回归）

1. 已有的"单击导航 / 双击编辑 / 右键菜单 / 圆点点击 / 窗口拖动"五种手势必须不被打断
2. `startDrag(e)`（Sidebar.tsx:10）使用 mousedown + tagName 判定，需确保 dnd 库的 listener 优先于 startDrag
3. `<CategoryInlineInput>` 与 `<TagInlineInput>` 在编辑/新增态时整行被替换 — 拖拽节点 ID 切换需稳定
4. `MAX_VISIBLE_CATEGORIES = 9` 与 `MAX_VISIBLE_TAGS = 10` 折叠逻辑可能与 dnd 库的虚拟列表/克隆冲突
5. Refresh 按钮拉取数据后，新数据应保留排序（取决于后端写回顺序）
6. CategoryPage / TagPage 通过 `useParams` 拿 `categoryId/tagId` 过滤，与排序无关，无需改动
7. SkillsPage、McpServersPage 等地方的 Category 下拉若依赖 `categories` 数组顺序，应自动获益于新顺序
8. `categoriesWithCounts` / `tagsWithCounts` 的 `useMemo` 依赖 `categories/tags`，重排会触发重算 — 性能上 9/10 个项目可忽略
9. autoClassify（AI 自动分类）创建新 category/tag 时仍 push 到末尾 — 行为不变，符合直觉
10. plugin 导入路径目前不创建 category/tag，无影响

## 7. 不在本次范围

- 重排 **Skills / MCP / CLAUDE.md / Scenes / Projects** 等其他列表（用户明确只说 Categories + Tags）
- 跨设备 sync（项目目前无云同步）
- 多用户协作（单用户应用）
- "Pin to top" 等其他排序模式（用户只要 manual reorder）
- 折叠/展开 Categories Section 整体
