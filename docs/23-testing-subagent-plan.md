# Phase 2.4: 应用测试与视觉验证 - SubAgent 执行规划

## 执行目标
1. 运行 Tauri 应用并验证功能正常
2. 对每个页面进行截图
3. 与设计稿进行视觉对比
4. 验证所有交互功能
5. 检查控制台错误

---

## 测试数据位置
- Skills 目录: `~/.ensemble/skills/`
- MCPs 目录: `~/.ensemble/mcps/`
- 测试 Skill: `~/.ensemble/skills/test-skill/SKILL.md`
- 测试 MCP: `~/.ensemble/mcps/test-mcp.json`

---

## SubAgent A: 启动应用并进行基础验证

### 任务描述
1. 确保端口 1420 可用
2. 运行 `npm run tauri dev`
3. 等待应用启动
4. 使用 Claude in Chrome 工具访问应用
5. 验证应用加载成功（无 Loading 卡住）

### 执行步骤
1. 使用 Bash 工具清理端口
2. 使用 Bash 工具在后台启动 `npm run tauri dev`
3. 使用 Claude in Chrome 的 tabs_context_mcp 工具获取浏览器标签
4. 如果应用窗口打开，验证基础功能

---

## SubAgent B: 视觉验证 - Skills 页面

### 必须先阅读的文档
1. `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/design/03-skills-design.md` - Skills 设计规范

### 设计稿参考
- 设计稿路径: `/Users/bo/Downloads/MCP 管理.pen`
- Skills 列表 Node ID: `rPgYw`
- Skills 空状态 Node ID: `DqVji`
- Skill 详情 Node ID: `nNy4r`

### 验证项
1. 使用 `mcp__pencil__get_screenshot` 获取设计稿截图
2. 使用 Claude in Chrome 获取应用截图
3. 对比验证：
   - Header 布局正确（Title + Badge + Search + Button）
   - 列表项样式正确（Icon + Name + Description + Tags + Toggle）
   - 颜色、字体、间距符合规范

---

## SubAgent C: 视觉验证 - MCP 页面

### 设计稿参考
- MCP 列表 Node ID: `hzMDi`
- MCP 详情 Node ID: `ltFNv`

### 验证项
同 Skills 页面

---

## SubAgent D: 视觉验证 - Scenes 页面

### 设计稿参考
- Scenes 列表 Node ID: `M7mYr`
- Scene 详情 Node ID: `LlxKB`
- 新建 Scene Modal Node ID: `Ek3cB`

### 验证项
1. Scene 卡片样式
2. 详情页布局
3. 创建模态框三栏布局

---

## SubAgent E: 视觉验证 - Projects 和 Settings 页面

### 设计稿参考
- Projects 列表 Node ID: `y0Mt4`
- Settings Node ID: `qSzzi`

### 验证项
1. Projects 双栏布局
2. Settings 单栏布局和表单

---

## SubAgent F: 功能测试

### 测试清单

#### UI 一致性检查
- [ ] 所有颜色值正确
- [ ] 所有字体大小符合规范
- [ ] 所有圆角值符合规范
- [ ] Toggle 开关正确工作
- [ ] 空状态页面正确显示

#### 功能完整性检查
- [ ] Skills 列表加载
- [ ] MCP 列表加载
- [ ] Scenes 列表加载
- [ ] Projects 列表加载
- [ ] 搜索功能正常
- [ ] 分类筛选功能
- [ ] 标签筛选功能

#### 交互检查
- [ ] 所有可点击元素有 hover 效果
- [ ] 导航切换正常
- [ ] Toggle 开关响应
- [ ] 无 console 错误

---

## 输出要求

每个 SubAgent 完成后需要输出：
1. 测试结果（PASS/FAIL）
2. 发现的问题列表
3. 截图对比结果（如适用）
4. 建议的修复方案

最终汇总到验证报告文档：
`/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/24-testing-results.md`
