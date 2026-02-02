export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'global' | 'project';  // 安装范围: global=用户级全局, project=项目级
  invocation?: string;
  allowedTools?: string[];
  instructions: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  icon?: string;  // 自定义图标名称
}

export interface McpServer {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  sourcePath: string;
  scope: 'global' | 'project';  // 安装范围: global=用户级全局, project=项目级
  command: string;
  args: string[];
  env?: Record<string, string>;
  providedTools: Tool[];
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  icon?: string;  // 自定义图标名称
}

export interface Tool {
  name: string;
  description: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  skillIds: string[];
  mcpIds: string[];
  createdAt: string;
  lastUsed?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  sceneId: string;
  lastSynced?: string;
  icon?: string;  // 自定义图标名称
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export interface AppSettings {
  skillSourceDir: string;
  mcpSourceDir: string;
  claudeConfigDir: string;
  anthropicApiKey: string;
  autoClassifyNewItems: boolean;
  terminalApp: string;          // 终端应用 (Terminal/iTerm/Warp/custom)
  claudeCommand: string;        // 启动 Claude Code 的命令
  hasCompletedImport: boolean;  // 是否已完成首次导入
}

export interface ConfigStatus {
  projectExists: boolean;
  sceneSelected: boolean;
  skillsConfigured: boolean;
  mcpsConfigured: boolean;
}

// ==================== 导入相关类型 ====================

/**
 * 检测到的现有配置
 * 用于首次启动时检测 ~/.claude/ 中的现有 Skills 和 MCPs
 */
export interface ExistingConfig {
  skills: DetectedSkill[];
  mcps: DetectedMcp[];
  hasConfig: boolean;  // 是否存在可导入的配置
}

/**
 * 检测到的 Skill
 */
export interface DetectedSkill {
  name: string;
  path: string;
  description?: string;
}

/**
 * 检测到的 MCP Server
 */
export interface DetectedMcp {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * 导入项
 * 用于指定要导入的 Skill 或 MCP
 */
export interface ImportItem {
  type: 'skill' | 'mcp';
  name: string;
  sourcePath: string;  // 原始路径
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  imported: {
    skills: number;
    mcps: number;
  };
  errors: string[];
  backupPath: string;  // 备份目录路径
}

/**
 * 备份信息
 */
export interface BackupInfo {
  path: string;              // 备份目录路径
  timestamp: string;         // ISO 格式时间戳
  itemsCount: {
    skills: number;
    mcps: number;
  };
}
