# 插件导入功能 UI 设计需求

## 背景

Ensemble 现在支持从 Claude Code 插件系统导入 Skills 和 MCPs。需要在现有设计基础上新增相关 UI。

现有设计稿：`/Users/bo/Downloads/MCP 管理.pen`

---

## 需求 1：导入弹框新增 Plugins Tab

**位置**：Import Skills Modal、Import MCP Modal

**需求**：在现有的导入弹框中新增第二个 Tab，用于显示来自插件的 Skills/MCPs。

**两个 Tab**：
- Claude Code：现有的，显示本地配置的 Skills/MCPs
- Plugins：新增的，显示插件安装的 Skills/MCPs

**Plugins Tab 列表项需要展示的信息**：

| 字段 | 说明 | 示例 |
|------|------|------|
| skillName / mcpName | 名称 | `nanobanana-skill` |
| pluginName | 所属插件名 | `Nanobanana Skill` |
| marketplace | 插件市场 | `claude-code-settings` |
| description | 描述（可选） | `Generate or edit images...` |

---

## 需求 2：列表项新增插件来源标识

**位置**：Skills 列表页的 SkillListItem、MCP 列表页的 McpListItem

**需求**：当 Skill/MCP 来自插件时，需要显示插件来源信息。

**需要展示的信息**：
- 插件来源：pluginName + marketplace
- 全局启用状态：当插件在 Claude Code 中启用时，需要有视觉提示表明该 Skill/MCP 全局生效

---

## 需求 3：Scene 创建弹框的禁用项

**位置**：Create Scene Modal 中的 Skills/MCPs 选择列表

**需求**：来自已启用插件的 Skills/MCPs 不能被添加到 Scene（因为已全局生效，添加会重复）。

**需要的交互**：
- 这些项在列表中显示为禁用状态
- 用户能理解为什么被禁用（Tooltip 或其他方式）

---

## 参考

现有设计稿相关页面：
- Skills 列表：`rPgYw`
- MCP Servers 列表：`hzMDi`
- 新建 Scene 模态框：`Ek3cB`
