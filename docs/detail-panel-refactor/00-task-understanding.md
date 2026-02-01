# Detail Panel 滑入效果重构 - 任务理解文档

## 1. 任务背景

本次重构的核心目的是改变四个 Detail 页面的交互模式：

- **原实现**：点击列表项 → 路由跳转到独立的 Detail 页面（`/xxx/:id`）
- **新实现**：点击列表项 → Detail Panel 从右侧滑入当前页面，无路由变化

这个改变的设计意图是：Detail Panel 不是独立页面，而是当前页面的一个展开面板，用户可以在保持列表可见的同时查看详情。

---

## 2. 涉及的四个模块

| 模块 | 主页面组件 | 当前 Detail 组件 | 路由 |
|------|-----------|-----------------|------|
| Skills | `SkillsPage.tsx` | `SkillDetailPage.tsx` | `/skills` → `/skills/:skillId` |
| MCP Servers | `McpServersPage.tsx` | `McpDetailPage.tsx` | `/mcp-servers` → `/mcp-servers/:id` |
| Scenes | `ScenesPage.tsx` | `SceneDetailPage.tsx` | `/scenes` → `/scenes/:id` |
| Projects | `ProjectsPage.tsx` | 内置于同一组件 | `/projects` → `/projects/:id` |

---

## 3. 核心交互变更

### 3.1 初始状态
- 只显示 Sidebar (260px) + Main Content（项目列表，填充剩余宽度）
- Detail Panel 隐藏

### 3.2 点击列表项时
- Detail Panel 从右侧滑入
- 动画：`transform: translateX(100%) → translateX(0)`
- 动画时长：200-300ms
- 缓动函数：`ease-out` 或 `cubic-bezier(0.4, 0, 0.2, 1)`
- Main Content 区域收缩，让出 Detail Panel 空间
- **无路由变化** - 不再使用 `navigate()`

### 3.3 切换选中项目时
- Detail Panel 保持展开状态
- 仅内容更新，无需重复滑入动画
- 被选中的项目卡片添加选中态（背景色 `#FAFAFA`）

### 3.4 关闭 Detail Panel
- 可点击关闭按钮或点击空白区域收起
- Detail Panel 向右滑出
- Main Content 恢复原有宽度

---

## 4. 设计稿样式修改同步

设计稿已更新，Detail 页面的项目卡片样式已统一为与主页面一致：

### 4.1 项目卡片容器样式

| 属性 | 修改前 | 修改后（与主页面一致） |
|------|--------|----------------------|
| cornerRadius | 6px | **8px** |
| padding | [12, 14] | **[16, 20]** |
| stroke | 无 | **1px #E5E5E5 inside** |
| gap (卡片内部) | 12px | **14px** |

### 4.2 Icon 样式

| 属性 | 修改前 | 修改后 |
|------|--------|--------|
| Icon Wrap 尺寸 | 32x32 或 36x36 | **40x40** |
| Icon Wrap cornerRadius | 6px | **8px** |
| 内部图标尺寸 | 16x16 | **20x20** |

### 4.3 文字样式

| 属性 | 修改前 | 修改后 |
|------|--------|--------|
| 标题 fontSize | 13px | **14px** |
| 描述 fontSize | 11px | **12px** |
| Info gap | 2px | **4px** |

### 4.4 列表容器样式

| 属性 | 修改前 | 修改后 |
|------|--------|--------|
| List Content gap | 4px | **12px** |

---

## 5. 页面布局结构

### 5.1 未展开 Detail Panel 时
```
┌─────────────────────────────────────────────────────────┐
│                      1440px                              │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ Sidebar│              Main Content                      │
│ 260px  │         （项目列表，全宽）                       │
│        │                                                │
└────────┴────────────────────────────────────────────────┘
```

### 5.2 展开 Detail Panel 时
```
┌─────────────────────────────────────────────────────────┐
│                      1440px                              │
├────────┬──────────────┬─────────────────────────────────┤
│        │              │                                 │
│ Sidebar│  List Panel  │        Detail Panel             │
│ 260px  │    380px     │          800px                  │
│        │  (收缩后)     │      (从右滑入)                  │
│        │              │                                 │
└────────┴──────────────┴─────────────────────────────────┘
```

注：Projects 模块的 List Panel 宽度为 400px

---

## 6. 当前代码结构分析

