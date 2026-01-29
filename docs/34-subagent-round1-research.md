# SubAgent 第一轮执行规划 - 调研分析

## 本轮目标

全面调研设计稿和现有代码，为后续实现提供完整的上下文信息。

## SubAgent 任务分配

### SubAgent 1: 设计稿分析 - 新增类别状态
- **任务**：分析设计稿中「新增类别」状态的详细结构
- **输入**：设计稿文件 `/Users/bo/Downloads/MCP 管理.pen`，节点 ID `LxRtJ`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-add-category.md`
- **要求**：
  1. 使用 `mcp__pencil__batch_get` 获取节点结构（readDepth: 5）
  2. 使用 `mcp__pencil__get_screenshot` 获取视觉截图
  3. 详细记录所有样式属性：颜色、字体、间距、圆角等
  4. 特别关注输入项的样式细节

### SubAgent 2: 设计稿分析 - 新增标签状态
- **任务**：分析设计稿中「新增标签」状态的详细结构
- **输入**：设计稿文件 `/Users/bo/Downloads/MCP 管理.pen`，节点 ID `r3UEu`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-add-tag.md`
- **要求**：同 SubAgent 1

### SubAgent 3: 设计稿分析 - 编辑类别状态
- **任务**：分析设计稿中「编辑类别」状态的详细结构
- **输入**：设计稿文件 `/Users/bo/Downloads/MCP 管理.pen`，节点 ID `JgsTm`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-edit-category.md`
- **要求**：
  1. 同 SubAgent 1 的基本要求
  2. 特别关注全选高亮效果的样式（节点 `GBYuM`）

### SubAgent 4: 设计稿分析 - 编辑标签状态
- **任务**：分析设计稿中「编辑标签」状态的详细结构
- **输入**：设计稿文件 `/Users/bo/Downloads/MCP 管理.pen`，节点 ID `5jJVC`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-design-edit-tag.md`
- **要求**：
  1. 同 SubAgent 1 的基本要求
  2. 特别关注全选高亮效果的样式（节点 `MWCJV`）

### SubAgent 5: 现有代码分析 - 侧边栏组件
- **任务**：分析现有侧边栏组件的结构和实现
- **输入**：项目目录 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-current-sidebar-analysis.md`
- **要求**：
  1. 找到侧边栏相关的所有组件文件
  2. 分析 Categories 区域的渲染逻辑
  3. 分析 Tags 区域的渲染逻辑
  4. 分析右键菜单的实现和事件处理
  5. 记录现有的样式实现方式

### SubAgent 6: 现有代码分析 - Store 和状态管理
- **任务**：分析与 Categories 和 Tags 相关的 store
- **输入**：项目目录 `/Users/bo/Documents/Development/Ensemble/Ensemble2/src/stores`
- **输出**：将分析结果写入 `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/34-current-store-analysis.md`
- **要求**：
  1. 找到所有相关的 store 文件
  2. 分析 categories 相关的 state 和 actions
  3. 分析 tags 相关的 state 和 actions
  4. 检查是否有编辑状态相关的字段
  5. 分析添加/重命名的现有实现（如果有）

## 输出文档格式要求

每个分析文档应包含：
1. **概述**：简要说明分析对象
2. **详细内容**：
   - 对于设计稿：节点结构、样式属性、视觉截图分析
   - 对于代码：文件路径、关键代码片段、逻辑流程
3. **关键发现**：需要特别注意的点
4. **实现建议**：基于分析的初步实现建议

## 注意事项

1. 所有 SubAgent 必须将结果写入指定的 md 文件
2. 分析要详尽，包含所有必要的样式数值
3. 对于设计稿，需要同时获取截图和节点结构
4. 对于代码分析，需要列出完整的文件路径