### 6.1 路由配置 (`src/App.tsx`)
```typescript
<Route path="skills" element={<SkillsPage />} />
<Route path="skills/:skillId" element={<SkillDetailPage />} />  // 需要移除
<Route path="mcp-servers" element={<McpServersPage />} />
<Route path="mcp-servers/:id" element={<McpDetailPage />} />    // 需要移除
<Route path="scenes" element={<ScenesPage />} />
<Route path="scenes/:id" element={<SceneDetailPage />} />       // 需要移除
<Route path="projects" element={<ProjectsPage />} />
<Route path="projects/:id" element={<ProjectsPage />} />        // 需要移除
```

### 6.2 现有 Detail 页面使用 `ListDetailLayout` 组件
- 固定的双栏布局（List Panel + Detail Panel）
- 通过 URL 参数同步选中状态
- 使用 `useNavigate()` 进行路由跳转

### 6.3 需要重构的模式
1. **移除独立 Detail 页面**：不再需要 `SkillDetailPage`、`McpDetailPage`、`SceneDetailPage` 作为独立页面
2. **将 Detail 内容合并到主页面**：将各 Detail 页面的 `detailHeader` 和 `detailContent` 提取到主页面
3. **使用滑动面板替代固定布局**：创建新的 `SlidePanel` 组件实现滑入效果
4. **使用本地状态替代 URL 参数**：用 `selectedId` state 替代 `useParams()`

---

## 7. 动效设计要点

### 7.1 Main Content 收缩动效
当 Detail Panel 滑入时，Main Content 需要同时收缩以让出空间：

- **触发时机**：点击列表项
- **动画内容**：
  1. Main Content 宽度从 `100%` 收缩到 `calc(100% - 800px)`（或 `calc(100% - detailPanelWidth)`）
  2. Detail Panel 从右侧滑入 `translateX(100%) → translateX(0)`
- **动画时长**：200-300ms
- **缓动函数**：`ease-out` 或 `cubic-bezier(0.4, 0, 0.2, 1)`

### 7.2 需要隐藏的元素
展开 Detail Panel 后，某些元素可能需要隐藏或调整：

- **PageHeader 的 Actions 按钮**（如 "Auto Classify"）：可能需要隐藏或移到其他位置
- **搜索框**：保持可见，但宽度可能需要调整
- **列表项的完整显示**：收缩后可能需要使用紧凑模式

### 7.3 选中态样式
被选中的列表项需要明显的视觉反馈：

```css
/* 选中态 */
background: #FAFAFA;
/* 图标容器背景变化 */
.icon-container { background: #F4F4F5; }
/* 文字加粗 */
.item-name { font-weight: 600; }
```

---

## 8. 关键约束与注意事项

### 8.1 不影响现有功能
- 列表的搜索、筛选功能必须保持正常
- Toggle 开关、Icon Picker 等交互必须正常工作
- CreateSceneModal 等模态框功能不受影响

### 8.2 保持设计一致性
- 所有颜色、字体、间距必须与设计稿 1:1 匹配
- 动画需要流畅自然，符合"高级、极简、克制、精致"的设计调性

### 8.3 代码质量
- 提取可复用的 `SlidePanel` 组件
- 保持组件职责单一
- 类型定义完整
- 无 console 错误和警告

---

## 9. 验收标准

1. **交互正确**：
   - 点击列表项 → Detail Panel 从右侧滑入
   - 切换选中项 → 内容更新，无重复动画
   - 关闭 → Detail Panel 滑出

2. **视觉一致**：
   - 所有样式与设计稿 1:1 匹配
   - 动画流畅自然

3. **功能完整**：
   - 搜索、筛选正常
   - Toggle、Icon Picker 正常
   - 所有 Detail 内容正确显示

4. **代码质量**：
   - 无 TypeScript 错误
   - 无 console 错误
   - 组件结构清晰

---

## 10. 设计稿节点参考

可通过 Pencil MCP 工具验证的节点 ID：

### 主页面项目卡片（样式参照）
- `VT3Kp` - MCP Servers 主页面的 Server Item
- `6K9II` - Scenes 主页面的 Scene Card
- `LHy3P` - Projects 主页面的 Project Card
- `hBtGo` - Skills 主页面的 Skill Item

### Detail 页面项目卡片（已修改）
- `EkCYJ` - MCP Detail 的项目卡片
- `Fs7Ov` - Scene Detail 的项目卡片
- `w3JFC` - Projects Detail 的项目卡片
- `raNKa` - Skill Detail 的项目卡片

### Detail 页面整体结构
- `nNy4r` - Skill Detail 完整页面
- `ltFNv` - MCP Detail 完整页面
- `LlxKB` - Scene Detail 完整页面
- `y0Mt4` - Projects Detail 完整页面
